(function () {
  var cleanup = function () {};
  registerGame({
    id: 'programm', icon: '💻', title: 'Was kommt raus?', desc: 'Wie lautet die letzte Variable am Ende?',
    stop: function () { cleanup(); },
    start: function (el) {
      cleanup();
      var ID = 'programm', NAMES = ['x', 'y', 'z', 'a', 'b', 'c'], rnd = function (n) { return Math.floor(Math.random() * n); };
      var score = 0, lives = 3, ans = 0, lines = [], trace = '', cur = 'x', nsteps = 2, input = '', state = 'ready', tm = null, practice = false;
      el.innerHTML = '<div class="top"><div class="pts"><span data-score>0</span><small>Punkte</small></div><div class="meta"><span data-lives></span><br>Rekord: <span data-best></span></div></div>' +
        '<div class="stage a" data-stage></div><div class="tbar"><i data-bar></i></div><div class="msg" data-msg></div><div class="pad" data-pad></div>' +
        '<div class="row"><button class="alt" data-prac>Übung: aus</button></div>';
      var q = function (s) { return el.querySelector(s); }, stage = q('[data-stage]'), bar = q('[data-bar]'), msg = q('[data-msg]'), pad = q('[data-pad]');
      function upd() {
        q('[data-score]').textContent = score; q('[data-best]').textContent = fmt(store.get('best_' + ID, 0));
        q('[data-lives]').textContent = practice ? 'Übung' : '❤️'.repeat(lives) + '🖤'.repeat(3 - lives);
      }
      function stopBar() { bar.style.transition = 'none'; bar.style.width = '0%'; }
      function startBar(ms) { bar.style.transition = 'none'; bar.style.width = '100%'; void bar.offsetWidth; bar.style.transition = 'width ' + ms + 'ms linear'; bar.style.width = '0%'; }
      function gen() {
        for (var tries = 0; tries < 100; tries++) {
          var x = 1 + rnd(9), vi = 0, v = NAMES[0], L = [v + ' = ' + x], tr = [String(x)], steps = 2 + Math.min(2, Math.floor(score / 3));
          var types = ['+', '-', '*']; if (score >= 6) types.push('loop'); if (score >= 9) types.push('if');
          for (var s = 0; s < steps; s++) {
            var t = types[rnd(types.length)], n, k, c, nv;
            if (t === '+' || t === '-' || t === '*') {
              nv = NAMES[++vi];
              if (t === '+') { n = 1 + rnd(9); L.push(nv + ' = ' + v + ' + ' + n); x += n; }
              else if (t === '-') { n = 1 + rnd(Math.min(9, x)); L.push(nv + ' = ' + v + ' - ' + n); x -= n; }
              else { n = 2 + rnd(2); L.push(nv + ' = ' + v + ' * ' + n); x *= n; }
              v = nv; tr.push(String(x));
            } else if (t === 'loop') {
              k = 2 + rnd(3); n = 1 + rnd(5); L.push('wiederhole ' + k + ' mal:'); L.push('  ' + v + ' = ' + v + ' + ' + n);
              x += k * n; tr.push(String(x));
            } else {
              c = Math.max(1, x - 3 + rnd(7)); n = 1 + rnd(Math.min(8, c));
              L.push('wenn ' + v + ' > ' + c + ':'); L.push('  ' + v + ' = ' + v + ' - ' + n);
              if (x > c) { x -= n; tr.push(String(x)); } else tr.push(x + ' (nicht erfüllt)');
            }
          }
          if (x >= 0 && x <= 999) { lines = L; ans = x; trace = tr.join(' → '); cur = v; nsteps = steps; return; }
        }
      }
      function render() { stage.innerHTML = '<pre class="code">' + lines.join('\n') + '</pre><div class="big">' + cur + ' = ' + (input || '…') + '</div>'; }
      function next() {
        gen(); input = ''; render();
        if (practice) { stopBar(); return; }
        // Zeit wächst mit der Programmlänge und schrumpft langsam mit dem Punktestand (mindestens 70 %)
        var lim = Math.round((9000 + nsteps * 3500) * Math.max(0.7, 1 - score * 0.01)); startBar(lim);
        tm = setTimeout(function () { answer(true); }, lim);
      }
      function answer(timeout) {
        clearTimeout(tm);
        if (!timeout && parseInt(input, 10) === ans) { score++; msg.textContent = '✓ ' + trace; msg.className = 'msg ok'; }
        else {
          if (!practice) lives--;
          msg.textContent = (timeout ? 'Zeit! ' : '✗ ') + 'Es war ' + ans + ' (' + trace + ')'; msg.className = 'msg bad';
        }
        upd();
        if (!practice && lives <= 0) over(); else next();
      }
      function over() {
        state = 'over'; stopBar();
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
        if (k === 'ok') { if (input) answer(false); return; }
        if (k === 'b') input = input.slice(0, -1); else if (input.length < 4) input += k;
        render();
      }
      function begin() { score = 0; lives = 3; state = 'running'; msg.textContent = ''; msg.className = 'msg'; digits(); upd(); next(); }
      function toReady() {
        clearTimeout(tm); stopBar(); state = 'ready'; msg.textContent = ''; msg.className = 'msg';
        stage.innerHTML = '<div class="big">Bereit?</div>'; pad.style.display = 'block'; pad.innerHTML = '<button data-k="go" style="width:100%">Start</button>'; upd();
      }
      function key(e) {
        if (/^[0-9]$/.test(e.key)) press(e.key); else if (e.key === 'Backspace') press('b');
        else if (e.key === 'Enter') { if (state === 'running') press('ok'); else begin(); }
      }
      pad.addEventListener('pointerdown', function (e) {
        var b = e.target.closest('button'); if (!b) return; e.preventDefault();
        var k = b.getAttribute('data-k'); if (k === 'go') begin(); else press(k);
      });
      q('[data-prac]').onclick = function () {
        practice = !practice; this.textContent = 'Übung: ' + (practice ? 'an' : 'aus'); this.classList.toggle('on', practice); toReady();
      };
      document.addEventListener('keydown', key);
      cleanup = function () { clearTimeout(tm); state = 'gone'; document.removeEventListener('keydown', key); };
      toReady();
    }
  });
})();
