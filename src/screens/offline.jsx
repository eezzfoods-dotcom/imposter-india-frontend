import { useState, useEffect, useRef } from 'react';
import { useOffline } from '../context/OfflineContext';
import { Screen, Btn, Input, Label, Avatar, PlayerRow, Chip, SectionCard, BackBtn, LoadingDots, COLORS, EMOJIS } from '../components/ui';

const LANGS = ['Tamil','Telugu','Hindi','Malayalam','English'];
const CATS  = ['Movies','Foods','Locations'];

// ── OFFLINE SETUP ─────────────────────────────────────────
export function OfflineSetupScreen({ onBack }) {
  const { startGame } = useOffline();
  const [names, setNames] = useState(['','','','']);
  const [cfg, setCfg] = useState({ rounds:5, langs:['Tamil'], cats:['Movies','Foods','Locations'] });
  const [newName, setNewName] = useState('');

  function addPlayer() {
    if(!newName.trim() || names.length >= 12) return;
    setNames([...names, newName.trim()]);
    setNewName('');
  }
  function removePlayer(i) {
    const n = names.filter((_,idx)=>idx!==i);
    setNames(n.length >= 3 ? n : n);
  }
  function toggleLang(l) { setCfg(c=>({...c,langs:c.langs.includes(l)?(c.langs.length>1?c.langs.filter(x=>x!==l):c.langs):[...c.langs,l]})); }
  function toggleCat(cat) { setCfg(c=>({...c,cats:c.cats.includes(cat)?(c.cats.length>1?c.cats.filter(x=>x!==cat):c.cats):[...c.cats,cat]})); }

  const filledNames = names.filter(n=>n.trim());
  const canStart = filledNames.length >= 3;

  return (
    <Screen>
      <div className="w-full max-w-sm pt-2 animate-fade-up">
        <BackBtn onClick={onBack}/>
        <p style={{fontSize:'0.7rem',letterSpacing:'0.4em',color:'rgba(0,212,255,0.6)',marginBottom:4,fontWeight:700}}>OFFLINE MODE</p>
        <h1 className="font-display" style={{fontSize:'2.8rem',letterSpacing:'0.06em',color:'white',marginBottom:20}}>PASS THE PHONE</h1>

        {/* Add players */}
        <Label>PLAYERS ({filledNames.length} / 12)</Label>
        <div style={{display:'flex',gap:8,marginBottom:12}}>
          <Input value={newName} onChange={setNewName} placeholder="Type name..." maxLength={12}
            className="flex-1" onEnter={addPlayer}/>
          <button onClick={addPlayer} className="btn-press rounded-xl px-4 font-body font-bold text-sm"
            style={{background:'linear-gradient(135deg,#0099CC,#00D4FF)',color:'#000814',flexShrink:0}}>
            + ADD
          </button>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:16}}>
          {names.map((n,i) => n.trim() ? (
            <PlayerRow key={i} player={{name:n}} idx={i} isMe={false}
              onRemove={filledNames.length>3?()=>removePlayer(i):null}/>
          ) : null)}
        </div>

        <Label>LANGUAGES</Label>
        <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:14}}>
          {LANGS.map(l=><Chip key={l} label={l} active={cfg.langs.includes(l)} onClick={()=>toggleLang(l)}/>)}
        </div>

        <Label>CATEGORIES</Label>
        <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:14}}>
          {CATS.map(c=><Chip key={c} label={c} active={cfg.cats.includes(c)} onClick={()=>toggleCat(c)}/>)}
        </div>

        <Label>ROUNDS</Label>
        <div style={{display:'flex',gap:8,marginBottom:24}}>
          {[3,4,5,6,7,8].map(r=>(
            <button key={r} onClick={()=>setCfg(c=>({...c,rounds:r}))} className="btn-press font-body font-bold text-sm"
              style={{width:40,height:40,borderRadius:8,background:cfg.rounds===r?'linear-gradient(135deg,#0099CC,#00D4FF)':'rgba(0,18,51,0.8)',color:cfg.rounds===r?'#000814':'rgba(0,212,255,0.5)',border:`1px solid ${cfg.rounds===r?'rgba(0,212,255,0.5)':'rgba(0,212,255,0.15)'}`}}>
              {r}
            </button>
          ))}
        </div>

        <Btn onClick={()=>startGame(filledNames,cfg)} disabled={!canStart}>START GAME ▶</Btn>
        {!canStart && <p style={{textAlign:'center',fontSize:'0.72rem',color:'rgba(0,212,255,0.3)',marginTop:8,fontFamily:"'DM Sans',sans-serif"}}>Need at least 3 players</p>}
      </div>
    </Screen>
  );
}

