'use strict';
const express = require('express');
const app = express();
const serv = require('http').Server(app);

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/client/index.html')
});
app.use(express.static('client'));
console.log(__dirname);
serv.listen(2000);
console.log("Server started.");

const CONNECTIONS = {};
const ROOMS = {}

const io = require('socket.io')(serv, {});

io.sockets.on('connection', function (socket) {
    socket.id = Math.random();
    console.log(`New connection: ${socket.id}`);
    CONNECTIONS[socket.id] = {socket};

    socket.on('disconnect', function () {
        if ("room" in CONNECTIONS[socket.id]) {
            const roomId = CONNECTIONS[socket.id]["room"];
            const privilege = ROOMS[roomId][socket.id];
            delete ROOMS[roomId][socket.id];
            const remainingPlayers = Object.keys(ROOMS[roomId]);
            if (remainingPlayers.length === 0) {
                delete ROOMS[roomId];
            } else if (privilege === 'owner') {
                ROOMS[roomId][remainingPlayers[0]] = 'owner';
            }
        }
        delete CONNECTIONS[socket.id];
        console.log(ROOMS);
    });

    // Room Creation
    socket.on('createRoom', () => {
        const roomId = Math.random();
        CONNECTIONS[socket.id]["room"] = roomId;
        ROOMS[roomId] = {};
        ROOMS[roomId][socket.id] = 'owner';
        console.log(`A new room was created by ${socket.id}`)
        socket.emit('roomCreated', {
            roomId,
            members: Object.keys(ROOMS[roomId])
        });
    });

    // Room Joining
    socket.on('joinRoom', (data) => {
        const roomId = data.roomId;
        if (roomId in ROOMS) {
            CONNECTIONS[socket.id]["room"] = roomId;
            ROOMS[roomId][socket.id] = 'player';
            console.log(ROOMS);
            socket.emit('roomJoined', {
                roomId,
                members: Object.keys(ROOMS[roomId])
            });
        }
        else {
            socket.emit('joinRoomFailed');
		}
    });
});

setInterval(function () {
    
    for (const socketId of Object.keys(CONNECTIONS)) {
        const socket = CONNECTIONS[socketId]['socket'];
        const pack = {}
        // next step is emit packs to room members with who is in the room
        socket.emit("update")
    }
}, 1000);