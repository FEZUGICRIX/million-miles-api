import { Injectable } from '@nestjs/common';

@Injectable()
export class TranslationService {
  private readonly dictionary: Record<string, string> = {
    '価格': 'price',
    '年式': 'year',
    '走行距離': 'mileage',
    '排気量': 'engine_capacity',
  };

  translate(japaneseKey: string): string {
    return this.dictionary[japaneseKey] || japaneseKey;
  }

  normalizePrice(priceText: string): number {
    // Convert "万円" to raw number (multiply by 10000)
    const match = priceText.match(/(\d+(?:\.\d+)?)/);
    if (!match) return 0;

    const value = parseFloat(match[1]);
    if (priceText.includes('万円')) {
      return value * 10000;
    }
    return value;
  }

  normalizeNumber(text: string): number {
    const match = text.match(/(\d+(?:,\d+)*(?:\.\d+)?)/);
    if (!match) return 0;
    return parseFloat(match[1].replace(/,/g, ''));
  }
}
