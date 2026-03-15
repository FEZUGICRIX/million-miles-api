import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { BullModule } from '@nestjs/bullmq'
import { ScheduleModule } from '@nestjs/schedule'
import { PrismaModule } from '@/core/prisma/prisma.module'
import { ScraperModule } from './scraper/scraper.module'
import { AuthModule } from './auth/auth.module'
import { appConfig } from '@/core/config'

@Module({
	imports: [
		ConfigModule.forRoot(appConfig),
		ScheduleModule.forRoot(),
		BullModule.forRoot({
			connection: {
				host: process.env.REDIS_HOST || 'localhost', // TODO: сделать nestjs config для env
				port: parseInt(process.env.REDIS_PORT || '6379'),
				password: process.env.REDIS_PASSWORD, // TODO: прокинуть пароль из config module env
			},
		}),
		PrismaModule,
		ScraperModule,
		AuthModule,
	],
})
export class AppModule {}
