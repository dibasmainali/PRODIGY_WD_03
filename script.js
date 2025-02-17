const cells = document.querySelectorAll('.cell');
const restartBtn = document.getElementById('restartBtn');
const playerModeSelect = document.getElementById('playerModeSelect');
const difficultySelect = document.getElementById('difficultySelect');
const statusMessage = document.getElementById('statusMessage');

let currentPlayer = 'x';
let gameState = Array(9).fill('');
let scores = { x: 0, o: 0 };
let isSinglePlayer = false;
let difficulty = 'easy';

const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

// Event Listeners
playerModeSelect.addEventListener('change', (event) => {
    isSinglePlayer = event.target.value === 'single';
    difficultySelect.style.display = isSinglePlayer ? 'inline-block' : 'none';
    restartGame();
});

difficultySelect.addEventListener('change', (event) => {
    difficulty = event.target.value;
    restartGame();
});

cells.forEach(cell => cell.addEventListener('click', handleClick));
restartBtn.addEventListener('click', restartGame);

// Game Logic
function handleClick(event) {
    const cell = event.target;
    const cellIndex = cell.getAttribute('data-index');
    
    if (gameState[cellIndex] !== '' || checkWinner(currentPlayer)) return;

    makeMove(cellIndex, currentPlayer);
    if (checkWinner(currentPlayer)) return endGame(`${currentPlayer.toUpperCase()} wins!`);
    if (gameState.every(cell => cell !== '')) return endGame("It's a draw!", false);
    
    currentPlayer = currentPlayer === 'x' ? 'o' : 'x';
    if (isSinglePlayer && currentPlayer === 'o') setTimeout(aiMove, 300);
}

function makeMove(index, player) {
    gameState[index] = player;
    const cell = document.querySelector(`[data-index="${index}"]`);
    cell.classList.add(player);
    cell.innerHTML = player.toUpperCase();
}

function aiMove() {
    let move;
    const emptyCells = gameState.map((cell, i) => cell === '' ? i : null).filter(i => i !== null);

    if (difficulty === 'easy') {
        move = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    } else if (difficulty === 'medium') {
        move = findBestMove();
    } else if (difficulty === 'hard') {
        move = minimax(gameState, 'o').index;
    }

    makeMove(move, 'o');
    if (checkWinner('o')) return endGame("O wins!");
    if (gameState.every(cell => cell !== '')) return endGame("It's a draw!", false);
    currentPlayer = 'x';
}

function findBestMove() {
    for (let condition of winningConditions) {
        let [a, b, c] = condition;
        let line = [gameState[a], gameState[b], gameState[c]];
        if (line.filter(x => x === 'o').length === 2 && line.includes('')) return condition[line.indexOf('')];
        if (line.filter(x => x === 'x').length === 2 && line.includes('')) return condition[line.indexOf('')];
    }
    return gameState.findIndex(cell => cell === '');
}

// Minimax Algorithm for Hard Mode
function minimax(state, player) {
    const emptyCells = state.map((cell, i) => cell === '' ? i : null).filter(i => i !== null);
    
    if (checkWin(state, 'o')) return { score: 1 };
    if (checkWin(state, 'x')) return { score: -1 };
    if (emptyCells.length === 0) return { score: 0 };

    let moves = [];

    for (let i of emptyCells) {
        let move = {};
        move.index = i;
        state[i] = player;

        if (player === 'o') {
            move.score = minimax(state, 'x').score;
        } else {
            move.score = minimax(state, 'o').score;
        }

        state[i] = '';
        moves.push(move);
    }

    let bestMove;
    if (player === 'o') {
        let highestScore = -Infinity;
        for (let move of moves) {
            if (move.score > highestScore) {
                highestScore = move.score;
                bestMove = move;
            }
        }
    } else {
        let lowestScore = Infinity;
        for (let move of moves) {
            if (move.score < lowestScore) {
                lowestScore = move.score;
                bestMove = move;
            }
        }
    }

    return bestMove;
}

function checkWin(board, player) {
    return winningConditions.some(condition => condition.every(index => board[index] === player));
}

function checkWinner() {
    return winningConditions.some(condition => condition.every(index => gameState[index] === currentPlayer));
}

function endGame(message, updateScoresFlag = true) {
    statusMessage.textContent = message;
    
    // Update scores if someone wins
    if (updateScoresFlag && message.includes('wins')) {
        scores[currentPlayer]++;
        console.log(`Updated Score - X: ${scores.x}, O: ${scores.o}`); // Debugging log
    }

    updateScores();
    setTimeout(restartGame, 2000); // Automatically restart game after 2 seconds
}


function updateScores() {
    document.getElementById('playerXScore').textContent = `Player X: ${scores.x}`;
    document.getElementById('playerOScore').textContent = `Player O: ${scores.o}`;
}
playerModeSelect.addEventListener('change', (event) => {
    isSinglePlayer = event.target.value === 'single';
    
    // Show difficulty selection only in single-player mode
    if (isSinglePlayer) {
        difficultySelect.style.display = 'inline-block';
        difficultySelect.value = 'hard'; // Set default difficulty to hard
        difficulty = 'hard'; // Ensure the difficulty is set in the logic
    } else {
        difficultySelect.style.display = 'none';
    }

    restartGame();
});


function restartGame() {
    gameState.fill('');
    cells.forEach(cell => {
        cell.classList.remove('x', 'o');
        cell.innerHTML = '';
    });
    currentPlayer = 'x';
    isSinglePlayer = playerModeSelect.value === 'single';
    difficultySelect.style.display = isSinglePlayer ? 'inline-block' : 'none';
    statusMessage.textContent = "";
}
