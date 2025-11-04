const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

io.on('connection', socket => {
console.log('client connected', socket.id);
socket.on('message', payload => {
// broadcast to all
io.emit('message', payload);
});
});

server.listen(3001, ()=>console.log('Socket.IO server on 3001'));