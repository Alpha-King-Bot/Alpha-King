const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const config = require("../../config");

module.exports = {
    name: "save",
    aliases: ["status", "get"],
    category: "main",
    description: "Saves the quoted status to your chat.",
    async execute(sock, m, args, pushName) {
        try {
            // 1. Reaction එකක් දාමු
            await sock.sendMessage(m.key.remoteJid, {
                react: { text: "📥", key: m.key },
            });

            // 2. Status එකකට Reply කරලද බලමු
            const quoted =
                m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            if (!quoted)
                return await sock.sendMessage(
                    m.key.remoteJid,
                    { text: "❌ Please reply to a Status." },
                    { quoted: m },
                );

            // 3. Media Type එක අඳුරගනිමු
            const messageType = Object.keys(quoted)[0];

            if (!["imageMessage", "videoMessage"].includes(messageType)) {
                return await sock.sendMessage(
                    m.key.remoteJid,
                    { text: "❌ This is not a valid status media." },
                    { quoted: m },
                );
            }

            const mediaMessage = quoted[messageType];

            // 4. Status එක Download කරගමු
            const stream = await downloadContentFromMessage(
                mediaMessage,
                messageType.replace("Message", ""),
            );
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            // 5. Alive format එකටම ලස්සන Caption එකක් හදමු
            const saveCaption = `*─── 『 ${config.botName.toUpperCase()} STATUS-SAVER 』 ───*

👋 *Hello ${pushName},*
I've saved this status for you!

╭───────────────────╼
│ ⚡ *Type:* ${messageType.replace("Message", "").toUpperCase()}
│ 📝 *Caption:* ${mediaMessage.caption || "No caption"}
│ 🛠️ *Saved by:* ${config.botName}
╰───────────────────╼

> *Powered by ${config.developerName}*`;

            // 6. Media එක සේව් කරලා එවමු
            if (messageType === "imageMessage") {
                await sock.sendMessage(
                    m.key.remoteJid,
                    { image: buffer, caption: saveCaption },
                    { quoted: m },
                );
            } else if (messageType === "videoMessage") {
                await sock.sendMessage(
                    m.key.remoteJid,
                    { video: buffer, caption: saveCaption },
                    { quoted: m },
                );
            }
        } catch (e) {
            console.error(e);
            await sock.sendMessage(
                m.key.remoteJid,
                { text: "❌ Error: Could not save status." },
                { quoted: m },
            );
        }
    },
};
