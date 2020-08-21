const Game = require('../game_classes/Game');
const Members = require('../game_classes/Members');
const Player = require('../game_classes/Player');

let test_game;

beforeEach(() => {
    const test_members = new Members();
    for (let i = 0; i < 10; i++) {
        const player = new Player()
        player.displayName = String(i);
        player.firstName = String(i);
        player.lastName = String(i);
        test_members.addMember(player);
    }
    test_game = new Game(101, test_members)
});

test('Testing assignIds runs', () => {
    test_game.assignIds()
    expect(test_game.assignments).toEqual(expect.any(Object));
})