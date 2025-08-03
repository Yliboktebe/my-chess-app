export function updateHistoryDisplay(game) {
    const historyDiv = document.getElementById('history');
    const history = game.history();
    let output = '';

    for (let i = 0; i < history.length; i += 2) {
        const white = history[i] || '';
        const black = history[i + 1] || '';
        output += ` <span>${(i / 2) + 1}. ${white} ${black}</span>`;
    }

    historyDiv.innerHTML = output;

    // Плавная прокрутка к последнему ходу
    historyDiv.scrollTo({ left: historyDiv.scrollWidth, behavior: 'smooth' });
}

export function showSuggestion(text) {
    document.getElementById('engineSuggestion').innerText = text;
}
