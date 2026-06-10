export const COLORS = ['#00D4FF','#FF3C78','#00FF94','#FFB800','#C44DFF','#FF6B35','#00E5FF','#FF4081','#69FF47','#FF9100'];
export const EMOJIS = ['🎬','🎭','🎥','🍿','🎞','🎦','📽','🎪','🎨','🃏'];

// ── LOADING DOTS ──────────────────────────────────────────
export function LoadingDots() {
  return (
    <div style={{display:'flex',gap:8,justifyContent:'center',alignItems:'center'}}>
      {[0,1,2].map(i=>(
        <span key={i} style={{
          width:8,height:8,borderRadius:'50%',
          background:'#00D4FF',display:'block',
          animation:`dot-bounce 1s ease-in-out ${i*0.16}s infinite`,
        }}/>
      ))}
    </div>
  );
}

// ── SCREEN ────────────────────────────────────────────────
export function Screen({ children, className='', center=false }) {
  return (
    <div className={`cyber-bg min-h-screen w-full overflow-y-auto overflow-x-hidden
      ${center?'flex flex-col items-center justify-center':'flex flex-col items-center'}
      px-4 py-6 ${className}`}>
      {children}
    </div>
  );
}

// ── BUTTON ────────────────────────────────────────────────
export function Btn({ children, onClick, disabled, variant='primary', className='', loading, small }) {
  const base = `btn-press w-full font-display tracking-widest transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed relative overflow-hidden ${small?'py-3 text-base rounded-xl':'py-4 text-lg rounded-xl'}`;

  const styles = {
    primary: {
      background:'linear-gradient(135deg,#0099CC,#00D4FF)',
      color:'#000814',
      boxShadow:'0 0 20px rgba(0,212,255,0.4), 0 0 40px rgba(0,212,255,0.1)',
      border:'none',
    },
    secondary: {
      background:'rgba(0,18,51,0.8)',
      color:'#00D4FF',
      border:'1px solid rgba(0,212,255,0.3)',
      boxShadow:'0 0 10px rgba(0,212,255,0.1)',
    },
    danger: {
      background:'rgba(255,60,120,0.1)',
      color:'#FF3C78',
      border:'1px solid rgba(255,60,120,0.3)',
    },
    ghost: {
      background:'transparent',
      color:'rgba(0,212,255,0.4)',
      border:'none',
      fontSize:'0.85rem',
      letterSpacing:'0.05em',
      fontFamily:"'DM Sans',sans-serif",
      fontWeight:500,
    },
  };

  return (
    <button onClick={onClick} disabled={disabled||loading}
      className={`${base} ${className}`}
      style={styles[variant]}>
      {loading ? <LoadingDots /> : children}
    </button>
  );
}

// ── INPUT ─────────────────────────────────────────────────
export function Input({ value, onChange, placeholder, maxLength, className='', uppercase, autoFocus, onEnter }) {
  return (
    <input
      value={value}
      onChange={e=>onChange(uppercase?e.target.value.toUpperCase():e.target.value)}
      onKeyDown={e=>e.key==='Enter'&&onEnter&&onEnter()}
      placeholder={placeholder}
      maxLength={maxLength}
      autoFocus={autoFocus}
      className={`w-full rounded-xl px-4 py-3.5 font-body text-base outline-none transition-all duration-200
        ${uppercase?'tracking-[0.3em] font-display text-2xl text-center':''}
        ${className}`}
      style={{
        background:'rgba(0,18,51,0.8)',
        border:'1px solid rgba(0,212,255,0.2)',
        color:'#00D4FF',
      }}
      onFocus={e=>{e.target.style.borderColor='rgba(0,212,255,0.6)';e.target.style.boxShadow='0 0 15px rgba(0,212,255,0.2)';}}
      onBlur={e=>{e.target.style.borderColor='rgba(0,212,255,0.2)';e.target.style.boxShadow='none';}}
    />
  );
}

