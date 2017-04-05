;
var PositionStyle = {
    position: 'absolute',
    width: '20%',
    height: '20%',
    top: '%',
    left: '%'
};
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
        { t: 35, l: 80 },
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
        { t: 20, l: 70 },
        { t: 5, l: 66 },
        { t: 6, l: 16 },
        { t: 8, l: 19 },
        { t: 23, l: 36 },
        { t: 65, l: 47 },
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
    function initialize_position_array() {
        game.position_arrv = new Array(48);
        game.position_arrv[0] = { top: 0, left: 52 };
        console.log("{ t:" + game.position_arrv[0].top + ", l:" + game.position_arrv[0].left + "},");
        for (var i = 1; i < 48; i++) {
            var new_position = game.position_arrv[i - 1];
            var lc = getRandom(-5, 5);
            var tc = getRandom(-5, 5);
            new_position.top = Math.round(new_position.top + tc);
            new_position.left = Math.round(new_position.left + lc);
            if (new_position.left >= 70) {
                new_position.left = 65;
            }
            if (new_position.top <= 0) {
                new_position.top = 7;
            }
            if (new_position.left <= 0) {
                new_position.left = 5;
            }
            if (new_position.top >= 40) {
                new_position.top = 40;
            }
            game.position_arrv[i] = new_position;
            console.log("{ t:" + game.position_arrv[i].top + ", l:" + game.position_arrv[i].left + "},");
        }
    }
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
        console.log("Turn index is !!!!!!!!!!!!! : " + game.currentUpdateUI.turnIndex + " " + game.currentUpdateUI.playMode);
        clearAnimationTimeout();
        /*For computer moves, only after animation it should occur */
        game.state = params.state;
        if (isFirstMove()) {
            console.log("Initialstate method called");
            game.state = gameLogic.getInitialState();
        }
        if (game.currentUpdateUI.playMode === 1 || game.currentUpdateUI.playMode === "multiplayer") {
            game.flipDisplay = true;
        }
        else {
            game.flipDisplay = false;
        }
        console.log("flip is : ~~~~~~~~~~ " + game.flipDisplay);
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
        console.info("hell");
        var nextMove = null;
        try {
            nextMove = gameLogic.createMove(game.state, row, column, game.currentUpdateUI.turnIndex);
        }
        catch (exception) {
            console.info("Problem in createMove: " + exception);
            return;
        }
        gameService.makeMove(nextMove, null);
        if (nextMove.endMatchScores !== null) {
            game.isEndState = true;
            console.info("end state detected to be true " + game.isEndState);
            if (nextMove.endMatchScores[0] > nextMove.endMatchScores[1]) {
                console.log("Winner is 0");
                game.winner = 0;
            }
            else {
                console.log("Winner is 1");
                game.winner = 1;
            }
        }
        game.currentUpdateUI.turnIndex = nextMove.turnIndex;
        game.currentUpdateUI.yourPlayerIndex = nextMove.turnIndex;
        console.log("Current player's name is " +
            game.currentUpdateUI.yourPlayerInfo.displayName);
    }
    game.pitClicked = pitClicked;
    function isEndOfGame() {
        console.log("is End of Game is: " + game.isEndState);
        if (game.currentUpdateUI.turnIndex === -1) {
            console.log("is end state is tureeeeeee");
        }
        else {
            console.log("is falseeeeeeeeeeeeeeeeee");
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
        console.log("in give winnerrrrrrr " + game.currentUpdateUI.endMatchScores);
        console.log("hello?");
        return game.winner;
    }
    game.giveWinner = giveWinner;
    function getRandom(min, max) {
        return Math.random() * (max - min) + min;
    }
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
        console.log("flipdisplay in function is: " + game.flipDisplay);
        return game.flipDisplay;
    }
    game.flipBoard = flipBoard;
})(game || (game = {}));
angular.module('myApp', ['gameServices'])
    .run(['$rootScope', '$timeout',
    function ($rootScope, $timeout) {
        $rootScope['game'] = game;
        game.init($rootScope, $timeout);
    }]);
//# sourceMappingURL=game.js.map