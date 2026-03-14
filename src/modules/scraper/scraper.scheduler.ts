import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'

@Injectable()
export class ScraperScheduler {
	private readonly logger = new Logger(ScraperScheduler.name)

	constructor(@InjectQueue('scraper') private scraperQueue: Queue) {}

	@Cron('0 * * * *') // Every hour at minute 0
	async handleCron() {
		this.logger.log('Triggering hourly CarSensor scrape job')

		await this.scraperQueue.add(
			'scrape-carsensor',
			{},
			{
				attempts: 3,
				backoff: {
					type: 'exponential',
					delay: 5000,
				},
			},
		)
	}
}
