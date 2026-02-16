const socket = io();
let currentUser = "";
let selectedUser = null;
const privateChats = {};

function addUser() {
  let uId = document.getElementById("userId").value;
  currentUser = uId;
  document.getElementById("userName").innerText ="Group Chat";
  socket.emit("sendNameToServer", uId);
  document.getElementById("userId").value = "";
}

socket.on("sendUsersDataToClient", (users) => {
  let usersArray = document.getElementById("usersList");
  usersArray.innerHTML = `<li style="font-weight:bold;color:green">You</li>
${users
  .filter(u => u.username !== currentUser)
  .map((u) => `<li onclick="selectUser('${u.username}', '${u.socketId}')">${u.username}</li>`)
  .join("")}`;
});

function selectUser(username, socketId) {
  selectedUser = { username, socketId };
  document.getElementById("userName").innerText =
    "You are chatting with " + username;
  const box = document.getElementById("displayingMessagesOfUsers");
  box.innerHTML = "";
  (privateChats[username] || []).forEach((m) => {
    addMsg(m.from, m.msg, m.from === "You");
  });
}

function broadCasteMsg() {
  let msg = document.getElementById("textMessage").value;
  if (!msg) return;
  if (selectedUser) {
    socket.emit("sendPrivateChatToServer", {
      msg,
      from: currentUser,
      toSocketId: selectedUser.socketId,
    });
    if (!privateChats[selectedUser.username])
      privateChats[selectedUser.username] = [];
    privateChats[selectedUser.username].push({ from: "You", msg });
    addMsg("You", msg, true);
  } else {
    socket.emit("sendUserChatToServer", {
      msg,
      userName: currentUser,
    });
  }
  document.getElementById("textMessage").value = "";
}

socket.on("sendGroupDataToClient", (arr) => {
  if (selectedUser) return;

  const box = document.getElementById("displayingMessagesOfUsers");
  box.innerHTML = "";

  arr.forEach((data) => {
    const name = data.userName === currentUser ? "You" : data.userName;
    addMsg(name, data.msg);
  });
});

socket.on("sendPrivateDataToClient", ({ from, msg }) => {
  if (!privateChats[from]) privateChats[from] = [];
  privateChats[from].push({ from, msg });
  if (selectedUser && selectedUser.username === from) {
    addMsg(from, msg, false);
  }
});

function addMsg(name, msg) {
  const box = document.getElementById("displayingMessagesOfUsers");

  const div = document.createElement("div");
  const isMe = name === "You" || name === currentUser;

  div.className = "msg " + (isMe ? "me" : "other");
  if (!selectedUser && !isMe) {
    div.innerHTML = `<b>${name}</b><br>${msg}`;
  } else if (!selectedUser && isMe) {
    div.innerHTML = `<b>You</b><br>${msg}`;
  } else {
    div.innerText = msg;
  }

  box.appendChild(div);

  const container = document.getElementById("rightPanelUpContent");
  container.scrollTop = container.scrollHeight;
}
