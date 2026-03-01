const config = require("../../config");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const { Sticker, StickerTypes } = require("wa-sticker-formatter");

module.exports = {
    // 3. Prefix එක config එකෙන් ගන්නේ මෙතනින් (Menu එකේ පෙන්නන්න)
    name: "s",
    aliases: ["sticker"], // 2. aliases වල 's' තියෙන නිසා command handler එකේ දෙකම වැඩ කරන්න ඕනේ
    category: "converter",
    description: "Converts image/video to sticker.",
    async execute(sock, m, args, pushName) {
        try {
            const remoteJid = m.key.remoteJid;
            const quoted =
                m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const targetMsg =
                m.message?.imageMessage ||
                m.message?.videoMessage ||
                quoted?.imageMessage ||
                quoted?.videoMessage;

            // 1. Pro Messages (Formatted with emojis and ~~)
            if (!targetMsg) {
                return await sock.sendMessage(
                    remoteJid,
                    {
                        text: `Please Reply to an image/video with *${config.prefix}sticker*`,
                    },
                    { quoted: m },
                );
            }

            if ((targetMsg.seconds || 0) > 10) {
                return await sock.sendMessage(
                    remoteJid,
                    {
                        text: `Video duration must be less than 10 seconds!`,
                    },
                    { quoted: m },
                );
            }

            // Reaction
            await sock.sendMessage(remoteJid, {
                react: { text: "⏳", key: m.key },
            });

            // 1. Pro "Processing" message
            const waitMsg = await sock.sendMessage(
                remoteJid,
                {
                    text: `⌛ *Processing* your sticker... Please wait, ${pushName}!`,
                },
                { quoted: m },
            );

            // Download media
            const stream = await downloadContentFromMessage(
                targetMsg,
                targetMsg.seconds ? "video" : "image",
            );
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            // Create Sticker
            const sticker = new Sticker(buffer, {
                pack: config.botName,
                author: config.ownerName,
                type: StickerTypes.FULL,
                quality: 70,
            });

            const stickerBuffer = await sticker.toBuffer();

            // Delete "Processing" message
            await sock.sendMessage(remoteJid, { delete: waitMsg.key });

            // Send Sticker
            await sock.sendMessage(
                remoteJid,
                { sticker: stickerBuffer },
                { quoted: m },
            );

            // Reaction
            await sock.sendMessage(remoteJid, {
                react: { text: "✅", key: m.key },
            });
        } catch (e) {
            console.error(e);
            await sock.sendMessage(
                m.key.remoteJid,
                {
                    text: `Failed to create the sticker. Try again.`,
                },
                { quoted: m },
            );
        }
    },
};
