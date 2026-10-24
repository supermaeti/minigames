(function () {
  registerGame({
    id: 'lightsout', icon: '🔆', title: 'Lights Out', desc: 'Tippe Felder an, bis alle Lichter aus sind.',
    stop: function () {},
    start: function (el) {
      var ID = 'lightsout', rnd = function (n) { return Math.floor(Math.random() * n); };
      var level = 1, n = 3, g = [], moves = 0, won = false, hint = -1;
      el.innerHTML = '<div class="top"><div class="pts"><span data-lv>1</span><small>Level</small></div><div class="meta">Züge: <span data-mv>0</span><br>Rekord: <span data-best></span> Level</div></div>' +
        '<div class="lg" data-grid></div><div class="msg" data-msg>Ein Feld ändert sich selbst und seine Nachbarn.</div>' +
        '<div class="row"><button class="alt" data-hint>Tipp</button><button class="alt" data-new>Neu</button></div>' +
        '<div class="row"><button class="hide" data-next style="width:100%">Nächstes Level</button></div>';
      var q = function (s) { return el.querySelector(s); }, grid = q('[data-grid]'), msg = q('[data-msg]'), nextBtn = q('[data-next]');
      function nb(i) {
        var r = Math.floor(i / n), c = i % n, o = [i];
        if (r > 0) o.push(i - n); if (r < n - 1) o.push(i + n); if (c > 0) o.push(i - 1); if (c < n - 1) o.push(i + 1);
        return o;
      }
      function press(i) { nb(i).forEach(function (j) { g[j] ^= 1; }); }
      function off() { return g.every(function (v) { return !v; }); }
      function build() {
        n = level <= 2 ? 3 : level <= 4 ? 4 : 5;
        var N = n * n, k = Math.min(14, 2 + level);
        do {
          g = []; for (var i = 0; i < N; i++) g.push(0);
          var idx = []; for (i = 0; i < N; i++) idx.push(i);
          for (i = 0; i < Math.min(k, N); i++) { var j = i + rnd(N - i), t = idx[i]; idx[i] = idx[j]; idx[j] = t; press(idx[i]); }
        } while (off());
        moves = 0; won = false; hint = -1; msg.textContent = 'Ein Feld ändert sich selbst und seine Nachbarn.'; msg.className = 'msg'; nextBtn.classList.add('hide'); render();
      }
      // Lösung über Gauss-Verfahren (mod 2): welche Felder müssen einmal angetippt werden?
      function solve() {
        var N = n * n, M = [], r, c, i;
        for (r = 0; r < N; r++) { M.push([]); for (c = 0; c < N; c++) M[r].push(0); M[r].push(g[r]); }
        for (c = 0; c < N; c++) nb(c).forEach(function (r2) { M[r2][c] = 1; });
        var piv = [], row = 0;
        for (c = 0; c < N && row < N; c++) {
          var p = -1; for (r = row; r < N; r++) if (M[r][c]) { p = r; break; }
          if (p < 0) continue;
          var tmp = M[row]; M[row] = M[p]; M[p] = tmp;
          for (r = 0; r < N; r++) if (r !== row && M[r][c]) for (i = 0; i <= N; i++) M[r][i] ^= M[row][i];
          piv.push(c); row++;
        }
        var x = []; for (i = 0; i < N; i++) x.push(0);
        piv.forEach(function (col, k) { x[col] = M[k][N]; });
        return x;
      }
      function render() {
        grid.style.gridTemplateColumns = 'repeat(' + n + ',1fr)'; grid.innerHTML = '';
        g.forEach(function (v, i) {
          var b = document.createElement('button'); b.className = 'lc' + (v ? ' on' : '') + (i === hint ? ' hint' : ''); b.setAttribute('data-i', i);
          b.setAttribute('aria-label', 'Feld ' + (i + 1) + (v ? ' an' : ' aus')); grid.appendChild(b);
        });
        q('[data-lv]').textContent = level; q('[data-mv]').textContent = moves; q('[data-best]').textContent = fmt(store.get('best_' + ID, 0));
      }
      function tap(i) {
        if (won) return;
        press(i); moves++; hint = -1;
        if (off()) {
          won = true; setBest(ID, level); msg.textContent = '✓ Alle Lichter aus – ' + moves + ' Züge!'; msg.className = 'msg ok'; nextBtn.classList.remove('hide');
        } else { msg.textContent = ''; msg.className = 'msg'; }
        render();
      }
      grid.addEventListener('pointerdown', function (e) {
        var b = e.target.closest('.lc'); if (!b) return; e.preventDefault(); tap(parseInt(b.getAttribute('data-i'), 10));
      });
      q('[data-hint]').onclick = function () {
        if (won) return;
        var x = solve(), i = x.indexOf(1); hint = i; msg.textContent = 'Tipp: tippe das markierte Feld an.'; msg.className = 'msg'; render();
      };
      q('[data-new]').onclick = build;
      nextBtn.onclick = function () { level++; build(); };
      build();
    }
  });
})();
