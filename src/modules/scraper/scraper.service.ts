import { Injectable, Logger } from '@nestjs/common'
import { chromium } from 'playwright-extra'
import { TranslationService } from './translation.service'
import { PrismaService } from '@/core/prisma/prisma.service'

// Use require for CommonJS module compatibility
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
chromium.use(StealthPlugin())

@Injectable()
export class ScraperService {
	private readonly logger = new Logger(ScraperService.name)

	constructor(
		private readonly prismaService: PrismaService,
		private readonly translationService: TranslationService,
	) {}

	async scrapeCarSensor(): Promise<{
		success: boolean
		carsFound: number
		error?: string
	}> {
		const startTime = Date.now()
		let carsFound = 0
		let browser

		try {
			this.logger.log('Starting CarSensor scrape...')

			browser = await chromium.launch({
				headless: true,
				args: ['--no-sandbox', '--disable-setuid-sandbox'],
			})

			const context = await browser.newContext({
				userAgent:
					'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
			})

			const page = await context.newPage()

			// Navigate to CarSensor search results
			await page.goto('https://www.carsensor.net/usedcar/search.php', {
				waitUntil: 'domcontentloaded',
				timeout: 60000,
			})

			// Wait for content to load
			await page.waitForTimeout(2000)

			// Extract car listings - using $$eval to get all car cards
			const cars = await page.$$eval('.cassetteWrap', elements => {
				return elements.map(el => {
					// Extract external ID from URL
					const linkElement = el.querySelector('a')
					const href = linkElement?.getAttribute('href') || ''
					const externalIdMatch = href.match(/\/([A-Z0-9]+)\/index\.html/)
					const externalId = externalIdMatch ? externalIdMatch[1] : ''

					// Get all text content for parsing
					const fullText = el.textContent || ''

					// Extract brand (日産, トヨタ, etc.)
					const brandMatch = fullText.match(
						/(日産|トヨタ|ホンダ|マツダ|スバル|スズキ|ダイハツ|三菱|レクサス|BMW|メルセデス・ベンツ|アウディ|フォルクスワーゲン|ポルシェ|フォード|シボレー|テスラ)/,
					)
					const brand = brandMatch ? brandMatch[1] : ''

					// Extract model name (after brand, before price/damage keywords)
					const modelMatch = fullText.match(
						/(?:日産|トヨタ|ホンダ|マツダ|スバル|スズキ|ダイハツ|三菱|レクサス|BMW|メルセデス・ベンツ|アウディ|フォルクスワーゲン|ポルシェ|フォード|シボレー|テスラ)\s+([^\n\t]+?)\s+(?:雹害車|車両本体価格|支払総額|こちらの車両)/,
					)
					const model = modelMatch ? modelMatch[1].trim() : ''

					// Extract price (車両本体価格)
					const priceMatch = fullText.match(/車両本体価格\s*(\d+\.?\d*)\s*万円/)
					const priceText = priceMatch ? priceMatch[1] + '万円' : '0'

					// Extract year
					const yearMatch = fullText.match(/年式\s*(\d{4})/)
					const yearText = yearMatch ? yearMatch[1] : '0'

					// Extract mileage
					const mileageMatch = fullText.match(/走行距離\s*(\d+(?:,\d+)?)\s*km/)
					const mileageText = mileageMatch ? mileageMatch[1] : '0'

					// Images - get actual image sources
					const images = Array.from(el.querySelectorAll('img'))
						.map((img: HTMLImageElement) => {
							const dataSrc = img.getAttribute('data-original')
							const src = img.src
							return dataSrc || src
						})
						.filter(
							(src: string) =>
								src &&
								!src.includes('loading') &&
								!src.includes('animation') &&
								(src.startsWith('http') || src.startsWith('//')),
						)
						.map((src: string) => (src.startsWith('//') ? `https:${src}` : src))

					return {
						externalId,
						brand,
						model,
						priceText,
						yearText,
						mileageText,
						sourceUrl: href.startsWith('http')
							? href
							: `https://www.carsensor.net${href}`,
						images,
					}
				})
			})

			this.logger.log(`Found ${cars.length} cars`)

			// Validate results - check if scraping failed
			if (cars.length === 0) {
				this.logger.warn('No cars found - possible site structure change')
				throw new Error('No cars extracted - check selectors')
			}

			// Validate first car data structure
			const firstCar = cars[0]
			if (!firstCar.externalId || !firstCar.brand || !firstCar.model) {
				this.logger.error('Invalid car data structure', firstCar)
				throw new Error('Car data validation failed - missing required fields')
			}

			// Log first car for debugging
			this.logger.debug(`First car sample: ${JSON.stringify(firstCar)}`)

			// Process and upsert each car
			for (const car of cars) {
				if (!car.externalId) continue

				const price = this.translationService.normalizePrice(car.priceText)
				const year = this.translationService.normalizeNumber(car.yearText)
				const mileage = this.translationService.normalizeNumber(car.mileageText)
				const translatedBrand = this.translationService.translateBrand(
					car.brand,
				)

				await this.prismaService.car.upsert({
					where: { externalId: car.externalId },
					update: {
						brand: translatedBrand,
						model: car.model,
						year,
						mileage,
						price,
						images: car.images,
						sourceUrl: car.sourceUrl,
						updatedAt: new Date(),
					},
					create: {
						externalId: car.externalId,
						brand: translatedBrand,
						model: car.model,
						year,
						mileage,
						price,
						images: car.images,
						sourceUrl: car.sourceUrl,
					},
				})

				carsFound++
			}

			await browser.close()

			// Log success
			await this.prismaService.scrapeLog.create({
				data: {
					status: 'SUCCESS',
					carsFound,
					errorMessage: null,
				},
			})

			const duration = Date.now() - startTime
			this.logger.log(
				`Scrape completed successfully. Found ${carsFound} cars in ${duration}ms`,
			)

			return { success: true, carsFound }
		} catch (error) {
			this.logger.error('Scrape failed', error)

			if (browser) {
				await browser.close()
			}

			// Log failure
			await this.prismaService.scrapeLog.create({
				data: {
					status: 'FAILED',
					carsFound,
					errorMessage: error.message,
				},
			})

			return { success: false, carsFound, error: error.message }
		}
	}
}
