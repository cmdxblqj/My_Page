/* ═══════════════════════════════════ DOT MATRIX TITLE ═══════════════════════════════════
 *  "SMART.SENPAI" — single-row dot-matrix title, 8×16 bitmap per character,
 *  vertically elongated for maximum readability & screen presence.
 *  Dot radius fades from small (top) to large (bottom) for depth.
 *  Dots displace from mouse / orbital buttons, spring back, repel each other.
 *
 *  Design: oversized LED dot-matrix sign, brutalist & legible.
 *  ══════════════════════════════════════════════════════════════════════════════════════ */
(function() {
  const CANVAS_W = 1920, CANVAS_H = 1080;

  // ─── Bitmap font: 8 columns × 16 rows — tall, readable pixel letters ───
  const CHAR_DEFS = {
    'S': { w:8, rows: [
      '        ',
      '  ##### ',
      ' ##   ##',
      '##     #',
      '##      ',
      ' ##     ',
      '  ###   ',
      '    ##  ',
      '     ## ',
      '      ##',
      ' #    ##',
      '##   ## ',
      ' #####  ',
      '        ',
      '        ',
      '        ',
    ]},
    'M': { w:8, rows: [
      '        ',
      '##    ##',
      '###  ###',
      '########',
      '## ## ##',
      '## ## ##',
      '## ## ##',
      '##    ##',
      '##    ##',
      '##    ##',
      '##    ##',
      '##    ##',
      '##    ##',
      '        ',
      '        ',
      '        ',
    ]},
    'A': { w:8, rows: [
      '        ',
      '   ##   ',
      '  ####  ',
      ' ###### ',
      ' ##  ## ',
      '##    ##',
      '##    ##',
      '########',
      '########',
      '##    ##',
      '##    ##',
      '##    ##',
      '##    ##',
      '        ',
      '        ',
      '        ',
    ]},
    'R': { w:8, rows: [
      '        ',
      '########',
      '##    ##',
      '##    ##',
      '##    ##',
      '##   ## ',
      '########',
      '#####   ',
      '## ##   ',
      '##  ##  ',
      '##   ## ',
      '##    ##',
      '##    ##',
      '        ',
      '        ',
      '        ',
    ]},
    'T': { w:8, rows: [
      '        ',
      '########',
      '########',
      '   ##   ',
      '   ##   ',
      '   ##   ',
      '   ##   ',
      '   ##   ',
      '   ##   ',
      '   ##   ',
      '   ##   ',
      '   ##   ',
      '   ##   ',
      '        ',
      '        ',
      '        ',
    ]},
    '.': { w:4, rows: [
      '    ',
      '    ',
      '    ',
      '    ',
      '    ',
      '    ',
      '    ',
      '    ',
      '    ',
      '    ',
      ' ## ',
      '####',
      '####',
      ' ## ',
      '    ',
      '    ',
    ]},
    'E': { w:8, rows: [
      '        ',
      '########',
      '########',
      '##      ',
      '##      ',
      '##      ',
      '######  ',
      '######  ',
      '##      ',
      '##      ',
      '##      ',
      '########',
      '########',
      '        ',
      '        ',
      '        ',
    ]},
    'N': { w:8, rows: [
      '        ',
      '##   ##',
      '###  ##',
      '#### ##',
      '###### ',
      '## ### ',
      '##  ###',
      '##   ##',
      '##   ##',
      '##   ##',
      '##   ##',
      '##   ##',
      '##   ##',
      '        ',
      '        ',
      '        ',
    ]},
    'P': { w:8, rows: [
      '        ',
      '########',
      '##    ##',
      '##    ##',
      '##    ##',
      '##   ## ',
      '########',
      '#####   ',
      '##      ',
      '##      ',
      '##      ',
      '##      ',
      '##      ',
      '        ',
      '        ',
      '        ',
    ]},
    'I': { w:8, rows: [
      '        ',
      '########',
      '########',
      '   ##   ',
      '   ##   ',
      '   ##   ',
      '   ##   ',
      '   ##   ',
      '   ##   ',
      '   ##   ',
      '   ##   ',
      '########',
      '########',
      '        ',
      '        ',
      '        ',
    ]},
  };

  const TITLE = 'SMART.SENPAI';
  const ROWS = 16;             // bitmap rows per character (tall!)
  const GAP_COLS = 3;          // empty columns between chars (breathing room)

  // ─── Layout math ───
  let totalCols = 0;
  for (let i = 0; i < TITLE.length; i++) {
    totalCols += CHAR_DEFS[TITLE[i]].w;
    if (i < TITLE.length - 1) totalCols += GAP_COLS;
  }

  const cellSize = CANVAS_W / totalCols;
  const titleHeight = ROWS * cellSize;
  const titleY = (CANVAS_H - titleHeight) / 2;   // vertically centered

  // Dot radius: driven by row within the title (top→small, bottom→large)
  const R_MIN = cellSize * 0.14;
  const R_MAX = cellSize * 0.44;

  // ─── Physics constants ───
  const MOUSE_REPEL = 150;
  const BTN_REPEL   = 270;
  const FORCE       = 28;
  const SPRING      = 0.07;
  const DAMPING     = 0.88;   // stronger damping → faster settle, no jitter

  const DOT_REPEL_RADIUS = 14;     // < cellSize(15.4px) — only repel when pushed together
  const DOT_REPEL_FORCE  = 2.8;    // gentler push, won't overshoot
  const SPATIAL_CELL = 50;
  const GRID_COLS = Math.ceil(CANVAS_W / SPATIAL_CELL);
  const GRID_ROWS = Math.ceil(CANVAS_H / SPATIAL_CELL);
  const GRID_SIZE = GRID_COLS * GRID_ROWS;
  const grid = new Array(GRID_SIZE);

  // ─── Canvas ───
  const canvas = document.createElement('canvas');
  canvas.id = 'dotMatrixCanvas';
  canvas.width = CANVAS_W;
  canvas.height = CANVAS_H;
  canvas.setAttribute('aria-hidden', 'true');
  const ctx = canvas.getContext('2d');

  // ─── Build dots ───
  const dots = [];

  function radiusForRow(row) {
    const t = (ROWS - 1 - row) / (ROWS - 1);  // 0=bottom row, 1=top row
    return R_MIN + (R_MAX - R_MIN) * (1 - t);  // bottom→big, top→small
  }

  let colCursor = 0;
  for (let i = 0; i < TITLE.length; i++) {
    const ch = TITLE[i];
    const def = CHAR_DEFS[ch];

    for (let row = 0; row < ROWS; row++) {
      const rowStr = def.rows[row];
      for (let col = 0; col < def.w; col++) {
        if (rowStr[col] === '#') {
          const hx = (colCursor + col + 0.5) * cellSize;
          const hy = titleY + (row + 0.5) * cellSize;
          dots.push({
            hx, hy,
            x: hx, y: hy,
            vx: 0, vy: 0,
            radius: radiusForRow(row),
          });
        }
      }
    }
    colCursor += def.w + GAP_COLS;
  }

  // ─── Mouse state ───
  let mouseX = -999, mouseY = -999, mouseActive = false;
  let appWrapper = null;

  // ─── Orbital button centers ───
  function getButtonCenters() {
    const out = [];
    if (window.OrbitalExperience && window.OrbitalExperience.getButtons) {
      for (const b of window.OrbitalExperience.getButtons()) {
        if (!b.wrapper || !b.wrapper.style) continue;
        const l = parseFloat(b.wrapper.style.left);
        const t = parseFloat(b.wrapper.style.top);
        if (isNaN(l) || isNaN(t)) continue;
        const op = parseFloat(b.svg.style.opacity);
        if (isNaN(op) || op < 0.05) continue;
        out.push({ cx: l + 210, cy: t + 210 });
      }
    }
    return out;
  }

  // ─── Physics ───
  function update(btns) {
    // Rebuild spatial hash
    for (let i = 0; i < GRID_SIZE; i++) grid[i] = null;
    for (const d of dots) {
      const cx = (d.x / SPATIAL_CELL) | 0;
      const cy = (d.y / SPATIAL_CELL) | 0;
      if (cx >= 0 && cx < GRID_COLS && cy >= 0 && cy < GRID_ROWS) {
        const idx = cy * GRID_COLS + cx;
        d._next = grid[idx];
        grid[idx] = d;
      } else {
        d._next = null;
      }
    }

    for (const d of dots) {
      // Mouse repel
      if (mouseActive) {
        const dx = d.x - mouseX, dy = d.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_REPEL && dist > 0.3) {
          const f = (1 - dist / MOUSE_REPEL) * FORCE;
          d.vx += (dx / dist) * f;
          d.vy += (dy / dist) * f;
        }
      }

      // Button repel
      for (const b of btns) {
        const dx = d.x - b.cx, dy = d.y - b.cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < BTN_REPEL && dist > 0.3) {
          const f = (1 - dist / BTN_REPEL) * FORCE * 1.3;
          d.vx += (dx / dist) * f;
          d.vy += (dy / dist) * f;
        }
      }

      // Dot-to-dot repulsion (spatial hash: 9-neighbor cells)
      const cx = (d.x / SPATIAL_CELL) | 0;
      const cy = (d.y / SPATIAL_CELL) | 0;
      for (let dy = -1; dy <= 1; dy++) {
        const ny = cy + dy;
        if (ny < 0 || ny >= GRID_ROWS) continue;
        for (let dx = -1; dx <= 1; dx++) {
          const nx = cx + dx;
          if (nx < 0 || nx >= GRID_COLS) continue;
          let other = grid[ny * GRID_COLS + nx];
          while (other) {
            if (other !== d) {
              const rx = d.x - other.x, ry = d.y - other.y;
              const dist = Math.sqrt(rx * rx + ry * ry);
              if (dist < DOT_REPEL_RADIUS && dist > 0.06) {
                const f = (1 - dist / DOT_REPEL_RADIUS) * DOT_REPEL_FORCE;
                d.vx += (rx / dist) * f;
                d.vy += (ry / dist) * f;
              }
            }
            other = other._next;
          }
        }
      }

      // Spring
      d.vx += (d.hx - d.x) * SPRING;
      d.vy += (d.hy - d.y) * SPRING;
      d.vx *= DAMPING;
      d.vy *= DAMPING;

      d.x += d.vx;
      d.y += d.vy;
    }
  }

  // ─── Render ───
  let opacity = 0, targetOpacity = 0, isActive = false;

  function render() {
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    if (opacity < 0.004) return;

    for (const d of dots) {
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.radius, 0, Math.PI * 2);

      // Larger dots get a subtle glow halo
      if (d.radius > 4.5) {
        ctx.globalAlpha = opacity * 0.25;
        ctx.shadowColor = 'rgba(255,255,255,0.3)';
        ctx.shadowBlur = d.radius * 0.65;
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      ctx.globalAlpha = opacity * 0.78;
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // ─── Animation loop ───
  let raf = null;
  function loop() {
    if (!isActive && opacity < 0.002) { raf = null; return; }
    raf = requestAnimationFrame(loop);
    opacity += (targetOpacity - opacity) * 0.06;
    if (Math.abs(targetOpacity - opacity) < 0.001) opacity = targetOpacity;
    if (opacity > 0.008) update(getButtonCenters());
    render();
  }

  // ─── Mouse → canvas mapping ───
  function map(e) {
    if (!appWrapper) return;
    const r = appWrapper.getBoundingClientRect();
    mouseX = (e.clientX - r.left) * (CANVAS_W / r.width);
    mouseY = (e.clientY - r.top)  * (CANVAS_H / r.height);
  }
  function move(e)  { map(e); mouseActive = true; }
  function leave()  { mouseActive = false; }
  function enter(e) { map(e); mouseActive = true; }

  // ─── Init ───
  function init() {
    appWrapper = document.getElementById('appWrapper');
    if (!appWrapper) { setTimeout(init, 300); return; }

    canvas.style.cssText =
      'position:absolute;top:0;left:0;' +
      'width:' + CANVAS_W + 'px;height:' + CANVAS_H + 'px;' +
      'z-index:40;pointer-events:none;';
    appWrapper.appendChild(canvas);

    window.addEventListener('mousemove', move, { passive: true });
    document.addEventListener('mouseleave', leave);
    appWrapper.addEventListener('mouseenter', enter);
    appWrapper.addEventListener('mouseleave', leave);

    setInterval(() => {
      const page = (window.OrbitalExperience && window.OrbitalExperience.getCurrentPage)
        ? window.OrbitalExperience.getCurrentPage() : 'orbital';
      targetOpacity = (page === 'orbital') ? 1 : 0;
      isActive = (page === 'orbital') || opacity > 0.008;
      if (isActive && !raf) raf = requestAnimationFrame(loop);
    }, 350);

    isActive = true;
    targetOpacity = 1;
    if (!raf) raf = requestAnimationFrame(loop);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 800));
  } else {
    setTimeout(init, 800);
  }

  window.DotMatrixTitle = {
    count: () => dots.length,
    reset() { for (const d of dots) { d.x = d.hx; d.y = d.hy; d.vx = 0; d.vy = 0; } },
  };
})();
