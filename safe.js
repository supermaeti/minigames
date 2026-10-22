(function () {
  var cleanup = function () {};
  registerGame({
    id: 'safe', icon: '🔐', title: 'Safe knacken', desc: 'Errate den 4-stelligen Code in 8 Versuchen.',
    stop: function () { cleanup(); },
    start: function (el) {
      cleanup();
      var ID = 'safe', MAX = 8, code = [], input = '', tries = [], state = 'ready';
      var LEGEND = '🟢 = richtige Ziffer, richtige Stelle · 🟡 = richtige Ziffer, falsche Stelle';
      el.innerHTML = '<div class="top"><div class="pts"><span data-left>8</span><small>Versuche</small></div><div class="meta">Rekord: <span data-best></span> Punkte</div></div>' +
        '<div class="stage s" data-stage></div><div class="hist" data-hist></div><div class="msg" data-msg></div><div class="pad" data-pad></div>';
      var q = function (s) { return el.querySelector(s); }, stage = q('[data-stage]'), hist = q('[data-hist]'), msg = q('[data-msg]'), pad = q('[data-pad]');
      function upd() { q('[data-left]').textContent = MAX - tries.length; q('[data-best]').textContent = fmt(store.get('best_' + ID, 0)); }
      function render() {
        var d = input.split(''); while (d.length < 4) d.push('_');
        stage.innerHTML = '<div class="big" style="letter-spacing:.4em">' + d.join('') + '</div><div>4 verschiedene Ziffern</div>';
      }
      function drawHist() {
        hist.innerHTML = tries.map(function (t) { return '<div><b>' + t.g + '</b><span>🟢' + t.r + ' 🟡' + t.w + '</span></div>'; }).join('');
      }
      function digits() {
        var h = ''; for (var i = 1; i <= 9; i++) h += '<button data-k="' + i + '">' + i + '</button>';
        pad.style.display = ''; pad.innerHTML = h + '<button data-k="b">⌫</button><button data-k="0">0</button><button data-k="ok">OK</button>';
      }
      function single(label) { pad.style.display = 'block'; pad.innerHTML = '<button data-k="go" style="width:100%">' + label + '</button>'; }
      function begin() {
        var d = '0123456789'.split(''), i, j, t;
        for (i = d.length - 1; i > 0; i--) { j = Math.floor(Math.random() * (i + 1)); t = d[i]; d[i] = d[j]; d[j] = t; }
        code = d.slice(0, 4); input = ''; tries = []; state = 'running';
        msg.textContent = LEGEND; msg.className = 'msg'; drawHist(); digits(); upd(); render();
      }
      function finish(won) {
        state = 'over';
        if (won) {
          var pts = (MAX + 1 - tries.length) * 10, old = store.get('best_' + ID, 0); setBest(ID, pts); upd();
          stage.innerHTML = '<div class="big">🔓 Geknackt!</div><div>' + pts + ' Punkte' + (pts > old ? ' – neuer Rekord!' : '') + '</div>'; msg.className = 'msg ok';
        } else {
          stage.innerHTML = '<div class="big">🔒 ' + code.join('') + '</div><div>Das war der Code.</div>'; msg.className = 'msg bad';
        }
        msg.textContent = won ? 'Nach ' + tries.length + ' Versuch' + (tries.length > 1 ? 'en' : '') + '.' : 'Leider nicht geknackt.';
        single('Neuer Safe');
      }
      function submit() {
        if (input.length < 4) return;
        var g = input.split(''), r = 0, c = 0;
        g.forEach(function (x, i) { if (x === code[i]) r++; if (code.indexOf(x) >= 0) c++; });
        tries.push({ g: input, r: r, w: c - r }); drawHist(); upd();
        if (r === 4) { finish(true); return; }
        if (tries.length >= MAX) { finish(false); return; }
        input = ''; render();
      }
      function press(k) {
        if (state !== 'running') return;
        if (k === 'ok') { submit(); return; }
        if (k === 'b') input = input.slice(0, -1);
        else if (input.length < 4 && input.indexOf(k) < 0) input += k;
        render();
      }
      function key(e) {
        if (/^[0-9]$/.test(e.key)) press(e.key); else if (e.key === 'Backspace') press('b');
        else if (e.key === 'Enter') { if (state === 'running') press('ok'); else begin(); }
      }
      pad.addEventListener('pointerdown', function (e) {
        var b = e.target.closest('button'); if (!b) return; e.preventDefault();
        var k = b.getAttribute('data-k'); if (k === 'go') begin(); else press(k);
      });
      document.addEventListener('keydown', key);
      cleanup = function () { state = 'gone'; document.removeEventListener('keydown', key); };
      stage.innerHTML = '<div class="big">🔐</div><div>Bereit?</div>'; single('Start'); upd();
    }
  });
})();
