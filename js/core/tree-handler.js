// js/core/tree-handler.js

import { showSuggestion } from './ui.js';
import { evaluatePosition } from './engine.js';

let currentTree = null;
let currentNode = null;

/**
 * Сброс дерева и установка корня.
 * Вызывается из main.js: resetTree(debutTree);
 */
export function resetTree(tree) {
    currentTree = tree;
    currentNode = tree;
}

/**
 * Установка текущего узла дерева по последовательности ходов.
 * Вызывается после playOpeningLine: setTreeRootByMoveSequence(moves);
 */
export function setTreeRootByMoveSequence(moves) {
    let node = currentTree;

    for (const move of moves) {
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
 * Проверка: ход в теории?
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
