import {
	Body,
	Controller,
	Get,
	HttpCode,
	Param,
	Post,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common'
import { Types } from 'mongoose'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { IdValidationPipe } from 'src/pipes/id.validation.pipe'
import { RatingDto } from 'src/rating/dto/rating.dto'
import { User } from 'src/user/decorators/user.decorator'
import { RatingService } from './rating.service'

@Controller('ratings')
export class RatingController {
	constructor(private readonly ratingService: RatingService) {}

	@UsePipes(new ValidationPipe())
	@Post('set-rating')
	@HttpCode(200)
	@Auth()
	async setRating(
		@User('_id') userId: Types.ObjectId,
		@Body()
		dto: RatingDto,
	) {
		return this.ratingService.setRating(userId, dto)
	}

	@Get('/:movieId')
	@Auth()
	async getMovieValueByUser(
		@Param('movieId', IdValidationPipe) movieId: Types.ObjectId,
		@User('_id') userId: Types.ObjectId,
	) {
		return this.ratingService.getMovieValueByUser(movieId, userId)
	}
}
