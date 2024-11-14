import { Bot, InlineKeyboard, InputFile } from "grammy";
import fs from 'fs';
import https from 'https'
import dotenv from "dotenv";
import path from 'path'; // Import path to handle file paths

dotenv.config();

console.log("bot token: ", process.env.TELEGRAM_BOT_TOKEN);
const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN!);

// Admin-only /broadcast command
// const BOT_OWNER_ID = 6383488050; // Replace with your Telegram user ID
const BOT_OWNER_ID = 1287022728; // Replace with your Telegram user ID

let broadcast_content: string = ""

let flag_testbroadcast: boolean = false
let flag_broadcastready: boolean = false

// Load existing user IDs from a file
let userIds: number[] = [];
try {
    userIds = JSON.parse(fs.readFileSync("user_ids.json", "utf-8"));
} catch (error) {
    console.log("Could not load user IDs, starting with an empty list.");
}

let uploadedImagePath: string = "";

// Define available bot commands
bot.api.setMyCommands([
    { command: 'start', description: 'Start interacting with the bot' },
    { command: 'broadcast', description: 'Send a broadcast message' },
    { command: 'testbroadcast', description: 'Send a test broadcast message' },
    { command: 'uploadimage', description: 'Upload an image' }
]);

// Function to save user IDs to a file
function saveUserIds() {
    fs.writeFileSync("user_ids.json", JSON.stringify(userIds, null, 2));
}

async function downloadImage(url: string, filepath: string) {
    return new Promise<void>((resolve, reject) => {
        https.get(url, (response) => {
            const fileStream = fs.createWriteStream(filepath);
            response.pipe(fileStream);

            fileStream.on('finish', () => {
                fileStream.close();
                resolve();
            });

            fileStream.on('error', (error) => {
                fs.unlink(filepath, () => {}); // Remove file if there’s an error
                reject(error);
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
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
const inlineKeyboard = new InlineKeyboard()
    .webApp("✅ Play Now ✅", "https://dewadora1.click/")
    .row()
    .url("🌐 Play on Browser", "https://dewadora1.click/")
    .row()
    .url("👩‍💻 Telegram Livechat", "https://t.me/abcmitro");

// Path to your local image
const imagePath = path.resolve(__dirname, 'main.jpg');



// You can also define any other commands based on your bot's functionality
// Broadcast function
async function broadcastMessage(caption: string) {
    const photo = uploadedImagePath ? new InputFile(uploadedImagePath) : new InputFile(imagePath);

    for (const userId of userIds) {
        try {
            await bot.api.sendPhoto(
                userId,
                photo, // Uses either URL or local file
                {
                    caption: caption,
                    reply_markup: inlineKeyboard,
                    parse_mode: "HTML",
                }
            );
            console.log(`Message sent to user ${userId}`);
        } catch (error) {
            console.error(`Failed to send message to user ${userId}:`, error);
        }
    }
}
// Test Broadcast function (will be sent to only bot owner)
async function testbroadcastMessage(caption: string) {
    const photo = uploadedImagePath ? new InputFile(uploadedImagePath) : new InputFile(imagePath);

    try {
        await bot.api.sendPhoto(
            BOT_OWNER_ID,
            photo, // Uses either URL or local file
            {
                caption: caption,
                reply_markup: inlineKeyboard,
                parse_mode: "HTML",
            }
        );
        console.log(`Message sent to user ${BOT_OWNER_ID}`);
    } catch (error) {
        console.error(`Failed to send message to user ${BOT_OWNER_ID}:`, error);
    }
}


// Handle the "/start" command
bot.command('start', async (ctx) => {
    const user = ctx.from;
    const userId = user?.id;
    console.log(user);
    

    if (userId && !userIds.includes(userId)) {
        userIds.push(userId);
        saveUserIds();
    }
    if (!user) return ctx.reply("Failed to get user data.");

    try {
        await ctx.api.sendChatAction(ctx.chat.id, "typing");
    } catch (error) {
        console.error("Error sending chat action:", error);
    }

    await ctx.replyWithPhoto(
        new InputFile(imagePath), // Send the local image using InputFile
        {
            caption: defaultMainMessage,
            reply_markup: inlineKeyboard,
            parse_mode: "HTML",
        }
    );
});



bot.command("broadcast", async (ctx) => {
    if (ctx.from?.id !== BOT_OWNER_ID) {
        return ctx.reply("You are not authorized to use this command.");
    }

    if (!flag_broadcastready) {
        return ctx.reply("Broadcast is not ready.");
    }
    const message = broadcast_content || defaultMainMessage;
    await broadcastMessage(message);
    await ctx.reply("Broadcast message sent!");

    flag_broadcastready = false
});

bot.command("testbroadcast", async (ctx) => {
    if (ctx.from?.id !== BOT_OWNER_ID) {
        return ctx.reply("You are not authorized to use this command.");
    }
    flag_testbroadcast = true
    ctx.reply("Please send the content to broadcast.");
});

// // Command to prompt the user to upload an image
// bot.command('uploadimage', async (ctx) => {
//     await ctx.reply("Please send me an image!");
// });

// Listen for incoming photos from the user
bot.on('message:photo', async (ctx) => {
    if (ctx.from?.id !== BOT_OWNER_ID) {
        return ctx.reply("You are not authorized to use this command.");
    }
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

        if (!fs.existsSync(path.resolve(__dirname, 'downloads'))) {
            fs.mkdirSync(path.resolve(__dirname, 'downloads'));
        }

        // Download the file (optional)
        const imageUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN!}/${file.file_path}`;
        // Define the local file path where the image will be saved
        uploadedImagePath = path.resolve(__dirname, `downloads/${fileId}.jpg`);

        // Download and save the image file locally
        await downloadImage(imageUrl, uploadedImagePath);

        
        
        // Respond to the user (for example, send the same image back)
        await ctx.reply(`Received your image! You can download it from: ${imageUrl}`);

        // Optionally, you can download and save the file locally or process it as needed
        console.log(`File URL: ${imageUrl}`);
    } catch (error) {
        console.error("Failed to process image:", error);
        ctx.reply("Sorry, there was an issue processing your image.");
    }
});

bot.on('message:text', async (ctx) => {
    if (!flag_testbroadcast) {
        return;
    }
    // ctx.reply("Please input the content to broadcast");
    broadcast_content = ctx.message.text
    await testbroadcastMessage(broadcast_content);

    flag_testbroadcast = false;
    flag_broadcastready = true;
});

// Start the bot
bot.start();
