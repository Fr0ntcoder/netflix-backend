import { Injectable, NotFoundException } from '@nestjs/common'
import { DocumentType, ModelType } from '@typegoose/typegoose/lib/types'
import { InjectModel } from 'nestjs-typegoose'
import { CreateGenreDto } from 'src/genre/dto/create-genre.dto'
import { ICollection } from 'src/genre/genre.interface'
import { GenreModel } from 'src/genre/genre.model'
import { MovieService } from 'src/movie/movie.service'

@Injectable()
export class GenreService {
	constructor(
		@InjectModel(GenreModel) private readonly GenreModel: ModelType<GenreModel>,
		private readonly movieService: MovieService,
	) {}

	async getCollection() {
		const genres = await this.getAll()
		const collections = await Promise.all(
			genres.map(async (genre) => {
				const moviesByGenre = await this.movieService.getByGenres([genre._id])

				const result: ICollection = {
					_id: String(genre._id),
					image: moviesByGenre[0]?.bigPoster,
					title: genre.name,
					slug: genre.slug,
				}

				return result
			}),
		)

		return collections
	}

	async getPopular(): Promise<DocumentType<GenreModel>[]> {
		return this.GenreModel.find()
			.select('-updatedAt -__v')
			.sort({ createdAt: 'desc' })
			.exec()
	}

	async getById(id: string): Promise<DocumentType<GenreModel>> {
		return this.GenreModel.findById(id).exec()
	}

	async getBySlug(slug: string) {
		const genre = await this.GenreModel.findOne({ slug }).exec()

		if (!genre) {
			throw new NotFoundException('Жанр не найден')
		}
		return genre
	}

	async getAll(searchTerm?: string) {
		let options = {}

		if (searchTerm) {
			options = {
				$or: [
					{
						name: new RegExp(searchTerm, 'i'),
					},
					{
						slug: new RegExp(searchTerm, 'i'),
					},
					{
						description: new RegExp(searchTerm, 'i'),
					},
				],
			}
		}

		return this.GenreModel.find(options)
			.select('-updatedAt -__v')
			.sort({
				cretedAt: 'desc',
			})
			.exec()
	}

	/* async create() {
		const defaultValue: CreateGenreDto = {
			name: '',
			slug: '',
			description: '',
			icon: '',
		}

		const genre = await this.GenreModel.create(defaultValue)

		return genre._id
	} */
	async create(dto: CreateGenreDto) {
		const isExisit = await this.GenreModel.findOne({ name: dto.name })

		if (isExisit) {
			throw new Error('Этот жанр уже существует')
		}

		const genre = await this.GenreModel.create(dto)

		return genre
	}

	async update(
		id: string,
		dto: CreateGenreDto,
	): Promise<DocumentType<GenreModel> | null> {
		return this.GenreModel.findByIdAndUpdate(id, dto, { new: true }).exec()
	}

	async delete(id: string) {
		const deleteGenre = await this.GenreModel.findByIdAndDelete(id).exec()

		if (!deleteGenre) {
			throw new NotFoundException('Жанр не найден')
		}

		return deleteGenre
	}
}
