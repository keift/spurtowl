/* eslint-disable */

import { Chess, type Move } from 'chess.js';

const PIECE_VALUE: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 0
};

const MATE = 10_000_000;
const INF = 1_000_000_000;

const PST = {
  p: [0, 0, 0, 0, 0, 0, 0, 0, 5, 10, 10, -20, -20, 10, 10, 5, 5, -5, -10, 0, 0, -10, -5, 5, 0, 0, 0, 20, 20, 0, 0, 0, 5, 5, 10, 25, 25, 10, 5, 5, 10, 10, 20, 30, 30, 20, 10, 10, 50, 50, 50, 50, 50, 50, 50, 50, 0, 0, 0, 0, 0, 0, 0, 0],
  n: [-50, -40, -30, -30, -30, -30, -40, -50, -40, -20, 0, 5, 5, 0, -20, -40, -30, 5, 10, 15, 15, 10, 5, -30, -30, 0, 15, 20, 20, 15, 0, -30, -30, 5, 15, 20, 20, 15, 5, -30, -30, 0, 10, 15, 15, 10, 0, -30, -40, -20, 0, 0, 0, 0, -20, -40, -50, -40, -30, -30, -30, -30, -40, -50],
  b: [-20, -10, -10, -10, -10, -10, -10, -20, -10, 5, 0, 0, 0, 0, 5, -10, -10, 10, 10, 10, 10, 10, 10, -10, -10, 0, 10, 10, 10, 10, 0, -10, -10, 5, 5, 10, 10, 5, 5, -10, -10, 0, 5, 10, 10, 5, 0, -10, -10, 0, 0, 0, 0, 0, 0, -10, -20, -10, -10, -10, -10, -10, -10, -20],
  r: [0, 0, 5, 10, 10, 5, 0, 0, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, -5, 0, 0, 0, 0, 0, 0, -5, 5, 10, 10, 10, 10, 10, 10, 5, 0, 0, 0, 0, 0, 0, 0, 0],
  q: [-20, -10, -10, -5, -5, -10, -10, -20, -10, 0, 0, 0, 0, 0, 0, -10, -10, 0, 5, 5, 5, 5, 0, -10, -5, 0, 5, 5, 5, 5, 0, -5, 0, 0, 5, 5, 5, 5, 0, -5, -10, 5, 5, 5, 5, 5, 0, -10, -10, 0, 5, 0, 0, 0, 0, -10, -20, -10, -10, -5, -5, -10, -10, -20],
  k: [-30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -30, -40, -40, -50, -50, -40, -40, -30, -20, -30, -30, -40, -40, -30, -30, -20, -10, -20, -20, -20, -20, -20, -20, -10, 20, 20, 0, 0, 0, 0, 20, 20, 20, 30, 10, 0, 0, 10, 30, 20]
} as const;

type VMove = Move & {
  from: string;
  to: string;
  flags?: string;
  piece?: string;
  captured?: string;
  promotion?: string;
};

const flagsOf = (m: VMove) => (typeof (m as any).flags === 'string' ? (m as any).flags : '');
const isCapture = (m: VMove) => {
  const f = flagsOf(m);
  return f.includes('c') || f.includes('e');
};
const isPromotion = (m: VMove) => flagsOf(m).includes('p');
const isBigPawn = (m: VMove) => flagsOf(m).includes('b');
const isCastle = (m: VMove) => {
  const f = flagsOf(m);
  return f.includes('k') || f.includes('q');
};

function play(chess: Chess, m: VMove) {
  const promo = (m as any).promotion;
  if (typeof promo === 'string' && promo.length > 0) {
    return chess.move({ from: m.from, to: m.to, promotion: promo } as any);
  }
  return chess.move({ from: m.from, to: m.to } as any);
}

function mirrorIndex(i: number) {
  const rank = Math.floor(i / 8);
  const file = i % 8;
  return (7 - rank) * 8 + file;
}

function fenKey(chess: Chess) {
  const p = chess.fen().split(' ');
  return `${p[0]} ${p[1]} ${p[2]} ${p[3]}`;
}

function moveId(m: VMove) {
  return `${m.from}${m.to}${(m as any).promotion ?? ''}`;
}

