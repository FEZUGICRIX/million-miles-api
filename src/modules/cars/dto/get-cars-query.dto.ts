import { IsOptional, IsInt, Min, Max, IsString, IsEnum } from 'class-validator'
import { Type, Transform } from 'class-transformer'

export enum SortOption {
	PRICE_ASC = 'price_asc',
	PRICE_DESC = 'price_desc',
	YEAR_DESC = 'year_desc',
	MILEAGE_ASC = 'mileage_asc',
}

export class GetCarsQueryDto {
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page?: number = 1

	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(100)
	limit?: number = 20

	@IsOptional()
	@IsString()
	@Transform(({ value }) => value?.trim())
	brand?: string

	@IsOptional()
	@Type(() => Number)
	minPrice?: number

	@IsOptional()
	@Type(() => Number)
	maxPrice?: number

	@IsOptional()
	@IsEnum(SortOption)
	sort?: SortOption
}
