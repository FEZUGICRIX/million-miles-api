import {
	Controller,
	Get,
	Param,
	Query,
	ParseUUIDPipe,
	UseGuards,
} from '@nestjs/common'
import { CarsService } from './cars.service'
import { GetCarsQueryDto } from './dto'
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard'

@Controller('cars')
@UseGuards(JwtAuthGuard)
export class CarsController {
	constructor(private carsService: CarsService) {}

	@Get()
	async findAll(@Query() query: GetCarsQueryDto) {
		return this.carsService.findAll(query)
	}

	@Get(':id')
	async findOne(@Param('id', ParseUUIDPipe) id: string) {
		return this.carsService.findOne(id)
	}
}