function mvvLva(m: VMove) {
  const victim = (m as any).captured ? PIECE_VALUE[(m as any).captured] : 0;
  const attacker = (m as any).piece ? PIECE_VALUE[(m as any).piece] : 0;
  return victim * 10 - attacker;
}

function makeNullFen(fen: string) {
  const p = fen.split(' ');
  const turn = p[1];
  const half = Math.max(0, Number(p[4] || '0'));
  const full = Math.max(1, Number(p[5] || '1'));
  const nextTurn = turn === 'w' ? 'b' : 'w';
  const nextHalf = half + 1;
  const nextFull = turn === 'b' ? full + 1 : full;
  p[1] = nextTurn;
  p[3] = '-';
  p[4] = String(nextHalf);
  p[5] = String(nextFull);
  return p.join(' ');
}

function materialTotal(chess: Chess) {
  let total = 0;
  for (const row of chess.board()) {
    for (const sq of row) {
      if (!sq) continue;
      total += PIECE_VALUE[sq.type];
    }
  }
  return total;
}

function pawnStructureScore(board: ReturnType<Chess['board']>) {
  const wpFiles = new Array<number>(8).fill(0);
  const bpFiles = new Array<number>(8).fill(0);

  const wp: Array<{ r: number; f: number }> = [];
  const bp: Array<{ r: number; f: number }> = [];
  let wk: { r: number; f: number } | null = null;
  let bk: { r: number; f: number } | null = null;

  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const sq = board[r][f];
      if (!sq) continue;
      if (sq.type === 'p' && sq.color === 'w') {
        wpFiles[f]++;
        wp.push({ r, f });
      } else if (sq.type === 'p' && sq.color === 'b') {
        bpFiles[f]++;
        bp.push({ r, f });
      } else if (sq.type === 'k' && sq.color === 'w') {
        wk = { r, f };
      } else if (sq.type === 'k' && sq.color === 'b') {
        bk = { r, f };
      }
    }
  }

  let s = 0;

  for (let f = 0; f < 8; f++) {
    if (wpFiles[f] > 1) s -= (wpFiles[f] - 1) * 12;
    if (bpFiles[f] > 1) s += (bpFiles[f] - 1) * 12;
  }

  for (const p of wp) {
    const left = p.f > 0 ? wpFiles[p.f - 1] : 0;
    const right = p.f < 7 ? wpFiles[p.f + 1] : 0;
    if (left === 0 && right === 0) s -= 10;

    let passed = true;
    for (const df of [-1, 0, 1]) {
      const ff = p.f + df;
      if (ff < 0 || ff > 7) continue;
      if (bpFiles[ff] === 0) continue;
      for (const ep of bp) {
        if (ep.f !== ff) continue;
        if (ep.r > p.r) {
          passed = false;
          break;
        }
      }
      if (!passed) break;
    }
    if (passed) {
      const rankFromWhite = 8 - p.r;
      s += 8 + rankFromWhite * 6;
    }
  }

  for (const p of bp) {
    const left = p.f > 0 ? bpFiles[p.f - 1] : 0;
    const right = p.f < 7 ? bpFiles[p.f + 1] : 0;
    if (left === 0 && right === 0) s += 10;

    let passed = true;
    for (const df of [-1, 0, 1]) {
      const ff = p.f + df;
      if (ff < 0 || ff > 7) continue;
      if (wpFiles[ff] === 0) continue;
      for (const ep of wp) {
        if (ep.f !== ff) continue;
        if (ep.r < p.r) {
          passed = false;
          break;
        }
      }
      if (!passed) break;
    }
    if (passed) {
      const rankFromBlack = p.r + 1;
      s -= 8 + rankFromBlack * 6;
    }
  }

  const shield = (k: { r: number; f: number } | null, color: 'w' | 'b') => {
    if (!k) return 0;
    const dir = color === 'w' ? -1 : 1;
    let count = 0;
    for (let df = -1; df <= 1; df++) {
      const rr = k.r + dir;
      const ff = k.f + df;
      if (rr < 0 || rr > 7 || ff < 0 || ff > 7) continue;
      const sq = board[rr][ff];
      if (sq && sq.type === 'p' && sq.color === color) count++;
    }
    return count;
  };

  const wShield = shield(wk, 'w');
  const bShield = shield(bk, 'b');

  s += (wShield - 2) * 10;
  s -= (bShield - 2) * 10;

  return s;
}

