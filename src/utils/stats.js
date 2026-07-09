// Per-player lifetime stats and achievements — stored in localStorage.

const KEY = 'ii_stats';

const DEFAULTS = {
  games: 0, wins: 0, rounds: 0,
  timesImp: 0, escapes: 0, caught: 0,
  correctVotes: 0, wrongVotes: 0,
};

export function getStats() {
  try {
    return { ...DEFAULTS, ...(JSON.parse(localStorage.getItem(KEY) || '{}')) };
  } catch (e) {
    return { ...DEFAULTS };
  }
}

function save(s) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {}
}

// Called once per round result (each player records their own device)
export function recordRound({ wasImp, escaped, voted, votedCorrectly }) {
  const s = getStats();
  s.rounds += 1;
  if (wasImp) {
    s.timesImp += 1;
    if (escaped) s.escapes += 1; else s.caught += 1;
  } else if (voted) {
    if (votedCorrectly) s.correctVotes += 1; else s.wrongVotes += 1;
  }
  save(s);
}

// Called once when a game reaches the final leaderboard
export function recordGame({ won }) {
  const s = getStats();
  s.games += 1;
  if (won) s.wins += 1;
  save(s);
}

export const ACHIEVEMENTS = [
  { id: 'first',    emoji: '🎬', name: 'First Game',         desc: 'Play your first game',            test: s => s.games >= 1 },
  { id: 'regular',  emoji: '🎲', name: 'Regular',            desc: 'Play 10 games',                    test: s => s.games >= 10 },
  { id: 'veteran',  emoji: '🌟', name: 'Veteran',            desc: 'Play 50 games',                    test: s => s.games >= 50 },
  { id: 'winner',   emoji: '🏆', name: 'Winner',             desc: 'Win a game',                       test: s => s.wins >= 1 },
  { id: 'champ',    emoji: '👑', name: 'Champion',           desc: 'Win 10 games',                     test: s => s.wins >= 10 },
  { id: 'imp',      emoji: '🕵️', name: 'Undercover',         desc: 'Be the imposter once',             test: s => s.timesImp >= 1 },
  { id: 'escape5',  emoji: '😈', name: 'Escape Artist',      desc: 'Escape 5 times as imposter',       test: s => s.escapes >= 5 },
  { id: 'escape15', emoji: '🎭', name: 'Master of Disguise', desc: 'Escape 15 times as imposter',      test: s => s.escapes >= 15 },
  { id: 'eye',      emoji: '🔍', name: 'Sharp Eye',          desc: 'Vote the imposter out 10 times',   test: s => s.correctVotes >= 10 },
  { id: 'detect',   emoji: '🧠', name: 'Detective',          desc: 'Vote the imposter out 25 times',   test: s => s.correctVotes >= 25 },
];

export function getAchievements() {
  const s = getStats();
  return ACHIEVEMENTS.map(a => ({ ...a, unlocked: a.test(s) }));
}
