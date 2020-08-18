class Player {
    constructor() {
        this.playerId = Math.random();
        this.socketId;
        this.socket;
        this.displayName;
        this.firstName = "";
        this.lastName = "";
        this.room = null;
        this.avatar = null;
    }

}

module.exports = Player;