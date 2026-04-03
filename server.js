require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const { Chess } = require('chess.js'); // ✅ Added

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Routes ───────────────────────────────────────
app.use('/api/players', require('./routes/players'));
app.use('/api/matches', require('./routes/matches'));
app.use('/api/admin', require('./routes/admin'));

// ── Catch-all ────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── Active Rooms ─────────────────────────────────
const activeRooms = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join Room
  socket.on('joinRoom', ({ roomId, player }) => {
    socket.join(roomId);

    if (!activeRooms[roomId]) {
      activeRooms[roomId] = {
        players: [],
        spectators: [],
        status: 'waiting',
        moves: [],
        betAmount: 0,
        game: new Chess() // ✅ Server-side engine
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
          betAmount: room.betAmount,
          fen: room.game.fen()
        });
      }
    } else {
      room.spectators.push({ ...player, socketId: socket.id });
      socket.emit('spectating', { room });
    }
  });

  // Make Move (FULLY FIXED)
  socket.on('makeMove', ({ roomId, move }) => {
    const room = activeRooms[roomId];
    if (!room || room.status !== 'playing') return;

    const game = room.game;
    const player = room.players.find(p => p.socketId === socket.id);

    if (!player || player.color !== game.turn()) return;

    const result = game.move(move);

    if (result) {
      room.moves.push(result.san);

      io.to(roomId).emit('moveMade', {
        move: result,
        fen: game.fen(),
        turn: game.turn()
      });

      if (game.isGameOver()) {
        let winner = null;

        if (game.isCheckmate()) {
          winner = game.turn() === 'w' ? 'b' : 'w';
        }

        room.status = 'finished';

        io.to(roomId).emit('gameEnded', {
          result: 'finished',
          winner
        });
      }

    } else {
      socket.emit('invalidMove');
    }
  });

  // Rematch
  socket.on('acceptRematch', ({ roomId }) => {
    const room = activeRooms[roomId];
    if (!room) return;

    room.moves = [];
    room.status = 'playing';
    room.game = new Chess(); // ✅ Reset board

    room.players.forEach(p => {
      p.color = p.color === 'w' ? 'b' : 'w';
    });

    io.to(roomId).emit('rematchStarted', {
      white: room.players.find(p => p.color === 'w'),
      black: room.players.find(p => p.color === 'b'),
      fen: room.game.fen()
    });
  });

  // Disconnect
  socket.on('disconnect', () => {
    for (const [roomId, room] of Object.entries(activeRooms)) {
      const playerIndex = room.players.findIndex(p => p.socketId === socket.id);
      if (playerIndex !== -1) {
        room.status = 'abandoned';
        io.to(roomId).emit('playerLeft', {
          color: room.players[playerIndex].color
        });
        break;
      }
    }
  });
});

// ── Start Server ──────────────────────────────────
server.listen(PORT, () => {
  console.log(`✅ ChessMate running on port ${PORT}`);
});

module.exports = { app, io };
