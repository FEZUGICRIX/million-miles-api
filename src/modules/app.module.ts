import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { BullModule } from '@nestjs/bullmq'
import { ScheduleModule } from '@nestjs/schedule'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'
import { PrismaModule } from '@/core/prisma/prisma.module'
import { ScraperModule } from './scraper/scraper.module'
import { AuthModule } from './auth/auth.module'
import { CarsModule } from './cars/cars.module'
import { HealthModule } from './health/health.module'
import { appConfig } from '@/core/config'

@Module({
	imports: [
		ConfigModule.forRoot(appConfig),
		ScheduleModule.forRoot(),
		ThrottlerModule.forRoot([
			{
				ttl: 60000, // 60 seconds
				limit: 10, // 10 requests per minute
			},
		]),
		BullModule.forRoot({
			connection: {
				host: process.env.REDIS_HOST || 'localhost',
				port: parseInt(process.env.REDIS_PORT || '6379'),
				password: process.env.REDIS_PASSWORD, 
			},
		}),
		PrismaModule,
		ScraperModule,
		AuthModule,
		CarsModule,
		HealthModule,
	],
	providers: [
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard,
		},
	],
})
export class AppModule {}
