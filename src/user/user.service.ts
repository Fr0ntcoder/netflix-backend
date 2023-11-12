import { Injectable, NotFoundException } from '@nestjs/common'
import { DocumentType, ModelType } from '@typegoose/typegoose/lib/types'
import { genSalt, hash } from 'bcryptjs'
import { Types } from 'mongoose'
import { InjectModel } from 'nestjs-typegoose'
import { UpdateUserDto } from 'src/user/dto/update-user.dto'
import { UserModel } from 'src/user/user.model'

@Injectable()
export class UserService {
	constructor(
		@InjectModel(UserModel) private readonly UserModel: ModelType<UserModel>,
	) {}
	async getById(id: string) {
		const user = await this.UserModel.findById(id).exec()

		if (user) return user

		throw new NotFoundException('Пользователь не найден')
	}

	async updateProfile(_id: string, dto: UpdateUserDto) {
		const user = await this.UserModel.findById(_id)
		const isSameUser = await this.UserModel.findOne({ email: dto.email })

		if (isSameUser && String(_id) !== String(isSameUser._id)) {
			throw new NotFoundException('Пользователь с таким email уже существует')
		}

		if (user) {
			if (dto.password) {
				const salt = await genSalt(10)
				user.password = await hash(dto.password, salt)
			}
			user.email = dto.email
			if (dto.isAdmin || dto.isAdmin === false) user.isAdmin = dto.isAdmin

			await user.save()
			return
		}

		throw new NotFoundException('User not found')
	}

	async getCount() {
		return this.UserModel.find().count().exec()
	}

	async getAll(searchTerm?: string) {
		let options = {}

		if (searchTerm) {
			options = {
				$or: [
					{
						email: new RegExp(searchTerm, 'i'),
					},
				],
			}
		}

		return this.UserModel.find(options)
			.select('-password -updatedAt -__v')
			.sort({
				cretedAt: 'desc',
			})
			.exec()
	}

	async delete(id: string): Promise<DocumentType<UserModel> | null> {
		return this.UserModel.findByIdAndDelete(id).exec()
	}

	async toggleFavorite(movieId: Types.ObjectId, user: UserModel) {
		const { _id, favorites } = user

		await this.UserModel.findByIdAndUpdate(_id, {
			favorites: favorites.includes(movieId)
				? favorites.filter((item) => String(item) !== String(movieId))
				: [...favorites, movieId],
		})
	}

	async getFavoriteMovies(_id: Types.ObjectId) {
		return await this.UserModel.findById(_id, 'favorites')
			.populate({ path: 'favorites', populate: { path: 'genres' } })
			.exec()
			.then((data) => data.favorites)
	}
}
