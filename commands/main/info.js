const config = require('../../config');
const speed = require('performance-now');

module.exports = {
    name: 'info',
    category: 'main',
    description: 'Get detailed bot information.',
    async execute(sock, m, args) {
        // Reaction
        await sock.sendMessage(m.key.remoteJid, { react: { text: 'ℹ️', key: m.key } });

        // Speed Calculation (Latency)
        const start = speed();
        const end = speed();
        const latency = end - start;
        const totalCommands = global.commands.size;

        // Runtime Calculation
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        const runtimeText = `${hours}h ${minutes}m ${seconds}s`;

        // Information text construction
        const infoMsg = `*─── 『 BOT INFO 』 ───*

🤖 *Bot Name:* ${config.botName}
👑 *Owner:* ${config.ownerName}
📞 *Owner Number:* ${config.ownerNumbers[0]}
📱 *Paired Number:* ${config.pairedNumber}
🚀 *Speed:* ${latency.toFixed(4)} ms
⏳ *Runtime:* ${runtimeText}
📊 *Status:* Online
📊 *Total Commands:* ${totalCommands}
🌐 *Deploys:* 1

*────────────────────*
> *Powered by ${config.developerName}*`;

       // Image යවන කොට Header එකත් එක්කම යවන්න
        await sock.sendMessage(m.key.remoteJid, { 
            image: { url: config.botLogo }, 
            caption: infoMsg 
        }, { quoted: m });
    }
};