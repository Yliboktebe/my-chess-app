import { initializeBoard, board } from './board.js';
import { evaluatePosition, getBestMoveFromEngine } from './engine.js';
import { updateHistoryDisplay, showSuggestion } from './ui.js';
import { checkMoveInTheory, resetTree, getNextMoveFromTree, setTreeRootByMoveSequence } from './tree-handler.js';

export const game = new Chess();
export let moveHistory = [];

const openingLine = ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4'];

initializeBoard(game, onDrop);
playOpeningLine();

function playOpeningLine() {
    let i = 0;

    function playNext() {
        if (i >= openingLine.length) {
            setTreeRootByMoveSequence([]);
            evaluatePosition(game.fen());

            if (game.turn() === 'w') {
                showSuggestion("Ваш ход. Следуем по теории.");
            } else if (game.turn() === 'b') {
                setTimeout(() => makeAutoReply(), 400);
            }
            return;
        }

        const move = game.move(openingLine[i]);
        if (move) {
            moveHistory.push(move.san);
            board.position(game.fen());
            updateHistoryDisplay(game);

            const delay = i === 0 ? 1000 : 600;
            i++;
            setTimeout(playNext, delay);
        }
    }

    playNext();
}

function onDrop(source, target) {
    if (game.turn() !== 'w') return 'snapback';

    const move = game.move({ from: source, to: target, promotion: 'q' });
    if (!move) return 'snapback';

    moveHistory.push(move.san);
    updateHistoryDisplay(game);

    const isTheoryMove = checkMoveInTheory(move.san, game);

    if (!isTheoryMove) {
        showSuggestion("Вы вышли из теории. Подключён движок.");
        evaluatePosition(game.fen());
        setTimeout(() => makeAutoReply(), 300);
        return;
    }

    setTimeout(() => makeAutoReply(), 300);
}

function makeAutoReply() {
    if (game.turn() !== 'b') return;

    const blackMove = getNextMoveFromTree();
    if (blackMove) {
        const move = game.move(blackMove);
        if (move) {
            moveHistory.push(move.san);
            board.position(game.fen());
            updateHistoryDisplay(game);
            checkMoveInTheory(move.san, game);
        }
    } else {
        getBestMoveFromEngine(game.fen(), (bestMoveUci) => {
            const move = game.move({
                from: bestMoveUci.slice(0, 2),
                to: bestMoveUci.slice(2, 4),
                promotion: 'q'
            });

            if (move) {
                moveHistory.push(move.san);
                board.position(game.fen());
                updateHistoryDisplay(game);
                showSuggestion("Чёрные сыграли по оценке движка.");
                evaluatePosition(game.fen());
            }
        });
    }
}

document.getElementById('undoBtn').addEventListener('click', () => {
    game.undo(); game.undo();
    moveHistory.pop(); moveHistory.pop();
    board.position(game.fen());
    updateHistoryDisplay(game);
    evaluatePosition(game.fen());
    showSuggestion("Ходы отменены.");
    resetTree();
});

document.getElementById('resetBtn').addEventListener('click', () => {
    game.reset();
    moveHistory = [];
    board.start();
    updateHistoryDisplay(game);
    evaluatePosition(game.fen());
    showSuggestion("Дебют начат заново.");
    resetTree();

    const historyDiv = document.getElementById('history');
    historyDiv.innerHTML = '<span style="opacity: 0.3">1. ...</span>';

    playOpeningLine();
});
