const boardEl = document.querySelector('#board');
const statusEl = document.querySelector('#status');
const turnEl = document.querySelector('#turn');
const scoreXEl = document.querySelector('#scoreX');
const scoreOEl = document.querySelector('#scoreO');
const scoreXLabel = document.querySelector('#scoreXLabel');
const scoreOLabel = document.querySelector('#scoreOLabel');
const difficultyEl = document.querySelector('#difficulty');
const difficultyWrap = document.querySelector('#difficultyWrap');
const modeButtons = [...document.querySelectorAll('.mode')];

const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
const center = 4;
const corners = [0,2,6,8];
const empty = () => Array(9).fill('');

let board = empty();
let current = 'X';
let gameOver = false;
let thinking = false;
let mode = 'ai';
let score = {
  X: Number(localStorage.getItem('tttX') || 0),
  O: Number(localStorage.getItem('tttO') || 0)
};

function isAiTurn() {
  return mode === 'ai' && current === 'O' && !gameOver;
}

function getWinner(state) {
  for (const line of wins) {
    const [a,b,c] = line;
    if (state[a] && state[a] === state[b] && state[a] === state[c]) return line;
  }
  return null;
}

function isDraw(state) {
  return state.every(Boolean) && !getWinner(state);
}

function render(winLine = null) {
  boardEl.innerHTML = '';

  board.forEach((value, index) => {
    const cell = document.createElement('button');
    cell.type = 'button';
    cell.className = `cell${value ? ` ${value.toLowerCase()}` : ''}${winLine?.includes(index) ? ' win' : ''}`;
    cell.textContent = value;
    cell.disabled = Boolean(value) || gameOver || thinking;
    cell.setAttribute('aria-label', `Клетка ${index + 1}${value ? `, ${value}` : ''}`);
    cell.addEventListener('click', () => move(index));
    boardEl.appendChild(cell);
  });

  scoreXEl.textContent = score.X;
  scoreOEl.textContent = score.O;
  scoreXLabel.textContent = mode === 'ai' ? 'Вы' : 'Крестики';
  scoreOLabel.textContent = mode === 'ai' ? 'ИИ' : 'Нолики';

  if (!gameOver) {
    turnEl.textContent = mode === 'ai'
      ? (current === 'X' ? 'Ваш ход' : 'Ход ИИ…')
      : `Ход ${current === 'X' ? 'крестиков' : 'ноликов'}`;
  } else {
    turnEl.textContent = 'Игра окончена';
  }
}

function saveScore() {
  localStorage.setItem('tttX', String(score.X));
  localStorage.setItem('tttO', String(score.O));
}

function finish(line) {
  gameOver = true;
  const winner = board[line[0]];
  score[winner]++;
  saveScore();
  statusEl.textContent = mode === 'ai'
    ? (winner === 'X' ? 'Вы победили! 🎉' : 'ИИ победил. Попробуйте ещё раз!')
    : `Победили ${winner === 'X' ? 'крестики' : 'нолики'}!`;
  render(line);
}

function finishDraw() {
  gameOver = true;
  statusEl.textContent = 'Ничья! Поле заполнено.';
  render();
}

function move(index) {
  if (gameOver || thinking || board[index] || isAiTurn()) return;

  board[index] = current;
  const line = getWinner(board);
  if (line) {
    finish(line);
    return;
  }
  if (isDraw(board)) {
    finishDraw();
    return;
  }

  current = current === 'X' ? 'O' : 'X';
  statusEl.textContent = mode === 'ai' ? 'ИИ думает…' : `Ход ${current === 'X' ? 'крестиков' : 'ноликов'}`;
  render();

  if (isAiTurn()) {
    thinking = true;
    render();
    window.setTimeout(aiMove, 280);
  }
}

function findImmediateMove(state, player) {
  for (let i = 0; i < state.length; i++) {
    if (!state[i]) {
      state[i] = player;
      const winsNow = Boolean(getWinner(state));
      state[i] = '';
      if (winsNow) return i;
    }
  }
  return null;
}

function randomMove(state) {
  const free = state.map((v,i) => v ? null : i).filter(v => v !== null);
  return free.length ? free[Math.floor(Math.random() * free.length)] : null;
}

function chooseEasy(state) {
  return randomMove(state);
}

function chooseMedium(state) {
  const win = findImmediateMove(state, 'O');
  if (win !== null) return win;

  const block = findImmediateMove(state, 'X');
  if (block !== null) return block;

  if (!state[center]) return center;
  const freeCorners = corners.filter(i => !state[i]);
  if (freeCorners.length) return freeCorners[Math.floor(Math.random() * freeCorners.length)];
  return randomMove(state);
}

function minimax(state, maximizing) {
  const line = getWinner(state);
  if (line) return { score: state[line[0]] === 'O' ? 10 : -10 };
  if (state.every(Boolean)) return { score: 0 };

  const moves = [];
  for (let i = 0; i < state.length; i++) {
    if (state[i]) continue;
    state[i] = maximizing ? 'O' : 'X';
    const result = minimax(state, !maximizing);
    moves.push({ index: i, score: result.score });
    state[i] = '';
  }

  if (maximizing) return moves.reduce((best, move) => move.score > best.score ? move : best);
  return moves.reduce((best, move) => move.score < best.score ? move : best);
}

function chooseHard(state) {
  return minimax([...state], true).index;
}

function chooseAiMove() {
  const level = difficultyEl.value;
  if (level === 'easy') return chooseEasy(board);
  if (level === 'hard') return chooseHard(board);
  return chooseMedium(board);
}

function aiMove() {
  if (!isAiTurn()) {
    thinking = false;
    render();
    return;
  }

  const index = chooseAiMove();
  thinking = false;
  if (index === null) return;

  board[index] = 'O';
  const line = getWinner(board);
  if (line) {
    finish(line);
    return;
  }
  if (isDraw(board)) {
    finishDraw();
    return;
  }

  current = 'X';
  statusEl.textContent = 'Ваш ход — выберите клетку';
  render();
}

function restart() {
  board = empty();
  current = 'X';
  gameOver = false;
  thinking = false;
  statusEl.textContent = 'Ваш ход — выберите клетку';
  render();
}

function setMode(nextMode) {
  mode = nextMode;
  modeButtons.forEach(button => button.classList.toggle('active', button.dataset.mode === mode));
  difficultyWrap.hidden = mode !== 'ai';
  restart();
}

modeButtons.forEach(button => button.addEventListener('click', () => setMode(button.dataset.mode)));
difficultyEl.addEventListener('change', restart);
document.querySelector('#restart').addEventListener('click', restart);
document.querySelector('#resetScore').addEventListener('click', () => {
  score = { X: 0, O: 0 };
  localStorage.removeItem('tttX');
  localStorage.removeItem('tttO');
  restart();
});

render();
