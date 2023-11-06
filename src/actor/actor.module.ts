import { Module } from '@nestjs/common'
import { TypegooseModule } from 'nestjs-typegoose'
import { ActorModel } from 'src/actor/actor.model'
import { ActorController } from './actor.controller'
import { ActorService } from './actor.service'

@Module({
	imports: [
		TypegooseModule.forFeature([
			{
				typegooseClass: ActorModel,
				schemaOptions: {
					collection: 'Actor',
				},
			},
		]),
	],
	controllers: [ActorController],
	providers: [ActorService],
})
export class ActorModule {}
