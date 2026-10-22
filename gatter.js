(function () {
  var cleanup = function () {};
  registerGame({
    id: 'gatter', icon: '🔌', title: 'Logikgatter', desc: 'Was kommt am Ausgang raus: 0 oder 1?',
    stop: function () { cleanup(); },
    start: function (el) {
      cleanup();
      var ID = 'gatter', rnd = function (n) { return Math.floor(Math.random() * n); };
      var G = {
        AND: [function (a, b) { return a & b; }, 'beide 1'], OR: [function (a, b) { return a | b; }, 'mindestens eine 1'],
        XOR: [function (a, b) { return a ^ b; }, 'genau eine 1'], NAND: [function (a, b) { return 1 - (a & b); }, 'nicht beide 1'],
        NOR: [function (a, b) { return 1 - (a | b); }, 'keine 1'], NOT: [function (a) { return 1 - a; }, 'dreht um']
      };
      var score = 0, lives = 3, ans = 0, expr = '', hint = '', state = 'ready', tm = null;
      el.innerHTML = '<div class="top"><div class="pts"><span data-score>0</span><small>Punkte</small></div><div class="meta"><span data-lives></span><br>Rekord: <span data-best></span></div></div>' +
        '<div class="stage s" data-stage></div><div class="tbar"><i data-bar></i></div><div class="msg" data-msg></div><div data-ctl></div>';
      var q = function (s) { return el.querySelector(s); }, stage = q('[data-stage]'), bar = q('[data-bar]'), msg = q('[data-msg]'), ctl = q('[data-ctl]');
      function upd() {
        q('[data-score]').textContent = score; q('[data-best]').textContent = fmt(store.get('best_' + ID, 0));
        q('[data-lives]').textContent = '❤️'.repeat(lives) + '🖤'.repeat(3 - lives);
      }
      function stopBar() { bar.style.transition = 'none'; bar.style.width = '0%'; }
      function startBar(ms) { bar.style.transition = 'none'; bar.style.width = '100%'; void bar.offsetWidth; bar.style.transition = 'width ' + ms + 'ms linear'; bar.style.width = '0%'; }
      function single(label) { ctl.innerHTML = '<button data-k="go" style="width:100%">' + label + '</button>'; }
      function pick(a) { return a[rnd(a.length)]; }
      function gen() {
        var lv = Math.floor(score / 3), a = rnd(2), b = rnd(2), c = rnd(2), g, g2;
        if (lv >= 3 && rnd(2)) {
          g = pick(['AND', 'OR', 'XOR', 'NAND', 'NOR']); g2 = pick(['AND', 'OR', 'XOR', 'NAND', 'NOR']);
          expr = '(' + a + ' ' + g + ' ' + b + ') ' + g2 + ' ' + c; ans = G[g2][0](G[g][0](a, b), c); hint = '';
        } else {
          g = pick(lv === 0 ? ['AND', 'OR'] : lv === 1 ? ['AND', 'OR', 'NOT', 'XOR'] : ['AND', 'OR', 'NOT', 'XOR', 'NAND', 'NOR']);
          expr = g === 'NOT' ? 'NOT ' + a : a + ' ' + g + ' ' + b; ans = G[g][0](a, b); hint = ' (' + G[g][1] + ')';
        }
      }
      function next() {
        gen(); stage.innerHTML = '<div class="big">' + expr + '</div>';
        var lim = Math.max(5000, 9000 - score * 100); startBar(lim);
        tm = setTimeout(function () { answer(-1); }, lim);
      }
      function answer(v) {
        clearTimeout(tm);
        if (v === ans) { score++; msg.textContent = '✓ ' + expr + ' = ' + ans + hint; msg.className = 'msg ok'; }
        else { lives--; msg.textContent = (v === -1 ? 'Zeit! ' : '✗ ') + expr + ' = ' + ans + hint; msg.className = 'msg bad'; }
        upd();
        if (lives <= 0) over(); else next();
      }
      function over() {
        state = 'over'; stopBar();
        var old = store.get('best_' + ID, 0); setBest(ID, score); upd();
        stage.innerHTML = '<div class="big">' + score + ' Punkte</div><div>' + (score > old ? 'Neuer Rekord!' : 'Vorbei') + '</div>';
        single('Nochmal');
      }
      function begin() {
        score = 0; lives = 3; state = 'running'; msg.textContent = ''; msg.className = 'msg'; upd();
        ctl.innerHTML = '<div class="g2"><button data-k="0">0</button><button data-k="1">1</button></div>'; next();
      }
      ctl.addEventListener('pointerdown', function (e) {
        var b = e.target.closest('button'); if (!b) return; e.preventDefault();
        var k = b.getAttribute('data-k');
        if (k === 'go') begin(); else if (state === 'running') answer(parseInt(k, 10));
      });
      cleanup = function () { clearTimeout(tm); state = 'gone'; };
      stage.innerHTML = '<div class="big">Bereit?</div>'; single('Start'); upd();
    }
  });
})();
