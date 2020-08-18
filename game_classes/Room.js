class Room {
    constructor() {
        this.roomId = Math.random();
        this.members = [];
        this.messages = [];
    }

    addMember(playerId) {
        this.members.push(playerId)
    }

    addMessage(message) {
        this.messsages.push(message);
    }
}

module.exports = Room;
