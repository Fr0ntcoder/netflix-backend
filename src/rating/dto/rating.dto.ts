import { IsNumber } from 'class-validator'
import { IsObjectId } from 'class-validator-mongo-object-id'
import { Types } from 'mongoose'

export class RatingDto {
	@IsObjectId({ message: 'movieId должен быть валидным' })
	movieId: Types.ObjectId

	@IsNumber()
	value: number
}
