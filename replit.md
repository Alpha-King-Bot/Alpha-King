# Alpha-King WhatsApp Bot

## Overview
A WhatsApp bot built with Node.js using the Baileys library (@whiskeysockets/baileys). The bot connects to WhatsApp via pairing code and handles commands sent in WhatsApp groups and direct messages.

## Architecture
- **Runtime**: Node.js 20
- **Entry point**: `index.js`
- **Config**: `config.js` — contains bot settings (owner numbers, prefix, allowed groups, API keys)
- **Commands**: `commands/` directory, organized by category (main, converter, etc.)
- **Session**: `session/` directory — stores WhatsApp auth state (multi-file auth)
- **Media**: `Media/` directory — bot assets (logo images, etc.)
- **FFmpeg**: `ffmpeg-7.0.2-amd64-static/` — bundled static FFmpeg binary for media processing

## Key Dependencies
- `@whiskeysockets/baileys` — WhatsApp Web API library
- `express` — HTTP server (status endpoint on port 5000)
- `pino` — logging
- `axios` — HTTP requests (bot status check via JSONbin API)
- `@google/generative-ai` — Gemini AI integration
- `wa-sticker-formatter` — WhatsApp sticker creation

## Running the App
- **Workflow**: "Start application" runs `npm start` → `node index.js`
- **Port**: 5000 (Express web server at `/` returns bot status)
- **Bot auth**: Uses pairing code from `config.pairedNumber` if not already registered

## Configuration (`config.js`)
- `pairedNumber` — WhatsApp number for pairing
- `ownerNumbers` — Numbers with owner-level access
- `prefix` — Command prefix (default `.`)
- `allowedGroups` — Group JIDs where commands are allowed
- `botStatusUrl` — JSONbin API URL for bot on/off status
- `geminiApiKey` — Google Gemini API key

## Deployment
- Target: VM (always-running process needed for persistent WhatsApp connection)
- Run command: `node index.js`
