const config = require("../../config");

module.exports = {
    name: "menu",
    category: "main",
    description: "Show the bot command menu.",
    async execute(sock, m, args) {
        // 1. React to the message
        await sock.sendMessage(m.key.remoteJid, {
            react: { text: "📜", key: m.key },
        });

        // 2. Setup the Header and Content using Config variables
        const botHeader = `*─── 『 ${config.botName.toUpperCase()} 』 ───*`;

        let menuBody = `
👋 *Hello, ${m.pushName || "User"}!*

🤖 *Bot:* ${config.botName}
👨 *Owner:* ${config.developerName}
📌 *Prefix:* [ ${config.prefix} ]

*─── 『 COMMAND LIST 』 ───*

*🏠 MAIN COMMANDS*
│ ❯ *${config.prefix}alive* - Chech Bot Alive
│ ❯ *${config.prefix}menu* - Get This List
│ ❯ *${config.prefix}ping* - Check Bot Speed
│ ❯ *${config.prefix}getid* - Get Group / Chat ID
│ ❯ *${config.prefix}info* - Get Bot Info
│ ❯ *${config.prefix}coucmd* - Count Commands (Coming Soon)

*✨ AI COMMANDS*
│ ❯ *${config.prefix}ai* Chat With AI (Coming Soon)
│ ❯ *${config.prefix}img* Generate Image (Coming Soon)
│ ❯ *${config.prefix}ttv* Text To AI Voice (Coming Soon)

*🔡 CONVERTER COMMANDS*
│ ❯ *${config.prefix}sticker / ${config.prefix}s* Image / Video To Sticker
│ ❯ *${config.prefix}gif* Video To Gif (Coming Soon)
│ ❯ *${config.prefix}tourl* Get A Url (Coming Soon)
│ ❯ *${config.prefix}toemogi* Image To Emoji (Coming Soon)
│ ❯ *${config.prefix}translate* Translator (Coming Soon)
│ ❯ *${config.prefix}toqr* Get A QR (Coming Soon)

*🌆 MEDIA COMMANDS*
│ ❯ *${config.prefix}removebg / ${config.prefix}rbg* Remove Background (Coming Soon)
│ ❯ *${config.prefix}stext* Stylish Text (Coming Soon)

*🎭 HACK COMMANDS*
│ ❯ *${config.prefix}save* Save Status (Coming Soon)
│ ❯ *${config.prefix}getdp* Get Profile Pictue
│ ❯ *${config.prefix}vv* See View Once Document (Coming Soon)
│ ❯ *${config.prefix}grpling* Get Group Link (Coming Soon)

*🔍 SEARCH COMMANDS*
│ ❯ *${config.prefix}yt* Search On You Tube (Coming Soon)
│ ❯ *${config.prefix}tt* Search On Tik Tok (Coming Soon)
│ ❯ *${config.prefix}gimg* Search Images In Google (Coming Soon)
│ ❯ *${config.prefix}movie* Search Movies On Bot's List (Coming Soon)
│ ❯ *${config.prefix}csmovie* Search Movies On Cine Subz (Coming Soon)
│ ❯ *${config.prefix}game* Search Games On Bot's List (Coming Soon)
│ ❯ *${config.prefix}apk* Search Apk (Coming Soon)
│ ❯ *${config.prefix}app* Search App In Play Store (Coming Soon)

*📥 DOWNLOADER COMMANDS*
│ ❯ *${config.prefix}dlsong* Download Song (Coming Soon)
│ ❯ *${config.prefix}dlfb* Download FB Video (Coming Soon)
│ ❯ *${config.prefix}dltt* Downloa Tik Tok Video (Coming Soon)
│ ❯ *${config.prefix}dlig* Download Instagram Video (Coming Soon)
│ ❯ *${config.prefix}dlyt* Donload YT Video (Coming Soon)
│ ❯ *${config.prefix}dlapk* Download APK (Coming Soon)
│ ❯ *${config.prefix}mediafire* Download Mediafire File (Coming Soon)
│ ❯ *${config.prefix}gdrive* Download Google Drive File (Coming Soon)

*🎁 REQUEST COMMANDS*
│ ❯ *${config.prefix}reqmovie* Request A Movie (Coming Soon)
│ ❯ *${config.prefix}reqgame* Request A Game (Coming Soon)
│ ❯ *${config.prefix}reqcmd* Request A Command (Coming Soon)

*😎 FUN COMMANDS*
│ ❯ *${config.prefix}lv* Love Calculator (Coming Soon)
│ ❯ *${config.prefix}readmore* Get A read More Msg (Coming Soon)

*👥 GROUP COMMANDS*
│ ❯ *${config.prefix}add* Add A Member (Coming Soon)
│ ❯ *${config.prefix}kick* Remove A Member (Coming Soon)
│ ❯ *${config.prefix}mute* Mute A Member (Coming Soon)
│ ❯ *${config.prefix}unmute* Unmute A Member (Coming Soon)
│ ❯ *${config.prefix}promote* Make Admin (Coming Soon)
│ ❯ *${config.prefix}demote* Remove Admin (Coming Soon)
│ ❯ *${config.prefix}hidetag* Hide a Tag (Coming Soon)
│ ❯ *${config.prefix}tagall* Tag All Members (Coming Soon)

*👨 OWNER COMMANDS*
│ ❯ *${config.prefix}ban* Ban  A Member (Coming Soon)
│ ❯ *${config.prefix}unban* Unban A Member (Coming Soon)
│ ❯ *${config.prefix}block* Block A Member (Coming Soon)
│ ❯ *${config.prefix}unblock* Unblock A Member (Coming Soon)
│ ❯ *${config.prefix}settings* See & Edit Bot Settings (Coming Soon)

*🎯BOT COMMANDS*
│ ❯ *${config.prefix}start* Start Bot (Coming Soon)
│ ❯ *${config.prefix}stop* Stop Bot (Coming Soon)
│ ❯ *${config.prefix}restart* Restart Bot (Coming Soon)

*────────────────────*
> *Powered by ${config.developerName}*`;

        // Image යවන කොට Header එකත් එක්කම යවන්න
        await sock.sendMessage(
            m.key.remoteJid,
            {
                image: { url: config.botLogo },
                caption: botHeader + "\n" + menuBody, // මෙතනට botHeader එක එකතු කළා
            },
            { quoted: m },
        );
    },
};
