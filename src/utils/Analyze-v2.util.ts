/* eslint-disable */

import { Chess } from 'chess.js';

type AnalyzeOptions = {
  depth?: number;
  thinking_time?: number;
};

type Best = { from: string; to: string } | null;

type TTFlag = 0 | 1 | 2;

type TTEntry = {
  key: bigint;
  depth: number;
  value: number;
  flag: TTFlag;
  best?: MoveLite;
};

type MoveLite = {
  from: string;
  to: string;
  promotion?: string;
};

type VerboseMove = {
  from: string;
  to: string;
  color: 'w' | 'b';
  piece: 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
  captured?: 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
  promotion?: 'n' | 'b' | 'r' | 'q';
  flags: string;
  san: string;
  lan?: string;
};

const MATE = 100000;
const INF = 1e9;

const MG_VAL: Record<string, number> = { p: 82, n: 337, b: 365, r: 477, q: 1025, k: 0 };
const EG_VAL: Record<string, number> = { p: 94, n: 281, b: 297, r: 512, q: 936, k: 0 };

const PHASE: Record<string, number> = { p: 0, n: 1, b: 1, r: 2, q: 4, k: 0 };
const MAX_PHASE = 24;

const PST_MG: Record<string, number[]> = {
  p: [0, 0, 0, 0, 0, 0, 0, 0, 98, 134, 61, 95, 68, 126, 34, -11, -6, 7, 26, 31, 65, 56, 25, -20, -14, 13, 6, 21, 23, 12, 17, -23, -27, -2, -5, 12, 17, 6, 10, -25, -26, -4, -4, -10, 3, 3, 33, -12, -35, -1, -20, -23, -15, 24, 38, -22, 0, 0, 0, 0, 0, 0, 0, 0],
  n: [-167, -89, -34, -49, 61, -97, -15, -107, -73, -41, 72, 36, 23, 62, 7, -17, -47, 60, 37, 65, 84, 129, 73, 44, -9, 17, 19, 53, 37, 69, 18, 22, -13, 4, 16, 13, 28, 19, 21, -8, -23, -9, 12, 10, 19, 17, 25, -16, -29, -53, -12, -3, -1, 18, -14, -19, -105, -21, -58, -33, -17, -28, -19, -23],
  b: [-29, 4, -82, -37, -25, -42, 7, -8, -26, 16, -18, -13, 30, 59, 18, -47, -16, 37, 43, 40, 35, 50, 37, -2, -4, 5, 19, 50, 37, 37, 7, -2, -6, 13, 13, 26, 34, 12, 10, 4, 0, 15, 15, 15, 14, 27, 18, 10, 4, 15, 16, 0, 7, 21, 33, 1, -33, -3, -14, -21, -13, -12, -39, -21],
  r: [32, 42, 32, 51, 63, 9, 31, 43, 27, 32, 58, 62, 80, 67, 26, 44, -5, 19, 26, 36, 17, 45, 61, 16, -24, -11, 7, 26, 24, 35, -8, -20, -36, -26, -12, -1, 9, -7, 6, -23, -45, -25, -16, -17, 3, 0, -5, -33, -44, -16, -20, -9, -1, 11, -6, -71, -19, -13, 1, 17, 16, 7, -37, -26],
  q: [-28, 0, 29, 12, 59, 44, 43, 45, -24, -39, -5, 1, -16, 57, 28, 54, -13, -17, 7, 8, 29, 56, 47, 57, -27, -27, -16, -16, -1, 17, -2, 1, -9, -26, -9, -10, -2, -4, 3, -3, -14, 2, -11, -2, -5, 2, 14, 5, -35, -8, 11, 2, 8, 15, -3, 1, -1, -18, -9, 10, -15, -25, -31, -50],
  k: [-65, 23, 16, -15, -56, -34, 2, 13, 29, -1, -20, -7, -8, -4, -38, -29, -9, 24, 2, -16, -20, 6, 22, -22, -17, -20, -12, -27, -30, -25, -14, -36, -49, -1, -27, -39, -46, -44, -33, -51, -14, -14, -22, -46, -44, -30, -15, -27, 1, 7, -8, -64, -43, -16, 9, 8, -15, 36, 12, -54, 8, -28, 24, 14]
};

