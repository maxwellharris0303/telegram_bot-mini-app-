import { Bot, InlineKeyboard } from "grammy";
import dotenv from "dotenv";

dotenv.config();

// Replace with your bot token from BotFather
const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN!);

const mainMessage = `
⭐️ Welcome to Tablet - The Revolutionary Farming App on Telegram!

🎯 Unleash the power of Tablet 💙, the next-gen app transforming your Telegram experience.

🔥 Take on exciting missions, bring in your friends, and boost your coin capacity to skyrocket your rewards.

🔥 Dive into Tablet now and start your tapping journey today 💎

Tap <b>Start App</b>, click here 👇
`;

const openWebAppInlineKeyboard = new InlineKeyboard()
    .webApp("Start App", "https://tablet-app.vercel.app/")
    .row()
    .url("Join Community", "https://t.me/joinchat/XXXXXX");

// Handle the "/start" command
bot.command('start', async (ctx) => {
    const user = ctx.from;
    if (!user) return ctx.reply("Failed to get user data.");

    try {
        await ctx.api.sendChatAction(ctx.chat.id, "typing");
    } catch (error) {
        console.error("Error send chat action :", error);
    }

    // try {
    //     const ref_id = ctx.match?.split("ref_")[1] || null;
    //     await initializePlayer(user, ref_id);
    // } catch (error) {
    //     console.error("Error initializing player:", error);
    // }


    await ctx.replyWithPhoto("https://www.imghost.net/ib/KaQaoKk1VWuUdoX_1724148648.png", {
        caption: mainMessage,
        reply_markup: openWebAppInlineKeyboard,
        parse_mode: "HTML",
    });
});

// Handle any text message
// bot.on('message:text', ctx => {
//     ctx.reply(`You said: ${ctx.message.text}`);
// });

// Start the bot
bot.start();
