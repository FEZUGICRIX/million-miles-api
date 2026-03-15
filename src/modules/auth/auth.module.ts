import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { ConfigService } from '@nestjs/config'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtStrategy } from './strategies/jwt.strategy'
import { PrismaModule } from '../../core/prisma/prisma.module'

@Module({
	imports: [
		PrismaModule,
		PassportModule,
		JwtModule.registerAsync({ // TODO: возможно вынести в core/config
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				secret: configService.get<string>('JWT_SECRET'),
				signOptions: { expiresIn: '24h' },
			}),
		}),
	],
	controllers: [AuthController],
	providers: [AuthService, JwtStrategy],
	exports: [AuthService],
})
export class AuthModule {}
