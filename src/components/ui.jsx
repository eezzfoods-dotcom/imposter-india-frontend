export const COLORS = [
  '#FF3D71','#FF8C00','#00D68F','#3366FF',
  '#C044FF','#00B4D8','#F4A261','#E63946',
  '#06D6A0','#FFB703','#8338EC','#FB5607',
];
export const EMOJIS = ['🎬','🎭','🎥','🍿','🎞','🎦','📽','🎪','🎨','🃏','🎯','🎲'];

// ── LOADING DOTS ──────────────────────────────────────────
export function LoadingDots({ color = 'white' }) {
  return (
    <div className="flex gap-2 justify-center items-center">
      {[0,1,2].map(i => (
        <span key={i} style={{
          width: 8, height: 8, borderRadius: '50%',
          background: color, display: 'block',
          animation: `dot-bounce 1s ease-in-out ${i * 0.16}s infinite`,
        }} />
      ))}
    </div>
  );
}

// ── SCREEN ────────────────────────────────────────────────
export function Screen({ children, className = '', center = false }) {
  return (
    <div className={`grain min-h-screen w-full overflow-y-auto overflow-x-hidden
      ${center ? 'flex flex-col items-center justify-center' : 'flex flex-col items-center'}
      px-4 py-6 ${className}`}
      style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(156,39,176,0.25) 0%, transparent 60%), radial-gradient(ellipse 60% 40% at 80% 100%, rgba(233,30,99,0.15) 0%, transparent 50%), #050010' }}>
      {children}
    </div>
  );
}

// ── BUTTON ────────────────────────────────────────────────
export function Btn({ children, onClick, disabled, variant = 'primary', className = '', loading, small }) {
  const base = `btn-press w-full font-display tracking-widest transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed relative overflow-hidden ${small ? 'py-3 text-base rounded-xl' : 'py-4 text-lg rounded-2xl'}`;

  const variants = {
    primary: 'glow-pink',
    secondary: 'glass',
    danger: '',
    ghost: 'font-body text-sm tracking-normal',
  };

  const styles = {
    primary:   { background: 'linear-gradient(135deg, #E91E63, #9C27B0)', boxShadow: '0 4px 24px rgba(233,30,99,0.4)' },
    secondary: {},
    danger:    { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' },
    ghost:     { color: 'rgba(255,255,255,0.4)', background: 'transparent' },
  };

  return (
    <button onClick={onClick} disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${className}`}
      style={styles[variant]}>
      {loading ? <LoadingDots /> : children}
    </button>
  );
}

// ── INPUT ─────────────────────────────────────────────────
export function Input({ value, onChange, placeholder, maxLength, className = '', uppercase, autoFocus, onEnter }) {
  return (
    <input
      value={value}
      onChange={e => onChange(uppercase ? e.target.value.toUpperCase() : e.target.value)}
      onKeyDown={e => e.key === 'Enter' && onEnter && onEnter()}
      placeholder={placeholder}
      maxLength={maxLength}
      autoFocus={autoFocus}
      className={`w-full rounded-2xl px-4 py-3.5 font-body text-base outline-none transition-all duration-200
        ${uppercase ? 'tracking-[0.3em] font-display text-2xl text-center' : ''}
        ${className}`}
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.12)',
        color: 'white',
      }}
      onFocus={e => e.target.style.borderColor = 'rgba(233,30,99,0.6)'}
      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
    />
  );
}

// ── AVATAR ────────────────────────────────────────────────
export function Avatar({ idx, size = 'md', pulse }) {
  const color = COLORS[idx % COLORS.length];
  const emoji = EMOJIS[idx % EMOJIS.length];
  const sizes = { xs: 28, sm: 36, md: 48, lg: 72, xl: 96 };
  const fonts = { xs: '0.7rem', sm: '0.9rem', md: '1.3rem', lg: '2rem', xl: '2.8rem' };
  const s = sizes[size];
  return (
    <div style={{ position: 'relative', width: s, height: s, flexShrink: 0 }}>
      {pulse && <div style={{
        position: 'absolute', inset: -4, borderRadius: '50%',
        background: color, opacity: 0.3,
        animation: 'pulse-ring 1.5s ease-out infinite',
      }} />}
      <div style={{
        width: s, height: s, borderRadius: '50%',
        background: `${color}22`, border: `2px solid ${color}66`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: fonts[size],
      }}>
        {emoji}
      </div>
    </div>
  );
}

// ── LABEL ─────────────────────────────────────────────────
export function Label({ children, className = '' }) {
  return (
    <p className={`text-xs tracking-[0.35em] font-body font-bold uppercase mb-2 ${className}`}
      style={{ color: 'rgba(255,255,255,0.35)' }}>
      {children}
    </p>
  );
}

// ── TOGGLE CHIP ───────────────────────────────────────────
export function Chip({ label, active, onClick, color }) {
  return (
    <button onClick={onClick} className="btn-press px-3 py-2 rounded-xl text-sm font-body font-bold transition-all duration-200"
      style={{
        background: active ? (color || 'linear-gradient(135deg, #E91E63, #9C27B0)') : 'rgba(255,255,255,0.06)',
        border: `1px solid ${active ? 'transparent' : 'rgba(255,255,255,0.1)'}`,
        color: active ? 'white' : 'rgba(255,255,255,0.5)',
        boxShadow: active ? '0 2px 12px rgba(233,30,99,0.3)' : 'none',
      }}>
      {active ? '✓ ' : ''}{label}
    </button>
  );
}

// ── SECTION CARD ──────────────────────────────────────────
export function SectionCard({ children, className = '' }) {
  return (
    <div className={`rounded-2xl p-4 mb-3 ${className}`}
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      {children}
    </div>
  );
}

// ── PLAYER ROW ────────────────────────────────────────────
export function PlayerRow({ player, idx, isHost, isMe, onRemove, score }) {
  const color = COLORS[idx % COLORS.length];
  return (
    <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all"
      style={{ background: isMe ? `${color}15` : 'rgba(255,255,255,0.04)', border: `1px solid ${isMe ? color + '40' : 'rgba(255,255,255,0.07)'}` }}>
      <Avatar idx={idx} size="sm" />
      <span className="flex-1 font-body text-sm font-medium" style={{ color: isMe ? color : 'rgba(255,255,255,0.85)' }}>
        {player.name}
      </span>
      {score !== undefined && (
        <span className="font-display text-lg" style={{ color }}>{score}pt</span>
      )}
      {isHost && <span className="text-xs font-bold" style={{ color: '#FFB700' }}>👑</span>}
      {isMe && !isHost && <span className="text-xs font-bold" style={{ color }}>YOU</span>}
      {onRemove && (
        <button onClick={onRemove} className="w-6 h-6 rounded-lg flex items-center justify-center text-xs transition-all"
          style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>✕</button>
      )}
    </div>
  );
}

// ── DIVIDER ───────────────────────────────────────────────
export function Divider() {
  return <div className="w-full h-px my-4" style={{ background: 'rgba(255,255,255,0.06)' }} />;
}

// ── BACK BUTTON ───────────────────────────────────────────
export function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} className="btn-press flex items-center gap-2 mb-6 font-body text-sm"
      style={{ color: 'rgba(255,255,255,0.4)' }}>
      <span style={{ fontSize: '1.1rem' }}>←</span> Back
    </button>
  );
}
