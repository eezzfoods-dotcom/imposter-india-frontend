// ── BUTTON ────────────────────────────────────────────────
export function Btn({ children, onClick, disabled, variant = 'primary', className = '', loading }) {
  const base = 'w-full py-4 rounded-2xl font-display tracking-widest text-lg transition-all duration-200 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed';
  const variants = {
    primary:   'bg-gradient-to-r from-pink-600 to-purple-700 text-white shadow-lg shadow-pink-500/30',
    secondary: 'bg-white/10 border border-white/20 text-white',
    danger:    'bg-red-500/10 border border-red-400/50 text-red-400',
    ghost:     'bg-transparent text-white/50 text-sm tracking-normal font-body',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {loading ? <LoadingDots /> : children}
    </button>
  );
}

// ── INPUT ─────────────────────────────────────────────────
export function Input({ value, onChange, placeholder, maxLength, className = '', uppercase }) {
  return (
    <input
      value={value}
      onChange={e => onChange(uppercase ? e.target.value.toUpperCase() : e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      className={`w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-white/30 font-body text-base outline-none focus:border-pink-400 transition-colors ${uppercase ? 'tracking-widest font-display text-xl text-center' : ''} ${className}`}
    />
  );
}

// ── SCREEN WRAPPER ────────────────────────────────────────
export function Screen({ children, className = '' }) {
  return (
    <div className={`min-h-screen w-full bg-gradient-to-br from-[#0a0220] via-[#1a0533] to-[#0a0220] flex flex-col items-center justify-start overflow-y-auto px-4 py-6 ${className}`}>
      {children}
    </div>
  );
}

// ── CARD ──────────────────────────────────────────────────
export function Card({ children, className = '' }) {
  return (
    <div className={`w-full max-w-sm bg-white/5 border border-white/10 rounded-3xl p-5 ${className}`}>
      {children}
    </div>
  );
}

// ── LOADING DOTS ─────────────────────────────────────────
export function LoadingDots() {
  return (
    <div className="flex gap-1.5 justify-center">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-2 h-2 rounded-full bg-white animate-pulse-dot"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

// ── AVATAR ────────────────────────────────────────────────
const COLORS = ['#e74c3c','#e67e22','#2ecc71','#3498db','#9b59b6','#1abc9c','#f39c12','#e91e63','#00bcd4','#8bc34a','#ff5722','#607d8b'];
const EMOJIS = ['🎬','🎭','🎥','🍿','🎞','🎦','📽','🎪','🎨','🃏','🎯','🎲'];

export function Avatar({ idx, size = 'md' }) {
  const color = COLORS[idx % COLORS.length];
  const emoji = EMOJIS[idx % EMOJIS.length];
  const sizes = { sm: 'w-8 h-8 text-sm', md: 'w-11 h-11 text-xl', lg: 'w-16 h-16 text-3xl' };
  return (
    <div
      className={`${sizes[size]} rounded-xl flex items-center justify-center flex-shrink-0`}
      style={{ background: color }}
    >
      {emoji}
    </div>
  );
}

export { COLORS, EMOJIS };

// ── SECTION LABEL ─────────────────────────────────────────
export function Label({ children }) {
  return (
    <p className="text-white/40 text-xs tracking-[0.35em] font-body font-bold uppercase mb-2">
      {children}
    </p>
  );
}

// ── ERROR TOAST ───────────────────────────────────────────
export function ErrorToast({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="fixed top-4 left-4 right-4 z-50 bg-red-500/90 border border-red-400 rounded-2xl px-4 py-3 flex items-center gap-3">
      <span className="text-white font-body text-sm flex-1">{message}</span>
      <button onClick={onClose} className="text-white/70 text-lg">✕</button>
    </div>
  );
}

// ── PLAYER ROW ────────────────────────────────────────────
export function PlayerRow({ player, idx, isHost, isMe, onRemove }) {
  return (
    <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
      <Avatar idx={idx} size="sm" />
      <span className="flex-1 text-white font-body text-sm">{player.name}</span>
      {isHost && <span className="text-pink-400 text-xs font-bold">👑 HOST</span>}
      {isMe && !isHost && <span className="text-emerald-400 text-xs font-bold">YOU</span>}
      {onRemove && !isHost && !isMe && (
        <button onClick={onRemove} className="text-red-400 text-xs w-6 h-6 rounded-md bg-red-400/10 flex items-center justify-center">✕</button>
      )}
    </div>
  );
}
