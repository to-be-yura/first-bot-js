//запустить: >npm rud dev
//завершить: >CTRL+C

const TelegamApi = require('node-telegram-bot-api')
const { gameOptions, againOptions } = require('./options')

const token = "5893084476:AAE8D27LXeetkNkf4Ml1zAzekfzpLirxqWg"

const bot = new TelegamApi(token, { polling: true })

const chats = {}

const startGame = async (chatId) => {
	await bot.sendMessage(chatId, "Угадай число от 0 до 9...")
	const randomNumber = Math.floor(Math.random() * 10)
	chats[chatId] = randomNumber;
	await bot.sendMessage(chatId, 'Отгадывай!', gameOptions)
}

const start = () => {
	bot.setMyCommands([
		{ command: '/start', description: 'Начальное приветствие' },
		{ command: '/info', description: 'Информация о боте' },
		{ command: '/game', description: 'Игра в "Угадай число"' },

	])

	bot.on('message', async msg => {
		const text = msg.text;
		const chatId = msg.chat.id;
		const userName = msg.from.first_name;

		if (text === '/start') {
			await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/7a0/e2e/7a0e2ef1-ff94-4317-a188-4bead80d1756/4.webp')
			return bot.sendMessage(chatId, `Привет, ${userName}!`)
		}

		if (text === '/info') {
			return bot.sendMessage(chatId, 'Описание бота: Двое мягкие, они великие, и хотят из этого выйти, и никакая великая выгода не слепит.')
		}

		if (text === '/game') {
			return startGame(chatId)
		}
		return bot.sendMessage(chatId, 'Я тебя не понимаю!')
	})

	bot.on('callback_query', async msg => {
		const data = msg.data;
		const chatId = msg.message.chat.id;

		if (data === '/again') {
			return startGame(chatId);
		}

		if (data === chats[chatId]) {
			return bot.sendMessage(chatId, `Угадал!!! 🥳`, againOptions)
		} else {
			return bot.sendMessage(chatId, `GAME OVER! Бот загадал "${chats[chatId]}"`, againOptions)
		}
	})

};

start();