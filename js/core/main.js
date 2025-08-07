import { initializeBoard, board } from './board.js';
import { evaluatePosition, getBestMoveFromEngine } from './engine.js';
import { updateHistoryDisplay, showSuggestion } from './ui.js';
import {
    checkMoveInTheory,
    resetTree,
    getNextMoveFromTree,
    setTreeRootByMoveSequence,
    getExpectedMoves,
    getTheoryComment
} from './tree-handler.js';
import { debutsList } from '../debuts.js';

export const game = new Chess();
export let moveHistory = [];

let openingLine = [];

// Получаем id дебюта из URL
const params = new URLSearchParams(window.location.search);
const debutId = params.get("debut");

// Находим метаинформацию по дебюту
const debutMeta = debutsList.find(d => d.id === debutId);
if (!debutMeta) {
    alert("Ошибка: дебют не найден");
    throw new Error("Unknown debut: " + debutId);
}

// Устанавливаем заголовки на странице
document.getElementById("page-title").innerText = debutMeta.name;
document.getElementById("page-header").innerText = debutMeta.name;

// ✅ Импортируем модуль дебюта через import.meta.glob()
const debutModules = import.meta.glob('../trees/**/index.js');
const debutPath = `../trees/${debutId}/index.js`;

if (!(debutPath in debutModules)) {
    alert("Ошибка: файл дебюта не найден.");
    throw new Error("Missing debut module: " + debutPath);
}

const module = await debutModules[debutPath]();
const debutTree = module.debutTree || await module.loadTree?.(); // поддержка async fetch

resetTree(debutTree);
openingLine = Array.isArray(debutTree?.openingLine) ? debutTree.openingLine : [];

initializeBoard(game, onDrop);
playOpeningLine();

function updateSuggestion() {
    const expected = getExpectedMoves();
    const comment = getTheoryComment();

    if (game.turn() === 'w') {
        if (expected.length === 0) {
            showSuggestion("Вы вышли из теории. Подключён движок.");
        } else if (expected.length === 1) {
            showSuggestion("Ваш ход по теории: " + expected[0]);
        } else {
            showSuggestion("Выберите один из ходов: " + expected.join(", "));
        }
    } else if (comment) {
        showSuggestion(comment);
    }
}

function playOpeningLine() {
    let i = 0;

    function playNext() {
        if (i >= openingLine.length) {
            setTreeRootByMoveSequence([]);
            evaluatePosition(game.fen());

            if (game.turn() === 'w') {
                updateSuggestion();
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
            i++;
            setTimeout(playNext, i === 1 ? 1000 : 600);
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

    setTimeout(() => {
        if (isTheoryMove) {
            updateSuggestion();
            makeAutoReply();
        } else {
            showSuggestion("Вы вышли из теории. Подключён движок.");
            evaluatePosition(game.fen());
            makeAutoReply();
        }
    }, 100);
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
            updateSuggestion();
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
    resetTree(debutTree);
    showSuggestion("Ходы отменены.");
    updateSuggestion();
});

document.getElementById('resetBtn').addEventListener('click', () => {
    game.reset();
    moveHistory = [];
    board.start();
    updateHistoryDisplay(game);
    evaluatePosition(game.fen());
    resetTree(debutTree);
    showSuggestion("Дебют начат заново.");
    document.getElementById('history').innerHTML = '<span style="opacity: 0.3">1. ...</span>';
    playOpeningLine();
});
