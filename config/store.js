// In-memory store — used when Firebase is not configured
// Data resets on server restart
// Replace with Firebase for permanent storage

const store = {
  players: {},   // id → player object
  matches: {},   // id → match object
};

// ── Players ───────────────────────────────────────
function getPlayer(id) {
  return store.players[id] || null;
}

function savePlayer(id, data) {
  store.players[id] = { ...store.players[id], ...data, updatedAt: Date.now() };
  return store.players[id];
}

function getLeaderboard(limit = 20) {
  return Object.values(store.players)
    .sort((a, b) => b.elo - a.elo)
    .slice(0, limit);
}

function getAllPlayers() {
  return Object.values(store.players);
}

function deletePlayer(id) {
  delete store.players[id];
}

function addCoins(id, amount) {
  if (!store.players[id]) return null;
  store.players[id].coins = Math.max(0, (store.players[id].coins || 0) + amount);
  return store.players[id];
}

function banPlayer(id, banned) {
  if (!store.players[id]) return null;
  store.players[id].banned = banned;
  return store.players[id];
}

function resetLeaderboard() {
  Object.keys(store.players).forEach(id => {
    store.players[id].elo = 1200;
    store.players[id].wins = 0;
    store.players[id].losses = 0;
    store.players[id].draws = 0;
    store.players[id].games = 0;
  });
}

// ── Matches ───────────────────────────────────────
function saveMatch(id, data) {
  store.matches[id] = { ...data, id, savedAt: Date.now() };
  return store.matches[id];
}

function getRecentMatches(limit = 50) {
  return Object.values(store.matches)
    .sort((a, b) => b.savedAt - a.savedAt)
    .slice(0, limit);
}

module.exports = {
  getPlayer, savePlayer, getLeaderboard, getAllPlayers,
  deletePlayer, addCoins, banPlayer, resetLeaderboard,
  saveMatch, getRecentMatches,
};
