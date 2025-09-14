const express = require('express')
const cors = require('cors')
const http = require('http');
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')
const { Server } = require('socket.io')
const Message = require('./models/Message')
dotenv.config()

const app = express()
const server = http.createServer(app)
const corsOptions = {
  origin: process.env.CLIENT,
  methods: ["GET", "POST"],
  credentials: true
}
app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())

const io = new Server(server, {
  cors: corsOptions
})

const PORT = process.env.PORT_1
const MONGO_URL = process.env.MONGO_URI
mongoose.connect(MONGO_URL)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Error :", err))

app.use("/api/auth", require("./routes/auth"))
app.use("/api/appointments", require("./routes/appointment"))
app.use("/api/ehr", require("./routes/ehr"))
app.use("/api/messages", require("./routes/message"))
app.use("/api/doctors", require("./routes/doctor"))
app.use("/api/friends", require("./routes/friendList"))

const rooms = {};
const sockets = {};
const users = {}

io.on('connection', socket => {

  console.log("Socket is connected: ", socket.id)

  socket.on('join-room', ({ roomId, userId }) => {
    if (!userId) {
      console.error("No userId provided");
      return;
    }
    users[userId] = socket.id;
    sockets[socket.id] = userId;
    if (roomId) {
      socket.join(roomId);
      console.log(`User ${userId} joined room ${roomId}`);
    } else {
      console.log(`User ${userId} joined without specific room`);
    }
  });
  socket.on("ready", ({ userId, roomId }) => {
    socket.to(roomId).emit("user-connected", userId); // trigger offer again
  });

  socket.on('send_message', async ({ sender, senderId, recipientId, message }) => {
    try {
      if (!senderId?.trim() || !recipientId?.trim() || !message?.trim()) {
        return socket.emit('receive_message', {
          senderName: 'System',
          message: '❌ Invalid message data. Message not sent.'
        });
      }
      const newMsg = new Message({
        sender,
        senderId,
        recipientId,
        message
      });
      await newMsg.save();

      const recipientSocket = users[recipientId];
      if (recipientSocket) {
        io.to(recipientSocket).emit('receive_message', {
          senderName: sender,
          senderId,
          recipientId,
          message
        });
      }

      const senderSocket = users[senderId];
      if (senderSocket) {
        io.to(senderSocket).emit('receive_message', {
          senderName: 'You',
          senderId,
          recipientId,
          message
        });
      }
      console.log("Message sended successfully")
    } catch (err) {
      console.error("Error in Sending Message!", err.message)
    }
  })

  socket.on('disconnect', () => {
    const userId = sockets[socket.id];
    if (userId) {
      delete users[userId];
      delete sockets[socket.id];
    }
    console.log(`User ${socket.id} (${userId}) disconnected`);
    if (userId) {
      io.emit('user-disconnected', userId);
    }
  });

  socket.on('leave-room', ({ userId, roomId }) => {
    delete users[userId];
    if (roomId && io.sockets.adapter.rooms.get(roomId)?.size === 0) {
      delete rooms[roomId];
    }
  });

  socket.on('offer', data => {
    const targetSocket = users[data.to];
    if (targetSocket) {
      io.to(targetSocket).emit('offer', { from: sockets[socket.id], offer: data.offer });
    }
  });

  socket.on('answer', data => {
    const targetSocket = users[data.to];
    if (targetSocket) {
      io.to(targetSocket).emit("answer", { from: sockets[socket.id], answer: data.answer });
    }
  });

  socket.on('ice-candidate', data => {
    const targetSocket = users[data.to];
    if (targetSocket) {
      io.to(targetSocket).emit("ice-candidate", { from: sockets[socket.id], candidate: data.candidate });
    }
  });

  socket.on('error', (error) => {
    console.log('Socket error:', error);
  })
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`))

