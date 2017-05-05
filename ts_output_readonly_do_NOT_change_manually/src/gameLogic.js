var MoveType = {
    1: "clickUpdate",
    2: "emptyHole",
    3: "transferAll"
};
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
    gameLogic.candy1 = "imgs/purplecandy.png";
    gameLogic.candy2 = "imgs/bluecandy.png";
    gameLogic.candy3 = "imgs/greencandy.png";
    gameLogic.candy4 = "imgs/redcandy.png";
    function getInitialSource() {
        console.log("In initialize source method");
        var sourceImages;
        sourceImages = [];
        for (var rowNo = 0; rowNo < 2; rowNo++) {
            sourceImages[rowNo] = [];
            for (var colNo = 0; colNo < 7; colNo++) {
                sourceImages[rowNo][colNo] = [];
                for (var candyNo = 0; candyNo < 48; candyNo++) {
                    sourceImages[rowNo][colNo][candyNo] = gameLogic.candy1;
                }
            }
        }
        for (var rowNo = 0; rowNo < 2; rowNo++) {
            for (var colNo = 0; colNo < 7; colNo++) {
                if (!((rowNo == 0 && colNo == 0) || (rowNo == 1 && colNo == 6))) {
                    sourceImages[rowNo][colNo][0] = gameLogic.candy1;
                    sourceImages[rowNo][colNo][1] = gameLogic.candy2;
                    sourceImages[rowNo][colNo][2] = gameLogic.candy3;
                    sourceImages[rowNo][colNo][3] = gameLogic.candy4;
                }
            }
        }
        return sourceImages;
    }
    // function getpseudoInitialSource():string[][][]{
    //   console.log("In initialize source method");
    //   board[1][5] = 0;
    //   board[1][4] = 3;
    //   board[0][0] = 20;
    //   board[1][6] = 24;
    //   board[0][1] = 1;
    //
    //   let sourceImages:string[][][];
    //   sourceImages = [];
    //   let rowNo = 1;
    //   let colNo = 5;
    //   sourceImages[rowNo][colNo] = [];
    //   rowNo = 1;
    //   colNo = 4;
    //   for(int i=0;i<3;i++){
    //     sourceImages
    //   }
    //   for(let rowNo=0;rowNo<2;rowNo++){
    //     sourceImages[rowNo]=[];
    //     for(let colNo=0;colNo<7;colNo++){
    //       sourceImages[rowNo][colNo]=[];
    //       for(let candyNo=0;candyNo<48;candyNo++){
    //          sourceImages[rowNo][colNo][candyNo] = candy1;
    //       }
    //     }
    //   }
    //   for(let rowNo=0;rowNo<2;rowNo++){
    //     for(let colNo=0;colNo<7;colNo++){
    //       if(!((rowNo==0 && colNo==0) || (rowNo==1 && colNo==6))){
    //         sourceImages[rowNo][colNo][0] = candy1;
    //         sourceImages[rowNo][colNo][1] = candy2;
    //         sourceImages[rowNo][colNo][2] = candy3;
    //         sourceImages[rowNo][colNo][3] = candy4;
    //
    //       }
    //     }
    //   }
    //   return sourceImages;
    // }
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
        board[1][5] = 1;
        board[1][4] = 3;
        board[0][0] = 20;
        board[1][1] = 2;
        board[0][2] = 14;
        board[0][1] = 0;
        return board;
    }
    gameLogic.getPseudoInitialBoard = getPseudoInitialBoard;
    function getInitialState() {
        console.log("Initial state method called in gameLogic");
        return { board: getInitialBoard(), delta: null, deltaArray: null, lastupdatedrow: -1,
            lastupdatedcol: -1, nextMoveType: "clickUpdate", sourceImages: getInitialSource(), previousTurnIndex: null };
    }
    gameLogic.getInitialState = getInitialState;
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
        var deltaBoard = createDelta(boardAfterMove, board);
        var delta = { board: deltaBoard, row: lastupdatedr, col: lastupdatedc, sourceImages: null };
        var updatedState = { board: boardAfterMove, delta: delta, deltaArray: null,
            lastupdatedrow: lastupdatedr, lastupdatedcol: lastupdatedc, nextMoveType: null,
            sourceImages: null, previousTurnIndex: null };
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
        var deltaBoard = createDelta(boardAfterMove, board);
        var delta = { board: deltaBoard, row: row, col: col, sourceImages: null };
        // empty hole on last chance handled
        if (boardAfterMove[i][j] === 1 && row === i &&
            !((i === 0 && j === 0) || (i === 1 && j === 6)) &&
            ((i === 0 && boardAfterMove[1 - i][j - 1] > 0) ||
                (i === 1 && boardAfterMove[1 - i][j + 1] > 0))) {
            updatedState = { board: boardAfterMove, delta: delta, deltaArray: null, lastupdatedrow: i,
                lastupdatedcol: j, nextMoveType: "emptyHole", sourceImages: null, previousTurnIndex: null };
        }
        else if (isEndState(boardAfterMove)) {
            updatedState = { board: boardAfterMove, delta: delta, deltaArray: null, lastupdatedrow: i,
                lastupdatedcol: j, nextMoveType: "transferAll", sourceImages: null, previousTurnIndex: null };
        }
        else {
            updatedState = { board: boardAfterMove, delta: delta, deltaArray: null, lastupdatedrow: i,
                lastupdatedcol: j, nextMoveType: "clickUpdate", sourceImages: null, previousTurnIndex: null };
        }
        return updatedState;
    }
    function updateEmptyHole(board, row, col) {
        var boardAfterMove = angular.copy(board);
        var i = row;
        var j = col;
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
        var deltaBoard = createDelta(boardAfterMove, board);
        var delta = { board: deltaBoard, row: row, col: col, sourceImages: null };
        var updateState = { board: boardAfterMove, delta: delta, deltaArray: null, lastupdatedrow: i,
            lastupdatedcol: j, nextMoveType: "clickUpdate", sourceImages: null, previousTurnIndex: null };
        if (isEndState(boardAfterMove)) {
            updateState.nextMoveType = "transferAll";
        }
        return updateState;
    }
    function nextTurn(turnIndex, row, col, nextMoveType) {
        if (((row === 0 && col === 0) || (row === 1 && col === 6)) || nextMoveType == "emptyHole") {
            return turnIndex;
        }
        else {
            console.log("Previous turnIndex value is " + turnIndex);
            return 1 - turnIndex;
        }
    }
    function createDelta(boardAfterMove, boardBeforeMove) {
        var deltaBoard = [];
        console.log(boardBeforeMove);
        console.log(boardAfterMove);
        for (var rowNo = 0; rowNo < gameLogic.ROWS; rowNo++) {
            deltaBoard[rowNo] = [];
            for (var colNo = 0; colNo < gameLogic.COLS; colNo++) {
                deltaBoard[rowNo][colNo] =
                    boardAfterMove[rowNo][colNo] - boardBeforeMove[rowNo][colNo];
                console.log(deltaBoard[rowNo][colNo]);
            }
            console.log(deltaBoard[rowNo]);
        }
        console.log("in create delta");
        console.log(deltaBoard);
        return deltaBoard;
    }
    gameLogic.createDelta = createDelta;
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
        var nextMoveType = stateBeforeMove.nextMoveType;
        console.log(stateBeforeMove.nextMoveType);
        var endMatchScores = null;
        var turnIndex;
        var sourceImages = stateBeforeMove.sourceImages;
        console.log("Turnindexbeforemove: " + turnIndexBeforeMove + "row: " + row);
        var updatedState = null;
        if (nextMoveType == "clickUpdate") {
            console.log("Click movement happening");
            if (row !== turnIndexBeforeMove || board[row][col] === 0
                || (row === 0 && col === 0) || (row === 1 && col === 6)) {
                throw new Error("Making an invalid move!");
            }
            updatedState = updateBoard(board, row, col);
            if (updatedState.nextMoveType != "transferAll") {
                turnIndex = nextTurn(turnIndexBeforeMove, updatedState.lastupdatedrow, updatedState.lastupdatedcol, updatedState.nextMoveType);
            }
            else {
                turnIndex = turnIndexBeforeMove;
            }
        }
        else if (nextMoveType == "emptyHole") {
            console.log("Jackpot condition");
            updatedState = updateEmptyHole(board, row, col);
            updatedState.previousTurnIndex = turnIndexBeforeMove;
            if (updatedState.nextMoveType != "transferAll") {
                turnIndexBeforeMove = 1 - turnIndexBeforeMove;
            }
            turnIndex = turnIndexBeforeMove;
        }
        else if (nextMoveType == "transferAll") {
            updatedState = transferAllLeft(board);
            var boardAfterMove = updatedState.board;
            var winner = getWinner(boardAfterMove);
            //turnIndexBeforeMove = -1;
            turnIndex = -1;
            endMatchScores = winner === 0 ? [1, 0] : winner === 1 ? [0, 1] : [0, 0];
        }
        else {
            throw new Error("Invalid movetype");
        }
        console.log("TurnIndex value is: " + turnIndex);
        updatedState.sourceImages = angular.copy(sourceImages);
        updatedState.delta.sourceImages = angular.copy(sourceImages);
        if (updatedState.previousTurnIndex === null) {
            updatedState.previousTurnIndex = turnIndexBeforeMove;
        }
        updatedState.deltaArray = [];
        if (stateBeforeMove.deltaArray !== null) {
            var tempDeltaArray = angular.copy(stateBeforeMove.deltaArray);
            updatedState.deltaArray = tempDeltaArray;
        }
        updatedState.deltaArray.push(updatedState.delta);
        var state = updatedState;
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