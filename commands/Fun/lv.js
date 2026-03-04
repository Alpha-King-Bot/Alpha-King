const config = require("../../config");

module.exports = {
    name: "lv",
    aliases: ["love", "lovecalc"],
    category: "fun",
    description: "Calculate love percentage between two names.",
    async execute(sock, m, args, pushName) {
        try {
            const remoteJid = m.key.remoteJid;

            // 1. input එක ගන්න (.lv Name1 & Name2 හෝ .lv Name1 + Name2)
            const fullText = args.join(" ");
            if (
                !fullText ||
                (!fullText.includes("&") && !fullText.includes("+"))
            ) {
                return await sock.sendMessage(
                    remoteJid,
                    {
                        text: `⚠️ Please Type *${config.prefix}lv Name1 & Name2*`,
                    },
                    { quoted: m },
                );
            }

            // නම් දෙක වෙන් කරගැනීම
            const names = fullText.split(/[& +]+/).map((n) => n.trim());
            const name1 = names[0];
            const name2 = names[1];

            if (!name1 || !name2) {
                return await sock.sendMessage(
                    remoteJid,
                    { text: "Please enter two names to calculate!!" },
                    { quoted: m },
                );
            }

            // 2. පාවිච්චි කරන්න බැරි නම් ලැයිස්තුව (Blacklist)
            // මේ නම් තිබුනොත් බොට් බනිනවා
            const blacklisted = ["sayuru", "Sayuru", "anuhas", "Anuhas",'Munasinghe','munasinghe']; // ඔයාට කැමති නම් මෙතනට දාන්න

            const isBlacklisted = blacklisted.some(
                (b) =>
                    name1.toLowerCase().includes(b) ||
                    name2.toLowerCase().includes(b),
            );

            if (isBlacklisted) {
                return await sock.sendMessage(
                    remoteJid,
                    {
                        text: `🚫 *Access Denied:* These names are not allowed for calculation! Please use your name. If you need to use this name please contact owner...`,
                    },
                    { quoted: m },
                );
            }

            // 3. Love Calculation Logic (Random based on names)
            // නම් දෙකේ අකුරු වල අගය අනුව එකම ප්‍රතිඵලය එන්න හදමු
            const combinedNames = (name1 + name2)
                .toLowerCase()
                .split("")
                .sort()
                .join("");
            let hash = 0;
            for (let i = 0; i < combinedNames.length; i++) {
                hash = combinedNames.charCodeAt(i) + ((hash << 5) - hash);
            }
            const percentage = Math.abs(hash % 101); // 0 - 100 අතර අගයක්

            // 4. Result Message construction
            let status = "";
            let emoji = "";

            if (percentage >= 80) {
                status = "True Love! ❤️";
                emoji = "💖";
            } else if (percentage >= 60) {
                status = "Good Match! 😊";
                emoji = "🧡";
            } else if (percentage >= 40) {
                status = "Average Couple. 😐";
                emoji = "💛";
            } else {
                status = "Not a good match. 💔";
                emoji = "🖤";
            }

            await sock.sendMessage(remoteJid, {
                react: { text: emoji, key: m.key },
            });

            const resultMsg = `*─── 『 ${config.botName} LOVE CALCULATOR 』 ───*

👩‍❤️‍👨 *Names:* ${name1} & ${name2}
📈 *Percentage:* ${percentage}%
✨ *Status:* ${status}

*────────────────────*
> *Powered by ${config.botName}*`;

            await sock.sendMessage(
                remoteJid,
                { text: `${resultMsg}` },
                { quoted: m },
            );
        } catch (e) {
            console.error(e);
            await sock.sendMessage(
                m.key.remoteJid,
                { text: "❌ *Error:* Calculation failed." },
                { quoted: m },
            );
        }
    },
};
