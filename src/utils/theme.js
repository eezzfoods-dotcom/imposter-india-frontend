// Theme utility - persists to localStorage
export function getTheme() {
  return localStorage.getItem('ii_theme') || 'dark';
}

export function setTheme(theme) {
  localStorage.setItem('ii_theme', theme);
  applyTheme(theme);
}

export function applyTheme(theme) {
  const root = document.documentElement;
  if (theme === 'light') {
    root.style.setProperty('--bg-primary', '#f0f4ff');
    root.style.setProperty('--bg-card', '#ffffff');
    root.style.setProperty('--bg-card2', '#e8eeff');
    root.style.setProperty('--text-primary', '#0a1628');
    root.style.setProperty('--text-secondary', '#334155');
    root.style.setProperty('--text-muted', '#64748b');
    root.style.setProperty('--border', 'rgba(0,0,150,0.12)');
    root.style.setProperty('--accent', '#0066cc');
    root.style.setProperty('--accent2', '#0099ff');
    root.style.setProperty('--cyber-bg', '#f0f4ff');
  } else {
    root.style.setProperty('--bg-primary', '#000814');
    root.style.setProperty('--bg-card', 'rgba(0,18,51,0.8)');
    root.style.setProperty('--bg-card2', 'rgba(0,18,51,0.6)');
    root.style.setProperty('--text-primary', '#ffffff');
    root.style.setProperty('--text-secondary', 'rgba(255,255,255,0.8)');
    root.style.setProperty('--text-muted', 'rgba(0,212,255,0.4)');
    root.style.setProperty('--border', 'rgba(0,212,255,0.15)');
    root.style.setProperty('--accent', '#0099CC');
    root.style.setProperty('--accent2', '#00D4FF');
    root.style.setProperty('--cyber-bg', '#000814');
  }
  document.body.dataset.theme = theme;
}

export function toggleTheme() {
  const current = getTheme();
  const next = current === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
}
