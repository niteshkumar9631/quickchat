const { Server } = require('socket.io');
const http = require('http');
const express = require('express');
const User = require('./models/User');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

const userSocketMap = {};

const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  io.emit('getOnlineUsers', Object.keys(userSocketMap));

  socket.on('typing', ({ receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId)
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('typing')
    }
  })

  socket.on('stopTyping', ({ receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId)
    if (receiverSocketId) {
      io.to(receiverSocketId).emit('stopTyping')
    }
  })

  socket.on('disconnect', async () => {
    console.log('A user disconnected:', socket.id);
    delete userSocketMap[userId];
    io.emit('getOnlineUsers', Object.keys(userSocketMap));

    if (userId) {
      await User.findByIdAndUpdate(userId, { lastSeen: new Date() })
    }
  });
});

module.exports = { io, server, app, getReceiverSocketId };