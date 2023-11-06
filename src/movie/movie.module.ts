import { Module } from '@nestjs/common'
import { TypegooseModule } from 'nestjs-typegoose'
import { MovieModel } from 'src/movie/movie.model'
import { TelegramModule } from 'src/telegram/telegram.module'
import { UserModule } from 'src/user/user.module'
import { MovieController } from './movie.controller'
import { MovieService } from './movie.service'

@Module({
	imports: [
		TypegooseModule.forFeature([
			{
				typegooseClass: MovieModel,
				schemaOptions: {
					collection: 'Movie',
				},
			},
		]),
		TelegramModule,
		UserModule,
	],
	controllers: [MovieController],
	providers: [MovieService],
	exports: [MovieService],
})
export class MovieModule {}
