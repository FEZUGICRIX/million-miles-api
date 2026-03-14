import { Module } from '@nestjs/common'
import { BullModule } from '@nestjs/bullmq'
import { ScraperService } from './scraper.service'
import { ScraperProcessor } from './scraper.processor'
import { TranslationService } from './translation.service'
import { ScraperScheduler } from './scraper.scheduler'
import { ScraperController } from './scraper.controller'

@Module({
	imports: [
		BullModule.registerQueue({
			name: 'scraper',
		}),
	],
	controllers: [ScraperController],
	providers: [
		ScraperService,
		ScraperProcessor,
		TranslationService,
		ScraperScheduler,
	],
	exports: [ScraperService],
})
export class ScraperModule {}
