(function () {
  var cleanup = function () {};
  registerGame({
    id: 'memory', icon: '🧠', title: 'Memory', desc: 'Finde alle Paare mit möglichst wenigen Zügen.',
    stop: function () { cleanup(); },
    start: function (el) {
      cleanup();
      var ID = 'memory', E = ['🍎', '🚗', '🐶', '⭐', '🎲', '🌵', '🎈', '🔔'];
      var deck, btns, open, lock, moves, found, tm = null;
      el.innerHTML = '<div class="top"><div class="pts"><span data-moves>0</span><small>Züge</small></div><div class="meta">Rekord: <span data-best></span> Punkte</div></div>' +
        '<div class="g4" data-grid></div><div class="msg" data-msg></div><div class="row"><button class="alt hide" data-again>Nochmal</button></div>';
      var q = function (s) { return el.querySelector(s); }, grid = q('[data-grid]'), msg = q('[data-msg]'), again = q('[data-again]');
      function upd() { q('[data-moves]').textContent = moves; q('[data-best]').textContent = fmt(store.get('best_' + ID, 0)); }
      function build() {
        deck = E.concat(E);
        for (var i = deck.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = deck[i]; deck[i] = deck[j]; deck[j] = t; }
        open = []; lock = false; moves = 0; found = 0; btns = [];
        grid.innerHTML = ''; msg.textContent = ''; again.classList.add('hide');
        deck.forEach(function (_, i) {
          var b = document.createElement('button'); b.className = 'mem'; b.textContent = '?';
          b.addEventListener('pointerdown', function (e) { e.preventDefault(); flip(i); });
          btns.push(b); grid.appendChild(b);
        });
        upd();
      }
      function show(i, on) { btns[i].textContent = on ? deck[i] : '?'; btns[i].classList.toggle('up', on); }
      function flip(i) {
        if (lock || open.indexOf(i) >= 0 || btns[i].classList.contains('done')) return;
        show(i, true); open.push(i);
        if (open.length < 2) return;
        moves++; upd();
        var a = open[0], b = open[1];
        if (deck[a] === deck[b]) {
          [a, b].forEach(function (k) { btns[k].classList.remove('up'); btns[k].classList.add('done'); });
          open = []; found++;
          if (found === E.length) finish();
        } else {
          lock = true;
          tm = setTimeout(function () { show(a, false); show(b, false); open = []; lock = false; }, 700);
        }
      }
      function finish() {
        var pts = Math.max(0, 100 - 4 * (moves - E.length)), old = store.get('best_' + ID, 0);
        setBest(ID, pts); upd();
        msg.innerHTML = '<b>' + moves + ' Züge = ' + pts + ' Punkte</b>' + (pts > old ? ' – neuer Rekord!' : '');
        again.classList.remove('hide');
      }
      again.onclick = build;
      cleanup = function () { clearTimeout(tm); };
      build();
    }
  });
})();
