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
	room.roomId = data.roomId;
	room.roomMembers = data.members;
	room.displayMembers = data.members.map(member => member.displayName || member.playerId)
	room.inRoom = true;
	room.messages = data.messages;
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

var ChatComponent = {
	data: function () {
		return {
			// messages: [{ id: 0, sender: "Room", text: "Hello" }],
			chatInput: ""
		}
	},
	props: ['messages'],
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
					roomId: room.roomId
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
};
var room = new Vue({
	el: "#room-data",
	components: {
		'chat-component': ChatComponent
	},
	data: {
		inRoom: false,
		roomId: 0,
		roomMembers: [],
		displayMembers: [],
		messages: [{ id: 0, sender: "Room", text: "Hello" }]
	}
});

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
					roomId: room.roomId
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
