(function () {
  var cleanup = function () {};
  registerGame({
    id: 'hasenlauf', icon: '🐇', title: 'Hasenlauf', desc: 'Tippe zum Springen und weiche den Hindernissen aus.',
    stop: function () { cleanup(); },
    start: function (el) {
      cleanup();
      var ID = 'hasenlauf', W = 360, H = 200, GY = 160, X0 = 70, GRAV = 1900, VJ = -560;
      var rnd = function (n) { return Math.floor(Math.random() * n); };
      el.innerHTML = '<div class="top"><div class="pts"><span data-m>0</span><small>Meter</small></div><div class="meta">Rekord: <span data-best></span> m</div></div>' +
        '<canvas class="rc" data-cv></canvas><div class="msg" data-msg>Tippe auf das Feld, um loszurennen. Lange tippen = höher springen.</div>' +
        '<div class="row"><button data-jump>Springen</button></div>';
      var q = function (s) { return el.querySelector(s); }, cv = q('[data-cv]'), msg = q('[data-msg]'), jumpBtn = q('[data-jump]');
      var dpr = Math.min(2, window.devicePixelRatio || 1); cv.width = W * dpr; cv.height = H * dpr;
      var ctx = cv.getContext('2d'); if (ctx && ctx.scale) ctx.scale(dpr, dpr);
      var cs = getComputedStyle(document.documentElement), FG = (cs.getPropertyValue('--fg') || '#1d1d1b').trim() || '#1d1d1b';
      var st = 'ready', hare = { y: GY, vy: 0 }, obs = [], speed = 240, dist = 0, spawnIn = 1, raf = 0, last = 0, shownM = -1, overAt = 0, clouds = [], tAnim = 0;
      for (var i = 0; i < 4; i++) clouds.push({ x: rnd(W), y: 20 + rnd(60), s: 0.6 + Math.random() * 0.8 });
      function best() { q('[data-best]').textContent = fmt(store.get('best_' + ID, 0)); }
      function reset() { hare = { y: GY, vy: 0 }; obs = []; speed = 240; dist = 0; spawnIn = 1; st = 'running'; shownM = -1; msg.textContent = ''; msg.className = 'msg'; jumpBtn.textContent = 'Springen'; }
      function jump() {
        if (st === 'ready') { reset(); return; }
        if (st === 'over') { if (performance.now() - overAt > 500) reset(); return; }
        if (hare.y >= GY - 0.5) hare.vy = VJ;
      }
      function release() { if (hare.vy < -250) hare.vy = -250; }
      function spawn() {
        var t = rnd(3), o = t === 0 ? { w: 22, h: 18, k: 'stein' } : t === 1 ? { w: 16, h: 34, k: 'busch' } : { w: 44, h: 18, k: 'steine' };
        o.x = W + 20; obs.push(o);
        spawnIn = (speed * 0.8 + 80 + rnd(160) + o.w) / speed;
      }
      function step(dt) {
        speed = Math.min(430, 240 + dist * 0.02); dist += speed * dt;
        hare.vy += GRAV * dt; hare.y += hare.vy * dt; if (hare.y >= GY) { hare.y = GY; hare.vy = 0; }
        obs.forEach(function (o) { o.x -= speed * dt; });
        obs = obs.filter(function (o) { return o.x + o.w > -10; });
        spawnIn -= dt; if (spawnIn <= 0) spawn();
        var hb = { l: X0 - 12, r: X0 + 14, t: hare.y - 26, b: hare.y };
        for (var i = 0; i < obs.length; i++) {
          var o = obs[i], ol = o.x + 3, or = o.x + o.w - 3, ot = GY - o.h + 3;
          if (hb.r > ol && hb.l < or && hb.b > ot) { die(); return; }
        }
        var m = Math.floor(dist / 10); if (m !== shownM) { shownM = m; q('[data-m]').textContent = m; }
      }
      function die() {
        st = 'over'; overAt = performance.now();
        var m = Math.floor(dist / 10), old = store.get('best_' + ID, 0); setBest(ID, m); best();
        msg.textContent = 'Aus! ' + m + ' Meter' + (m > old && m > 0 ? ' – neuer Rekord!' : ''); msg.className = 'msg bad'; jumpBtn.textContent = 'Nochmal';
      }
      function ell(x, y, rx, ry, rot, col) { ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot || 0, 0, Math.PI * 2); ctx.fill(); }
      function draw(dt) {
        if (!ctx) return;
        ctx.clearRect(0, 0, W, H);
        clouds.forEach(function (c) { c.x -= (st === 'running' ? 14 : 4) * c.s * dt; if (c.x < -60) { c.x = W + 40; c.y = 20 + rnd(60); } ell(c.x, c.y, 26 * c.s, 9 * c.s, 0, 'rgba(128,128,128,0.22)'); });
        ctx.strokeStyle = FG; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, GY + 2); ctx.lineTo(W, GY + 2); ctx.stroke();
        ctx.fillStyle = FG; for (var i = 0; i < 12; i++) { var gx = ((i * 37 - dist) % W + W) % W; ctx.fillRect(gx, GY + 8 + (i % 3) * 6, 6, 2); }
        obs.forEach(function (o) {
          if (o.k === 'busch') { ctx.fillStyle = '#2f7d3a'; ctx.fillRect(o.x, GY - o.h, o.w, o.h); ell(o.x + o.w / 2, GY - o.h, o.w / 2 + 3, 7, 0, '#3f9a4b'); }
          else { var cnt = o.k === 'steine' ? 2 : 1; for (var k = 0; k < cnt; k++) ell(o.x + o.w / cnt * (k + 0.5), GY + 1, o.w / cnt / 2 + 2, o.h, 0, k ? '#6f7377' : '#8b9096'); }
        });
        var y = hare.y, air = y < GY - 1, ph = dist * 0.09 + tAnim * 0, bob = st === 'ready' ? Math.sin(tAnim * 4) * 1.5 : 0;
        ctx.lineCap = 'round'; ctx.lineWidth = 4; ctx.strokeStyle = '#8f6c3f';
        var a1 = air ? 9 : Math.sin(ph) * 9, a2 = air ? -9 : -Math.sin(ph) * 9;
        ctx.beginPath(); ctx.moveTo(X0 + 6, y - 8); ctx.lineTo(X0 + 6 + a1, y - (air ? 3 : 0)); ctx.moveTo(X0 - 8, y - 8); ctx.lineTo(X0 - 8 + a2, y - (air ? 3 : 0)); ctx.stroke();
        ell(X0 - 17, y - 17 + bob, 5, 5, 0, '#ffffff');
        ell(X0 - 2, y - 14 + bob, 15, 9.5, -0.1, '#b08a5a');
        ell(X0 + 13, y - 23 + bob, 7.5, 7, 0, '#b08a5a');
        ell(X0 + 9, y - 36 + bob, 3.2, 11, -0.25, '#b08a5a'); ell(X0 + 15, y - 36 + bob, 3.2, 11, 0.15, '#b08a5a');
        ell(X0 + 9, y - 36 + bob, 1.4, 8, -0.25, '#f3b6c0');
        ell(X0 + 16, y - 24 + bob, 1.6, 1.6, 0, '#1d1d1b'); ell(X0 + 20, y - 21 + bob, 1.6, 1.4, 0, '#7a5a35');
        if (st === 'over') { ctx.fillStyle = FG; ctx.font = 'bold 22px system-ui,sans-serif'; ctx.textAlign = 'center'; ctx.fillText('Aus!', W / 2, 70); }
      }
      function frame(ts) {
        raf = requestAnimationFrame(frame);
        var dt = last ? Math.min(0.05, (ts - last) / 1000) : 0; last = ts; tAnim += dt;
        if (st === 'running') step(dt);
        draw(dt);
      }
      function key(e) {
        if (e.code === 'Space' || e.key === 'ArrowUp') { e.preventDefault(); if (!e.repeat) jump(); }
      }
      function keyup(e) { if (e.code === 'Space' || e.key === 'ArrowUp') release(); }
      cv.addEventListener('pointerdown', function (e) { e.preventDefault(); jump(); });
      jumpBtn.addEventListener('pointerdown', function (e) { e.preventDefault(); jump(); });
      window.addEventListener('pointerup', release);
      document.addEventListener('keydown', key); document.addEventListener('keyup', keyup);
      cleanup = function () { cancelAnimationFrame(raf); st = 'gone'; window.removeEventListener('pointerup', release); document.removeEventListener('keydown', key); document.removeEventListener('keyup', keyup); };
      el._dbg = function () { return { st: st, obs: obs, hare: hare, speed: speed, dist: dist }; };
      best(); raf = requestAnimationFrame(frame);
    }
  });
})();
