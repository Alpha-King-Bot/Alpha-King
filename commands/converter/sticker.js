const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const config = require('../../config');

module.exports = {
    name: 'sticker',
    alias: ['s'],
    category: 'converter',
    description: 'Convert image or video to sticker',
    async execute(sock, m, args, pushName) {
        const remoteJid = m.key.remoteJid;

        try {
            // පින්තූරය හෝ වීඩියෝව තියෙන්නේ කොහේද කියලා බලනවා (Direct or Quoted)
            const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const targetMsg = m.message?.imageMessage || m.message?.videoMessage || quoted?.imageMessage || quoted?.videoMessage;

            if (!targetMsg) {
                return await sock.sendMessage(remoteJid, { text: "${pushName}, Please reply to a image or video. Or type ${config.prefix}sticker / ${config.prefix}s as caption." }, { quoted: m });
            }

            // තත්පර 10 සීමාව චෙක් කරනවා
            if ((targetMsg.seconds || 0) > 10) {
                return await sock.sendMessage(remoteJid, { text: "${pushName} the video is longer than 10 seconds!!! Please send a video under 10 seconds." }, { quoted: m });
            }

            // 1. React with loading
            await sock.sendMessage(remoteJid, { react: { text: "⏳", key: m.key } });

            // 2. Wait message
            const waitMsg = await sock.sendMessage(remoteJid, { text: "_The sticker is processing. Please wait..._ 🎨" }, { quoted: m });

            // 3. Media එක Download කරගන්නවා
            const stream = await downloadContentFromMessage(targetMsg, targetMsg.seconds ? 'video' : 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            // 4. ස්ටිකරය Format කරනවා
            const sticker = new Sticker(buffer, {
                pack: config.botName || 'Alpha King',
                author: config.ownerName || 'Anu',
                type: StickerTypes.FULL,
                quality: 70
            });

            const stickerBuffer = await sticker.toBuffer();

            // 5. Processing මැසේජ් එක අයින් කරනවා
            await sock.sendMessage(remoteJid, { delete: waitMsg.key });

            // 6. ස්ටිකරය යවනවා
            await sock.sendMessage(remoteJid, { sticker: stickerBuffer }, { quoted: m });
            
            // 7. Success React
            await sock.sendMessage(remoteJid, { react: { text: "✅", key: m.key } });

        } catch (e) {
            console.error("Sticker Error:", e);
            await sock.sendMessage(remoteJid, { text: "Ops... Failed to creat sticker. Please try again." }, { quoted: m });
        }
    }
};