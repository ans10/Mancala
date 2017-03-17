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
    game.didMakeMove = false; // You can only make one move per updateUI
    game.animationEndedTimeout = null;
    game.state = null;
    game.currentCount = 0;
    game.isEndState = false;
    var winner = -1; //-1 indicates match is drawn
    // For community games.
    game.proposals = null;
    game.yourPlayerInfo = null;
    function init($rootScope_, $timeout_) {
        game.$rootScope = $rootScope_;
        game.$timeout = $timeout_;
        registerServiceWorker();
        translate.setTranslations(getTranslations());
        translate.setLanguage('en');
        resizeGameAreaService.setWidthToHeight(1.2);
        gameService.setGame({
            updateUI: updateUI,
            getStateForOgImage: null,
        });
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
    function updateUI(params) {
        log.info("Game got updateUI:", params);
        var playerIdToProposal = params.playerIdToProposal;
        // Only one move/proposal per updateUI
        game.didMakeMove = playerIdToProposal && playerIdToProposal[game.yourPlayerInfo.playerId] != undefined;
        game.yourPlayerInfo = params.yourPlayerInfo;
        /*proposals = playerIdToProposal ? getProposalsBoard(playerIdToProposal) : null;
        if (playerIdToProposal) {
          // If only proposals changed, then return.
          // I don't want to disrupt the player if he's in the middle of a move.
          // I delete playerIdToProposal field from params (and so it's also not in currentUpdateUI),
          // and compare whether the objects are now deep-equal.
          params.playerIdToProposal = null;
          if (currentUpdateUI && angular.equals(currentUpdateUI, params)) return;
        }*/
        game.currentUpdateUI = params;
        clearAnimationTimeout();
        /*For computer moves, only after animation it should occur */
        game.state = params.state;
        if (isFirstMove()) {
            console.log("Initialstate method called");
            game.state = gameLogic.getInitialState();
        }
        // We calculate the AI move only after the animation finishes,
        // because if we call aiService now
        // then the animation will be paused until the javascript finishes.
        game.animationEndedTimeout = game.$timeout(animationEndedCallback, 500);
    }
    game.updateUI = updateUI;
    function animationEndedCallback() {
        log.info("Animation ended");
        maybeSendComputerMove();
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
        // if(row === 1){
        //   {
        //   \
        // }
        //   return state.board[0][0];
        // }
        // if(location === "pit1"){
        //   return state.board[0][1];
        // }
        //
        // if(location === "pit2"){
        //   return state.board[0][2];
        // }
        //
        // if(location === "pit3"){
        //   return state.board[0][3];
        // }
        //
        // if(location === "pit4"){
        //   return state.board[0][4];
        // }
        //
        // if(location === "pit5"){
        //   return state.board[0][5];
        // }
        //
        // if(location === "pit6"){
        //   return state.board[0][6];
        // }
        // if(location === "store1"){
        //   return state.board[1][6];
        // }
        // if(location === "pit7"){
        //   return state.board[1][5];
        // }
        //
        // if(location === "pit8"){
        //   return state.board[1][4];
        // }
        //
        // if(location === "pit9"){
        //   return state.board[1][3];
        // }
        // if(location === "pit10"){
        //   return state.board[1][2];
        // }
        // if(location === "pit11"){
        //   return state.board[1][1];
        // }
        // if(location === "pit12"){
        //   return state.board[1][0];
        // }
    }
    game.giveCounts = giveCounts;
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
    function pitClicked(row, column) {
        // state.board[row][column]=0;
        console.info("Cell clicked (row,col): (" + row + "," + column + ")");
        if (!isHumanTurn())
            return;
        var nextMove = null;
        try {
            nextMove = gameLogic.createMove(game.state, row, column, game.currentUpdateUI.turnIndex);
        }
        catch (exception) {
            console.info("Problem in createMove: " + exception);
        }
        gameService.makeMove(nextMove, null);
        if (nextMove.endMatchScores !== null) {
            console.info("end state detected to be true");
            game.isEndState = true;
        }
        game.currentUpdateUI.turnIndex = nextMove.turnIndex;
        game.currentUpdateUI.yourPlayerIndex = nextMove.turnIndex;
        console.log("Current player's name is " +
            game.currentUpdateUI.yourPlayerInfo.displayName);
    }
    game.pitClicked = pitClicked;
    function isEndOfGame() {
        if (game.isEndState === false) {
            console.log("is End of Game is: " + game.isEndState);
        }
        return game.isEndState;
    }
    game.isEndOfGame = isEndOfGame;
    function isDrawn() {
        if (isEndOfGame() && game.currentUpdateUI.endMatchScores[0] === game.currentUpdateUI.endMatchScores[1]) {
            console.log("Drawing condition true");
            return true;
        }
        return false;
    }
    game.isDrawn = isDrawn;
    function giveWinner() {
        if (game.currentUpdateUI.endMatchScores[0] > game.currentUpdateUI.endMatchScores[1]) {
            console.log("Winner is 0");
            return 0;
        }
        else {
            console.log("Winner is 1");
            return 1;
        }
    }
    game.giveWinner = giveWinner;
})(game || (game = {}));
angular.module('myApp', ['gameServices'])
    .run(['$rootScope', '$timeout',
    function ($rootScope, $timeout) {
        $rootScope['game'] = game;
        game.init($rootScope, $timeout);
    }]);
//# sourceMappingURL=game.js.map