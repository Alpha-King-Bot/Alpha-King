const config = require('../../config');

module.exports = {
    name: 'alive',
    category: 'main',
    description: 'බොට් වැඩදැයි පරීක්ෂා කරයි.',
    async execute(sock, m, args, pushName) {
        // 1. Reaction
        await sock.sendMessage(m.key.remoteJid, { 
            react: { text: '💤', key: m.key } 
        });

        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        

        const aliveMsg = 
        
        // Massege

        `*─── 『 ${config.botName.toUpperCase()} 』 ───*

👋 *Hello ${pushName},*

I'm *${config.botName}* & alive at now! 

╭───────────────────╼
│ ⚡ *Status:* Online
│ ⏰ *Uptime:* ${hours}h ${minutes}m ${seconds}s
│ 🛠️ *Developer:* ${config.developerName}
│ 🕹️ *Prefix:* [ ${config.prefix} ]
╰───────────────────╼

 📝 _Type *${config.prefix}menu* to see all commands._

 *────────────────────*
> *Powered by ${config.developerName}*`;

       // Image යවන කොට Header එකත් එක්කම යවන්න
        await sock.sendMessage(m.key.remoteJid, { 
            image: { url: config.botLogo }, 
            caption: aliveMsg 
        }, { quoted: m });
    }
};