(function () {
  const COLORS = ['#ff5d73', '#ffd23f', '#5ad1ff', '#7cf29c', '#ff8a3d', '#c792ff'];
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const rand = (a, b) => a + Math.random() * (b - a);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touchDevice = matchMedia('(hover: none), (pointer: coarse)').matches;

  /* ---------- Background dots: they run away from the cursor, clicks make a burst ---------- */
  const sw = document.getElementById('swarm');
  const sctx = sw.getContext('2d');
  let SW, SH, dots = [], running = false;
  const mouse = { x: -9999, y: -9999 };

  function sizeSwarm() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    SW = innerWidth; SH = innerHeight;
    sw.width = SW * dpr; sw.height = SH * dpr;
    sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(140, SW * SH / 9000));
    dots = Array.from({ length: n }, () => ({
      x: Math.random() * SW, y: Math.random() * SH,
      vx: rand(-.2, .2), vy: rand(-.2, .2), r: rand(1.5, 4), c: pick(COLORS)
    }));
  }
  function burst(x, y, n = 24) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = rand(2, 7);
      dots.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: rand(2, 5), c: pick(COLORS), life: 120 });
    }
    if (reduced && !running) frame();
  }
  addEventListener('pointermove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  document.addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; });
  document.addEventListener('pointerdown', e => {
    if (e.pointerType !== 'mouse' || touchDevice) return; // fireworks only with a mouse, never on phones/tablets
    if (e.target.closest('a, button, canvas, dialog, .project')) return;
    burst(e.clientX, e.clientY);
  });

  function frame() {
    running = true;
    sctx.clearRect(0, 0, SW, SH);
    for (let i = dots.length - 1; i >= 0; i--) {
      const d = dots[i];
      const dx = d.x - mouse.x, dy = d.y - mouse.y, dist2 = dx * dx + dy * dy;
      if (dist2 < 14000) { const f = (14000 - dist2) / 14000 * .6, m = Math.sqrt(dist2) || 1; d.vx += dx / m * f; d.vy += dy / m * f; }
      d.vx = d.vx * .97 + rand(-.015, .015); d.vy = d.vy * .97 + rand(-.015, .015);
      d.x += d.vx; d.y += d.vy;
      if (d.x < 0) d.x += SW; if (d.x > SW) d.x -= SW;
      if (d.y < 0) d.y += SH; if (d.y > SH) d.y -= SH;
      if (d.life !== undefined && --d.life <= 0) { dots.splice(i, 1); continue; }
      sctx.globalAlpha = d.life !== undefined ? d.life / 120 : .8;
      sctx.fillStyle = d.c;
      sctx.beginPath(); sctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); sctx.fill();
      if (dist2 < 30000) {
        sctx.globalAlpha = (1 - dist2 / 30000) * .5; sctx.strokeStyle = d.c;
        sctx.beginPath(); sctx.moveTo(d.x, d.y); sctx.lineTo(mouse.x, mouse.y); sctx.stroke();
      }
    }
    sctx.globalAlpha = 1;
    running = false;
    if (!reduced || dots.some(d => d.life)) { running = true; requestAnimationFrame(frame); }
  }
  addEventListener('resize', sizeSwarm);
  sizeSwarm(); frame();

  /* ---------- Fragile words: a few random words fall off when touched ---------- */
  const words = [];
  document.querySelectorAll('.fragile').forEach(p => {
    const parts = p.textContent.split(/(\s+)/);
    p.textContent = '';
    for (const part of parts) {
      if (!part.trim()) { p.append(part); continue; }
      const w = document.createElement('span'); w.className = 'word'; w.textContent = part;
      p.append(w); if (part.replace(/\W/g, '').length >= 4) words.push(w);
    }
  });
  for (let i = 0; i < 3 && words.length; i++) {
    const w = words.splice(Math.floor(Math.random() * words.length), 1)[0];
    const drop = () => {
      if (w.classList.contains('falling')) return;
      w.style.setProperty('--spin', rand(-200, 200) + 'deg');
      w.classList.remove('back'); w.classList.add('falling');
      setTimeout(() => { w.classList.remove('falling'); w.classList.add('back'); }, 7000);
    };
    w.addEventListener('pointerenter', drop);
    w.addEventListener('pointerdown', drop);
  }

  /* ---------- Project pictures ---------- */
  const gallery = document.getElementById('gallery');
  const strip = document.getElementById('gallery-strip');
  document.querySelectorAll('.project[data-shots]').forEach(card => {
    const shots = card.dataset.shots.split(' ');
    card.querySelector('.pics').textContent = shots.length > 1 ? `${shots.length} screenshots` : '1 screenshot';
    const open = () => {
      document.getElementById('gallery-title').textContent = card.dataset.title;
      strip.replaceChildren(...shots.map(src => Object.assign(document.createElement('img'), { src, alt: card.dataset.title + ' screenshot' })));
      gallery.showModal();
      strip.scrollLeft = 0; galCur = 0; galAuto = Date.now();
      galNav.hidden = shots.length < 2;
      galShow();
    };
    card.addEventListener('click', e => { if (!e.target.closest('a')) open(); });
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  });
  document.getElementById('gallery-close').addEventListener('click', () => gallery.close());
  const galNav = document.getElementById('gallery-nav'), galCount = document.getElementById('gal-count');
  let galCur = 0, galAuto = 0;
  const galShow = () => { galCount.textContent = `${galCur + 1} / ${strip.children.length}`; };
  const galGo = dir => {
    const imgs = strip.children;
    galCur = Math.max(0, Math.min(imgs.length - 1, galCur + dir));
    galAuto = Date.now();
    imgs[galCur].scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
    galShow();
  };
  document.getElementById('gal-prev').addEventListener('click', () => galGo(-1));
  document.getElementById('gal-next').addEventListener('click', () => galGo(1));
  // when swiping by hand, follow whichever picture is in the middle
  strip.addEventListener('scroll', () => {
    if (Date.now() - galAuto < 700) return;
    const box = strip.getBoundingClientRect(), mid = box.left + box.width / 2;
    let best = Infinity;
    [...strip.children].forEach((im, i) => { const r = im.getBoundingClientRect(), d = Math.abs(r.left + r.width / 2 - mid); if (d < best) { best = d; galCur = i; } });
    galShow();
  }, { passive: true });
  gallery.addEventListener('keydown', e => { if (e.key === 'ArrowRight') galGo(1); if (e.key === 'ArrowLeft') galGo(-1); });
  gallery.addEventListener('click', e => { if (e.target === gallery) gallery.close(); });

  /* ---------- Phone: dots under the swipeable cards ---------- */
  const cardsEl = document.getElementById('projects');
  const dotsEl = document.createElement('div');
  dotsEl.className = 'swipe-dots';
  const cardEls = [...cardsEl.querySelectorAll('.project')];
  cardEls.forEach(() => dotsEl.append(document.createElement('span')));
  cardsEl.after(dotsEl);
  function markDot() {
    const box = cardsEl.getBoundingClientRect();
    let best = 0, bestDist = Infinity;
    cardEls.forEach((c, k) => { const d = Math.abs(c.getBoundingClientRect().left - box.left - 20); if (d < bestDist) { bestDist = d; best = k; } });
    [...dotsEl.children].forEach((d, k) => d.classList.toggle('on', k === best));
  }
  cardsEl.addEventListener('scroll', markDot, { passive: true });
  markDot();

  /* ---------- Plinko: a fair Galton board ----------
     Every peg is a real 50/50 coin flip, left or right. With 8 rows the bins follow
     the binomial odds (1, 8, 28, 56, 70, 56, 28, 8, 1 out of 256).
     With these multipliers you get back 98.9% on average, like a casino. */

  const pc = document.getElementById('plinko');
  const p = pc.getContext('2d');
  const PW = pc.width, PH = pc.height;
  const ROWS = 8, GAP = 60, TOP = 60, ROWH = 50, PEG_R = 6, BALL_R = 11;
  const MULTI = [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13];
  const BET = 10;
  const peg = (r, i) => ({ x: PW / 2 + (i - (r + 2) / 2) * GAP, y: TOP + r * ROWH });
  const pegs = [];
  for (let r = 0; r < ROWS; r++) for (let i = 0; i < r + 3; i++) pegs.push({ ...peg(r, i), r, i, flash: 0 });
  const pegAt = (r, i) => pegs.find(q => q.r === r && q.i === i);
  const BIN_TOP = TOP + (ROWS - 1) * ROWH + 34, BIN_H = PH - BIN_TOP - 8;
  const binX = k => PW / 2 + (k - (ROWS) / 2) * GAP;
  const binFlash = new Array(ROWS + 1).fill(0);

  // money, remembered in this browser
  const $bal = document.getElementById('balance'), $last = document.getElementById('last'), $refill = document.getElementById('refill');
  let balance = 100, inPlay = 0;
  try { const v = parseFloat(localStorage.getItem('plinko-balance')); if (v >= 0) balance = v; } catch (e) {}
  if (balance < BET) balance += 100; // broke last time? a fresh visit gives you another $100
  const money = v => '$' + (Math.round(v * 100) / 100).toLocaleString('en-US');
  function showBalance(dir) {
    $bal.textContent = money(balance);
    $bal.classList.remove('up', 'down', 'shake');
    if (dir) { void $bal.offsetWidth; $bal.classList.add(dir); clearTimeout(showBalance.t); showBalance.t = setTimeout(() => $bal.classList.remove(dir), 700); }
    $refill.hidden = balance >= BET || inPlay > 0;
    try { localStorage.setItem('plinko-balance', balance); } catch (e) {}
  }
  showBalance();
  $refill.addEventListener('click', () => { balance += 100; $last.textContent = 'Here you go'; showBalance('up'); });

  // A ball follows a path of hops: one coin flip per peg row, then into a bin.
  const balls = [];
  function dropBall() {
    if (balance < BET) { void $bal.offsetWidth; $bal.classList.add('shake'); $last.textContent = 'Out of money'; return; }
    balance -= BET; inPlay++; showBalance();
    const lift = PEG_R + BALL_R;
    const legs = [];
    let i = 1, from = { x: PW / 2 + rand(-2, 2), y: -BALL_R };
    // fall onto the middle peg of the top row
    let to = peg(0, i);
    legs.push({ from, to: { x: to.x, y: to.y - lift }, dur: 420, hop: 0, fall: true, peg: [0, i] });
    for (let r = 0; r < ROWS - 1; r++) {
      if (Math.random() < .5) i++;            // 50/50: right, or stay left
      from = legs[legs.length - 1].to; to = peg(r + 1, i);
      legs.push({ from, to: { x: to.x, y: to.y - lift }, dur: 230, hop: 16, peg: [r + 1, i] });
    }
    const bin = Math.random() < .5 ? i : i - 1; // last flip, off the bottom row
    legs.push({ from: legs[legs.length - 1].to, to: { x: binX(bin), y: BIN_TOP + BALL_R + 10 }, dur: 300, hop: 14, bin });
    balls.push({ legs, leg: 0, t0: performance.now(), c: pick(COLORS), x: from.x, y: from.y, done: 0 });
  }
  pc.addEventListener('pointerdown', () => dropBall());

  // Auto-play: keeps dropping balls by itself until you stop it or run out of money
  const $auto = document.getElementById('auto');
  let autoTimer = null;
  function setAuto(on) {
    clearInterval(autoTimer); autoTimer = null;
    $auto.setAttribute('aria-pressed', on);
    $auto.setAttribute('aria-label', on ? 'Stop auto-play' : 'Auto-play');
    $auto.title = on ? 'Stop auto-play' : 'Auto-play';
    if (!on) return;
    const tick = () => { if (balance < BET) { setAuto(false); dropBall(); return; } dropBall(); };
    tick(); autoTimer = setInterval(tick, 380);
  }
  $auto.addEventListener('click', () => setAuto(!autoTimer));

  function settle(ball, bin) {
    inPlay--;
    const mult = MULTI[bin], win = BET * mult;
    balance += win;
    binFlash[bin] = 1;
    $last.textContent = `${mult}× → ${money(win)}`;
    showBalance(win >= BET ? 'up' : 'down');
    if (mult >= 3) {
      const b = pc.getBoundingClientRect();
      burst(b.left + b.width * binX(bin) / PW, b.top + b.height * (BIN_TOP / PH), mult >= 13 ? 70 : 30);
    }
  }

  function binColor(m) { return m >= 13 ? '#ffd23f' : m >= 3 ? '#e8c45a' : m >= 1 ? '#c9cfdc' : '#7d8597'; }

  function plinkoFrame(now) {
    p.clearRect(0, 0, PW, PH);
    // balls move
    for (let k = balls.length - 1; k >= 0; k--) {
      const b = balls[k];
      if (b.done) { if (now - b.done > 400) balls.splice(k, 1); continue; }
      let leg = b.legs[b.leg], t = (now - b.t0) / leg.dur;
      while (t >= 1) {
        if (leg.peg) { const q = pegAt(...leg.peg); if (q) q.flash = 1; }
        if (leg.bin !== undefined) { b.x = leg.to.x; b.y = leg.to.y; b.done = now; settle(b, leg.bin); break; }
        b.t0 += leg.dur; b.leg++; leg = b.legs[b.leg]; t = (now - b.t0) / leg.dur;
      }
      if (b.done) continue;
      const e = leg.fall ? t * t : t;
      b.x = leg.from.x + (leg.to.x - leg.from.x) * t;
      b.y = leg.from.y + (leg.to.y - leg.from.y) * e - leg.hop * 4 * t * (1 - t);
    }
    // pegs
    for (const q of pegs) {
      p.fillStyle = q.flash > 0 ? '#ffd23f' : '#9aa3b8';
      p.beginPath(); p.arc(q.x, q.y, PEG_R + q.flash * 3, 0, Math.PI * 2); p.fill();
      q.flash = Math.max(0, q.flash - .06);
    }
    // bins
    p.textAlign = 'center'; p.textBaseline = 'middle'; p.font = '700 21px Space Grotesk, sans-serif';
    for (let k = 0; k <= ROWS; k++) {
      const x = binX(k) - GAP / 2 + 3, c = binColor(MULTI[k]);
      p.globalAlpha = .22 + binFlash[k] * .78;
      p.fillStyle = c;
      p.beginPath(); p.roundRect(x, BIN_TOP, GAP - 6, BIN_H, 8); p.fill();
      p.globalAlpha = 1;
      p.fillStyle = binFlash[k] > .4 ? '#10131c' : c;
      p.fillText(MULTI[k] + '×', binX(k), BIN_TOP + BIN_H - 18);
      binFlash[k] = Math.max(0, binFlash[k] - .025);
    }
    // balls on top
    for (const b of balls) {
      p.globalAlpha = b.done ? Math.max(0, 1 - (now - b.done) / 400) : 1;
      p.fillStyle = b.c;
      p.beginPath(); p.arc(b.x, b.y, BALL_R, 0, Math.PI * 2); p.fill();
    }
    p.globalAlpha = 1;
    requestAnimationFrame(plinkoFrame);
  }
  requestAnimationFrame(plinkoFrame);
})();
