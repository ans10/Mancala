var aiService;
(function (aiService) {
    /** Returns the move that the computer player should do for the given state in move. */
    function findComputerMove(move) {
        return createComputerMove(move, 
        // at most 1 second for the AI to choose a move (but might be much quicker)
        { millisecondsLimit: 1000 });
    }
    aiService.findComputerMove = findComputerMove;
    /**
     * Returns all the possible moves for the given state and turnIndexBeforeMove.
     * Returns an empty array if the game is over.
     */
    function getPossibleMoves(state, turnIndexBeforeMove) {
        var possibleMoves = [];
        for (var i = 0; i < gameLogic.ROWS; i++) {
            for (var j = 0; j < gameLogic.COLS; j++) {
                try {
                    possibleMoves.push(gameLogic.createMove(state, i, j, turnIndexBeforeMove));
                }
                catch (e) {
                    // The cell in that position was full.
                }
            }
        }
        return possibleMoves;
    }
    aiService.getPossibleMoves = getPossibleMoves;
    /**
     * Returns the move that the computer player should do for the given state.
     * alphaBetaLimits is an object that sets a limit on the alpha-beta search,
     * and it has either a millisecondsLimit or maxDepth field:
     * millisecondsLimit is a time limit, and maxDepth is a depth limit.
     */
    function createComputerMove(move, alphaBetaLimits) {
        // We use alpha-beta search, where the search states are TicTacToe moves.
        var moves = [];
        moves = getPossibleMoves(move.state, move.turnIndex);
        for (var i = 0; i < moves.length; i++) {
            if (moves[i].endMatchScores) {
                if (moves[i].endMatchScores[1] > moves[i].endMatchScores[0]) {
                    console.log("Choosing winning move");
                    return moves[i];
                }
            }
            else if (moves[i].turnIndex === 1) {
                console.log("Placing last candy in store");
                return moves[i];
            }
            else {
                for (var j = 1; j < gameLogic.COLS; j++) {
                    if (moves[i].state.board[0][j] === 0) {
                        if (move.state.board[0][j] !== 0) {
                            console.log("Placing last candy in empty hole");
                            return moves[i];
                        }
                    }
                }
            }
        }
        var randomIndex = Math.floor(Math.random() * moves.length);
        return moves[randomIndex];
        /*return alphaBetaService.alphaBetaDecision(
            move, move.turnIndex, getNextStates, getStateScoreForIndex0, null, alphaBetaLimits);*/
    }
    aiService.createComputerMove = createComputerMove;
    function getStateScoreForIndex0(move, playerIndex) {
        var endMatchScores = move.endMatchScores;
        if (endMatchScores) {
            return endMatchScores[0] > endMatchScores[1] ? Number.POSITIVE_INFINITY
                : endMatchScores[0] < endMatchScores[1] ? Number.NEGATIVE_INFINITY
                    : 0;
        }
        return 0;
    }
    function getNextStates(move, playerIndex) {
        return getPossibleMoves(move.state, playerIndex);
    }
})(aiService || (aiService = {}));
//# sourceMappingURL=aiService.js.map