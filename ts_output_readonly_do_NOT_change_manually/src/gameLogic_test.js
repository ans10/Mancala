describe("In TicTacToe", function () {
    var X_TURN = 0;
    var O_TURN = 1;
    var NO_ONE_TURN = -1;
    var NO_ONE_WINS = null;
    var X_WIN_SCORES = [1, 0];
    var O_WIN_SCORES = [0, 1];
    var TIE_SCORES = [0, 0];
    function expectException(turnIndexBeforeMove, boardBeforeMove, row, col) {
        var stateBeforeMove = boardBeforeMove ? { board: boardBeforeMove, delta: null } : null;
        // We expect an exception to be thrown :)
        var didThrowException = false;
        try {
            gameLogic.createMove(stateBeforeMove, row, col, turnIndexBeforeMove);
        }
        catch (e) {
            didThrowException = true;
        }
        if (!didThrowException) {
            throw new Error("We expect an illegal move, but createMove didn't throw any exception!");
        }
    }
    function expectMove(turnIndexBeforeMove, boardBeforeMove, row, col, boardAfterMove, turnIndexAfterMove, endMatchScores) {
        var expectedMove = {
            turnIndex: turnIndexAfterMove,
            endMatchScores: endMatchScores,
            state: { board: boardAfterMove, delta: { row: row, col: col } }
        };
        var stateBeforeMove = boardBeforeMove ? { board: boardBeforeMove, delta: null } : null;
        var move = gameLogic.createMove(stateBeforeMove, row, col, turnIndexBeforeMove);
        console.log(move.state.board);
        expect(angular.equals(move, expectedMove)).toBe(true);
    }
    it("Initial move", function () {
        var move = gameLogic.createInitialMove();
        var expectedMove = {
            turnIndex: X_TURN,
            endMatchScores: NO_ONE_WINS,
            state: { board: [[0, 4, 4, 4, 4, 4, 4],
                    [4, 4, 4, 4, 4, 4, 0]], delta: null }
        };
        expect(angular.equals(move, expectedMove)).toBe(true);
    });
    it("picking 0,4 position from initial state", function () {
        expectMove(X_TURN, [[0, 4, 4, 4, 4, 4, 4], [4, 4, 4, 4, 4, 4, 0]], 0, 4, [[1, 5, 5, 5, 0, 4, 4],
            [4, 4, 4, 4, 4, 4, 0]], X_TURN, NO_ONE_WINS);
    });
    it("picking 0,5 after 0,4 picked from initial state", function () {
        expectMove(X_TURN, [[1, 5, 5, 5, 0, 4, 4],
            [4, 4, 4, 4, 4, 4, 0]], 0, 5, [[1, 6, 6, 6, 1, 0, 4],
            [4, 4, 4, 4, 4, 4, 0]], O_TURN, NO_ONE_WINS);
    });
    it("trying to pick opponent's stone", function () {
        expectException(X_TURN, [[1, 5, 5, 5, 0, 4, 4],
            [4, 4, 4, 4, 4, 4, 0]], 1, 4);
    });
    it("trying to pick pit same team", function () {
        expectException(X_TURN, [[1, 5, 5, 5, 0, 4, 4],
            [4, 4, 4, 4, 4, 4, 0]], 0, 0);
    });
    it("trying to pick pit opponent team", function () {
        expectException(X_TURN, [[1, 5, 5, 5, 0, 4, 4],
            [4, 4, 4, 4, 4, 4, 0]], 1, 6);
    });
    it("can't pick from empty hole", function () {
        expectException(O_TURN, [[1, 5, 5, 5, 0, 4, 4],
            [4, 4, 4, 4, 0, 4, 0]], 1, 4);
    });
    it("picking 1,2 with same player's turn again", function () {
        expectMove(O_TURN, [[1, 5, 5, 5, 0, 4, 4],
            [4, 4, 4, 4, 4, 4, 0]], 1, 2, [[1, 5, 5, 5, 0, 4, 4],
            [4, 4, 0, 5, 5, 5, 1]], O_TURN, NO_ONE_WINS);
    });
    it("last stone on empty hole", function () {
        expectMove(X_TURN, [[1, 0, 5, 2, 0, 4, 4],
            [4, 4, 4, 4, 4, 4, 0]], 0, 3, [[6, 0, 6, 0, 0, 4, 4],
            [0, 4, 4, 4, 4, 4, 0]], O_TURN, NO_ONE_WINS);
    });
    it("last stone on empty hole with no stones in it's front", function () {
        expectMove(X_TURN, [[1, 0, 5, 2, 0, 4, 4],
            [0, 4, 4, 4, 4, 4, 0]], 0, 3, [[1, 1, 6, 0, 0, 4, 4],
            [0, 4, 4, 4, 4, 4, 0]], O_TURN, NO_ONE_WINS);
    });
    it("normal case ", function () {
        expectMove(O_TURN, [[1, 0, 5, 2, 0, 4, 4],
            [4, 4, 4, 4, 4, 4, 0]], 1, 5, [[1, 0, 5, 2, 1, 5, 5],
            [4, 4, 4, 4, 4, 0, 1]], X_TURN, NO_ONE_WINS);
    });
    it("the game ties when there are no more empty cells", function () {
        expectMove(O_TURN, [[1, 0, 5, 2, 0, 4, 4],
            [4, 4, 11, 4, 4, 4, 0]], 1, 2, [[1, 1, 6, 3, 1, 5, 5],
            [5, 4, 0, 5, 5, 5, 1]], X_TURN, NO_ONE_WINS);
    });
    it("no tie", function () {
        expectMove(O_TURN, [[12, 0, 5, 2, 0, 4, 4],
            [4, 4, 11, 4, 1, 1, 12]], 1, 4, [[12, 0, 5, 2, 0, 4, 4],
            [4, 4, 11, 4, 0, 2, 12]], X_TURN, NO_ONE_WINS);
    });
    it("tie", function () {
        expectMove(O_TURN, [[24, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 1, 23]], 1, 5, [[24, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 24]], NO_ONE_TURN, TIE_SCORES);
    });
    it("X wins", function () {
        expectMove(O_TURN, [[14, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 1, 23]], 1, 5, [[14, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 24]], NO_ONE_TURN, O_WIN_SCORES);
    });
    it("X wins", function () {
        expectMove(O_TURN, [[14, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 1, 23]], 1, 5, [[14, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 24]], NO_ONE_TURN, O_WIN_SCORES);
    });
});
//# sourceMappingURL=gameLogic_test.js.map