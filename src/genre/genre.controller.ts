import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	NotFoundException,
	Param,
	Post,
	Put,
	Query,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { CreateGenreDto } from 'src/genre/dto/create-genre.dto'
import { GenreService } from 'src/genre/genre.service'
import { IdValidationPipe } from 'src/pipes/id.validation.pipe'

@Controller('genres')
export class GenreController {
	constructor(private readonly genreService: GenreService) {}

	@Get('by-slug/:slug')
	@Auth()
	async getBySlug(@Param('slug') slug: string) {
		return this.genreService.getBySlug(slug)
	}

	@Get('collections')
	async getCollections() {
		return this.genreService.getCollection()
	}

	@Get('/popular')
	async getPopular() {
		return this.genreService.getPopular()
	}

	@Get()
	async getAll(@Query('searchTerm') searchTerm?: string) {
		return this.genreService.getAll(searchTerm)
	}

	@Get(':id')
	@Auth('admin')
	async getById(@Param('id', IdValidationPipe) id: string) {
		return this.genreService.getById(id)
	}

	/* @UsePipes(new ValidationPipe())
	@Post()
	@HttpCode(200)
	@Auth('admin')
	async create() {
		return this.genreService.create()
	} */

	@Post('create')
	@HttpCode(200)
	@Auth('admin')
	async create(@Body() dto: CreateGenreDto) {
		return this.genreService.create(dto)
	}

	@UsePipes(new ValidationPipe())
	@Put(':id')
	@HttpCode(200)
	@Auth('admin')
	async update(
		@Param('id', IdValidationPipe) id: string,
		@Body() dto: CreateGenreDto,
	) {
		const updateGenre = await this.genreService.update(id, dto)
		if (!updateGenre) throw new NotFoundException('Genre not found')
		return updateGenre
	}

	@Delete(':id')
	@HttpCode(200)
	@Auth('admin')
	async delete(@Param('id', IdValidationPipe) id: string) {
		return this.genreService.delete(id)
	}
}
