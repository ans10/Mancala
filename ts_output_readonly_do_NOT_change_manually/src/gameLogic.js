var gameService = gamingPlatform.gameService;
var alphaBetaService = gamingPlatform.alphaBetaService;
var translate = gamingPlatform.translate;
var resizeGameAreaService = gamingPlatform.resizeGameAreaService;
var log = gamingPlatform.log;
var dragAndDropService = gamingPlatform.dragAndDropService;
var gameLogic;
(function (gameLogic) {
    gameLogic.ROWS = 2;
    gameLogic.COLS = 7;
    /** Returns the initial TicTacToe board, which is a ROWSxCOLS matrix containing ''. */
    function getInitialBoard() {
        var board = [];
        for (var i = 0; i < gameLogic.ROWS; i++) {
            board[i] = [];
            for (var j = 0; j < gameLogic.COLS; j++) {
                board[i][j] = 4;
            }
        }
        board[0][0] = 0;
        board[1][6] = 0;
        return board;
    }
    gameLogic.getInitialBoard = getInitialBoard;
    function getPseudoInitialBoard() {
        //pseudo Initial board for testing the end condition
        var board = [];
        for (var i = 0; i < gameLogic.ROWS; i++) {
            board[i] = [];
            for (var j = 0; j < gameLogic.COLS; j++) {
                board[i][j] = 0;
            }
        }
        board[1][5] = 0;
        board[1][4] = 0;
        board[0][0] = 23;
        board[1][6] = 24;
        board[0][1] = 1;
        return board;
    }
    gameLogic.getPseudoInitialBoard = getPseudoInitialBoard;
    function getInitialState() {
        console.log("Initial state method called in gameLogic");
        return { board: getInitialBoard(), delta: null };
    }
    gameLogic.getInitialState = getInitialState;
    /**
     * Returns true if the game ended in a tie because there are no empty cells.
     * E.g., isTie returns true for the following board:
     *     [['X', 'O', 'X'],
     *      ['X', 'O', 'O'],
     *      ['O', 'X', 'X']]
     */
    function isTie(board) {
        if (board[0][0] === board[1][6]) {
            return true;
        }
        // No empty cells, so we have a tie!
        return false;
    }
    /**
     * Return the winner (either 'X' or 'O') or '' if there is no winner.
     * The board is a matrix of size 3x3 containing either 'X', 'O', or ''.
     * E.g., getWinner returns 'X' for the following board:
     *     [['X', 'O', ''],
     *      ['X', 'O', ''],
     *      ['X', '', '']]
     */
    function transferAllLeft(board) {
        console.log("Transferring the remaining stuff into appropriate store");
        var lastupdatedr = 0;
        var lastupdatedc = 0;
        var boardAfterMove = angular.copy(board);
        for (var j = 1; j < gameLogic.COLS; j++) {
            if (boardAfterMove[0][j] > 0) {
                boardAfterMove[0][0] += boardAfterMove[0][j];
                lastupdatedr = 0;
                lastupdatedc = j;
                boardAfterMove[0][j] = 0;
            }
        }
        for (var j = 0; j < gameLogic.COLS - 1; j++) {
            if (boardAfterMove[1][j] > 0) {
                boardAfterMove[1][6] += boardAfterMove[1][j];
                lastupdatedr = 1;
                lastupdatedc = j;
                boardAfterMove[1][j] = 0;
            }
        }
        var updatedState = { board: boardAfterMove, lastupdatedrow: lastupdatedr, lastupdatedcolumn: lastupdatedc };
        return updatedState;
    }
    function getWinner(board) {
        console.log("in Get the winner game Logic");
        if (board[0][0] > board[1][6]) {
            return 0;
        }
        else if (board[0][0] === board[1][6]) {
            return -1;
        }
        else {
            return 1;
        }
    }
    function isEndState(board) {
        var firstrow = true;
        var secondrow = true;
        for (var j = 1; j < gameLogic.COLS; j++) {
            if (board[0][j] !== 0) {
                firstrow = false;
                break;
            }
        }
        for (var j = 0; j < gameLogic.COLS - 1; j++) {
            if (board[1][j] !== 0) {
                secondrow = false;
                break;
            }
        }
        return firstrow || secondrow;
    }
    function updateBoard(board, row, col) {
        console.log("In update board in gameLogic");
        var boardAfterMove = angular.copy(board);
        var updatedState = null;
        var i;
        var j;
        i = row;
        j = col;
        var val;
        val = boardAfterMove[i][j];
        boardAfterMove[i][j] = 0;
        while (val > 0) {
            if (i === 0) {
                j--;
                if (row === 0 && j < 0) {
                    i = i + 1;
                    j = 0;
                }
                else if (row === 1 && j < 1) {
                    i = i + 1;
                    j = 0;
                }
                boardAfterMove[i][j] += 1;
            }
            else {
                j++;
                if (row === 0 && j > 5) {
                    i = i - 1;
                    j = 6;
                }
                else if (row === 1 && j > 6) {
                    i = i - 1;
                    j = 6;
                }
                boardAfterMove[i][j] = boardAfterMove[i][j] + 1;
            }
            val--;
        }
        // empty hole on last chance handled
        if (boardAfterMove[i][j] === 1 && row === i &&
            !((i === 0 && j === 0) || (i === 1 && j === 6))) {
            if (i === 0 && boardAfterMove[1 - i][j - 1] > 0) {
                boardAfterMove[i][j] = 0;
                boardAfterMove[0][0] += boardAfterMove[1 - i][j - 1] + 1;
                boardAfterMove[1 - i][j - 1] = 0;
            }
            if (i === 1 && boardAfterMove[1 - i][j + 1] > 0) {
                boardAfterMove[i][j] = 0;
                boardAfterMove[1][6] += boardAfterMove[1 - i][j + 1] + 1;
                boardAfterMove[1 - i][j + 1] = 0;
            }
        }
        updatedState = { board: boardAfterMove, lastupdatedrow: i, lastupdatedcolumn: j };
        return updatedState;
    }
    function nextTurn(turnIndex, row, col) {
        if ((row === 0 && col === 0) || (row === 1 && col === 6)) {
            return turnIndex;
        }
        else {
            console.log("Previous turnIndex value is " + turnIndex);
            return 1 - turnIndex;
        }
    }
    /**
     * Returns the move that should be performed when player
     * with index BeforeMove makes a move in cell row X col.
     */
    function createMove(stateBeforeMove, row, col, turnIndexBeforeMove) {
        console.log("in create move in gameLogic");
        if (!stateBeforeMove) {
            stateBeforeMove = getInitialState();
        }
        var board = stateBeforeMove.board;
        console.log("Turnindexbeforemove: " + turnIndexBeforeMove + "row: " + row);
        if (board[row][col] === 0 || (row === 0 && col === 0) || (row === 1 && col === 6) ||
            row !== turnIndexBeforeMove) {
            throw new Error("Making an invalid move!");
        }
        var updatedState = updateBoard(board, row, col);
        var boardAfterMove = updatedState.board;
        var endMatchScores;
        var turnIndex;
        if (isEndState(boardAfterMove)) {
            //Game over
            console.log("Game's end state detected in Game Logic");
            updatedState = transferAllLeft(boardAfterMove);
            boardAfterMove = updatedState.board;
            var winner = getWinner(boardAfterMove);
            turnIndex = -1;
            endMatchScores = winner === 0 ? [1, 0] : winner === 1 ? [0, 1] : [0, 0];
        }
        else {
            //Game continues
            turnIndex = nextTurn(turnIndexBeforeMove, updatedState.lastupdatedrow, updatedState.lastupdatedcolumn);
            console.log("TurnIndex value is: " + turnIndex);
            endMatchScores = null;
        }
        /*if (getWinner(board) !== '' || isTie(board)) {
          throw new Error("Can only make a move if the game is not over!");
        }*/
        var delta = { row: row, col: col };
        var state = { delta: delta, board: boardAfterMove };
        console.info("Returning createMove successfully");
        return {
            endMatchScores: endMatchScores,
            turnIndex: turnIndex,
            state: state
        };
    }
    gameLogic.createMove = createMove;
    function createInitialMove() {
        return { endMatchScores: null, turnIndex: 0,
            state: getInitialState() };
    }
    gameLogic.createInitialMove = createInitialMove;
    function forSimpleTestHtml() {
        var move = gameLogic.createMove(null, 0, 0, 0);
        log.log("move=", move);
    }
    gameLogic.forSimpleTestHtml = forSimpleTestHtml;
})(gameLogic || (gameLogic = {}));
//# sourceMappingURL=gameLogic.js.map