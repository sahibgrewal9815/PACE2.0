/* PACE shared runtime — loaded by every page (before the page's own script) */
(function () {
  const P = (window.PACE = {});

  // ── Supabase (public anon key — row access is limited; passwords live in private tables) ──
  P.SB_URL = 'https://blnqehdnorjvboxcqiap.supabase.co';
  P.SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsbnFlaGRub3JqdmJveGNxaWFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUxNzEzNjUsImV4cCI6MjExMDc0NzM2NX0.gMJ1LuHZ9SpN6_2hsO6XJJXr67qFrOgyM-GRRfziXVs';
  P.VAPID_PUBLIC = 'BLF3Z1CR2sKEdzIqJT5kp_EqEPRqsNsvAl9ho8_Hj0HjZKr6iiWOM15a1NCFQGy04jgL2wspa69tS5TT2eGPTu0';
  P.H = { 'Content-Type': 'application/json', apikey: P.SB_KEY, Authorization: `Bearer ${P.SB_KEY}` };

  P.rest = async function (path, opts = {}) {
    const r = await fetch(`${P.SB_URL}/rest/v1/${path}`, { ...opts, headers: { ...P.H, ...(opts.headers || {}) } });
    if (!r.ok) { const t = await r.text(); const e = new Error(t || r.statusText); e.status = r.status; throw e; }
    const txt = await r.text();
    return txt ? JSON.parse(txt) : null;
  };
  P.rpc = (fn, args = {}) => P.rest(`rpc/${fn}`, { method: 'POST', body: JSON.stringify(args) });

  // ── Device identity (for one-phone-per-account) ──
  P.deviceId = function () {
    let d = localStorage.getItem('pace2_device');
    if (!d) {
      d = (crypto.randomUUID ? crypto.randomUUID() : 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2));
      localStorage.setItem('pace2_device', d);
    }
    return d;
  };

  // ── Helpers ──
  P.esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  P.localISO = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  P.DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  P.DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  P.MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  P.isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  P.isStandalone = () => window.navigator.standalone === true || matchMedia('(display-mode: standalone)').matches;
  P.fmt12 = hhmm => { if (!hhmm) return ''; const [h, m] = hhmm.split(':').map(Number); return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`; };
  P.pips = (n, on) => Array.from({ length: n }, (_, i) => `<i class="${i < on ? 'on' : ''}"></i>`).join('');
  P.empty = (t, s = '') => `<div class="empty"><div class="e-dots"></div><div class="e-title">${t}</div>${s ? `<div class="e-sub">${s}</div>` : ''}</div>`;

  let toastT;
  P.toast = function (msg, type = '') {
    let t = document.getElementById('toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = msg; t.className = 'toast show ' + type;
    clearTimeout(toastT); toastT = setTimeout(() => (t.className = 'toast'), 2600);
  };

  // ── Dot-matrix glyphs (5×7) ──
  const G = {
    '0': ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
    '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
    '2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
    '3': ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
    '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
    '5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
    '6': ['00110', '01000', '10000', '11110', '10001', '10001', '01110'],
    '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
    '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
    '9': ['01110', '10001', '10001', '01111', '00001', '00010', '01100'],
    'P': ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
    'A': ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
    'C': ['01110', '10001', '10000', '10000', '10000', '10001', '01110'],
    'E': ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
    ':': ['0', '0', '1', '0', '1', '0', '0'],
    '.': ['0', '0', '0', '0', '0', '0', '1'],
    '/': ['00001', '00010', '00010', '00100', '01000', '01000', '10000'],
    '%': ['11001', '11010', '00010', '00100', '01000', '01011', '10011'],
    '—': ['000', '000', '000', '111', '000', '000', '000'],
    '-': ['000', '000', '000', '111', '000', '000', '000'],
    ' ': ['0', '0', '0', '0', '0', '0', '0'],
  };
  P.matrix = function (str, cell, opts = {}) {
    const r = cell * (opts.r || 0.38);
    let x = 0, on = '', off = '', blink = '';
    for (const ch of String(str)) {
      const g = G[ch]; if (!g) continue;
      const w = g[0].length;
      for (let row = 0; row < 7; row++) for (let col = 0; col < w; col++) {
        const c = `<circle cx="${(x + col) * cell + cell / 2}" cy="${row * cell + cell / 2}" r="${r}"/>`;
        if (g[row][col] === '1') { if (ch === ':' && opts.blinkColon) blink += c; else on += c; }
        else if (opts.grid !== false && ch !== ' ') off += c;
      }
      x += w + 1;
    }
    const W = Math.max(0, x - 1) * cell, H = 7 * cell;
    return `<svg class="mx" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="currentColor" role="img" aria-label="${str}">`
      + `<g class="off">${off}</g><g>${on}</g><g class="blink">${blink}</g></svg>`;
  };
  P.setMx = (el, str, cell, opts) => {
    if (typeof el === 'string') el = document.getElementById(el);
    if (el && el.dataset.v !== String(str)) { el.dataset.v = str; el.innerHTML = P.matrix(str, cell, opts); }
  };

  // ── Real screen height (iOS home-screen apps can under-report it to CSS) ──
  const root = document.documentElement;
  function fit() {
    // Use exactly the area the phone shows. (Forcing screen.height pushed the bar into
    // the strip some iPhones don't let web apps draw into, cutting it off.)
    const h = window.innerHeight;
    if (P.keyboardOpen) return;          // don't shrink the layout while the keyboard is up
    root.style.setProperty('--app-h', h + 'px');
  }
  P.fit = fit;
  fit();
  ['resize', 'orientationchange', 'pageshow'].forEach(e => window.addEventListener(e, () => { fit(); setTimeout(fit, 300); }));
  [50, 300, 1000, 2500].forEach(t => setTimeout(fit, t));

  // ── Hidden diagnostics: tap the page title 5× quickly ──
  let dTaps = 0, dT;
  document.addEventListener('click', e => {
    if (!e.target.closest('.greeting, .title, .sub, #ov-date')) return;
    dTaps++; clearTimeout(dT); dT = setTimeout(() => (dTaps = 0), 1500);
    if (dTaps < 5) return; dTaps = 0;
    const probe = document.createElement('div');
    probe.style.cssText = 'position:fixed;left:0;width:1px;height:env(safe-area-inset-bottom);padding-top:env(safe-area-inset-top);visibility:hidden';
    document.body.appendChild(probe); const cs = getComputedStyle(probe);
    const dock = document.querySelector('.dock'), r = dock ? dock.getBoundingClientRect() : null;
    const vv = window.visualViewport;
    const info = { mode: P.isStandalone() ? 'HOME-SCREEN APP' : 'BROWSER', screen: screen.width + 'x' + screen.height, innerHeight: window.innerHeight,
      clientHeight: document.documentElement.clientHeight, visualVP: vv ? Math.round(vv.height) + ' @' + Math.round(vv.offsetTop) : '-',
      safeTop: cs.paddingTop, safeBottom: cs.height, dock: r ? Math.round(r.top) + '→' + Math.round(r.bottom) : '-',
      ios: (navigator.userAgent.match(/OS (\d+[_\d]*)/) || [])[1] || '-' };
    probe.remove();
    const box = document.createElement('div');
    box.style.cssText = 'position:fixed;left:12px;right:12px;top:calc(env(safe-area-inset-top) + 60px);z-index:99999;background:#000;border:1px solid #FF5A36;border-radius:14px;padding:14px;font:12px/1.7 ui-monospace,Menlo,monospace;color:#fff;white-space:pre-wrap';
    box.textContent = 'PACE DEBUG — screenshot & send\n\n' + Object.entries(info).map(([k, v]) => k + ': ' + v).join('\n') + '\n\n(tap to close)';
    box.onclick = () => box.remove(); document.body.appendChild(box);
  });

  // ── Animated dot background (pauses while touching / scrolling) ──
  P.startDots = function () {
    const cv = document.getElementById('bg-dots'); if (!cv) return;
    const ctx = cv.getContext('2d'), GAP = 18;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let W = 0, H = 0, dots = [], sparks = [], raf = null, last = 0;
    function size() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      W = window.innerWidth; H = window.innerHeight;
      cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dots = []; for (let y = GAP / 2; y < H; y += GAP) for (let x = GAP / 2; x < W; x += GAP) dots.push(x, y);
      draw(performance.now());
    }
    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      for (let i = 0; i < dots.length; i += 2) {
        const x = dots[i], y = dots[i + 1];
        const wave = Math.sin(x * .016 + y * .009 - t * .0008) * Math.cos(y * .006 + t * .0003);
        const a = (.045 + Math.max(0, wave) * .11) * (1 - (y / H) * .55);
        ctx.fillStyle = 'rgba(255,255,255,' + a.toFixed(3) + ')';
        ctx.fillRect(x - .8, y - .8, 1.6, 1.6);
      }
      if (!reduce && Math.random() < .04 && sparks.length < 6 && dots.length) {
        const k = (Math.random() * (dots.length / 2) | 0) * 2; sparks.push({ x: dots[k], y: dots[k + 1], life: 1 });
      }
      for (let s = sparks.length - 1; s >= 0; s--) {
        const sp = sparks[s]; sp.life -= .012; if (sp.life <= 0) { sparks.splice(s, 1); continue; }
        ctx.fillStyle = 'rgba(255,90,54,' + (Math.sin(sp.life * Math.PI) * .85).toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(sp.x, sp.y, 1.6, 0, 6.283); ctx.fill();
      }
    }
    function loop(t) { raf = requestAnimationFrame(loop); if (t - last < 40) return; last = t; draw(t); }
    const start = () => { if (!reduce && !raf && !document.hidden) raf = requestAnimationFrame(loop); };
    const stop = () => { if (raf) { cancelAnimationFrame(raf); raf = null; } };
    let idle;
    const busy = () => { stop(); clearTimeout(idle); idle = setTimeout(start, 450); };
    ['touchstart', 'touchmove', 'wheel'].forEach(ev => window.addEventListener(ev, busy, { passive: true, capture: true }));
    document.addEventListener('scroll', busy, { passive: true, capture: true });
    let rw = window.innerWidth;
    window.addEventListener('resize', () => { if (window.innerWidth !== rw) { rw = window.innerWidth; size(); } });
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
    size(); start();
  };

  // ── Bottom sheet ──
  P.openSheet = function (html, opts = {}) {
    let bg = document.getElementById('sheet-bg'), sh = document.getElementById('sheet');
    if (!bg) {
      bg = document.createElement('div'); bg.id = 'sheet-bg'; bg.className = 'sheet-bg'; bg.onclick = () => P.closeSheet();
      sh = document.createElement('div'); sh.id = 'sheet'; sh.className = 'sheet';
      document.body.append(bg, sh);
      // drag down on the grab bar / top to close
      let y0 = null;
      sh.addEventListener('touchstart', e => { if (sh.scrollTop <= 0) y0 = e.touches[0].clientY; }, { passive: true });
      sh.addEventListener('touchend', e => { if (y0 !== null && e.changedTouches[0].clientY - y0 > 90) P.closeSheet(); y0 = null; }, { passive: true });
    }
    sh.innerHTML = '<div class="sheet-grab"></div>' + html;
    sh.scrollTop = 0;
    P._onSheetClose = opts.onClose || null;
    requestAnimationFrame(() => { bg.classList.add('open'); sh.classList.add('open'); });
    return sh;
  };
  P.closeSheet = function () {
    const bg = document.getElementById('sheet-bg'), sh = document.getElementById('sheet');
    if (!sh) return;
    bg.classList.remove('open'); sh.classList.remove('open');
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    if (P._onSheetClose) { const f = P._onSheetClose; P._onSheetClose = null; f(); }
  };
})();
