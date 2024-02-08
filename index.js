//запустить: >npm rud dev
//завершить: >CTRL+C

const TelegamApi = require('node-telegram-bot-api')
const { gameOptions, againOptions } = require('./options')
const sequelize = require('./db')
const UserModel = require('./models')

const token = "5893084476:AAE8D27LXeetkNkf4Ml1zAzekfzpLirxqWg"

const bot = new TelegamApi(token, { polling: true })

const chats = {}

const startGame = async (chatId) => {
	await bot.sendMessage(chatId, "Угадай число от 0 до 9...")
	const randomNumber = Math.floor(Math.random() * 10)
	chats[chatId] = randomNumber;
	await bot.sendMessage(chatId, 'Отгадывай!', gameOptions)
}

const start = async () => {

	try {
		await sequelize.authenticate()
		await sequelize.sync()
		// console.log('--Подключение к БД успешно--')
	} catch (e) {
		console.log('!!!Подключение к БД сломалось!!!\n', e)
	}

	bot.setMyCommands([
		{ command: '/start', description: 'Начальное приветствие' },
		{ command: '/info', description: 'Информация о боте' },
		{ command: '/game', description: 'Игра в "Угадай число"' },

	])

	bot.on('message', async msg => {
		const text = msg.text;
		const chatId = msg.chat.id;
		const userName = `${msg.from.first_name} ${msg.from.last_name}`;

		try {
			if (text === '/start') {
				const user = await UserModel.findOne({ chatId });
				if (user.chatId > 0) {
					await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/711/0ae/7110aef4-0a38-48c0-9864-a613ee6f39e9/7.webp');
					return bot.sendMessage(chatId, `Привет, ${userName}!`);
				} else {
					await UserModel.create({ chatId });
					await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/711/0ae/7110aef4-0a38-48c0-9864-a613ee6f39e9/7.webp');
					return bot.sendMessage(chatId, `Привет, ${userName}!`);
				}

			}

			if (text === '/info') {
				const user = await UserModel.findOne({ chatId });
				return bot.sendMessage(chatId, `Статистика ${userName}:\nугадал - ${user.right}\nошибся - ${user.wrong}`);
			}

			if (text === '/game') {
				return startGame(chatId);
			}
			return bot.sendMessage(chatId, 'Я тебя не понимаю!');
		} catch (e) {
			return bot.sendMessage(chatId, 'Произошла какая-то ошибка:(');
		}
	})

	bot.on('callback_query', async msg => {
		const data = msg.data;
		const chatId = msg.message.chat.id;
		const user = await UserModel.findOne({ chatId })

		if (data === '/again') {
			return startGame(chatId);
		}

		if (data == chats[chatId]) {
			user.right += 1;
			await bot.sendMessage(chatId, `Угадал!!! 🥳`, againOptions)
		} else {
			user.wrong += 1;
			await bot.sendMessage(chatId, `GAME OVER! Бот загадал "${chats[chatId]}"`, againOptions)
		}
		await user.save();
	})

};

start();