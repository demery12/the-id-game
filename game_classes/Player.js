class Player {
    constructor() {
        this.playerId = Math.random();
        this.displayName = null;
        this.firstName = "";
        this.lastName = "";
        this.roomId = null;
        this.avatar = null;
    }

    inRoom() {
        return this.roomId
    }

    getFormattedName() {
        return `${this.firstName} ${this.lastName}`
    }
}

module.exports = Player;