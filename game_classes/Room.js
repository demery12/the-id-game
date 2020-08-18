class Room {
    constructor() {
        this.roomId = Math.random();
        this.members = {};
        this.messages = [];
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

    addMessage(message) {
        this.messsages.push(message);
    }
}

module.exports = Room;
