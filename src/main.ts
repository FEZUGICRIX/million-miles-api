import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './modules/app.module'
import { PrismaExceptionFilter } from './core/filters'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)

	// Global exception filters
	app.useGlobalFilters(new PrismaExceptionFilter())

	// Global validation pipe
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
		}),
	)

	// Включаем CORS
	app.enableCors({
		origin: process.env.FRONTEND_URL,
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
		credentials: true,
	})

	await app.listen(process.env.PORT ?? 4200)
}
bootstrap()
