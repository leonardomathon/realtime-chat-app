const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const { messageTypes, formatMessage } = require('./utils/messages');
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers,
} = require('./utils/users');
const { getRooms, checkRoom } = require('./utils/rooms');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'Bot';

// Run when client connects
io.on('connection', (socket) => {
    socket.on('joinRoom', ({ username, room }) => {
        if (checkRoom(room)) {
            const user = userJoin(socket.id, username, room);

            socket.join(user.room);

            // Welcome current user
            socket.emit(
                'message',
                formatMessage(
                    botName,
                    'Welcome to Chat!',
                    messageTypes.BOTMESSAGE
                )
            );

            // Broadcast to other users when a user connects
            socket.broadcast
                .to(user.room)
                .emit(
                    'message',
                    formatMessage(
                        botName,
                        `${username} has joined the chat`,
                        messageTypes.JOINROOM
                    )
                );

            // Send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room),
            });
        } else {
            // Welcome current user
            socket.emit(
                'message',
                formatMessage(
                    botName,
                    'Oops, it appears you have entered a room that does not exist',
                    messageTypes.BOTMESSAGE
                )
            );
        }
    });

    // Listen for incoming messages
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit(
            'message',
            formatMessage(user.username, msg, messageTypes.MESSAGE)
        );
    });

    // Runs when client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if (user) {
            io.to(user.room).emit(
                'message',
                formatMessage(
                    botName,
                    `${user.username} has left the chat`,
                    messageTypes.LEAVEROOM
                )
            );

            // Send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room),
            });
        }
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
