const config = require("../../config");

module.exports = {
    name: "kick",
    aliases: ["remove"],
    category: "group",
    description: "Removes a member with safety checks and logs.",
    async execute(sock, m, args, pushName) {
        try {
            const remoteJid = m.key.remoteJid;
            if (!remoteJid.endsWith("@g.us")) return;

            // --- CONSOLE DEBUG SECTION ---
            const senderRaw = m.key.participant || m.key.remoteJid;
            const senderNumber = senderRaw.split("@")[0].replace(/[^0-9]/g, "");
            const target =
                m.message?.extendedTextMessage?.contextInfo?.participant ||
                m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

            console.log("--- COMMAND: KICK ---");
            console.log("User Name:", pushName);
            console.log("Sender Number:", senderNumber);
            console.log("Target JID:", target || "No target found");

            // --- OWNER/ADMIN CHECK ---
            const ownerList = Array.isArray(config.ownerNumbers)
                ? config.ownerNumbers
                : [config.ownerNumbers];
            const adminList = Array.isArray(config.adminNumbers)
                ? config.adminNumbers
                : [config.adminNumbers];

            const isOwner = ownerList.some(
                (num) => senderNumber === num.replace(/[^0-9]/g, ""),
            );
            const isAdmin = adminList.some(
                (num) => senderNumber === num.replace(/[^0-9]/g, ""),
            );

            if (!isOwner && !isAdmin) {
                console.log("Access Status: DENIED");
                await sock.sendMessage(remoteJid, {
                    react: { text: "❌", key: m.key },
                });
                return await sock.sendMessage(
                    remoteJid,
                    {
                        text: `*─── 『 ${config.botName.toUpperCase()} 』 ───*\n\n⚠️ *Access Denied!*\nOnly Owner or Admins can use this.`,
                    },
                    { quoted: m },
                );
            }
            console.log("Access Status: GRANTED");

            // --- EXECUTION ---
            if (!target)
                return await sock.sendMessage(
                    remoteJid,
                    { text: "❌ Please reply or tag someone!" },
                    { quoted: m },
                );

            await sock.sendMessage(remoteJid, {
                react: { text: "👢", key: m.key },
            });

            // Direct update (Catch handled if bot is not admin)
            await sock.groupParticipantsUpdate(remoteJid, [target], "remove");

            const kickMsg = `*─── 『 ${config.botName.toUpperCase()} KICKER 』 ───*

👋 *Hello ${pushName},*
Process completed.

╭───────────────────╼
│ 👤 *Target:* @${target.split("@")[0]}
│ ⚡ *Action:* Removed
╰───────────────────╼

> *Powered by ${config.developerName}*`;

            await sock.sendMessage(
                remoteJid,
                {
                    image: { url: config.botLogo },
                    caption: kickMsg,
                    mentions: [target],
                },
                { quoted: m },
            );
        } catch (e) {
            console.error("KICK ERROR:", e);
            await sock.sendMessage(
                m.key.remoteJid,
                { text: "❌ Error: මාව ඇඩ්මින් කරලා හිටපන් මචං!" },
                { quoted: m },
            );
        }
    },
};
