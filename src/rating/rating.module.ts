import { Module } from '@nestjs/common'
import { TypegooseModule } from 'nestjs-typegoose'
import { MovieModule } from 'src/movie/movie.module'
import { RatingModel } from 'src/rating/rating.model'
import { RatingController } from './rating.controller'
import { RatingService } from './rating.service'

@Module({
	imports: [
		TypegooseModule.forFeature([
			{
				typegooseClass: RatingModel,
				schemaOptions: {
					collection: 'Rating',
				},
			},
		]),
		MovieModule,
	],
	controllers: [RatingController],
	providers: [RatingService],
})
export class RatingModule {}
