const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');
const config = require('../../config');

module.exports = {
    name: 'sticker',
    alias: ['s'],
    category: 'converter',
    description: 'Convert image or video to sticker',
    async execute(sock, m, args) {
        const remoteJid = m.key.remoteJid;

        try {
            // පින්තූරය හෝ වීඩියෝව තියෙන්නේ කොහේද කියලා බලනවා (Direct or Quoted)
            const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const targetMsg = m.message?.imageMessage || m.message?.videoMessage || quoted?.imageMessage || quoted?.videoMessage;

            if (!targetMsg) {
                return await sock.sendMessage(remoteJid, { text: "Anu, පින්තූරයකට හෝ වීඩියෝවකට රිප්ලයි කරන්න. නැත්නම් කැප්ෂන් එකේ .sticker කියලා දාන්න." }, { quoted: m });
            }

            // තත්පර 10 සීමාව චෙක් කරනවා
            if ((targetMsg.seconds || 0) > 10) {
                return await sock.sendMessage(remoteJid, { text: "වීඩියෝ එක තත්පර 10කට වඩා වැඩියි Anu!" }, { quoted: m });
            }

            // 1. React with loading
            await sock.sendMessage(remoteJid, { react: { text: "⏳", key: m.key } });

            // 2. Wait message
            const waitMsg = await sock.sendMessage(remoteJid, { text: "_Alpha King ස්ටිකරය නිර්මාණය කරමින් පවතී... කරුණාකර රැඳී සිටින්න._ 🎨" }, { quoted: m });

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
            await sock.sendMessage(remoteJid, { text: "අයියෝ! ස්ටිකර් එක හදන්න බැරි වුණා. ආයෙත් උත්සාහ කරන්න." }, { quoted: m });
        }
    }
};