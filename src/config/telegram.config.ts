import { Telegram } from 'src/telegram/telegram.interface'

export const getTelegramConfig = (): Telegram => ({
	chatId: process.env.TELEGRAM_CHAT_ID,
	token: process.env.TELEGRAM_TOKEN,
})
