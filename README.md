# MY-CHESS-APP

Обучающее шахматное приложение с фокусом на изучение дебютов.  
Минималистичный, адаптивный WebApp с поддержкой Stockfish и теоретических деревьев.

## 📂 Структура проекта

MY-CHESS-APP/
├── css/
│   └── style.css                         ← Стили
├── engine/
│   ├── stockfish-*.wasm / .js           ← Stockfish WebAssembly
├── img/
│   └── chesspieces/wikipedia/           ← PNG-фигуры
├── js/
│   ├── core/                             ← Ядро
│   │   ├── board.js
│   │   ├── engine.js
│   │   ├── main.js
│   │   ├── tree-handler.js
│   │   └── ui.js
│   ├── trees/                            ← Деревья дебютов
│   │   ├── italiantrees.js
│   │   └── siciliantrees.js             ← (добавишь)
│   └── debuts.js                         ← Реестр всех дебютов
├── debut.html                            ← Универсальный обучающий экран
├── debuts.html                           ← Экран выбора дебютов
├── index.html                            ← Приветствие
└── README.md                             ← Документация


## 🔧 Технологии
- HTML, CSS, JS (ES-модули)
- WebAssembly Stockfish
- Теоретические дебютные деревья
- Модульная архитектура
