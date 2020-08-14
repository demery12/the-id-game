// Requires socket.io, which is included in the html

const socket = io()
// adding room creation
function createRoom() {
	socket.emit('createRoom');
}

socket.on('roomCreated', (data) => {
	console.log(`A room was created with roomId: ${data.roomId}`)
	joinedRoom(data);
});

function joinRoom() {
	const roomId = document.getElementById("join-room").value;
	console.log(roomId);
	socket.emit('joinRoom', { roomId });

}

function joinedRoom(data) {
	roomData.roomId = data.roomId;
	roomData.roomMembers = data.members;
	roomData.inRoom = true;
}

socket.on('roomJoined', (data) => {
	console.log(data);
	joinedRoom(data);
});

var roomData = new Vue({
	el: "#room-data",
	data: {
		inRoom: false,
		roomId: 0,
		roomMembers: []
    }
})
var characterCreation = new Vue({
	el: "#character-creation",
	data: {
		visible: true,
		userId: 0
    }
})