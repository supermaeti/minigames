(function () {
  registerGame({
    id: 'schiebepuzzle', icon: '🧩', title: 'Schiebepuzzle', desc: 'Sortiere die Zahlen von 1 bis 8.',
    stop: function () {},
    start: function (el) {
      var ID = 'schiebepuzzle', rnd = function (n) { return Math.floor(Math.random() * n); }, b = [], moves = 0, won = false, btns = [];
      el.innerHTML = '<div class="top"><div class="pts"><span data-moves>0</span><small>Züge</small></div><div class="meta">Rekord: <span data-best></span> Punkte</div></div>' +
        '<div class="g3" data-grid></div><div class="msg" data-msg></div><div class="row"><button class="alt" data-again>Neu mischen</button></div>';
      var q = function (s) { return el.querySelector(s); }, grid = q('[data-grid]'), msg = q('[data-msg]');
      function nb(i) {
        var r = Math.floor(i / 3), c = i % 3, o = [];
        if (r > 0) o.push(i - 3); if (r < 2) o.push(i + 3); if (c > 0) o.push(i - 1); if (c < 2) o.push(i + 1);
        return o;
      }
      function solved() { for (var i = 0; i < 8; i++) if (b[i] !== i + 1) return false; return b[8] === 0; }
      function render() {
        btns.forEach(function (x, i) { x.textContent = b[i] || ''; x.className = 'sl' + (b[i] === 0 ? ' gap' : ''); });
        q('[data-moves]').textContent = moves; q('[data-best]').textContent = fmt(store.get('best_' + ID, 0));
      }
      function build() {
        do {
          b = [1, 2, 3, 4, 5, 6, 7, 8, 0]; var e = 8, prev = -1;
          for (var i = 0; i < 80; i++) {
            var o = nb(e).filter(function (x) { return x !== prev; }), m = o[rnd(o.length)];
            b[e] = b[m]; b[m] = 0; prev = e; e = m;
          }
        } while (solved());
        moves = 0; won = false; msg.textContent = ''; render();
      }
      function tap(i) {
        if (won) return;
        var e = b.indexOf(0); if (nb(e).indexOf(i) < 0) return;
        b[e] = b[i]; b[i] = 0; moves++; render();
        if (solved()) {
          won = true;
          var pts = Math.max(0, 150 - moves), old = store.get('best_' + ID, 0);
          setBest(ID, pts); render();
          msg.innerHTML = '<b>Geschafft in ' + moves + ' Zügen = ' + pts + ' Punkte</b>' + (pts > old ? ' – neuer Rekord!' : '');
        }
      }
      for (var i = 0; i < 9; i++) (function (i) {
        var x = document.createElement('button');
        x.addEventListener('pointerdown', function (ev) { ev.preventDefault(); tap(i); });
        btns.push(x); grid.appendChild(x);
      })(i);
      q('[data-again]').onclick = build;
      build();
    }
  });
})();
