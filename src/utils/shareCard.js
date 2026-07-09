// Draws a shareable result card on a canvas and shares it via the Web Share API,
// falling back to WhatsApp text / clipboard where file sharing isn't available.

const PLAY_URL = 'https://play.google.com/store/apps/details?id=com.imposterindia.app';

function drawCard({ room, sorted }) {
  const W = 1080, H = 1080;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#000814';
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W / 2, 220, 50, W / 2, 220, 700);
  glow.addColorStop(0, 'rgba(0,212,255,0.16)');
  glow.addColorStop(1, 'rgba(0,212,255,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Frame
  ctx.strokeStyle = 'rgba(0,212,255,0.4)';
  ctx.lineWidth = 4;
  ctx.strokeRect(30, 30, W - 60, H - 60);

  ctx.textAlign = 'center';

  // Title
  ctx.fillStyle = '#00D4FF';
  ctx.font = '700 110px "Bebas Neue", Impact, sans-serif';
  ctx.fillText('IMPOSTER', W / 2, 165);
  ctx.fillStyle = 'rgba(0,212,255,0.7)';
  ctx.font = '700 34px "DM Sans", sans-serif';
  ctx.fillText('I N D I A   E D I T I O N', W / 2, 215);

  // Winner
  const winner = sorted[0];
  ctx.font = '90px sans-serif';
  ctx.fillText('🏆', W / 2, 350);
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = '700 30px "DM Sans", sans-serif';
  ctx.fillText('W I N N E R', W / 2, 405);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 92px "Bebas Neue", Impact, sans-serif';
  ctx.fillText(winner.p.name.toUpperCase(), W / 2, 495);
  ctx.fillStyle = '#00D4FF';
  ctx.font = '700 54px "Bebas Neue", Impact, sans-serif';
  ctx.fillText(`${winner.p.score} PTS`, W / 2, 560);

  // Standings (top 5)
  const top = sorted.slice(0, 5);
  const rowH = 74;
  const startY = 630;
  const medals = ['🥇', '🥈', '🥉', '4.', '5.'];
  top.forEach((entry, i) => {
    const y = startY + i * rowH;
    ctx.fillStyle = i === 0 ? 'rgba(0,212,255,0.12)' : 'rgba(0,18,51,0.85)';
    roundRect(ctx, 120, y, W - 240, rowH - 12, 16);
    ctx.fill();
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.font = '600 38px "DM Sans", sans-serif';
    ctx.fillText(`${medals[i]}  ${entry.p.name}`, 150, y + 44);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#00D4FF';
    ctx.font = '700 44px "Bebas Neue", Impact, sans-serif';
    ctx.fillText(`${entry.p.score}`, W - 150, y + 46);
    ctx.textAlign = 'center';
  });

  // Footer
  ctx.fillStyle = 'rgba(0,212,255,0.55)';
  ctx.font = '700 30px "DM Sans", sans-serif';
  ctx.fillText('🕵️ Can you spot the imposter?', W / 2, H - 90);
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.font = '500 26px "DM Sans", sans-serif';
  ctx.fillText('Get IMPOSTER INDIA on Google Play', W / 2, H - 52);

  return canvas;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Returns 'shared' | 'whatsapp' | 'copied' so the caller can show feedback.
export async function shareResultCard({ room }) {
  const sorted = [...room.players]
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => p.name && !p.removed)
    .sort((a, b) => b.p.score - a.p.score);
  if (!sorted.length) return 'copied';

  const winner = sorted[0];
  const standings = sorted.slice(0, 5).map((e, i) => `${i + 1}. ${e.p.name} — ${e.p.score}pt`).join('\n');
  const text = `🏆 ${winner.p.name} wins IMPOSTER INDIA!\n\n${standings}\n\n🕵️ Can you spot the imposter? Play now:\n${PLAY_URL}`;

  // Try image share first
  try {
    const canvas = drawCard({ room, sorted });
    const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
    if (blob && navigator.canShare) {
      const file = new File([blob], 'imposter-india-result.png', { type: 'image/png' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text });
        return 'shared';
      }
    }
  } catch (e) {
    if (e && e.name === 'AbortError') return 'shared'; // user closed the sheet — done
  }

  // Text-only share
  try {
    if (navigator.share) {
      await navigator.share({ text });
      return 'shared';
    }
  } catch (e) {
    if (e && e.name === 'AbortError') return 'shared';
  }

  // WhatsApp web fallback
  try {
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    return 'whatsapp';
  } catch (e) {}

  try { await navigator.clipboard.writeText(text); } catch (e) {}
  return 'copied';
}
