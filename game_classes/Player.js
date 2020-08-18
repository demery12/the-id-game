class Player {
    constructor() {
        this.playerId = Math.random();
        this.displayName;
        this.firstName = "";
        this.lastName = "";
        this.roomId = null;
        this.avatar = null;
    }

    inRoom() {
        return this.roomId
    }
}

module.exports = Player;