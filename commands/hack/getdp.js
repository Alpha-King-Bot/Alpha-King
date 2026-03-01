const config = require("../../config");

module.exports = {
    name: "getdp",
    aliases: ["getprofile", "dp"],
    category: "tools",
    description: "Get profile picture of a user.",
    async execute(sock, m, args, pushName) {
        try {
            const remoteJid = m.key.remoteJid;
            let targetJid = remoteJid; // Default: Current chat

            // Check if sender is owner
            if (!config.ownerNumbers.includes(m.key.remoteJid.split("@")[0])) {
                return await sock.sendMessage(
                    m.key.remoteJid,
                    {
                        text: "❌ *Access Denied:* Only the bot owner can use this command.",
                    },
                    { quoted: m },
                );
            }

            // 1. Check if a user is tagged or quoted
            if (
                m.message.extendedTextMessage?.contextInfo?.mentionedJid
                    ?.length > 0
            ) {
                targetJid =
                    m.message.extendedTextMessage.contextInfo.mentionedJid[0];
            } else if (
                m.message.extendedTextMessage?.contextInfo?.participant
            ) {
                targetJid =
                    m.message.extendedTextMessage.contextInfo.participant;
            }

            // Reaction
            await sock.sendMessage(remoteJid, {
                react: { text: "🔍", key: m.key },
            });

            // 2. Fetch Profile Picture URL
            let ppUrl;
            try {
                ppUrl = await sock.profilePictureUrl(targetJid, "image");
            } catch (e) {
                // If no profile picture or error
                return await sock.sendMessage(
                    remoteJid,
                    {
                        text: `❌ *Error:* Could not fetch profile picture. It might be private.`,
                    },
                    { quoted: m },
                );
            }

            // 3. Send the Profile Picture
            await sock.sendMessage(
                remoteJid,
                {
                    image: { url: ppUrl },
                    caption: `✅ *Profile Picture* for @${targetJid.split("@")[0]}`,
                    mentions: [targetJid], // Tag the user
                },
                { quoted: m },
            );
        } catch (e) {
            console.error(e);
            await sock.sendMessage(
                m.key.remoteJid,
                {
                    text: `❌ *Error:* Failed to get profile picture.`,
                },
                { quoted: m },
            );
        }
    },
};
