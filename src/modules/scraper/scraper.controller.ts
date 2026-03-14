import { Controller, Post } from '@nestjs/common'
import { ScraperService } from './scraper.service'

@Controller('scraper')
export class ScraperController {
	constructor(private readonly scraperService: ScraperService) {}

	@Post('trigger')
	async triggerScrape() {
		const result = await this.scraperService.scrapeCarSensor()
		return {
			message: 'Scrape completed',
			...result,
		}
	}
}
