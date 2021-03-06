class Members {
    constructor() {
        this.members = {};
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

    getMember(playerId) {
        return this.members[playerId];
    }
    removeMember(player) {
        delete this.members[player.playerId];
    }
}

module.exports = Members;
