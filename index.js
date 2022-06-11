const express = require("express");
const mysql = require('mysql');
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

app.use(express.json());
app.use(cors());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'VAD666',
  database: 'task5db'
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
  });

  socket.on("send_message", (data) => {
    const author = data.author;
    const recipient = data.recipient;
    const title = data.title;
    const message = data.message;
    const time = data.time;

    console.log(data.time);
    db.query(
        "INSERT INTO message (room, author, recipient, title, message, time) VALUES (?, ?, ?, ?, ?, ?);",
        [1, author, recipient, title, message,time],
        (err, result) => {
          if (err) {
            console.log(err);
            io.sockets.to(data.author).emit("receive_message", err);
          } else {
            console.log("INSERT result");
            console.log(result);
            io.sockets.to(data.recipient).emit("receive_message", data);
          }})
  });

  socket.on("get_my_message", (username) => {

    db.query(
        "SELECT * FROM message WHERE recipient = ?;",
        [username],
        (err, result) => {
          if (err) {
            console.log(err);
            io.sockets.to(username).emit("get_message_result", err);
          } else {
            console.log("SELECT result");
            console.log(result);
            io.sockets.to(username).emit("get_message_result", result);
          }})
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

server.listen(3001, () => {
  console.log("SERVER RUNNING");
});