// ── AVATAR ────────────────────────────────────────────────
export function Avatar({ idx, size='md', pulse }) {
  const color = COLORS[idx%COLORS.length];
  const emoji = EMOJIS[idx%EMOJIS.length];
  const sizes = { xs:28, sm:36, md:48, lg:72, xl:96 };
  const fonts = { xs:'0.7rem', sm:'0.9rem', md:'1.2rem', lg:'1.8rem', xl:'2.5rem' };
  const s = sizes[size];
  return (
    <div style={{position:'relative',width:s,height:s,flexShrink:0}}>
      {pulse && <div style={{position:'absolute',inset:-4,borderRadius:'50%',background:color,opacity:0.2,animation:'ringPulse 1.5s ease-out infinite'}}/>}
      <div style={{
        width:s,height:s,borderRadius:'50%',
        background:`rgba(0,18,51,0.9)`,
        border:`2px solid ${color}`,
        display:'flex',alignItems:'center',justifyContent:'center',
        fontSize:fonts[size],
        boxShadow:`0 0 12px ${color}40`,
      }}>{emoji}</div>
    </div>
  );
}

// ── LABEL ─────────────────────────────────────────────────
export function Label({ children, className='' }) {
  return (
    <p className={`text-xs tracking-[0.35em] font-body font-bold uppercase mb-2 ${className}`}
      style={{color:'rgba(0,212,255,0.5)'}}>
      {children}
    </p>
  );
}

// ── CHIP ──────────────────────────────────────────────────
export function Chip({ label, active, onClick }) {
  return (
    <button onClick={onClick}
      className="btn-press px-3 py-2 rounded-lg text-sm font-body font-bold transition-all duration-200"
      style={{
        background: active?'linear-gradient(135deg,#0099CC,#00D4FF)':'rgba(0,18,51,0.8)',
        border: `1px solid ${active?'rgba(0,212,255,0.5)':'rgba(0,212,255,0.15)'}`,
        color: active?'#000814':'rgba(0,212,255,0.6)',
        boxShadow: active?'0 0 15px rgba(0,212,255,0.3)':'none',
      }}>
      {active?'✓ ':''}{label}
    </button>
  );
}

// ── SECTION CARD ──────────────────────────────────────────
export function SectionCard({ children, className='' }) {
  return (
    <div className={`rounded-xl p-4 mb-3 ${className}`}
      style={{background:'rgba(0,18,51,0.8)',border:'1px solid rgba(0,212,255,0.12)'}}>
      {children}
    </div>
  );
}

// ── PLAYER ROW ────────────────────────────────────────────
export function PlayerRow({ player, idx, isHost, isMe, onRemove, score }) {
  const color = COLORS[idx%COLORS.length];
  return (
    <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all"
      style={{
        background: isMe?`${color}12`:'rgba(0,18,51,0.6)',
        border:`1px solid ${isMe?color+'40':'rgba(0,212,255,0.08)'}`,
        boxShadow: isMe?`0 0 10px ${color}20`:'none',
      }}>
      <Avatar idx={idx} size="sm"/>
      <span className="flex-1 font-body text-sm font-medium" style={{color:isMe?color:'rgba(255,255,255,0.8)'}}>{player.name}</span>
      {score!==undefined && <span className="font-display text-lg" style={{color}}>{score}pt</span>}
      {isHost && <span className="text-xs font-bold" style={{color:'#FFB800'}}>👑</span>}
      {isMe&&!isHost && <span className="text-xs font-bold" style={{color}}>YOU</span>}
      {onRemove && (
        <button onClick={onRemove} className="w-6 h-6 rounded-md flex items-center justify-center text-xs"
          style={{background:'rgba(255,60,120,0.15)',color:'#FF3C78'}}>✕</button>
      )}
    </div>
  );
}

// ── DIVIDER ───────────────────────────────────────────────
export function Divider() {
  return <div className="w-full h-px my-4" style={{background:'linear-gradient(90deg,transparent,rgba(0,212,255,0.2),transparent)'}}/>;
}

// ── BACK BUTTON ───────────────────────────────────────────
export function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} className="btn-press flex items-center gap-2 mb-6 font-body text-sm"
      style={{color:'rgba(0,212,255,0.5)'}}>
      <span>←</span> Back
    </button>
  );
}
