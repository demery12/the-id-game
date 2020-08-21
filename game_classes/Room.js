class Room {
    constructor() {
        this.roomId = Math.random();
        this.members = {};
        this.messages = [];
        this.message_counter = 0;
        this.gameStarted = false;
        this.assignments = null;
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

    assignIds() {
        const players = this.getMemberIds();
        players.push(...players);
        const assignments = {};
        for (const memberId of this.getMemberIds()) {
            assignments[memberId] = [];
        }
        for (const player of Object.keys(assignments)) {
            let newAssignmentIndex = Math.floor(Math.random() * players.length);
            let newAssignment = players[newAssignmentIndex];
            assignments[player].push(newAssignment);
            players.splice(newAssignmentIndex, 1);

            newAssignmentIndex = Math.floor(Math.random() * players.length);
            newAssignment = players[newAssignmentIndex];
            assignments[player].push(newAssignment);
            players.splice(newAssignmentIndex, 1);
        } 
        this.assignments = assignments;
    }
}

module.exports = Room;
