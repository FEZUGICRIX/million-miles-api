import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ScraperService } from './scraper.service';

@Processor('scraper')
export class ScraperProcessor extends WorkerHost {
  private readonly logger = new Logger(ScraperProcessor.name);

  constructor(private readonly scraperService: ScraperService) {
    super();
  }

  async process(job: Job): Promise<any> {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);

    if (job.name === 'scrape-carsensor') {
      const result = await this.scraperService.scrapeCarSensor();
      return result;
    }

    throw new Error(`Unknown job type: ${job.name}`);
  }
}
