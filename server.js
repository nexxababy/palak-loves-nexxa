const express = require('express');
const path    = require('path');
const helmet  = require('helmet');
const cors    = require('cors');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Security & CORS ──────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'", "'unsafe-inline'", "telegram.org", "*.telegram.org"],
      styleSrc:   ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      fontSrc:    ["'self'", "fonts.gstatic.com"],
      imgSrc:     ["'self'", "data:", "*.telegram.org"],
      connectSrc: ["'self'"],
    },
  },
}));
app.use(cors());
app.use(express.json());

// ── Static files ─────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── Routes ───────────────────────────────────────
app.use('/api', require('./routes/api'));

// ── Catch-all → index.html ───────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Start ────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ ChessMate running on http://localhost:${PORT}`);
});

module.exports = app;
