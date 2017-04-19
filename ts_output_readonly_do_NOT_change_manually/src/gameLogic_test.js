describe("In TicTacToe", function () {
    var X_TURN = 0;
    var O_TURN = 1;
    var NO_ONE_TURN = -1;
    var NO_ONE_WINS = null;
    var X_WIN_SCORES = [1, 0];
    var O_WIN_SCORES = [0, 1];
    var TIE_SCORES = [0, 0];
    function expectException(turnIndexBeforeMove, boardBeforeMove, row, col, previousMoveType) {
        var stateBeforeMove = { board: boardBeforeMove, delta: null,
            lastupdatedrow: null, lastupdatedcol: null,
            nextMoveType: previousMoveType, sourceImages: null };
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
    function expectMove(turnIndexBeforeMove, boardBeforeMove, row, col, boardAfterMove, lastupdatedrow, lastupdatedcol, nextMoveType, previousMoveType, turnIndexAfterMove, endMatchScores) {
        var deltaBoard = { row: row, col: col,
            board: gameLogic.createDelta(boardAfterMove, boardBeforeMove) };
        var expectedMove = {
            turnIndex: turnIndexAfterMove,
            endMatchScores: endMatchScores,
            state: { board: boardAfterMove, delta: deltaBoard,
                lastupdatedrow: lastupdatedrow, lastupdatedcol: lastupdatedcol,
                nextMoveType: nextMoveType, sourceImages: null }
        };
        //let stateBeforeMove: IState = boardBeforeMove ? {board: boardBeforeMove, delta: null} : null;
        var stateBeforeMove = { board: boardBeforeMove, delta: null,
            lastupdatedrow: null, lastupdatedcol: null,
            nextMoveType: previousMoveType, sourceImages: null };
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
                    [4, 4, 4, 4, 4, 4, 0]],
                delta: null,
                nextMoveType: "clickUpdate",
                lastupdatedrow: -1,
                lastupdatedcol: -1,
                sourceImages: null
            }
        };
        expect(angular.equals(move, expectedMove)).toBe(true);
    });
    it("picking 0,4 position from initial state", function () {
        var row = 0;
        var col = 4;
        var lastupdatedrow = 0;
        var lastupdatedcol = 0;
        var previousMoveType = "clickUpdate";
        var nextMoveType = "clickUpdate";
        var boardBeforeMove = [[0, 4, 4, 4, 4, 4, 4], [4, 4, 4, 4, 4, 4, 0]];
        var boardAfterMove = [[1, 5, 5, 5, 0, 4, 4], [4, 4, 4, 4, 4, 4, 0]];
        expectMove(X_TURN, boardBeforeMove, row, col, boardAfterMove, lastupdatedrow, lastupdatedcol, nextMoveType, previousMoveType, X_TURN, NO_ONE_WINS);
    });
    it("picking 0,5 after 0,4 picked from initial state", function () {
        var row = 0;
        var col = 5;
        var lastupdatedrow = 0;
        var lastupdatedcol = 1;
        var previousMoveType = "clickUpdate";
        var nextMoveType = "clickUpdate";
        var boardBeforeMove = [[1, 5, 5, 5, 0, 4, 4],
            [4, 4, 4, 4, 4, 4, 0]];
        var boardAfterMove = [[1, 6, 6, 6, 1, 0, 4],
            [4, 4, 4, 4, 4, 4, 0]];
        expectMove(X_TURN, boardBeforeMove, row, col, boardAfterMove, lastupdatedrow, lastupdatedcol, nextMoveType, previousMoveType, O_TURN, NO_ONE_WINS);
    });
    it("trying to pick opponent's stone", function () {
        expectException(X_TURN, [[1, 5, 5, 5, 0, 4, 4],
            [4, 4, 4, 4, 4, 4, 0]], 1, 4, "clickUpdate");
    });
    it("trying to pick pit same team", function () {
        expectException(X_TURN, [[1, 5, 5, 5, 0, 4, 4],
            [4, 4, 4, 4, 4, 4, 0]], 0, 0, "clickUpdate");
    });
    it("trying to pick pit opponent team", function () {
        expectException(X_TURN, [[1, 5, 5, 5, 0, 4, 4],
            [4, 4, 4, 4, 4, 4, 0]], 1, 6, "clickUpdate");
    });
    it("can't pick from empty hole", function () {
        expectException(O_TURN, [[1, 5, 5, 5, 0, 4, 4],
            [4, 4, 4, 4, 0, 4, 0]], 1, 4, "clickUpdate");
    });
    it("picking 1,2 with same player's turn again", function () {
        var row = 1;
        var col = 2;
        var lastupdatedrow = 1;
        var lastupdatedcol = 6;
        var previousMoveType = "clickUpdate";
        var nextMoveType = "clickUpdate";
        var boardBeforeMove = [[1, 5, 5, 5, 0, 4, 4],
            [4, 4, 4, 4, 4, 4, 0]];
        var boardAfterMove = [[1, 5, 5, 5, 0, 4, 4],
            [4, 4, 0, 5, 5, 5, 1]];
        expectMove(O_TURN, boardBeforeMove, row, col, boardAfterMove, lastupdatedrow, lastupdatedcol, nextMoveType, previousMoveType, O_TURN, NO_ONE_WINS);
    });
    it("repeat case", function () {
        var row = 1;
        var col = 2;
        var lastupdatedrow = 1;
        var lastupdatedcol = 6;
        var previousMoveType = "clickUpdate";
        var nextMoveType = "clickUpdate";
        var boardBeforeMove = [[1, 5, 5, 5, 0, 4, 4],
            [4, 4, 4, 4, 4, 4, 0]];
        var boardAfterMove = [[1, 5, 5, 5, 0, 4, 4],
            [4, 4, 0, 5, 5, 5, 1]];
        expectMove(O_TURN, boardBeforeMove, row, col, boardAfterMove, lastupdatedrow, lastupdatedcol, nextMoveType, previousMoveType, O_TURN, NO_ONE_WINS);
    });
    it("last stone on empty hole with no stones in it's front", function () {
        var row = 0;
        var col = 3;
        var lastupdatedrow = 0;
        var lastupdatedcol = 1;
        var previousMoveType = "clickUpdate";
        var nextMoveType = "clickUpdate";
        var boardBeforeMove = [[1, 0, 5, 2, 0, 4, 4],
            [0, 4, 4, 4, 4, 4, 0]];
        var boardAfterMove = [[1, 1, 6, 0, 0, 4, 4],
            [0, 4, 4, 4, 4, 4, 0]];
        expectMove(X_TURN, boardBeforeMove, row, col, boardAfterMove, lastupdatedrow, lastupdatedcol, nextMoveType, previousMoveType, O_TURN, NO_ONE_WINS);
    });
    it("normal case ", function () {
        var row = 1;
        var col = 5;
        var lastupdatedrow = 0;
        var lastupdatedcol = 4;
        var previousMoveType = "clickUpdate";
        var nextMoveType = "clickUpdate";
        var boardBeforeMove = [[1, 0, 5, 2, 0, 4, 4],
            [4, 4, 4, 4, 4, 4, 0]];
        var boardAfterMove = [[1, 0, 5, 2, 1, 5, 5],
            [4, 4, 4, 4, 4, 0, 1]];
        expectMove(O_TURN, boardBeforeMove, row, col, boardAfterMove, lastupdatedrow, lastupdatedcol, nextMoveType, previousMoveType, O_TURN, NO_ONE_WINS);
    });
    it("the whole circle case", function () {
        var row = 1;
        var col = 2;
        var lastupdatedrow = 1;
        var lastupdatedcol = 0;
        var previousMoveType = "clickUpdate";
        var nextMoveType = "clickUpdate";
        var boardBeforeMove = [[1, 0, 5, 2, 0, 4, 4],
            [4, 4, 11, 4, 4, 4, 0]];
        var boardAfterMove = [[1, 1, 6, 3, 1, 5, 5],
            [5, 4, 0, 5, 5, 5, 1]];
        expectMove(O_TURN, boardBeforeMove, row, col, boardAfterMove, lastupdatedrow, lastupdatedcol, nextMoveType, previousMoveType, X_TURN, NO_ONE_WINS);
    });
    it("no tie", function () {
        var row = 1;
        var col = 4;
        var lastupdatedrow = 1;
        var lastupdatedcol = 5;
        var previousMoveType = "clickUpdate";
        var nextMoveType = "clickUpdate";
        var boardBeforeMove = [[12, 0, 5, 2, 0, 4, 4],
            [4, 4, 11, 4, 1, 1, 12]];
        var boardAfterMove = [[12, 0, 5, 2, 0, 4, 4],
            [4, 4, 11, 4, 0, 2, 12]];
        expectMove(O_TURN, boardBeforeMove, row, col, boardAfterMove, lastupdatedrow, lastupdatedcol, nextMoveType, previousMoveType, X_TURN, NO_ONE_WINS);
    });
    it("tie", function () {
        var row = 1;
        var col = 5;
        var lastupdatedrow = 1;
        var lastupdatedcol = 6;
        var previousMoveType = "clickUpdate";
        var nextMoveType = "transferAll";
        var boardBeforeMove = [[20, 0, 0, 4, 0, 0, 0],
            [0, 0, 0, 0, 0, 1, 23]];
        var boardAfterMove = [[24, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 24]];
        expectMove(O_TURN, boardBeforeMove, row, col, boardAfterMove, lastupdatedrow, lastupdatedcol, nextMoveType, previousMoveType, O_TURN, NO_ONE_WINS);
    });
    // it("X wins", function () {
    //     let row:number = 1;
    //     let col:number = 2;
    //     let lastupdatedrow:number = 1;
    //     let lastupdatedcol:number = 6;
    //     let previousMoveType:string = "clickUpdate";
    //     let nextMoveType:string = "clickUpdate";
    //     let boardBeforeMove:Board = [[14, 0, 0, 0, 0, 0, 0],
    //         [0, 0, 0, 0, 0, 1, 23]];
    //     let boardAfterMove:Board = [[14, 0, 0, 0, 0, 0, 0],
    //         [0, 0, 0, 0, 0, 0, 24]];
    //
    //     expectMove(O_TURN,boardBeforeMove, row, col, boardAfterMove,lastupdatedrow,lastupdatedcol,nextMoveType,previousMoveType,
    //        O_TURN, NO_ONE_WINS);
    //
    //     expectMove(O_TURN, , 1, 5, , NO_ONE_TURN, O_WIN_SCORES);
    // });
    // it("X wins", function () {
    //     let row:number = 1;
    //     let col:number = 2;
    //     let lastupdatedrow:number = 1;
    //     let lastupdatedcol:number = 6;
    //     let previousMoveType:string = "clickUpdate";
    //     let nextMoveType:string = "clickUpdate";
    //     let boardBeforeMove:Board = [[1, 5, 5, 5, 0, 4, 4],
    //         [4, 4, 4, 4, 4, 4, 0]];
    //     let boardAfterMove:Board = [[1, 5, 5, 5, 0, 4, 4],
    //         [4, 4, 0, 5, 5, 5, 1]];
    //
    //     expectMove(O_TURN,boardBeforeMove, row, col, boardAfterMove,lastupdatedrow,lastupdatedcol,nextMoveType,previousMoveType,
    //        O_TURN, NO_ONE_WINS);
    //
    //     expectMove(O_TURN, [[14, 0, 0, 0, 0, 0, 0],
    //         [0, 0, 0, 0, 0, 1, 23]], 1, 5, [[14, 0, 0, 0, 0, 0, 0],
    //         [0, 0, 0, 0, 0, 0, 24]], NO_ONE_TURN, O_WIN_SCORES);
    // });
});
//# sourceMappingURL=gameLogic_test.js.map