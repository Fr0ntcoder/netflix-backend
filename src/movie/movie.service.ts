import { Injectable, NotFoundException } from '@nestjs/common'
import { DocumentType, ModelType } from '@typegoose/typegoose/lib/types'
import { Types } from 'mongoose'
import { InjectModel } from 'nestjs-typegoose'
import { MovieDto } from 'src/movie/dto/movie.dto'
import { MovieModel } from 'src/movie/movie.model'
import { TelegramService } from 'src/telegram/telegram.service'

@Injectable()
export class MovieService {
	constructor(
		@InjectModel(MovieModel) private readonly MovieModel: ModelType<MovieModel>,
		private readonly telegramService: TelegramService,
	) {}

	async getById(_id: string) {
		const actor = await this.MovieModel.findById(_id)

		if (!actor) {
			throw new NotFoundException('Актёр не найден')
		}
		return actor
	}

	async getBySlug(slug: string) {
		const movie = await this.MovieModel.findOne({ slug })
			.populate('actors genres')
			.exec()

		if (!movie) {
			throw new NotFoundException('Фильм не найден')
		}
		return movie
	}

	async getByActors(actorId: Types.ObjectId) {
		const movies = await this.MovieModel.find({ actors: actorId }).exec()

		if (!movies) {
			throw new NotFoundException('Фильмы не найдены')
		}
		return movies
	}

	async getByGenres(
		genreIds: Types.ObjectId[],
	): Promise<DocumentType<MovieModel>[]> {
		return this.MovieModel.find({ genres: { $in: genreIds } }).exec()
	}

	async getMostPopular() {
		return await this.MovieModel.find({ countOpened: { $gt: 0 } })
			.populate('actors genres')
			.sort({ countOpened: -1 })
			.exec()
	}

	async updateCountOpened(slug: string) {
		const updateMovie = await this.MovieModel.findOneAndUpdate(
			{ slug },
			{ $inc: { countOpened: 1 } },
			{
				new: true,
			},
		).exec()

		if (!updateMovie) {
			throw new NotFoundException('Фильм не найден')
		}

		return updateMovie
	}

	async updateRating(id: Types.ObjectId, newRating: number) {
		return this.MovieModel.findByIdAndUpdate(
			id,
			{ rating: newRating },
			{ new: true },
		).exec()
	}
	async getAll(searchTerm?: string) {
		let options = {}

		if (searchTerm) {
			options = {
				$or: [
					{
						title: new RegExp(searchTerm, 'i'),
					},
				],
			}
		}

		return this.MovieModel.find(options)
			.select('-updatedAt -__v')
			.sort({
				cretedAt: 'desc',
			})
			.populate('actors genres')
			.exec()
	}

	/* async create() {
		const defaultValue: MovieDto = {
			bigPoster: '',
			actors: [],
			genres: [],
			poster: '',
			title: '',
			videoUrl: '',
			slug: '',
		}

		const movie = await this.MovieModel.create(defaultValue)

		return movie._id
	} */
	async create(dto: MovieDto) {
		const isExisit = await this.MovieModel.findOne({ name: dto.title })

		if (isExisit) {
			throw new Error('Этот фильм уже существует')
		}

		const movie = await this.MovieModel.create(dto)

		return movie
	}

	async update(_id: string, dto: MovieDto) {
		if (!dto.isSendTelegram) {
			await this.sendNotification(dto)
			dto.isSendTelegram = true
		}

		const updateMovie = await this.MovieModel.findByIdAndUpdate(_id, dto, {
			new: true,
		}).exec()

		if (!updateMovie) {
			throw new NotFoundException('Фильм не найден')
		}

		return updateMovie
	}

	async delete(id: string) {
		const deleteMovie = await this.MovieModel.findByIdAndDelete(id).exec()

		if (!deleteMovie) {
			throw new NotFoundException('Фильм не найден')
		}

		return deleteMovie
	}

	async sendNotification(dto: MovieDto) {
		/* if (process.env.NODE_ENV !== 'development') { */
		await this.telegramService.sendPhoto(
			'https://img.freepik.com/free-photo/top-view-over-food-banquet_23-2149893441.jpg?w=1380&t=st=1699265161~exp=1699265761~hmac=e132d0fd9a7396ed5447ee704e4e31e43cbb9e8a167f6a8914d1a4350a8345f6',
		)

		const msg = `<b>${dto.title}</b>`

		await this.telegramService.sendMessage(msg, {
			reply_markup: {
				inline_keyboard: [
					[
						{
							text: 'Смотреть',
							url: 'https://okko.tv/movie/free-guy',
						},
					],
				],
			},
		})
		/* } */
	}
}
