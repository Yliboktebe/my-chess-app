// Создаём Web Worker с движком
const stockfish = new Worker("engine/stockfish-17-single.js");

let isReady = false;
let isInitialized = false;
let pendingCommands = [];

let bestMoveCallback = null;
let evalTimeout = null;
let isEvaluating = false; // 🛡 защита от перегрузки

// Безопасная отправка команд в движок
function sendToEngine(command) {
    if (isReady) {
        stockfish.postMessage(command);
    } else {
        pendingCommands.push(command);
    }
}

// Обработка всех сообщений от движка
stockfish.onmessage = function (event) {
    const line = event.data;
    console.log("SF:", line);

    if (line === "uciok") {
        isInitialized = true;
        stockfish.postMessage("isready");
    }

    if (line === "readyok") {
        isReady = true;
        // Выполнить отложенные команды
        pendingCommands.forEach(cmd => stockfish.postMessage(cmd));
        pendingCommands = [];
    }

    // Если движок выдал лучший ход
    if (line.startsWith("bestmove") && bestMoveCallback) {
        const parts = line.split(" ");
        if (parts.length >= 2) {
            const bestMove = parts[1];
            bestMoveCallback(bestMove);
        }
        bestMoveCallback = null;
    }

    // Если пришла оценка позиции
    if (line.startsWith("info depth")) {
        const depthMatch = line.match(/depth (\d+)/);
        const scoreMatch = line.match(/score (cp|mate) (-?\d+)/);

        if (depthMatch && scoreMatch) {
            const depth = parseInt(depthMatch[1]);
            const type = scoreMatch[1];
            const value = parseInt(scoreMatch[2]);
            const score = type === "mate" ? (value > 0 ? 1000 : -1000) : value;

            if (depth >= 10) {
                clearTimeout(evalTimeout);
                evalTimeout = setTimeout(() => {
                    updateEvalBar(score);
                    isEvaluating = false; // анализ завершён
                }, 400);
            }
        }
    }
};

// Инициализация движка
stockfish.postMessage("uci");

// Отправка позиции и запрос оценки (только для шкалы)
export function evaluatePosition(fen) {
    if (isEvaluating) return;
    isEvaluating = true;

    sendToEngine("stop");
    sendToEngine("ucinewgame");
    sendToEngine("position fen " + fen);
    sendToEngine("go depth 12");

    // страховка: сброс блокировки, если движок зависнет
    setTimeout(() => {
        isEvaluating = false;
    }, 3000);
}

// Получить лучший ход от движка (асинхронно)
export function getBestMoveFromEngine(fen, callback) {
    bestMoveCallback = callback;

    sendToEngine("stop");
    sendToEngine("ucinewgame");
    sendToEngine("position fen " + fen);
    sendToEngine("go depth 12");
}

// Обновление графической шкалы оценки позиции
function updateEvalBar(score) {
    const capped = Math.max(Math.min(score, 1000), -1000);

    // Инвертируем: положительное — перевес белых => белая шкала снизу
    const percent = 50 - (capped / 20);
    const whiteHeight = Math.min(Math.max(percent, 0), 100);
    const blackHeight = 100 - whiteHeight;

    document.getElementById('evalWhite').style.height = `${whiteHeight}%`;
    document.getElementById('evalBlack').style.height = `${blackHeight}%`;
}


