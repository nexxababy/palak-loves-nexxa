# ♟ ChessMate — Telegram Web App

A fully-featured Chess game built as a Telegram Web App.

## 📁 Folder Structure

```
chessmate-telegram/
├── public/
│   └── index.html          ← Full chess game (HTML + CSS + JS)
├── routes/
│   └── api.js              ← REST API (player stats, leaderboard)
├── server.js               ← Express server entry point
├── package.json
├── Procfile                ← Heroku process file
├── .env.example            ← Environment variables template
├── .gitignore
└── README.md
```

## 🎮 Features

- ♟ Full Chess engine (castling, en passant, promotion, check, checkmate, stalemate)
- 🤖 vs Computer (Minimax AI)
- 👥 Local Multiplayer (pass & play)
- 🌐 Online Match with betting system
- 👁 Live Spectator mode
- 📊 ELO rating system
- 🪙 Coins & betting
- 🧠 Move quality analysis (Brilliant / Good / Inaccuracy / Mistake / Blunder)
- 🌙 Dark / Light theme
- 📱 Telegram user auto-detection

---

## 🚀 Deploy on Heroku

### Prerequisites
- [Git](https://git-scm.com/) installed
- [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli) installed
- Heroku account (heroku.com)

### Step 1 — Clone / Setup repo
```bash
git init
git add .
git commit -m "Initial commit — ChessMate"
```

### Step 2 — Login to Heroku
```bash
heroku login
```

### Step 3 — Create Heroku app
```bash
heroku create your-app-name
# Example: heroku create chessmate-tg
```

### Step 4 — Deploy
```bash
git push heroku main
# If your branch is 'master':
git push heroku master
```

### Step 5 — Open app
```bash
heroku open
# Your URL: https://your-app-name.herokuapp.com
```

### Step 6 — Set environment variables (optional)
```bash
heroku config:set NODE_ENV=production
heroku config:set TELEGRAM_BOT_TOKEN=your_token_here
```

---

## 📱 Setup in Telegram BotFather

1. Open [@BotFather](https://t.me/BotFather) in Telegram
2. Send `/mybots` → select your bot
3. Go to **Bot Settings → Menu Button**
4. Set URL: `https://your-app-name.herokuapp.com`
5. Done! Open your bot and tap the menu button

---

## 💻 Run Locally

```bash
# Install dependencies
npm install

# Start server
npm start

# Dev mode (auto-reload)
npm run dev
```

Open: `http://localhost:3000`

---

## 🌐 Alternative Free Hosting

| Platform     | Free Tier | Speed  | Link                    |
|-------------|-----------|--------|-------------------------|
| Railway.app | ✅ Yes    | Fast   | railway.app             |
| Render.com  | ✅ Yes    | Medium | render.com              |
| Vercel      | ✅ Yes    | Fast   | vercel.com              |
| Netlify     | ✅ Yes    | Fast   | netlify.com             |

> ⚠️ **Note:** Heroku's free tier is discontinued. Minimum plan is Eco (~$5/month).
> For free hosting, use **Railway.app** (same deploy steps).

---

## 🔧 API Endpoints

| Method | Endpoint              | Description              |
|--------|-----------------------|--------------------------|
| GET    | `/api/health`         | Server health check      |
| POST   | `/api/player/save`    | Save player stats        |
| GET    | `/api/player/:id`     | Get player by ID         |
| GET    | `/api/leaderboard`    | Top 20 players by ELO    |
| GET    | `/api/matches/active` | List active matches      |

---

## 📄 License

MIT © ChessMate 2024
