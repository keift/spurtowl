const chess = new Chess();

document.querySelector('#fen').value = chess.fen();

const board = Chessboard('board', {
  position: 'start',
  draggable: true,
  pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png',

  onDrop: (from, to) => {
    try {
      chess.move({ from, to, promotion: 'q' });
    } catch {
      return 'snapback';
    }

    document.querySelector('#fen').value = chess.fen();

    analyze(true);
  }
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

const analyze = async (no_load) => {
  if (!board) return;

  document.title = 'Analyzing...';

  const fen = document.getElementById('fen').value;
  const board_fen = fen.split(' ')[0];

  if (!no_load) {
    chess.load(fen);
    board.position(board_fen);
  }

  board.orientation(fen.split(' ')[1].split(' ')[0] === 'w' ? 'white' : 'black');

  if (arrow) arrow.remove();

  document.querySelector('#analyze').disabled = true;

  const res = await fetch(`/api/analyze?fen=${encodeURIComponent(fen)}`, { method: 'GET' });

  document.querySelector('#analyze').disabled = false;

  const { result } = await res.json();

  drawArrow(result.from, result.to);

  document.title = 'Spurtowl';
};

document.querySelector('#analyze').addEventListener('click', () => analyze());

analyze();
