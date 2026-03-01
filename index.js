const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    fetchLatestBaileysVersion 
} = require('@whiskeysockets/baileys');
const P = require('pino');
const axios = require('axios');
const config = require('./config');
const fs = require('fs');
const path = require('path');
global.commands = new Map();

const express = require('express');
const app = express();
const port = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Alpha-King Bot is Running! 🚀');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Web Server started on port ${port}`);
});

// Loading Commands
const folders = fs.readdirSync('./commands');
for (const folder of folders) {
    const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`);
        global.commands.set(command.name, command);
    }
}

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('session');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: !config.pairedNumber, // Show QR if no is not available
        logger: P({ level: 'silent' })
    });

    // Get Pairing Code
    if (config.pairedNumber && !sock.authState.creds.registered) {
        setTimeout(async () => {
            let code = await sock.requestPairingCode(config.pairedNumber);
            console.log(`\n--- PAIRING CODE: ${code} ---\n`);
        }, 3000);
    }

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log('Bot is Online! ✅');
        }
    });

    // Msg control
    sock.ev.on('messages.upsert', async (chat) => {
        const m = chat.messages[0];

        const messageType = Object.keys(m.message || {})[0];
        const messageText = m.message?.conversation || m.message?.extendedTextMessage?.text || m.message?.imageMessage?.caption || m.message?.videoMessage?.caption || "";
        const sender = m.key.remoteJid;
        const isOwner = config.ownerNumbers.some(num => sender.includes(num));
        const pushName = m.pushName || 'User'; 

        // 1. Check status fom database
        let botStatus = "true";
        try {
            const response = await axios.get(config.botStatusUrl);
            // JSONbin පාවිච්චි කරන්නේ නම් response.data.record.status ලෙස වෙනස් විය හැක
            botStatus = response.data.status || response.data; 
        } catch (e) {
            console.error("Database Error:", e.message);
        }

        // 2. Status Lock එක පරීක්ෂා කිරීම
        const isTrue = String(botStatus).toLowerCase() === "true";

        // Command එකක්දැයි බැලීම (උදා: .ping)
        if (messageText.startsWith(config.prefix)) {
            
            // ස්ටේටස් එක False නම් සහ එවන්නා Owner නොවේ නම් වැඩ කරන්නේ නැත
            if (!isTrue && !isOwner) {
                return console.log("Bot is currently OFF. Command ignored.");
            }

        const args = messageText.trim().split(/ +/).slice(1) || [];
        const commandName = messageText.startsWith(config.prefix) 
            ? messageText.slice(config.prefix.length).trim().split(/ +/)[0].toLowerCase() 
            : null;

        // --- 1. Allowed Groups & Owner Check (වැදගත්ම කොටස) ---
        const isGroup = m.key.remoteJid.endsWith('@g.us');
        const isAllowedGroup = config.allowedGroups ? config.allowedGroups.includes(m.key.remoteJid) : false;

        // --- 2. Restriction Logic ---
        if (commandName && isGroup) {
            // Check if the command is NOT 'getid' AND the group is NOT in the allowed list
            if (commandName !== 'getid' && !isAllowedGroup) {
                console.log(`[BLOCKED] Command "${commandName}" restricted in this group.`);
                return; // මෙය ක්‍රියාත්මක වීම මෙතනින් නවතී
            }
        }
        
        

        if (commandName && commands.has(commandName)) {
            // Status Lock Check
            if (!isTrue && !isOwner) return;

            const command = commands.get(commandName);
            try {
                await command.execute(sock, m, args, pushName);
            } catch (error) {
                console.error(error);
                await sock.sendMessage(sender, { text: ' Sorry. System Error. Please contact owner' });
            }
        }

}});
}

startBot();