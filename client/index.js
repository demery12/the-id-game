// Requires socket.io, which is included in the html

const socket = io()
// adding room creation

socket.on('userIdAssignment', (data) => {
	characterCreation.userId = data.userId;
});

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
	roomData.displayMembers = data.members.map(member => member.displayName || member.socketId)
	roomData.inRoom = true;
}

socket.on('roomJoined', (data) => {
	console.log(data);
	joinedRoom(data);
});

socket.on('update', (data) => {
	joinedRoom(data);
});

function updateProfile() {
	socket.emit('profileUpdate', {
		firstName: characterCreation.firstName,
		lastName: characterCreation.lastName,
		displayName: characterCreation.displayName

    })
}
// Trying to bind the chat input into this vue

var chat = Vue.component('chat-component', {
	data: function () {
		return {
			messages: [{ id: 0, sender: "Room", text: "Hello" }],
			chatInput: ""
		}
	},
	template: `<div id="chat-container" class = "container">
				<div id="chat-text" style="width:500px; height:100px; overflow-y:scroll" >
					<div v-for="message in messages" :key="message.id">{{message.sender}}: {{ message.text }}</div>
			    </div >
				<form v-on:submit.prevent="chatFormSubmit" id="chat-form">
					<input v-model="chatInput" id="chat-input" type="text" style="width:500px"></input>
				</form>
			  </div >`,
	methods: {
		chatFormSubmit: function () {
			if (this.chatInput[0] === '/') {
				socket.emit('evalServer', this.chatInput.slice(1));
			}
			else {
				socket.emit('sendMsgToServer', {
					msg: this.chatInput,
					roomId: roomData.roomId
				});
            }
			this.chatInput = '';
		},
		addMessage: function (message) {
			this.messages.push(message);
        }
	},
	created: function () {
		let messageId = 1;
		socket.on('addToChat', (data) => {
			console.log("got a message");
			console.log(data);
			this.messages.push({
				id: messageId,
				sender: data.playerName,
				text: data.msg
			});
			messageId += 1;
		});
    }
});
var roomData = new Vue({
	el: "#room-data",
	data: {
		inRoom: false,
		roomId: 0,
		roomMembers: [],
		displayMembers: []
    }
})
var characterCreation = new Vue({
	el: "#character-creation",
	data: {
		visible: true,
		userId: 0,
		firstName: "",
		lastName: "",
		displayName: ""
    }
})



/*
var chat = new Vue({
	e1: "#chat-container",
	data: {
		chatText: "",
		chatInput: "",
	},
	methods: {
		chatFormSubmit: function (event) {
			console.log("ooooo")
			if (chatInput.value[0] === '/')
				socket.emit('evalServer', chatInput.value.slice(1));
			else
				socket.emit('sendMsgToServer', {
					msg: chatInput.value,
					roomId: roomData.roomId
				});
			data.chatInput = '';
        }
    }
})

socket.on('addToChat', (data) => {
	chat.chatText += '<div>' + data.playerName + ': ' + data.msg + '</div>';
});

socket.on('evalAnswer', function (data) {
	console.log(data);
});
*/
