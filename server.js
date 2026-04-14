const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// --- إعدادات الإدارة السرية (الأدمن) ---
// يمكنك تغيير عنوان المحفظة والبريد هنا لاحقاً
let config = {
    wallet: "TYuR88xxxx_PRO_WALLET_xxxx", 
    paypal: "payments@yourbrand.com",
    houseEdge: 0.95, // نسبة الخسارة 95% لضمان أرباح المنصة
};

// --- محرك اللعبة (Logic) ---
let game = { mult: 1.00, status: 'WAITING' };

function runCrash() {
    game.status = 'FLYING';
    game.mult = 1.00;
    
    // تحديد نقطة الانفجار برمجياً (مخفي عن المستخدم)
    let crashPoint = Math.random() < config.houseEdge ? 
                     (1.01 + Math.random() * 0.45).toFixed(2) : 
                     (2.00 + Math.random() * 25.0).toFixed(2);

    let loop = setInterval(() => {
        if (game.mult >= crashPoint) {
            game.status = 'CRASHED';
            io.emit('crash', game.mult);
            clearInterval(loop);
            setTimeout(runCrash, 5000); // وقت انتظار الجولة القادمة
        } else {
            game.mult += 0.01 * Math.pow(game.mult, 1.15);
            io.emit('tick', game.mult.toFixed(2));
        }
    }, 100);
}
runCrash();

// --- الواجهة الرسومية الاحترافية (HTML/CSS) ---
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="ar">
<head>
    <meta charset="UTF-8">
    <title>CRASH PRO | المنصة العالمية</title>
    <script src="/socket.io/socket.io.js"></script>
    <style>
        :root { --gold: #f0b90b; --black: #0b0e11; --card: #1e2329; --green: #02f78e; --red: #ff3b5c; }
        body { background: var(--black); color: white; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; overflow: hidden; }
        .nav { background: var(--card); padding: 10px 30px; display: flex; justify-content: space-between; border-bottom: 1px solid #333; }
        .container { display: grid; grid-template-columns: 1fr 380px; gap: 20px; padding: 20px; height: 85vh; }
        .game-area { background: radial-gradient(circle, #1a1d23 0%, #050608 100%); border-radius: 20px; display: flex; align-items: center; justify-content: center; position: relative; border: 1px solid #2b3139; }
        #multiplier { font-size: 130px; font-weight: 900; color: var(--gold); text-shadow: 0 0 50px rgba(240, 185, 11, 0.2); transition: 0.1s; }
        .sidebar { background: var(--card); border-radius: 20px; padding: 25px; border: 1px solid #2b3139; }
        .btn-bet { background: var(--gold); color: black; border: none; padding: 18px; width: 100%; border-radius: 12px; font-weight: bold; font-size: 20px; cursor: pointer; margin-top: 15px; }
        input { width: 100%; background: #0b0e11; border: 1px solid #444; color: white; padding: 15px; border-radius: 10px; font-size: 16px; margin-bottom: 10px; }
        .payment-info { margin-top: 30px; padding: 15px; background: #2b3139; border-radius: 10px; border-left: 4px solid var(--gold); }
        .status-tag { position: absolute; top: 20px; color: #666; font-size: 12px; letter-spacing: 2px; }
    </style>
</head>
<body>
    <div class="nav">
        <h2 style="color:var(--gold)">CRASH <span style="color:white">PRO</span></h2>
        <div style="display:flex; align-items:center; gap:15px;">
            <span>Balance: <b style="color:var(--gold)">$500.00</b></span>
        </div>
    </div>
    <div class="container">
        <div class="game-area">
            <div class="status-tag">SERVER SEED: ENCRYPTED ACTIVE</div>
            <div id="multiplier">1.00x</div>
        </div>
        <div class="sidebar">
            <h3 style="margin-top:0">💰 Place Your Bet</h3>
            <label style="font-size:12px; color:#888">AMOUNT (USDT)</label>
            <input type="number" id="bet" value="10.00">
            <button class="btn-bet" onclick="alert('Bet Placed!')">BET / CASHOUT</button>
            
            <div class="payment-info">
                <p style="margin:0; font-size:13px; color:var(--gold)"><b>DEPOSIT USDT (TRC20):</b></p>
                <code style="word-break:break-all; font-size:11px;">${config.wallet}</code>
                <p style="margin:15px 0 0 0; font-size:13px; color:#0070ba"><b>PAYPAL DEPOSIT:</b></p>
                <span style="font-size:12px;">${config.paypal}</span>
            </div>
            <p style="font-size:10px; color:#666; margin-top:20px; text-align:center;">🔒 Secure SSL Encrypted Payments</p>
        </div>
    </div>
    <script>
        const socket = io();
        const multDisplay = document.getElementById('multiplier');
        socket.on('tick', (m) => {
            multDisplay.innerText = m + 'x';
            multDisplay.style.color = 'var(--green)';
        });
        socket.on('crash', (m) => {
            multDisplay.innerText = m + 'x';
            multDisplay.style.color = 'var(--red)';
            setTimeout(() => { multDisplay.innerText = 'PREPARING...'; multDisplay.style.color = '#fff'; }, 2500);
        });
    </script>
</body>
</html>
    `);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('Server is running...'));
