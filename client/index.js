// Requires socket.io, which is included in the html

const socket = io()

var ChatComponent = {
	data: function () {
		return {
			// messages: [{ id: 0, sender: "Room", text: "Hello" }],
			chatInput: ""
		}
	},
	props: ['messages', 'roomId'],
	template: `<div id="chat-container" class = "container">
				<h2>Chat:</h2>
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
					roomId: this.roomId
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
var roomComponent = {
	components: {
		'chat-component': ChatComponent
	},
	props: ['gameStarted'],
	data: function () {
		return {
			inRoom: false,
			roomId: 0,
			roomMembers: [],
			displayMembers: [],
			messages: [{ id: 0, sender: "Room", text: "Hello" }]
        }
	},
	template:`<div id="room-data" class="container">
				<template v-if="inRoom">
					<span>You are in room: <span id="room-id">{{ roomId }}</span></span>					
					<span>Other people in this room: {{ displayMembers }}</span>
					<div style="text-align:center;">					
						<button v-if="!gameStarted" @click="startGame">Start Game</button>
					</div>
					<chat-component v-bind:messages="messages" v-bind:roomId="roomId"></chat-component>
				</template>
				<template v-else>
					<div class="join-room">
						<label for="join-room">Join an existing room</label>
						<input type="text" id="join-room" placeholder="Enter a room code">
						<button @click="joinRoom" >Join</button>
					</div>
					<div class="create-room">
						<label for="create-room">Or create a new room</label>
						<button id="create-room" @click="createRoom">Create</button>
					</div>
				</template>
			</div>`,
	created: function () {
		socket.on('roomJoined', (data) => {
			console.log(data);
			this.joinedRoom(data);
		});

		socket.on('update', (data) => {
			this.joinedRoom(data);
		});

		socket.on('roomCreated', (data) => {
			console.log(`A room was created with roomId: ${data.roomId}`)
			this.joinedRoom(data);
		});
	},
	methods: {
		joinRoom: function () {
			const roomId = document.getElementById("join-room").value.trim();
			socket.emit('joinRoom', { roomId });
		},
		joinedRoom: function(data) {
			this.roomId = data.roomId;
			this.roomMembers = data.members;
			this.displayMembers = data.members.map(member => member.displayName || member.playerId)
			this.inRoom = true;
			this.messages = data.messages;
		},
		createRoom: function() {
			socket.emit('createRoom');
		},
		startGame: function () {
			this.$emit('start-game')
        }
    }
};

var profileCreation = {
	data: function () {
		return {
			userId: 0,
			firstName: "",
			lastName: "",
			displayName: "",
			errors: []
		}
	},
	template:`<div id="character-creation">
					<h3>Create Your Game Profile</h3>
					<span>Your user id is {{ userId }} (that is a lucky one)</span>
					<br>
					  <p v-if="errors.length">
						<b>Please fill in the missing fields:</b>
						<ul>
						  <li v-for="error in errors">{{ error }}</li>
						</ul>
					  </p>
					<br>
					<label for="first-name">First Name: </label>
					<input v-model.trim="firstName" type="text" id="first-name">
					<br>
					<label for="last-name">Last Name: </label>
					<input v-model.trim="lastName" type="text" id="last-name">
					<br>
					<label for="display-name">Display Name:</label>
					<input v-model.trim="displayName" type="text" id="display-name">
					<br>
					<button @click="createProfile" id="update-profile">Update</button>
				</div>
			</div>`,
	created: function () {
		socket.on('userIdAssignment', (data) => {
			this.userId = data.userId;
		});
	},
	methods: {
		createProfile: function () {
			this.errors = [];
			if (this.firstName == "") {
				this.errors.push("First name is required");
			}

			if (this.lastName == "") {
				this.errors.push("Last name is required");
			}

			if (this.displayName == "") {
				this.errors.push("Display name is required");
			}
			if (this.errors.length === 0) {
				socket.emit('profileUpdate', {
					firstName: this.firstName,
					lastName: this.lastName,
					displayName: this.displayName

				});
				this.$emit('profile-created');
            }
		}
    }
};

var gameComponent = {
	data: function () {
		return {
			players: [],
			assignment: [],
			round: 0,
			question: "",
			currentPlayer: "",
			isCurrentPlayer: false,
			gameOver: false

        }
	},
	created: function () {
		socket.on('gameUpdate', (data) => {
			this.gameUpdate(data);	
		});

		socket.on('gameOver', () => {
			this.gameOver = true;
		});
	},
	methods: {
		gameUpdate: function (data) {
			this.assignment = data.assignment;
			this.round = data.round;
			this.question = data.question;
			this.currentPlayer = data.currentPlayer;
			this.isCurrentPlayer = data.isCurrentPlayer;
		},
		nextPlayer: function () {
			socket.emit('nextPlayer');
        }
    },
	template: `<div>
				<h4 v-if="!gameOver">Round {{ round }}</h4>
				<h4>Your assignments are {{ assignment[0] }} and {{ assignment[1] }}</h4>
				<h3 v-if="!gameOver">Question: {{ question }}</h3>
				<h4 v-if="!gameOver">{{ currentPlayer.displayName }}, you are up!</h4>
				<button v-if="isCurrentPlayer && !gameOver" @click="nextPlayer">Done Speaking</button>
				<h3 v-if="gameOver">Discuss your guesses!</h3> 
			   </div>`
}

var vm = new Vue({
	el: "#app",
	components: {
		'profile-creation': profileCreation,
		'room-component': roomComponent,
		'chat-component': ChatComponent,
		'game-component': gameComponent
	},
	data: {
		profileComplete: false,
		gameStarted: false
	},
	methods: {
		updateProfileComplete: function () {
			this.profileComplete = true;
		},
		startGame: function () {
			socket.emit('startGame')
			this.gameStarted = true;
        }
	},
	created: function () {
		socket.on('gameUpdate', () => this.gameStarted = true);
    }
});