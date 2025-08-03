import { initializeBoard, board } from './board.js';
import { evaluatePosition, getBestMoveFromEngine } from './engine.js';
import { updateHistoryDisplay, showSuggestion } from './ui.js';
import { checkMoveInTheory, resetTree, getNextMoveFromTree, setTreeRootByMoveSequence } from './tree-handler.js';
import { debutsList } from '../debuts.js';

export const game = new Chess();
export let moveHistory = [];

let openingLine = [];

// === 1. Определяем дебют по URL ===
const params = new URLSearchParams(window.location.search);
const debutId = params.get("debut");

const debutMeta = debutsList.find(d => d.id === debutId);
if (!debutMeta) {
    alert("Ошибка: дебют не найден");
    throw new Error("Unknown debut: " + debutId);
}

document.getElementById("page-title").innerText = debutMeta.name;
document.getElementById("page-header").innerText = debutMeta.name;

// === 2. Загружаем дерево ===
const { debutTree } = await import(`../trees/${debutMeta.file}`);
resetTree(debutTree);

// === 3. Получаем стартовую последовательность из дерева (если есть) ===
openingLine = Array.isArray(debutTree?.openingLine) ? debutTree.openingLine : [];

initializeBoard(game, onDrop);
playOpeningLine();

// === 4. Автоматическое воспроизведение начала партии ===
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

// === 5. Обработка пользовательского хода ===
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

// === 6. Ответ чёрных ===
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

// === 7. Кнопка "Назад" ===
document.getElementById('undoBtn').addEventListener('click', () => {
    game.undo(); game.undo();
    moveHistory.pop(); moveHistory.pop();
    board.position(game.fen());
    updateHistoryDisplay(game);
    evaluatePosition(game.fen());
    showSuggestion("Ходы отменены.");
    resetTree(debutTree);
});

// === 8. Кнопка "Начать заново" ===
document.getElementById('resetBtn').addEventListener('click', () => {
    game.reset();
    moveHistory = [];
    board.start();
    updateHistoryDisplay(game);
    evaluatePosition(game.fen());
    showSuggestion("Дебют начат заново.");
    resetTree(debutTree);

    const historyDiv = document.getElementById('history');
    historyDiv.innerHTML = '<span style="opacity: 0.3">1. ...</span>';

    playOpeningLine();
});