function evalWhite(chess: Chess): number {
  if (chess.isCheckmate()) return chess.turn() === 'w' ? -MATE : MATE;
  if (chess.isDraw() || chess.isStalemate()) return 0;

  const board = chess.board();
  let score = 0;
  let wb = 0;
  let bb = 0;

  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const sq = board[r][f];
      if (!sq) continue;
      const type = sq.type as keyof typeof PST;
      const base = PIECE_VALUE[type];
      const idx = r * 8 + f;
      const pst = sq.color === 'w' ? PST[type][idx] : PST[type][mirrorIndex(idx)];
      const v = base + pst;
      score += sq.color === 'w' ? v : -v;
      if (sq.type === 'b') {
        if (sq.color === 'w') wb++;
        else bb++;
      }
    }
  }

  if (wb >= 2) score += 25;
  if (bb >= 2) score -= 25;

  score += pawnStructureScore(board);
  score += chess.turn() === 'w' ? 10 : -10;
  if (chess.isCheck()) score += chess.turn() === 'w' ? -40 : 40;

  return score;
}

function evalSideToMove(chess: Chess): number {
  const w = evalWhite(chess);
  return chess.turn() === 'w' ? w : -w;
}

type TTFlag = 'EXACT' | 'LOWER' | 'UPPER';
type TTEntry = { depth: number; score: number; flag: TTFlag; best?: VMove };

type SearchState = {
  tt: Map<string, TTEntry>;
  killer: Map<number, [string | null, string | null]>;
  history: Map<string, number>;
  deadline: number;
};

function timeUp(s: SearchState) {
  return performance.now() >= s.deadline;
}

function canNullMove(chess: Chess) {
  if (chess.isCheck()) return false;
  if (chess.isGameOver()) return false;
  return materialTotal(chess) > 1400;
}

function seeGreedy(chess: Chess, move: VMove) {
  if (!isCapture(move) && !isPromotion(move)) return 0;

  const to = move.to;

  let made = 0;
  const seq: number[] = [];

  const firstVictim = (move as any).captured ? PIECE_VALUE[(move as any).captured] : 0;
  const promoGain = isPromotion(move) && (move as any).promotion ? PIECE_VALUE[(move as any).promotion] - PIECE_VALUE.p : 0;

  let gain = firstVictim + promoGain;

  const ok0 = play(chess, move);
  if (!ok0) return 0;
  made++;
  seq.push(gain);

  let ply = 0;

  while (ply < 16) {
    const replies = (chess.moves({ verbose: true }) as VMove[]).filter((m) => isCapture(m) && m.to === to);
    if (replies.length === 0) break;

    replies.sort((a, b) => {
      const av = (a as any).piece ? PIECE_VALUE[(a as any).piece] : 0;
      const bv = (b as any).piece ? PIECE_VALUE[(b as any).piece] : 0;
      return av - bv;
    });

    const reply = replies[0];
    const cap = (reply as any).captured ? PIECE_VALUE[(reply as any).captured] : 0;

    const ok = play(chess, reply);
    if (!ok) break;
    made++;

    gain -= cap;
    seq.push(gain);

    ply++;
  }

  for (let i = 0; i < made; i++) chess.undo();

  let v = seq[seq.length - 1] ?? 0;
  for (let i = seq.length - 2; i >= 0; i--) {
    v = i % 2 === 0 ? Math.max(seq[i], v) : Math.min(seq[i], v);
  }
  return v;
}