const PST_EG: Record<string, number[]> = {
  p: [0, 0, 0, 0, 0, 0, 0, 0, 178, 173, 158, 134, 147, 132, 165, 187, 94, 100, 85, 67, 56, 53, 82, 84, 32, 24, 13, 5, -2, 4, 17, 17, 13, 9, -3, -7, -7, -8, 3, -1, 4, 7, -6, 1, 0, -5, -1, -8, 13, 8, 8, 10, 13, 0, 2, -7, 0, 0, 0, 0, 0, 0, 0, 0],
  n: [-58, -38, -13, -28, -31, -27, -63, -99, -25, -8, -25, -2, -9, -25, -24, -52, -24, -20, 10, 9, -1, -9, -19, -41, -17, 3, 22, 22, 22, 11, 8, -18, -18, -6, 16, 25, 16, 17, 4, -18, -23, -3, -1, 15, 10, -3, -20, -22, -42, -20, -10, -5, -2, -20, -23, -44, -29, -51, -23, -15, -22, -18, -50, -64],
  b: [-14, -21, -11, -8, -7, -9, -17, -24, -8, -4, 7, -12, -3, -13, -4, -14, 2, -8, 0, -1, -2, 6, 0, 4, -3, 9, 12, 9, 14, 10, 3, 2, -6, 3, 13, 19, 7, 10, -3, -9, -12, -3, 8, 10, 13, 3, -7, -15, -14, -18, -7, -1, 4, -9, -15, -27, -23, -9, -23, -5, -9, -16, -5, -17],
  r: [13, 10, 18, 15, 12, 12, 8, 5, 11, 13, 13, 11, -3, 3, 8, 3, 7, 7, 7, 5, 4, -3, -5, -3, 4, 3, 13, 1, 2, 1, -1, 2, 3, 5, 8, 4, -5, -6, -8, -11, -4, 0, -5, -1, -7, -12, -8, -16, -6, -6, 0, 2, -9, -9, -11, -3, -9, 2, 3, -1, -5, -13, 4, -20],
  q: [-9, 22, 22, 27, 27, 19, 10, 20, -17, 20, 32, 41, 58, 25, 30, 0, -20, 6, 9, 49, 47, 35, 19, 9, 3, 22, 24, 45, 57, 40, 57, 36, -18, 28, 19, 47, 31, 34, 39, 23, -16, -27, 15, 6, 9, 17, 10, 5, -22, -23, -30, -16, -16, -23, -36, -32, -33, -28, -22, -43, -5, -32, -20, -41],
  k: [-74, -35, -18, -18, -11, 15, 4, -17, -12, 17, 14, 17, 17, 38, 23, 11, 10, 17, 23, 15, 20, 45, 44, 13, -8, 22, 24, 27, 26, 33, 26, 3, -18, -4, 21, 24, 27, 23, 9, -11, -19, -3, 11, 21, 23, 16, 7, -9, -27, -11, 4, 13, 14, 4, -5, -17, -53, -34, -21, -11, -28, -14, -24, -43]
};

const fileChar = (c: number) => String.fromCharCode(97 + c);

const sqToA8Index = (sq: string) => {
  const f = sq.charCodeAt(0) - 97;
  const r = 8 - Number(sq[1]);
  return r * 8 + f;
};

const a8IndexToSq = (idx: number) => {
  const r = Math.floor(idx / 8);
  const f = idx % 8;
  return `${fileChar(f)}${8 - r}`;
};

const mirrorA8 = (idx: number) => {
  const r = Math.floor(idx / 8);
  const f = idx % 8;
  return (7 - r) * 8 + f;
};

