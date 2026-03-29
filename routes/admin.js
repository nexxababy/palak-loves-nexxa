const express = require('express');
const router  = express.Router();
const store   = require('../config/store');

// ── Admin Auth Middleware ─────────────────────────
function adminAuth(req, res, next) {
  const key = req.headers['x-admin-key'] || req.query.key;
  if (!key || key !== process.env.ADMIN_SECRET_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

// All admin routes require auth
router.use(adminAuth);

// GET /api/admin/stats — overall app stats
router.get('/stats', (req, res) => {
  const players = store.getAllPlayers();
  const matches = store.getRecentMatches(1000);
  res.json({
    totalPlayers: players.length,
    totalMatches: matches.length,
    totalCoins:   players.reduce((s, p) => s + (p.coins || 0), 0),
    avgElo:       players.length ? Math.round(players.reduce((s, p) => s + (p.elo || 1200), 0) / players.length) : 1200,
    bannedPlayers: players.filter(p => p.banned).length,
  });
});

// GET /api/admin/players — all players
router.get('/players', (req, res) => {
  res.json(store.getAllPlayers());
});

// POST /api/admin/players/:id/ban — ban a player
router.post('/players/:id/ban', (req, res) => {
  const p = store.banPlayer(req.params.id, true);
  if (!p) return res.status(404).json({ error: 'Player not found' });
  res.json({ success: true, message: `${p.username} banned`, player: p });
});

// POST /api/admin/players/:id/unban — unban a player
router.post('/players/:id/unban', (req, res) => {
  const p = store.banPlayer(req.params.id, false);
  if (!p) return res.status(404).json({ error: 'Player not found' });
  res.json({ success: true, message: `${p.username} unbanned`, player: p });
});

// POST /api/admin/players/:id/coins — add or remove coins
router.post('/players/:id/coins', (req, res) => {
  const { amount } = req.body; // positive = add, negative = remove
  if (amount === undefined) return res.status(400).json({ error: 'amount required' });
  const p = store.addCoins(req.params.id, amount);
  if (!p) return res.status(404).json({ error: 'Player not found' });
  res.json({ success: true, message: `Coins updated for ${p.username}`, newBalance: p.coins });
});

// POST /api/admin/players/:id/elo — set ELO manually
router.post('/players/:id/elo', (req, res) => {
  const { elo } = req.body;
  if (!elo) return res.status(400).json({ error: 'elo required' });
  const p = store.savePlayer(req.params.id, { elo: parseInt(elo) });
  res.json({ success: true, message: `ELO updated for ${p.username}`, elo: p.elo });
});

// DELETE /api/admin/players/:id — delete player
router.delete('/players/:id', (req, res) => {
  store.deletePlayer(req.params.id);
  res.json({ success: true, message: 'Player deleted' });
});

// POST /api/admin/leaderboard/reset — reset all ELOs
router.post('/leaderboard/reset', (req, res) => {
  store.resetLeaderboard();
  res.json({ success: true, message: 'Leaderboard reset! All ELOs set to 1200' });
});

// GET /api/admin/matches — all matches
router.get('/matches', (req, res) => {
  res.json(store.getRecentMatches(100));
});

module.exports = router;
