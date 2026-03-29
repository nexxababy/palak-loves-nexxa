# ♟ ChessMate v2 — Full Stack Telegram Chess

Complete chess game with real-time multiplayer, backend API, and admin panel.

## 📁 Folder Structure

```
chessmate-telegram/
├── public/
│   └── index.html          ← Full chess game (frontend)
├── routes/
│   ├── players.js          ← Player stats API
│   ├── matches.js          ← Match history API
│   └── admin.js            ← Admin panel API (protected)
├── config/
│   ├── store.js            ← In-memory data store
│   └── firebase.js         ← Firebase connector (optional)
├── server.js               ← Express + Socket.IO server
├── package.json
├── Procfile                ← Heroku
├── .env.example
├── .gitignore
└── README.md
```

## 🎮 Features

### Chess
- Full engine: castling, en passant, promotion, check, checkmate, stalemate
- AI opponent (Minimax depth 2)
- Move highlighting: green/red/yellow
- Piece guide on tap
- Move quality: Brilliant / Good / Inaccuracy / Mistake / Blunder

### Multiplayer
- Real-time online matches via Socket.IO
- Room codes (share with friend)
- Draw offer / Resign / Rematch
- Live spectator mode

### Player System
- ELO rating (dynamic)
- Coins & betting
- Match history
- Leaderboard

### 👑 Admin Panel
- View all player stats
- Ban / Unban players
- Add / Remove coins from any player
- Reset leaderboard
- View match history
- Password protected

---

## 🚀 Deploy on Heroku

### Step 1 — Upload all files to GitHub repo

Make sure your repo has:
```
public/index.html
routes/players.js
routes/matches.js
routes/admin.js
config/store.js
config/firebase.js
server.js
package.json
Procfile
.gitignore
```

### Step 2 — Create Heroku App
- Go to heroku.com → New → Create new app
- Name: `chessmate-tg` (or anything)

### Step 3 — Connect GitHub
- Deploy tab → GitHub → Connect
- Search your repo → Connect
- Click "Deploy Branch"

### Step 4 — Set Environment Variables
Go to Settings → Config Vars → Reveal Config Vars:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `ADMIN_SECRET_KEY` | `your_strong_password` |
| `TELEGRAM_BOT_TOKEN` | `your_bot_token` |

### Step 5 — Open App
Click "Open app" → copy the HTTPS URL

---

## 📱 BotFather Setup

1. Open @BotFather in Telegram
2. `/mybots` → select your bot
3. Bot Settings → Menu Button → Configure
4. URL: `https://your-app.herokuapp.com`
5. Text: `🎮 Play Chess`

---

## 👑 Admin Panel Access

1. In the app, tap the 👑 icon (top right)
2. Enter your `ADMIN_SECRET_KEY`
3. Full admin powers unlocked!

### Admin Powers:
- 📊 See total players, matches, coins, avg ELO
- 👥 View all players
- 🚫 Ban / ✅ Unban any player
- 🪙 Add or remove coins from any player
- 🗑 Reset entire leaderboard
- ♟ View all match history

---

## 🔧 API Reference

### Public
```
GET  /api/players/leaderboard/top    → Top 20 players
GET  /api/players/:id                → Get player
POST /api/players/save               → Save player stats
POST /api/matches/create             → Create match
POST /api/matches/finish             → Finish match
GET  /api/matches/recent             → Recent matches
```

### Admin (requires x-admin-key header)
```
GET  /api/admin/stats                → App statistics
GET  /api/admin/players              → All players
POST /api/admin/players/:id/ban      → Ban player
POST /api/admin/players/:id/unban    → Unban player
POST /api/admin/players/:id/coins    → Modify coins {amount: 100}
POST /api/admin/players/:id/elo      → Set ELO {elo: 1500}
DELETE /api/admin/players/:id        → Delete player
POST /api/admin/leaderboard/reset    → Reset all ELOs
GET  /api/admin/matches              → All matches
```

---

## 💡 Local Development

```bash
npm install
cp .env.example .env
# Edit .env with your values
npm run dev
# Open http://localhost:3000
```

---

## 🆓 Free Alternatives to Heroku

| Platform | Free | Notes |
|----------|------|-------|
| Railway.app | ✅ | Same steps, easier |
| Render.com | ✅ | Auto-deploy from GitHub |
| Cyclic.sh | ✅ | Very simple |

---

## 📄 License
MIT
