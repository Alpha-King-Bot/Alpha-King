const config = require('../../config');
const speed = require('performance-now');

module.exports = {
    name: 'ping',
    category: 'main',
    description: 'Check bot speed and status.',
    async execute(sock, m, args) {
        await sock.sendMessage(m.key.remoteJid, { react: { text: '⚡', key: m.key } });

        const start = speed();
        const end = speed();
        const latency = end - start;

        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        const runtimeText = `${hours}h ${minutes}m ${seconds}s`;

        // මෙතන අර 0 වැටුණ තැන හරි ගියා
        const totalCommands = global.commands.size; // මෙතන 0 අයින් කරා

        const pingMsg = `*─── 『 ${config.botName.toUpperCase()} 』 ───*

🚀 *Speed:* ${latency.toFixed(4)} ms
⏳ *Runtime:* ${runtimeText}
📊 *Total Commands:* ${totalCommands}

*────────────────────*
> *Powered by ${config.developerName}*`;

        // Image යවන කොට Header එකත් එක්කම යවන්න
        await sock.sendMessage(m.key.remoteJid, { 
            image: { url: config.botLogo }, 
            caption: pingMsg 
        }, { quoted: m });
    }
};