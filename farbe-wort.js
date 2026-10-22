(function () {
  var cleanup = function () {};
  registerGame({
    id: 'farbe-wort', icon: '🎨', title: 'Farbe oder Wort', desc: 'Tippe die Farbe der Schrift, nicht das Wort.',
    stop: function () { cleanup(); },
    start: function (el) {
      cleanup();
      var ID = 'farbe-wort', C = [['Rot', '#e03c31'], ['Blau', '#2f6fdf'], ['Grün', '#2f9e4f'], ['Gelb', '#d9a400']];
      var rnd = function (n) { return Math.floor(Math.random() * n); };
      var score = 0, lives = 3, ans = 0, state = 'ready', tm = null;
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
      function buttons() {
        var h = '<div class="g2">'; C.forEach(function (c, i) { h += '<button data-k="' + i + '">' + c[0] + '</button>'; });
        ctl.innerHTML = h + '</div>';
      }
      function next() {
        var w = rnd(4), c = (w + 1 + rnd(3)) % 4; ans = c;
        stage.innerHTML = '<div class="big" style="color:' + C[c][1] + '">' + C[w][0] + '</div>';
        var lim = Math.max(2500, 5000 - score * 50); startBar(lim);
        tm = setTimeout(function () { answer(-1); }, lim);
      }
      function answer(i) {
        clearTimeout(tm);
        if (i === ans) { score++; msg.textContent = ''; }
        else { lives--; msg.textContent = (i === -1 ? 'Zeit! ' : '✗ ') + 'Es war ' + C[ans][0]; msg.className = 'msg bad'; }
        upd();
        if (lives <= 0) over(); else next();
      }
      function over() {
        state = 'over'; stopBar();
        var old = store.get('best_' + ID, 0); setBest(ID, score); upd();
        stage.innerHTML = '<div class="big">' + score + ' Punkte</div><div>' + (score > old ? 'Neuer Rekord!' : 'Vorbei') + '</div>';
        single('Nochmal');
      }
      function begin() { score = 0; lives = 3; state = 'running'; msg.textContent = ''; msg.className = 'msg'; buttons(); upd(); next(); }
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
