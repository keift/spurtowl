import { Chess, type Move } from 'chess.js';

const piece_values = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 0
};

const evaluate = (chess: Chess) => {
  if (chess.isCheckmate()) return chess.turn() === 'w' ? -1000000 : 1000000;
  if (chess.isDraw() || chess.isStalemate()) return 0;

  let score = 0;

  for (const row of chess.board()) {
    for (const square of row) {
      if (!square) continue;

      const piece_value = piece_values[square.type];

      score += square.color === 'w' ? piece_value : -piece_value;
    }
  }

  if (chess.isCheck()) score += chess.turn() === 'w' ? -100 : 100;

  return score;
};

const scoreMoveOrder = (move: Move) => {
  let score = 0;

  if (move.isCapture()) score += 1000;
  if (move.isPromotion()) score += 800;
  if (move.isKingsideCastle() || move.isQueensideCastle()) score += 50;
  if (move.isBigPawn()) score += 30;

  return score;
};

const alphabetaTimed = (chess: Chess, depth: number, alpha: number, beta: number, maximizing: boolean, start_time: number, thinking_time: number) => {
  if (performance.now() - start_time >= thinking_time) return evaluate(chess);
  if (depth === 0 || chess.isGameOver()) return evaluate(chess);

  const moves = chess.moves({ verbose: true });

  if (moves.length === 0) return evaluate(chess);

  moves.sort((first, second) => scoreMoveOrder(second) - scoreMoveOrder(first));

  if (maximizing) {
    let value = -Infinity;

    for (const move of moves) {
      chess.move(move);

      value = Math.max(value, alphabetaTimed(chess, depth - 1, alpha, beta, false, start_time, thinking_time));

      chess.undo();

      alpha = Math.max(alpha, value);

      if (alpha >= beta) break;
      if (performance.now() - start_time >= thinking_time) break;
    }

    return value;
  } else {
    let value = Infinity;

    for (const move of moves) {
      chess.move(move);

      value = Math.min(value, alphabetaTimed(chess, depth - 1, alpha, beta, true, start_time, thinking_time));

      chess.undo();

      beta = Math.min(beta, value);

      if (alpha >= beta) break;
      if (performance.now() - start_time >= thinking_time) break;
    }

    return value;
  }
};

const pickNextMoveTimed = (chess: Chess, depth: number, start_time: number, thinking_time: number) => {
  const moves = chess.moves({ verbose: true });

  if (moves.length === 0) return null;

  const maximizing = chess.turn() === 'w';

  let next_move = null;
  let best_score = maximizing ? -Infinity : Infinity;

  moves.sort((first, second) => scoreMoveOrder(second) - scoreMoveOrder(first));

  for (const move of moves) {
    if (performance.now() - start_time >= thinking_time) break;

    chess.move(move);

    const score = alphabetaTimed(chess, depth - 1, -Infinity, Infinity, !maximizing, start_time, thinking_time);

    chess.undo();

    if (maximizing ? score > best_score : score < best_score) {
      best_score = score;
      next_move = move;
    }
  }

  return next_move;
};

export const Analyze = (
  fen: string,
  options: {
    depth?: number;
    thinking_time?: number;
  } = {}
) => {
  const max_depth = options.depth ?? 99;
  const thinking_time = options.thinking_time ?? 1000;

  const chess = new Chess(fen);

  if (chess.isGameOver()) return {};

  const start_time = performance.now();

  let next_move: Move | null = null;

  for (let depth = 1; depth <= max_depth; depth++) {
    if (performance.now() - start_time >= thinking_time) break;

    const move = pickNextMoveTimed(chess, depth, start_time, thinking_time);

    if (!move) break;

    next_move = move;
  }

  return next_move ? { from: next_move.from, to: next_move.to } : {};
};
