import { Injectable } from '@nestjs/common'

@Injectable()
export class TranslationService {
	private readonly dictionary: Record<string, string> = {
		価格: 'price',
		年式: 'year',
		走行距離: 'mileage',
		排気量: 'engine_capacity',
	}

	private readonly brandDictionary: Record<string, string> = {
		日産: 'Nissan',
		トヨタ: 'Toyota',
		ホンダ: 'Honda',
		マツダ: 'Mazda',
		スバル: 'Subaru',
		スズキ: 'Suzuki',
		ダイハツ: 'Daihatsu',
		三菱: 'Mitsubishi',
		レクサス: 'Lexus',
		'メルセデス・ベンツ': 'Mercedes-Benz',
		アウディ: 'Audi',
		フォルクスワーゲン: 'Volkswagen',
		ポルシェ: 'Porsche',
		フォード: 'Ford',
		シボレー: 'Chevrolet',
		テスラ: 'Tesla',
		BMW: 'BMW',
	}

	translate(japaneseKey: string): string {
		return this.dictionary[japaneseKey] || japaneseKey
	}

	translateBrand(japaneseBrand: string): string {
		return this.brandDictionary[japaneseBrand] || japaneseBrand
	}

	normalizePrice(priceText: string): number {
		// Convert "万円" to raw number (multiply by 10000)
		const match = priceText.match(/(\d+(?:\.\d+)?)/)
		if (!match) return 0

		const value = parseFloat(match[1])
		if (priceText.includes('万円')) {
			return value * 10000
		}
		return value
	}

	normalizeNumber(text: string): number {
		const match = text.match(/(\d+(?:,\d+)*(?:\.\d+)?)/)
		if (!match) return 0
		return parseFloat(match[1].replace(/,/g, ''))
	}
}
