import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { PrismaService } from '../../core/prisma/prisma.service'
import { LoginDto } from './dto/login.dto'

@Injectable()
export class AuthService {
	constructor(
		private prisma: PrismaService,
		private jwtService: JwtService,
	) {}

	async login(loginDto: LoginDto) {
		const { username, password } = loginDto

		// Hardcoded admin credentials
		if (username !== 'admin' || password !== 'admin123') {
			throw new UnauthorizedException('Invalid credentials')
		}

		// Find or create user in database
		let user = await this.prisma.user.findUnique({
			where: { username },
		})

		if (!user) {
			user = await this.prisma.user.create({
				data: {
					username,
					passwordHash: 'hardcoded',
				},
			})
		}

		// Sign JWT
		const payload = { sub: user.id, username: user.username }
		const access_token = this.jwtService.sign(payload)

		return { access_token }
	}
}
