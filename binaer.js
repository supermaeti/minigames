(function () {
  var cleanup = function () {};
  registerGame({
    id: 'binaer', icon: '💡', title: 'Binär-Schalter', desc: 'Stelle die Zahl mit den Schaltern ein.',
    stop: function () { cleanup(); },
    start: function (el) {
      cleanup();
      var ID = 'binaer', rnd = function (n) { return Math.floor(Math.random() * n); };
      var score = 0, lives = 3, state = 'ready', tm = null, n = 4, target = 0, bits = [];
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
      function sum() { var s = 0; bits.forEach(function (b, i) { s += b * Math.pow(2, n - 1 - i); }); return s; }
      function bin(v) { return ('00000000' + v.toString(2)).slice(-n); }
      function draw() {
        var h = '<div class="gb" style="grid-template-columns:repeat(' + n + ',1fr)">', i;
        for (i = 0; i < n; i++) h += '<div class="wl">' + Math.pow(2, n - 1 - i) + '</div>';
        for (i = 0; i < n; i++) h += '<button class="alt sw' + (bits[i] ? ' on' : '') + '" data-k="' + i + '">' + bits[i] + '</button>';
        ctl.innerHTML = h + '</div>';
      }
      function next() {
        n = Math.min(8, 4 + Math.floor(score / 3)); target = 1 + rnd(Math.pow(2, n) - 1);
        bits = []; for (var i = 0; i < n; i++) bits.push(0);
        stage.innerHTML = '<div class="big">' + target + '</div>'; draw();
        var lim = 10000 + n * 1500; startBar(lim);
        tm = setTimeout(function () { answer(false); }, lim);
      }
      function answer(ok) {
        clearTimeout(tm);
        if (ok) { score++; msg.textContent = '✓ ' + target + ' = ' + bin(target); msg.className = 'msg ok'; }
        else { lives--; msg.textContent = 'Zeit! ' + target + ' = ' + bin(target); msg.className = 'msg bad'; }
        upd();
        if (lives <= 0) over(); else next();
      }
      function over() {
        state = 'over'; stopBar();
        var old = store.get('best_' + ID, 0); setBest(ID, score); upd();
        stage.innerHTML = '<div class="big">' + score + ' Punkte</div><div>' + (score > old ? 'Neuer Rekord!' : 'Vorbei') + '</div>';
        single('Nochmal');
      }
      function begin() { score = 0; lives = 3; state = 'running'; msg.textContent = ''; msg.className = 'msg'; upd(); next(); }
      ctl.addEventListener('pointerdown', function (e) {
        var b = e.target.closest('button'); if (!b) return; e.preventDefault();
        var k = b.getAttribute('data-k');
        if (k === 'go') { begin(); return; }
        if (state !== 'running') return;
        bits[+k] = 1 - bits[+k]; draw();
        if (sum() === target) answer(true);
      });
      cleanup = function () { clearTimeout(tm); state = 'gone'; };
      stage.innerHTML = '<div class="big">Bereit?</div>'; single('Start'); upd();
    }
  });
})();
