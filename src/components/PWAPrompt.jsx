import { useState, useEffect } from 'react';

export function PWAPrompt() {
  const [prompt, setPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    if (localStorage.getItem('pwa_dismissed')) return;

    // iOS detection
    const ios = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    setIsIOS(ios);

    // Android install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setPrompt(e);
      setTimeout(() => setShowBanner(true), 3000);
    });

    // Show iOS instruction after delay
    if (ios) setTimeout(() => setShowBanner(true), 4000);
  }, []);

  function install() {
    if (prompt) {
      prompt.prompt();
      prompt.userChoice.then(() => setShowBanner(false));
    }
  }

  function dismiss() {
    setShowBanner(false);
    localStorage.setItem('pwa_dismissed', '1');
  }

  if (!showBanner) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 70, left: 16, right: 16,
      zIndex: 8000,
      background: 'linear-gradient(135deg, #000c28, #001540)',
      border: '1px solid rgba(0,212,255,0.4)',
      borderRadius: 20,
      padding: '16px 18px',
      boxShadow: '0 8px 40px rgba(0,0,0,0.8)',
      animation: 'slideUp 0.4s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ fontSize: '2rem' }}>📱</div>
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '1.1rem', color: '#00D4FF', letterSpacing: '0.05em', marginBottom: 4 }}>
            INSTALL THE APP
          </p>
          <p style={{ fontFamily: "'DM Sans',sans-serif", fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', marginBottom: 12, lineHeight: 1.5 }}>
            {isIOS
              ? "Tap the Share button → 'Add to Home Screen' for the best experience"
              : "Install Imposter India for faster loading and offline play!"}
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            {!isIOS && (
              <button onClick={install} style={{
                flex: 2, padding: '8px', borderRadius: 10,
                background: 'linear-gradient(135deg,#0099CC,#00D4FF)',
                border: 'none', color: '#000814',
                fontFamily: "'Bebas Neue',sans-serif", fontSize: '0.9rem',
                letterSpacing: '0.1em', cursor: 'pointer',
              }}>INSTALL ▶</button>
            )}
            <button onClick={dismiss} style={{
              flex: 1, padding: '8px', borderRadius: 10,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.4)',
              fontFamily: "'DM Sans',sans-serif", fontSize: '0.78rem',
              cursor: 'pointer',
            }}>Later</button>
          </div>
        </div>
      </div>
    </div>
  );
}
