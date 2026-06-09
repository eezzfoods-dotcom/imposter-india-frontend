import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Screen, Card, Btn, Input, Label, Avatar, PlayerRow, COLORS, EMOJIS, LoadingDots } from '../components/ui';

const LANGS = ['Tamil', 'Telugu', 'Hindi', 'Malayalam', 'English'];
const CATS  = ['Movies', 'Foods', 'Locations'];

// ── HOME ──────────────────────────────────────────────────
export function HomeScreen() {
  const { goHome, createRoom, joinRoom, clearError, error } = useGame();
  const [view, setView] = useState('home'); // home | host | join
  const [hostName, setHostName] = useState('');
  const [joinName, setJoinName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [cfg, setCfg] = useState({ rounds: 5, langs: ['Tamil'], cats: ['Movies', 'Foods', 'Locations'] });
  const [loading, setLoading] = useState(false);

  function toggleLang(l) {
    setCfg(c => ({
      ...c,
      langs: c.langs.includes(l) ? (c.langs.length > 1 ? c.langs.filter(x => x !== l) : c.langs) : [...c.langs, l],
    }));
  }

  function toggleCat(cat) {
    setCfg(c => ({
      ...c,
      cats: c.cats.includes(cat) ? (c.cats.length > 1 ? c.cats.filter(x => x !== cat) : c.cats) : [...c.cats, cat],
    }));
  }

  function handleCreate() {
    if (!hostName.trim()) return;
    setLoading(true);
    createRoom(hostName.trim(), cfg, () => setLoading(false));
  }

  function handleJoin() {
    if (!joinName.trim() || joinCode.length !== 4) return;
    setLoading(true);
    joinRoom(joinCode, joinName.trim(), () => setLoading(false));
  }

  if (view === 'host') return (
    <Screen>
      <div className="w-full max-w-sm animate-fade-up">
        <button onClick={() => setView('home')} className="text-white/40 font-body text-sm mb-6">← Back</button>
        <h1 className="font-display text-4xl text-white tracking-widest mb-1">CREATE ROOM</h1>
        <p className="text-white/40 font-body text-sm mb-6">Set up the game</p>

        <Label>YOUR NAME</Label>
        <Input value={hostName} onChange={setHostName} placeholder="Enter your name" maxLength={12} className="mb-4" />

        <Label>LANGUAGES</Label>
        <div className="flex flex-wrap gap-2 mb-4">
          {LANGS.map(l => (
            <button key={l} onClick={() => toggleLang(l)}
              className={`px-3 py-1.5 rounded-full text-sm font-body font-bold border transition-all ${cfg.langs.includes(l) ? 'bg-pink-600 border-pink-500 text-white' : 'border-white/20 text-white/50'}`}>
              {l}
            </button>
          ))}
        </div>

        <Label>CATEGORIES</Label>
        <div className="flex flex-wrap gap-2 mb-4">
          {CATS.map(cat => (
            <button key={cat} onClick={() => toggleCat(cat)}
              className={`px-3 py-1.5 rounded-full text-sm font-body font-bold border transition-all ${cfg.cats.includes(cat) ? 'bg-purple-700 border-purple-500 text-white' : 'border-white/20 text-white/50'}`}>
              {cat}
            </button>
          ))}
        </div>

        <Label>ROUNDS</Label>
        <div className="flex gap-2 mb-6 flex-wrap">
          {[3,4,5,6,7,8].map(r => (
            <button key={r} onClick={() => setCfg(c => ({ ...c, rounds: r }))}
              className={`w-10 h-10 rounded-xl text-sm font-bold font-body border transition-all ${cfg.rounds === r ? 'bg-pink-600 border-pink-500 text-white' : 'border-white/20 text-white/50'}`}>
              {r}
            </button>
          ))}
        </div>

        {error && <p className="text-red-400 text-sm font-body mb-3">{error}</p>}
        <Btn onClick={handleCreate} disabled={!hostName.trim()} loading={loading}>CREATE ROOM 🎬</Btn>
      </div>
    </Screen>
  );

  if (view === 'join') return (
    <Screen>
      <div className="w-full max-w-sm animate-fade-up">
        <button onClick={() => setView('home')} className="text-white/40 font-body text-sm mb-6">← Back</button>
        <h1 className="font-display text-4xl text-white tracking-widest mb-1">JOIN ROOM</h1>
        <p className="text-white/40 font-body text-sm mb-6">Enter room code to join</p>

        <Label>YOUR NAME</Label>
        <Input value={joinName} onChange={setJoinName} placeholder="Enter your name" maxLength={12} className="mb-4" />

        <Label>ROOM CODE</Label>
        <Input value={joinCode} onChange={setJoinCode} placeholder="ABCD" maxLength={4} uppercase className="mb-6" />

        {error && <p className="text-red-400 text-sm font-body mb-3">{error}</p>}
        <Btn onClick={handleJoin} disabled={!joinName.trim() || joinCode.length !== 4} loading={loading}>JOIN 🎮</Btn>
      </div>
    </Screen>
  );

  return (
    <Screen className="justify-center">
      <div className="w-full max-w-sm text-center animate-fade-up">
        <p className="text-white/40 text-xs tracking-[0.5em] font-body mb-3">INDIA EDITION</p>
        <h1 className="font-display text-7xl tracking-widest bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent mb-2">
          IMPOSTER
        </h1>
        <p className="text-white/40 font-body text-sm mb-12">🎬 Movies · 🍛 Food · 📍 Locations</p>

        <div className="flex flex-col gap-3">
          <Btn onClick={() => setView('host')}>HOST A GAME 👑</Btn>
          <Btn onClick={() => setView('join')} variant="secondary">JOIN A GAME 🎮</Btn>
        </div>
      </div>
    </Screen>
  );
}

// ── LOBBY ─────────────────────────────────────────────────
export function LobbyScreen() {
  const { room, myIdx, startGame, removePlayer, error } = useGame();
  const [loading, setLoading] = useState(false);
  if (!room) return null;

  const isHost = myIdx === 0;
  const filled = room.players.filter(p => p.name && !p.removed);
  const canStart = filled.length >= 3;

  function handleStart() {
    setLoading(true);
    startGame((res) => {
      setLoading(false);
      if (res && !res.ok) alert(res.error);
    });
  }

  return (
    <Screen>
      <div className="w-full max-w-sm animate-fade-up">
        <p className="text-white/40 text-xs tracking-[0.4em] font-body mb-1">ROOM CODE</p>
        <h1 className="font-display text-6xl tracking-[0.3em] bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-1">
          {room.code}
        </h1>
        <p className="text-white/30 font-body text-xs mb-6">Share this code with your friends</p>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-3 mb-4">
          <p className="text-white/40 text-xs tracking-[0.2em] font-body font-bold mb-2">
            PLAYERS ({filled.length}/{room.players.length})
          </p>
          <div className="flex flex-col gap-2">
            {room.players.map((p, i) => p.name && !p.removed && (
              <PlayerRow
                key={i} player={p} idx={i}
                isHost={i === 0} isMe={i === myIdx}
                onRemove={isHost && i !== 0 ? () => removePlayer(i) : null}
              />
            ))}
            {room.players.length < 12 && (
              <p className="text-white/20 text-xs font-body text-center py-1">
                Waiting for players to join…
              </p>
            )}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-3 mb-4 text-xs font-body text-white/40 flex gap-4">
          <span>🌐 {room.cfg.langs.join(', ')}</span>
          <span>🎯 {room.cfg.cats.join(', ')}</span>
          <span>🔄 {room.cfg.rounds} rounds</span>
        </div>

        {error && <p className="text-red-400 text-sm font-body mb-3">{error}</p>}

        {isHost ? (
          <>
            <Btn onClick={handleStart} disabled={!canStart} loading={loading}>
              START GAME 🎬
            </Btn>
            {!canStart && (
              <p className="text-white/30 text-xs font-body text-center mt-2">
                Need at least 3 players ({filled.length} joined)
              </p>
            )}
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-white/40 font-body text-sm mb-3">Waiting for host to start…</p>
            <LoadingDots />
          </div>
        )}
      </div>
    </Screen>
  );
}

// ── PLAYING (ROLE REVEAL) ─────────────────────────────────
export function PlayingScreen() {
  const { room, myIdx, myRole, moveToSpinner } = useGame();
  const [revealed, setRevealed] = useState(false);
  if (!room || !myRole) return <Screen><LoadingDots /></Screen>;

  const { isImp, round, resolvedClue, locList } = myRole;
  const isHost = myIdx === 0;
  const playerColor = COLORS[myIdx % COLORS.length];
  const playerEmoji = EMOJIS[myIdx % EMOJIS.length];
  const playerName = room.players[myIdx]?.name || '';

  return (
    <Screen>
      <div className="w-full max-w-sm animate-fade-up">
        {/* Player header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-3 border-4"
            style={{ background: playerColor + '22', borderColor: playerColor }}>
            {playerEmoji}
          </div>
          <p className="font-display text-2xl tracking-widest" style={{ color: playerColor }}>{playerName}</p>
        </div>

        {/* Role card — tap to reveal */}
        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="w-full bg-gradient-to-br from-white/5 to-white/10 border-2 border-dashed border-white/20 rounded-3xl py-16 flex flex-col items-center gap-3 active:scale-95 transition-transform">
            <span className="text-5xl">🎬</span>
            <span className="text-white/40 font-body text-sm tracking-widest">TAP TO REVEAL YOUR ROLE</span>
          </button>
        ) : (
          <div className="animate-fade-up">
            {isImp ? (
              // IMPOSTER CARD
              <div className="border-2 border-red-500/50 bg-red-500/10 rounded-3xl p-5 mb-4">
                <p className="text-red-400 text-xs tracking-[0.4em] font-body font-bold mb-1">YOU ARE THE</p>
                <p className="font-display text-5xl text-red-400 mb-3">IMPOSTER</p>
                {round.c === 'Location' ? (
                  <p className="text-white/60 font-body text-sm">You don't know the location. Ask clever questions and blend in!</p>
                ) : (
                  <div className="bg-white/5 rounded-2xl p-3 mt-2">
                    <p className="text-white/40 text-xs font-body mb-1">{resolvedClue?.label || 'Clue'}</p>
                    <p className="text-white font-body font-bold">{resolvedClue?.value || '—'}</p>
                    <p className="text-white/30 text-xs font-body mt-2">Bluff! You don't know the exact name.</p>
                  </div>
                )}
              </div>
            ) : (
              // CREWMATE CARD
              <div className="border-2 rounded-3xl p-5 mb-4" style={{ borderColor: playerColor + '55', background: playerColor + '11' }}>
                <p className="text-white/40 text-xs tracking-[0.4em] font-body font-bold mb-1">
                  {round.c === 'Location' ? 'THE LOCATION IS' : round.c === 'Food' ? 'THE FOOD IS' : 'THE MOVIE IS'}
                </p>
                <p className="font-display text-3xl mb-2" style={{ color: playerColor }}>{round.n}</p>
                <p className="text-white/50 font-body text-sm">{round.d}</p>
                {round.c === 'Location' && (
                  <div className="mt-2 px-3 py-1 rounded-full inline-block text-xs font-bold font-body"
                    style={{ background: playerColor + '22', color: playerColor }}>
                    Your role: {round.d}
                  </div>
                )}
              </div>
            )}

            {/* Location list */}
            {locList && locList.length > 0 && (
              <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-3 mb-4">
                <p className="text-emerald-400 text-xs tracking-[0.2em] font-body font-bold mb-2">
                  📍 POSSIBLE LOCATIONS
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {locList.map(loc => (
                    <span key={loc}
                      className={`px-2 py-0.5 rounded-full text-xs font-body font-semibold ${!isImp && loc === round.n ? 'bg-emerald-500 text-white' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'}`}>
                      {loc}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Hint */}
            <p className="text-white/30 font-body text-xs text-center mb-4">
              {isImp ? "Bluff — don't get caught!" : "Discuss without saying the name!"}
            </p>

            {isHost ? (
              <Btn onClick={moveToSpinner}>SPIN WHEEL 🎡</Btn>
            ) : (
              <div className="text-center py-2">
                <p className="text-white/30 font-body text-sm">Waiting for host to spin…</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Screen>
  );
}

// ── SPINNER ───────────────────────────────────────────────
export function SpinnerScreen() {
  const { room, myIdx, moveToDiscuss } = useGame();
  const [done, setDone] = useState(false);
  if (!room) return null;

  const isHost = myIdx === 0;
  const players = room.players.filter(p => p.name && !p.removed);
  const n = players.length;
  const firstPlayer = room.players[room.firstIdx];
  const seed = room.spinnerSeed;

  const segColors = ['#E91E63','#9C27B0','#3F51B5','#00BFA5','#FF5722','#FFB800','#2196F3','#4CAF50'];
  const deg = 360 / n;
  const gradient = `conic-gradient(${players.map((_, i) => `${segColors[i % segColors.length]} ${i * deg}deg ${(i + 1) * deg}deg`).join(',')})`;

  // Deterministic rotation from seed
  const filledPos = room.players.slice(0, room.firstIdx + 1).filter(p => p.name && !p.removed).length - 1;
  const totalRotation = (5 + (seed % 8)) * 360 + (360 - (filledPos * deg + deg / 2));

  return (
    <Screen className="justify-center">
      <div className="w-full max-w-sm text-center animate-fade-up">
        <p className="text-white/40 text-xs tracking-[0.4em] font-body mb-6">
          ROUND {room.roundNum} / {room.totalRounds} — WHO SPEAKS FIRST?
        </p>

        {/* Wheel */}
        <div className="relative w-56 h-56 mx-auto mb-6">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-3xl z-10 drop-shadow-lg">▼</div>
          <div
            id="spinWheel"
            className="w-56 h-56 rounded-full border-4 border-white/15 shadow-2xl shadow-pink-500/20"
            style={{
              background: gradient,
              transition: done ? 'none' : 'transform 4s cubic-bezier(0.17,0.67,0.12,1)',
              transform: done ? `rotate(${totalRotation}deg)` : 'rotate(0deg)',
            }}
            ref={el => {
              if (el && !done) {
                setTimeout(() => {
                  el.style.transform = `rotate(${totalRotation}deg)`;
                  setTimeout(() => setDone(true), 4200);
                }, 300);
              }
            }}
          >
            {/* Center dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-lg shadow-lg">🎬</div>
            </div>
          </div>
        </div>

        {done && firstPlayer && (
          <div className="animate-fade-up">
            <p className="text-white/40 text-xs tracking-[0.3em] font-body mb-2">SPEAKS FIRST</p>
            <p className="font-display text-4xl text-white mb-4">{firstPlayer.name}</p>
            {isHost ? (
              <Btn onClick={moveToDiscuss}>START DISCUSSION 💬</Btn>
            ) : (
              <p className="text-white/30 font-body text-sm">Waiting for host…</p>
            )}
          </div>
        )}
      </div>
    </Screen>
  );
}

// ── DISCUSS ───────────────────────────────────────────────
export function DiscussScreen() {
  const { room, myIdx, myRole, moveToVote, imposterWon } = useGame();
  if (!room || !myRole) return null;

  const isHost = myIdx === 0;
  const firstPlayer = room.players[room.firstIdx];
  const firstColor = COLORS[room.firstIdx % COLORS.length];
  const isFirst = myIdx === room.firstIdx;
  const { round, locList } = myRole;

  return (
    <Screen>
      <div className="w-full max-w-sm animate-fade-up">
        <h1 className="font-display text-4xl text-white tracking-widest mb-1">DISCUSSION</h1>
        <p className="text-white/30 font-body text-xs mb-4">Round {room.roundNum} of {room.totalRounds}</p>

        {/* First speaker */}
        <div className="rounded-2xl border p-3 mb-4 flex items-center gap-3"
          style={{ borderColor: firstColor + '55', background: firstColor + '11' }}>
          <Avatar idx={room.firstIdx} size="sm" />
          <div>
            <p className="text-white/40 text-xs font-body">SPEAKS FIRST</p>
            <p className="font-display text-xl" style={{ color: firstColor }}>
              {firstPlayer?.name} {isFirst && <span className="text-xs bg-pink-500 text-white px-2 py-0.5 rounded-full ml-1">YOU!</span>}
            </p>
          </div>
        </div>

        {/* Rules */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-3 mb-4 text-white/50 font-body text-sm flex flex-col gap-1">
          <p>🗣 Talk about it — never say the name</p>
          <p>🔍 Watch who seems vague or unsure</p>
          {round?.c === 'Location' && <p>📍 Imposter doesn't know the location!</p>}
        </div>

        {/* Location list */}
        {locList && locList.length > 0 && (
          <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-3 mb-4">
            <p className="text-emerald-400 text-xs tracking-[0.2em] font-body font-bold mb-2">📍 POSSIBLE LOCATIONS</p>
            <div className="flex flex-wrap gap-1.5">
              {locList.map(loc => (
                <span key={loc}
                  className={`px-2 py-0.5 rounded-full text-xs font-body font-semibold ${!myRole.isImp && loc === round?.n ? 'bg-emerald-500 text-white' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'}`}>
                  {loc}
                </span>
              ))}
            </div>
          </div>
        )}

        {isHost ? (
          <div className="flex flex-col gap-2 mt-2">
            <Btn onClick={moveToVote}>🗳 START VOTING</Btn>
            <Btn onClick={imposterWon} variant="danger">🕵️ IMPOSTER REVEALED THE MOVIE</Btn>
          </div>
        ) : (
          <p className="text-white/30 font-body text-sm text-center mt-4">Host controls voting</p>
        )}
      </div>
    </Screen>
  );
}

// ── VOTE ──────────────────────────────────────────────────
export function VoteScreen() {
  const { room, myIdx, castVote, lockVotes } = useGame();
  const [myVote, setMyVote] = useState(-1);
  if (!room) return null;

  const isHost = myIdx === 0;
  const voteCount = Object.keys(room.votes || {}).length;
  const allVoted = voteCount >= room.players.filter(p => p.name && !p.removed).length;

  function handleVote(idx) {
    if (myVote >= 0) return;
    setMyVote(idx);
    castVote(idx);
  }

  return (
    <Screen>
      <div className="w-full max-w-sm animate-fade-up">
        <h1 className="font-display text-4xl text-white tracking-widest mb-1">VOTE</h1>
        <p className="text-white/30 font-body text-sm mb-4">{voteCount} / {room.players.filter(p => p.name && !p.removed).length} voted</p>

        {myVote >= 0 ? (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-center mb-4">
            <p className="text-emerald-400 font-body font-bold">✓ You voted for <strong>{room.players[myVote]?.name}</strong></p>
            <p className="text-white/30 text-sm font-body mt-1">Waiting for others…</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 mb-4">
            {room.players.map((p, i) => {
              if (!p.name || p.removed || i === myIdx) return null;
              return (
                <button key={i} onClick={() => handleVote(i)}
                  className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 active:scale-95 transition-transform">
                  <Avatar idx={i} size="sm" />
                  <span className="text-white font-body font-medium flex-1 text-left">{p.name}</span>
                  <span className="text-white/30 text-sm">Vote →</span>
                </button>
              );
            })}
          </div>
        )}

        {isHost && allVoted && (
          <Btn onClick={lockVotes}>SEE RESULT 🎬</Btn>
        )}
        {isHost && !allVoted && voteCount > 0 && (
          <Btn onClick={lockVotes} variant="secondary">LOCK VOTES ({voteCount} voted)</Btn>
        )}
      </div>
    </Screen>
  );
}

// ── RESULT ────────────────────────────────────────────────
export function ResultScreen() {
  const { room, myIdx, resultData, nextRound, goLeaderboard } = useGame();
  const [loading, setLoading] = useState(false);
  if (!room || !resultData) return <Screen><LoadingDots /></Screen>;

  const isHost = myIdx === 0;
  const { impCaught, imposterRevealed, eliminatedIdx, impIdxs } = resultData;
  const round = room.round;
  const isLastRound = room.roundNum >= room.totalRounds;

  return (
    <Screen>
      <div className="w-full max-w-sm animate-fade-up">
        {/* Banner */}
        <div className={`rounded-3xl p-5 text-center mb-4 ${impCaught ? 'bg-emerald-500/15 border-2 border-emerald-500/40' : 'bg-red-500/15 border-2 border-red-500/40'}`}>
          <p className="text-4xl mb-2">{impCaught ? '🎉' : imposterRevealed ? '🕵️' : '🕵️'}</p>
          <p className="font-display text-3xl text-white">
            {impCaught ? 'IMPOSTER CAUGHT!' : imposterRevealed ? 'IMPOSTER WON!' : 'IMPOSTER ESCAPED!'}
          </p>
          <p className="text-white/50 font-body text-sm mt-1">
            Imposters: {(impIdxs || []).map(i => room.players[i]?.name).join(' & ')}
          </p>
        </div>

        {/* Answer */}
        {round && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4 text-center">
            <p className="text-white/40 text-xs tracking-[0.3em] font-body mb-1">THE ANSWER WAS</p>
            <p className="font-display text-3xl text-white mb-1">{round.n}</p>
            <p className="text-white/40 font-body text-sm">{round.d}{round.y && round.c === 'Movie' ? ` · ${round.y}` : ''}</p>
          </div>
        )}

        {/* Scores */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-3 mb-4">
          <p className="text-white/40 text-xs tracking-[0.2em] font-body font-bold mb-2">SCORES</p>
          {[...room.players]
            .map((p, i) => ({ p, i }))
            .filter(({ p }) => p.name && !p.removed)
            .sort((a, b) => b.p.score - a.p.score)
            .map(({ p, i }, rank) => (
              <div key={i} className="flex items-center gap-2 py-1.5">
                <span className="text-white/30 font-body text-xs w-4">#{rank + 1}</span>
                <Avatar idx={i} size="sm" />
                <span className="flex-1 text-white font-body text-sm">
                  {p.name} {(impIdxs || []).includes(i) && <span className="text-red-400 text-xs">🕵️</span>}
                </span>
                <span className="font-display text-lg text-white">{p.score}pt</span>
              </div>
            ))}
        </div>

        {isHost && (
          isLastRound ? (
            <Btn onClick={goLeaderboard}>FINAL LEADERBOARD 🏆</Btn>
          ) : (
            <Btn onClick={() => { setLoading(true); nextRound(() => setLoading(false)); }} loading={loading}>
              NEXT ROUND →
            </Btn>
          )
        )}
        {!isHost && <p className="text-white/30 font-body text-sm text-center">Waiting for host…</p>}
      </div>
    </Screen>
  );
}

// ── LEADERBOARD ───────────────────────────────────────────
export function LeaderboardScreen() {
  const { room, myIdx, playAgain } = useGame();
  if (!room) return null;

  const isHost = myIdx === 0;
  const medals = ['🥇', '🥈', '🥉'];
  const sorted = [...room.players]
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => p.name && !p.removed)
    .sort((a, b) => b.p.score - a.p.score);

  return (
    <Screen>
      <div className="w-full max-w-sm animate-fade-up">
        <p className="text-white/40 text-xs tracking-[0.5em] font-body mb-2 text-center">GAME OVER</p>
        <h1 className="font-display text-5xl text-center tracking-widest bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-6">
          LEADERBOARD
        </h1>

        <div className="flex flex-col gap-2 mb-6">
          {sorted.map(({ p, i }, rank) => (
            <div key={i}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 border ${rank === 0 ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-500/40' : 'bg-white/5 border-white/10'}`}>
              <span className="text-xl w-7">{medals[rank] || `#${rank + 1}`}</span>
              <Avatar idx={i} size="sm" />
              <span className={`flex-1 font-body ${rank === 0 ? 'text-white font-bold' : 'text-white/70'}`}>{p.name}</span>
              <span className={`font-display text-2xl ${rank === 0 ? 'text-pink-400' : 'text-white/60'}`}>{p.score}pt</span>
            </div>
          ))}
        </div>

        {isHost && <Btn onClick={playAgain}>PLAY AGAIN 🎬</Btn>}
        {!isHost && <p className="text-white/30 font-body text-sm text-center">Waiting for host to start again…</p>}
      </div>
    </Screen>
  );
}
