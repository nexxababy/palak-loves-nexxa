const express = require('express');
const router  = express.Router();

// In-memory store (replace with DB for production)
const players = {};
const matches = {};

// ── GET /api/health ───────────────────────────────
router.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// ── POST /api/player/save ─────────────────────────
// Save player stats from frontend
router.post('/player/save', (req, res) => {
  const { id, username, elo, coins, wins, losses, draws, games, history } = req.body;
  if (!id) return res.status(400).json({ error: 'id required' });
  players[id] = { id, username, elo, coins, wins, losses, draws, games, history, updatedAt: Date.now() };
  res.json({ success: true });
});

// ── GET /api/player/:id ───────────────────────────
router.get('/player/:id', (req, res) => {
  const p = players[req.params.id];
  if (!p) return res.status(404).json({ error: 'not found' });
  res.json(p);
});

// ── GET /api/leaderboard ──────────────────────────
router.get('/leaderboard', (req, res) => {
  const list = Object.values(players)
    .sort((a, b) => b.elo - a.elo)
    .slice(0, 20)
    .map(({ id, username, elo, wins, losses, draws }) =>
      ({ id, username, elo, wins, losses, draws }));
  res.json(list);
});

// ── GET /api/matches/active ───────────────────────
router.get('/matches/active', (req, res) => {
  const active = Object.values(matches)
    .filter(m => m.status === 'playing')
    .map(({ id, whiteName, blackName, turn, moves }) =>
      ({ id, whiteName, blackName, turn, moves }));
  res.json(active);
});

module.exports = router;
