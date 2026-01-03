// 1. IMPORT THE TOOLS
const express = require('express'); // The website handler
const http = require('http');       // The server core
const { Server } = require("socket.io"); // The real-time engine

// 2. SETUP THE SERVER
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 3. SERVE THE WEBSITE
// This tells the server: "If someone visits the site, show them the files in the 'public' folder"
app.use(express.static('public'));

// 4. THE REAL-TIME MATCHMAKING (The important part!)
io.on('connection', (socket) => {
    console.log('A user connected: ' + socket.id);

    // EVENT A: User joins a room
    socket.on('join-room', (roomId, userId) => {
        console.log(`User ${userId} joined room ${roomId}`);
        socket.join(roomId); // Put them in a "virtual room"
        
        // Shout to everyone else in the room: "Hey! A new user is here!"
        socket.to(roomId).emit('user-connected', userId);
    });

    // EVENT B: Handling the technical details (WebRTC Signals)
    // If User A sends a "signal" (like an Offer or Ice Candidate), 
    // we just pass it to everyone else in the room.
    // The server doesn't need to understand this data, just deliver it.
    socket.on('signal', (data) => {
        // "socket.to" sends it to everyone in the room EXCEPT the sender
        socket.to(data.roomId).emit('signal', {
            signal: data.signal,
            senderId: data.senderId
        });
    });

    // EVENT C: User disconnects
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// 5. TURN THE SERVER ON
server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});