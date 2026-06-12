import { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { GameRulesModal } from '../components/GameRules';
import { AvatarPickerModal } from '../components/AvatarPicker';
import { haptic } from '../utils/haptic';
import { toggleTheme, getTheme, applyTheme } from '../utils/theme';
import { Screen, Btn, Input, Label, Avatar, PlayerRow, Chip, SectionCard, BackBtn, Divider, LoadingDots, COLORS, EMOJIS, getMyAvatar, getMyColor, ALL_AVATARS } from '../components/ui';

const LANGS = ['Tamil','Telugu','Hindi','Malayalam','English'];
const CATS  = ['Movies','Foods','Locations','Cinema Artists','Sports Players'];

// ── HOME ──────────────────────────────────────────────────
export function HomeScreen() {
  const { createRoom, joinRoom, error } = useGame();
  const [view, setView]       = useState(()=>sessionStorage.getItem('auto_join_code')?'join':'home');
  const [themeLabel, setThemeLabel] = useState(getTheme()==='light'?'🌙 Dark Mode':'☀️ Light Mode');
  const [myAvatar, setMyAvatar] = useState(getMyAvatar);
  const [myColor, setMyColor]   = useState(getMyColor);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [hostName, setHostName] = useState('');
  const [joinName, setJoinName] = useState('');
  const [joinCode, setJoinCode] = useState(()=>sessionStorage.getItem('auto_join_code')||'');
  const [cfg, setCfg] = useState({ rounds:5, langs:['Tamil'], cats:['Movies','Foods','Locations'], decade:'All' });
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  function toggleLang(l){setCfg(c=>({...c,langs:c.langs.includes(l)?(c.langs.length>1?c.langs.filter(x=>x!==l):c.langs):[...c.langs,l]}));}
  function toggleCat(cat){setCfg(c=>({...c,cats:c.cats.includes(cat)?(c.cats.length>1?c.cats.filter(x=>x!==cat):c.cats):[...c.cats,cat]}));}

  function handleCreate(){
    if(!hostName.trim())return setLocalError('Enter your name');
    setLoading(true);setLocalError('');
    createRoom(hostName.trim(),cfg,()=>setLoading(false));
  }
  function handleJoin(){
    if(!joinName.trim())return setLocalError('Enter your name');
    if(joinCode.length!==4)return setLocalError('Enter a 4-letter room code');
    sessionStorage.removeItem('auto_join_code');
    setLoading(true);setLocalError('');
    haptic('medium');
    joinRoom(joinCode,joinName.trim(),()=>setLoading(false));
  }

  if(view==='host') return (
    <Screen>
      <div className="w-full max-w-sm pt-2 animate-fade-up">
        <BackBtn onClick={()=>setView('home')}/>
        <p style={{fontSize:'0.7rem',letterSpacing:'0.4em',color:'rgba(0,212,255,0.6)',marginBottom:4,fontWeight:700}}>CREATE ROOM</p>
        <h1 className="font-display cyber-text animate-flicker" style={{fontSize:'3rem',letterSpacing:'0.06em',marginBottom:20}}>HOST A GAME</h1>

        <Label>YOUR NAME</Label>
        <Input value={hostName} onChange={setHostName} placeholder="Enter your name" maxLength={12} className="mb-4" autoFocus onEnter={handleCreate}/>

        <Label>DECADE FILTER (Movies only)</Label>
        <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:14}}>
          {['All','80s','90s','2000s','2010s','2020s'].map(d=>(
            <button key={d} onClick={()=>setCfg(c=>({...c,decade:d}))}
              className="btn-press px-3 py-2 rounded-lg text-sm font-body font-bold"
              style={{background:cfg.decade===d?'linear-gradient(135deg,#0099CC,#00D4FF)':'rgba(0,18,51,0.8)',border:`1px solid ${cfg.decade===d?'rgba(0,212,255,0.5)':'rgba(0,212,255,0.15)'}`,color:cfg.decade===d?'#000814':'rgba(0,212,255,0.6)',boxShadow:cfg.decade===d?'0 0 15px rgba(0,212,255,0.3)':'none'}}>
              {d}
            </button>
          ))}
        </div>

        <Label>LANGUAGES</Label>
        <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:16}}>
          {LANGS.map(l=><Chip key={l} label={l} active={cfg.langs.includes(l)} onClick={()=>toggleLang(l)}/>)}
        </div>

        <Label>CATEGORIES</Label>
        <div style={{display:'flex',flexWrap:'wrap',gap:8,marginBottom:16}}>
          {CATS.map(c=><Chip key={c} label={c} active={cfg.cats.includes(c)} onClick={()=>toggleCat(c)}/>)}
        </div>

        <Label>ROUNDS</Label>
        <div style={{display:'flex',gap:8,marginBottom:24}}>
          {[3,4,5,6,7,8].map(r=>(
            <button key={r} onClick={()=>setCfg(c=>({...c,rounds:r}))}
              className="btn-press font-body font-bold text-sm transition-all"
              style={{width:40,height:40,borderRadius:8,background:cfg.rounds===r?'linear-gradient(135deg,#0099CC,#00D4FF)':'rgba(0,18,51,0.8)',color:cfg.rounds===r?'#000814':'rgba(0,212,255,0.5)',border:`1px solid ${cfg.rounds===r?'rgba(0,212,255,0.5)':'rgba(0,212,255,0.15)'}`,boxShadow:cfg.rounds===r?'0 0 15px rgba(0,212,255,0.3)':'none'}}>
              {r}
            </button>
          ))}
        </div>

        {(localError||error)&&<p style={{color:'#FF3C78',fontSize:'0.82rem',marginBottom:12,textAlign:'center'}}>⚠️ {localError||error}</p>}
        <Btn onClick={handleCreate} disabled={!hostName.trim()} loading={loading}>CREATE ROOM ▶</Btn>
      </div>
    </Screen>
  );

  if(view==='join') return (
    <Screen>
      <div className="w-full max-w-sm pt-2 animate-fade-up">
        <BackBtn onClick={()=>setView('home')}/>
        <p style={{fontSize:'0.7rem',letterSpacing:'0.4em',color:'rgba(0,212,255,0.6)',marginBottom:4,fontWeight:700}}>JOIN ROOM</p>
        <h1 className="font-display cyber-text animate-flicker" style={{fontSize:'3rem',letterSpacing:'0.06em',marginBottom:20}}>JOIN A GAME</h1>

        <Label>YOUR NAME</Label>
        <Input value={joinName} onChange={setJoinName} placeholder="Enter your name" maxLength={12} className="mb-4" autoFocus/>
        <Label>ROOM CODE</Label>
        <Input value={joinCode} onChange={setJoinCode} placeholder="ABCD" maxLength={4} uppercase className="mb-6" onEnter={handleJoin}/>

        {(localError||error)&&<p style={{color:'#FF3C78',fontSize:'0.82rem',marginBottom:12,textAlign:'center'}}>⚠️ {localError||error}</p>}
        <Btn onClick={handleJoin} disabled={!joinName.trim()||joinCode.length!==4} loading={loading}>JOIN GAME ▶</Btn>
      </div>
    </Screen>
  );

  return (
    <Screen center>
      <div className="w-full max-w-sm text-center" style={{position:'relative'}}>
        {/* Floating ? marks */}
        {['8%','22%','72%','88%'].map((l,i)=>(
          <div key={i} style={{position:'absolute',left:l,bottom:0,fontFamily:"'Bebas Neue',sans-serif",fontSize:[20,14,18,12][i],color:'rgba(0,212,255,0.08)',animation:`floatQ ${[5,7,6,8][i]}s linear ${[0,1.5,0.8,2.5][i]}s infinite`,pointerEvents:'none',userSelect:'none'}}>?</div>
        ))}

        {/* Avatar picker modal */}
        {showAvatarPicker && (
          <AvatarPickerModal
            currentEmoji={myAvatar} currentColor={myColor}
            onSave={(e,c)=>{setMyAvatar(e);setMyColor(c);setShowAvatarPicker(false);}}
            onClose={()=>setShowAvatarPicker(false)}
          />
        )}

        {/* My Avatar - tap to change */}
        <button onClick={()=>setShowAvatarPicker(true)}
          style={{display:'block',margin:'0 auto 14px',background:'none',border:'none',cursor:'pointer',position:'relative'}}>
          <div style={{width:56,height:56,borderRadius:'50%',background:`${myColor}18`,border:`2px solid ${myColor}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.8rem',boxShadow:`0 0 20px ${myColor}30`,margin:'0 auto'}}>
            {myAvatar}
          </div>
          <div style={{position:'absolute',bottom:-2,right:-2,width:18,height:18,borderRadius:'50%',background:'linear-gradient(135deg,#0099CC,#00D4FF)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.6rem'}}>✏️</div>
        </button>

        {/* Spy icon */}
        <div style={{position:'relative',width:110,height:110,margin:'0 auto 14px',animation:'iconEntrance 1s cubic-bezier(0.34,1.56,0.64,1) 0.3s both'}}>
          {[{inset:-14,border:'1px solid rgba(0,212,255,0.08)',delay:'1s'},{inset:-7,border:'1px solid rgba(0,212,255,0.2)',delay:'0.5s'},{inset:0,border:'2px solid rgba(0,212,255,0.5)',delay:'0s'}].map((r,i)=>(
            <div key={i} style={{position:'absolute',inset:r.inset,borderRadius:'50%',border:r.border,animation:`ringPulse 2s ease-in-out ${r.delay} infinite`}}/>
          ))}
          <div style={{width:110,height:110,borderRadius:'50%',background:'linear-gradient(135deg,#000814,#001233)',border:'2px solid rgba(0,212,255,0.5)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 0 40px rgba(0,212,255,0.25), inset 0 0 30px rgba(0,212,255,0.05)',fontSize:'3rem',animation:'spyBlink 4s ease-in-out infinite'}}>🕵️</div>
        </div>

        {/* Title */}
        <div style={{animation:'titleEntrance 0.8s ease 0.8s both'}}>
          <h1 className="font-display cyber-text animate-flicker" style={{fontSize:68,letterSpacing:6,lineHeight:1,filter:'drop-shadow(0 0 20px rgba(0,212,255,0.4))'}}>IMPOSTER</h1>
          <div style={{display:'inline-flex',alignItems:'center',gap:6,marginTop:6,padding:'3px 14px',borderRadius:4,border:'1px solid rgba(0,212,255,0.3)',background:'rgba(0,212,255,0.06)'}}>
            <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:11,fontWeight:700,letterSpacing:6,color:'rgba(0,212,255,0.7)',textTransform:'uppercase'}}>India Edition</span>
          </div>
        </div>

        {/* Film strip */}
        <div style={{display:'flex',gap:2,margin:'14px auto 0',width:220,height:4,borderRadius:2,overflow:'hidden',animation:'titleEntrance 0.8s ease 1.1s both'}}>
          {['#00D4FF','#0099CC','#006699','#00D4FF','#0099CC','#006699','#00D4FF','#0099CC'].map((c,i)=>(
            <div key={i} style={{flex:1,height:'100%',background:c,animation:`filmAnim 2s ease-in-out ${i*0.2}s infinite`}}/>
          ))}
        </div>

        {/* Categories */}
        <div style={{display:'flex',gap:10,justifyContent:'center',marginTop:10,marginBottom:28,animation:'titleEntrance 0.8s ease 1.2s both'}}>
          {['🎬 Movies','🍛 Food','📍 Locations'].map((c,i)=>(
            <span key={i} style={{fontSize:10,fontFamily:"'DM Sans',sans-serif",fontWeight:600,letterSpacing:1,color:'rgba(0,212,255,0.4)',textTransform:'uppercase'}}>
              {i>0&&<span style={{marginRight:10,color:'rgba(0,212,255,0.15)'}}>·</span>}{c}
            </span>
          ))}
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:12,animation:'titleEntrance 0.8s ease 1.3s both'}}>
          <Btn onClick={()=>setView('host')}>HOST A GAME ▶</Btn>
          <Btn onClick={()=>setView('join')} variant="secondary">JOIN A GAME ◈</Btn>
          <button onClick={()=>{const t=toggleTheme();setThemeLabel(t==='light'?'🌙 Dark Mode':'☀️ Light Mode');}} style={{background:'none',border:'none',color:'rgba(0,212,255,0.35)',fontFamily:"'DM Sans',sans-serif",fontSize:'0.78rem',cursor:'pointer',marginTop:4}}>{themeLabel}</button>
        </div>
      </div>
    </Screen>
  );
}

// ── LOBBY ─────────────────────────────────────────────────
// ── RECONNECTING SCREEN ──────────────────────────────────
export function ReconnectingScreen() {
  return (
    <div style={{minHeight:'100vh',background:'#000814',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:16}}>
      <div style={{width:80,height:80,borderRadius:'50%',background:'rgba(0,212,255,0.1)',border:'2px solid rgba(0,212,255,0.4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2rem',animation:'ringPulse 1.5s ease-in-out infinite'}}>🔄</div>
      <p className="font-display" style={{fontSize:'1.5rem',color:'#00D4FF',letterSpacing:'0.1em'}}>RECONNECTING</p>
      <p style={{fontSize:'0.8rem',color:'rgba(0,212,255,0.4)',fontFamily:"'DM Sans',sans-serif"}}>Getting you back into the game…</p>
    </div>
  );
}

export function LobbyScreen() {
  const { room, myIdx, startGame, removePlayer, joinRoom, exitGame, error } = useGame();
  const [loading, setLoading] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [copied, setCopied] = useState(false);
  const [addingPlayer, setAddingPlayer] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  if(!room) return null;

  function handleExitGame() {
    if(window.confirm('Exit game? This will end the game for all players.')) {
      exitGame();
    }
  }

  function handleAddPlayer() {
    setAddingPlayer(true);
  }
  const isHost = myIdx===0;
  const filled = room.players.filter(p=>p.name&&!p.removed);
  const canStart = filled.length>=3;

  return (
    <Screen>
      <div className="w-full max-w-sm pt-2 animate-fade-up">
        <div className="text-center mb-6">
          <p style={{fontSize:'0.65rem',letterSpacing:'0.4em',color:'rgba(0,212,255,0.5)',marginBottom:4,fontWeight:700}}>ROOM CODE</p>
          <div className="font-display cyber-text animate-flicker" style={{fontSize:60,letterSpacing:'0.25em',lineHeight:1,marginBottom:4}}>{room.code}</div>
          <div style={{display:'flex',gap:8,justifyContent:'center',marginTop:6}}>
            <div style={{position:'relative',display:'inline-block'}}>
              <button onClick={()=>{
                const url = `${window.location.origin}?join=${room.code}`;
                if(navigator.share){navigator.share({title:'Join Imposter India!',text:`Join my game! Code: ${room.code}`,url});}
                else{
                  navigator.clipboard.writeText(url).then(()=>{
                    setCopied(true);setTimeout(()=>setCopied(false),2000);
                  }).catch(()=>{
                    // fallback for browsers that block clipboard
                    const el=document.createElement('input');
                    el.value=url;document.body.appendChild(el);
                    el.select();document.execCommand('copy');
                    document.body.removeChild(el);
                    setCopied(true);setTimeout(()=>setCopied(false),2000);
                  });
                }
                haptic('light');
              }} style={{padding:'6px 14px',borderRadius:20,background:'rgba(0,212,255,0.1)',border:'1px solid rgba(0,212,255,0.3)',color:'#00D4FF',fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:'0.75rem',cursor:'pointer'}}>
                {copied ? '✅ Link Copied!' : '🔗 Share Invite Link'}
              </button>
            </div>
          </div>
        </div>

        <SectionCard>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
            <Label style={{marginBottom:0}}>PLAYERS</Label>
            <span style={{fontSize:'0.7rem',color:'rgba(0,212,255,0.4)',fontFamily:"'DM Sans',sans-serif"}}>{filled.length} joined</span>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {room.players.map((p,i)=>p.name&&!p.removed&&(
              <PlayerRow key={i} player={p} idx={i} isHost={i===0} isMe={i===myIdx} offline={p.online===false}
                onRemove={isHost&&i!==0&&i!==myIdx?()=>removePlayer(i):null}/>
            ))}
            {filled.length<12&&(
              <div style={{display:'flex',alignItems:'center',gap:8,padding:'4px 0'}}>
                <LoadingDots/>
                <span style={{fontSize:'0.72rem',color:'rgba(0,212,255,0.25)',fontFamily:"'DM Sans',sans-serif"}}>Waiting for players…</span>
              </div>
            )}
          </div>
        </SectionCard>

        <SectionCard>
          <div style={{display:'flex',flexWrap:'wrap',gap:12,fontSize:'0.72rem',color:'rgba(0,212,255,0.4)',fontFamily:"'DM Sans',sans-serif"}}>
            <span>🌐 {room.cfg.langs.slice(0,2).join(', ')}{room.cfg.langs.length>2?` +${room.cfg.langs.length-2}`:''}</span>
            <span>🎯 {room.cfg.cats.join(', ')}</span>
            <span>🔄 {room.cfg.rounds} rounds</span>
          </div>
        </SectionCard>

        {addingPlayer && (
          <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',zIndex:9000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
            <div style={{width:'100%',maxWidth:320,background:'#000c28',border:'1px solid rgba(0,212,255,0.3)',borderRadius:20,padding:20}}>
              <p className="font-display" style={{fontSize:'1.5rem',color:'#00D4FF',marginBottom:16}}>ADD PLAYER</p>
              <input value={newPlayerName} onChange={e=>setNewPlayerName(e.target.value)}
                placeholder="Enter player name" maxLength={12}
                style={{width:'100%',background:'rgba(0,18,51,0.8)',border:'1px solid rgba(0,212,255,0.3)',borderRadius:10,padding:'10px 14px',color:'white',fontFamily:"'DM Sans',sans-serif",fontSize:'1rem',outline:'none',marginBottom:12,boxSizing:'border-box'}}
                onKeyDown={e=>e.key==='Enter'&&newPlayerName.trim()&&(joinRoom(room.code,newPlayerName.trim()),setAddingPlayer(false),setNewPlayerName(''))}
                autoFocus/>
              <div style={{display:'flex',gap:8}}>
                <button onClick={()=>{setAddingPlayer(false);setNewPlayerName('');}} style={{flex:1,padding:'10px',borderRadius:10,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.5)',fontFamily:"'DM Sans',sans-serif",cursor:'pointer'}}>Cancel</button>
                <button onClick={()=>{if(newPlayerName.trim()){joinRoom(room.code,newPlayerName.trim());setAddingPlayer(false);setNewPlayerName('');}}} style={{flex:2,padding:'10px',borderRadius:10,background:'linear-gradient(135deg,#0099CC,#00D4FF)',border:'none',color:'#000814',fontFamily:"'Bebas Neue',sans-serif",fontSize:'1rem',letterSpacing:'0.1em',cursor:'pointer'}}>ADD ▶</button>
              </div>
            </div>
          </div>
        )}
        {showRules && <GameRulesModal onClose={()=>setShowRules(false)}/>}

        {error&&<p style={{color:'#FF3C78',fontSize:'0.82rem',marginBottom:10,textAlign:'center'}}>⚠️ {error}</p>}

        {isHost?(
          <>
            <Btn onClick={()=>{setLoading(true);startGame(res=>{setLoading(false);if(res&&!res.ok)alert(res.error);});}} disabled={!canStart} loading={loading}>
              START GAME ▶
            </Btn>
            {!canStart&&<p style={{textAlign:'center',fontSize:'0.72rem',color:'rgba(0,212,255,0.3)',marginTop:8,fontFamily:"'DM Sans',sans-serif"}}>Need at least 3 players ({filled.length} joined)</p>}
          <button onClick={()=>setShowRules(true)} style={{display:'block',width:'100%',marginTop:10,background:'none',border:'none',color:'rgba(0,212,255,0.4)',fontFamily:"'DM Sans',sans-serif",fontSize:'0.78rem',cursor:'pointer',textDecoration:'underline'}}>📖 How to Play</button>

          {/* Host controls */}
          <div style={{display:'flex',gap:8,marginTop:12}}>
            <button onClick={handleAddPlayer} style={{flex:1,padding:'10px',borderRadius:12,background:'rgba(0,212,255,0.08)',border:'1px solid rgba(0,212,255,0.2)',color:'rgba(0,212,255,0.7)',fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:'0.78rem',cursor:'pointer'}}>
              ➕ Add Player
            </button>
            <button onClick={handleExitGame} style={{flex:1,padding:'10px',borderRadius:12,background:'rgba(255,60,120,0.08)',border:'1px solid rgba(255,60,120,0.2)',color:'#FF3C78',fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:'0.78rem',cursor:'pointer'}}>
              🚪 Exit Game
            </button>
          </div>
          </>
        ):(
          <div style={{textAlign:'center',padding:'20px 0'}}>
            <LoadingDots/>
            <p style={{fontSize:'0.82rem',color:'rgba(0,212,255,0.35)',marginTop:10,fontFamily:"'DM Sans',sans-serif"}}>Waiting for host to start…</p>
            <button onClick={()=>setShowRules(true)} style={{marginTop:10,background:'none',border:'none',color:'rgba(0,212,255,0.4)',fontFamily:"'DM Sans',sans-serif",fontSize:'0.78rem',cursor:'pointer',textDecoration:'underline'}}>📖 How to Play</button>
          </div>
        )}
      </div>
    </Screen>
  );
}

// ── PLAYING ───────────────────────────────────────────────
export function PlayingScreen() {
  const { room, myIdx, myRole, moveToSpinner } = useGame();
  const [flipped, setFlipped] = useState(false);
  const [showContent, setShowContent] = useState(false);
  useEffect(()=>{setFlipped(false);setShowContent(false);},[room?.roundNum]);
  if(!room||!myRole) return <Screen center><LoadingDots/></Screen>;

  const { isImp, round, resolvedClue, locList } = myRole;
  const isHost = myIdx===0;
  const color = COLORS[myIdx%COLORS.length];
  const playerName = room.players[myIdx]?.name||'';

  function handleFlip(){if(flipped)return;setFlipped(true);haptic('reveal');setTimeout(()=>setShowContent(true),350);}

  return (
    <Screen>
      <div className="w-full max-w-sm pt-4 animate-fade-up">
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',marginBottom:20}}>
          <Avatar idx={myIdx} size="lg" pulse/>
          <p className="font-display" style={{fontSize:'1.6rem',marginTop:10,letterSpacing:'0.06em',color}}>{playerName}</p>
          <p style={{fontSize:'0.7rem',color:'rgba(0,212,255,0.3)',marginTop:2,fontFamily:"'DM Sans',sans-serif"}}>Round {room.roundNum} of {room.totalRounds}</p>
        </div>

        <div className="flip-container w-full mb-4">
          <div className={`flip-inner w-full ${flipped?'flipped':''}`} style={{minHeight:200}}>

            {/* Front */}
            <div className="flip-front absolute inset-0 w-full rounded-xl flex flex-col items-center justify-center cursor-pointer btn-press"
              style={{background:'rgba(0,18,51,0.9)',border:'1px dashed rgba(0,212,255,0.25)',minHeight:200,boxShadow:'0 0 30px rgba(0,212,255,0.1)'}}
              onClick={handleFlip}>
              <div style={{fontSize:'3rem',marginBottom:10}}>🎬</div>
              <p style={{fontSize:'0.75rem',letterSpacing:'0.15em',color:'rgba(0,212,255,0.4)',fontFamily:"'DM Sans',sans-serif"}}>TAP TO REVEAL YOUR ROLE</p>
            </div>

            {/* Back */}
            <div className="flip-back w-full">
              {showContent&&(
                <div className="animate-scale-in">
                  {isImp?(
                    <div className="rounded-xl p-5 scanlines relative overflow-hidden"
                      style={{background:'linear-gradient(135deg,rgba(255,60,120,0.15),rgba(150,0,50,0.1))',border:'1px solid rgba(255,60,120,0.4)',boxShadow:'0 0 30px rgba(255,60,120,0.15)'}}>
                      <div style={{textAlign:'center',marginBottom:14}}>
                        <div style={{fontSize:'2.5rem',marginBottom:6}}>🕵️</div>
                        <p style={{fontSize:'0.6rem',letterSpacing:'0.35em',color:'rgba(255,60,120,0.7)',marginBottom:2,fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>YOU ARE THE</p>
                        <p className="font-display" style={{fontSize:'2.8rem',color:'#FF3C78',textShadow:'0 0 20px rgba(255,60,120,0.5)'}}>IMPOSTER</p>
                      </div>
                      {round.c==='Location'?(
                        <div className="rounded-lg p-3 text-center" style={{background:'rgba(255,60,120,0.08)',border:'1px solid rgba(255,60,120,0.2)'}}>
                          <p style={{fontSize:'0.82rem',color:'rgba(255,255,255,0.7)',fontFamily:"'DM Sans',sans-serif"}}>You don't know the location!</p>
                          <p style={{fontSize:'0.72rem',color:'rgba(255,100,140,0.6)',marginTop:4,fontFamily:"'DM Sans',sans-serif"}}>Ask clever questions and blend in</p>
                        </div>
                      ):(
                        <div className="rounded-lg p-3" style={{background:'rgba(255,60,120,0.08)',border:'1px solid rgba(255,60,120,0.2)'}}>
                          <p style={{fontSize:'0.6rem',letterSpacing:'0.2em',color:'rgba(255,60,120,0.6)',marginBottom:6,fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>YOUR CLUE</p>
                          <p style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.4)',marginBottom:2,fontFamily:"'DM Sans',sans-serif"}}>{resolvedClue?.label}</p>
                          <p style={{fontSize:'1rem',color:'white',fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>{resolvedClue?.value||'—'}</p>
                          <p style={{fontSize:'0.68rem',color:'rgba(255,100,140,0.5)',marginTop:6,fontFamily:"'DM Sans',sans-serif"}}>Bluff — you don't know the exact name!</p>
                        </div>
                      )}
                    </div>
                  ):(
                    <div className="rounded-xl p-5 scanlines relative overflow-hidden"
                      style={{background:`rgba(0,18,51,0.9)`,border:`1px solid ${color}44`,boxShadow:`0 0 30px ${color}15`}}>
                      <div style={{textAlign:'center',marginBottom:14}}>
                        <p style={{fontSize:'0.6rem',letterSpacing:'0.3em',color:`${color}aa`,marginBottom:6,fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>
                          {round.c==='Location'?'THE LOCATION IS':round.c==='Food'?'THE FOOD IS':'THE MOVIE IS'}
                        </p>
                        <p className="font-display" style={{fontSize:'2.2rem',color,textShadow:`0 0 15px ${color}50`,marginBottom:4}}>{round.n}</p>
                        <p style={{fontSize:'0.8rem',color:'rgba(255,255,255,0.4)',fontFamily:"'DM Sans',sans-serif"}}>{round.d}</p>
                        {round.c==='Location'&&(
                          <div style={{display:'inline-block',padding:'3px 12px',borderRadius:4,marginTop:8,background:`${color}18`,color,fontSize:'0.72rem',fontWeight:700,fontFamily:"'DM Sans',sans-serif",border:`1px solid ${color}30`}}>
                            Role: {round.d}
                          </div>
                        )}
                      </div>
                      <div className="rounded-lg p-3 text-center" style={{background:'rgba(0,212,255,0.05)',border:'1px solid rgba(0,212,255,0.1)',fontSize:'0.72rem',color:'rgba(0,212,255,0.4)',fontFamily:"'DM Sans',sans-serif"}}>
                        {round.c==='Location'?'💡 Your location is highlighted below':'💡 Discuss — never say the name directly!'}
                      </div>
                    </div>
                  )}

                  {/* Location list */}
                  {locList&&locList.length>0&&(
                    <div className="mt-3 rounded-xl p-3" style={{background:'rgba(0,50,30,0.5)',border:'1px solid rgba(0,212,120,0.2)'}}>
                      <p style={{fontSize:'0.6rem',letterSpacing:'0.2em',color:'rgba(0,212,120,0.7)',marginBottom:8,fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>📍 POSSIBLE LOCATIONS</p>
                      <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                        {locList.map(loc=>(
                          <span key={loc} style={{padding:'3px 10px',borderRadius:4,fontSize:'0.72rem',fontFamily:"'DM Sans',sans-serif",fontWeight:600,...(!isImp&&loc===round.n?{background:'#00D478',color:'#001a0a'}:{background:'rgba(0,212,120,0.1)',color:'rgba(0,212,120,0.7)',border:'1px solid rgba(0,212,120,0.2)'})}}>
                            {loc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{marginTop:14}}>
                    {isHost?(
                      <Btn onClick={moveToSpinner}>SPIN THE WHEEL ◈</Btn>
                    ):(
                      <div style={{textAlign:'center',padding:12}}>
                        <LoadingDots/>
                        <p style={{fontSize:'0.72rem',color:'rgba(0,212,255,0.3)',marginTop:8,fontFamily:"'DM Sans',sans-serif"}}>Waiting for host to spin…</p>
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
  useEffect(()=>{setDone(false);spunRef.current=false;},[room?.spinnerSeed]);
  if(!room) return null;

  const isHost = myIdx===0;
  const players = room.players.filter(p=>p.name&&!p.removed);
  const n = players.length;
  const seed = room.spinnerSeed;
  const firstPlayer = room.players[room.firstIdx];
  const firstColor = COLORS[room.firstIdx%COLORS.length];
  const isFirstMe = myIdx===room.firstIdx;

  const segColors = ['#00D4FF','#FF3C78','#00FF94','#FFB800','#C44DFF','#FF6B35','#00E5FF','#FF4081'];
  const deg = 360/n;
  const gradient = `conic-gradient(${players.map((_,i)=>`${segColors[i%segColors.length]} ${i*deg}deg ${(i+1)*deg}deg`).join(',')})`;
  const filledPos = room.players.slice(0,room.firstIdx+1).filter(p=>p.name&&!p.removed).length-1;
  const totalRotation = (5+(seed%8))*360+(360-(filledPos*deg+deg/2));

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
          ROUND {room.roundNum} / {room.totalRounds} — WHO SPEAKS FIRST?
        </p>

        <div style={{position:'relative',width:240,height:240,margin:'0 auto 24px'}}>
          <div style={{position:'absolute',top:-18,left:'50%',transform:'translateX(-50%)',fontSize:'1.8rem',zIndex:10,filter:'drop-shadow(0 0 10px rgba(0,212,255,0.8))'}}>▼</div>
          {/* Outer rings */}
          <div style={{position:'absolute',inset:-12,borderRadius:'50%',border:'1px solid rgba(0,212,255,0.1)',animation:'ringPulse 2s ease-in-out infinite'}}/>
          <div style={{position:'absolute',inset:-6,borderRadius:'50%',border:'1px solid rgba(0,212,255,0.2)',animation:'ringPulse 2s ease-in-out 0.5s infinite'}}/>
          <div ref={wheelRef} style={{width:240,height:240,borderRadius:'50%',background:gradient,border:'3px solid rgba(0,212,255,0.3)',boxShadow:'0 0 40px rgba(0,212,255,0.2), 0 0 80px rgba(0,212,255,0.05)',position:'relative',overflow:'hidden'}}>
            {players.map((p,i)=>{
              const angle=i*deg+deg/2;
              const rad=(angle-90)*Math.PI/180;
              const tx=50+36*Math.cos(rad),ty=50+36*Math.sin(rad);
              return(
                <div key={i} style={{position:'absolute',left:`${tx}%`,top:`${ty}%`,transform:`translate(-50%,-50%) rotate(${angle}deg)`,fontSize:Math.max(8,Math.floor(22/n)),color:'rgba(0,0,0,0.8)',fontWeight:700,textShadow:'0 1px 3px rgba(255,255,255,0.3)',whiteSpace:'nowrap',maxWidth:60,overflow:'hidden',textOverflow:'ellipsis',pointerEvents:'none',fontFamily:"'DM Sans',sans-serif"}}>
                  {p.name.split(' ')[0]}
                </div>
              );
            })}
            <div style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:40,height:40,borderRadius:'50%',background:'#000814',border:'2px solid rgba(0,212,255,0.6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.1rem',boxShadow:'0 0 15px rgba(0,212,255,0.5)',zIndex:5}}>🎬</div>
          </div>
        </div>

        {done&&firstPlayer&&(
          <div className="animate-scale-in">
            <p style={{fontSize:'0.65rem',letterSpacing:'0.3em',color:'rgba(0,212,255,0.4)',marginBottom:10,fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>SPEAKS FIRST THIS ROUND</p>
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:12,marginBottom:16}}>
              <Avatar idx={room.firstIdx} size="md" pulse/>
              <p className="font-display" style={{fontSize:'2.5rem',color:firstColor,textShadow:`0 0 15px ${firstColor}60`}}>{firstPlayer.name}</p>
              {isFirstMe&&<span style={{padding:'2px 10px',borderRadius:4,fontSize:'0.7rem',fontWeight:700,background:'#FF3C78',color:'white',fontFamily:"'DM Sans',sans-serif"}}>YOU!</span>}
            </div>
            {isHost?(
              <Btn onClick={moveToDiscuss}>START DISCUSSION ▶</Btn>
            ):(
              <div style={{textAlign:'center',padding:12}}>
                <LoadingDots/>
                <p style={{fontSize:'0.72rem',color:'rgba(0,212,255,0.3)',marginTop:8,fontFamily:"'DM Sans',sans-serif"}}>Waiting for host…</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Screen>
  );
}

// ── ROLE REVEAL PANEL ────────────────────────────────────
function RoleRevealPanel({ myRole, myIdx }) {
  const [open, setOpen] = useState(false);
  if (!myRole) return null;
  const { isImp, round, resolvedClue, locList } = myRole;
  const color = COLORS[myIdx % COLORS.length];

  return (
    <div style={{marginBottom:12}}>
      <button onClick={()=>setOpen(o=>!o)}
        className="btn-press w-full rounded-xl px-4 py-2.5 flex items-center justify-between"
        style={{background:isImp?'rgba(255,60,120,0.1)':'rgba(0,212,255,0.08)',border:`1px solid ${isImp?'rgba(255,60,120,0.3)':'rgba(0,212,255,0.2)'}`}}>
        <span style={{fontSize:'0.75rem',fontWeight:700,fontFamily:"'DM Sans',sans-serif",color:isImp?'#FF3C78':'#00D4FF'}}>
          {isImp ? '🕵️ YOU ARE THE IMPOSTER' : `👁 TAP TO SEE YOUR ${(round?.c||'MOVIE').toUpperCase()}`}
        </span>
        <span style={{color:isImp?'rgba(255,60,120,0.6)':'rgba(0,212,255,0.5)',fontSize:'1rem'}}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="animate-fade-up rounded-xl p-3 mt-1"
          style={{background:isImp?'rgba(255,60,120,0.08)':`${color}0a`,border:`1px solid ${isImp?'rgba(255,60,120,0.2)':color+'30'}`}}>
          {isImp ? (
            <div>
              <p style={{fontSize:'0.7rem',letterSpacing:'0.2em',color:'rgba(255,60,120,0.7)',fontFamily:"'DM Sans',sans-serif",fontWeight:700,marginBottom:6}}>YOUR CLUE</p>
              {round?.c==='Location' ? (
                <p style={{fontSize:'0.85rem',color:'rgba(255,255,255,0.7)',fontFamily:"'DM Sans',sans-serif"}}>You don't know the location — bluff!</p>
              ) : (
                <>
                  <p style={{fontSize:'0.7rem',color:'rgba(255,255,255,0.35)',fontFamily:"'DM Sans',sans-serif"}}>{resolvedClue?.label}</p>
                  <p style={{fontSize:'1rem',color:'white',fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>{resolvedClue?.value||'—'}</p>
                </>
              )}
            </div>
          ) : (
            <div>
              <p style={{fontSize:'0.7rem',letterSpacing:'0.2em',color:`${color}99`,fontFamily:"'DM Sans',sans-serif",fontWeight:700,marginBottom:4}}>
                {round?.c==='Location'?'THE LOCATION IS':round?.c==='Food'?'THE FOOD IS':'THE MOVIE IS'}
              </p>
              <p className="font-display" style={{fontSize:'1.5rem',color,marginBottom:2}}>{round?.n}</p>
              <p style={{fontSize:'0.78rem',color:'rgba(255,255,255,0.4)',fontFamily:"'DM Sans',sans-serif"}}>{round?.d}</p>
              {round?.c==='Location' && (
                <div style={{marginTop:8}}>
                  <p style={{fontSize:'0.65rem',color:'rgba(0,212,120,0.7)',fontFamily:"'DM Sans',sans-serif",fontWeight:700,marginBottom:6}}>YOUR LOCATION IS HIGHLIGHTED</p>
                  <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                    {(locList||[]).map(loc=>(
                      <span key={loc} style={{padding:'3px 10px',borderRadius:4,fontSize:'0.7rem',fontFamily:"'DM Sans',sans-serif",fontWeight:600,...(loc===round?.n?{background:'#00D478',color:'#001a0a'}:{background:'rgba(0,212,120,0.1)',color:'rgba(0,212,120,0.7)',border:'1px solid rgba(0,212,120,0.2)'})}}>{loc}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── DISCUSS ───────────────────────────────────────────────
export function DiscussScreen() {
  const { room, myIdx, myRole, moveToVote, imposterWon, exitGame, kickPlayer } = useGame();
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [showKick, setShowKick] = useState(false);
  if(!room||!myRole) return null;
  const isHost = myIdx===0;
  const firstPlayer = room.players[room.firstIdx];
  const firstColor = COLORS[room.firstIdx%COLORS.length];
  const isFirst = myIdx===room.firstIdx;
  const { round, locList } = myRole;

  return (
    <Screen>
      <div className="w-full max-w-sm pt-2 animate-fade-up">
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
          <div>
            <p style={{fontSize:'0.65rem',letterSpacing:'0.4em',color:'rgba(0,212,255,0.6)',fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>DISCUSSION</p>
            <p className="font-display" style={{fontSize:'2rem',color:'white',letterSpacing:'0.04em'}}>FIND THE IMPOSTER</p>
          </div>
          <div style={{textAlign:'right'}}>
            <p style={{fontSize:'0.65rem',color:'rgba(0,212,255,0.35)',fontFamily:"'DM Sans',sans-serif"}}>Round</p>
            <p className="font-display" style={{fontSize:'1.5rem',color:'rgba(0,212,255,0.5)'}}>{room.roundNum}/{room.totalRounds}</p>
          </div>
        </div>

        {/* Role reveal */}
        <RoleRevealPanel myRole={myRole} myIdx={myIdx}/>

        {/* First speaker */}
        <div className="rounded-xl p-3 mb-3 flex items-center gap-3"
          style={{background:`${firstColor}10`,border:`1px solid ${firstColor}35`}}>
          <Avatar idx={room.firstIdx} size="sm"/>
          <div>
            <p style={{fontSize:'0.6rem',color:'rgba(255,255,255,0.35)',fontFamily:"'DM Sans',sans-serif"}}>SPEAKS FIRST</p>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <p className="font-display" style={{fontSize:'1.3rem',color:firstColor}}>{firstPlayer?.name}</p>
              {isFirst&&<span style={{padding:'2px 8px',borderRadius:4,fontSize:'0.65rem',fontWeight:700,background:'#FF3C78',color:'white',fontFamily:"'DM Sans',sans-serif"}}>YOU!</span>}
            </div>
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
                <span key={loc} style={{padding:'3px 10px',borderRadius:4,fontSize:'0.72rem',fontFamily:"'DM Sans',sans-serif",fontWeight:600,...(!myRole.isImp&&loc===round?.n?{background:'#00D478',color:'#001a0a'}:{background:'rgba(0,212,120,0.1)',color:'rgba(0,212,120,0.7)',border:'1px solid rgba(0,212,120,0.2)'})}}>
                  {loc}
                </span>
              ))}
            </div>
          </div>
        )}

        {isHost?(
          <div style={{display:'flex',flexDirection:'column',gap:10,marginTop:8}}>
            <Btn onClick={()=>{moveToVote();haptic('heavy');}}>🗳 START VOTING ▶</Btn>
            <Btn onClick={imposterWon} variant="danger">🕵️ IMPOSTER REVEALED THE {(round?.c||'MOVIE').toUpperCase()}</Btn>
            <div style={{display:'flex',gap:8}}>
              <button onClick={()=>setShowAddPlayer(true)} style={{flex:1,padding:'10px',borderRadius:12,background:'rgba(0,212,255,0.08)',border:'1px solid rgba(0,212,255,0.2)',color:'rgba(0,212,255,0.7)',fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:'0.75rem',cursor:'pointer'}}>➕ Add</button>
              <button onClick={()=>setShowKick(true)} style={{flex:1,padding:'10px',borderRadius:12,background:'rgba(255,180,0,0.08)',border:'1px solid rgba(255,180,0,0.2)',color:'#FFB800',fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:'0.75rem',cursor:'pointer'}}>👢 Kick</button>
              <button onClick={()=>{if(window.confirm('Exit game? All players will be sent back to home.')) exitGame();}} style={{flex:1,padding:'10px',borderRadius:12,background:'rgba(255,60,120,0.08)',border:'1px solid rgba(255,60,120,0.2)',color:'#FF3C78',fontFamily:"'DM Sans',sans-serif",fontWeight:700,fontSize:'0.75rem',cursor:'pointer'}}>🚪 Exit</button>
            </div>
          </div>

          
        ):(
          <p style={{textAlign:'center',fontSize:'0.8rem',color:'rgba(0,212,255,0.3)',marginTop:16,fontFamily:"'DM Sans',sans-serif"}}>Host controls voting</p>
        )}
        {/* Kick player modal */}
        {showKick && (
          <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:9000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
            <div style={{width:'100%',maxWidth:320,background:'#000c28',border:'1px solid rgba(255,180,0,0.3)',borderRadius:20,padding:24}}>
              <p className="font-display" style={{fontSize:'1.5rem',color:'#FFB800',marginBottom:4}}>KICK PLAYER</p>
              <p style={{fontSize:'0.75rem',color:'rgba(255,255,255,0.4)',fontFamily:"'DM Sans',sans-serif",marginBottom:14}}>Select a player to remove from the game</p>
              <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:14}}>
                {room.players.map((p,i)=>{
                  if(!p.name||p.removed||i===myIdx) return null;
                  return(
                    <button key={i} onClick={()=>{kickPlayer(i);setShowKick(false);}}
                      style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',borderRadius:12,background:'rgba(255,180,0,0.08)',border:'1px solid rgba(255,180,0,0.2)',cursor:'pointer',color:'white',fontFamily:"'DM Sans',sans-serif",fontWeight:600,fontSize:'0.85rem'}}>
                      <span style={{fontSize:'1.2rem'}}>👤</span>{p.name}
                      <span style={{marginLeft:'auto',color:'#FFB800',fontSize:'0.75rem'}}>KICK →</span>
                    </button>
                  );
                })}
              </div>
              <button onClick={()=>setShowKick(false)} style={{width:'100%',padding:'10px',borderRadius:12,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.5)',fontFamily:"'DM Sans',sans-serif",cursor:'pointer'}}>Cancel</button>
            </div>
          </div>
        )}

        {/* Add player mid-game modal */}
        {showAddPlayer && (
          <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',zIndex:9000,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
            <div style={{width:'100%',maxWidth:320,background:'#000c28',border:'1px solid rgba(0,212,255,0.3)',borderRadius:20,padding:24,textAlign:'center'}}>
              <p style={{fontSize:'0.7rem',letterSpacing:'0.3em',color:'rgba(0,212,255,0.6)',fontFamily:"'DM Sans',sans-serif",fontWeight:700,marginBottom:8}}>SHARE ROOM CODE</p>
              <p className="font-display" style={{fontSize:'4rem',letterSpacing:'0.3em',color:'#00D4FF',marginBottom:8}}>{room.code}</p>
              <p style={{fontSize:'0.78rem',color:'rgba(255,255,255,0.4)',fontFamily:"'DM Sans',sans-serif",marginBottom:20,lineHeight:1.5}}>
                New player opens the game on their phone → tap <strong style={{color:'white'}}>JOIN A GAME</strong> → enter this code
              </p>
              <div style={{display:'flex',gap:8}}>
                <button onClick={()=>setShowAddPlayer(false)} style={{flex:1,padding:'12px',borderRadius:12,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.5)',fontFamily:"'DM Sans',sans-serif",cursor:'pointer',fontWeight:700}}>CLOSE</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Screen>
  );
}

// ── VOTE ──────────────────────────────────────────────────
export function VoteScreen() {
  const { room, myIdx, myRole, castVote, lockVotes } = useGame();
  const [myVote, setMyVote] = useState(-1);
  if(!room) return null;
  const isHost = myIdx===0;
  const filledPlayers = room.players.filter(p=>p.name&&!p.removed);
  const voteCount = Object.keys(room.votes||{}).length;
  const allVoted = voteCount>=filledPlayers.length;

  function handleVote(idx){if(myVote>=0)return;setMyVote(idx);castVote(idx);haptic('vote');}

  return (
    <Screen>
      <div className="w-full max-w-sm pt-2 animate-fade-up">
        <div style={{textAlign:'center',marginBottom:20}}>
          <p style={{fontSize:'0.65rem',letterSpacing:'0.4em',color:'rgba(0,212,255,0.6)',marginBottom:4,fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>VOTING TIME</p>
          <h1 className="font-display cyber-text animate-flicker" style={{fontSize:'3.5rem',letterSpacing:'0.06em'}}>VOTE NOW</h1>
          <p style={{fontSize:'0.8rem',color:'rgba(0,212,255,0.35)',fontFamily:"'DM Sans',sans-serif"}}>Who is the imposter?</p>
        </div>

        {/* Role reveal */}
        <RoleRevealPanel myRole={myRole} myIdx={myIdx}/>

        {/* Progress */}
        <div className="rounded-xl p-3 mb-4 flex items-center gap-3" style={{background:'rgba(0,18,51,0.8)',border:'1px solid rgba(0,212,255,0.1)'}}>
          <div style={{flex:1,height:4,borderRadius:2,background:'rgba(0,212,255,0.1)',overflow:'hidden'}}>
            <div style={{height:'100%',borderRadius:2,background:'linear-gradient(90deg,#0099CC,#00D4FF)',width:`${(voteCount/filledPlayers.length)*100}%`,transition:'width 0.5s',boxShadow:'0 0 8px rgba(0,212,255,0.5)'}}/>
          </div>
          <p style={{fontSize:'0.72rem',fontWeight:700,color:'rgba(0,212,255,0.5)',fontFamily:"'DM Sans',sans-serif",minWidth:36}}>{voteCount}/{filledPlayers.length}</p>
        </div>

        {myVote>=0?(
          <div className="rounded-xl p-4 text-center mb-4" style={{background:'rgba(0,212,100,0.08)',border:'1px solid rgba(0,212,100,0.25)'}}>
            <p style={{color:'#00D478',fontWeight:700,fontFamily:"'DM Sans',sans-serif"}}>✓ Voted for <strong>{room.players[myVote]?.name}</strong></p>
            <p style={{fontSize:'0.72rem',color:'rgba(0,212,255,0.3)',marginTop:4,fontFamily:"'DM Sans',sans-serif"}}>Waiting for others…</p>
          </div>
        ):(
          <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:16}}>
            {room.players.map((p,i)=>{
              if(!p.name||p.removed||(myIdx>=0&&i===myIdx)) return null;
              const color=COLORS[i%COLORS.length];
              return(
                <button key={i} onClick={()=>handleVote(i)}
                  className="btn-press flex items-center gap-3 rounded-xl px-4 py-3.5"
                  style={{background:'rgba(0,18,51,0.8)',border:'1px solid rgba(0,212,255,0.1)',transition:'all 0.2s'}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=`${color}50`;e.currentTarget.style.background=`${color}10`;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(0,212,255,0.1)';e.currentTarget.style.background='rgba(0,18,51,0.8)';}}>
                  <Avatar idx={i} size="sm"/>
                  <span style={{flex:1,fontFamily:"'DM Sans',sans-serif",fontWeight:500,textAlign:'left',color:'rgba(255,255,255,0.85)'}}>{p.name}</span>
                  <span style={{fontSize:'0.7rem',padding:'2px 10px',borderRadius:4,background:`${color}18`,color,fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>VOTE ▶</span>
                </button>
              );
            })}
          </div>
        )}

        {isHost&&(allVoted||voteCount>0)&&(
          <Btn onClick={lockVotes}>{allVoted?'SEE RESULT ▶':`LOCK VOTES (${voteCount} voted)`}</Btn>
        )}
      </div>
    </Screen>
  );
}

// ── RESULT ────────────────────────────────────────────────
export function ResultScreen() {
  const { room, myIdx, resultData, nextRound, goLeaderboard, exitGame } = useGame();
  const [loading, setLoading] = useState(false);
  if(!room||!resultData) return <Screen center><LoadingDots/></Screen>;

  const isHost = myIdx===0;
  const { impCaught, imposterRevealed, impIdxs } = resultData;
  const round = room.round;
  const isLastRound = room.roundNum>=room.totalRounds;
  const isWin = impCaught;

  const sorted = [...room.players].map((p,i)=>({p,i})).filter(({p})=>p.name&&!p.removed).sort((a,b)=>b.p.score-a.p.score);

  return (
    <Screen>
      <div className="w-full max-w-sm pt-2 animate-fade-up">
        {/* Banner */}
        <div className="rounded-xl p-5 text-center mb-4 relative overflow-hidden"
          style={{background:isWin?'rgba(0,212,100,0.1)':'rgba(255,60,120,0.1)',border:`1px solid ${isWin?'rgba(0,212,100,0.35)':'rgba(255,60,120,0.35)'}`,boxShadow:isWin?'0 0 40px rgba(0,212,100,0.1)':'0 0 40px rgba(255,60,120,0.1)'}}>
          <div style={{fontSize:'3rem',marginBottom:8}}>{isWin?'🎉':imposterRevealed?'🕵️':'😈'}</div>
          <p className="font-display" style={{fontSize:'2.8rem',color:isWin?'#00D478':'#FF3C78',textShadow:`0 0 20px ${isWin?'rgba(0,212,100,0.5)':'rgba(255,60,120,0.5)'}`}}>
            {isWin?'CAUGHT!':imposterRevealed?'IMPOSTER WON!':'ESCAPED!'}
          </p>
          <p style={{fontSize:'0.8rem',color:'rgba(255,255,255,0.4)',marginTop:6,fontFamily:"'DM Sans',sans-serif"}}>
            Imposter{(impIdxs||[]).length>1?'s':''}: <strong style={{color:isWin?'#00D478':'#FF3C78'}}>{(impIdxs||[]).map(i=>room.players[i]?.name).join(' & ')}</strong>
          </p>
        </div>

        {/* Answer */}
        {round&&(
          <SectionCard>
            <p style={{fontSize:'0.6rem',letterSpacing:'0.3em',color:'rgba(0,212,255,0.4)',marginBottom:8,fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>THE ANSWER WAS</p>
            <p className="font-display" style={{fontSize:'2rem',color:'white'}}>{round.n}</p>
            <p style={{fontSize:'0.8rem',color:'rgba(0,212,255,0.4)',fontFamily:"'DM Sans',sans-serif"}}>{round.d}{round.y&&round.c==='Movie'?` · ${round.y}`:''}</p>
          </SectionCard>
        )}

        {/* Scores */}
        <SectionCard>
          <Label>SCORES</Label>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {sorted.map(({p,i},rank)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 12px',borderRadius:10,background:rank===0?`${COLORS[i%COLORS.length]}12`:'rgba(0,18,51,0.6)',border:`1px solid ${rank===0?COLORS[i%COLORS.length]+'30':'rgba(0,212,255,0.08)'}`}}>
                <span style={{fontSize:'1.1rem',width:28}}>{rank===0?'🥇':rank===1?'🥈':rank===2?'🥉':`#${rank+1}`}</span>
                <Avatar idx={i} size="xs"/>
                <span style={{flex:1,fontFamily:"'DM Sans',sans-serif",fontSize:'0.85rem',color:'rgba(255,255,255,0.8)'}}>{p.name}{(impIdxs||[]).includes(i)&&<span style={{color:'#FF3C78'}}> 🕵️</span>}</span>
                <span className="font-display" style={{fontSize:'1.3rem',color:COLORS[i%COLORS.length]}}>{p.score}pt</span>
              </div>
            ))}
          </div>
        </SectionCard>

        {isHost&&(
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            <Btn onClick={()=>{setLoading(true);(isLastRound?goLeaderboard:nextRound)(()=>setLoading(false));}} loading={loading}>
              {isLastRound?'FINAL LEADERBOARD ▶':'NEXT ROUND ▶'}
            </Btn>
            <button onClick={()=>{if(window.confirm('Exit game? All players will be sent back to home.')) exitGame();}} style={{padding:'10px',borderRadius:12,background:'transparent',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.3)',fontFamily:"'DM Sans',sans-serif",fontSize:'0.75rem',cursor:'pointer'}}>🚪 Exit Game</button>
          </div>
        )}
        {!isHost&&<p style={{textAlign:'center',fontSize:'0.8rem',color:'rgba(0,212,255,0.3)',padding:12,fontFamily:"'DM Sans',sans-serif"}}>Waiting for host…</p>}
      </div>
    </Screen>
  );
}