const fnv1a64 = (s: string) => {
  let h = 1469598103934665603n;
  const p = 1099511628211n;
  for (let i = 0; i < s.length; i++) {
    h ^= BigInt(s.charCodeAt(i));
    h = (h * p) & ((1n << 64n) - 1n);
  }
  return h;
};

const moveKey = (m: MoveLite) => `${m.from}${m.to}${m.promotion ?? ''}`;

const liteFromVerbose = (m: VerboseMove): MoveLite => ({
  from: m.from,
  to: m.to,
  promotion: m.promotion
});

const isCaptureLike = (m: VerboseMove) => m.flags.includes('c') || m.flags.includes('e');
const isPromotionLike = (m: VerboseMove) => m.flags.includes('p') || !!m.promotion;

const pieceValueForCapture = (p: string) => (p === 'p' ? 100 : p === 'n' ? 320 : p === 'b' ? 330 : p === 'r' ? 500 : p === 'q' ? 900 : 0);

const pawnShieldScore = (kingSq: string, pawns: Set<string>, color: 'w' | 'b') => {
  const f = kingSq.charCodeAt(0) - 97;
  const r = Number(kingSq[1]);
  const dir = color === 'w' ? 1 : -1;
  let s = 0;
  for (let df = -1; df <= 1; df++) {
    const nf = f + df;
    if (nf < 0 || nf > 7) continue;
    const sq1 = `${fileChar(nf)}${r + dir}`;
    const sq2 = `${fileChar(nf)}${r + 2 * dir}`;
    if (pawns.has(sq1)) s += 12;
    else if (pawns.has(sq2)) s += 6;
    else s -= 8;
  }
  return s;
};

const passedPawnBonus = (rankFromWhite: number) => {
  const r = Math.max(1, Math.min(6, rankFromWhite));
  return [0, 0, 10, 22, 40, 65, 95][r];
};

