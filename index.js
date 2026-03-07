const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
} = require("@whiskeysockets/baileys");
const P = require("pino");
const mongoose = require("mongoose");
const config = require("./config");
const fs = require("fs");
const path = require("path");

global.commands = new Map();

// --- WEB SERVER FOR KEEP ALIVE ---
const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const keepAlive = require("./server");
keepAlive();

app.get("/", (req, res) => {
    res.send("Alpha-King Bot is Running! 🚀");
});

app.listen(port, "0.0.0.0", () => {
    console.log(`Web Server started on port ${port}`);
});

// --- 1. MONGODB CONNECTION & SCHEMA ---
//
mongoose
    .connect(config.botStatusUrl)
    .then(() => console.log("Connected to MongoDB Database! 📂"))
    .catch((err) => console.error("MongoDB Connection Error:", err.message));

const StatusSchema = new mongoose.Schema({
    id: { type: String, default: "bot_status" },
    isActive: { type: Boolean, default: true },
});
const StatusModel = mongoose.model("Status", StatusSchema);

// --- 1. MONGODB Cha History & SCHEMA ---
//
const ChatSchema = new mongoose.Schema({
    sender: String,
    pushName: String,
    message: String,
    timestamp: { type: Date, default: Date.now },
    isGroup: Boolean,
    groupName: { type: String, default: "Private Chat" },
});
const ChatModel = mongoose.model("ChatHistory", ChatSchema);

// --- LOADING COMMANDS ---
const folders = fs.readdirSync("./commands");
for (const folder of folders) {
    const commandFiles = fs
        .readdirSync(`./commands/${folder}`)
        .filter((file) => file.endsWith(".js"));
    for (const file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`);
        global.commands.set(command.name, command);
    }
}

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState("session");
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: !config.pairedNumber,
        logger: P({ level: "silent" }),
    });

    if (config.pairedNumber && !sock.authState.creds.registered) {
        setTimeout(async () => {
            let code = await sock.requestPairingCode(config.pairedNumber);
            console.log(`\n--- PAIRING CODE: ${code} ---\n`);
        }, 3000);
    }

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            const shouldReconnect =
                lastDisconnect.error?.output?.statusCode !==
                DisconnectReason.loggedOut;
            if (shouldReconnect) startBot();
        } else if (connection === "open") {
            console.log("Bot is Online! ✅");
        }
    });

    // --- MESSAGE HANDLING ---
    sock.ev.on("messages.upsert", async (chat) => {
        const m = chat.messages[0];
        if (!m.message) return;

        const messageText =
            m.message?.conversation ||
            m.message?.extendedTextMessage?.text ||
            m.message?.imageMessage?.caption ||
            m.message?.videoMessage?.caption ||
            "";
        const sender = m.key.remoteJid;

        // --- CHAT HISTORY LOGGER ---
        //
        const isGroup = sender.endsWith("@g.us");
        let groupMetadata = null;

        if (isGroup) {
            try {
                groupMetadata = await sock.groupMetadata(sender);
            } catch (e) {
                console.log("Error fetching group metadata");
            }
        }

        // Sender Number Extraction (LID Safe)
        const senderNumber = (m.key.participant || m.key.remoteJid)
            .split("@")[0]
            .replace(/[^0-9]/g, "");
        const isOwner = config.ownerNumbers.some(
            (num) => senderNumber === num.replace(/[^0-9]/g, ""),
        );
        const pushName = m.pushName || "User";

        // ඩේටාබේස් එකට සේව් කිරීම
        await ChatModel.create({
            sender: senderNumber,
            pushName: pushName,
            message: messageText || "[Media/Other]",
            isGroup: isGroup,
            groupName: isGroup ? groupMetadata?.subject : "Private Chat",
        });

        console.log(`[DB LOG] Message saved from ${pushName}`);

        // Command Recognition
        if (messageText.startsWith(config.prefix)) {
            const args = messageText.trim().split(/ +/).slice(1);
            const commandName = messageText
                .slice(config.prefix.length)
                .trim()
                .split(/ +/)[0]
                .toLowerCase();

            // 1. Fetch Bot Status from DB
            let dbStatus = await StatusModel.findOne({
                id: "bot_status",
            }).lean(); // .lean() දැම්මම වේගවත් වෙනවා
            if (!dbStatus) {
                dbStatus = await StatusModel.create({
                    id: "bot_status",
                    isActive: true,
                });
            }

            const isBotActive =
                dbStatus.isActive === true || dbStatus.isActive === "true";

            // --- CONSOLE DEBUG SECTION ---
            console.log("--- DATABASE SYNC ---");
            console.log(
                `Raw Value from DB: ${dbStatus.isActive} (${typeof dbStatus.isActive})`,
            );
            console.log(`Final Boolean Status: ${isBotActive}`);

            // 2. White-list (Commands allowed even when OFF)
            const whiteList = ["alive", "getid", "botstatus"];

            // 3. MAIN BLOCKING LOGIC
            //
            if (!isBotActive && !whiteList.includes(commandName) && !isOwner) {
                console.log(
                    `[STATUS: BLOCKED] Command "${commandName}" ignored because Bot is OFF.`,
                );
                return; // මෙය ක්‍රියාත්මක වීම මෙතනින් නවතී
            }

            // 4. Group Restrictions
            const isGroup = sender.endsWith("@g.us");
            const isAllowedGroup = config.allowedGroups
                ? config.allowedGroups.includes(sender)
                : false;

            if (
                isGroup &&
                commandName !== "getid" &&
                !isAllowedGroup &&
                !isOwner
            ) {
                console.log(
                    `[STATUS: RESTRICTED] Group not in allowed list: ${sender}`,
                );
                return;
            }

            // 5. Execute Command
            if (commands.has(commandName)) {
                const command = commands.get(commandName);
                try {
                    console.log(
                        `[STATUS: PROCEED] Executing command: ${commandName}`,
                    );
                    await command.execute(sock, m, args, pushName);
                } catch (error) {
                    console.error("EXECUTION ERROR:", error);
                    await sock.sendMessage(
                        sender,
                        { text: "❌ System Error. Contact Owner." },
                        { quoted: m },
                    );
                }
            } else {
                console.log(
                    `[STATUS: NOT FOUND] Command "${commandName}" does not exist.`,
                );
            }
        }
    });
}

startBot();
