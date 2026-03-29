require('dotenv').config();
const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const path       = require('path');
const helmet     = require('helmet');
const cors       = require('cors');

const app    = express();
const server = http.createServer(app);
const io     = new Server(server, { cors: { origin: '*' } });
const PORT   = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Routes ───────────────────────────────────────
app.use('/api/players',  require('./routes/players'));
app.use('/api/matches',  require('./routes/matches'));
app.use('/api/admin',    require('./routes/admin'));

// ── Catch-all ────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Socket.IO — Real-time multiplayer ─────────────
const activeRooms = {}; // roomId → { players, board, turn, bets }

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join or create a match room
  socket.on('joinRoom', ({ roomId, player }) => {
    socket.join(roomId);

    if (!activeRooms[roomId]) {
      activeRooms[roomId] = {
        players: [], spectators: [],
        status: 'waiting', turn: 'w',
        moves: [], betAmount: 0
      };
    }

    const room = activeRooms[roomId];

    if (room.players.length < 2) {
      const color = room.players.length === 0 ? 'w' : 'b';
      room.players.push({ ...player, socketId: socket.id, color });
      socket.emit('assignColor', { color, roomId });
      io.to(roomId).emit('roomUpdate', room);

      if (room.players.length === 2) {
        room.status = 'playing';
        io.to(roomId).emit('gameStart', {
          white: room.players.find(p => p.color === 'w'),
          black: room.players.find(p => p.color === 'b'),
          betAmount: room.betAmount
        });
      }
    } else {
      // Spectator
      room.spectators.push({ ...player, socketId: socket.id });
      socket.emit('spectating', { room });
      io.to(roomId).emit('spectatorJoined', { count: room.spectators.length });
    }
  });

  // Place bet before game
  socket.on('placeBet', ({ roomId, amount }) => {
    if (activeRooms[roomId]) {
      activeRooms[roomId].betAmount = amount;
      io.to(roomId).emit('betPlaced', { amount });
    }
  });

  // Move made
  socket.on('makeMove', ({ roomId, move, fen, turn }) => {
    const room = activeRooms[roomId];
    if (!room) return;
    room.turn = turn;
    room.moves.push(move);
    // Broadcast to everyone in room (opponent + spectators)
    socket.to(roomId).emit('moveMade', { move, fen, turn });
  });

  // Game over
  socket.on('gameOver', ({ roomId, result, winner }) => {
    const room = activeRooms[roomId];
    if (!room) return;
    room.status = 'finished';
    io.to(roomId).emit('gameEnded', { result, winner, moves: room.moves.length });
    // Cleanup after 30s
    setTimeout(() => { delete activeRooms[roomId]; }, 30000);
  });

  // Draw offer
  socket.on('offerDraw', ({ roomId }) => {
    socket.to(roomId).emit('drawOffered');
  });

  socket.on('acceptDraw', ({ roomId }) => {
    io.to(roomId).emit('gameEnded', { result: 'draw', winner: null });
  });

  socket.on('declineDraw', ({ roomId }) => {
    socket.to(roomId).emit('drawDeclined');
  });

  // Resign
  socket.on('resign', ({ roomId, color }) => {
    const winner = color === 'w' ? 'b' : 'w';
    io.to(roomId).emit('gameEnded', { result: 'resign', winner });
  });

  // Rematch request
  socket.on('requestRematch', ({ roomId }) => {
    socket.to(roomId).emit('rematchRequested');
  });

  socket.on('acceptRematch', ({ roomId }) => {
    if (activeRooms[roomId]) {
      activeRooms[roomId].moves = [];
      activeRooms[roomId].status = 'playing';
      activeRooms[roomId].turn = 'w';
      // Swap colors
      activeRooms[roomId].players.forEach(p => {
        p.color = p.color === 'w' ? 'b' : 'w';
      });
      io.to(roomId).emit('rematchStarted', {
        white: activeRooms[roomId].players.find(p => p.color === 'w'),
        black: activeRooms[roomId].players.find(p => p.color === 'b'),
      });
    }
  });

  // Get active rooms list (for spectating)
  socket.on('getActiveRooms', () => {
    const rooms = Object.entries(activeRooms)
      .filter(([, r]) => r.status === 'playing')
      .map(([id, r]) => ({
        id,
        white: r.players.find(p => p.color === 'w')?.username,
        black: r.players.find(p => p.color === 'b')?.username,
        moves: r.moves.length,
        spectators: r.spectators.length
      }));
    socket.emit('activeRooms', rooms);
  });

  // Disconnect
  socket.on('disconnect', () => {
    for (const [roomId, room] of Object.entries(activeRooms)) {
      const pi = room.players.findIndex(p => p.socketId === socket.id);
      if (pi !== -1) {
        room.status = 'abandoned';
        io.to(roomId).emit('playerLeft', { color: room.players[pi].color });
        break;
      }
    }
  });
});

// ── Start Server ──────────────────────────────────
server.listen(PORT, () => {
  console.log(`✅ ChessMate v2 running on port ${PORT}`);
});

module.exports = { app, io };
