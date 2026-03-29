const express = require('express');
const router  = express.Router();
const store   = require('../config/store');
const { v4: uuidv4 } = require('uuid');

// POST /api/matches/create
router.post('/create', (req, res) => {
  const { whiteId, blackId, betAmount, mode } = req.body;
  const id = uuidv4();
  const match = store.saveMatch(id, {
    whiteId, blackId, betAmount: betAmount || 0,
    mode: mode || 'rapid', status: 'playing',
    startedAt: Date.now()
  });
  res.json({ success: true, matchId: id, match });
});

// POST /api/matches/finish
router.post('/finish', (req, res) => {
  const { matchId, result, winnerId, moves } = req.body;
  if (!matchId) return res.status(400).json({ error: 'matchId required' });

  const match = store.saveMatch(matchId, {
    result, winnerId, moves,
    status: 'finished', finishedAt: Date.now()
  });
  res.json({ success: true, match });
});

// GET /api/matches/recent
router.get('/recent', (req, res) => {
  const matches = store.getRecentMatches(30);
  res.json(matches);
});

module.exports = router;