// ── LEADERBOARD ───────────────────────────────────────────
export function LeaderboardScreen() {
  const { room, myIdx, playAgain, exitGame } = useGame();
  if(!room) return null;
  const isHost = myIdx===0;
  const sorted = [...room.players].map((p,i)=>({p,i})).filter(({p})=>p.name&&!p.removed).sort((a,b)=>b.p.score-a.p.score);
  const winner = sorted[0];
  const winnerColor = winner?COLORS[winner.i%COLORS.length]:'#00D4FF';

  return (
    <Screen>
      <div className="w-full max-w-sm pt-2 animate-fade-up">
        <div style={{textAlign:'center',marginBottom:20}}>
          <p style={{fontSize:'0.65rem',letterSpacing:'0.5em',color:'rgba(0,212,255,0.4)',marginBottom:4,fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>GAME OVER</p>
          <h1 className="font-display cyber-text animate-flicker" style={{fontSize:'4rem',letterSpacing:'0.06em'}}>RESULTS</h1>
        </div>

        {/* Winner */}
        {winner&&(
          <div className="rounded-xl p-5 text-center mb-4 relative overflow-hidden"
            style={{background:`${winnerColor}10`,border:`1px solid ${winnerColor}40`,boxShadow:`0 0 40px ${winnerColor}15`}}>
            <div style={{fontSize:'2.5rem',marginBottom:8,animation:'cyberPulse 2s ease-in-out infinite'}}>🏆</div>
            <p style={{fontSize:'0.6rem',letterSpacing:'0.3em',color:`${winnerColor}99`,marginBottom:4,fontFamily:"'DM Sans',sans-serif",fontWeight:700}}>WINNER</p>
            <p className="font-display" style={{fontSize:'2.5rem',color:'white',textShadow:`0 0 20px ${winnerColor}50`}}>{winner.p.name}</p>
            <p className="font-display" style={{fontSize:'1.8rem',color:winnerColor,marginTop:4}}>{winner.p.score} pts</p>
          </div>
        )}

        <SectionCard>
          <Label>FINAL STANDINGS</Label>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {sorted.map(({p,i},rank)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:10,background:rank===0?`${COLORS[i%COLORS.length]}12`:'rgba(0,18,51,0.6)',border:`1px solid ${rank===0?COLORS[i%COLORS.length]+'30':'rgba(0,212,255,0.08)'}`}}>
                <span style={{fontSize:'1.2rem',width:30}}>{rank===0?'🥇':rank===1?'🥈':rank===2?'🥉':`#${rank+1}`}</span>
                <Avatar idx={i} size="sm"/>
                <span style={{flex:1,fontFamily:"'DM Sans',sans-serif",fontWeight:rank===0?700:400,color:rank===0?'white':'rgba(255,255,255,0.6)'}}>{p.name}</span>
                <span className="font-display" style={{fontSize:'1.5rem',color:rank===0?COLORS[i%COLORS.length]:'rgba(0,212,255,0.4)'}}>{p.score}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        {isHost?(
          <div style={{display:'flex',flexDirection:'column',gap:8,marginTop:8}}>
            <Btn onClick={playAgain}>PLAY AGAIN ▶</Btn>
            <button onClick={()=>exitGame()} style={{padding:'10px',borderRadius:12,background:'transparent',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.3)',fontFamily:"'DM Sans',sans-serif",fontSize:'0.75rem',cursor:'pointer'}}>🚪 Exit Game</button>
          </div>
        ):(
          <p style={{textAlign:'center',fontSize:'0.8rem',color:'rgba(0,212,255,0.3)',padding:12,fontFamily:"'DM Sans',sans-serif"}}>Waiting for host to start again…</p>
        )}
      </div>
    </Screen>
  );
}
