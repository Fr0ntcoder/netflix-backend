import { Injectable } from '@nestjs/common'
import { ModelType } from '@typegoose/typegoose/lib/types'
import { Types } from 'mongoose'
import { InjectModel } from 'nestjs-typegoose'
import { MovieService } from 'src/movie/movie.service'
import { RatingDto } from 'src/rating/dto/rating.dto'
import { RatingModel } from 'src/rating/rating.model'

@Injectable()
export class RatingService {
	constructor(
		@InjectModel(RatingModel)
		private readonly RatingModel: ModelType<RatingModel>,
		private readonly movieService: MovieService,
	) {}

	async averageRatingbyMovie(movieId: Types.ObjectId | string) {
		const ratingsMovie: RatingModel[] = await this.RatingModel.aggregate()
			.match({ movieId: new Types.ObjectId(movieId) })
			.exec()

		return (
			ratingsMovie.reduce((acc, item) => acc + item.value, 0) /
			ratingsMovie.length
		)
	}

	async setRating(userId: Types.ObjectId, dto: RatingDto) {
		const { movieId, value } = dto

		const newRating = await this.RatingModel.findOneAndUpdate(
			{ movieId, userId },
			{
				userId,
				movieId,
				value,
			},
			{ upsert: true, new: true, setDefaultsOnInsert: true },
		).exec()

		const averageRating = await this.averageRatingbyMovie(movieId)

		await this.movieService.updateRating(movieId, averageRating)

		return newRating
	}

	async getMovieValueByUser(movieId: Types.ObjectId, userId: Types.ObjectId) {
		return this.RatingModel.findOne({ movieId, userId })
			.select('value')
			.exec()
			.then((data) => (data ? data.value : 0))
	}
}
