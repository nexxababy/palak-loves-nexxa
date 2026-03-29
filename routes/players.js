const express = require('express');
const router  = express.Router();
const store   = require('../config/store');

// GET /api/players/:id
router.get('/:id', (req, res) => {
  const p = store.getPlayer(req.params.id);
  if (!p) return res.status(404).json({ error: 'Player not found' });
  if (p.banned) return res.status(403).json({ error: 'Player is banned' });
  res.json(p);
});

// POST /api/players/save  — called from frontend after every game
router.post('/save', (req, res) => {
  const { id, username, elo, coins, wins, losses, draws, games, history } = req.body;
  if (!id) return res.status(400).json({ error: 'id is required' });

  const existing = store.getPlayer(id);
  if (existing?.banned) return res.status(403).json({ error: 'Player is banned' });

  const saved = store.savePlayer(id, {
    id, username, elo, coins,
    wins:    wins    || 0,
    losses:  losses  || 0,
    draws:   draws   || 0,
    games:   games   || 0,
    history: history || [],
  });
  res.json({ success: true, player: saved });
});

// GET /api/players/leaderboard/top
router.get('/leaderboard/top', (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const board = store.getLeaderboard(limit).map(p => ({
    id: p.id, username: p.username,
    elo: p.elo, wins: p.wins,
    losses: p.losses, draws: p.draws, games: p.games
  }));
  res.json(board);
});

module.exports = router;
