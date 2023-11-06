import { IsString } from 'class-validator'

export class RefreshTokenDto {
  @IsString({ message: 'Refresh token не является строкой' })
  refreshToken: string
}
