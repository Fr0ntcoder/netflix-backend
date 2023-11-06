import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { TypegooseModule } from 'nestjs-typegoose'
import { JwtStrategy } from 'src/auth/strategies/jwt.strategy'
import { getJwtConfig } from 'src/config/jwt.config'
import { UserModel } from 'src/user/user.model'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

@Module({
	providers: [AuthService, JwtStrategy],
	imports: [
		TypegooseModule.forFeature([
			{
				typegooseClass: UserModel,
				schemaOptions: {
					collection: 'User',
				},
			},
		]),
		ConfigModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: getJwtConfig,
		}),
	],
	controllers: [AuthController],
})
export class AuthModule {}
