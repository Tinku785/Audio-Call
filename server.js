const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

// --- 1. THE MEMORY STORAGE ---
// This object will hold all messages: { 'room-1': [msg1, msg2], 'room-2': [] }
const roomMessages = {}; 

io.on('connection', (socket) => {
    console.log('User connected: ' + socket.id);

    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId);

        // --- 2. SEND HISTORY TO NEW USER ---
        // If this room has history, send it to the person who just joined
        if (roomMessages[roomId]) {
            socket.emit('load-messages', roomMessages[roomId]);
        }
    });

    socket.on('send-message', (data) => {
        // --- 3. SAVE THE MESSAGE ---
        if (!roomMessages[data.roomId]) {
            roomMessages[data.roomId] = []; // Create room list if not exists
        }
        
        // Add message to the list
        roomMessages[data.roomId].push({
            sender: data.senderName,
            message: data.message
        });

        // Broadcast to others
        socket.to(data.roomId).emit('receive-message', {
            message: data.message, 
            sender: data.senderName
        });
    });

    socket.on('signal', (data) => {
        socket.to(data.roomId).emit('signal', {
            signal: data.signal,
            senderId: data.senderId
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
