// Live 2D canvas oscilloscope pill showing split-phase L1 (+120V), L2 (-120V), Neutral (0V),
// and a clear 0V emerald flatline readout when the branch breaker is shut OFF for safe wiring.

export function createOscilloscope() {
  const canvas = document.getElementById('oscilloscope-canvas');
  const ctx = canvas.getContext('2d');
  const phaseLabel = document.getElementById('osc-phase-label');
  const freezeBtn = document.getElementById('btn-wave-freeze');

  let frozen = false;
  let onFreezeToggle = null;

  const cssW = 136;
  const cssH = 44;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = cssW * dpr;
  canvas.height = cssH * dpr;
  ctx.scale(dpr, dpr);

  freezeBtn.addEventListener('click', () => {
    frozen = !frozen;
    freezeBtn.setAttribute('aria-pressed', String(frozen));
    if (onFreezeToggle) onFreezeToggle(frozen);
  });

  function render(ac, tl) {
    ctx.clearRect(0, 0, cssW, cssH);

    const midY = cssH * 0.5;
    const amp = cssH * 0.34;
    const cursorX = cssW - 14;
    const breakerOn = !tl || tl.breakerOn;

    // Neutral 0V midline
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.28)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(cssW, midY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Split-phase L2 & L1 waves (dimmed in background when branch breaker is OFF)
    ctx.globalAlpha = breakerOn ? 1.0 : 0.22;

    ctx.strokeStyle = '#fb7185';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let x = 0; x <= cursorX; x += 2) {
      const p = ac.phi - ((cursorX - x) / cursorX) * Math.PI * 2.5;
      const y = midY + Math.sin(p) * amp;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    for (let x = 0; x <= cursorX; x += 2) {
      const p = ac.phi - ((cursorX - x) / cursorX) * Math.PI * 2.5;
      const y = midY - Math.sin(p) * amp;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.globalAlpha = 1.0;

    if (!breakerOn) {
      // Crisp 0V emerald flatline on the isolated branch circuit
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.moveTo(0, midY);
      ctx.lineTo(cursorX, midY);
      ctx.stroke();

      ctx.fillStyle = '#34d399';
      ctx.beginPath();
      ctx.arc(cursorX, midY, 3.0, 0, Math.PI * 2);
      ctx.fill();

      phaseLabel.textContent = '0V SAFE';
      phaseLabel.style.color = '#34d399';
      return;
    }

    const yL1 = midY - ac.sinPhi * amp;
    const yL2 = midY + ac.sinPhi * amp;

    ctx.fillStyle = '#fb7185';
    ctx.beginPath();
    ctx.arc(cursorX, yL2, 2.7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(cursorX, yL1, 3.2, 0, Math.PI * 2);
    ctx.fill();

    const vRounded = Math.round(ac.vL1RmsInstant);
    const sign = vRounded > 0 ? '+' : '';
    phaseLabel.textContent = `${sign}${vRounded} V`;
    phaseLabel.style.color = vRounded >= 0 ? '#fbbf24' : '#fb7185';
  }

  return {
    render,
    isFrozen: () => frozen,
    setOnFreezeToggle: (fn) => { onFreezeToggle = fn; },
  };
}
