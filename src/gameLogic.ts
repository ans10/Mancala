type Board = number[][];
/*
board[0][0] pit for 0 player
board[1][6] pit for 1 player
*/
interface BoardDelta {
  row: number;
  col: number;
}
type IProposalData = BoardDelta;
interface IState {
  board: Board;
  delta: BoardDelta;
}
interface UpdateState{
  board: Board;
  lastupdatedrow: number;
  lastupdatedcolumn: number;
}

import gameService = gamingPlatform.gameService;
import alphaBetaService = gamingPlatform.alphaBetaService;
import translate = gamingPlatform.translate;
import resizeGameAreaService = gamingPlatform.resizeGameAreaService;
import log = gamingPlatform.log;
import dragAndDropService = gamingPlatform.dragAndDropService;

module gameLogic {
  export const ROWS = 2;
  export const COLS = 7;

  /** Returns the initial TicTacToe board, which is a ROWSxCOLS matrix containing ''. */
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
    board[1][4] = 0;
    board[0][0] = 24;
    board[1][6] = 20;
    board[0][1] = 1;
    return board;
  }


  export function getInitialState(): IState {
    console.log("Initial state method called in gameLogic");
    return {board: getInitialBoard(), delta: null};
  }


  /**
   * Returns true if the game ended in a tie because there are no empty cells.
   * E.g., isTie returns true for the following board:
   *     [['X', 'O', 'X'],
   *      ['X', 'O', 'O'],
   *      ['O', 'X', 'X']]
   */
  function isTie(board: Board): boolean {

    if (board[0][0] === board[1][6]){
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
  function transferAllLeft(board:Board):UpdateState{
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

    let updatedState:UpdateState =
    {board : boardAfterMove, lastupdatedrow : lastupdatedr, lastupdatedcolumn : lastupdatedc};
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
  function updateBoard(board:Board,row:number,col:number):UpdateState{
    console.log("In update board in gameLogic");
    let boardAfterMove = angular.copy(board);
    let updatedState:UpdateState = null;
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
    // empty hole on last chance handled
    if(boardAfterMove[i][j]===1 && row===i &&
      !((i===0 && j===0) || (i===1 && j===6))){


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

    }
    updatedState = {board : boardAfterMove, lastupdatedrow : i, lastupdatedcolumn : j};
    return updatedState;
  }
  function nextTurn(turnIndex: number,row: number,col: number): number{
    if((row===0 && col===0) || (row===1 && col===6)){
      return turnIndex;
    }
    else{
      console.log("Previous turnIndex value is "+turnIndex);
      return 1 - turnIndex;
    }
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
    console.log("Turnindexbeforemove: "+turnIndexBeforeMove+"row: "+row);
    if (board[row][col] === 0 || (row===0 && col===0) || (row===1 && col===6) ||
        row!==turnIndexBeforeMove) {
      throw new Error("Making an invalid move!");
    }
    let updatedState = updateBoard(board,row,col);
    let boardAfterMove = updatedState.board;
    let endMatchScores: number[];
    let turnIndex: number;

    if(isEndState(boardAfterMove)){
      //Game over
      console.log("Game's end state detected in Game Logic");
      updatedState = transferAllLeft(boardAfterMove);
      boardAfterMove = updatedState.board;
      let winner = getWinner(boardAfterMove);
      turnIndex = -1;
      endMatchScores = winner === 0 ? [1, 0] : winner === 1 ? [0, 1] : [0, 0];

    }
    else{
      //Game continues
      turnIndex = nextTurn(turnIndexBeforeMove, updatedState.lastupdatedrow, updatedState.lastupdatedcolumn);
      console.log("TurnIndex value is: "+turnIndex);
      endMatchScores = null;

    }
    /*if (getWinner(board) !== '' || isTie(board)) {
      throw new Error("Can only make a move if the game is not over!");
    }*/

    let delta: BoardDelta = {row: row, col: col};
    let state: IState = {delta: delta, board: boardAfterMove};
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