const evaluate = (chess: Chess) => {
  if (chess.isCheckmate()) return -MATE;
  if (chess.isDraw() || chess.isStalemate() || chess.isInsufficientMaterial() || chess.isThreefoldRepetition()) return 0;

  const board = chess.board();
  let mg = 0;
  let eg = 0;

  let phase = 0;

  let whiteBishops = 0;
  let blackBishops = 0;

  const whitePawns = new Set<string>();
  const blackPawns = new Set<string>();

  const whitePawnFiles = new Array<number>(8).fill(0);
  const blackPawnFiles = new Array<number>(8).fill(0);

  let wKingSq = 'e1';
  let bKingSq = 'e8';

  const pieceSquares: { sq: string; idxA8: number; type: string; color: 'w' | 'b' }[] = [];

  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const p = board[r][f];
      if (!p) continue;
      const idxA8 = r * 8 + f;
      const sq = a8IndexToSq(idxA8);
      const t = p.type;
      const c = p.color as 'w' | 'b';

      if (t === 'k') {
        if (c === 'w') wKingSq = sq;
        else bKingSq = sq;
      } else if (t === 'b') {
        if (c === 'w') whiteBishops++;
        else blackBishops++;
      } else if (t === 'p') {
        if (c === 'w') {
          whitePawns.add(sq);
          whitePawnFiles[f]++;
        } else {
          blackPawns.add(sq);
          blackPawnFiles[f]++;
        }
      }

      phase += PHASE[t];

      pieceSquares.push({ sq, idxA8, type: t, color: c });
    }
  }

  if (phase > MAX_PHASE) phase = MAX_PHASE;
  const mgPhase = phase;
  const egPhase = MAX_PHASE - phase;

  for (const ps of pieceSquares) {
    const t = ps.type;
    const c = ps.color;
    const baseMg = MG_VAL[t];
    const baseEg = EG_VAL[t];

    const idx = c === 'w' ? ps.idxA8 : mirrorA8(ps.idxA8);

    const pstMg = PST_MG[t][idx] ?? 0;
    const pstEg = PST_EG[t][idx] ?? 0;

    const sMg = baseMg + pstMg;
    const sEg = baseEg + pstEg;

    if (c === 'w') {
      mg += sMg;
      eg += sEg;
    } else {
      mg -= sMg;
      eg -= sEg;
    }
  }

  if (whiteBishops >= 2) {
    mg += 35;
    eg += 45;
  }
  if (blackBishops >= 2) {
    mg -= 35;
    eg -= 45;
  }

  const pawnStructure = () => {
    let sMg = 0;
    let sEg = 0;

    for (let f = 0; f < 8; f++) {
      if (whitePawnFiles[f] > 1) {
        sMg -= 8 * (whitePawnFiles[f] - 1);
        sEg -= 6 * (whitePawnFiles[f] - 1);
      }
      if (blackPawnFiles[f] > 1) {
        sMg += 8 * (blackPawnFiles[f] - 1);
        sEg += 6 * (blackPawnFiles[f] - 1);
      }
    }

    const isIsolated = (files: number[], f: number) => {
      const left = f > 0 ? files[f - 1] : 0;
      const right = f < 7 ? files[f + 1] : 0;
      return left === 0 && right === 0;
    };

    for (let f = 0; f < 8; f++) {
      if (whitePawnFiles[f] > 0 && isIsolated(whitePawnFiles, f)) {
        sMg -= 10 * whitePawnFiles[f];
        sEg -= 8 * whitePawnFiles[f];
      }
      if (blackPawnFiles[f] > 0 && isIsolated(blackPawnFiles, f)) {
        sMg += 10 * blackPawnFiles[f];
        sEg += 8 * blackPawnFiles[f];
      }
    }

    const blackPawnByFile = (file: number) => {
      const res: number[] = [];
      for (const sq of blackPawns) {
        const f = sq.charCodeAt(0) - 97;
        if (f !== file) continue;
        res.push(Number(sq[1]));
      }
      return res;
    };

    const whitePawnByFile = (file: number) => {
      const res: number[] = [];
      for (const sq of whitePawns) {
        const f = sq.charCodeAt(0) - 97;
        if (f !== file) continue;
        res.push(Number(sq[1]));
      }
      return res;
    };

    for (const sq of whitePawns) {
      const f = sq.charCodeAt(0) - 97;
      const r = Number(sq[1]);
      let blocked = false;

      for (let df = -1; df <= 1; df++) {
        const nf = f + df;
        if (nf < 0 || nf > 7) continue;
        for (const br of blackPawnByFile(nf)) {
          if (br > r) {
            blocked = true;
            break;
          }
        }
        if (blocked) break;
      }

      if (!blocked) {
        const rankFromWhite = r - 1;
        const b = passedPawnBonus(rankFromWhite);
        sMg += b;
        sEg += b * 2;
      }
    }

    for (const sq of blackPawns) {
      const f = sq.charCodeAt(0) - 97;
      const r = Number(sq[1]);
      let blocked = false;

      for (let df = -1; df <= 1; df++) {
        const nf = f + df;
        if (nf < 0 || nf > 7) continue;
        for (const wr of whitePawnByFile(nf)) {
          if (wr < r) {
            blocked = true;
            break;
          }
        }
        if (blocked) break;
      }

      if (!blocked) {
        const rankFromWhite = 8 - r;
        const b = passedPawnBonus(rankFromWhite);
        sMg -= b;
        sEg -= b * 2;
      }
    }

    return { sMg, sEg };
  };

  const ps = pawnStructure();
  mg += ps.sMg;
  eg += ps.sEg;

  const kingSafety = () => {
    const wShield = pawnShieldScore(wKingSq, whitePawns, 'w');
    const bShield = pawnShieldScore(bKingSq, blackPawns, 'b');
    let sMg = wShield - bShield;
    let sEg = Math.floor((wShield - bShield) / 3);

    const wFile = wKingSq.charCodeAt(0) - 97;
    const bFile = bKingSq.charCodeAt(0) - 97;

    const hasPawnOnFile = (pawns: Set<string>, file: number) => {
      for (const sq of pawns) if (sq.charCodeAt(0) - 97 === file) return true;
      return false;
    };

    if (!hasPawnOnFile(whitePawns, wFile)) sMg -= 18;
    if (!hasPawnOnFile(blackPawns, bFile)) sMg += 18;

    return { sMg, sEg };
  };

  const ks = kingSafety();
  mg += ks.sMg;
  eg += ks.sEg;

  const rookFiles = () => {
    let sMg = 0;
    let sEg = 0;

    const fileHasPawn = (pawns: Set<string>, file: number) => {
      for (const sq of pawns) if (sq.charCodeAt(0) - 97 === file) return true;
      return false;
    };

    for (const ps of pieceSquares) {
      if (ps.type !== 'r') continue;
      const f = ps.sq.charCodeAt(0) - 97;
      const ownPawns = ps.color === 'w' ? whitePawns : blackPawns;
      const oppPawns = ps.color === 'w' ? blackPawns : whitePawns;

      const ownHas = fileHasPawn(ownPawns, f);
      const oppHas = fileHasPawn(oppPawns, f);

      let bonusMg = 0;
      let bonusEg = 0;

      if (!ownHas && !oppHas) {
        bonusMg += 18;
        bonusEg += 14;
      } else if (!ownHas && oppHas) {
        bonusMg += 10;
        bonusEg += 8;
      }

      if (ps.color === 'w') {
        sMg += bonusMg;
        sEg += bonusEg;
      } else {
        sMg -= bonusMg;
        sEg -= bonusEg;
      }
    }

    return { sMg, sEg };
  };

  const rf = rookFiles();
  mg += rf.sMg;
  eg += rf.sEg;

  const raw = Math.floor((mg * mgPhase + eg * egPhase) / MAX_PHASE);

  const stm = chess.turn() === 'w' ? 1 : -1;
  return raw * stm;
};

