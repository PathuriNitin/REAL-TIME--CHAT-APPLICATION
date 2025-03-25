const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let usersTyping = new Set();

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("join", (username) => {
    socket.username = username;
    io.emit("message", { user: "System", text: `${username} joined the chat!` });
  });

  socket.on("message", (data) => {
    io.emit("message", data);
  });

  socket.on("typing", (username) => {
    usersTyping.add(username);
    io.emit("typing", Array.from(usersTyping));
  });

  socket.on("stopTyping", (username) => {
    usersTyping.delete(username);
    io.emit("typing", Array.from(usersTyping));
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
    if (socket.username) {
      io.emit("message", { user: "System", text: `${socket.username} left the chat.` });
      usersTyping.delete(socket.username);
      io.emit("typing", Array.from(usersTyping));
    }
  });
});

httpServer.listen(5000, () => {
  console.log("Server running on port 5000");
});
