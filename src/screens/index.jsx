import { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { Screen, Btn, Input, Label, Avatar, PlayerRow, Chip, SectionCard, BackBtn, Divider, LoadingDots, COLORS, EMOJIS } from '../components/ui';

const LANGS = ['Tamil','Telugu','Hindi','Malayalam','English'];
const CATS  = [
  { key: 'Movies',    icon: '🎬', color: 'linear-gradient(135deg,#E91E63,#9C27B0)' },
  { key: 'Foods',     icon: '🍛', color: 'linear-gradient(135deg,#FF6B35,#F7931E)' },
  { key: 'Locations', icon: '📍', color: 'linear-gradient(135deg,#00B09B,#96C93D)' },
];

// ── HOME ──────────────────────────────────────────────────
export function HomeScreen() {
  const { createRoom, joinRoom, error } = useGame();
  const [view, setView] = useState('home');
  const [hostName, setHostName] = useState('');
  const [joinName, setJoinName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [cfg, setCfg] = useState({ rounds: 5, langs: ['Tamil'], cats: ['Movies','Foods','Locations'] });
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  function toggleLang(l) {
    setCfg(c => ({ ...c, langs: c.langs.includes(l) ? (c.langs.length > 1 ? c.langs.filter(x=>x!==l) : c.langs) : [...c.langs, l] }));
  }
  function toggleCat(cat) {
    setCfg(c => ({ ...c, cats: c.cats.includes(cat) ? (c.cats.length > 1 ? c.cats.filter(x=>x!==cat) : c.cats) : [...c.cats, cat] }));
  }

  function handleCreate() {
    if (!hostName.trim()) return setLocalError('Enter your name');
    setLoading(true); setLocalError('');
    createRoom(hostName.trim(), cfg, () => setLoading(false));
  }
  function handleJoin() {
    if (!joinName.trim()) return setLocalError('Enter your name');
    if (joinCode.length !== 4) return setLocalError('Enter a 4-letter room code');
    setLoading(true); setLocalError('');
    joinRoom(joinCode, joinName.trim(), () => setLoading(false));
  }

  // ── HOST SETUP ──────────────────────────────────────────
  if (view === 'host') return (
    <Screen>
      <div className="w-full max-w-sm pt-2 animate-fade-up">
        <BackBtn onClick={() => setView('home')} />
        <p className="text-xs tracking-[0.4em] mb-1 font-body font-bold" style={{color:'rgba(233,30,99,0.8)'}}>CREATE ROOM</p>
        <h1 className="font-display text-5xl mb-6 gradient-text">HOST A GAME</h1>

        <Label>YOUR NAME</Label>
        <Input value={hostName} onChange={setHostName} placeholder="Enter your name" maxLength={12} className="mb-4" autoFocus onEnter={handleCreate} />

        <Label>MOVIE LANGUAGES</Label>
        <div className="flex flex-wrap gap-2 mb-4">
          {LANGS.map(l => <Chip key={l} label={l} active={cfg.langs.includes(l)} onClick={() => toggleLang(l)} />)}
        </div>

        <Label>CATEGORIES</Label>
        <div className="flex flex-wrap gap-2 mb-4">
          {CATS.map(c => <Chip key={c.key} label={`${c.icon} ${c.key}`} active={cfg.cats.includes(c.key)} onClick={() => toggleCat(c.key)} color={c.color} />)}
        </div>

        <Label>ROUNDS</Label>
        <div className="flex gap-2 mb-6">
          {[3,4,5,6,7,8].map(r => (
            <button key={r} onClick={() => setCfg(c=>({...c,rounds:r}))}
              className="btn-press w-11 h-11 rounded-xl font-body font-bold text-sm transition-all"
              style={{ background: cfg.rounds===r ? 'linear-gradient(135deg,#E91E63,#9C27B0)' : 'rgba(255,255,255,0.06)', color: cfg.rounds===r ? 'white' : 'rgba(255,255,255,0.5)', border: `1px solid ${cfg.rounds===r ? 'transparent' : 'rgba(255,255,255,0.1)'}` }}>
              {r}
            </button>
          ))}
        </div>

        {(localError || error) && <p className="text-red-400 text-sm font-body mb-3 text-center">⚠️ {localError || error}</p>}
        <Btn onClick={handleCreate} disabled={!hostName.trim()} loading={loading}>CREATE ROOM 🎬</Btn>
      </div>
    </Screen>
  );

  // ── JOIN ────────────────────────────────────────────────
  if (view === 'join') return (
    <Screen>
      <div className="w-full max-w-sm pt-2 animate-fade-up">
        <BackBtn onClick={() => setView('home')} />
        <p className="text-xs tracking-[0.4em] mb-1 font-body font-bold" style={{color:'rgba(233,30,99,0.8)'}}>JOIN ROOM</p>
        <h1 className="font-display text-5xl mb-6 gradient-text">JOIN A GAME</h1>

        <Label>YOUR NAME</Label>
        <Input value={joinName} onChange={setJoinName} placeholder="Enter your name" maxLength={12} className="mb-4" autoFocus />

        <Label>ROOM CODE</Label>
        <Input value={joinCode} onChange={setJoinCode} placeholder="ABCD" maxLength={4} uppercase className="mb-6" onEnter={handleJoin} />

        {(localError || error) && <p className="text-red-400 text-sm font-body mb-3 text-center">⚠️ {localError || error}</p>}
        <Btn onClick={handleJoin} disabled={!joinName.trim() || joinCode.length!==4} loading={loading}>JOIN GAME 🎮</Btn>
      </div>
    </Screen>
  );

  // ── HOME ────────────────────────────────────────────────
  return (
    <Screen center>
      <div className="w-full max-w-sm text-center" style={{position:'relative'}}>
        {/* Floating question marks */}
        {['10%','25%','70%','85%'].map((l,i) => (
          <div key={i} style={{
            position:'absolute', left:l, bottom:0,
            fontFamily:'Bebas Neue, sans-serif',
            fontSize:[24,18,20,14][i],
            color:'rgba(233,30,99,0.12)',
            animation:`floatQ ${[5,7,6,8][i]}s linear ${[0,1.5,0.8,2.5][i]}s infinite`,
            pointerEvents:'none', userSelect:'none',
          }}>?</div>
        ))}

        {/* Spy icon with rings */}
        <div style={{position:'relative', width:120, height:120, margin:'0 auto 16px', animation:'iconEntrance 1s cubic-bezier(0.34,1.56,0.64,1) 0.3s both'}}>
          {[{inset:-16,border:'1px solid rgba(233,30,99,0.15)',delay:'1s'},{inset:-8,border:'1px solid rgba(156,39,176,0.3)',delay:'0.5s'},{inset:0,border:'2px solid rgba(233,30,99,0.5)',delay:'0s'}].map((r,i) => (
            <div key={i} style={{
              position:'absolute', inset:r.inset, borderRadius:'50%', border:r.border,
              animation:`ringPulse 2s ease-in-out ${r.delay} infinite`,
            }}/>
          ))}
          <div style={{
            width:120, height:120, borderRadius:'50%',
            background:'linear-gradient(135deg,#1a0533,#2d0a5e)',
            border:'2px solid rgba(233,30,99,0.6)',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 0 40px rgba(233,30,99,0.3), inset 0 0 30px rgba(156,39,176,0.2)',
            fontSize:'3.5rem',
            animation:'spyBlink 4s ease-in-out infinite',
          }}>🕵️</div>
        </div>

        {/* Title */}
        <div style={{animation:'titleEntrance 0.8s ease 0.8s both'}}>
          <h1 style={{
            fontFamily:"'Bebas Neue', 'Arial Black', sans-serif",
            fontSize:72, letterSpacing:8, lineHeight:1,
            background:'linear-gradient(135deg,#ff6b9d 0%,#ffffff 40%,#c44dff 70%,#ff6b9d 100%)',
            backgroundSize:'300% auto',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
            animation:'shimmerText 4s linear infinite',
            filter:'drop-shadow(0 0 20px rgba(233,30,99,0.4))',
          }}>IMPOSTER</h1>
          <div style={{
            display:'inline-flex', alignItems:'center', gap:6,
            marginTop:6, padding:'4px 16px', borderRadius:20,
            border:'1px solid rgba(156,39,176,0.4)', background:'rgba(156,39,176,0.1)',
          }}>
            <span style={{fontFamily:"'DM Sans',sans-serif", fontSize:13, fontWeight:700, letterSpacing:6, color:'rgba(196,77,255,0.9)', textTransform:'uppercase'}}>India Edition</span>
          </div>
        </div>

        {/* Film strip */}
        <div style={{display:'flex', gap:0, margin:'14px auto 0', width:240, height:6, borderRadius:3, overflow:'hidden', animation:'titleEntrance 0.8s ease 1.1s both'}}>
          {['#E91E63','#9C27B0','#3F51B5','#E91E63','#9C27B0','#3F51B5','#E91E63','#9C27B0'].map((c,i) => (
            <div key={i} style={{flex:1, height:'100%', background:c, animation:`filmAnim 2s ease-in-out ${i*0.2}s infinite`}}/>
          ))}
        </div>

        {/* Categories */}
        <div style={{display:'flex', gap:8, justifyContent:'center', marginTop:10, marginBottom:28, animation:'titleEntrance 0.8s ease 1.2s both'}}>
          {['🎬 Movies','🍛 Food','📍 Locations'].map((c,i) => (
            <span key={i} style={{fontSize:11, fontFamily:"'DM Sans',sans-serif", fontWeight:600, letterSpacing:1, color:'rgba(255,255,255,0.35)', textTransform:'uppercase'}}>{i>0 && <span style={{marginRight:8, color:'rgba(255,255,255,0.15)'}}>·</span>}{c}</span>
          ))}
        </div>

        <div className="flex flex-col gap-3 animate-fade-up delay-300">
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

  return (
    <Screen>
      <div className="w-full max-w-sm pt-2 animate-fade-up">
        {/* Room code */}
        <div className="text-center mb-6">
          <p className="text-xs tracking-[0.4em] font-body font-bold mb-1" style={{color:'rgba(255,255,255,0.35)'}}>ROOM CODE</p>
          <div className="font-display text-6xl tracking-[0.3em] gradient-text mb-1">{room.code}</div>
          <p className="text-xs font-body" style={{color:'rgba(255,255,255,0.25)'}}>Share this code with friends</p>
        </div>

        {/* Players */}
        <SectionCard>
          <div className="flex items-center justify-between mb-3">
            <Label className="mb-0">PLAYERS</Label>
            <span className="text-xs font-body" style={{color:'rgba(255,255,255,0.35)'}}>{filled.length} joined</span>
          </div>
          <div className="flex flex-col gap-2">
            {room.players.map((p, i) => p.name && !p.removed && (
              <PlayerRow key={i} player={p} idx={i} isHost={i===0} isMe={i===myIdx}
                onRemove={isHost && i!==0 && i!==myIdx ? () => removePlayer(i) : null} />
            ))}
            {filled.length < 12 && (
              <div className="flex items-center gap-2 py-1">
                <LoadingDots color="rgba(255,255,255,0.2)" />
                <span className="text-xs font-body" style={{color:'rgba(255,255,255,0.2)'}}>Waiting for players…</span>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Config */}
        <SectionCard>
          <div className="flex flex-wrap gap-3 text-xs font-body" style={{color:'rgba(255,255,255,0.4)'}}>
            <span>🌐 {room.cfg.langs.slice(0,2).join(', ')}{room.cfg.langs.length>2?` +${room.cfg.langs.length-2}`:''}</span>
            <span>🎯 {room.cfg.cats.join(', ')}</span>
            <span>🔄 {room.cfg.rounds} rounds</span>
          </div>
        </SectionCard>

        {(error) && <p className="text-red-400 text-sm font-body mb-3 text-center">⚠️ {error}</p>}

        {isHost ? (
          <>
            <Btn onClick={() => { setLoading(true); startGame(res => { setLoading(false); if(res&&!res.ok) alert(res.error); }); }}
              disabled={!canStart} loading={loading}>
              START GAME 🎬
            </Btn>
            {!canStart && <p className="text-center text-xs font-body mt-2" style={{color:'rgba(255,255,255,0.3)'}}>Need at least 3 players ({filled.length} joined)</p>}
          </>
        ) : (
          <div className="text-center py-6">
            <LoadingDots />
            <p className="text-sm font-body mt-3" style={{color:'rgba(255,255,255,0.35)'}}>Waiting for host to start…</p>
          </div>
        )}
      </div>
    </Screen>
  );
}

// ── PLAYING (ROLE REVEAL) ─────────────────────────────────
export function PlayingScreen() {
  const { room, myIdx, myRole, moveToSpinner } = useGame();
  const [flipped, setFlipped] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => { setFlipped(false); setShowContent(false); }, [room?.roundNum]);

  if (!room || !myRole) return <Screen center><LoadingDots /></Screen>;

  const { isImp, round, resolvedClue, locList } = myRole;
  const isHost = myIdx === 0;
  const color = COLORS[myIdx % COLORS.length];
  const playerName = room.players[myIdx]?.name || '';

  function handleFlip() {
    if (flipped) return;
    setFlipped(true);
    setTimeout(() => setShowContent(true), 350);
  }

  return (
    <Screen>
      <div className="w-full max-w-sm pt-4 animate-fade-up">
        {/* Player identity */}
        <div className="flex flex-col items-center mb-6">
          <Avatar idx={myIdx} size="lg" pulse />
          <p className="font-display text-2xl mt-3 tracking-widest" style={{color}}>{playerName}</p>
          <p className="text-xs font-body mt-1" style={{color:'rgba(255,255,255,0.3)'}}>Round {room.roundNum} of {room.totalRounds}</p>
        </div>

        {/* Flip card */}
        <div className="flip-container w-full mb-4" style={{height: flipped ? 'auto' : 220}}>
          <div className={`flip-inner w-full ${flipped ? 'flipped' : ''}`} style={{minHeight:220}}>

            {/* Front — tap to reveal */}
            <div className="flip-front absolute inset-0 w-full rounded-3xl flex flex-col items-center justify-center cursor-pointer btn-press"
              style={{background:'linear-gradient(135deg, rgba(233,30,99,0.15), rgba(156,39,176,0.15))', border:'2px dashed rgba(255,255,255,0.15)', minHeight:220}}
              onClick={handleFlip}>
              <div style={{fontSize:'3.5rem', animation:'float 2s ease-in-out infinite'}}>🎬</div>
              <p className="text-sm font-body mt-3 tracking-widest" style={{color:'rgba(255,255,255,0.4)'}}>TAP TO REVEAL</p>
              <p className="text-xs font-body mt-1" style={{color:'rgba(255,255,255,0.2)'}}>Make sure only you can see!</p>
            </div>

            {/* Back — role revealed */}
            <div className="flip-back w-full">
              {showContent && (
                <div className="animate-scale-in">
                  {isImp ? (
                    // IMPOSTER
                    <div className="rounded-3xl p-5 scanlines relative overflow-hidden"
                      style={{background:'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(220,38,38,0.1))', border:'2px solid rgba(239,68,68,0.5)', boxShadow:'0 0 40px rgba(239,68,68,0.2)'}}>
                      <div className="text-center mb-4">
                        <div style={{fontSize:'3rem', marginBottom:8}}>🕵️</div>
                        <p className="text-xs tracking-[0.4em] font-body font-bold mb-1" style={{color:'rgba(239,68,68,0.8)'}}>YOU ARE THE</p>
                        <p className="font-display text-5xl" style={{color:'#ef4444', textShadow:'0 0 20px rgba(239,68,68,0.5)'}}>IMPOSTER</p>
                      </div>
                      {round.c === 'Location' ? (
                        <div className="rounded-2xl p-3 text-center" style={{background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)'}}>
                          <p className="text-sm font-body" style={{color:'rgba(255,255,255,0.7)'}}>You don't know the location!</p>
                          <p className="text-xs font-body mt-1" style={{color:'rgba(255,255,255,0.4)'}}>Ask clever questions and blend in</p>
                        </div>
                      ) : (
                        <div className="rounded-2xl p-3" style={{background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)'}}>
                          <p className="text-xs tracking-widest font-body font-bold mb-2" style={{color:'rgba(239,68,68,0.7)'}}>YOUR CLUE</p>
                          <p className="text-xs font-body mb-1" style={{color:'rgba(255,255,255,0.4)'}}>{resolvedClue?.label}</p>
                          <p className="font-body font-bold text-white">{resolvedClue?.value || '—'}</p>
                          <p className="text-xs font-body mt-2" style={{color:'rgba(255,255,255,0.3)'}}>Bluff — you don't know the exact name!</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    // CREWMATE
                    <div className="rounded-3xl p-5 scanlines relative overflow-hidden"
                      style={{background:`linear-gradient(135deg, ${color}22, ${color}11)`, border:`2px solid ${color}55`, boxShadow:`0 0 40px ${color}20`}}>
                      <div className="text-center mb-4">
                        <p className="text-xs tracking-[0.35em] font-body font-bold mb-2" style={{color:`${color}cc`}}>
                          {round.c==='Location' ? 'THE LOCATION IS' : round.c==='Food' ? 'THE FOOD IS' : 'THE MOVIE IS'}
                        </p>
                        <p className="font-display text-4xl mb-1" style={{color, textShadow:`0 0 20px ${color}60`}}>{round.n}</p>
                        <p className="font-body text-sm" style={{color:'rgba(255,255,255,0.5)'}}>{round.d}</p>
                        {round.c==='Location' && (
                          <div className="inline-block px-3 py-1 rounded-full mt-2 text-xs font-bold font-body"
                            style={{background:`${color}22`, color}}>
                            Your role: {round.d}
                          </div>
                        )}
                      </div>
                      <div className="rounded-2xl p-3 text-center text-xs font-body" style={{background:'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.4)'}}>
                        {round.c==='Location' ? '💡 Your location is highlighted in the list below' : '💡 Discuss — never say the name directly!'}
                      </div>
                    </div>
                  )}

                  {/* Location list */}
                  {locList && locList.length > 0 && (
                    <div className="mt-3 rounded-2xl p-3" style={{background:'rgba(0,176,155,0.08)', border:'1px solid rgba(0,176,155,0.2)'}}>
                      <p className="text-xs tracking-widest font-body font-bold mb-2" style={{color:'rgba(0,176,155,0.8)'}}>📍 POSSIBLE LOCATIONS</p>
                      <div className="flex flex-wrap gap-1.5">
                        {locList.map(loc => (
                          <span key={loc} className="px-2 py-1 rounded-lg text-xs font-body font-semibold"
                            style={!isImp && loc===round.n
                              ? {background:'#00B09B', color:'white', boxShadow:'0 2px 8px rgba(0,176,155,0.4)'}
                              : {background:'rgba(0,176,155,0.12)', color:'rgba(0,176,155,0.8)', border:'1px solid rgba(0,176,155,0.2)'}}>
                            {loc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action */}
                  <div className="mt-4">
                    {isHost ? (
                      <Btn onClick={moveToSpinner}>SPIN THE WHEEL 🎡</Btn>
                    ) : (
                      <div className="text-center py-3">
                        <LoadingDots />
                        <p className="text-xs font-body mt-2" style={{color:'rgba(255,255,255,0.3)'}}>Waiting for host to spin…</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Screen>
  );
}

// ── SPINNER ───────────────────────────────────────────────
export function SpinnerScreen() {
  const { room, myIdx, moveToDiscuss } = useGame();
  const [done, setDone] = useState(false);
  const wheelRef = useRef(null);
  const spunRef = useRef(false);

  useEffect(() => { setDone(false); spunRef.current = false; }, [room?.spinnerSeed]);

  if (!room) return null;

  const isHost = myIdx === 0;
  const players = room.players.filter(p => p.name && !p.removed);
  const n = players.length;
  const seed = room.spinnerSeed;
  const firstPlayer = room.players[room.firstIdx];
  const firstColor = COLORS[room.firstIdx % COLORS.length];
  const isFirstMe = myIdx === room.firstIdx;

  const segColors = ['#E91E63','#9C27B0','#3F51B5','#00BFA5','#FF5722','#FFB800','#2196F3','#4CAF50','#FF4081','#7C4DFF'];
  const deg = 360 / n;
  const gradient = `conic-gradient(${players.map((_,i)=>`${segColors[i%segColors.length]} ${i*deg}deg ${(i+1)*deg}deg`).join(',')})`;

  const filledPos = room.players.slice(0, room.firstIdx+1).filter(p=>p.name&&!p.removed).length - 1;
  const totalRotation = (5+(seed%8))*360 + (360-(filledPos*deg+deg/2));

  useEffect(() => {
    if (wheelRef.current && !spunRef.current) {
      spunRef.current = true;
      setTimeout(() => {
        if (wheelRef.current) {
          wheelRef.current.style.transition = 'transform 4s cubic-bezier(0.17,0.67,0.12,1)';
          wheelRef.current.style.transform = `rotate(${totalRotation}deg)`;
          setTimeout(() => setDone(true), 4300);
        }
      }, 400);
    }
  }, [totalRotation]);

  return (
    <Screen center>
      <div className="w-full max-w-sm text-center animate-fade-up">
        <p className="text-xs tracking-[0.4em] font-body font-bold mb-6" style={{color:'rgba(255,255,255,0.3)'}}>
          ROUND {room.roundNum} / {room.totalRounds} — WHO SPEAKS FIRST?
        </p>

        {/* Wheel */}
        <div className="relative mx-auto mb-6" style={{width:240, height:240}}>
          {/* Arrow */}
          <div className="absolute z-10" style={{top:-16,left:'50%',transform:'translateX(-50%)',fontSize:'2rem',filter:'drop-shadow(0 2px 8px rgba(233,30,99,0.8))'}}>▼</div>
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-full" style={{boxShadow:'0 0 60px rgba(233,30,99,0.3), 0 0 0 4px rgba(255,255,255,0.08)'}} />
          {/* Wheel */}
          <div ref={wheelRef} className="w-full h-full rounded-full relative overflow-hidden"
            style={{background:gradient, boxShadow:'0 0 40px rgba(0,0,0,0.5)'}}>
            {/* Labels */}
            {players.map((p, i) => {
              const angle = i*deg + deg/2;
              const rad = (angle-90)*Math.PI/180;
              const tx = 50 + 36*Math.cos(rad);
              const ty = 50 + 36*Math.sin(rad);
              return (
                <div key={i} style={{
                  position:'absolute', left:`${tx}%`, top:`${ty}%`,
                  transform:`translate(-50%,-50%) rotate(${angle}deg)`,
                  fontSize: Math.max(8, Math.floor(22/n)),
                  color:'white', fontWeight:700,
                  textShadow:'0 1px 4px rgba(0,0,0,0.8)',
                  whiteSpace:'nowrap', maxWidth:60,
                  overflow:'hidden', textOverflow:'ellipsis',
                  pointerEvents:'none',
                  fontFamily:'DM Sans, sans-serif',
                }}>
                  {p.name.split(' ')[0]}
                </div>
              );
            })}
            {/* Center */}
            <div className="absolute" style={{top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:40,height:40,borderRadius:'50%',background:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.2rem',boxShadow:'0 0 0 4px rgba(233,30,99,0.4)', zIndex:5}}>🎬</div>
          </div>
        </div>

        {/* Result */}
        {done && firstPlayer && (
          <div className="animate-scale-in">
            <p className="text-xs tracking-[0.3em] font-body font-bold mb-2" style={{color:'rgba(255,255,255,0.35)'}}>SPEAKS FIRST THIS ROUND</p>
            <div className="flex items-center justify-center gap-3 mb-4">
              <Avatar idx={room.firstIdx} size="md" pulse />
              <p className="font-display text-4xl" style={{color:firstColor}}>{firstPlayer.name}</p>
              {isFirstMe && <span className="px-2 py-1 rounded-full text-xs font-bold" style={{background:'#E91E63',color:'white'}}>YOU!</span>}
            </div>
            {isHost ? (
              <Btn onClick={moveToDiscuss}>START DISCUSSION 💬</Btn>
            ) : (
              <div className="py-3">
                <LoadingDots />
                <p className="text-xs font-body mt-2" style={{color:'rgba(255,255,255,0.3)'}}>Waiting for host…</p>
              </div>
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
      <div className="w-full max-w-sm pt-2 animate-fade-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs tracking-[0.4em] font-body font-bold" style={{color:'rgba(233,30,99,0.7)'}}>DISCUSSION</p>
            <p className="font-display text-3xl text-white">FIND THE IMPOSTER</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-body" style={{color:'rgba(255,255,255,0.3)'}}>Round</p>
            <p className="font-display text-2xl" style={{color:'rgba(255,255,255,0.6)'}}>{room.roundNum}/{room.totalRounds}</p>
          </div>
        </div>

        {/* First speaker */}
        <div className="rounded-2xl p-3 mb-3 flex items-center gap-3"
          style={{background:`${firstColor}15`, border:`1px solid ${firstColor}40`}}>
          <Avatar idx={room.firstIdx} size="sm" />
          <div>
            <p className="text-xs font-body" style={{color:'rgba(255,255,255,0.4)'}}>SPEAKS FIRST</p>
            <p className="font-display text-xl" style={{color:firstColor}}>
              {firstPlayer?.name}
              {isFirst && <span className="ml-2 px-2 py-0.5 rounded-full text-xs" style={{background:'#E91E63',color:'white',fontFamily:'DM Sans'}}>YOU!</span>}
            </p>
          </div>
        </div>

        {/* Rules */}
        <SectionCard>
          <div className="flex flex-col gap-1.5 text-sm font-body" style={{color:'rgba(255,255,255,0.5)'}}>
            <p>🗣 Talk about it — never say the name</p>
            <p>🔍 Watch who seems vague or unsure</p>
            {round?.c === 'Location' && <p>📍 Imposter doesn't know the location!</p>}
          </div>
        </SectionCard>

        {/* Location list */}
        {locList && locList.length > 0 && (
          <div className="rounded-2xl p-3 mb-3" style={{background:'rgba(0,176,155,0.08)', border:'1px solid rgba(0,176,155,0.2)'}}>
            <p className="text-xs tracking-widest font-body font-bold mb-2" style={{color:'rgba(0,176,155,0.8)'}}>📍 POSSIBLE LOCATIONS</p>
            <div className="flex flex-wrap gap-1.5">
              {locList.map(loc => (
                <span key={loc} className="px-2 py-1 rounded-lg text-xs font-body font-semibold"
                  style={!myRole.isImp && loc===round?.n
                    ? {background:'#00B09B',color:'white'}
                    : {background:'rgba(0,176,155,0.12)',color:'rgba(0,176,155,0.8)',border:'1px solid rgba(0,176,155,0.2)'}}>
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
          <div className="text-center py-4">
            <p className="text-sm font-body" style={{color:'rgba(255,255,255,0.3)'}}>Host controls voting</p>
          </div>
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
  const filledPlayers = room.players.filter(p => p.name && !p.removed);
  const voteCount = Object.keys(room.votes || {}).length;
  const allVoted = voteCount >= filledPlayers.length;

  function handleVote(idx) {
    if (myVote >= 0) return;
    setMyVote(idx);
    castVote(idx);
  }

  return (
    <Screen>
      <div className="w-full max-w-sm pt-2 animate-fade-up">
        <div className="text-center mb-6">
          <p className="text-xs tracking-[0.4em] font-body font-bold mb-1" style={{color:'rgba(233,30,99,0.7)'}}>VOTING TIME</p>
          <h1 className="font-display text-5xl text-white mb-1">VOTE NOW</h1>
          <p className="text-sm font-body" style={{color:'rgba(255,255,255,0.35)'}}>Who is the imposter?</p>
        </div>

        {/* Vote progress */}
        <div className="rounded-2xl p-3 mb-4 flex items-center gap-3" style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)'}}>
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{background:'rgba(255,255,255,0.1)'}}>
            <div className="h-full rounded-full transition-all duration-500" style={{width:`${(voteCount/filledPlayers.length)*100}%`,background:'linear-gradient(90deg,#E91E63,#9C27B0)'}} />
          </div>
          <p className="text-xs font-body font-bold" style={{color:'rgba(255,255,255,0.5)'}}>{voteCount}/{filledPlayers.length}</p>
        </div>

        {myVote >= 0 ? (
          <div className="rounded-2xl p-4 text-center mb-4" style={{background:'rgba(0,214,143,0.1)',border:'1px solid rgba(0,214,143,0.3)'}}>
            <p className="font-body font-bold" style={{color:'#00D68F'}}>✓ Voted for <strong>{room.players[myVote]?.name}</strong></p>
            <p className="text-xs font-body mt-1" style={{color:'rgba(255,255,255,0.3)'}}>Waiting for others…</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 mb-4">
            {room.players.map((p, i) => {
              if (!p.name || p.removed || i === myIdx) return null;
              const color = COLORS[i % COLORS.length];
              return (
                <button key={i} onClick={() => handleVote(i)}
                  className="btn-press flex items-center gap-3 rounded-2xl px-4 py-3.5 transition-all"
                  style={{background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)'}}>
                  <Avatar idx={i} size="sm" />
                  <span className="flex-1 font-body font-medium text-left text-white">{p.name}</span>
                  <span className="text-xs px-2 py-1 rounded-lg font-body" style={{background:`${color}22`,color}}>Vote →</span>
                </button>
              );
            })}
          </div>
        )}

        {isHost && (allVoted || voteCount > 0) && (
          <Btn onClick={lockVotes}>
            {allVoted ? 'SEE RESULT 🎬' : `LOCK VOTES (${voteCount} voted)`}
          </Btn>
        )}
      </div>
    </Screen>
  );
}

// ── RESULT ────────────────────────────────────────────────
export function ResultScreen() {
  const { room, myIdx, resultData, nextRound, goLeaderboard } = useGame();
  const [loading, setLoading] = useState(false);
  if (!room || !resultData) return <Screen center><LoadingDots /></Screen>;

  const isHost = myIdx === 0;
  const { impCaught, imposterRevealed, eliminatedIdx, impIdxs } = resultData;
  const round = room.round;
  const isLastRound = room.roundNum >= room.totalRounds;
  const isWin = impCaught;

  const sorted = [...room.players]
    .map((p,i) => ({p,i}))
    .filter(({p}) => p.name && !p.removed)
    .sort((a,b) => b.p.score - a.p.score);

  return (
    <Screen>
      <div className="w-full max-w-sm pt-2 animate-fade-up">
        {/* Banner */}
        <div className="rounded-3xl p-6 text-center mb-4 relative overflow-hidden"
          style={{
            background: isWin ? 'linear-gradient(135deg,rgba(0,214,143,0.2),rgba(0,176,155,0.1))' : 'linear-gradient(135deg,rgba(233,30,99,0.2),rgba(156,39,176,0.1))',
            border: `2px solid ${isWin ? 'rgba(0,214,143,0.4)' : 'rgba(233,30,99,0.4)'}`,
            boxShadow: `0 0 60px ${isWin ? 'rgba(0,214,143,0.15)' : 'rgba(233,30,99,0.15)'}`,
          }}>
          <div style={{fontSize:'3.5rem',marginBottom:8}}>{isWin?'🎉':imposterRevealed?'🕵️':'😈'}</div>
          <p className="font-display text-4xl text-white mb-2">
            {isWin ? 'CAUGHT!' : imposterRevealed ? 'IMPOSTER WON!' : 'ESCAPED!'}
          </p>
          <p className="font-body text-sm" style={{color:'rgba(255,255,255,0.5)'}}>
            Imposter{(impIdxs||[]).length>1?'s':''}: <strong style={{color:isWin?'#00D68F':'#E91E63'}}>
              {(impIdxs||[]).map(i=>room.players[i]?.name).join(' & ')}
            </strong>
          </p>
        </div>

        {/* Answer */}
        {round && (
          <SectionCard>
            <p className="text-xs tracking-[0.3em] font-body font-bold mb-2" style={{color:'rgba(255,255,255,0.35)'}}>THE ANSWER WAS</p>
            <p className="font-display text-3xl text-white mb-1">{round.n}</p>
            <p className="font-body text-sm" style={{color:'rgba(255,255,255,0.4)'}}>{round.d}{round.y&&round.c==='Movie'?` · ${round.y}`:''}</p>
          </SectionCard>
        )}

        {/* Scores */}
        <SectionCard>
          <Label>SCORES</Label>
          <div className="flex flex-col gap-2">
            {sorted.map(({p,i}, rank) => (
              <div key={i} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5"
                style={{background: rank===0?`${COLORS[i%COLORS.length]}18`:'rgba(255,255,255,0.03)', border:`1px solid ${rank===0?COLORS[i%COLORS.length]+'35':'rgba(255,255,255,0.06)'}`}}>
                <span className="text-lg w-7">{rank===0?'🥇':rank===1?'🥈':rank===2?'🥉':`#${rank+1}`}</span>
                <Avatar idx={i} size="xs" />
                <span className="flex-1 font-body text-sm" style={{color:'rgba(255,255,255,0.85)'}}>
                  {p.name} {(impIdxs||[]).includes(i)&&<span style={{color:'#ef4444'}}>🕵️</span>}
                </span>
                <span className="font-display text-xl" style={{color:COLORS[i%COLORS.length]}}>{p.score}pt</span>
              </div>
            ))}
          </div>
        </SectionCard>

        {isHost && (
          <Btn onClick={() => { setLoading(true); (isLastRound ? goLeaderboard : nextRound)(() => setLoading(false)); }} loading={loading}>
            {isLastRound ? 'FINAL LEADERBOARD 🏆' : 'NEXT ROUND →'}
          </Btn>
        )}
        {!isHost && <p className="text-center text-sm font-body py-3" style={{color:'rgba(255,255,255,0.3)'}}>Waiting for host…</p>}
      </div>
    </Screen>
  );
}

// ── LEADERBOARD ───────────────────────────────────────────
export function LeaderboardScreen() {
  const { room, myIdx, playAgain } = useGame();
  if (!room) return null;

  const isHost = myIdx === 0;
  const sorted = [...room.players]
    .map((p,i)=>({p,i}))
    .filter(({p})=>p.name&&!p.removed)
    .sort((a,b)=>b.p.score-a.p.score);

  const winner = sorted[0];
  const winnerColor = winner ? COLORS[winner.i % COLORS.length] : '#E91E63';

  return (
    <Screen>
      <div className="w-full max-w-sm pt-2 animate-fade-up">
        {/* Header */}
        <div className="text-center mb-6">
          <p className="text-xs tracking-[0.5em] font-body font-bold mb-1" style={{color:'rgba(255,255,255,0.3)'}}>GAME OVER</p>
          <h1 className="font-display text-6xl gradient-text">RESULTS</h1>
        </div>

        {/* Winner spotlight */}
        {winner && (
          <div className="rounded-3xl p-5 text-center mb-4 relative overflow-hidden"
            style={{background:`linear-gradient(135deg,${winnerColor}25,${winnerColor}10)`,border:`2px solid ${winnerColor}50`,boxShadow:`0 0 60px ${winnerColor}20`}}>
            <div className="animate-float" style={{fontSize:'3rem',marginBottom:8}}>🏆</div>
            <p className="text-xs tracking-[0.3em] font-body font-bold mb-1" style={{color:winnerColor}}>WINNER</p>
            <p className="font-display text-4xl mb-1" style={{color:'white'}}>{winner.p.name}</p>
            <p className="font-display text-2xl" style={{color:winnerColor}}>{winner.p.score} pts</p>
          </div>
        )}

        {/* Full ranking */}
        <SectionCard>
          <Label>FINAL STANDINGS</Label>
          <div className="flex flex-col gap-2">
            {sorted.map(({p,i},rank)=>(
              <div key={i} className="flex items-center gap-3 rounded-xl px-3 py-3"
                style={{background:rank===0?`${COLORS[i%COLORS.length]}18`:'rgba(255,255,255,0.03)',border:`1px solid ${rank===0?COLORS[i%COLORS.length]+'35':'rgba(255,255,255,0.06)'}`}}>
                <span className="text-xl w-8">{rank===0?'🥇':rank===1?'🥈':rank===2?'🥉':`#${rank+1}`}</span>
                <Avatar idx={i} size="sm" />
                <span className="flex-1 font-body font-medium" style={{color:rank===0?'white':'rgba(255,255,255,0.7)'}}>{p.name}</span>
                <span className="font-display text-2xl" style={{color:rank===0?COLORS[i%COLORS.length]:'rgba(255,255,255,0.5)'}}>{p.score}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        {isHost ? (
          <Btn onClick={playAgain} className="mt-2">PLAY AGAIN 🎬</Btn>
        ) : (
          <p className="text-center text-sm font-body py-3" style={{color:'rgba(255,255,255,0.3)'}}>Waiting for host to start again…</p>
        )}
      </div>
    </Screen>
  );
}
