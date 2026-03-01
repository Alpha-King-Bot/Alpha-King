const config = require('../../config');

module.exports = {
    name: 'getid',
    category: 'main',
    description: 'Get the JID of the current chat or user.',
    async execute(sock, m, args) {
        // Logic to correctly identify the sender in both Private and Group chats
        const senderJid = m.key.fromMe 
            ? sock.user.id 
            : (m.key.participant || m.key.remoteJid);

        const ownerList = Array.isArray(config.ownerNumbers) ? config.ownerNumbers : [config.ownerNumbers];
        const adminList = Array.isArray(config.adminNumbers) ? config.adminNumbers : [config.adminNumbers];

        const isOwner = ownerList.some(num => senderJid.includes(num));
        const isAdmin = adminList.some(num => senderJid.includes(num));

        if (!isOwner && !isAdmin) {
            await sock.sendMessage(m.key.remoteJid, { react: { text: '❌', key: m.key } });
            return await sock.sendMessage(m.key.remoteJid, { 
                text: `*─── 『 ${config.botName.toUpperCase()} 』 ───*\n\n*Access Denied!* Only the Owner or Admins can use this command.` 
            }, { quoted: m });
        }

        // Success Reaction
        await sock.sendMessage(m.key.remoteJid, { react: { text: '🆔', key: m.key } });

        const chatID = m.key.remoteJid;

        // Constructing the message with Bot Name as Header
        let response = `*─── 『 ${config.botName.toUpperCase()} 』 ───*\n\n`;
        response += `📍 *Chat ID:* ${chatID}\n\n`;
        response += `> _Use this ID for your bot configuration._\n\n`;
        response += `*Powered by ${config.developerName}*`;

        await sock.sendMessage(m.key.remoteJid, { text: response }, { quoted: m });
    }
};