const config = require("../../config");

module.exports = {
    name: "add",
    aliases: ["invite"],
    category: "group",
    description: "Adds a member to the group.",
    async execute(sock, m, args, pushName) {
        try {
            const remoteJid = m.key.remoteJid;
            if (!remoteJid.endsWith("@g.us")) return;

            // 1. නම්බරේ පිරිසිදු කරමු
            let input = args[0]?.replace(/[^0-9]/g, "");
            if (!input)
                return await sock.sendMessage(
                    remoteJid,
                    { text: "❌ Please provide a phone number!" },
                    { quoted: m },
                );

            // නම්බර් එක 07... වලින් පටන් ගත්තොත් ඒක 94... කරමු
            let formattedNum = input;
            if (input.startsWith("0")) {
                formattedNum = "94" + input.substring(1);
            } else if (!input.startsWith("94") && input.length < 11) {
                formattedNum = "94" + input;
            }

            const targetJid = formattedNum + "@s.whatsapp.net";

            // 2. Reaction එක (Wait එකක් එක්ක)
            await sock.sendMessage(remoteJid, {
                react: { text: "➕", key: m.key },
            });

            // 3. ඇඩ් කිරීම
            await sock.groupParticipantsUpdate(remoteJid, [targetJid], "add");

            // 4. ලස්සන මැසේජ් එක (Alive style)
            const addMsg = `*─── 『 ${config.botName.toUpperCase()} ADDER 』 ───*

👋 *Hello ${pushName},*
Process completed for the requested number.

╭───────────────────╼
│ 👤 *Target:* +${formattedNum}
│ ⚡ *Status:* Added
│ 🛠️ *Requested by:* ${pushName}
╰───────────────────╼

> *Powered by ${config.developerName}*`;

            await sock.sendMessage(
                remoteJid,
                {
                    image: { url: config.botLogo },
                    caption: addMsg,
                },
                { quoted: m },
            );
        } catch (e) {
            console.error(e);
            await sock.sendMessage(
                m.key.remoteJid,
                {
                    text: "❌ Error: Could not add the member. Make sure the number is correct and I am Admin.",
                },
                { quoted: m },
            );
        }
    },
};
