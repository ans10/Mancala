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
    game.scores = null;
    game.animationDone = true;
    //export let sourceImages:string[][][] = null;
    game.positionImages = null;
    // For community games.
    game.proposals = null;
    game.yourPlayerInfo = null;
    var PositionStyle = {
        position: 'absolute',
        top: '%',
        left: '%'
    };
    var position_arr = [
        { t: 10, l: 52 },
        { t: 19, l: 23 },
        { t: 23, l: 44 },
        { t: 20, l: 35 },
        { t: 25, l: 37 },
        { t: 35, l: 56 },
        { t: 18, l: 66 },
        { t: 20, l: 16 },
        { t: 14, l: 19 },
        { t: 7, l: 36 },
        { t: 10, l: 47 },
        { t: 25, l: 45 },
        { t: 30, l: 72 },
        { t: 20, l: 75 },
        { t: 14, l: 72 },
        { t: 15, l: 43 },
        { t: 27, l: 37 },
        { t: 37, l: 23 },
        { t: 40, l: 13 },
        { t: 24, l: 19 },
        { t: 18, l: 25 },
        { t: 24, l: 27 },
        { t: 30, l: 37 },
        { t: 20, l: 32 },
        { t: 17, l: 41 },
        { t: 36, l: 42 },
        { t: 42, l: 48 },
        { t: 31, l: 49 },
        { t: 31, l: 58 },
        { t: 27, l: 56 },
        { t: 29, l: 14 },
        { t: 27, l: 62 },
        { t: 43, l: 67 },
        { t: 33, l: 20 },
        { t: 40, l: 8 },
        { t: 33, l: 8 },
        { t: 32, l: 72 },
        { t: 16, l: 67 },
        { t: 46, l: 13 },
        { t: 32, l: 31 },
        { t: 23, l: 14 },
        { t: 29, l: 19 },
        { t: 44, l: 27 },
        { t: 30, l: 42 },
        { t: 24, l: 35 },
        { t: 12, l: 30 },
        { t: 15, l: 38 },
        { t: 12, l: 76 }
    ];
    var position_arr_pit = [
        { t: 0, l: 52 },
        { t: 12, l: 23 },
        { t: 25, l: 24 },
        { t: 29, l: 43 },
        { t: 36, l: 37 },
        { t: 20, l: 65 },
        { t: 5, l: 66 },
        { t: 6, l: 16 },
        { t: 8, l: 19 },
        { t: 23, l: 36 },
        { t: 60, l: 47 },
        { t: 44, l: 45 },
        { t: 23, l: 66 },
        { t: 43, l: 68 },
        { t: 56, l: 56 },
        { t: 19, l: 43 },
        { t: 44, l: 37 },
        { t: 57, l: 23 },
        { t: 62, l: 23 },
        { t: 11, l: 19 },
        { t: 33, l: 25 },
        { t: 53, l: 27 },
        { t: 44, l: 37 },
        { t: 37, l: 32 },
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
    //  function initialize_position_array(){
    //     position_arrv = new Array(48);
    //
    //     position_arrv[0] = {top:0,left:52};
    //     console.log("{ t:"+position_arrv[0].top+", l:"+position_arrv[0].left+"},");
    //     for(let i=1;i<48;i++){
    //       let new_position:MyPosition = position_arrv[i-1];
    //       let lc = getRandom(-5,5);
    //       let tc = getRandom(-5,5);
    //       new_position.top = Math.round(new_position.top + tc);
    //       new_position.left = Math.round(new_position.left + lc);
    //       if(new_position.left>=70){
    //         new_position.left = 65;
    //       }
    //       if(new_position.top<=0){
    //         new_position.top=7;
    //       }
    //       if(new_position.left<=0){
    //         new_position.left = 5;
    //       }
    //       if(new_position.top>=40){
    //         new_position.top = 40;
    //       }
    //       position_arrv[i] = new_position;
    //       console.log("{ t:"+position_arrv[i].top+", l:"+position_arrv[i].left+"},");
    //
    //     }
    //
    //
    //
    //
    // }
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
    function updateUI(params) {
        log.info("Game got updateUI:", params);
        var playerIdToProposal = params.playerIdToProposal;
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
        if (game.state != null && game.state.delta != null) {
            sourceCopy = angular.copy(game.state.sourceImages);
            game.scores = boardBeforeMove(game.state.board, game.state.delta.board);
            console.log(game.scores);
            var animateState_1 = angular.copy(game.state);
            var animateDelta_1 = angular.copy(game.state.delta);
            game.$timeout(function () {
                sourceCopy = animate(animateState_1, animateDelta_1);
                console.log(sourceCopy);
            }, 0);
        }
        if (isFirstMove()) {
            console.log("Initialstate method called");
            game.state = gameLogic.getInitialState();
            game.scores = angular.copy(game.state.board);
            sourceCopy = angular.copy(game.state.sourceImages);
        }
        setFlipDisplay();
        // We calculate the AI move only after the animation finishes,
        // because if we call aiService now
        // then the animation will be paused until the javascript finishes.
        game.animationEndedTimeout = game.$timeout(function () { animationEndedCallback(sourceCopy); }, 2100);
    }
    game.updateUI = updateUI;
    function setFlipDisplay() {
        if (game.currentUpdateUI.playMode === 1 || game.currentUpdateUI.playMode === "multiplayer") {
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
    function animationEndedCallback(sourceCopy) {
        log.info("Animation ended");
        setTurnStatus();
        updateScores();
        setEndState();
        updateSourceImages(sourceCopy);
        if (game.state.nextMoveType == null) {
            game.isEndState = true;
            game.animationDone = true;
        }
        else if (game.state.nextMoveType == "clickUpdate")
            game.animationDone = true;
        else {
            console.log("In automatic move type");
            referLogic(game.state.lastupdatedrow, game.state.lastupdatedcol);
        }
        game.$timeout(function () { maybeSendComputerMove(); }, 100);
    }
    function updateSourceImages(sourceCopy) {
        if (sourceCopy != null) {
            //console.log(sourceImages);
            game.state.sourceImages = angular.copy(sourceCopy);
        }
    }
    function setTurnStatus() {
        game.turnStatus = game.currentUpdateUI.turnIndex;
    }
    function updateScores() {
        game.scores = angular.copy(game.state.board);
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
        var currentMove = {
            endMatchScores: game.currentUpdateUI.endMatchScores,
            state: game.currentUpdateUI.state,
            turnIndex: game.currentUpdateUI.turnIndex,
        };
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
            gameService.makeMove(move, null);
        }
        else {
            var delta = move.state.delta;
            var myProposal = {
                data: delta,
                chatDescription: '' + (delta.row + 1) + 'x' + (delta.col + 1),
                playerInfo: game.yourPlayerInfo,
            };
            // Decide whether we make a move or not (if we have <currentCommunityUI.numberOfPlayersRequiredToMove-1> other proposals supporting the same thing).
            if (game.proposals[delta.row][delta.col] < game.currentUpdateUI.numberOfPlayersRequiredToMove - 1) {
                move = null;
            }
            gameService.makeMove(move, myProposal);
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
        /*if(state.delta && state.delta!=null){
          previousCellValue = previousCellValue - state.delta.board[row][column];
        }*/
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
        gameService.makeMove(nextMove, null);
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
        var oldParentArray = [];
        var newParentArray = [];
        var childArray = [];
        var deltaBoard = animateDelta.board;
        var parent = null;
        var stateBoard = animateState.board;
        var loopCount = -1 * deltaBoard[currentRow][currentCol];
        console.log("Loop count is: " + loopCount);
        console.log("Children's length is: " + children.length);
        for (var loopNo = 0; loopNo < loopCount; loopNo++) {
            console.log("Loop No is:" + loopNo);
            var candyImage = children[loopNo].getElementsByTagName("img")[0];
            var currentPositionLeft = candyImage.getBoundingClientRect().left;
            var currentPositionTop = candyImage.getBoundingClientRect().top;
            // Find the destination cells
            while (deltaBoard[currentRow][currentCol] < 1) {
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
            sourceCopy[currentRow][currentCol][stateBoard[currentRow][currentCol] - deltaBoard[currentRow][currentCol] - 1] =
                candyImage.src;
        }
    }
    function animate(animateState, animateDelta) {
        var row = animateDelta.row;
        var col = animateDelta.col;
        var deltaBoard = animateDelta.board;
        var sourceCopy = angular.copy(animateState.sourceImages);
        var positionCount = 0;
        var loopCount = 0;
        var resultArray = [];
        //check departure cell
        for (var row_1 = 0; row_1 < 2; row_1++) {
            for (var col_1 = 0; col_1 < 7; col_1++) {
                if (deltaBoard[row_1][col_1] < 0) {
                    loopCount = -1 * deltaBoard[row_1][col_1];
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
    // function assignSourceCopy(animateState:IState,animateDelta:BoardDelta):string[][][]{
    //   let sourceCopy = angular.copy(animateState.sourceImages);
    //   let sourceCollection:string[] = [];
    //   for(let rowNo=0;rowNo<2;rowNo++){
    //     for(let colNo=0;colNo<7;colNo++){
    //       let deltaNumber = animateDelta.board[rowNo][colNo];
    //       if(deltaNumber<0){
    //         console.log("delta is: "+deltaNumber);
    //
    //         for(let candyNo=0;candyNo<-1*deltaNumber;candyNo++){
    //           sourceCollection.push(sourceCopy[rowNo][colNo][candyNo]);
    //           sourceCopy[rowNo][colNo][candyNo]=null;
    //
    //         }
    //       }
    //     }
    //   }
    //   let srcCandyNo:number = 0;
    //   for(let rowNo=0;rowNo<2;rowNo++){
    //     for(let colNo=0;colNo<7;colNo++){
    //       let deltaNumber:number = animateDelta.board[rowNo][colNo];
    //       let cellValue:number = animateState.board[rowNo][colNo];
    //       if(deltaNumber>0){
    //         let destCandyNo = cellValue - deltaNumber;
    //         for(;destCandyNo<cellValue;destCandyNo++){
    //           sourceCopy[rowNo][colNo][destCandyNo] = sourceCollection[srcCandyNo++];
    //         }
    //
    //       }
    //
    //
    //
    //     }
    //   }
    //   return sourceCopy;
    // }
    // function changeParents(resultArray:any[]):void{
    //   let parentArray:HTMLElement[] = resultArray[0];
    //   let childArray:HTMLElement[] = resultArray[1];
    //   let arrayLength:number = parentArray.length;
    //   for(let elementNo=0;elementNo<arrayLength;elementNo++){
    //     childArray[elementNo].parentNode.removeChild(childArray[elementNo]);
    //     parentArray[elementNo].appendChild(childArray[elementNo]);
    //   }
    // }
    // export function secondOrderAnimate(row:number,animateState:IState,animateDelta:BoardDelta,sourceCopy:string[][][]){
    //
    //   let deltaBoard = animateDelta.board;
    //   for(let rowNo = 0;rowNo < 2;rowNo++){
    //     for(let colNo = 0;colNo < 7;colNo++){
    //         if(deltaBoard[rowNo][colNo]<0){
    //           let loopCount = -1 * deltaBoard[rowNo][colNo];
    //           let children:any = document.getElementById('pit-'+rowNo+colNo).children;
    //           let turn = row;
    //           putintoDestination(children,rowNo,colNo,
    //             turn,sourceCopy,animateState,animateDelta);
    //
    //         }
    //
    //     }
    //   }
    // }
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
        console.log("hello?");
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
                return game.currentUpdateUI.playersInfo[game.winner].displayName + "'s turn";
            }
            return "Player " + game.winner + " is winner";
        }
        else {
            return "Draw!!! ";
        }
    }
    game.getWinner = getWinner;
    // function getRandom(min:number, max:number):number{
    //   return Math.random() * (max - min) + min;
    // }
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
        if (game.currentUpdateUI.playersInfo[turn] && game.currentUpdateUI.playersInfo[turn].displayName &&
            game.currentUpdateUI.playersInfo[turn].displayName != null &&
            game.currentUpdateUI.playersInfo[turn].displayName != '') {
            console.log("Reaching here to display the name" +
                game.currentUpdateUI.playersInfo[turn].displayName);
            return game.currentUpdateUI.playersInfo[turn].displayName + "'s turn";
        }
        return "Player " + turn + "'s turn";
    }
    game.printStatus = printStatus;
    function getTurnStatus() {
        return game.turnStatus;
    }
    game.getTurnStatus = getTurnStatus;
    function getSource(rowNo, colNo, candyNo) {
        var imgsrc = game.state.sourceImages[rowNo][colNo][candyNo];
        if (!imgsrc || imgsrc == null) {
            console.log("Had to rely on default image");
            imgsrc = gameLogic.candy1;
        }
        return imgsrc;
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