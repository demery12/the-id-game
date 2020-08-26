const Members = require('./Members');
const Game = require('./Game');

class Room {
    constructor() {
        this.roomId = Math.random();
        this.members = new Members();
        this.messages = [];
        this.message_counter = 0;
        this.gameStarted = false;
        this.game = null;
        this.assignments = null;
    }

    addMember(player) {
        this.members.addMember(player);
    }

    getMembers() {
        return this.members.getMembers();
    }

    getMemberIds() {
        return this.members.getMemberIds();
    }

    removeMember(player) {
        this.members.removeMember(player);
    }

    addMessage(sender, message) {
        const msg = {
            id: this.message_counter,
            sender,
            text: message
        }
        this.message_counter += 1;
        this.messages.push(msg);
    }

    getMessages() {
        return this.messages;
    }

    startGame() {
        this.game = new Game(this.roomId, this.members);
        this.game.assignIds();
        this.game.nextPlayer();
        this.gameStarted = true;

    }
}

module.exports = Room;
