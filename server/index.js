const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
// antispam and socket io :
const SocketAntiSpam = require('socket-anti-spam');
const socket = require("socket.io");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// DataBase :
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connetion Successfull");
  })
  .catch((err) => {
    console.log(err.message);
  });

const server = app.listen(process.env.PORT, () =>
  console.log(`Server started on ${process.env.PORT}`)
);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// socket-io :
const io = socket(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

// anti-spam :
const socketAntiSpam = new SocketAntiSpam({
  banTime: 0,
  kickThreshold: 2,
  kickTimesBeforeBan: 1,
  banning: false,
  io: io,
})

global.onlineUsers = new Map();

io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
    }
  });
});

socketAntiSpam.event.on('ban', (socket, data) => {
  const address = socket.handshake.address;
  socket.emit("spam", "spam");
  console.log(data);
});

socketAntiSpam.event.on('spamscore', (socket, data) => {
  console.log(data.score);
});