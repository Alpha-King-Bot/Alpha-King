const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const config = require("../../config");

module.exports = {
    name: "vv",
    aliases: ["viewonce", "retrive"],
    category: "group",
    description: "Downloads and resends View Once media.",
    async execute(sock, m, args, pushName) {
        try {
            await sock.sendMessage(m.key.remoteJid, {
                react: { text: "🔓", key: m.key },
            });

            // 1. Quoted Message එක හරියටම ගමු
            const quoted =
                m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quoted)
                return await sock.sendMessage(
                    m.key.remoteJid,
                    { text: "❌ Please reply to a View Once message." },
                    { quoted: m },
                );

            // 2. View Once එක තියෙන තැන හරියටම Filter කරමු (V2 හෝ සාමාන්‍ය එක)
            const viewOnce =
                quoted.viewOnceMessageV2 || quoted.viewOnceMessage || quoted;

            // මැසේජ් එක ඇතුළේ තියෙන ඇත්තම media content එක බලමු
            const actualMessage = viewOnce.message || viewOnce;
            const messageType = Object.keys(actualMessage)[0];

            // මෙතනදී check කරනවා මේක ඇත්තටම image හෝ video message එකක්ද කියලා
            if (!["imageMessage", "videoMessage"].includes(messageType)) {
                return await sock.sendMessage(
                    m.key.remoteJid,
                    { text: "❌ This is not a View Once message." },
                    { quoted: m },
                );
            }

            const mediaMessage = actualMessage[messageType];

            // 3. Media Download
            const stream = await downloadContentFromMessage(
                mediaMessage,
                messageType.replace("Message", ""),
            );
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            // 4. Caption එක (උඹේ alive format එකටම)
            const vvCaption = `*─── 『 ${config.botName.toUpperCase()} VV-RETRIEVER 』 ───*

👋 *Hello ${pushName},*
I found your hidden media!

╭───────────────────╼
│ ⚡ *Type:* ${messageType.replace("Message", "").toUpperCase()}
│ 📝 *Caption:* ${mediaMessage.caption || "No caption"}
│ 🛠️ *Retrieved by:* ${config.botName}
╰───────────────────╼

> *Powered by ${config.developerName}*`;

            // 5. Send Media
            if (messageType === "imageMessage") {
                await sock.sendMessage(
                    m.key.remoteJid,
                    { image: buffer, caption: vvCaption },
                    { quoted: m },
                );
            } else if (messageType === "videoMessage") {
                await sock.sendMessage(
                    m.key.remoteJid,
                    { video: buffer, caption: vvCaption },
                    { quoted: m },
                );
            }
        } catch (e) {
            console.error(e);
            await sock.sendMessage(
                m.key.remoteJid,
                { text: "❌ Error: Could not retrieve media." },
                { quoted: m },
            );
        }
    },
};
