(function () {
  var cleanup = function () {};
  registerGame({
    id: 'zahlenfolge', icon: '🔢', title: 'Zahlenfolge', desc: 'Welche Zahl kommt als Nächstes?',
    stop: function () { cleanup(); },
    start: function (el) {
      cleanup();
      var ID = 'zahlenfolge', rnd = function (n) { return Math.floor(Math.random() * n); };
      var score = 0, lives = 3, ans = 0, rule = '', shown = [], input = '', state = 'ready';
      // Jede Funktion liefert 6 Zahlen (die 6. ist die Antwort) und die Regel
      var G = [
        function () { var a = 1 + rnd(20), d = 2 + rnd(8), s = []; for (var i = 0; i < 6; i++) s.push(a + d * i); return { s: s, r: 'immer +' + d }; },
        function () { var a = 1 + rnd(3), r = 2 + rnd(2), s = []; for (var i = 0; i < 6; i++) s.push(a * Math.pow(r, i)); return { s: s, r: 'immer ×' + r }; },
        function () { var k = 1 + rnd(6), s = []; for (var i = 0; i < 6; i++) s.push((k + i) * (k + i)); return { s: s, r: 'Quadratzahlen' }; },
        function () { var a = 1 + rnd(10), d = 1 + rnd(3), s = [a]; for (var i = 0; i < 5; i++) s.push(s[i] + d + i); return { s: s, r: 'der Abstand wächst jedes Mal um 1' }; },
        function () { var a = 10 + rnd(20), x = 3 + rnd(6), y = 1 + rnd(x - 1), s = [a]; for (var i = 0; i < 5; i++) s.push(s[i] + (i % 2 === 0 ? x : -y)); return { s: s, r: '+' + x + ' und −' + y + ' im Wechsel' }; },
        function () { var a = 1 + rnd(4), b = 1 + rnd(4), s = [a, b]; for (var i = 2; i < 6; i++) s.push(s[i - 1] + s[i - 2]); return { s: s, r: 'Summe der letzten zwei Zahlen' }; },
        function () { var a = 1 + rnd(3), s = [a]; for (var i = 0; i < 5; i++) s.push(s[i] * 2 + 1); return { s: s, r: '×2, dann +1' }; }
      ];
      el.innerHTML = '<div class="top"><div class="pts"><span data-score>0</span><small>Punkte</small></div><div class="meta"><span data-lives></span><br>Rekord: <span data-best></span></div></div>' +
        '<div class="stage s" data-stage></div><div class="msg" data-msg></div><div class="pad" data-pad></div>';
      var q = function (s) { return el.querySelector(s); }, stage = q('[data-stage]'), msg = q('[data-msg]'), pad = q('[data-pad]');
      function upd() {
        q('[data-score]').textContent = score; q('[data-best]').textContent = fmt(store.get('best_' + ID, 0));
        q('[data-lives]').textContent = '❤️'.repeat(lives) + '🖤'.repeat(3 - lives);
      }
      function render() {
        stage.innerHTML = '<div style="font-size:30px;font-weight:700">' + shown.join(', ') + ', ?</div><div class="big">' + (input || '…') + '</div>';
      }
      function next() {
        var n = Math.min(G.length, 2 + Math.floor(score / 3)), g = G[rnd(n)]();
        shown = g.s.slice(0, 5); ans = g.s[5]; rule = g.r; input = ''; render();
      }
      function answer() {
        var ok = parseInt(input, 10) === ans;
        if (ok) { score++; msg.textContent = '✓ ' + rule; msg.className = 'msg ok'; }
        else { lives--; msg.textContent = '✗ Es war ' + ans + ' (' + rule + ')'; msg.className = 'msg bad'; }
        upd();
        if (lives <= 0) over(); else next();
      }
      function over() {
        state = 'over';
        var old = store.get('best_' + ID, 0); setBest(ID, score); upd();
        stage.innerHTML = '<div class="big">' + score + ' Punkte</div><div>' + (score > old ? 'Neuer Rekord!' : 'Vorbei') + '</div>';
        pad.style.display = 'block'; pad.innerHTML = '<button data-k="go" style="width:100%">Nochmal</button>';
      }
      function digits() {
        var h = ''; for (var i = 1; i <= 9; i++) h += '<button data-k="' + i + '">' + i + '</button>';
        pad.style.display = ''; pad.innerHTML = h + '<button data-k="b">⌫</button><button data-k="0">0</button><button data-k="ok">OK</button>';
      }
      function press(k) {
        if (state !== 'running') return;
        if (k === 'ok') { if (input) answer(); return; }
        if (k === 'b') input = input.slice(0, -1); else if (input.length < 6) input += k;
        render();
      }
      function begin() { score = 0; lives = 3; state = 'running'; msg.textContent = ''; msg.className = 'msg'; digits(); upd(); next(); }
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
      stage.innerHTML = '<div class="big">Bereit?</div>'; pad.style.display = 'block'; pad.innerHTML = '<button data-k="go" style="width:100%">Start</button>'; upd();
    }
  });
})();
