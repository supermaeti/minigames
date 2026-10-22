(function () {
  var cleanup = function () {};
  registerGame({
    id: 'kopfrechnen', icon: '🧮', title: 'Kopfrechnen', desc: 'Rechne schnell – bei 3 Fehlern ist Schluss.',
    stop: function () { cleanup(); },
    start: function (el) {
      cleanup();
      var ID = 'kopfrechnen', rnd = function (n) { return Math.floor(Math.random() * n); };
      var score = 0, lives = 3, ans = 0, text = '', input = '', state = 'ready', tm = null;
      el.innerHTML = '<div class="top"><div class="pts"><span data-score>0</span><small>Punkte</small></div><div class="meta"><span data-lives></span><br>Rekord: <span data-best></span></div></div>' +
        '<div class="stage s" data-stage></div><div class="tbar"><i data-bar></i></div><div class="msg" data-msg></div><div class="pad" data-pad></div>';
      var q = function (s) { return el.querySelector(s); }, stage = q('[data-stage]'), bar = q('[data-bar]'), msg = q('[data-msg]'), pad = q('[data-pad]');
      function upd() {
        q('[data-score]').textContent = score; q('[data-best]').textContent = fmt(store.get('best_' + ID, 0));
        q('[data-lives]').textContent = '❤️'.repeat(lives) + '🖤'.repeat(3 - lives);
      }
      function stopBar() { bar.style.transition = 'none'; bar.style.width = '0%'; }
      function startBar(ms) { bar.style.transition = 'none'; bar.style.width = '100%'; void bar.offsetWidth; bar.style.transition = 'width ' + ms + 'ms linear'; bar.style.width = '0%'; }
      function render() { stage.innerHTML = '<div class="big">' + text + ' = ?</div><div class="big">' + (input || '…') + '</div>'; }
      function gen() {
        var op = ['+', '−', '×', '÷'][rnd(4)], a, b;
        if (op === '+') { a = 1 + rnd(100); b = 1 + rnd(100); ans = a + b; }
        else if (op === '−') { a = 2 + rnd(99); b = 1 + rnd(a - 1); ans = a - b; }
        else if (op === '×') { a = 2 + rnd(11); b = 2 + rnd(19); ans = a * b; }
        else { b = 2 + rnd(11); ans = 2 + rnd(19); a = b * ans; }
        text = a + ' ' + op + ' ' + b;
      }
      function next() {
        gen(); input = ''; render();
        var lim = Math.max(9000, 14000 - score * 200); startBar(lim);
        tm = setTimeout(function () { answer(null); }, lim);
      }
      function answer(v) {
        clearTimeout(tm);
        if (v === ans) { score++; msg.textContent = '✓'; msg.className = 'msg ok'; }
        else { lives--; msg.textContent = (v === null ? 'Zeit! ' : '✗ ') + text + ' = ' + ans; msg.className = 'msg bad'; }
        upd();
        if (lives <= 0) over(); else next();
      }
      function over() {
        state = 'over'; stopBar();
        var old = store.get('best_' + ID, 0); setBest(ID, score); upd();
        stage.innerHTML = '<div class="big">' + score + ' Punkte</div><div>' + (score > old ? 'Neuer Rekord!' : 'Vorbei') + '</div>';
        pad.style.display = 'block'; pad.innerHTML = '<button data-k="go" style="width:100%">Nochmal</button>';
      }
      function digits() {
        var h = ''; for (var i = 1; i <= 9; i++) h += '<button data-k="' + i + '">' + i + '</button>';
        pad.style.display = ''; pad.innerHTML = h + '<span></span><button data-k="0">0</button><button data-k="b">⌫</button>';
      }
      function press(k) {
        if (state !== 'running') return;
        if (k === 'b') input = input.slice(0, -1); else if (input.length < String(ans).length) input += k;
        render();
        if (input.length === String(ans).length) answer(parseInt(input, 10));
      }
      function begin() { score = 0; lives = 3; state = 'running'; msg.textContent = ''; msg.className = 'msg'; digits(); upd(); next(); }
      function ready() { stage.innerHTML = '<div class="big">Bereit?</div>'; pad.style.display = 'block'; pad.innerHTML = '<button data-k="go" style="width:100%">Start</button>'; upd(); }
      function key(e) {
        if (/^[0-9]$/.test(e.key)) press(e.key); else if (e.key === 'Backspace') press('b');
        else if (e.key === 'Enter' && state !== 'running') begin();
      }
      pad.addEventListener('pointerdown', function (e) {
        var b = e.target.closest('button'); if (!b) return; e.preventDefault();
        var k = b.getAttribute('data-k'); if (k === 'go') begin(); else press(k);
      });
      document.addEventListener('keydown', key);
      cleanup = function () { clearTimeout(tm); state = 'gone'; document.removeEventListener('keydown', key); };
      ready();
    }
  });
})();
