class Room {
    constructor() {
        this.roomId = Math.random();
        this.members = {};
        this.messages = [];
        this.message_counter = 0;
    }

    addMember(player) {
        this.members[player.playerId] = player;
    }

    getMembers() {
        return Object.values(this.members);
    }

    getMemberIds() {
        return Object.keys(this.members);
    }

    removeMember(player) {
        delete this.members[player.playerId];
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
}

module.exports = Room;
