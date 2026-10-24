(function () {
  registerGame({
    id: 'roehren', icon: '🧪', title: 'Röhren sortieren', desc: 'Sortiere die Kugeln, bis jede Röhre nur eine Farbe hat.',
    stop: function () {},
    start: function (el) {
      var ID = 'roehren', CAP = 4, rnd = function (n) { return Math.floor(Math.random() * n); };
      var COL = ['#e03c31', '#2f6fdf', '#2f9e4f', '#f2b01e', '#8e44ad', '#e67e22', '#16a0a5', '#d6336c'];
      var level = 1, tubes = [], sel = -1, moves = 0, hist = [], won = false;
      el.innerHTML = '<div class="top"><div class="pts"><span data-lv>1</span><small>Level</small></div><div class="meta">Züge: <span data-mv>0</span><br>Rekord: <span data-best></span> Level</div></div>' +
        '<div class="tubes" data-tubes></div><div class="msg" data-msg></div>' +
        '<div class="row"><button class="alt" data-undo>Zurück</button><button class="alt" data-new>Neu mischen</button></div>' +
        '<div class="row"><button class="hide" data-next style="width:100%">Nächstes Level</button></div>';
      var q = function (s) { return el.querySelector(s); }, box = q('[data-tubes]'), msg = q('[data-msg]'), nextBtn = q('[data-next]');
      function solved() { return tubes.every(function (t) { return t.length === 0 || (t.length === CAP && t.every(function (b) { return b === t[0]; })); }); }
      function scramble(steps) {
        for (var s = 0; s < steps; s++) {
          for (var tries = 0; tries < 60; tries++) {
            var a = rnd(tubes.length), b = rnd(tubes.length);
            if (a === b || !tubes[a].length || tubes[b].length >= CAP) continue;
            var A = tubes[a], x = A[A.length - 1];
            if (A.length > 1 && A[A.length - 2] !== x) continue;   // Rückwärtszug muss ein gültiger Vorwärtszug gewesen sein
            A.pop(); tubes[b].push(x); break;
          }
        }
      }
      function build() {
        var c = Math.min(8, 2 + level);
        do {
          tubes = [];
          for (var i = 0; i < c; i++) { var t = []; for (var k = 0; k < CAP; k++) t.push(i); tubes.push(t); }
          tubes.push([]); tubes.push([]);
          scramble(30 + 25 * c + 10 * Math.max(0, level - 6));
        } while (solved());
        sel = -1; moves = 0; hist = []; won = false; msg.textContent = ''; msg.className = 'msg'; nextBtn.classList.add('hide'); render();
      }
      function render() {
        box.innerHTML = '';
        tubes.forEach(function (t, i) {
          var d = document.createElement('div'); d.className = 'tube' + (i === sel ? ' sel' : ''); d.setAttribute('data-i', i);
          t.forEach(function (b) { var s = document.createElement('div'); s.className = 'ball'; s.style.background = COL[b]; s.setAttribute('data-c', b); d.appendChild(s); });
          box.appendChild(d);
        });
        q('[data-lv]').textContent = level; q('[data-mv]').textContent = moves; q('[data-best]').textContent = fmt(store.get('best_' + ID, 0));
      }
      function canMove(a, b) {
        if (a === b || !tubes[a].length || tubes[b].length >= CAP) return false;
        var tb = tubes[b], x = tubes[a][tubes[a].length - 1];
        return tb.length === 0 || tb[tb.length - 1] === x;
      }
      function move(a, b) {
        var A = tubes[a], x = A[A.length - 1], n = 0;
        while (A.length && A[A.length - 1] === x && tubes[b].length < CAP) { tubes[b].push(A.pop()); n++; }
        hist.push([a, b, n]); moves++;
      }
      function tap(i) {
        if (won) return;
        if (sel < 0) { if (tubes[i].length) sel = i; }
        else if (sel === i) sel = -1;
        else if (canMove(sel, i)) {
          move(sel, i); sel = -1;
          if (solved()) {
            won = true; setBest(ID, level);
            msg.textContent = '✓ Geschafft in ' + moves + ' Zügen!'; msg.className = 'msg ok'; nextBtn.classList.remove('hide');
          }
        } else sel = tubes[i].length ? i : -1;
        render();
      }
      function undo() {
        if (won || !hist.length) return;
        var h = hist.pop(), a = h[0], b = h[1];
        for (var k = 0; k < h[2]; k++) tubes[a].push(tubes[b].pop());
        moves--; sel = -1; render();
      }
      box.addEventListener('pointerdown', function (e) {
        var d = e.target.closest('.tube'); if (!d) return; e.preventDefault(); tap(parseInt(d.getAttribute('data-i'), 10));
      });
      q('[data-undo]').onclick = undo;
      q('[data-new]').onclick = build;
      nextBtn.onclick = function () { level++; build(); };
      build();
    }
  });
})();