// ── PASS PHONE ────────────────────────────────────────────
export function OfflinePassScreen() {
  const { players, passOrder, passIdx, roundNum, totalRounds, showReveal } = useOffline();
  const playerIdx = passOrder[passIdx];
  const player = players[playerIdx];
  const color = COLORS[playerIdx % COLORS.length];

  return (
    <Screen center>
      <div className="w-full max-w-sm text-center animate-fade-up">
        <p style={{fontSize:'0.65rem',letterSpacing:'0.4em',color:'rgba(0,212,255,0.4)',marginBottom:20,fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>
          ROUND {roundNum} / {totalRounds} · PLAYER {passIdx+1} OF {players.length}
        </p>

        {/* Big avatar */}
        <div style={{position:'relative',width:120,height:120,margin:'0 auto 20px'}}>
          <div style={{position:'absolute',inset:-8,borderRadius:'50%',border:`1px solid ${color}30`,animation:'ringPulse 2s ease-in-out infinite'}}/>
          <div style={{width:120,height:120,borderRadius:'50%',background:`${color}15`,border:`3px solid ${color}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'3.5rem',boxShadow:`0 0 30px ${color}30`}}>
            {EMOJIS[playerIdx % EMOJIS.length]}
          </div>
        </div>

        <p style={{fontSize:'0.7rem',letterSpacing:'0.3em',color:'rgba(255,255,255,0.35)',marginBottom:6,fontFamily:"'DM Sans',sans-serif"}}>PASS PHONE TO</p>
        <p className="font-display" style={{fontSize:'3rem',letterSpacing:'0.08em',color,marginBottom:8,textShadow:`0 0 20px ${color}60`}}>{player}</p>
        <p style={{fontSize:'0.8rem',color:'rgba(255,255,255,0.25)',marginBottom:32,fontFamily:"'DM Sans',sans-serif"}}>Don't let others peek 👀</p>

        <Btn onClick={showReveal}>TAP TO SEE YOUR ROLE ▶</Btn>
      </div>
    </Screen>
  );
}

// ── ROLE REVEAL ───────────────────────────────────────────
export function OfflineRevealScreen() {
  const { players, passOrder, passIdx, impIdx, round, resolvedClue, locList, roundNum, totalRounds, nextPass, showSpinner } = useOffline();
  const [flipped, setFlipped] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const playerIdx = passOrder[passIdx];
  const isImp = playerIdx === impIdx;
  const isLastPlayer = passIdx >= players.length - 1;
  const color = COLORS[playerIdx % COLORS.length];

  function handleFlip() {
    if(flipped) return;
    setFlipped(true);
    setTimeout(()=>setShowContent(true), 350);
  }

  function handleDone() {
    if(isLastPlayer) showSpinner();
    else nextPass();
  }

  return (
    <Screen>
      <div className="w-full max-w-sm pt-4 animate-fade-up">
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',marginBottom:20}}>
          <Avatar idx={playerIdx} size="lg" pulse/>
          <p className="font-display" style={{fontSize:'1.8rem',marginTop:10,letterSpacing:'0.06em',color}}>{players[playerIdx]}</p>
          <p style={{fontSize:'0.7rem',color:'rgba(0,212,255,0.3)',marginTop:2,fontFamily:"'DM Sans',sans-serif"}}>Round {roundNum} of {totalRounds}</p>
        </div>

        <div className="flip-container w-full mb-4">
          <div className={`flip-inner w-full ${flipped?'flipped':''}`} style={{minHeight:180}}>
            {/* Front */}
            <div className="flip-front absolute inset-0 w-full rounded-xl flex flex-col items-center justify-center cursor-pointer btn-press"
              style={{background:'rgba(0,18,51,0.9)',border:'1px dashed rgba(0,212,255,0.25)',minHeight:180}}
              onClick={handleFlip}>
              <div style={{fontSize:'3rem',marginBottom:10}}>🎬</div>
              <p style={{fontSize:'0.75rem',letterSpacing:'0.15em',color:'rgba(0,212,255,0.4)',fontFamily:"'DM Sans',sans-serif"}}>TAP TO REVEAL YOUR ROLE</p>
            </div>

            {/* Back */}
            <div className="flip-back w-full">
              {showContent && (
                <div className="animate-scale-in">
                  {isImp ? (
                    <div className="rounded-xl p-5" style={{background:'rgba(255,60,120,0.12)',border:'1px solid rgba(255,60,120,0.4)'}}>
                      <div style={{textAlign:'center',marginBottom:12}}>
                        <div style={{fontSize:'2.5rem',marginBottom:4}}>🕵️</div>
                        <p style={{fontSize:'0.6rem',letterSpacing:'0.35em',color:'rgba(255,60,120,0.7)',marginBottom:2,fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>YOU ARE THE</p>
                        <p className="font-display" style={{fontSize:'2.8rem',color:'#FF3C78',textShadow:'0 0 20px rgba(255,60,120,0.5)'}}>IMPOSTER</p>
                      </div>
                      {round?.c==='Location' ? (
                        <div className="rounded-lg p-3 text-center" style={{background:'rgba(255,60,120,0.08)',border:'1px solid rgba(255,60,120,0.2)'}}>
                          <p style={{fontSize:'0.82rem',color:'rgba(255,255,255,0.7)',fontFamily:"'DM Sans',sans-serif"}}>You don't know the location!</p>
                          <p style={{fontSize:'0.72rem',color:'rgba(255,100,140,0.5)',marginTop:4,fontFamily:"'DM Sans',sans-serif"}}>Ask clever questions and blend in</p>
                        </div>
                      ) : (
                        <div className="rounded-lg p-3" style={{background:'rgba(255,60,120,0.08)',border:'1px solid rgba(255,60,120,0.2)'}}>
                          <p style={{fontSize:'0.6rem',letterSpacing:'0.2em',color:'rgba(255,60,120,0.6)',marginBottom:6,fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>YOUR CLUE</p>
                          <p style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.4)',fontFamily:"'DM Sans',sans-serif"}}>{resolvedClue?.label}</p>
                          <p style={{fontSize:'1rem',color:'white',fontWeight:700,fontFamily:"'DM Sans',sans-serif",marginTop:2}}>{resolvedClue?.value||'—'}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-xl p-5" style={{background:`${color}10`,border:`1px solid ${color}44`}}>
                      <div style={{textAlign:'center',marginBottom:12}}>
                        <p style={{fontSize:'0.6rem',letterSpacing:'0.3em',color:`${color}aa`,marginBottom:6,fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>
                          {round?.c==='Location'?'THE LOCATION IS':round?.c==='Food'?'THE FOOD IS':'THE MOVIE IS'}
                        </p>
                        <p className="font-display" style={{fontSize:'2rem',color,textShadow:`0 0 15px ${color}50`,marginBottom:4}}>{round?.n}</p>
                        <p style={{fontSize:'0.78rem',color:'rgba(255,255,255,0.4)',fontFamily:"'DM Sans',sans-serif"}}>{round?.d}</p>
                        {round?.c==='Location' && (
                          <div style={{display:'inline-block',padding:'3px 12px',borderRadius:4,marginTop:8,background:`${color}18`,color,fontSize:'0.72rem',fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>
                            Role: {round?.d}
                          </div>
                        )}
                      </div>
                      <div className="rounded-lg p-2 text-center" style={{background:'rgba(0,212,255,0.05)',border:'1px solid rgba(0,212,255,0.1)',fontSize:'0.7rem',color:'rgba(0,212,255,0.4)',fontFamily:"'DM Sans',sans-serif"}}>
                        {round?.c==='Location'?'💡 Your location highlighted below':'💡 Discuss — never say the name!'}
                      </div>
                    </div>
                  )}

                  {/* Location list */}
                  {locList && locList.length > 0 && (
                    <div className="mt-3 rounded-xl p-3" style={{background:'rgba(0,50,30,0.5)',border:'1px solid rgba(0,212,120,0.2)'}}>
                      <p style={{fontSize:'0.6rem',letterSpacing:'0.2em',color:'rgba(0,212,120,0.7)',marginBottom:8,fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>📍 POSSIBLE LOCATIONS</p>
                      <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                        {locList.map(loc=>(
                          <span key={loc} style={{padding:'3px 10px',borderRadius:4,fontSize:'0.72rem',fontFamily:"'DM Sans',sans-serif",fontWeight:600,...(!isImp&&loc===round?.n?{background:'#00D478',color:'#001a0a'}:{background:'rgba(0,212,120,0.1)',color:'rgba(0,212,120,0.7)',border:'1px solid rgba(0,212,120,0.2)'})}}>
                            {loc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{marginTop:14}}>
                    <Btn onClick={handleDone}>
                      {isLastPlayer ? 'SPIN THE WHEEL ◈' : 'PASS TO NEXT PLAYER ▶'}
                    </Btn>
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

// ── OFFLINE SPINNER ───────────────────────────────────────
export function OfflineSpinnerScreen() {
  const { players, firstIdx, spinnerSeed, roundNum, totalRounds, showDiscuss } = useOffline();
  const [done, setDone] = useState(false);
  const wheelRef = useRef(null);
  const spunRef = useRef(false);

  const n = players.length;
  const firstColor = COLORS[firstIdx % COLORS.length];
  const segColors = ['#00D4FF','#FF3C78','#00FF94','#FFB800','#C44DFF','#FF6B35','#00E5FF','#FF4081'];
  const deg = 360/n;
  const gradient = `conic-gradient(${players.map((_,i)=>`${segColors[i%segColors.length]} ${i*deg}deg ${(i+1)*deg}deg`).join(',')})`;
  const totalRotation = (5+(spinnerSeed%8))*360+(360-(firstIdx*deg+deg/2));

  useEffect(()=>{
    if(wheelRef.current&&!spunRef.current){
      spunRef.current=true;
      setTimeout(()=>{
        if(wheelRef.current){
          wheelRef.current.style.transition='transform 4s cubic-bezier(0.17,0.67,0.12,1)';
          wheelRef.current.style.transform=`rotate(${totalRotation}deg)`;
          setTimeout(()=>setDone(true),4300);
        }
      },400);
    }
  },[totalRotation]);

  return (
    <Screen center>
      <div className="w-full max-w-sm text-center animate-fade-up">
        <p style={{fontSize:'0.65rem',letterSpacing:'0.4em',color:'rgba(0,212,255,0.4)',marginBottom:20,fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>
          ROUND {roundNum} / {totalRounds} — WHO SPEAKS FIRST?
        </p>

        <div style={{position:'relative',width:240,height:240,margin:'0 auto 24px'}}>
          <div style={{position:'absolute',top:-18,left:'50%',transform:'translateX(-50%)',fontSize:'1.8rem',zIndex:10,filter:'drop-shadow(0 0 10px rgba(0,212,255,0.8))'}}>▼</div>
          <div style={{position:'absolute',inset:-6,borderRadius:'50%',border:'1px solid rgba(0,212,255,0.2)',animation:'ringPulse 2s ease-in-out infinite'}}/>
          <div ref={wheelRef} style={{width:240,height:240,borderRadius:'50%',background:gradient,border:'3px solid rgba(0,212,255,0.3)',boxShadow:'0 0 40px rgba(0,212,255,0.2)',position:'relative',overflow:'hidden'}}>
            {players.map((p,i)=>{
              const angle=i*deg+deg/2;
              const rad=(angle-90)*Math.PI/180;
              return(
                <div key={i} style={{position:'absolute',left:`${50+36*Math.cos(rad)}%`,top:`${50+36*Math.sin(rad)}%`,transform:`translate(-50%,-50%) rotate(${angle}deg)`,fontSize:Math.max(8,Math.floor(22/n)),color:'rgba(0,0,0,0.8)',fontWeight:700,whiteSpace:'nowrap',maxWidth:60,overflow:'hidden',textOverflow:'ellipsis',pointerEvents:'none',fontFamily:"'DM Sans',sans-serif"}}>
                  {p.split(' ')[0]}
                </div>
              );
            })}
            <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:40,height:40,borderRadius:'50%',background:'#000814',border:'2px solid rgba(0,212,255,0.6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.1rem',zIndex:5}}>🎬</div>
          </div>
        </div>

        {done && (
          <div className="animate-scale-in">
            <p style={{fontSize:'0.65rem',letterSpacing:'0.3em',color:'rgba(0,212,255,0.4)',marginBottom:10,fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>SPEAKS FIRST</p>
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:12,marginBottom:16}}>
              <Avatar idx={firstIdx} size="md" pulse/>
              <p className="font-display" style={{fontSize:'2.5rem',color:firstColor}}>{players[firstIdx]}</p>
            </div>
            <Btn onClick={showDiscuss}>START DISCUSSION ▶</Btn>
          </div>
        )}
      </div>
    </Screen>
  );
}

// ── OFFLINE DISCUSS ───────────────────────────────────────
export function OfflineDiscussScreen() {
  const { players, firstIdx, round, locList, roundNum, totalRounds, impIdx, showVote, imposterWon } = useOffline();
  const firstColor = COLORS[firstIdx % COLORS.length];

  return (
    <Screen>
      <div className="w-full max-w-sm pt-2 animate-fade-up">
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
          <div>
            <p style={{fontSize:'0.65rem',letterSpacing:'0.4em',color:'rgba(0,212,255,0.6)',fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>DISCUSSION</p>
            <p className="font-display" style={{fontSize:'2rem',color:'white',letterSpacing:'0.04em'}}>FIND THE IMPOSTER</p>
          </div>
          <p className="font-display" style={{fontSize:'1.5rem',color:'rgba(0,212,255,0.4)'}}>{roundNum}/{totalRounds}</p>
        </div>

        <div className="rounded-xl p-3 mb-3 flex items-center gap-3" style={{background:`${firstColor}10`,border:`1px solid ${firstColor}35`}}>
          <Avatar idx={firstIdx} size="sm"/>
          <div>
            <p style={{fontSize:'0.6rem',color:'rgba(255,255,255,0.35)',fontFamily:"'DM Sans',sans-serif"}}>SPEAKS FIRST</p>
            <p className="font-display" style={{fontSize:'1.3rem',color:firstColor}}>{players[firstIdx]}</p>
          </div>
        </div>

        <SectionCard>
          <div style={{display:'flex',flexDirection:'column',gap:6,fontSize:'0.8rem',color:'rgba(0,212,255,0.5)',fontFamily:"'DM Sans',sans-serif"}}>
            <p>◈ Talk about it — never say the name</p>
            <p>◈ Watch who seems vague or unsure</p>
            {round?.c==='Location'&&<p>◈ Imposter doesn't know the location!</p>}
          </div>
        </SectionCard>

        {locList&&locList.length>0&&(
          <div className="rounded-xl p-3 mb-3" style={{background:'rgba(0,50,30,0.5)',border:'1px solid rgba(0,212,120,0.2)'}}>
            <p style={{fontSize:'0.6rem',letterSpacing:'0.2em',color:'rgba(0,212,120,0.7)',marginBottom:8,fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>📍 POSSIBLE LOCATIONS</p>
            <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
              {locList.map(loc=>(
                <span key={loc} style={{padding:'3px 10px',borderRadius:4,fontSize:'0.72rem',fontFamily:"'DM Sans',sans-serif",fontWeight:600,background:'rgba(0,212,120,0.1)',color:'rgba(0,212,120,0.7)',border:'1px solid rgba(0,212,120,0.2)'}}>
                  {loc}
                </span>
              ))}
            </div>
          </div>
        )}

        <div style={{display:'flex',flexDirection:'column',gap:10,marginTop:8}}>
          <Btn onClick={showVote}>🗳 START VOTING ▶</Btn>
          <Btn onClick={imposterWon} variant="danger">🕵️ IMPOSTER REVEALED THE MOVIE</Btn>
        </div>
      </div>
    </Screen>
  );
}

// ── OFFLINE VOTE ──────────────────────────────────────────
export function OfflineVoteScreen() {
  const { players, votes, castVote, lockVotes } = useOffline();
  const voteCount = Object.keys(votes).length;
  const allVoted = voteCount >= players.length;

  return (
    <Screen>
      <div className="w-full max-w-sm pt-2 animate-fade-up">
        <div style={{textAlign:'center',marginBottom:20}}>
          <p style={{fontSize:'0.65rem',letterSpacing:'0.4em',color:'rgba(0,212,255,0.6)',marginBottom:4,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>VOTING TIME</p>
          <h1 className="font-display" style={{fontSize:'3.5rem',letterSpacing:'0.06em',color:'white'}}>VOTE NOW</h1>
        </div>

        {/* Progress */}
        <div className="rounded-xl p-3 mb-4 flex items-center gap-3" style={{background:'rgba(0,18,51,0.8)',border:'1px solid rgba(0,212,255,0.1)'}}>
          <div style={{flex:1,height:4,borderRadius:2,background:'rgba(0,212,255,0.1)',overflow:'hidden'}}>
            <div style={{height:'100%',borderRadius:2,background:'linear-gradient(90deg,#0099CC,#00D4FF)',width:`${(voteCount/players.length)*100}%`,transition:'width 0.5s'}}/>
          </div>
          <p style={{fontSize:'0.72rem',fontWeight:700,color:'rgba(0,212,255,0.5)',fontFamily:"'DM Sans',sans-serif",minWidth:36}}>{voteCount}/{players.length}</p>
        </div>

        <p style={{fontSize:'0.8rem',color:'rgba(0,212,255,0.4)',marginBottom:12,textAlign:'center',fontFamily:"'DM Sans',sans-serif"}}>Each player taps who they suspect</p>

        {players.map((voter,vi)=>{
          const hasVoted = votes[vi] !== undefined;
          return (
            <div key={vi} className="rounded-xl p-3 mb-3" style={{background:'rgba(0,18,51,0.8)',border:`1px solid ${hasVoted?'rgba(0,212,100,0.3)':'rgba(0,212,255,0.1)'}`}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:hasVoted?0:8}}>
                <Avatar idx={vi} size="xs"/>
                <span style={{fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:'0.85rem',color:hasVoted?'#00D478':'rgba(255,255,255,0.7)',flex:1}}>{voter}</span>
                {hasVoted && <span style={{fontSize:'0.7rem',color:'#00D478',fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>✓ Voted</span>}
              </div>
              {!hasVoted && (
                <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                  {players.map((suspect,si)=>{
                    if(si===vi) return null;
                    const color = COLORS[si%COLORS.length];
                    return(
                      <button key={si} onClick={()=>castVote(vi,si)}
                        className="btn-press flex items-center gap-2 rounded-lg px-3 py-2"
                        style={{background:`${color}12`,border:`1px solid ${color}35`,fontSize:'0.75rem',fontFamily:"'DM Sans',sans-serif",fontWeight:600,color}}>
                        {EMOJIS[si%EMOJIS.length]} {suspect}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {(allVoted || voteCount > 0) && (
          <Btn onClick={lockVotes} className="mt-2">
            {allVoted ? 'SEE RESULT ▶' : `LOCK VOTES (${voteCount}/${players.length})`}
          </Btn>
        )}
      </div>
    </Screen>
  );
}

// ── OFFLINE RESULT ────────────────────────────────────────
export function OfflineResultScreen() {
  const { players, scores, resultData, round, roundNum, totalRounds, nextRound, goLeaderboard } = useOffline();
  if(!resultData) return null;
  const { impCaught, imposterRevealed, impIdxs } = resultData;
  const isLastRound = roundNum >= totalRounds;
  const sorted = players.map((p,i)=>({p,i})).sort((a,b)=>scores[b.i]-scores[a.i]);

  return (
    <Screen>
      <div className="w-full max-w-sm pt-2 animate-fade-up">
        <div className="rounded-xl p-5 text-center mb-4"
          style={{background:impCaught?'rgba(0,212,100,0.1)':'rgba(255,60,120,0.1)',border:`1px solid ${impCaught?'rgba(0,212,100,0.35)':'rgba(255,60,120,0.35)'}`}}>
          <div style={{fontSize:'3rem',marginBottom:8}}>{impCaught?'🎉':imposterRevealed?'🕵️':'😈'}</div>
          <p className="font-display" style={{fontSize:'2.8rem',color:impCaught?'#00D478':'#FF3C78'}}>
            {impCaught?'CAUGHT!':imposterRevealed?'IMPOSTER WON!':'ESCAPED!'}
          </p>
          <p style={{fontSize:'0.8rem',color:'rgba(255,255,255,0.4)',marginTop:6,fontFamily:"'DM Sans',sans-serif"}}>
            Imposter: <strong style={{color:impCaught?'#00D478':'#FF3C78'}}>{(impIdxs||[]).map(i=>players[i]).join(' & ')}</strong>
          </p>
        </div>

        {round && (
          <SectionCard>
            <p style={{fontSize:'0.6rem',letterSpacing:'0.3em',color:'rgba(0,212,255,0.4)',marginBottom:8,fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>THE ANSWER WAS</p>
            <p className="font-display" style={{fontSize:'2rem',color:'white'}}>{round.n}</p>
            <p style={{fontSize:'0.8rem',color:'rgba(0,212,255,0.4)',fontFamily:"'DM Sans',sans-serif"}}>{round.d}{round.y&&round.c==='Movie'?` · ${round.y}`:''}</p>
          </SectionCard>
        )}

        <SectionCard>
          <Label>SCORES</Label>
          {sorted.map(({p,i},rank)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 12px',borderRadius:10,marginBottom:6,background:rank===0?`${COLORS[i%COLORS.length]}12`:'rgba(0,18,51,0.6)',border:`1px solid ${rank===0?COLORS[i%COLORS.length]+'30':'rgba(0,212,255,0.08)'}`}}>
              <span style={{fontSize:'1.1rem',width:28}}>{rank===0?'🥇':rank===1?'🥈':rank===2?'🥉':`#${rank+1}`}</span>
              <Avatar idx={i} size="xs"/>
              <span style={{flex:1,fontFamily:"'DM Sans',sans-serif",fontSize:'0.85rem',color:'rgba(255,255,255,0.8)'}}>{p}{(impIdxs||[]).includes(i)&&<span style={{color:'#FF3C78'}}> 🕵️</span>}</span>
              <span className="font-display" style={{fontSize:'1.3rem',color:COLORS[i%COLORS.length]}}>{scores[i]}pt</span>
            </div>
          ))}
        </SectionCard>

        <Btn onClick={isLastRound ? goLeaderboard : nextRound}>
          {isLastRound ? 'FINAL LEADERBOARD ▶' : 'NEXT ROUND ▶'}
        </Btn>
      </div>
    </Screen>
  );
}

// ── OFFLINE LEADERBOARD ───────────────────────────────────
export function OfflineLeaderboardScreen() {
  const { players, scores, reset } = useOffline();
  const sorted = players.map((p,i)=>({p,i})).sort((a,b)=>scores[b.i]-scores[a.i]);
  const winner = sorted[0];
  const winnerColor = winner ? COLORS[winner.i%COLORS.length] : '#00D4FF';

  return (
    <Screen>
      <div className="w-full max-w-sm pt-2 animate-fade-up">
        <div style={{textAlign:'center',marginBottom:20}}>
          <p style={{fontSize:'0.65rem',letterSpacing:'0.5em',color:'rgba(0,212,255,0.4)',marginBottom:4,fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>GAME OVER</p>
          <h1 className="font-display" style={{fontSize:'4rem',letterSpacing:'0.06em',color:'white'}}>RESULTS</h1>
        </div>

        {winner && (
          <div className="rounded-xl p-5 text-center mb-4"
            style={{background:`${winnerColor}10`,border:`1px solid ${winnerColor}40`,boxShadow:`0 0 40px ${winnerColor}15`}}>
            <div style={{fontSize:'2.5rem',marginBottom:8}}>🏆</div>
            <p style={{fontSize:'0.6rem',letterSpacing:'0.3em',color:`${winnerColor}99`,marginBottom:4,fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>WINNER</p>
            <p className="font-display" style={{fontSize:'2.5rem',color:'white'}}>{winner.p}</p>
            <p className="font-display" style={{fontSize:'1.8rem',color:winnerColor,marginTop:4}}>{scores[winner.i]} pts</p>
          </div>
        )}

        <SectionCard>
          <Label>FINAL STANDINGS</Label>
          {sorted.map(({p,i},rank)=>(
            <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:10,marginBottom:6,background:rank===0?`${COLORS[i%COLORS.length]}12`:'rgba(0,18,51,0.6)',border:`1px solid ${rank===0?COLORS[i%COLORS.length]+'30':'rgba(0,212,255,0.08)'}`}}>
              <span style={{fontSize:'1.2rem',width:30}}>{rank===0?'🥇':rank===1?'🥈':rank===2?'🥉':`#${rank+1}`}</span>
              <Avatar idx={i} size="sm"/>
              <span style={{flex:1,fontFamily:"'DM Sans',sans-serif",fontWeight:rank===0?700:400,color:rank===0?'white':'rgba(255,255,255,0.6)'}}>{p}</span>
              <span className="font-display" style={{fontSize:'1.5rem',color:rank===0?COLORS[i%COLORS.length]:'rgba(0,212,255,0.4)'}}>{scores[i]}</span>
            </div>
          ))}
        </SectionCard>

        <Btn onClick={reset}>PLAY AGAIN ▶</Btn>
      </div>
    </Screen>
  );
}
