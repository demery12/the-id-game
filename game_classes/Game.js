class Game {
    constructor(roomId, members) {
        this.roomId = roomId;
        this.members = members;
        this.gameStarted = false;
        this.assignments = null;
        this.currentPlayer = null;
        this.currentPlayerIndex = 0
        this.round = 0;
        this.numberOfRounds = 3;
        this.questions = ["How did these two meet?", "What was their first date like?", "What is their parenting style?"];
        this.gameOver = false;
    }

    nextPlayer() {
        if (this.currentPlayerIndex == this.members.getMemberIds().length) {
            this.currentPlayerIndex = 0;
            this.round += 1
            if (this.round == this.numberOfRounds) {
                this.endGame();
            }
        }
        this.currentPlayer = this.members.getMembers()[this.currentPlayerIndex];
        this.currentPlayerIndex += 1;
        return this.currentPlayer;
    }

    getAssignmentByPlayerId(playerId) {
        return this.assignments[playerId];
    }

    getQuestion() {
        return this.questions[this.round];
    }

    getRound() {
        return this.round;
    }

    getCurrentPlayer() {
        return this.currentPlayer
    }

    assignIds() {
        const players = this.members.getMemberIds();
        players.push(...players);
        const assignments = {};
        for (const memberId of this.members.getMemberIds()) {
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

    endGame() {
        this.gameOver = true;
    }
}

module.exports = Game;
