import {
	BadRequestException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ModelType } from '@typegoose/typegoose/lib/types'
import { compare, genSalt, hash } from 'bcryptjs'
import { InjectModel } from 'nestjs-typegoose'
import { AuthDto } from 'src/auth/dto/auth.dto'
import { RefreshTokenDto } from 'src/auth/dto/refreshToken.dto'
import { UserModel } from 'src/user/user.model'

@Injectable()
export class AuthService {
	constructor(
		@InjectModel(UserModel) private readonly UserModel: ModelType<UserModel>,
		private readonly jwtService: JwtService,
	) {}
	async register(dto: AuthDto) {
		const oldUser = await this.UserModel.findOne({ email: dto.email })

		if (oldUser) {
			throw new BadRequestException('Пользователь с таким email уже существует')
		}

		const salt = await genSalt(10)

		const newUser = new this.UserModel({
			email: dto.email,
			password: await hash(dto.password, salt),
		})

		const user = await newUser.save()

		const tokens = await this.issueTokenPair(user._id.toString())

		return {
			user: this.returnUserFields(user),
			...tokens,
		}
	}

	async login(dto: AuthDto) {
		const user = await this.validateUser(dto)

		const tokens = await this.issueTokenPair(user._id.toString())

		return {
			user: this.returnUserFields(user),
			...tokens,
		}
	}

	async getNewTokens({ refreshToken }: RefreshTokenDto) {
		if (!refreshToken) {
			throw new UnauthorizedException('Пользователь не авторизован')
		}

		const result = await this.jwtService.verifyAsync(refreshToken)

		if (!result) {
			throw new UnauthorizedException('Токен не валидный')
		}

		const user = await this.UserModel.findById(result._id)

		const tokens = await this.issueTokenPair(user._id.toString())

		return {
			user: this.returnUserFields(user),
			...tokens,
		}
	}

	async validateUser(dto: AuthDto): Promise<UserModel> {
		const user = await this.UserModel.findOne({ email: dto.email })

		if (!user) {
			throw new UnauthorizedException('Пользователь не найден')
		}

		const isValidPassword = await compare(dto.password, user.password)

		if (!isValidPassword) {
			throw new UnauthorizedException('Неверный пароль')
		}

		return user
	}

	async issueTokenPair(userId: string) {
		const data = { _id: userId }

		const refreshToken = await this.jwtService.signAsync(data, {
			expiresIn: '15d',
		})

		const accessToken = await this.jwtService.signAsync(data, {
			expiresIn: '1h',
		})

		return {
			refreshToken,
			accessToken,
		}
	}

	returnUserFields(user: UserModel) {
		return {
			_id: user._id,
			email: user.email,
			isAdmin: user.isAdmin,
		}
	}
}
