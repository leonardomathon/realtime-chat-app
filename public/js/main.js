const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const connectionUserName = document.querySelector('.user-info');
const connectionRoomName = document.querySelector('.room-info');
const userList = document.getElementById('users');

const messageTypes = {
    JOINROOM: 1,
    LEAVEROOM: 2,
    MESSAGE: 3,
    BOTMESSAGE: 4,
    COMMAND: 5,
};

const roomJoinAudio = new Audio('../media/room_join.mp3');
const roomLeaveAudio = new Audio('../media/room_leave.mp3');
const messageAudio = new Audio('../media/new_message.mp3');

// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
});

const socket = io();

// Join chatroom
socket.emit('joinRoom', { username, room });

// Get room and users and connection info
socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
    outputConnectionInfo(username, room);
});

// Message from server
socket.on('message', (message) => {
    console.log(message);

    if (message.type === messageTypes.JOINROOM) {
        roomJoinAudio.play();
    }

    if (message.type === messageTypes.LEAVEROOM) {
        roomLeaveAudio.play();
    }

    outputMessage(message);

    if (message.user !== username) {
        messageAudio.play();
    }

    // Scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit event
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get message text
    const msg = e.target.elements.msg.value;

    // Emit msg to server socket
    socket.emit('chatMessage', msg);

    // Clear input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message) {
    const div = document.createElement('div');
    if (message.type === messageTypes.COMMAND) {
        div.innerHTML = `<div class="message command">
          <p class="meta">${message.user} <span>${message.time}</span></p>
          ${message.html}`;
    } else if (
        message.type === messageTypes.JOINROOM ||
        message.type === messageTypes.LEAVEROOM
    ) {
        div.innerHTML = `<div class="message joinleave">
          <p class="meta">${message.user} <span>${message.time}</span></p>
          <p class="text">
            ${message.text}
          </p>`;
    } else {
        div.innerHTML = `<div class="message">
          <p class="meta">${message.user} <span>${message.time}</span></p>
          <p class="text">
            ${message.text}
          </p>`;
    }

    document.querySelector('.chat-messages').appendChild(div);
}

// Add room name to DOM
function outputRoomName(room) {
    roomName.innerText = room;
}

// Add connection info
function outputConnectionInfo(username, room) {
    connectionUserName.innerText = username;
    connectionRoomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
    userList.innerHTML = '';
    users.forEach((user) => {
        const li = document.createElement('li');
        li.innerText = user.username;
        userList.appendChild(li);
    });
}
