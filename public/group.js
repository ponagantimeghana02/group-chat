const socket = io();
let currentUser = "";
let selectedUser = "";

function addUser() {
  let uId = document.getElementById("userId").value;
  currentUser = uId;
  document.getElementById("userName").innerText = "Username: " + uId;
  socket.emit("sendNameToServer", uId);
  document.getElementById("userId").value = "";
}

socket.on("sendUsersDataToClient", (user) => {
  let usersArray = document.getElementById("usersList");
  usersArray.innerHTML = "";

  let listOfUsers = user
    .map(
      (u) => `<li onclick="selectUser('${u.username}')">${u.username}</li>`
    )
    .join("");

  usersArray.innerHTML = listOfUsers;
});

function selectUser(name) {
  selectedUser = name;
  document.getElementById("chatWith").innerText = name;
}

function broadCasteMsg() {
  let message = document.getElementById("textMessage").value;

    socket.emit("sendUserChatToServer", {
      msg: message,
      userName: currentUser,
    });
  
  document.getElementById("textMessage").value = "";
}

socket.on("sendGroupDataToClient", (obj) => {
  let displayingDataOfGroup = document.getElementById(
    "displayingMessagesOfUsers"
  );

  displayingDataOfGroup.innerHTML = obj
    .map((data) => {
      const displayName = data.userName == currentUser ? "You" : data.userName;
      return `<p><b>${displayName}:</b> ${data.msg}</p>`;
    })
    .join("");

  const container = document.getElementById("rightPanelUpContent");
  container.scrollTop = container.scrollHeight;
});

socket.on("sendPrivateDataToClient", (obj) => {
  let displayingDataOfGroup = document.getElementById(
    "displayingMessagesOfUsers"
  );

  const displayName = obj.from == currentUser ? "You" : obj.from;
  displayingDataOfGroup.innerHTML += `<p><b>${displayName}:</b> ${obj.msg}</p>`;

  const container = document.getElementById("rightPanelUpContent");
  container.scrollTop = container.scrollHeight;
});
