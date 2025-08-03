export let board = null;

export function initializeBoard(gameInstance, onDropCallback) {
  board = Chessboard('chessboard', {
    draggable: true,
    position: 'start',
    pieceTheme: 'img/chesspieces/wikipedia/{piece}.png',
    onDrop: onDropCallback,
    onSnapEnd: () => {
      // Убирает визуальный "призрачный ход"
      board.position(gameInstance.fen());
    }
  });
}