function orderMoves(moves: VMove[], s: SearchState, ply: number, pv?: VMove, chess?: Chess) {
  const killers = s.killer.get(ply) ?? [null, null];
  const pvId = pv ? moveId(pv) : null;

  moves.sort((a, b) => {
    const aid = moveId(a);
    const bid = moveId(b);

    if (pvId) {
      if (aid === pvId && bid !== pvId) return -1;
      if (bid === pvId && aid !== pvId) return 1;
    }

    const aCap = isCapture(a) || isPromotion(a);
    const bCap = isCapture(b) || isPromotion(b);

    if (aCap !== bCap) return aCap ? -1 : 1;

    if (aCap && bCap) {
      if (chess && isCapture(a) && isCapture(b)) {
        const aSee = seeGreedy(chess, a);
        const bSee = seeGreedy(chess, b);
        if (aSee !== bSee) return bSee - aSee;
      }
      const aScore = mvvLva(a);
      const bScore = mvvLva(b);
      if (aScore !== bScore) return bScore - aScore;
    }

    const ak = aid === killers[0] ? 2 : aid === killers[1] ? 1 : 0;
    const bk = bid === killers[0] ? 2 : bid === killers[1] ? 1 : 0;
    if (ak !== bk) return bk - ak;

    const ah = s.history.get(aid) ?? 0;
    const bh = s.history.get(bid) ?? 0;
    return bh - ah;
  });
}

function quiescence(chess: Chess, alpha: number, beta: number, s: SearchState, ply: number): number | null {
  if (timeUp(s)) return null;

  let stand = evalSideToMove(chess);
  if (Math.abs(stand) >= MATE - 1000) stand = stand > 0 ? stand - ply : stand + ply;

  if (stand >= beta) return beta;
  if (stand > alpha) alpha = stand;

  const moves = (chess.moves({ verbose: true }) as VMove[]).filter((m) => isCapture(m) || isPromotion(m));

  moves.sort((a, b) => {
    const aSee = seeGreedy(chess, a);
    const bSee = seeGreedy(chess, b);
    if (aSee !== bSee) return bSee - aSee;
    return mvvLva(b) - mvvLva(a);
  });

  for (const m of moves) {
    if (timeUp(s)) return null;

    if (isCapture(m)) {
      const see = seeGreedy(chess, m);
      if (see < -80) continue;
    }

    const ok = play(chess, m);
    if (!ok) continue;

    const q = quiescence(chess, -beta, -alpha, s, ply + 1);
    chess.undo();

    if (q === null) return null;

    const v = -q;
    if (v >= beta) return beta;
    if (v > alpha) alpha = v;
  }

  return alpha;
}

function negamax(chess: Chess, depth: number, alpha: number, beta: number, s: SearchState, ply: number): { score: number; best?: VMove } | null {
  if (timeUp(s)) return null;

  const inCheck = chess.isCheck();

  if (depth <= 0) {
    const q = quiescence(chess, alpha, beta, s, ply);
    if (q === null) return null;
    return { score: q };
  }

  const key = fenKey(chess);
  const tt = s.tt.get(key);

  if (tt && tt.depth >= depth) {
    if (tt.flag === 'EXACT') return { score: tt.score, best: tt.best };
    if (tt.flag === 'LOWER') alpha = Math.max(alpha, tt.score);
    if (tt.flag === 'UPPER') beta = Math.min(beta, tt.score);
    if (alpha >= beta) return { score: tt.score, best: tt.best };
  }

  if (depth >= 4 && !inCheck && canNullMove(chess)) {
    const R = depth >= 7 ? 3 : 2;
    const nullFen = makeNullFen(chess.fen());
    const nullChess = new Chess(nullFen);
    const r = negamax(nullChess, depth - 1 - R, -beta, -beta + 1, s, ply + 1);
    if (r === null) return null;
    const nullScore = -r.score;
    if (nullScore >= beta) return { score: beta };
  }

  const moves = chess.moves({ verbose: true }) as VMove[];
  if (moves.length === 0) return { score: evalSideToMove(chess) };

  const depthHere = inCheck ? depth + 1 : depth;

  orderMoves(moves, s, ply, tt?.best, chess);

  let bestMove: VMove | undefined;
  let bestScore = -INF;

  const alphaOrig = alpha;

  let first = true;

  for (let i = 0; i < moves.length; i++) {
    if (timeUp(s)) return null;

    const m = moves[i];

    if (isCapture(m)) {
      const see = seeGreedy(chess, m);
      if (see < -120 && depthHere <= 6) continue;
    }

    const ok = play(chess, m);
    if (!ok) continue;

    const givesCheck = chess.isCheck();
    const ext = givesCheck ? 1 : 0;

    const isQuiet = !isCapture(m) && !isPromotion(m) && !givesCheck;
    const canReduce = isQuiet && !inCheck && depthHere >= 3 && i >= 3;

    let reduction = 0;
    if (canReduce) reduction = i >= 12 && depthHere >= 6 ? 2 : 1;

    let child: { score: number; best?: VMove } | null;

    if (first) {
      child = negamax(chess, depthHere - 1 + ext, -beta, -alpha, s, ply + 1);
      first = false;
    } else {
      child = negamax(chess, depthHere - 1 + ext - reduction, -alpha - 1, -alpha, s, ply + 1);
      if (child !== null) {
        const v0 = -child.score;
        if (v0 > alpha && v0 < beta) {
          child = negamax(chess, depthHere - 1 + ext, -beta, -alpha, s, ply + 1);
        } else if (reduction > 0 && v0 > alpha) {
          child = negamax(chess, depthHere - 1 + ext, -alpha - 1, -alpha, s, ply + 1);
        }
      }
    }

    chess.undo();

    if (child === null) return null;

    let score = -child.score;
    if (Math.abs(score) >= MATE - 1000) score = score > 0 ? score - ply : score + ply;

    if (score > bestScore) {
      bestScore = score;
      bestMove = m;
    }

    if (score > alpha) alpha = score;

    if (alpha >= beta) {
      if (!isCapture(m) && !isPromotion(m)) {
        const id = moveId(m);
        const k = s.killer.get(ply) ?? [null, null];
        if (k[0] !== id) s.killer.set(ply, [id, k[0]]);
        s.history.set(id, (s.history.get(id) ?? 0) + depthHere * depthHere);
      }
      break;
    }
  }

  let flag: TTFlag = 'EXACT';
  if (bestScore <= alphaOrig) flag = 'UPPER';
  else if (bestScore >= beta) flag = 'LOWER';

  s.tt.set(key, { depth, score: bestScore, flag, best: bestMove });

  return { score: bestScore, best: bestMove };
}

