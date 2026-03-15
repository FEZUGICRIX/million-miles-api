import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/core/prisma/prisma.service'
import { GetCarsQueryDto, SortOption } from './dto'
import { PaginatedResponse } from './interfaces/paginated-response.interface'
import { Car } from '@prisma/generated'

@Injectable()
export class CarsService {
	constructor(private prismaService: PrismaService) {}

	async findAll(query: GetCarsQueryDto): Promise<PaginatedResponse<Car>> {
		const { page = 1, limit = 20, brand, minPrice, maxPrice, sort } = query

		const skip = (page - 1) * limit
		const take = limit

		// Build dynamic where clause
		const where: any = {}

		if (brand) {
			where.brand = {
				contains: brand,
				mode: 'insensitive',
			}
		}

		if (minPrice !== undefined || maxPrice !== undefined) {
			where.price = {}
			if (minPrice !== undefined) {
				where.price.gte = minPrice
			}
			if (maxPrice !== undefined) {
				where.price.lte = maxPrice
			}
		}

		// Build orderBy clause
		const orderBy: any = this.buildOrderBy(sort)

		// Execute queries
		const [items, total] = await Promise.all([
			this.prismaService.car.findMany({
				where,
				skip,
				take,
				orderBy,
			}),
			this.prismaService.car.count({ where }),
		])

		const lastPage = Math.ceil(total / limit)
		const hasNextPage = page < lastPage

		return {
			data: items,
			meta: {
				total,
				page,
				lastPage,
				hasNextPage,
			},
		}
	}

	async findOne(id: string): Promise<Car> {
		return this.prismaService.car.findUniqueOrThrow({
			where: { id },
		})
	}

	private buildOrderBy(sort?: SortOption): any {
		switch (sort) {
			case SortOption.PRICE_ASC:
				return { price: 'asc' }
			case SortOption.PRICE_DESC:
				return { price: 'desc' }
			case SortOption.YEAR_DESC:
				return { year: 'desc' }
			case SortOption.MILEAGE_ASC:
				return { mileage: 'asc' }
			default:
				return { createdAt: 'desc' }
		}
	}
}
