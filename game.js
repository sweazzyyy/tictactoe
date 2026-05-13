/**
 * Tic Tac Toe — Game Logic with Bot AI (Minimax)
 */

(function () {
  'use strict';

  // ===== DOM =====
  const cells = document.querySelectorAll('.cell');
  const statusText = document.getElementById('status-text');
  const statusBar = document.getElementById('status-bar');
  const scoreXEl = document.getElementById('score-x');
  const scoreOEl = document.getElementById('score-o');
  const scoreDrawEl = document.getElementById('score-draw');
  const restartBtn = document.getElementById('restart-btn');
  const resultOverlay = document.getElementById('result-overlay');
  const resultEmoji = document.getElementById('result-emoji');
  const resultTitle = document.getElementById('result-title');
  const resultDesc = document.getElementById('result-desc');
  const resultBtn = document.getElementById('result-btn');
  const diffButtons = document.querySelectorAll('.diff-btn');
  const winLineSvg = document.getElementById('win-line-svg');
  const winLine = document.getElementById('win-line');

  // ===== STATE =====
  const HUMAN = 'X';
  const BOT = 'O';

  let board = Array(9).fill(null);
  let currentPlayer = HUMAN;
  let gameOver = false;
  let difficulty = 'medium'; // easy | medium | hard
  let scores = { X: 0, O: 0, draw: 0 };

  const WIN_COMBOS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
    [0, 4, 8], [2, 4, 6]             // diagonals
  ];

  // ===== INIT =====
  function init() {
    board = Array(9).fill(null);
    currentPlayer = HUMAN;
    gameOver = false;

    cells.forEach(cell => {
      cell.innerHTML = '';
      cell.classList.remove('taken', 'win-cell', 'x-win', 'o-win');
    });

    winLine.classList.remove('animate-line', 'line-x', 'line-o');
    winLine.setAttribute('x1', 0);
    winLine.setAttribute('y1', 0);
    winLine.setAttribute('x2', 0);
    winLine.setAttribute('y2', 0);

    hideResult();
    updateStatus();
  }

  // ===== CELL CLICK =====
  function handleCellClick(e) {
    if (gameOver || currentPlayer !== HUMAN) return;
    const idx = parseInt(e.currentTarget.dataset.index);
    if (board[idx] !== null) return;

    makeMove(idx, HUMAN);

    if (!gameOver) {
      currentPlayer = BOT;
      updateStatus();
      // Small delay so bot "thinks"
      setTimeout(botMove, 400 + Math.random() * 300);
    }
  }

  function makeMove(idx, player) {
    board[idx] = player;
    renderMark(idx, player);
    cells[idx].classList.add('taken');

    const winCombo = checkWin(player);
    if (winCombo) {
      gameOver = true;
      highlightWin(winCombo, player);
      updateScore(player);
      setTimeout(() => showResult(player), 700);
    } else if (board.every(c => c !== null)) {
      gameOver = true;
      updateScore('draw');
      setTimeout(() => showResult('draw'), 500);
    }
  }

  // ===== RENDER MARK =====
  function renderMark(idx, player) {
    const cell = cells[idx];
    const mark = document.createElement('div');
    mark.classList.add('mark');

    const inner = document.createElement('div');
    if (player === 'X') {
      inner.classList.add('mark-x');
    } else {
      inner.classList.add('mark-o');
    }

    mark.appendChild(inner);
    cell.appendChild(mark);
  }

  // ===== CHECK WIN =====
  function checkWin(player) {
    for (const combo of WIN_COMBOS) {
      if (combo.every(i => board[i] === player)) {
        return combo;
      }
    }
    return null;
  }

  // ===== HIGHLIGHT WIN =====
  function highlightWin(combo, player) {
    const cls = player === 'X' ? 'x-win' : 'o-win';
    combo.forEach(i => {
      cells[i].classList.add('win-cell', cls);
    });

    // Draw the win line
    drawWinLine(combo, player);
  }

  function drawWinLine(combo, player) {
    const boardEl = document.getElementById('board');
    const boardRect = boardEl.getBoundingClientRect();
    const wrapperRect = winLineSvg.getBoundingClientRect();

    const getCenter = (idx) => {
      const cellRect = cells[idx].getBoundingClientRect();
      return {
        x: ((cellRect.left + cellRect.width / 2 - wrapperRect.left) / wrapperRect.width) * 300,
        y: ((cellRect.top + cellRect.height / 2 - wrapperRect.top) / wrapperRect.height) * 300
      };
    };

    const start = getCenter(combo[0]);
    const end = getCenter(combo[2]);

    winLine.setAttribute('x1', start.x);
    winLine.setAttribute('y1', start.y);
    winLine.setAttribute('x2', end.x);
    winLine.setAttribute('y2', end.y);

    winLine.classList.add('animate-line', player === 'X' ? 'line-x' : 'line-o');
  }

  // ===== STATUS =====
  function updateStatus() {
    statusBar.classList.remove('turn-x', 'turn-o');

    if (gameOver) {
      return;
    }

    if (currentPlayer === HUMAN) {
      statusText.textContent = 'Ваш ход (X)';
      statusBar.classList.add('turn-x');
    } else {
      statusText.textContent = 'Бот думает...';
      statusBar.classList.add('turn-o');
    }
  }

  // ===== SCORE =====
  function updateScore(winner) {
    if (winner === 'draw') {
      scores.draw++;
      scoreDrawEl.textContent = scores.draw;
      animateScorePop(scoreDrawEl.parentElement);
    } else if (winner === HUMAN) {
      scores.X++;
      scoreXEl.textContent = scores.X;
      animateScorePop(scoreXEl.parentElement);
    } else {
      scores.O++;
      scoreOEl.textContent = scores.O;
      animateScorePop(scoreOEl.parentElement);
    }
  }

  function animateScorePop(el) {
    el.classList.remove('score-pop');
    void el.offsetWidth; // reflow
    el.classList.add('score-pop');
  }

  // ===== RESULT OVERLAY =====
  function showResult(winner) {
    if (winner === HUMAN) {
      resultEmoji.textContent = '🎉';
      resultTitle.textContent = 'Победа!';
      resultTitle.style.color = 'var(--color-x-light)';
      resultDesc.textContent = 'Вы обыграли бота!';
      statusText.textContent = '🎉 Вы победили!';
      spawnConfetti();
    } else if (winner === BOT) {
      resultEmoji.textContent = '🤖';
      resultTitle.textContent = 'Поражение';
      resultTitle.style.color = 'var(--color-o-light)';
      resultDesc.textContent = 'Бот оказался сильнее...';
      statusText.textContent = '🤖 Бот победил';
    } else {
      resultEmoji.textContent = '🤝';
      resultTitle.textContent = 'Ничья!';
      resultTitle.style.color = 'var(--color-draw)';
      resultDesc.textContent = 'Отличная партия!';
      statusText.textContent = '🤝 Ничья!';
    }

    resultOverlay.classList.add('show');
  }

  function hideResult() {
    resultOverlay.classList.remove('show');
  }

  // ===== CONFETTI =====
  function spawnConfetti() {
    const colors = ['#6c63ff', '#ff6b9d', '#fbbf24', '#34d399', '#a78bfa', '#f472b6'];
    for (let i = 0; i < 50; i++) {
      const piece = document.createElement('div');
      piece.classList.add('confetti-piece');
      piece.style.left = Math.random() * 100 + 'vw';
      piece.style.top = Math.random() * 40 + 'vh';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.width = (4 + Math.random() * 8) + 'px';
      piece.style.height = (4 + Math.random() * 8) + 'px';
      piece.style.animationDuration = (0.8 + Math.random() * 0.8) + 's';
      piece.style.animationDelay = (Math.random() * 0.4) + 's';
      document.body.appendChild(piece);
      setTimeout(() => piece.remove(), 2000);
    }
  }

  // ===== BOT AI =====
  function botMove() {
    if (gameOver) return;

    let idx;
    switch (difficulty) {
      case 'easy':
        idx = botEasy();
        break;
      case 'medium':
        idx = botMedium();
        break;
      case 'hard':
        idx = botHard();
        break;
      default:
        idx = botMedium();
    }

    makeMove(idx, BOT);
    if (!gameOver) {
      currentPlayer = HUMAN;
      updateStatus();
    }
  }

  // Easy: random moves
  function botEasy() {
    const available = board.map((v, i) => v === null ? i : null).filter(v => v !== null);
    return available[Math.floor(Math.random() * available.length)];
  }

  // Medium: 60% smart + 40% random
  function botMedium() {
    if (Math.random() < 0.6) {
      return botHard();
    }
    return botEasy();
  }

  // Hard: minimax (unbeatable)
  function botHard() {
    let bestScore = -Infinity;
    let bestMove = null;

    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = BOT;
        const score = minimax(board, 0, false);
        board[i] = null;
        if (score > bestScore) {
          bestScore = score;
          bestMove = i;
        }
      }
    }

    return bestMove;
  }

  function minimax(boardState, depth, isMaximizing) {
    // Terminal checks
    if (checkWinFor(boardState, BOT)) return 10 - depth;
    if (checkWinFor(boardState, HUMAN)) return depth - 10;
    if (boardState.every(c => c !== null)) return 0;

    if (isMaximizing) {
      let best = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (boardState[i] === null) {
          boardState[i] = BOT;
          best = Math.max(best, minimax(boardState, depth + 1, false));
          boardState[i] = null;
        }
      }
      return best;
    } else {
      let best = Infinity;
      for (let i = 0; i < 9; i++) {
        if (boardState[i] === null) {
          boardState[i] = HUMAN;
          best = Math.min(best, minimax(boardState, depth + 1, true));
          boardState[i] = null;
        }
      }
      return best;
    }
  }

  function checkWinFor(boardState, player) {
    return WIN_COMBOS.some(combo => combo.every(i => boardState[i] === player));
  }

  // ===== DIFFICULTY =====
  function setDifficulty(diff) {
    difficulty = diff;
    diffButtons.forEach(b => b.classList.toggle('active', b.dataset.diff === diff));
    init();
  }

  // ===== EVENTS =====
  cells.forEach(cell => cell.addEventListener('click', handleCellClick));
  restartBtn.addEventListener('click', init);
  resultBtn.addEventListener('click', init);

  diffButtons.forEach(btn => {
    btn.addEventListener('click', () => setDifficulty(btn.dataset.diff));
  });

  // Close result on overlay click (outside card)
  resultOverlay.addEventListener('click', (e) => {
    if (e.target === resultOverlay) init();
  });

  // Keyboard: R to restart, 1-9 for cells
  document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'r') {
      init();
      return;
    }
    const num = parseInt(e.key);
    if (num >= 1 && num <= 9 && !gameOver && currentPlayer === HUMAN) {
      const idx = num - 1;
      if (board[idx] === null) {
        cells[idx].click();
      }
    }
  });

  // ===== START =====
  init();

})();
