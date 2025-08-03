// js/core/tree-handler.js

import { italianTree } from '../trees/italiantrees.js';
import { showSuggestion } from './ui.js';
import { evaluatePosition } from './engine.js';

let currentNode = italianTree;

/**
 * Установка текущего узла дерева по последовательности ходов.
 * Начинает с `italianTree`, если его `move` входит в цепочку.
 */
export function setTreeRootByMoveSequence(moves) {
    let node = italianTree;

    for (const move of moves) {
        // если текущий узел сам является этим ходом — пропускаем
        if (node.move === move) continue;

        if (!node.replies) {
            currentNode = null;
            return;
        }

        const next = node.replies.find(child => child.move === move);
        if (!next) {
            currentNode = null;
            return;
        }

        node = next;
    }

    currentNode = node;
}

/**
 * Проверка хода в теории
 */
export function checkMoveInTheory(moveSan, game) {
    if (!currentNode || !currentNode.replies) {
        showSuggestion("Вы вышли из теории. Работа движка...");
        evaluatePosition(game.fen());
        return false;
    }

    const next = currentNode.replies.find(child => child.move === moveSan);

    if (next) {
        currentNode = next;

        if (next.lineName) {
            showSuggestion(`Линия: ${next.lineName}`);
        } else if (next.comment) {
            showSuggestion(next.comment);
        } else {
            showSuggestion("Продолжение по теории.");
        }

        if (next.end) {
            showSuggestion("Теория завершена. Работа движка...");
            evaluatePosition(game.fen());
        }

        return true;
    } else {
        showSuggestion("Ход вне теории. Работа движка...");
        currentNode = null;
        evaluatePosition(game.fen());
        return false;
    }
}

/**
 * Получить следующий теоретический ход (для автоответа чёрных)
 */
export function getNextMoveFromTree() {
    if (currentNode && currentNode.replies && currentNode.replies.length > 0) {
        return currentNode.replies[0].move;
    }
    return null;
}

/**
 * Сброс дерева (например, при нажатии "Сброс")
 */
export function resetTree() {
    currentNode = italianTree;
}
