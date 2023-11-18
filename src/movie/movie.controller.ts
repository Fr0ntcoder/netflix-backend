import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Post,
	Put,
	Query,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common'
import { Types } from 'mongoose'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { MovieDto } from 'src/movie/dto/movie.dto'
import { IdValidationPipe } from 'src/pipes/id.validation.pipe'
import { MovieService } from './movie.service'

@Controller('movies')
export class MovieController {
	constructor(private readonly movieService: MovieService) {}

	@Get('by-slug/:slug')
	@Auth()
	async getBySlug(@Param('slug') slug: string) {
		return this.movieService.getBySlug(slug)
	}

	@Get('by-actor/:actorId')
	async getByActors(
		@Param('actorId', IdValidationPipe) actorId: Types.ObjectId,
	) {
		return this.movieService.getByActors(actorId)
	}

	@UsePipes(new ValidationPipe())
	@Post('by-genres')
	@HttpCode(200)
	async getByGenres(@Body('genreIds') genreIds: Types.ObjectId[]) {
		return this.movieService.getByGenres(genreIds)
	}

	@Get()
	async getAll(@Query('searchTerm') searchTerm?: string) {
		return this.movieService.getAll(searchTerm)
	}

	@Get('most-popular')
	async getMostPopular() {
		return this.movieService.getMostPopular()
	}

	@Put('update-count-opened')
	@HttpCode(200)
	async updateCountOpened(@Body('slug') slug: string) {
		return this.movieService.updateCountOpened(slug)
	}

	@Get(':id')
	@Auth('admin')
	async getById(@Param('id', IdValidationPipe) id: string) {
		return this.movieService.getById(id)
	}

	/* @UsePipes(new ValidationPipe())
	@Post()
	@HttpCode(200)
	@Auth('admin')
	async create() {
		return this.movieService.create()
	} */

	@Post('create')
	@HttpCode(200)
	@Auth('admin')
	async create(@Body() dto: MovieDto) {
		return this.movieService.create(dto)
	}

	@UsePipes(new ValidationPipe())
	@Put(':id')
	@HttpCode(200)
	@Auth('admin')
	async update(
		@Param('id', IdValidationPipe) id: string,
		@Body() dto: MovieDto,
	) {
		return this.movieService.update(id, dto)
	}

	@Delete(':id')
	@HttpCode(200)
	@Auth('admin')
	async delete(@Param('id', IdValidationPipe) id: string) {
		return this.movieService.delete(id)
	}
}
