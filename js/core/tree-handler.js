import { evaluatePosition } from './engine.js';

let currentTree = null;
let currentNode = null;

export function resetTree(tree) {
    currentTree = tree;
    currentNode = tree.root;
}

export function setTreeRootByMoveSequence(moves) {
    let node = currentTree.root;

    for (const move of moves) {
        if (node.move === move) continue;
        if (!Array.isArray(node.replies)) {
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

export function checkMoveInTheory(moveSan, game) {
    if (!currentNode || !Array.isArray(currentNode.replies)) {
        evaluatePosition(game.fen());
        return false;
    }

    const next = currentNode.replies.find(child => child.move === moveSan);

    if (next) {
        currentNode = next;

        if (next.end) {
            evaluatePosition(game.fen());
        }

        return true;
    } else {
        currentNode = null;
        evaluatePosition(game.fen());
        return false;
    }
}

export function getNextMoveFromTree() {
    if (currentNode && Array.isArray(currentNode.replies) && currentNode.replies.length > 0) {
        return currentNode.replies[0].move;
    }
    return null;
}

export function getExpectedMoves() {
    if (currentNode && Array.isArray(currentNode.replies)) {
        return currentNode.replies.map(n => n.move);
    }
    return [];
}

export function getTheoryComment() {
    if (currentNode) {
        return currentNode.comment || (currentNode.lineName ? `Линия: ${currentNode.lineName}` : null);
    }
    return null;
}
