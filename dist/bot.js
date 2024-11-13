"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const grammy_1 = require("grammy");
// Replace with your bot token from BotFather
const bot = new grammy_1.Bot('7525935415:AAFnjdtGrtfiUanks10uprmdiiHUaWaE7tY');
// Handle the "/start" command
bot.command('start', ctx => {
    ctx.reply('Welcome! I am your new bot. How can I assist you today?');
});
// Handle any text message
bot.on('message:text', ctx => {
    ctx.reply(`You said: ${ctx.message.text}`);
});
// Start the bot
bot.start();
