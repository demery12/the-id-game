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

const Room = require('./game_classes/Room');
const Player = require('./game_classes/Player');

const DEBUG = true;

const CONNECTIONS = {}; // { socketId: {socket: socket, player: Player}}
const PLAYERS = {};
const ROOMS = {} // { roomId: {socketId: socketId} }

const io = require('socket.io')(serv, {});

io.sockets.on('connection', function (socket) {
    socket.id = Math.random();
    console.log(`New connection: ${socket.id}`);
    CONNECTIONS[socket.id] = { socket };
    const player = new Player();
    PLAYERS[player.playerId] = player;
    CONNECTIONS[socket.id]['player'] = player;
    player.socketId = socket.id;
    socket.emit('userIdAssignment', { userId: socket.id });

    socket.on('disconnect', function () {
        if ("room" in CONNECTIONS[socket.id]) {
            const roomId = CONNECTIONS[socket.id]["room"];
            const privilege = ROOMS[roomId][socket.id];
            delete ROOMS[roomId][socket.id];
            const remainingPlayers = Object.keys(ROOMS[roomId]);
            if (remainingPlayers.length === 0) {
                delete ROOMS[roomId];
            }
        }
        delete CONNECTIONS[socket.id];
        console.log(ROOMS);
    });

    function joinRoom(socketId, roomId) {
        CONNECTIONS[socketId]["room"] = roomId;
        ROOMS[roomId][socketId] = player;
        player.room = roomId;
        socket.emit('roomJoined', {
            roomId,
            members: Object.keys(ROOMS[roomId])
        });
    }
    // Room Creation
    socket.on('createRoom', () => {
        const room = new Room();
        const roomId = room.roomId;
        ROOMS[roomId] = room;
        joinRoom(socket.id, roomId);
        console.log(`A new room was created by ${socket.id}`)
    });

    // Room Joining
    socket.on('joinRoom', (data) => {
        const roomId = data.roomId;
        if (roomId in ROOMS) {
            joinRoom(socket.id, roomId);
        }
        else {
            socket.emit('joinRoomFailed');
		}
    });

    // Profile update
    socket.on('profileUpdate', (data) => {
        player.firstName = data.firstName;
        player.lastName = data.lastName;
        player.displayName = data.displayName;

    })

    // Chat related messages
    socket.on('sendMsgToServer', (data) => {
        console.log('Got a message');
        console.log(data);
        const playerName = player.displayName || player.socketId;
        const msg = data.msg;
        const roomId = data.roomId;
        sendToRoom(roomId, "addToChat", { msg, playerName })
    });

    socket.on('evalServer', function (data) {
        if (!DEBUG)
            return;
        const res = eval(data);
        socket.emit('evalAnswer', res);
    });
});

function sendToRoom(roomId, emitMessage, data) {
    if (roomId in ROOMS) {
        const members = Object.keys(ROOMS[roomId]);
        for (const socketId of members) {
            const socket = CONNECTIONS[socketId]['socket'];
            data.members = members
            data.roomId = roomId;
            console.log(`sending ${emitMessage}`)
            socket.emit(emitMessage, data);
        }
    }
}

setInterval(function () {

    for (const socketId of Object.keys(CONNECTIONS)) {
        const socket = CONNECTIONS[socketId]['socket'];
        const pack = {}
        if ('room' in CONNECTIONS[socketId]) {
            const roomId = CONNECTIONS[socketId]['room'];
            const members = Object.values(ROOMS[roomId]);
            socket.emit("update", { roomId, members, socketId })
        }
        // next step is emit packs to room members with who is in the room

    }
}, 1000);
