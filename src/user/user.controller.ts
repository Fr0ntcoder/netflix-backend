import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Put,
	Query,
	UsePipes,
	ValidationPipe,
} from '@nestjs/common'
import { Types } from 'mongoose'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { IdValidationPipe } from 'src/pipes/id.validation.pipe'
import { User } from 'src/user/decorators/user.decorator'
import { UpdateUserDto } from 'src/user/dto/update-user.dto'
import { UserModel } from 'src/user/user.model'
import { UserService } from './user.service'

@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Get('profile')
	@Auth()
	async getProfile(@User('_id') _id: string) {
		return this.userService.getById(_id)
	}

	@UsePipes(new ValidationPipe())
	@Put('profile')
	@HttpCode(200)
	@Auth()
	async updateProfile(@User('_id') _id: string, @Body() dto: UpdateUserDto) {
		return this.userService.updateProfile(_id, dto)
	}

	@Get('profile/favorites')
	@Auth()
	async getFavorites(@User('_id') _id: Types.ObjectId) {
		return this.userService.getFavoriteMovies(_id)
	}

	@Put('profile/favorites')
	@HttpCode(200)
	@Auth()
	async toggleFavorites(
		@User() user: UserModel,
		@Body('movieId') movieId: Types.ObjectId,
	) {
		return this.userService.toggleFavorite(movieId, user)
	}

	@Get('count')
	@Auth('admin')
	async getCount() {
		return this.userService.getCount()
	}

	@Get()
	@Auth('admin')
	async getAll(@Query('searchTerm') searchTerm?: string) {
		return this.userService.getAll(searchTerm)
	}

	@Get(':id')
	@Auth('admin')
	async getById(@Param('id', IdValidationPipe) id: string) {
		return this.userService.getById(id)
	}

	@UsePipes(new ValidationPipe())
	@Put(':id')
	@HttpCode(200)
	@Auth('admin')
	async update(
		@Param('id', IdValidationPipe) id: string,
		@Body() dto: UpdateUserDto,
	) {
		return this.userService.updateProfile(id, dto)
	}

	@Delete(':id')
	@HttpCode(200)
	@Auth('admin')
	async getDefaultAutoSelectFamilyAttemptTimeout(
		@Param('id', IdValidationPipe) id: string,
	) {
		return this.userService.delete(id)
	}
}
