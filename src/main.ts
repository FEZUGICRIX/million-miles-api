import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './modules/app.module'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
		}), // TODO: возможно вынести в core/pipes
	)

	// Включаем CORS
	app.enableCors({
		origin: 'http://localhost:3000',
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
		credentials: true,
	})

	await app.listen(process.env.PORT ?? 4200)
}
bootstrap()
