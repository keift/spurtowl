const chess = new Chess();

let auto = false;
let match_mode = false;

const load = (fen) => {
  document.querySelector('#fen').value = fen;

  chess.load(fen);
  setTimeout(() => board.position(chess.fen()), 100);

  setTimeout(() => {
    if (chess.isCheckmate()) {
      const winner = chess.turn() === 'w' ? 'Black' : 'white';

      document.querySelector('#status').innerText = `Winner: ${winner}`;
    }
  }, 1000);

  // board.orientation(chess.turn() === 'w' ? 'white' : 'black');
};

const onDrop = (from, to) => {
  try {
    chess.move({ from, to, promotion: 'q' });
  } catch {
    return 'snapback';
  }

  load(chess.fen());

  analyze(chess.fen());
};

const board = Chessboard('board', {
  position: 'start',
  draggable: true,
  pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png',

  onDrop
});

let arrow;

const drawArrow = (from, to) => {
  if (arrow) arrow.remove();

  const board = document.querySelector('#board .board-b72b1');

  const squareCenter = (square) => {
    const square_element = document.querySelector(`#board .square-${square}`);

    if (!square_element) return null;

    const board_rect = board.getBoundingClientRect();
    const r = square_element.getBoundingClientRect();

    return {
      x: r.left - board_rect.left + r.width / 2,
      y: r.top - board_rect.top + r.height / 2
    };
  };

  const a = squareCenter(from);
  const b = squareCenter(to);

  if (!a || !b) return;

  const size = document.querySelector(`#board .square-${from}`).offsetWidth;
  const shorten = size * 0.35;

  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;

  const end_x = b.x - (dx / len) * shorten;
  const end_y = b.y - (dy / len) * shorten;

  arrow = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

  arrow.setAttribute('width', board.clientWidth);
  arrow.setAttribute('height', board.clientHeight);
  arrow.setAttribute('viewBox', `0 0 ${board.clientWidth} ${board.clientHeight}`);

  arrow.style.position = 'absolute';
  arrow.style.top = '0';
  arrow.style.left = '0';
  arrow.style.pointerEvents = 'none';

  const color = 'rgba(85, 85, 85)';

  arrow.innerHTML = `
    <defs>
      <marker id="arrowhead"
        markerWidth="5"
        markerHeight="5"
        refX="2.5"
        refY="2.5"
        orient="auto">
        <path d="M0,0 L5,2.5 L0,5 Z" fill="${color}" />
      </marker>
    </defs>

    <line
      x1="${a.x}"
      y1="${a.y}"
      x2="${end_x}"
      y2="${end_y}"
      stroke="${color}"
      stroke-width="7.5"
      stroke-linecap="round"
      marker-end="url(#arrowhead)"
    />
  `;

  board.appendChild(arrow);
};

const analyze = async (fen) => {
  if (!board) return;

  if (match_mode && chess.turn() === 'w') return;

  document.title = 'Analyzing...';

  if (arrow) arrow.remove();

  document.querySelector('#analyze').disabled = true;

  const res = await fetch(`/api/analyze?fen=${encodeURIComponent(fen)}`, { method: 'GET' });

  document.querySelector('#analyze').disabled = false;

  const { result } = await res.json();

  if (auto) onDrop(result.from, result.to);

  drawArrow(result.from, result.to);

  document.title = 'Spurtowl';
};

document.querySelector('#analyze').addEventListener('click', () => {
  load(document.querySelector('#fen').value);

  analyze(document.querySelector('#fen').value);
});

document.querySelector('#auto').addEventListener('click', () => {
  if (auto) {
    auto = false;

    document.querySelector('#auto').innerText = 'Auto (OFF)';
  } else {
    auto = true;

    document.querySelector('#auto').innerText = 'Auto (ON)';
  }

  load(document.querySelector('#fen').value);

  analyze(document.querySelector('#fen').value);
});

document.querySelector('#match-mode').addEventListener('click', () => {
  if (match_mode) {
    auto = false;
    match_mode = false;

    document.querySelector('#auto').disabled = false;

    document.querySelector('#auto').innerText = 'Auto (OFF)';
    document.querySelector('#match-mode').innerText = 'Match Mode (OFF)';
  } else {
    auto = true;
    match_mode = true;

    if (arrow) arrow.remove();

    document.querySelector('#auto').disabled = true;

    document.querySelector('#auto').innerText = 'Auto (ON)';
    document.querySelector('#match-mode').innerText = 'Match Mode (ON)';
  }

  load(document.querySelector('#fen').value);

  analyze(document.querySelector('#fen').value);
});

document.querySelector('#reset').addEventListener('click', () => {
  if (confirm('Do you want to reset the board?')) {
    document.querySelector('#fen').value = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

    location.reload();
  }
});

document.querySelector('#match-mode').click();

analyze(chess.fen());
