;
var game;
(function (game) {
    game.$rootScope = null;
    game.$timeout = null;
    // Global variables are cleared when getting updateUI.
    // I export all variables to make it easy to debug in the browser by
    // simply typing in the console, e.g.,
    // game.currentUpdateUI
    game.currentUpdateUI = null;
    game.flipDisplay = false;
    game.didMakeMove = false; // You can only make one move per updateUI
    game.animationEndedTimeout = null;
    game.state = null;
    game.currentCount = 0;
    game.winner = -1;
    game.isEndState = false;
    game.position_arrv = null;
    game.turnStatus = 0;
    game.previousTurnIndex = 0;
    game.currentMoveType = null;
    game.scores = null;
    game.animationDone = true;
    game.globalSourceImages = null;
    game.positionImages = null;
    game.replayForMultiplayer = false;
    game.inReplayLoop = false;
    // For community games.
    game.proposals = null;
    game.yourPlayerInfo = null;
    var PositionStyle = {
        position: 'absolute',
        top: '%',
        left: '%'
    };
    var position_arr = [
        { t: 10, l: 50 },
        { t: 18, l: 30 },
        { t: 18, l: 40 },
        { t: 20, l: 35 },
        { t: 25, l: 37 },
        { t: 25, l: 70 },
        { t: 18, l: 66 },
        { t: 20, l: 16 },
        { t: 14, l: 19 },
        { t: 7, l: 36 },
        { t: 10, l: 47 },
        { t: 25, l: 55 },
        { t: 30, l: 67 },
        { t: 20, l: 75 },
        { t: 14, l: 72 },
        { t: 15, l: 43 },
        { t: 27, l: 37 },
        { t: 32, l: 23 },
        { t: 37, l: 13 },
        { t: 24, l: 19 },
        { t: 18, l: 25 },
        { t: 24, l: 27 },
        { t: 30, l: 37 },
        { t: 20, l: 32 },
        { t: 17, l: 41 },
        { t: 36, l: 42 },
        { t: 32, l: 48 },
        { t: 31, l: 49 },
        { t: 31, l: 58 },
        { t: 27, l: 56 },
        { t: 29, l: 14 },
        { t: 27, l: 62 },
        { t: 38, l: 67 },
        { t: 33, l: 20 },
        { t: 40, l: 8 },
        { t: 33, l: 8 },
        { t: 32, l: 72 },
        { t: 16, l: 67 },
        { t: 16, l: 13 },
        { t: 32, l: 31 },
        { t: 23, l: 14 },
        { t: 29, l: 19 },
        { t: 40, l: 34 },
        { t: 30, l: 42 },
        { t: 24, l: 35 },
        { t: 12, l: 30 },
        { t: 15, l: 38 },
        { t: 12, l: 76 }
    ];
    var position_arr_pit = [
        { t: 2, l: 50 },
        { t: 0, l: 25 },
        { t: 25, l: 24 },
        { t: 29, l: 45 },
        { t: 46, l: 30 },
        { t: 20, l: 61 },
        { t: 5, l: 63 },
        { t: 6, l: 16 },
        { t: 8, l: 29 },
        { t: 23, l: 36 },
        { t: 50, l: 47 },
        { t: 34, l: 45 },
        { t: 23, l: 60 },
        { t: 33, l: 64 },
        { t: 15, l: 56 },
        { t: 19, l: 43 },
        { t: 15, l: 37 },
        { t: 57, l: 23 },
        { t: 62, l: 23 },
        { t: 11, l: 19 },
        { t: 33, l: 25 },
        { t: 53, l: 27 },
        { t: 47, l: 39 },
        { t: 40, l: 32 },
        { t: 17, l: 41 }
    ];
    function init($rootScope_, $timeout_) {
        game.$rootScope = $rootScope_;
        game.$timeout = $timeout_;
        registerServiceWorker();
        translate.setTranslations(getTranslations());
        translate.setLanguage('en');
        resizeGameAreaService.setWidthToHeight(1.6);
        gameService.setGame({
            updateUI: updateUI,
            getStateForOgImage: null,
        });
        console.log("INIT method over");
    }
    game.init = init;
    function registerServiceWorker() {
        // I prefer to use appCache over serviceWorker
        // (because iOS doesn't support serviceWorker, so we have to use appCache)
        // I've added this code for a future where all browsers support serviceWorker (so we can deprecate appCache!)
        if (!window.applicationCache && 'serviceWorker' in navigator) {
            var n = navigator;
            log.log('Calling serviceWorker.register');
            n.serviceWorker.register('service-worker.js').then(function (registration) {
                log.log('ServiceWorker registration successful with scope: ', registration.scope);
            }).catch(function (err) {
                log.log('ServiceWorker registration failed: ', err);
            });
        }
    }
    function getTranslations() {
        return {};
    }
    function isProposal(row, col) {
        return game.proposals && game.proposals[row][col] > 0;
    }
    game.isProposal = isProposal;
    function getCellStyle(row, col) {
        if (!isProposal(row, col))
            return {};
        // proposals[row][col] is > 0
        var countZeroBased = game.proposals[row][col] - 1;
        var maxCount = game.currentUpdateUI.numberOfPlayersRequiredToMove - 2;
        var ratio = maxCount == 0 ? 1 : countZeroBased / maxCount; // a number between 0 and 1 (inclusive).
        // scale will be between 0.6 and 0.8.
        var scale = 0.6 + 0.2 * ratio;
        // opacity between 0.5 and 0.7
        var opacity = 0.5 + 0.2 * ratio;
        return {
            transform: "scale(" + scale + ", " + scale + ")",
            opacity: "" + opacity,
        };
    }
    game.getCellStyle = getCellStyle;
    function getProposalsBoard(playerIdToProposal) {
        var proposals = [];
        for (var i = 0; i < gameLogic.ROWS; i++) {
            proposals[i] = [];
            for (var j = 0; j < gameLogic.COLS; j++) {
                proposals[i][j] = 0;
            }
        }
        for (var playerId in playerIdToProposal) {
            var proposal = playerIdToProposal[playerId];
            var delta = proposal.data;
            proposals[delta.row][delta.col]++;
        }
        return proposals;
    }
    function boardBeforeMove(boardAfterMove, deltaBoard) {
        var boardBeforeMove = angular.copy(boardAfterMove);
        for (var rowNo = 0; rowNo < 2; rowNo++) {
            for (var colNo = 0; colNo < 7; colNo++) {
                boardBeforeMove[rowNo][colNo] = boardAfterMove[rowNo][colNo] -
                    deltaBoard[rowNo][colNo];
            }
        }
        return boardBeforeMove;
    }
    function createAllBoards(boardFinalMove, deltaArray) {
        var boards = [];
        boards.push(boardFinalMove);
        for (var deltaNo = deltaArray.length - 1; deltaNo >= 0; deltaNo--) {
            boards.push(boardBeforeMove(boards[boards.length - 1], deltaArray[deltaNo].board));
        }
        return boards;
    }
    function turnHasChanged() {
        return game.state.previousTurnIndex != game.currentUpdateUI.turnIndex;
    }
    function isMultiPlayerGame() {
        return (game.currentUpdateUI.playMode == 0 || game.currentUpdateUI.playMode == 1) && game.currentUpdateUI.matchType == "pingPongMultiplayer";
    }
    function updateUI(params) {
        log.info("Game got updateUI:", params);
        //console.log(JSON.stringify(params));
        var playerIdToProposal = params.playerIdToProposal;
        var time_out = 2100;
        // Only one move/proposal per updateUI
        game.didMakeMove = playerIdToProposal && playerIdToProposal[game.yourPlayerInfo.playerId] != undefined;
        game.yourPlayerInfo = params.yourPlayerInfo;
        game.currentUpdateUI = params;
        console.log("Double checking playerindex and turn index");
        console.log(game.currentUpdateUI.yourPlayerIndex);
        console.log(game.currentUpdateUI.turnIndex);
        clearAnimationTimeout();
        game.animationDone = false;
        game.isEndState = false;
        /*For computer moves, only after animation it should occur */
        var sourceCopy = null;
        game.state = game.currentUpdateUI.state;
        game.replayForMultiplayer = false;
        if (game.state != null && game.state.delta != null) {
            console.log(isMultiPlayerGame());
            console.log(turnHasChanged());
            console.log(yourPlayerIndex());
            console.log(game.currentUpdateUI.state.previousTurnIndex);
            console.log("Match type");
            console.log();
            game.replayForMultiplayer = (isMultiPlayerGame() && turnHasChanged()
                && (isMyTurn() || (game.currentUpdateUI.turnIndex == -1 && yourPlayerIndex() == (1 - game.currentUpdateUI.state.previousTurnIndex))));
            if (!game.replayForMultiplayer) {
                console.log("In replay multiplayer false");
                game.globalSourceImages = angular.copy(game.state.sourceImages);
                game.scores = boardBeforeMove(game.state.board, game.state.delta.board);
                console.log(game.scores);
                var animateState_1 = angular.copy(game.state);
                var animateDelta_1 = angular.copy(game.state.delta);
                console.log(game.state.delta);
                console.log(animateDelta_1);
                game.$timeout(function () {
                    sourceCopy = animate(animateState_1, animateDelta_1);
                    console.log(sourceCopy);
                }, 0);
                game.animationEndedTimeout = game.$timeout(function () { animationEndedCallback(sourceCopy); }, time_out + 200);
            }
            else {
                console.log("In replay multiplayer true");
                //accumulate all the boards from the detlas
                var boardArray_1 = createAllBoards(game.state.board, game.state.deltaArray);
                console.log("Board arrays");
                console.log(boardArray_1);
                var _loop_1 = function (animationNo) {
                    console.log("IN outer function animation for loop: " + animationNo);
                    //scores = angular.copy(boardArray[0]);
                    console.log(game.state.sourceImages);
                    (function (index) {
                        game.$timeout(function () {
                            //sourceCopy = angular.copy(state.sourceImages);
                            var currentBoardIndex = game.state.deltaArray.length - animationNo;
                            game.scores = angular.copy(boardArray_1[currentBoardIndex]);
                            console.log("IN inner function animation for loop: " + animationNo);
                            console.log("scores");
                            console.log(game.scores);
                            var animateState = angular.copy(game.state);
                            animateState.board = angular.copy(boardArray_1[currentBoardIndex - 1]);
                            console.log("delta's sourceImages array");
                            console.log(game.state.deltaArray[animationNo].sourceImages);
                            animateState.sourceImages = angular.copy(game.state.deltaArray[animationNo].sourceImages);
                            game.globalSourceImages = angular.copy(animateState.sourceImages);
                            var animateDelta = angular.copy(game.state.deltaArray[animationNo]);
                            console.log(animateState);
                            console.log(animateDelta);
                            game.$timeout(function () {
                                console.log("Inner timeout");
                                sourceCopy = animate(animateState, animateDelta);
                                console.log(sourceCopy);
                            }, 0);
                        }, time_out * animationNo + time_out + 600);
                    })(animationNo);
                };
                for (var animationNo = 0; animationNo < game.state.deltaArray.length; animationNo++) {
                    _loop_1(animationNo);
                }
                game.animationEndedTimeout = game.$timeout(function () { animationEndedCallback(sourceCopy); }, time_out * game.state.deltaArray.length + time_out + 600);
            }
        }
        if (isFirstMove()) {
            console.log("Initialstate method called");
            game.state = gameLogic.getInitialState();
            game.scores = angular.copy(game.state.board);
            sourceCopy = angular.copy(game.state.sourceImages);
            game.globalSourceImages = angular.copy(game.state.sourceImages);
            game.animationEndedTimeout = game.$timeout(function () { animationEndedCallback(sourceCopy); }, 300);
        }
        setFlipDisplay();
    }
    game.updateUI = updateUI;
    function setFlipDisplay() {
        if (game.currentUpdateUI.playMode === 1 || game.currentUpdateUI.playMode === "pingPongMultiplayer" || game.currentUpdateUI.playMode === "speedMultiplayer") {
            game.flipDisplay = true;
        }
        else {
            game.flipDisplay = false;
        }
    }
    function setEndState() {
        if (getTurnStatus() === -1) {
            game.isEndState = true;
        }
        else {
            game.isEndState = false;
        }
    }
    function emptyDeltaArray() {
        if (game.replayForMultiplayer) {
            game.state.deltaArray = [];
            game.replayForMultiplayer = false;
        }
    }
    function animationEndedCallback(sourceCopy) {
        console.log("Animation ended");
        emptyDeltaArray();
        setTurnStatus();
        updateScores();
        setEndState();
        updateSourceImages(sourceCopy);
        console.log("All functions called");
        if (game.state.nextMoveType == null) {
            game.isEndState = true;
            game.animationDone = true;
        }
        else if (game.state.nextMoveType == "clickUpdate")
            game.animationDone = true;
        else {
            console.log("In automatic move type");
            if (game.currentUpdateUI.matchType == 'speedMultiplayer' && (game.currentUpdateUI.yourPlayerIndex === game.currentUpdateUI.turnIndex))
                referLogic(game.state.lastupdatedrow, game.state.lastupdatedcol);
        }
        game.$timeout(function () { maybeSendComputerMove(); }, 0);
    }
    function updateSourceImages(sourceCopy) {
        if (sourceCopy != null) {
            game.state.sourceImages = angular.copy(sourceCopy);
            game.globalSourceImages = angular.copy(sourceCopy);
            //state.sourceImages = angular.copy(sourceImages);
        }
    }
    function setTurnStatus() {
        game.turnStatus = game.currentUpdateUI.turnIndex;
        if (game.currentUpdateUI.state !== null) {
            game.previousTurnIndex = game.currentUpdateUI.state.previousTurnIndex;
            game.currentMoveType = game.currentUpdateUI.state.nextMoveType;
        }
    }
    function updateScores() {
        game.scores = angular.copy(game.state.board);
        console.log("after updatescores: " + game.scores + " for player" + game.currentUpdateUI.yourPlayerIndex);
    }
    function clearAnimationTimeout() {
        if (game.animationEndedTimeout) {
            game.$timeout.cancel(game.animationEndedTimeout);
            game.animationEndedTimeout = null;
        }
    }
    function maybeSendComputerMove() {
        if (!isComputerTurn())
            return;
        if (isComputerTurn() && game.state.previousTurnIndex === 1 && game.state.nextMoveType === "emptyHole")
            return;
        var currentMove = {
            endMatchScores: game.currentUpdateUI.endMatchScores,
            state: game.currentUpdateUI.state,
            turnIndex: game.currentUpdateUI.turnIndex,
        };
        console.log("Starting computer move calculation..");
        var move = aiService.findComputerMove(currentMove);
        log.info("Computer move: ", move);
        makeMove(move);
    }
    function makeMove(move) {
        if (game.didMakeMove) {
            return;
        }
        game.didMakeMove = true;
        if (!game.proposals) {
            gameService.makeMove(move, null, "chat Description");
        }
        else {
            var delta = move.state.delta;
            var myProposal = {
                data: delta,
                //chatDescription: '' + (delta.row + 1) + 'x' + (delta.col + 1),
                playerInfo: game.yourPlayerInfo,
            };
            // Decide whether we make a move or not (if we have <currentCommunityUI.numberOfPlayersRequiredToMove-1> other proposals supporting the same thing).
            if (game.proposals[delta.row][delta.col] < game.currentUpdateUI.numberOfPlayersRequiredToMove - 1) {
                move = null;
            }
            gameService.makeMove(move, myProposal, "chatDescription");
        }
    }
    function isFirstMove() {
        return !game.currentUpdateUI.state;
    }
    function yourPlayerIndex() {
        return game.currentUpdateUI.yourPlayerIndex;
    }
    function isComputer() {
        var playerInfo = game.currentUpdateUI.playersInfo[game.currentUpdateUI.yourPlayerIndex];
        // In community games, playersInfo is [].
        return playerInfo && playerInfo.playerId === '';
    }
    function isComputerTurn() {
        return isMyTurn() && isComputer();
    }
    function isHumanTurn() {
        return isMyTurn() && !isComputer();
    }
    function isMyTurn() {
        return !game.didMakeMove &&
            game.currentUpdateUI.turnIndex >= 0 &&
            game.currentUpdateUI.yourPlayerIndex === game.currentUpdateUI.turnIndex; // it's my turn
    }
    function shouldShowImage(row, col) {
        //return state.board[row][col] !== "" || isProposal(row, col);
        return isProposal(row, col);
    }
    game.shouldShowImage = shouldShowImage;
    function isPiece(row, col, turnIndex, pieceKind) {
        return game.state.board[row][col] === pieceKind || (isProposal(row, col) && game.currentUpdateUI.turnIndex == turnIndex);
    }
    function isPieceX(row, col) {
        return isPiece(row, col, 0, 1);
    }
    game.isPieceX = isPieceX;
    function isPieceO(row, col) {
        return isPiece(row, col, 1, 0);
    }
    game.isPieceO = isPieceO;
    function shouldSlowlyAppear(row, col) {
        return game.state.delta &&
            game.state.delta.row === row && game.state.delta.col === col;
    }
    game.shouldSlowlyAppear = shouldSlowlyAppear;
    function giveCounts(row, column) {
        return game.state.board[row][column];
    }
    game.giveCounts = giveCounts;
    function givePreviousCounts(row, column) {
        var previousCellValue = game.scores[row][column];
        return previousCellValue;
    }
    game.givePreviousCounts = givePreviousCounts;
    function getPlayer2ArrayPits() {
        return game.state.board[0].slice(1);
    }
    game.getPlayer2ArrayPits = getPlayer2ArrayPits;
    function getPlayer1ArrayPits() {
        return game.state.board[1].slice(0, 6);
    }
    game.getPlayer1ArrayPits = getPlayer1ArrayPits;
    function makeArray(num) {
        var arr = new Array(num);
        for (var i = 0; i < num; i++) {
            arr[i] = i;
        }
        return arr;
    }
    game.makeArray = makeArray;
    function referLogic(row, column) {
        if (game.currentUpdateUI.turnIndex == -1) {
            console.log("winner is already declared");
            return;
        }
        var nextMove = null;
        try {
            nextMove = gameLogic.createMove(game.state, row, column, game.currentUpdateUI.turnIndex);
            console.log("next move's turn index:");
            console.log(nextMove.turnIndex);
            console.log(game.currentUpdateUI.turnIndex);
        }
        catch (exception) {
            console.info("Problem in createMove: " + exception);
            return;
        }
        gameService.makeMove(nextMove, null, "chat Description");
        if (nextMove.endMatchScores !== null) {
            console.info("end state detected to be true " + game.isEndState);
        }
    }
    function pitClicked(event, row, column) {
        console.info("Cell clicked (row,col): (" + row + "," + column + ")");
        if (!isHumanTurn() || !game.animationDone)
            return;
        referLogic(row, column);
    }
    game.pitClicked = pitClicked;
    function updatePosition(destinationElement, currentRow, currentCol, animateState, animateDelta) {
        console.log("In update position");
        var newPositionTop = 0;
        var newPositionLeft = 0;
        var stateBoard = animateState.board;
        var deltaBoard = animateDelta.board;
        newPositionTop = destinationElement.getBoundingClientRect().top;
        newPositionLeft = destinationElement.getBoundingClientRect().left;
        var newPositionShift = null;
        if (isStore(currentRow, currentCol)) {
            console.log(stateBoard[currentRow][currentCol] + " " + deltaBoard[currentRow][currentCol]);
            newPositionShift =
                position_arr[stateBoard[currentRow][currentCol] - deltaBoard[currentRow][currentCol] - 1];
        }
        else {
            console.log(stateBoard[currentRow][currentCol] + " " + deltaBoard[currentRow][currentCol]);
            newPositionShift = position_arr_pit[stateBoard[currentRow][currentCol] - deltaBoard[currentRow][currentCol] - 1];
        }
        console.log(destinationElement + " " + currentRow + " " + currentCol + " " + newPositionShift.t + " " + newPositionShift.l);
        newPositionTop = newPositionTop +
            destinationElement.clientHeight * (newPositionShift.t / 100);
        newPositionLeft = newPositionLeft +
            destinationElement.clientWidth * (newPositionShift.l / 100);
        return { top: newPositionTop, left: newPositionLeft };
    }
    game.updatePosition = updatePosition;
    function getNewParent(currentRow, currentCol) {
        var parent = null;
        //store two condition
        if (currentRow == 1 && currentCol == 6) {
            parent = document.getElementById('store-1');
        }
        else if (currentRow == 0 && currentCol == 0) {
            parent = document.getElementById('store-0');
        }
        else {
            parent = document.getElementById('pit-' + currentRow + currentCol);
        }
        return parent;
    }
    function isStore(row, col) {
        var isStore = false;
        if ((row == 1 && col == 6) || (row == 0 && col == 0)) {
            isStore = true;
        }
        return isStore;
    }
    function putintoDestination(children, currentRow, currentCol, turn, sourceCopy, animateState, animateDelta) {
        var sourceCellRow = currentRow;
        var sourceCellCol = currentCol;
        console.log("Source cell information");
        console.log(sourceCellRow);
        console.log(sourceCellCol);
        var oldParentArray = [];
        var newParentArray = [];
        var childArray = [];
        var deltaBoard = animateDelta.board;
        var parent = null;
        var stateBoard = animateState.board;
        var loopCount = children.length;
        var initialLoopNo = 0;
        console.log("Loop count is: " + loopCount);
        console.log("Children's length is: " + children.length);
        var visitedSource = false;
        if (children.length >= 13) {
            initialLoopNo = 1;
        }
        for (var loopNo = initialLoopNo; loopNo < loopCount; loopNo++) {
            console.log("Loop No is:" + loopNo);
            var candyImage = children[loopNo].getElementsByTagName("img")[0];
            var currentPositionLeft = candyImage.getBoundingClientRect().left;
            var currentPositionTop = candyImage.getBoundingClientRect().top;
            // Find the destination cells
            while (deltaBoard[currentRow][currentCol] < 1) {
                console.log("In while loop");
                if (currentRow == 1) {
                    currentCol++;
                    if (currentCol >= 7) {
                        currentCol--;
                        currentRow = 0;
                    }
                }
                else {
                    currentCol--;
                    if (currentCol < 0) {
                        currentCol++;
                        currentRow = 1;
                    }
                }
            }
            // Start moving
            console.log("Moving to " + currentRow + " " + currentCol);
            parent = getNewParent(currentRow, currentCol);
            deltaBoard[currentRow][currentCol]--;
            deltaBoard[sourceCellRow][sourceCellCol]++;
            var newPosition = updatePosition(parent, currentRow, currentCol, animateState, animateDelta);
            var newPositionLefttext = newPosition.left - currentPositionLeft + 'px';
            var newPositionToptext = newPosition.top - currentPositionTop + 'px';
            candyImage.style.transform = "translate(" + newPositionLefttext + "," + newPositionToptext + ")";
            //candyImage.style.transform = "translateX("+newPositionLefttext+")"+" translateY("+newPositionToptext+")";
            sourceCopy[currentRow][currentCol][stateBoard[currentRow][currentCol] - deltaBoard[currentRow][currentCol] - 1] =
                candyImage.src;
        }
    }
    function animate(animateState, animateDelta) {
        var row = animateDelta.row;
        var col = animateDelta.col;
        var deltaBoard = animateDelta.board;
        var sourceCopy = angular.copy(animateState.sourceImages);
        console.log("In animation sourceCopy");
        console.log(animateState.sourceImages);
        console.log(sourceCopy);
        var positionCount = 0;
        var loopCount = 0;
        var resultArray = [];
        //check departure cell
        for (var row_1 = 0; row_1 < 2; row_1++) {
            for (var col_1 = 0; col_1 < 7; col_1++) {
                if (deltaBoard[row_1][col_1] < 0) {
                    var children = document.getElementById('pit-' + row_1 + col_1).children;
                    console.log("Deparature cell selected is pit-" + row_1 + col_1);
                    console.log("Length of the children is " + children.length);
                    var turn = row_1;
                    for (var candyNo = 0; candyNo < children.length; candyNo++) {
                        sourceCopy[row_1][col_1][candyNo] = null;
                    }
                    putintoDestination(children, row_1, col_1, turn, sourceCopy, animateState, animateDelta);
                }
            }
        }
        return sourceCopy;
    }
    function isEndOfGame() {
        console.log("End of Game is: " + game.isEndState);
        return game.isEndState;
    }
    function isDrawn() {
        if (isEndOfGame() && game.currentUpdateUI.endMatchScores[0] === game.currentUpdateUI.endMatchScores[1]) {
            console.log("Drawing condition true");
            return true;
        }
        return false;
    }
    game.isDrawn = isDrawn;
    function getWinner() {
        console.log("Getting the winner" + game.currentUpdateUI.endMatchScores + " " + game.isEndState);
        if (game.currentUpdateUI.endMatchScores !== null) {
            game.isEndState = true;
            console.info("end state detected to be true " + game.isEndState);
            if (game.currentUpdateUI.endMatchScores[0] > game.currentUpdateUI.endMatchScores[1]) {
                console.log("Winner is 0");
                game.winner = 0;
            }
            else if (game.currentUpdateUI.endMatchScores[0] < game.currentUpdateUI.endMatchScores[1]) {
                console.log("Winner is 1");
                game.winner = 1;
            }
            else {
                game.winner = 2;
            }
        }
        if (game.winner === 1 || game.winner === 0) {
            if (game.currentUpdateUI.playersInfo[game.winner].displayName &&
                game.currentUpdateUI.playersInfo[game.winner].displayName != null) {
                return game.currentUpdateUI.playersInfo[game.winner].displayName + " is winner!";
            }
            return "Player " + (game.winner + 1) + " is winner!";
        }
        else {
            return "Draw!";
        }
    }
    game.getWinner = getWinner;
    function getPosition(pos, store) {
        if (store == 1) {
            PositionStyle.top = position_arr[pos].t.toString() + '%';
            PositionStyle.left = position_arr[pos].l.toString() + '%';
        }
        else {
            PositionStyle.top = position_arr_pit[pos].t.toString() + '%';
            PositionStyle.left = position_arr_pit[pos].l.toString() + '%';
        }
        return PositionStyle;
    }
    game.getPosition = getPosition;
    function flipBoard() {
        return game.flipDisplay;
    }
    game.flipBoard = flipBoard;
    function printStatus() {
        var turn = game.turnStatus;
        if (turn > -1) {
            if (game.currentUpdateUI.playersInfo[turn] && game.currentUpdateUI.playersInfo[turn].displayName &&
                game.currentUpdateUI.playersInfo[turn].displayName != null &&
                game.currentUpdateUI.playersInfo[turn].displayName != '') {
                return game.currentUpdateUI.playersInfo[turn].displayName + "'s turn";
            }
            else {
                return "Player " + (turn + 1) + "'s turn";
            }
        }
        else {
            return "";
        }
    }
    game.printStatus = printStatus;
    function getTurnStatus() {
        return game.turnStatus;
    }
    game.getTurnStatus = getTurnStatus;
    function sameTurnAgain() {
        if (game.turnStatus === game.previousTurnIndex && game.currentMoveType === "clickUpdate") {
            console.log("In click update");
            return true;
        }
        return false;
    }
    game.sameTurnAgain = sameTurnAgain;
    function isCapture() {
        if (game.turnStatus === game.previousTurnIndex && game.currentMoveType === "emptyHole") {
            return true;
        }
        return false;
    }
    game.isCapture = isCapture;
    function getSource(rowNo, colNo, candyNo) {
        var imgsrc = game.globalSourceImages[rowNo][colNo][candyNo];
        if (imgsrc === "") {
            return imgsrc;
        }
        if (!imgsrc || imgsrc == null) {
            console.log("Had to rely on default image");
            imgsrc = gameLogic.candy1;
        }
        return imgsrc;
        //}
        // else{
        //   let imgsrc:string = state.deltaArray[0].sourceImages[rowNo][colNo][candyNo];
        //   if (imgsrc === ""){
        //     return imgsrc;
        //   }
        //   if(!imgsrc || imgsrc==null){
        //     console.log("Had to rely on default image");
        //     imgsrc = gameLogic.candy1;
        //   }
        //   return imgsrc;
        //
        //
        // }
    }
    game.getSource = getSource;
})(game || (game = {}));
angular.module('myApp', ['gameServices'])
    .run(['$rootScope', '$timeout',
    function ($rootScope, $timeout) {
        $rootScope['game'] = game;
        game.init($rootScope, $timeout);
    }]);
//# sourceMappingURL=game.js.map