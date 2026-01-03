const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('User connected: ' + socket.id);

    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId);
    });

    // --- THIS WAS MISSING OR NOT WORKING ---
  // UPDATED: Handle Text Chat with Names
    socket.on('send-message', (data) => {
        // We now send an object: { text: "Hello", user: "Tinku" }
        socket.to(data.roomId).emit('receive-message', {
            message: data.message, 
            sender: data.senderName  // <--- NEW: Sending the name
        });
    });
    // ---------------------------------------

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
