const config = require("../../config");

module.exports = {
    name: "getdp",
    aliases: ["getprofile", "dp"],
    category: "tools",
    description: "Get profile picture of a user.",
    async execute(sock, m, args, pushName) {
        try {
            const remoteJid = m.key.remoteJid;

            // 1. Sender ව නිවැරදිවම හඳුනාගැනීම
            let sender = m.key.fromMe
                ? sock.user.id.split(":")[0] + "@s.whatsapp.net"
                : m.key.participant || m.key.remoteJid;

            const senderNumber = sender.split("@")[0];

            // 2. Owner Lock
            if (!config.ownerNumbers.includes(senderNumber)) {
                return await sock.sendMessage(
                    remoteJid,
                    {
                        text: `❌ *Access Denied:* Only the bot owner can use this command.`,
                    },
                    { quoted: m },
                );
            }

            // 3. Target JID එක තෝරා ගැනීම
            let targetJid = remoteJid;
            const quoted = m.message?.extendedTextMessage?.contextInfo;

            if (quoted?.mentionedJid?.[0]) {
                targetJid = quoted.mentionedJid[0];
            } else if (quoted?.participant) {
                targetJid = quoted.participant;
            }

            await sock.sendMessage(remoteJid, {
                react: { text: "🔍", key: m.key },
            });

            // 4. DP එක Fetch කිරීම
            let ppUrl;
            try {
                ppUrl = await sock.profilePictureUrl(targetJid, "image");
            } catch (e) {
                return await sock.sendMessage(
                    remoteJid,
                    {
                        text: `❌ *Error:* Profile picture is not available or it is private.`,
                    },
                    { quoted: m },
                );
            }

            await sock.sendMessage(
                remoteJid,
                {
                    image: { url: ppUrl },
                    caption: `✅ Succesfully get the *Profile Picture* of ${pushname}`,
                    mentions: [targetJid],
                },
                { quoted: m },
            );
        } catch (e) {
            console.error(e);
            await sock.sendMessage(
                m.key.remoteJid,
                {
                    text: `~~❌ *Error:* Processing failed.~~`,
                },
                { quoted: m },
            );
        }
    },
};