export const Analyze = (fen: string, options: AnalyzeOptions = {}): Best => {
  const maxDepth = Math.max(1, Math.min(64, options.depth ?? 8));
  const thinkingTime = Math.max(1, options.thinking_time ?? 1200);

  const chess = new Chess(fen);
  if (chess.isGameOver()) return null;

  const rootMoves = chess.moves({ verbose: true }) as unknown as VerboseMove[];
  if (rootMoves.length === 0) return null;

  const deadline = Date.now() + thinkingTime;

  const tt = new Map<bigint, TTEntry>();

  const killer1: (string | null)[] = new Array(128).fill(null);
  const killer2: (string | null)[] = new Array(128).fill(null);
  const history = new Map<string, number>();

  const timeUp = () => Date.now() >= deadline;

  const ttGet = (key: bigint) => tt.get(key);

  const ttPut = (entry: TTEntry) => {
    const prev = tt.get(entry.key);
    if (!prev || entry.depth >= prev.depth) tt.set(entry.key, entry);
  };

  const scoreMove = (m: VerboseMove, ply: number, ttBestKey: string | null) => {
    const lm = liteFromVerbose(m);
    const k = moveKey(lm);
    if (ttBestKey && k === ttBestKey) return 1_000_000_000;

    let s = 0;

    if (isCaptureLike(m)) {
      const victim = m.captured ? pieceValueForCapture(m.captured) : 0;
      const attacker = pieceValueForCapture(m.piece);
      s += 50_000 + victim * 16 - attacker;
    }

    if (isPromotionLike(m)) s += 40_000 + (m.promotion === 'q' ? 2_000 : m.promotion === 'r' ? 1_200 : 700);

    const k1 = killer1[ply];
    const k2 = killer2[ply];
    if (!isCaptureLike(m) && !isPromotionLike(m)) {
      if (k1 && k === k1) s += 25_000;
      else if (k2 && k === k2) s += 20_000;
      s += history.get(k) ?? 0;
    }

    const center = (sq: string) => {
      const f = sq.charCodeAt(0) - 97;
      const r = Number(sq[1]) - 1;
      const df = Math.abs(3.5 - f);
      const dr = Math.abs(3.5 - r);
      return -(df + dr);
    };
    s += Math.floor(center(m.to) * 8);

    return s;
  };

  const make = (m: VerboseMove) => {
    const mv: any = { from: m.from, to: m.to };
    if (m.promotion) mv.promotion = m.promotion;
    return chess.move(mv);
  };

  const unmake = () => {
    chess.undo();
  };

  const quiescence = (alpha: number, beta: number, qply: number): number => {
    if (timeUp()) throw new Error('TIME');
    if (qply > 10) return evaluate(chess);

    if (chess.isCheckmate()) return -MATE + qply;
    if (chess.isDraw() || chess.isStalemate() || chess.isInsufficientMaterial() || chess.isThreefoldRepetition()) return 0;

    let stand = evaluate(chess);
    if (stand >= beta) return beta;
    if (stand > alpha) alpha = stand;

    const movesAll = chess.moves({ verbose: true }) as unknown as VerboseMove[];
    const inCheck = chess.isCheck();

    let noisy = movesAll.filter((m) => isCaptureLike(m) || isPromotionLike(m) || inCheck);
    if (!inCheck) noisy = noisy.filter((m) => isCaptureLike(m) || isPromotionLike(m));

    noisy.sort((a, b) => {
      const av = (isCaptureLike(a) ? 1 : 0) + (isPromotionLike(a) ? 1 : 0);
      const bv = (isCaptureLike(b) ? 1 : 0) + (isPromotionLike(b) ? 1 : 0);
      if (av !== bv) return bv - av;
      const as = (a.captured ? pieceValueForCapture(a.captured) : 0) - pieceValueForCapture(a.piece);
      const bs = (b.captured ? pieceValueForCapture(b.captured) : 0) - pieceValueForCapture(b.piece);
      return bs - as;
    });

    for (const m of noisy) {
      make(m);
      const score = -quiescence(-beta, -alpha, qply + 1);
      unmake();

      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    }

    return alpha;
  };

  const negamax = (depth: number, alpha: number, beta: number, ply: number): number => {
    if (timeUp()) throw new Error('TIME');

    if (chess.isCheckmate()) return -MATE + ply;
    if (chess.isDraw() || chess.isStalemate() || chess.isInsufficientMaterial() || chess.isThreefoldRepetition()) return 0;

    const key = fnv1a64(chess.fen());
    const ttEntry = ttGet(key);

    const alphaOrig = alpha;

    if (ttEntry && ttEntry.depth >= depth) {
      const v = ttEntry.value;
      if (ttEntry.flag === 0) return v;
      if (ttEntry.flag === 1) alpha = Math.max(alpha, v);
      else if (ttEntry.flag === 2) beta = Math.min(beta, v);
      if (alpha >= beta) return v;
    }

    if (depth <= 0) return quiescence(alpha, beta, 0);

    const moves = chess.moves({ verbose: true }) as unknown as VerboseMove[];
    if (moves.length === 0) return chess.isCheck() ? -MATE + ply : 0;

    const ttBestKey = ttEntry?.best ? moveKey(ttEntry.best) : null;

    moves.sort((a, b) => scoreMove(b, ply, ttBestKey) - scoreMove(a, ply, ttBestKey));

    let bestVal = -INF;
    let bestMove: MoveLite | undefined;

    for (let i = 0; i < moves.length; i++) {
      const m = moves[i];
      make(m);

      const givesCheck = chess.isCheck();

      let newDepth = depth - 1;

      const isQuiet = !isCaptureLike(m) && !isPromotionLike(m);
      if (depth >= 3 && i >= 3 && isQuiet && !givesCheck) {
        const r = depth >= 6 && i >= 8 ? 2 : 1;
        const reducedDepth = Math.max(0, newDepth - r);
        let v = -negamax(reducedDepth, -alpha - 1, -alpha, ply + 1);
        if (v > alpha) v = -negamax(newDepth, -beta, -alpha, ply + 1);
        unmake();

        if (v > bestVal) {
          bestVal = v;
          bestMove = liteFromVerbose(m);
        }

        if (v > alpha) alpha = v;
        if (alpha >= beta) {
          if (isQuiet) {
            const k = moveKey(liteFromVerbose(m));
            if (killer1[ply] !== k) {
              killer2[ply] = killer1[ply];
              killer1[ply] = k;
            }
            history.set(k, (history.get(k) ?? 0) + depth * depth * 12);
          }
          break;
        }
        continue;
      }

      const v = -negamax(newDepth, -beta, -alpha, ply + 1);
      unmake();

      if (v > bestVal) {
        bestVal = v;
        bestMove = liteFromVerbose(m);
      }

      if (v > alpha) alpha = v;
      if (alpha >= beta) {
        if (!isCaptureLike(m) && !isPromotionLike(m)) {
          const k = moveKey(liteFromVerbose(m));
          if (killer1[ply] !== k) {
            killer2[ply] = killer1[ply];
            killer1[ply] = k;
          }
          history.set(k, (history.get(k) ?? 0) + depth * depth * 12);
        }
        break;
      }
    }

    let flag: TTFlag = 0;
    if (bestVal <= alphaOrig) flag = 2;
    else if (bestVal >= beta) flag = 1;
    else flag = 0;

    ttPut({ key, depth, value: bestVal, flag, best: bestMove });

    return bestVal;
  };

  let bestRoot: MoveLite | null = null;
  let lastCompleted: MoveLite | null = null;
  let lastScore = 0;

  const aspiration = (d: number, prev: number) => {
    if (d <= 2) return { a: -INF, b: INF };
    const w = 60;
    return { a: prev - w, b: prev + w };
  };

  const rootSearch = (depth: number) => {
    const key = fnv1a64(chess.fen());
    const ttEntry = ttGet(key);
    const ttBestKey = ttEntry?.best ? moveKey(ttEntry.best) : null;

    const moves = (chess.moves({ verbose: true }) as unknown as VerboseMove[]).slice();
    moves.sort((a, b) => scoreMove(b, 0, ttBestKey) - scoreMove(a, 0, ttBestKey));

    if (moves.length === 0) return { move: null as MoveLite | null, score: 0 };

    const { a: aspA, b: aspB } = aspiration(depth, lastScore);

    const searchWithWindow = (alpha0: number, beta0: number) => {
      let best = -INF;
      let bestMove: MoveLite | null = null;

      let alpha = alpha0;
      let beta = beta0;

      for (const m of moves) {
        make(m);

        const givesCheck = chess.isCheck();
        const ext = givesCheck && depth <= 3 ? 1 : 0;

        const v = -negamax(depth - 1 + ext, -beta, -alpha, 1);
        unmake();

        if (v > best) {
          best = v;
          bestMove = liteFromVerbose(m);
        }
        if (v > alpha) alpha = v;
      }

      return { move: bestMove, score: best };
    };

    let r = searchWithWindow(aspA, aspB);

    if (r.score <= aspA) r = searchWithWindow(-INF, aspB);
    else if (r.score >= aspB) r = searchWithWindow(aspA, INF);

    return r;
  };

  for (let d = 1; d <= maxDepth; d++) {
    try {
      const r = rootSearch(d);
      if (r.move) {
        lastCompleted = r.move;
        bestRoot = r.move;
        lastScore = r.score;
      }
    } catch (e: any) {
      if (String(e?.message ?? e) === 'TIME') break;
      break;
    }
    if (timeUp()) break;
  }

  const chosen = bestRoot ?? lastCompleted;
  if (!chosen) return null;

  return { from: chosen.from, to: chosen.to };
};

export default async function ({ fen, options = {} }: { fen: string; options?: AnalyzeOptions }) {
  return Analyze(fen, options);
}
