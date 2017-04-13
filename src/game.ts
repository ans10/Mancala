interface SupportedLanguages {
  en: string, iw: string,
  pt: string, zh: string,
  el: string, fr: string,
  hi: string, es: string,
};
interface MyPosition {
  top: number;
  left: number;
}
var PositionStyle =
  {
    position:'absolute',
    width:'20%',
    height:'20%',
    top: '%',
    left:'%'
  };

module game {
  export let $rootScope: angular.IScope = null;
  export let $timeout: angular.ITimeoutService = null;

  // Global variables are cleared when getting updateUI.
  // I export all variables to make it easy to debug in the browser by
  // simply typing in the console, e.g.,
  // game.currentUpdateUI
  export let currentUpdateUI: IUpdateUI = null;
  export let flipDisplay: boolean = false;
  export let didMakeMove: boolean = false; // You can only make one move per updateUI
  export let animationEndedTimeout: ng.IPromise<any> = null;
  export let state: IState = null;
  export let currentCount: number = 0;
  export let winner: number = -1;
  export let isEndState: boolean = false;
  export let position_arrv: MyPosition[] = null;
  export let turnStatus = 0;
  export let clickedRow = 0;
  export let clickedCol = 0;
  export let scores:Board = null
  // For community games.
  export let proposals: number[][] = null;
  export let yourPlayerInfo: IPlayerInfo = null;
  let PositionStyle =
  {
    position:'absolute',
    top: '%',
    left:'%'
  };
  let position_arr =
  [
    {t: 10, l: 52},
    {t: 19, l: 23},
    {t: 23, l: 44},
    {t: 20, l: 35},
    {t: 25, l: 37},
    {t: 35, l: 56},
    {t: 18, l: 66},
    {t: 20, l: 16},
    {t: 14, l: 19},
    {t: 7, l: 36},
    {t: 10, l: 47},
    {t: 25, l: 45},
    {t: 30, l: 72},
    {t: 20, l: 75},
    {t: 14, l: 72},
    {t: 15, l: 43},
    {t: 27, l: 37},
    {t: 37, l: 23},
    {t: 40, l: 13},
    {t: 24, l: 19},
    {t: 18, l: 25},
    {t: 24, l: 27},
    {t: 30, l: 37},
    {t: 20, l: 32},
    {t: 17, l: 41},
    {t: 36, l: 42},
    {t: 42, l: 48},
    {t: 31, l: 49},
    {t: 31, l: 58},
    {t: 27, l: 56},
    {t: 29, l: 14},
    {t: 27, l: 62},
    {t: 43, l: 67},
    {t: 33, l: 20},
    {t: 40, l: 8},
    {t: 33, l: 8},
    {t: 32, l: 72},
    {t: 16, l: 67},
    {t: 46, l: 13},
    {t: 32, l: 31},
    {t: 23, l: 14},
    {t: 29, l: 19},
    {t: 44, l: 27},
    {t: 30, l: 42},
    {t: 24, l: 35},
    {t: 12, l: 30},
    {t: 15, l: 38},
    {t: 12, l: 76}
  ];
  let position_arr_pit =
  [
    {t: 0, l: 52},
    {t: 12, l: 23},
    {t: 25, l: 24},
    {t: 29, l: 43},
    {t: 36, l: 37},
    {t: 20, l: 70},
    {t: 5, l: 66},
    {t: 6, l: 16},
    {t: 8, l: 19},
    {t: 23, l: 36},
    {t: 65, l: 47},
    {t: 44, l: 45},
    {t: 23, l: 66},
    {t: 43, l: 68},
    {t: 56, l: 56},
    {t: 19, l: 43},
    {t: 44, l: 37},
    {t: 57, l: 23},
    {t: 62, l: 23},
    {t: 11, l: 19},
    {t: 33, l: 25},
    {t: 53, l: 27},
    {t: 44, l: 37},
    {t: 37, l: 32},
    {t: 17, l: 41}
  ];


