const express = require("express");
const { Server } = require("socket.io");
const { createServer } = require("http");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(express.static(__dirname + "/public"));

httpServer.listen(3500, () => {
  console.log("listening");
});
let usersList = []; //users data
let chatData = [];

io.on("connection", (socket) => {
  console.log("connection established", socket.id);

  socket.on("sendNameToServer", (username) => {
    console.log(username);
    usersList.push({ username: username, socketId: socket.id });

    io.emit("sendUsersDataToClient", usersList);
  });

  socket.on("sendUserChatToServer", (obj) => {
    chatData.push(obj);
    io.emit("sendGroupDataToClient", chatData);
  });

  socket.on("disconnect", () => {
    console.log("disconnection of user", socket.id);
    usersList = usersList.filter((user) => user.socketId != socket.id);
    io.emit("sendUsersDataToClient", usersList);
  });
});
