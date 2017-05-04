type Board = number[][];
/*
board[0][0] pit for 0 player
board[1][6] pit for 1 player
*/
interface BoardDelta {
  row: number;
  col: number;
  board:Board;
  sourceImages:string[][][];
}
var MoveType = {
  1:"clickUpdate",
  2:"emptyHole",
  3:"transferAll"
}
type IProposalData = BoardDelta;
interface IState {
  board: Board;
  delta: BoardDelta;
  deltaArray: BoardDelta[];
  nextMoveType:string;
  lastupdatedrow:number;
  lastupdatedcol:number;
  sourceImages:string[][][];
  previousTurnIndex: number;
}


import gameService = gamingPlatformREMOVEDWHENCOPIED.gameService;
import alphaBetaService = gamingPlatformREMOVEDWHENCOPIED.alphaBetaService;
import translate = gamingPlatformREMOVEDWHENCOPIED.translate;
import resizeGameAreaService = gamingPlatformREMOVEDWHENCOPIED.resizeGameAreaService;
import log = gamingPlatformREMOVEDWHENCOPIED.log;
import dragAndDropService = gamingPlatformREMOVEDWHENCOPIED.dragAndDropService;

module gameLogic {
  export const ROWS = 2;
  export const COLS = 7;
  export const candy1 = "imgs/purplecandy.png";
  export const candy2 = "imgs/bluecandy.png";
  export const candy3 = "imgs/greencandy.png";
  export const candy4 = "imgs/redcandy.png";
  function getInitialSource():string[][][]{
    console.log("In initialize source method");
    let sourceImages:string[][][];
    sourceImages = [];
    for(let rowNo=0;rowNo<2;rowNo++){
      sourceImages[rowNo]=[];
      for(let colNo=0;colNo<7;colNo++){
        sourceImages[rowNo][colNo]=[];
        for(let candyNo=0;candyNo<48;candyNo++){
           sourceImages[rowNo][colNo][candyNo] = candy1;
        }
      }
    }
    for(let rowNo=0;rowNo<2;rowNo++){
      for(let colNo=0;colNo<7;colNo++){
        if(!((rowNo==0 && colNo==0) || (rowNo==1 && colNo==6))){
          sourceImages[rowNo][colNo][0] = candy1;
          sourceImages[rowNo][colNo][1] = candy2;
          sourceImages[rowNo][colNo][2] = candy3;
          sourceImages[rowNo][colNo][3] = candy4;

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

  export function getInitialBoard(): Board {
    let board: Board = [];
    for (let i = 0; i < ROWS; i++) {
      board[i] = [];
      for (let j = 0; j < COLS; j++) {
        board[i][j] = 4;
      }
    }
    board[0][0] = 0;
    board[1][6] = 0;
    return board;
  }
  export function getPseudoInitialBoard(): Board {
    //pseudo Initial board for testing the end condition
    let board: Board = [];
    for (let i = 0; i < ROWS; i++) {
      board[i] = [];
      for (let j = 0; j < COLS; j++) {
        board[i][j] =0;
      }
    }
    board[1][5] = 0;
    board[1][4] = 3;
    board[0][0] = 20;
    board[1][1] = 2;
    board[0][2] = 13;
    board[0][1] = 2;
    return board;
  }

  export function getInitialState(): IState {
    console.log("Initial state method called in gameLogic");

    return {board: getPseudoInitialBoard(), delta: null,deltaArray: null,lastupdatedrow:-1,
      lastupdatedcol:-1,nextMoveType:"clickUpdate",sourceImages:getInitialSource(), previousTurnIndex: null};
  }


  function transferAllLeft(board:Board):IState{
    console.log("Transferring the remaining stuff into appropriate store");
    let lastupdatedr = 0;
    let lastupdatedc = 0;
    let boardAfterMove:Board = angular.copy(board);
    for(let j=1;j<COLS;j++){
      if(boardAfterMove[0][j]>0){
        boardAfterMove[0][0]+=boardAfterMove[0][j];
        lastupdatedr = 0;
        lastupdatedc = j;
        boardAfterMove[0][j] = 0;
      }

    }
    for(let j=0;j<COLS-1;j++){
      if(boardAfterMove[1][j]>0){
        boardAfterMove[1][6]+=boardAfterMove[1][j];
        lastupdatedr = 1;
        lastupdatedc = j;
        boardAfterMove[1][j] = 0;
      }

    }
    let deltaBoard:Board = createDelta(boardAfterMove,board);
    let delta:BoardDelta = {board:deltaBoard,row:lastupdatedr,col:lastupdatedc,sourceImages:null};
    let updatedState:IState =
    {board : boardAfterMove, delta:delta,deltaArray:null,
      lastupdatedrow : lastupdatedr,lastupdatedcol:lastupdatedc,nextMoveType:null,
      sourceImages:null,previousTurnIndex:null};
    return updatedState;


  }
  function getWinner(board: Board): number {
    console.log("in Get the winner game Logic");
    if(board[0][0]>board[1][6]){
      return 0;
    }
    else if(board[0][0]===board[1][6]){
      return -1;
    }
    else{
      return 1;
    }
  }
  function isEndState(board:Board): boolean {
    let firstrow = true;
    let secondrow = true;
    for(let j=1;j<COLS;j++){
      if(board[0][j]!==0){
        firstrow = false;
        break;
      }
    }
    for(let j=0;j<COLS-1;j++){
      if(board[1][j]!==0){
        secondrow = false;
        break;
      }
    }
    return firstrow || secondrow;

  }
  function updateBoard(board:Board,row:number,col:number):IState{
    console.log("In update board in gameLogic");
    let boardAfterMove = angular.copy(board);
    let updatedState:IState = null;
    let i:number;
    let j:number;
    i = row;
    j = col;
    let val:number;
    val = boardAfterMove[i][j];
    boardAfterMove[i][j] = 0;
    while(val>0){
      if(i===0){
        j--;
        if(row===0 && j<0){
          i = i + 1;
          j=0;
        }
        else if(row===1 && j<1){
          i = i + 1;
          j=0;
        }
        boardAfterMove[i][j]+=1;
      }
      else{
        j++;
        if(row===0 && j>5){
          i = i - 1;
          j=6;
        }
        else if(row===1 && j>6){
          i = i - 1;
          j=6;
        }
        boardAfterMove[i][j] = boardAfterMove[i][j] + 1;

      }
      val--;
    }
    let deltaBoard:Board = createDelta(boardAfterMove,board);
    let delta:BoardDelta = {board:deltaBoard,row:row,col:col,sourceImages:null};
    // empty hole on last chance handled
    if(boardAfterMove[i][j]===1 && row===i &&
      !((i===0 && j===0) || (i===1 && j===6)) &&
      ((i===0 && boardAfterMove[1-i][j-1]>0) ||
      (i===1 && boardAfterMove[1-i][j+1]>0))){
        updatedState = {board : boardAfterMove, delta : delta,deltaArray:null,lastupdatedrow : i,
          lastupdatedcol : j,nextMoveType:"emptyHole",sourceImages:null,previousTurnIndex:null};
    }
    else if(isEndState(boardAfterMove)){
      updatedState = {board : boardAfterMove, delta : delta,deltaArray:null,lastupdatedrow : i,
        lastupdatedcol : j,nextMoveType:"transferAll",sourceImages:null,previousTurnIndex:null};
    }
    else{
        updatedState = {board : boardAfterMove, delta : delta,deltaArray:null,lastupdatedrow : i,
        lastupdatedcol : j,nextMoveType:"clickUpdate",sourceImages:null,previousTurnIndex:null};

    }

    return updatedState;
  }
  function updateEmptyHole(board:Board,row:number,col:number):IState{
    let boardAfterMove:Board = angular.copy(board);
    let i:number = row;
    let j:number = col;
    if(i===0 && boardAfterMove[1-i][j-1]>0){
      boardAfterMove[i][j] = 0;
      boardAfterMove[0][0] += boardAfterMove[1-i][j-1]+1;
      boardAfterMove[1-i][j-1] = 0;
    }
    if(i===1 && boardAfterMove[1-i][j+1]>0){
      boardAfterMove[i][j]=0;
      boardAfterMove[1][6] += boardAfterMove[1-i][j+1]+1;
      boardAfterMove[1-i][j+1] = 0;
    }
    let deltaBoard:Board = createDelta(boardAfterMove,board);
    let delta:BoardDelta = {board:deltaBoard,row:row,col:col,sourceImages:null};
    let updateState:IState = {board:boardAfterMove,delta:delta,deltaArray:null,lastupdatedrow:i,
    lastupdatedcol:j,nextMoveType:"clickUpdate",sourceImages:null,previousTurnIndex:null}
    if(isEndState(boardAfterMove)){
      updateState.nextMoveType = "transferAll";
    }
    return updateState;
  }
  function nextTurn(turnIndex: number,row: number,col: number,nextMoveType:string): number{
    if(((row===0 && col===0) || (row===1 && col===6)) || nextMoveType=="emptyHole"){
      return turnIndex;
    }
    else{
      console.log("Previous turnIndex value is "+turnIndex);
      return 1 - turnIndex;
    }
  }
  export function createDelta(boardAfterMove:Board, boardBeforeMove:Board):Board{
    let deltaBoard:Board = [];
    console.log(boardBeforeMove);
    console.log(boardAfterMove);

    for(let rowNo = 0;rowNo<ROWS;rowNo++){
      deltaBoard[rowNo] = [];
      for(let colNo = 0;colNo<COLS;colNo++){
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

  /**
   * Returns the move that should be performed when player
   * with index BeforeMove makes a move in cell row X col.
   */
  export function createMove(
      stateBeforeMove: IState, row: number, col: number, turnIndexBeforeMove: number): IMove {
        console.log("in create move in gameLogic");
    if (!stateBeforeMove) {
      stateBeforeMove = getInitialState();
    }
    let board: Board = stateBeforeMove.board;
    let nextMoveType = stateBeforeMove.nextMoveType;
    console.log(stateBeforeMove.nextMoveType);
    let endMatchScores: number[] = null;
    let turnIndex: number;
    let sourceImages:string[][][] = stateBeforeMove.sourceImages;

    console.log("Turnindexbeforemove: "+turnIndexBeforeMove+"row: "+row);
    let updatedState:IState = null;

    if(nextMoveType=="clickUpdate"){
      console.log("Click movement happening");
      if(row!==turnIndexBeforeMove || board[row][col] === 0
        || (row===0 && col===0) || (row===1 && col===6)){
        throw new Error("Making an invalid move!");
      }
      updatedState = updateBoard(board,row,col);

      if(updatedState.nextMoveType!="transferAll"){
        turnIndex = nextTurn(turnIndexBeforeMove, updatedState.lastupdatedrow,
          updatedState.lastupdatedcol, updatedState.nextMoveType);

      }
      else{
        turnIndex = turnIndexBeforeMove;
      }
    }
    else if(nextMoveType=="emptyHole"){
      console.log("Jackpot condition");
      updatedState = updateEmptyHole(board,row,col);
      updatedState.previousTurnIndex=turnIndexBeforeMove;
      if(updatedState.nextMoveType!="transferAll"){
        turnIndexBeforeMove = 1 - turnIndexBeforeMove;
      }

      turnIndex = turnIndexBeforeMove;
        }
    else if(nextMoveType=="transferAll"){
      updatedState = transferAllLeft(board);
      let boardAfterMove:Board = updatedState.board;
      let winner = getWinner(boardAfterMove);
      //turnIndexBeforeMove = -1;
      turnIndex = -1;
      endMatchScores = winner === 0 ? [1, 0] : winner === 1 ? [0, 1] : [0, 0];
    }

    else{
      throw new Error("Invalid movetype");
    }

    console.log("TurnIndex value is: "+turnIndex);

    updatedState.sourceImages = angular.copy(sourceImages);
    updatedState.delta.sourceImages = angular.copy(sourceImages);
    if(updatedState.previousTurnIndex === null){
      updatedState.previousTurnIndex=turnIndexBeforeMove;
    }
    updatedState.deltaArray = [];
    if(stateBeforeMove.deltaArray !== null){
      let tempDeltaArray:BoardDelta[] = angular.copy(stateBeforeMove.deltaArray);
      updatedState.deltaArray=tempDeltaArray;
    }
    updatedState.deltaArray.push(updatedState.delta);

    let state: IState = updatedState;
    console.info("Returning createMove successfully" );

    return {
      endMatchScores: endMatchScores,
      turnIndex: turnIndex,
      state: state
    };
  }

  export function createInitialMove(): IMove {
    return {endMatchScores: null, turnIndex: 0,
        state: getInitialState()};
  }

  export function forSimpleTestHtml() {
    var move = gameLogic.createMove(null, 0, 0, 0);
    log.log("move=", move);
  }
}
