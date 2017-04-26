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
  export let previousTurnIndex = -1;
  export let currentMoveType: string = null;
  export let scores:Board = null;
  export let animationDone = true;
  export let sourceImages:string[][][] = null;
  export let positionImages:any[][][] = null;
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
    {t: 10, l: 50},
    {t: 18, l: 30},
    {t: 18, l: 40},
    {t: 20, l: 35},
    {t: 25, l: 37},
    {t: 25, l: 70},
    {t: 18, l: 66},
    {t: 20, l: 16},
    {t: 14, l: 19},
    {t: 7, l: 36},
    {t: 10, l: 47},
    {t: 25, l: 55},
    {t: 30, l: 67},
    {t: 20, l: 75},
    {t: 14, l: 72},
    {t: 15, l: 43},
    {t: 27, l: 37},
    {t: 32, l: 23},
    {t: 37, l: 13},
    {t: 24, l: 19},
    {t: 18, l: 25},
    {t: 24, l: 27},
    {t: 30, l: 37},
    {t: 20, l: 32},
    {t: 17, l: 41},
    {t: 36, l: 42},
    {t: 32, l: 48},
    {t: 31, l: 49},
    {t: 31, l: 58},
    {t: 27, l: 56},
    {t: 29, l: 14},
    {t: 27, l: 62},
    {t: 38, l: 67},
    {t: 33, l: 20},
    {t: 40, l: 8},
    {t: 33, l: 8},
    {t: 32, l: 72},
    {t: 16, l: 67},
    {t: 16, l: 13},
    {t: 32, l: 31},
    {t: 23, l: 14},
    {t: 29, l: 19},
    {t: 40, l: 34},
    {t: 30, l: 42},
    {t: 24, l: 35},
    {t: 12, l: 30},
    {t: 15, l: 38},
    {t: 12, l: 76}
  ];
  let position_arr_pit =
  [
    {t: 2, l: 50},
    {t: 0, l: 25},
    {t: 25, l: 24},
    {t: 29, l: 45},
    {t: 46, l: 30},
    {t: 20, l: 61},
    {t: 5, l: 63},
    {t: 6, l: 16},
    {t: 8, l: 29},
    {t: 23, l: 36},
    {t: 50, l: 47},
    {t: 34, l: 45},
    {t: 23, l: 60},
    {t: 33, l: 64},
    {t: 15, l: 56},
    {t: 19, l: 43},
    {t: 15, l: 37},
    {t: 57, l: 23},
    {t: 62, l: 23},
    {t: 11, l: 19},
    {t: 33, l: 25},
    {t: 53, l: 27},
    {t: 47, l: 39},
    {t: 40, l: 32},
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
  function boardBeforeMove(boardAfterMove:Board,deltaBoard:Board):Board{
    let boardBeforeMove:Board = angular.copy(boardAfterMove);
    for(let rowNo=0;rowNo<2;rowNo++){
      for(let colNo=0;colNo<7;colNo++){
        boardBeforeMove[rowNo][colNo] = boardAfterMove[rowNo][colNo] -
        deltaBoard[rowNo][colNo];

      }
    }

    return boardBeforeMove;

  }
  export function updateUI(params: IUpdateUI): void {
    log.info("Game got updateUI:", params);
    let playerIdToProposal = params.playerIdToProposal;
     // Only one move/proposal per updateUI
    didMakeMove = playerIdToProposal && playerIdToProposal[yourPlayerInfo.playerId] != undefined;
    yourPlayerInfo = params.yourPlayerInfo;
    currentUpdateUI = params;
    console.log("Double checking playerindex and turn index")
    console.log(currentUpdateUI.yourPlayerIndex);
    console.log(currentUpdateUI.turnIndex);
    clearAnimationTimeout();
    animationDone = false;
    isEndState = false;
    /*For computer moves, only after animation it should occur */
    let sourceCopy:string[][][] = null;
    state = currentUpdateUI.state;
    if(state!=null && state.delta!=null){
      sourceCopy = angular.copy(state.sourceImages);
      scores = boardBeforeMove(state.board,state.delta.board);
      console.log(scores);
      let animateState:IState = angular.copy(state);
      let animateDelta:BoardDelta = angular.copy(state.delta);
      $timeout(()=>{
        sourceCopy = animate(animateState,animateDelta);
        console.log(sourceCopy);
      }, 0);

    }

    if (isFirstMove()) {
      console.log("Initialstate method called");
      state = gameLogic.getInitialState();
      scores = angular.copy(state.board);
      sourceCopy = angular.copy(state.sourceImages);
    }


    setFlipDisplay();


    // We calculate the AI move only after the animation finishes,
    // because if we call aiService now
    // then the animation will be paused until the javascript finishes.
    animationEndedTimeout = $timeout(function(){animationEndedCallback(sourceCopy)}, 2100);

  }
  function setFlipDisplay():void{
    if (currentUpdateUI.playMode === 1 || currentUpdateUI.playMode === "multiplayer"){
      flipDisplay = true;
    }
    else{
      flipDisplay = false;
    }
  }
  function setEndState():void{
    if (getTurnStatus() === -1){
      isEndState = true;
    }
    else{
      isEndState = false;
    }
  }
  function animationEndedCallback(sourceCopy:string[][][]) {
    log.info("Animation ended");
    setTurnStatus();
    updateScores();
    setEndState();
    updateSourceImages(sourceCopy);
    if(state.nextMoveType==null){
        isEndState = true;
        animationDone = true;
    }
    else if(state.nextMoveType=="clickUpdate")
      animationDone = true;
    else{
      console.log("In automatic move type");
      referLogic(state.lastupdatedrow,state.lastupdatedcol);
    }
    $timeout(function(){maybeSendComputerMove()},100);
  }
  function updateSourceImages(sourceCopy:string[][][]):void{
    if(sourceCopy!=null){
      //console.log(sourceImages);
      state.sourceImages = angular.copy(sourceCopy);
      //state.sourceImages = angular.copy(sourceImages);
    }

  }
  function setTurnStatus():void{
    turnStatus = currentUpdateUI.turnIndex;
    if(currentUpdateUI.state!==null){
      previousTurnIndex=currentUpdateUI.state.previousTurnIndex;
      currentMoveType=currentUpdateUI.state.nextMoveType;
    }
  }
  function updateScores(){
    scores = angular.copy(state.board);
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
  function referLogic(row:number, column:number){
    if(currentUpdateUI.turnIndex==-1) {
      console.log("winner is already declared");
      return;
    }
    let nextMove: IMove = null;
    try{

     nextMove = gameLogic.createMove(state, row, column,currentUpdateUI.turnIndex);
     console.log("next move's turn index:");
     console.log(nextMove.turnIndex);
     console.log(currentUpdateUI.turnIndex);
    }
    catch(exception){
      console.info("Problem in createMove: " + exception);
      return;
    }

    gameService.makeMove(nextMove, null);

    if(nextMove.endMatchScores!==null){

      console.info("end state detected to be true " + isEndState);
        /*if(nextMove.endMatchScores[0]>nextMove.endMatchScores[1]){
          console.log("Winner is 0");
          winner= 0;
        }
        else{
          console.log("Winner is 1");
          winner= 1;
        }*/

    }


  }
  export function pitClicked(event:any,row: number, column: number): void{
    console.info("Cell clicked (row,col): ("+row+","+column+")");

    if(!isHumanTurn() || !animationDone) return;
    referLogic(row,column);


  }
  export function updatePosition(destinationElement:HTMLElement,
  currentRow:number,currentCol:number,animateState:IState,animateDelta:BoardDelta):MyPosition{
  let newPositionTop = 0;
  let newPositionLeft = 0;
  let stateBoard:Board = animateState.board;
  let deltaBoard:Board = animateDelta.board;
  newPositionTop = destinationElement.getBoundingClientRect().top;
  newPositionLeft = destinationElement.getBoundingClientRect().left;
  let newPositionShift:any = null;
  if(isStore(currentRow,currentCol)){
    console.log(stateBoard[currentRow][currentCol]+" "+deltaBoard[currentRow][currentCol]);
    newPositionShift =
    position_arr[stateBoard[currentRow][currentCol]-deltaBoard[currentRow][currentCol]-1];

  }
  else{
    console.log(stateBoard[currentRow][currentCol]+" "+deltaBoard[currentRow][currentCol]);
    newPositionShift = position_arr_pit[stateBoard[currentRow][currentCol]-deltaBoard[currentRow][currentCol]-1];

  }
  console.log(destinationElement+" "+currentRow+" "+currentCol+" "+newPositionShift.t+" "+newPositionShift.l);
  newPositionTop = newPositionTop +
  destinationElement.clientHeight*(newPositionShift.t/100);
  newPositionLeft = newPositionLeft +
  destinationElement.clientWidth*(newPositionShift.l/100);
  return {top: newPositionTop, left: newPositionLeft };
}
function getNewParent(currentRow:number, currentCol:number):HTMLElement{
  let parent:HTMLElement = null;
  //store two condition

  if(currentRow==1 && currentCol==6){
    parent = document.getElementById('store-1');
  }
  //store one condition
  else if(currentRow==0 && currentCol==0){
    parent = document.getElementById('store-0');

  }
  //pit condition
  else{
    parent = document.getElementById('pit-'+currentRow+currentCol);


  }
  return parent;

}
function isStore(row:number,col:number):boolean{
  let isStore:boolean = false;
  if((row==1 && col==6) || (row==0 && col==0)){
    isStore = true;
  }

  return isStore;
}
function putintoDestination(children:HTMLElement[],currentRow:number,
  currentCol:number,turn:number,sourceCopy:string[][][],animateState:IState,
  animateDelta:BoardDelta):void{
   let sourceCellRow = currentRow;
   let sourceCellCol = currentCol;
   let oldParentArray:HTMLElement[] = [];
   let newParentArray : HTMLElement[] = [];
   let childArray : HTMLElement[] = [];
   let deltaBoard:Board = animateDelta.board;
   let parent:HTMLElement = null;
   let stateBoard:Board = animateState.board;
   let loopCount = -1 * deltaBoard[currentRow][currentCol];
   console.log("Loop count is: "+loopCount);
   console.log("Children's length is: "+children.length);

   for(let loopNo=0; loopNo<loopCount; loopNo++){
      console.log("Loop No is:"+loopNo);
      let candyImage = children[loopNo].getElementsByTagName("img")[0];
      let currentPositionLeft = candyImage.getBoundingClientRect().left;
      let currentPositionTop = candyImage.getBoundingClientRect().top;

      // Find the destination cells
      while(deltaBoard[currentRow][currentCol]<1){
          if(currentRow == 1){
            currentCol++;
            if(currentCol>=7){
              currentCol--;
              currentRow = 0;
            }
          }
          else{
            currentCol--;
            if(currentCol<0){
              currentCol++;
              currentRow = 1;
            }
          }


      }

      // Start moving
      console.log("Moving to "+currentRow + " "+ currentCol);

      parent  = getNewParent(currentRow, currentCol);
      deltaBoard[currentRow][currentCol]--;
      deltaBoard[sourceCellRow][sourceCellCol]++;
      let newPosition:MyPosition = updatePosition(parent,
      currentRow,currentCol,animateState,animateDelta);
      let newPositionLefttext = newPosition.left-currentPositionLeft + 'px';
      let newPositionToptext = newPosition.top-currentPositionTop + 'px';
      candyImage.style.transform = "translate("+newPositionLefttext+","+newPositionToptext+")";
      sourceCopy[currentRow][currentCol][stateBoard[currentRow][currentCol]-deltaBoard[currentRow][currentCol]-1] =
      candyImage.src;

    }

}

function animate(animateState:IState,animateDelta:BoardDelta):string[][][]{
  let row:number = animateDelta.row;
  let col:number = animateDelta.col;
  let deltaBoard:Board = animateDelta.board;
  let sourceCopy = angular.copy(animateState.sourceImages);
  let positionCount = 0;
  let loopCount = 0;
  let resultArray:any[] = [];
  //check departure cell
  for (let row=0;row<2;row++){
    for( let col=0;col<7;col++){

      if(deltaBoard[row][col]<0){
        loopCount = -1 * deltaBoard[row][col];
        let children:HTMLElement[] = <HTMLElement[]><any>document.getElementById('pit-'+row+col).children;
        console.log("Deparature cell selected is pit-"+row+col);
        console.log("Length of the children is "+children.length);
        let turn = row;
        for(let candyNo=0;candyNo<children.length;candyNo++){
          sourceCopy[row][col][candyNo] = null;
        }
        putintoDestination(children,row,col,
          turn,sourceCopy,animateState,animateDelta);
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

  function isEndOfGame():boolean{
    console.log("End of Game is: "+isEndState);
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
    console.log("Getting the winner" + currentUpdateUI.endMatchScores + " " + isEndState);
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
          return currentUpdateUI.playersInfo[winner].displayName+" is winner!";
        }

    return "Player " + (winner+1) + " is winner!";
  }
  else{
    return "Draw!";
  }
  }
  // function getRandom(min:number, max:number):number{
  //   return Math.random() * (max - min) + min;
  // }
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
    return flipDisplay;
  }
  export function printStatus(){
    let turn:number = turnStatus;
    if(currentUpdateUI.playersInfo[turn] && currentUpdateUI.playersInfo[turn].displayName &&
        currentUpdateUI.playersInfo[turn].displayName!=null &&
        currentUpdateUI.playersInfo[turn].displayName!=''){
          console.log("Reaching here to display the name"+
          currentUpdateUI.playersInfo[turn].displayName);
          return currentUpdateUI.playersInfo[turn].displayName+"'s turn";
        }
    return "Player "+(turn+1)+"'s turn";

  }
  export function getTurnStatus():number{
      return turnStatus;
  }

  export function sameTurnAgain(){
    if(turnStatus===previousTurnIndex){
      if(currentMoveType==="clickUpdate"){
        console.log("In click update");
        return true;
      }
    }
    return false;
  }
  export function isCapture(){
     if(turnStatus===previousTurnIndex){
      if(currentMoveType==="emptyHole"){
        return true;
      }
    }
    return false;
  }
  export function getSource(rowNo:number,colNo:number,candyNo:number):string{
    let imgsrc:string = state.sourceImages[rowNo][colNo][candyNo];
    if(!imgsrc || imgsrc==null){
      console.log("Had to rely on default image");
      imgsrc = gameLogic.candy1;
    }
    return imgsrc;
  }

}


angular.module('myApp', ['gameServices'])
  .run(['$rootScope', '$timeout',
    function ($rootScope: angular.IScope, $timeout: angular.ITimeoutService) {
      $rootScope['game'] = game;


      game.init($rootScope, $timeout);
    }]);
