import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpStatus,
	Logger,
} from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { Response } from 'express'

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
	private readonly logger = new Logger(PrismaExceptionFilter.name)

	catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
		const ctx = host.switchToHttp()
		const response = ctx.getResponse<Response>()

		this.logger.error(`Prisma error: ${exception.code} - ${exception.message}`)

		switch (exception.code) {
			case 'P2025': // Record not found
				response.status(HttpStatus.NOT_FOUND).json({
					statusCode: 404,
					message: 'Resource not found',
					error: 'Not Found',
				})
				break

			case 'P2002': // Unique constraint violation
				response.status(HttpStatus.CONFLICT).json({
					statusCode: 409,
					message: 'Resource already exists',
					error: 'Conflict',
				})
				break

			case 'P2003': // Foreign key constraint failed
				response.status(HttpStatus.BAD_REQUEST).json({
					statusCode: 400,
					message: 'Invalid reference',
					error: 'Bad Request',
				})
				break

			default:
				response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
					statusCode: 500,
					message: 'Internal server error',
					error: 'Internal Server Error',
				})
		}
	}
}
