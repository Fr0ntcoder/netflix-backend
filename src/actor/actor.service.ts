import { Injectable, NotFoundException } from '@nestjs/common'
import { ModelType } from '@typegoose/typegoose/lib/types'
import { InjectModel } from 'nestjs-typegoose'
import { ActorModel } from 'src/actor/actor.model'
import { ActorDto } from 'src/actor/dto/actor.dto'

@Injectable()
export class ActorService {
	constructor(
		@InjectModel(ActorModel) private readonly ActorModel: ModelType<ActorModel>,
	) {}

	async getById(_id: string) {
		const actor = await this.ActorModel.findById(_id)

		if (!actor) {
			throw new NotFoundException('Актёр не найден')
		}
		return actor
	}

	async getBySlug(slug: string) {
		const actor = await this.ActorModel.findOne({ slug }).exec()

		if (!actor) {
			throw new NotFoundException('Актёр не найден')
		}
		return actor
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
				],
			}
		}

		return this.ActorModel.aggregate()
			.match(options)
			.lookup({
				from: 'Movie',
				localField: '_id',
				foreignField: 'actors',
				as: 'movies',
			})
			.addFields({
				countMovies: {
					$size: '$movies',
				},
			})
			.project({
				__v: 0,
				updatedAd: 0,
				movies: 0,
			})
			.sort({
				createdAt: -1,
			})
			.exec()
	}

	/* async creates() {
		const defaultValue: ActorDto = {
			name: '',
			slug: '',
			photo: '',
		}

		const actor = await this.ActorModel.create(defaultValue)

		return actor._id
	} */

	async create(dto: ActorDto) {
		const isExisit = await this.ActorModel.findOne({ name: dto.name })

		if (isExisit) {
			throw new Error('Этот актёр уже существует')
		}

		const actor = await this.ActorModel.create(dto)

		return actor
	}

	async update(_id: string, dto: ActorDto) {
		const updateActor = await this.ActorModel.findByIdAndUpdate(_id, dto, {
			new: true,
		}).exec()

		if (!updateActor) {
			throw new NotFoundException('Актёр не найден')
		}

		return updateActor
	}

	async delete(id: string) {
		const deleteActor = await this.ActorModel.findByIdAndDelete(id).exec()

		if (!deleteActor) {
			throw new NotFoundException('Актёр не найден')
		}

		return deleteActor
	}
}