  export function init($rootScope_: angular.IScope, $timeout_: angular.ITimeoutService) {

    $rootScope = $rootScope_;
    $timeout = $timeout_;
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
   function initialize_position_array(){
      position_arrv = new Array(48);

      position_arrv[0] = {top:0,left:52};
      console.log("{ t:"+position_arrv[0].top+", l:"+position_arrv[0].left+"},");
      for(let i=1;i<48;i++){
        let new_position:MyPosition = position_arrv[i-1];
        let lc = getRandom(-5,5);
        let tc = getRandom(-5,5);
        new_position.top = Math.round(new_position.top + tc);
        new_position.left = Math.round(new_position.left + lc);
        if(new_position.left>=70){
          new_position.left = 65;
        }
        if(new_position.top<=0){
          new_position.top=7;
        }
        if(new_position.left<=0){
          new_position.left = 5;
        }
        if(new_position.top>=40){
          new_position.top = 40;
        }
        position_arrv[i] = new_position;
        console.log("{ t:"+position_arrv[i].top+", l:"+position_arrv[i].left+"},");

      }




  }


  function registerServiceWorker() {
    // I prefer to use appCache over serviceWorker
    // (because iOS doesn't support serviceWorker, so we have to use appCache)
    // I've added this code for a future where all browsers support serviceWorker (so we can deprecate appCache!)
    if (!window.applicationCache && 'serviceWorker' in navigator) {
      let n: any = navigator;
      log.log('Calling serviceWorker.register');
      n.serviceWorker.register('service-worker.js').then(function(registration: any) {
        log.log('ServiceWorker registration successful with scope: ',    registration.scope);
      }).catch(function(err: any) {
        log.log('ServiceWorker registration failed: ', err);
      });
    }
  }

  function getTranslations(): Translations {
    return {};
  }

  export function isProposal(row: number, col: number) {
    return proposals && proposals[row][col] > 0;
  }

  export function getCellStyle(row: number, col: number): Object {
    if (!isProposal(row, col)) return {};
    // proposals[row][col] is > 0
    let countZeroBased = proposals[row][col] - 1;
    let maxCount = currentUpdateUI.numberOfPlayersRequiredToMove - 2;
    let ratio = maxCount == 0 ? 1 : countZeroBased / maxCount; // a number between 0 and 1 (inclusive).
    // scale will be between 0.6 and 0.8.
    let scale = 0.6 + 0.2 * ratio;
    // opacity between 0.5 and 0.7
    let opacity = 0.5 + 0.2 * ratio;
    return {
      transform: `scale(${scale}, ${scale})`,
      opacity: "" + opacity,
    };
  }

  function getProposalsBoard(playerIdToProposal: IProposals): number[][] {
    let proposals: number[][] = [];
    for (let i = 0; i < gameLogic.ROWS; i++) {
      proposals[i] = [];
      for (let j = 0; j < gameLogic.COLS; j++) {
        proposals[i][j] = 0;
      }
    }
    for (let playerId in playerIdToProposal) {
      let proposal = playerIdToProposal[playerId];
      let delta = proposal.data;
      proposals[delta.row][delta.col]++;
    }
    return proposals;
  }

  export function updateUI(params: IUpdateUI): void {
    log.info("Game got updateUI:", params);
    let playerIdToProposal = params.playerIdToProposal;
     // Only one move/proposal per updateUI
    didMakeMove = playerIdToProposal && playerIdToProposal[yourPlayerInfo.playerId] != undefined;
    yourPlayerInfo = params.yourPlayerInfo;
    /*proposals = playerIdToProposal ? getProposalsBoard(playerIdToProposal) : null;
    if (playerIdToProposal) {
      // If only proposals changed, then return.
      // I don't want to disrupt the player if he's in the middle of a move.
      // I delete playerIdToProposal field from params (and so it's also not in currentUpdateUI),
      // and compare whether the objects are now deep-equal.
      params.playerIdToProposal = null;
      if (currentUpdateUI && angular.equals(currentUpdateUI, params)) return;
    }*/

    currentUpdateUI = params;
    console.log("Turn index is !!!!!!!!!!!!! : " + currentUpdateUI.turnIndex + " " + isEndState);
    clearAnimationTimeout();
    /*For computer moves, only after animation it should occur */
    if(params.state!=null)
    console.log(params.state.board);
    if(params.state!=null && params.state.delta!=null){
      animate(params.state.delta.row,params.state.delta.col,params);
    }

    state = params.state;
    console.log("Step after animation");
    console.log(state);
    if (isFirstMove()) {
      console.log("Initialstate method called");
      state = gameLogic.getInitialState();
      scores = state.board;
    }
    if (currentUpdateUI.turnIndex === -1){
      isEndState = true;
    }
    else{
      isEndState = false;
    }
   console.log("Turn index is !!!!!!!!!!!!! : " + currentUpdateUI.turnIndex + " " + isEndState);

    if (currentUpdateUI.playMode === 1 || currentUpdateUI.playMode === "multiplayer"){
      flipDisplay = true;
    }
    else{
      flipDisplay = false;
    }
    console.log("flip is : ~~~~~~~~~~ " + flipDisplay);
    // We calculate the AI move only after the animation finishes,
    // because if we call aiService now
    // then the animation will be paused until the javascript finishes.
    animationEndedTimeout = $timeout(animationEndedCallback, 2000);
  }

  function animationEndedCallback() {
    log.info("Animation ended");
    setTurnStatus();
    updateScores();
    maybeSendComputerMove();
  }
  function setTurnStatus():void{
    turnStatus = currentUpdateUI.turnIndex;
  }
  function updateScores(){
    scores = state.board;
  }
  function clearAnimationTimeout() {
    if (animationEndedTimeout) {
      $timeout.cancel(animationEndedTimeout);
      animationEndedTimeout = null;
    }
  }

  function maybeSendComputerMove() {
    if (!isComputerTurn()) return;
    let currentMove:IMove = {
      endMatchScores: currentUpdateUI.endMatchScores,
      state: currentUpdateUI.state,
      turnIndex: currentUpdateUI.turnIndex,
    }
    let move = aiService.findComputerMove(currentMove);
    log.info("Computer move: ", move);
    makeMove(move);
  }

  function makeMove(move: IMove) {
    if (didMakeMove) { // Only one move per updateUI
      return;
    }
    didMakeMove = true;

    if (!proposals) {
      gameService.makeMove(move, null);
    } else {
      let delta = move.state.delta;
      let myProposal:IProposal = {
        data: delta,
        chatDescription: '' + (delta.row + 1) + 'x' + (delta.col + 1),
        playerInfo: yourPlayerInfo,
      };
      // Decide whether we make a move or not (if we have <currentCommunityUI.numberOfPlayersRequiredToMove-1> other proposals supporting the same thing).
      if (proposals[delta.row][delta.col] < currentUpdateUI.numberOfPlayersRequiredToMove - 1) {
        move = null;
      }
      gameService.makeMove(move, myProposal);
    }
  }

  function isFirstMove() {
    return !currentUpdateUI.state;
  }

  function yourPlayerIndex() {
    return currentUpdateUI.yourPlayerIndex;
  }

  function isComputer() {
    let playerInfo = currentUpdateUI.playersInfo[currentUpdateUI.yourPlayerIndex];
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
    return !didMakeMove && // you can only make one move per updateUI.
      currentUpdateUI.turnIndex >= 0 && // game is ongoing
      currentUpdateUI.yourPlayerIndex === currentUpdateUI.turnIndex; // it's my turn
  }


  export function shouldShowImage(row: number, col: number): boolean {
    //return state.board[row][col] !== "" || isProposal(row, col);
    return isProposal(row, col);
  }

  function isPiece(row: number, col: number, turnIndex: number, pieceKind: number): boolean {
    return state.board[row][col] === pieceKind || (isProposal(row, col) && currentUpdateUI.turnIndex == turnIndex);
  }

  export function isPieceX(row: number, col: number): boolean {
    return isPiece(row, col, 0, 1);
  }

  export function isPieceO(row: number, col: number): boolean {
    return isPiece(row, col, 1, 0);
  }

  export function shouldSlowlyAppear(row: number, col: number): boolean {
    return state.delta &&
        state.delta.row === row && state.delta.col === col;
  }
  export function giveCounts(row: number, column: number): number{
    return state.board[row][column];
  }
  export function givePreviousCounts(row: number, column: number): number{
    let previousCellValue:number = scores[row][column];
    /*if(state.delta && state.delta!=null){
      previousCellValue = previousCellValue - state.delta.board[row][column];
    }*/
    return previousCellValue;
  }

  export function getPlayer2ArrayPits():number[]{
    return state.board[0].slice(1);
  }
  export function getPlayer1ArrayPits():number[]{
    return state.board[1].slice(0,6);
  }
  export function makeArray(num:number):number[]{
       let arr = new Array(num);
       for (var i = 0; i < num; i++) {
          arr[i] = i;
        }
        return arr;

  }
  export function pitClicked(event:any,row: number, column: number): void{
    // state.board[row][column]=0;
    console.info("Cell clicked (row,col): ("+row+","+column+")");
    if(!isHumanTurn()) return;

    let nextMove: IMove = null;
    try{
     nextMove = gameLogic.createMove(state, row, column, currentUpdateUI.turnIndex);

    }
    catch(exception){
      console.info("Problem in createMove: " + exception);
      return;
    }

    gameService.makeMove(nextMove, null);

    if(nextMove.endMatchScores!==null){
        isEndState = true;
      console.info("end state detected to be true " + isEndState);
        if(nextMove.endMatchScores[0]>nextMove.endMatchScores[1]){
          console.log("Winner is 0");
          winner= 0;
        }
        else{
          console.log("Winner is 1");
          winner= 1;
        }

    }
    //currentUpdateUI.turnIndex = nextMove.turnIndex;
    //currentUpdateUI.yourPlayerIndex = nextMove.turnIndex;
    clickedRow = row;
    clickedCol = column;

    console.log("Current player's name is "+
    currentUpdateUI.yourPlayerInfo.displayName);


  }
  export function updatePosition(destinationElement:any,
  currentRow:number,currentCol:number,deltaboard:Board,stateBoard:Board,isStore:boolean):MyPosition{
  let newPositionTop = 0;
  let newPositionLeft = 0;
  newPositionTop = destinationElement.getBoundingClientRect().top;
  newPositionLeft = destinationElement.getBoundingClientRect().left;
  let newPositionShift:any = null;
  if(isStore){
    console.log(giveCounts(currentRow,currentCol)+" "+deltaboard[currentRow][currentCol]);
    newPositionShift =
    position_arr[stateBoard[currentRow][currentCol]+deltaboard[currentRow][currentCol]];

  }
  else{
    console.log(giveCounts(currentRow,currentCol)+" "+deltaboard[currentRow][currentCol]);
    newPositionShift = position_arr_pit[stateBoard[currentRow][currentCol]+deltaboard[currentRow][currentCol]];

  }
  console.log(destinationElement+" "+currentRow+" "+currentCol+" "+newPositionShift.t+" "+newPositionShift.l);
  console.log(destinationElement.clientLeft + " "+newPositionShift.l);
  newPositionTop = newPositionTop +
  destinationElement.clientHeight*(newPositionShift.t/100);
  newPositionLeft = newPositionLeft +
  destinationElement.clientWidth*(newPositionShift.l/100);
  return {top: newPositionTop, left: newPositionLeft };
}
/*function getPitIndex(row:number,col:number):number{
  let pitIndex = 0;
  if(row==0){
      pitIndex = row + col - 1;
  }
  else{
      pitIndex = row*6 + col;
  }
  return pitIndex;
}*/
function getNewPosition(deltaboard:Board,stateBoard:Board,currentRow:number, currentCol:number,
  sourceCellRow:number,sourceCellCol:number):MyPosition{
  let newPosition:MyPosition = null;
  deltaboard[currentRow][currentCol]--;
  deltaboard[sourceCellRow][sourceCellCol]++;
  //store two condition

  if(currentRow==1 && currentCol==6){
    newPosition = updatePosition(document.getElementById('store-1'),
    currentRow,currentCol,deltaboard,stateBoard,true);
  }
  //store one condition
  else if(currentRow==0 && currentCol==0){
    newPosition = updatePosition(document.getElementById('store-0'),currentRow,
    currentCol,deltaboard,stateBoard,true);

  }
  //pit condition
  else{
    newPosition = updatePosition(document.getElementById('pit-'+currentRow+currentCol),
    currentRow,currentCol,deltaboard,stateBoard,false);

  }
  return newPosition;

}
function putintoDestination(loopCount:number,children:any,currentRow:number,
  currentCol:number,turn:number,deltaboard:Board,stateBoard:Board):void{
   let sourceCellRow = currentRow;
   let sourceCellCol = currentCol;
  //check destination cells
  for(let loopNo = 0; loopNo< loopCount; loopNo++){
    let candyImage = children[loopNo].getElementsByTagName("img")[0];
    let currentPositionLeft = candyImage.getBoundingClientRect().left;
    let currentPositionTop = candyImage.getBoundingClientRect().top;
    let updateIndex = true;
    if(updateIndex){
      if(currentRow == 1){
        currentCol++;
        if(turn==0 && currentCol==6){
          currentRow=0;
        }
        if(currentCol>=7){
          currentCol--;
          currentRow = 0;
        }
      }
      else{
        currentCol--;
        if(turn == 1 && currentCol==0){
          currentRow = 1;
        }
        if(currentCol<0){
          currentCol++;
          currentRow = 1;
        }
      }

    }
    console.log("Moving to");
    console.log(currentRow);
    console.log(currentCol);
    let newPosition:MyPosition = null;
    if(deltaboard[currentRow][currentCol]==1){
      newPosition  = getNewPosition(deltaboard,stateBoard,currentRow, currentCol,
        sourceCellRow,sourceCellCol);
      updateIndex = true;

    }
    else{
        //handle the case when there can be case where whole circle can be completed
        if(deltaboard[currentRow][currentCol]>1){
          newPosition  = getNewPosition(deltaboard,stateBoard,currentRow, currentCol,
            sourceCellRow,sourceCellCol);
          updateIndex = false;
        }
        else{
          if(updateIndex){
            for(let i=0;i<deltaboard.length;i++){
              for(let j=0;j<deltaboard[0].length;j++){
                if(deltaboard[i][j]>0){
                  currentRow = i;
                  currentCol = j;
                  break;
                }

              }
            }
          }
          newPosition  = getNewPosition(deltaboard,stateBoard,currentRow, currentCol,
            sourceCellRow,sourceCellCol);
          updateIndex = false;
        }
    }

    let newPositionLefttext = newPosition.left-currentPositionLeft + 'px';
    let newPositionToptext = newPosition.top-currentPositionTop + 'px';
    console.log("delta positions")
    console.log(newPositionLefttext);
    console.log(newPositionToptext);
    candyImage.style.transform = "translate("+newPositionLefttext+","+newPositionToptext+")";
  }


}
function translateToNewPosition(row:number,col:number,deltaBoard:Board,stateBoard:Board):void{
  //let children =
  //event.currentTarget.getElementsByClassName("pit")[0].children;
  //let storeArray = document.getElementById("gameArea").children[0].getElementsByClassName("player-two store");
  //let pitArray = document.getElementById("gameArea").children[0].getElementsByClassName("pit");
  let experimentPit = document.getElementById("pit-01");
  console.log(experimentPit);
  console.log(document.getElementById("gameArea"));
  ///let pitPositions:MyPosition[] = [];
  //let destinationPits:number[] = [];
  let positionCount = 0;
  let loopCount = 0;

  //check departure cell
  if(deltaBoard[row][col]<0){
    loopCount = -1 * deltaBoard[row][col];
    let children:any = document.getElementById('pit-'+row+col).children;
    let turn = row;
    putintoDestination(loopCount,children,row,col,
      turn,deltaBoard,stateBoard);

  }
  //check for other cells if there are any transfers left
  for(let rowNo = 0;rowNo < 2;rowNo++){
    for(let colNo = 0;colNo < 7;colNo++){
        if(deltaBoard[rowNo][colNo]<0){
          loopCount = -1 * deltaBoard[rowNo][colNo];
          let children:any = document.getElementById('pit-'+rowNo+colNo).children;
          let turn = row;
          putintoDestination(loopCount,children,rowNo,colNo,
            turn,deltaBoard,stateBoard);

        }

    }
  }


}
export function animate(row:number,col:number,params:any):void{
  console.log("The delta of this move is: ");
  console.log(params.state.delta.board);
  console.log("The delta of this move ends");
  translateToNewPosition(row,col,params.state.delta.board,state.board);
}

  function isEndOfGame():boolean{
      console.log("is End of Game is: "+isEndState);
    if(currentUpdateUI.turnIndex === -1){
      console.log("is end state is tureeeeeee");
    }
    else{
      console.log("is falseeeeeeeeeeeeeeeeee");
    }
    return isEndState;
  }
  export function isDrawn():boolean{
    if(isEndOfGame() && currentUpdateUI.endMatchScores[0]===currentUpdateUI.endMatchScores[1]){
      console.log("Drawing condition true");
      return true;
    }
    return false;
  }
  export function getWinner():string{
    console.log("in give winnerrrrrrr " + currentUpdateUI.endMatchScores + " " + isEndState);
       console.log("hello?");
       if(currentUpdateUI.endMatchScores!==null){
        isEndState = true;
      console.info("end state detected to be true " + isEndState);
        if(currentUpdateUI.endMatchScores[0]>currentUpdateUI.endMatchScores[1]){
      console.log("Winner is 0");
      winner= 0;
    }
    else  if(currentUpdateUI.endMatchScores[0]<currentUpdateUI.endMatchScores[1]){
      console.log("Winner is 1");
      winner= 1;
    }
    else{
      winner = 2;
    }
  }
  if(winner === 1 || winner === 0) {
    if(currentUpdateUI.playersInfo[winner].displayName &&
        currentUpdateUI.playersInfo[winner].displayName!=null){
          return currentUpdateUI.playersInfo[winner].displayName+"'s turn"
        }

    return "Player " + winner + " is winner";
  }
  else{
    return "Draw!!! ";
  }
  }
  function getRandom(min:number, max:number):number{
    return Math.random() * (max - min) + min;
  }
  export function getPosition(pos: number,store:number) {

    if(store==1){
      PositionStyle.top = position_arr[pos].t.toString()+'%';
      PositionStyle.left = position_arr[pos].l.toString()+'%';
    }
    else{
      PositionStyle.top = position_arr_pit[pos].t.toString()+'%';
      PositionStyle.left = position_arr_pit[pos].l.toString()+'%';
    }
    return PositionStyle;
  }

  export function flipBoard(){
    console.log("flipdisplay in function is: " + flipDisplay);
    return flipDisplay;
  }
  export function printStatus(){
    let turn:number = getTurnStatus();
    if(currentUpdateUI.playersInfo[turn] && currentUpdateUI.playersInfo[turn].displayName &&
        currentUpdateUI.playersInfo[turn].displayName!=null &&
        currentUpdateUI.playersInfo[turn].displayName!=''){
          console.log("Reaching here to display the name"+
          currentUpdateUI.playersInfo[turn].displayName);
          return currentUpdateUI.playersInfo[turn].displayName+"'s turn"
        }
    return "Player "+turn+"'s turn";

  }
  export function getTurnStatus():number{
      return turnStatus;
  }

}


angular.module('myApp', ['gameServices'])
  .run(['$rootScope', '$timeout',
    function ($rootScope: angular.IScope, $timeout: angular.ITimeoutService) {
      $rootScope['game'] = game;


      game.init($rootScope, $timeout);
    }]);
