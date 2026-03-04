const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

function keepAlive() {
    app.get("/", (req, res) => {
        res.setHeader("Content-Type", "text/html");
        res.write(`
            <html>
                <head>
                    <title>Alpha King Bot Status</title>
                    <style>
                        body { background-color: #121212; color: #00ff00; font-family: monospace; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                        .container { text-align: center; border: 1px solid #00ff00; padding: 20px; border-radius: 10px; box-shadow: 0 0 15px #00ff00; }
                        h1 { font-size: 24px; }
                        p { font-size: 18px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>~~ Alpha King Bot ~~</h1>
                        <p>Status: 🟢 Online & Running</p>
                        <p>Uptime: Real-time Monitoring Active</p>
                    </div>
                </body>
            </html>
        `);
        res.end();
    });

    app.listen(port, () => {
        console.log(`[SERVER] Alpha King is live on port ${port}`);
    });
}

module.exports = keepAlive;
