const { removeBackgroundFromImageBase64 } = require("remove.bg");
const { downloadContentFromMessage } = require("@whiskeysockets/baileys");
const config = require("../../config");

module.exports = {
    name: "rbg",
    aliases: ["removebg", "nobg"],
    category: "tools",
    description: "Remove the background of an image.",
    async execute(sock, m, args, pushName) {
        try {
            const remoteJid = m.key.remoteJid;

            // 1. Image එකක්ද කියලා බලමු (Direct image හෝ Quoted image)
            const quoted =
                m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            const isImage = m.message?.imageMessage || quoted?.imageMessage;

            if (!isImage) {
                return await sock.sendMessage(
                    remoteJid,
                    {
                        text: `🖼️ Hellow ${pushName}, reply to a image or use the command with an image to remove the background...`,
                    },
                    { quoted: m },
                );
            }

            // 2. API Key එක තියෙනවද බලමු
            if (
                !config.removeBgApiKey ||
                config.removeBgApiKey === "YOUR_API_KEY"
            ) {
                return await sock.sendMessage(
                    remoteJid,
                    {
                        text: `❌ *Error:* Error code 001 Please Contact Owner...`, //Error code 001 = No Remobe.bg api key
                    },
                    { quoted: m },
                );
            }

            await sock.sendMessage(remoteJid, {
                react: { text: "✂️", key: m.key },
            });
            const waitMsg = await sock.sendMessage(
                remoteJid,
                {
                    text: `_Removing the background of the image... Please wait._`,
                },
                { quoted: m },
            );

            // 3. Image එක Download කරගමු
            const stream = await downloadContentFromMessage(isImage, "image");
            let buffer = Buffer.from([]);
            for await (const chunk of stream) {
                buffer = Buffer.concat([buffer, chunk]);
            }

            // 4. Remove.bg API එකට යවමු
            const result = await removeBackgroundFromImageBase64({
                base64img: buffer.toString("base64"),
                apiKey: config.removeBgApiKey,
                size: "auto",
                type: "auto",
            });

            const resultBuffer = Buffer.from(result.base64img, "base64");

            // 5. ප්‍රතිඵලය යවමු
            await sock.sendMessage(remoteJid, { delete: waitMsg.key });
            await sock.sendMessage(
                remoteJid,
                {
                    image: resultBuffer,
                    caption: `✅ *Background Removed*\n\n> *Requested by:* ${pushName}\n> *Bot:* ${config.botName}`,
                },
                { quoted: m },
            );

            await sock.sendMessage(remoteJid, {
                react: { text: "✅", key: m.key },
            });
        } catch (e) {
            console.error("RemoveBG Error:", e);
            await sock.sendMessage(
                m.key.remoteJid,
                {
                    text: `❌ Error Pleae Contact Owner...`,
                },
                { quoted: m },
            );
        }
    },
};
