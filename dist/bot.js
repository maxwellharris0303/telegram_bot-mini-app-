"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const grammy_1 = require("grammy");
const fs_1 = __importDefault(require("fs"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path")); // Import path to handle file paths
dotenv_1.default.config();
console.log("bot token: ", process.env.TELEGRAM_BOT_TOKEN);
const bot = new grammy_1.Bot(process.env.TELEGRAM_BOT_TOKEN);
// Load existing user IDs from a file
let userIds = [];
try {
    userIds = JSON.parse(fs_1.default.readFileSync("user_ids.json", "utf-8"));
}
catch (error) {
    console.log("Could not load user IDs, starting with an empty list.");
}
// Function to save user IDs to a file
function saveUserIds() {
    fs_1.default.writeFileSync("user_ids.json", JSON.stringify(userIds, null, 2));
}
const defaultMainMessage = `
Selamat Datang ke DEWARORA Online Casino Indonesia 🇮🇩

🎁 Welcome Bonus
✨✨Mega888 100% 🔥
✨✨120% Sports & Slot
💰Reload Bonus 10%
💰Spin Free iPhone 16 Pro Max
💰Refer Friend Free RM50

💬 Livechat: @abcmitro

💯𝗠𝗶𝗻𝗶𝗺𝗨𝗺 𝗗𝗲𝗽𝗼𝘀𝗶𝘁 $𝟑𝟎
💯𝗠𝗶𝗻𝗶𝗺𝗨𝗺 𝐖𝐢𝐭𝐡𝐝𝐫𝐚𝐰 $𝟓𝟎
✔️𝐒𝐚𝐟𝐞 ✔️𝐓𝐫𝐮𝐬𝐭𝐞𝐝 ✔️ 𝐑𝐞𝐥𝐢𝐚𝐛𝐥𝐞
`;
// Define the inline keyboard
const inlineKeyboard = new grammy_1.InlineKeyboard()
    .webApp("✅ Play Now ✅", "https://dewadora1.click/")
    .row()
    .url("🌐 Play on Browser", "https://dewadora1.click/")
    .row()
    .url("👩‍💻 Telegram Livechat", "https://t.me/abcmitro");
// Path to your local image
const imagePath = path_1.default.resolve(__dirname, 'main.jpg');
// Handle the "/start" command
bot.command('start', async (ctx) => {
    const user = ctx.from;
    const userId = user?.id;
    if (userId && !userIds.includes(userId)) {
        userIds.push(userId);
        saveUserIds();
    }
    if (!user)
        return ctx.reply("Failed to get user data.");
    try {
        await ctx.api.sendChatAction(ctx.chat.id, "typing");
    }
    catch (error) {
        console.error("Error sending chat action:", error);
    }
    await ctx.replyWithPhoto(new grammy_1.InputFile(imagePath), // Send the local image using InputFile
    {
        caption: defaultMainMessage,
        reply_markup: inlineKeyboard,
        parse_mode: "HTML",
    });
});
// Broadcast function
async function broadcastMessage(caption) {
    for (const userId of userIds) {
        try {
            await bot.api.sendPhoto(userId, new grammy_1.InputFile(imagePath), // Local image for broadcast
            {
                caption: caption,
                reply_markup: inlineKeyboard,
                parse_mode: "HTML",
            });
            console.log(`Message sent to user ${userId}`);
        }
        catch (error) {
            console.error(`Failed to send message to user ${userId}:`, error);
        }
    }
}
// Admin-only /broadcast command
const BOT_OWNER_ID = 6383488050; // Replace with your Telegram user ID
bot.command("broadcast", async (ctx) => {
    if (ctx.from?.id !== BOT_OWNER_ID) {
        return ctx.reply("You are not authorized to use this command.");
    }
    const message = ctx.message?.text?.split(" ").slice(1).join(" ") || defaultMainMessage;
    await broadcastMessage(message);
    await ctx.reply("Broadcast message sent!");
});
// Command to prompt the user to upload an image
bot.command('uploadimage', async (ctx) => {
    await ctx.reply("Please send me an image!");
});
// Listen for incoming photos from the user
bot.on('message:photo', async (ctx) => {
    try {
        // Get the largest version of the photo sent by the user
        const photo = ctx.message?.photo;
        if (!photo) {
            return ctx.reply("No photo found in the message.");
        }
        // Get the file ID of the largest photo (Telegram sends multiple sizes)
        const fileId = photo[photo.length - 1].file_id; // Largest size is usually the last in the array
        // Get the file object using the file ID
        const file = await bot.api.getFile(fileId);
        // Download the file (optional)
        const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;
        // Respond to the user (for example, send the same image back)
        await ctx.reply(`Received your image! You can download it from: ${fileUrl}`);
        // Optionally, you can download and save the file locally or process it as needed
        console.log(`File URL: ${fileUrl}`);
    }
    catch (error) {
        console.error("Failed to process image:", error);
        ctx.reply("Sorry, there was an issue processing your image.");
    }
});
// Start the bot
bot.start();
