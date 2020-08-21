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

const PLAYERS = {}; // { playerId : Player}
const SOCKETS = {}
const ROOMS = {}; // { roomId: Room }

const io = require('socket.io')(serv, {});

io.sockets.on('connection', function (socket) {
    const player = new Player(socket);
    PLAYERS[player.playerId] = player;
    SOCKETS[player.playerId] = socket;
    socket.emit('userIdAssignment', { userId: player.playerId });

    socket.on('disconnect', function () {
        const roomId = player.roomId;
        if (roomId) {
            ROOMS[roomId].removeMember(player);
            const remainingPlayers = ROOMS[roomId].getMembers();
            if (remainingPlayers.length === 0) {
                delete ROOMS[roomId];
            }
        }
        delete SOCKETS[player.playerId];
        delete PLAYERS[player.playerId];
        console.log(ROOMS);
    });

    /* Room must exist in ROOMS */
    function joinRoom(roomId) {
        player.roomId = roomId;
        ROOMS[roomId].addMember(player);
        console.log(ROOMS[roomId].getMembers());
        socket.emit('roomJoined', {
            roomId,
            members: ROOMS[roomId].getMembers()
        });
    }
    // Room Creation
    socket.on('createRoom', () => {
        const room = new Room();
        const roomId = room.roomId;
        ROOMS[roomId] = room;
        joinRoom(roomId);
        console.log(`A new room was created by ${player.playerId}`)
    });

    // Room Joining
    socket.on('joinRoom', (data) => {
        const roomId = data.roomId;
        if (roomId in ROOMS) {
            joinRoom(roomId);
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
        const playerName = player.displayName || player.playerId;
        const msg = data.msg;
        const roomId = data.roomId;
        if (roomId in ROOMS) {
            ROOMS[roomId].addMessage(playerName, msg);
        }
        sendToRoom(roomId, "addToChat", { msg, playerName })
    });

    socket.on('evalServer', function (data) {
        if (!DEBUG)
            return;
        const res = eval(data);
        socket.emit('evalAnswer', res);
    });

    socket.on('startGame', function () {
        const room = ROOMS[player.roomId];
        room.gameStarted = true;
        room.assignIds();
    });

    socket.on('nextPlayer', function () {

    });
});

function sendToRoom(roomId, emitMessage, data) {
    if (roomId in ROOMS) {
        const members = ROOMS[roomId].getMembers();
        for (const player of members) {
            const socket = SOCKETS[player.playerId];
            data.members = members
            data.roomId = roomId;
            console.log(`sending ${emitMessage}`)
            socket.emit(emitMessage, data);
        }
    }
}

setInterval(function () {
    for (const playerId of Object.keys(PLAYERS)) {
        const player = PLAYERS[playerId];
        const socket = SOCKETS[playerId];
        if (player.inRoom()) {
            const roomId = player.roomId;
            const room = ROOMS[roomId]
            const members = room.getMembers();
            const messages = room.getMessages();
            if (room.gameStarted) {
                const assignments = room.assignments;
                const playerAssignment = assignments[playerId];
                socket.emit('gameUpdate', { roomId, members, messages, playerAssignment })
            } else {
                socket.emit("update", { roomId, members, messages })
            }
        }
    }
}, 1000);