function scoreMoveOrderRoot(chess: Chess, m: VMove) {
  let s = 0;
  if (isCapture(m)) s += 1000 + mvvLva(m) + seeGreedy(chess, m);
  if (isPromotion(m)) s += 800;
  if (isCastle(m)) s += 50;
  if (isBigPawn(m)) s += 30;
  return s;
}

export const Analyze = (
  fen: string,
  options: {
    depth?: number;
    thinking_time?: number;
  } = {}
) => {
  const maxDepth = options.depth ?? 99;
  const thinkingTime = options.thinking_time ?? 1000;

  const chess = new Chess(fen);
  if (chess.isGameOver()) return {};

  const start = performance.now();
  const state: SearchState = {
    tt: new Map(),
    killer: new Map(),
    history: new Map(),
    deadline: start + thinkingTime
  };

  let best: VMove | null = null;
  let lastScore = 0;

  let window = 60;

  for (let depth = 1; depth <= maxDepth; depth++) {
    if (performance.now() >= state.deadline) break;

    const prevScore = lastScore;

    let alpha = -INF;
    let beta = INF;

    if (depth >= 4) {
      alpha = prevScore - window;
      beta = prevScore + window;
    }

    const rootMoves = chess.moves({ verbose: true }) as VMove[];
    rootMoves.sort((a, b) => scoreMoveOrderRoot(chess, b) - scoreMoveOrderRoot(chess, a));

    let bestThisDepth: VMove | null = null;
    let bestThisScore = -INF;

    for (const m of rootMoves) {
      if (performance.now() >= state.deadline) break;

      const ok = play(chess, m);
      if (!ok) continue;

      const r = negamax(chess, depth - 1, -beta, -alpha, state, 1);
      chess.undo();

      if (!r) {
        bestThisDepth = null;
        break;
      }

      const score = -r.score;

      if (score > bestThisScore) {
        bestThisScore = score;
        bestThisDepth = m;
      }

      if (score > alpha) alpha = score;
    }

    if (!bestThisDepth) break;

    best = bestThisDepth;
    lastScore = bestThisScore;

    if (depth >= 4 && (bestThisScore <= prevScore - window || bestThisScore >= prevScore + window)) {
      window = Math.min(500, window * 2);
    } else {
      window = Math.max(40, Math.floor(window * 0.85));
    }
  }

  return best ? { from: best.from, to: best.to, promotion: (best as any).promotion } : {};
};
