(function () {
  registerGame({
    id: 'wippe', icon: '⚖️', title: 'Wippe', desc: 'Lege die Gewichte so, dass die Wippe im Gleichgewicht ist.',
    stop: function () {},
    start: function (el) {
      var ID = 'wippe', rnd = function (n) { return Math.floor(Math.random() * n); };
      var level = 1, left = [], right = [], placed = [], sel = 0, won = false, nums = false;
      el.innerHTML = '<div class="top"><div class="pts"><span data-lv>1</span><small>Level</small></div><div class="meta">Rekord: <span data-best></span> Level</div></div>' +
        '<div class="ss" data-ss><div class="beam" data-beam></div><div class="pivot"></div></div>' +
        '<div class="chips" data-chips></div><div class="msg" data-msg>Gewicht × Abstand muss links und rechts gleich sein.</div>' +
        '<div class="row"><button class="alt" data-nums>Rechnen zeigen</button><button class="alt" data-reset>Zurücksetzen</button></div>' +
        '<div class="row"><button class="alt" data-new>Neu</button></div><div class="row"><button class="hide" data-next style="width:100%">Nächstes Level</button></div>';
      var q = function (s) { return el.querySelector(s); }, beam = q('[data-beam]'), msg = q('[data-msg]'), nextBtn = q('[data-next]'), chipsEl = q('[data-chips]');
      var DEF = 'Gewicht × Abstand muss links und rechts gleich sein.';
      function solvable(T, R) {
        if (R.length === 1) return T % R[0] === 0 && T / R[0] >= 1 && T / R[0] <= 5;
        for (var a = 1; a <= 5; a++) for (var b = 1; b <= 5; b++) if (R[0] * a + R[1] * b === T) return true;
        return false;
      }
      function build() {
        var lc = level <= 2 ? 1 : 2, rc = level <= 5 ? 1 : 2;
        for (var t = 0; t < 5000; t++) {
          left = []; var T = 0, i;
          for (i = 0; i < lc; i++) { var w = 1 + rnd(9), d = 1 + rnd(5); left.push({ w: w, x: d }); T += w * d; }
          if (T < 4 || T > 45) continue;
          right = []; for (i = 0; i < rc; i++) right.push(1 + rnd(6));
          if (solvable(T, right)) break;
        }
        placed = right.map(function () { return 0; }); sel = 0; won = false; msg.textContent = DEF; msg.className = 'msg'; nextBtn.classList.add('hide'); render();
      }
      function torque() {
        var tl = 0, tr = 0; left.forEach(function (o) { tl += o.w * o.x; }); right.forEach(function (w, i) { if (placed[i]) tr += w * placed[i]; });
        return [tl, tr];
      }
      function pct(pos) { return (50 + pos * 9) + '%'; }
      function render() {
        var T = torque(), diff = T[1] - T[0], ang = Math.max(-14, Math.min(14, diff * 1.5));
        beam.style.transform = 'rotate(' + ang + 'deg)';
        var h = '', i, k;
        for (i = 1; i <= 5; i++) {
          h += '<span class="tl" style="left:' + pct(-i) + '">' + i + '</span><button class="tp" data-x="' + i + '" style="left:' + pct(i) + '">' + i + '</button>';
        }
        var stack = {};
        left.forEach(function (o) { var key = -o.x; stack[key] = (stack[key] || 0); h += '<div class="wt l" data-side="L" data-w="' + o.w + '" data-p="' + o.x + '" style="left:' + pct(-o.x) + ';bottom:' + (12 + 30 * stack[key]) + 'px">' + o.w + '</div>'; stack[key]++; });
        right.forEach(function (w, i2) { if (!placed[i2]) return; var key = placed[i2]; stack[key] = (stack[key] || 0); h += '<div class="wt" data-side="R" data-w="' + w + '" data-p="' + placed[i2] + '" style="left:' + pct(placed[i2]) + ';bottom:' + (12 + 30 * stack[key]) + 'px">' + w + '</div>'; stack[key]++; });
        beam.innerHTML = h;
        chipsEl.innerHTML = right.map(function (w, i3) { return '<button class="alt' + (i3 === sel ? ' on' : '') + '" data-i="' + i3 + '">' + w + ' kg' + (placed[i3] ? ' · ' + placed[i3] : '') + '</button>'; }).join('');
        q('[data-lv]').textContent = level; q('[data-best]').textContent = fmt(store.get('best_' + ID, 0));
        if (nums && !won) msg.textContent = 'Links: ' + T[0] + ' · Rechts: ' + T[1];
      }
      function check() {
        var T = torque();
        if (placed.every(function (p) { return p; }) && T[0] === T[1]) {
          won = true; setBest(ID, level); msg.textContent = '✓ Im Gleichgewicht! ' + T[0] + ' = ' + T[1]; msg.className = 'msg ok'; nextBtn.classList.remove('hide');
        }
      }
      beam.addEventListener('pointerdown', function (e) {
        var b = e.target.closest('.tp'); if (!b || won) return; e.preventDefault();
        placed[sel] = parseInt(b.getAttribute('data-x'), 10);
        var nx = placed.indexOf(0); if (nx >= 0) sel = nx;
        render(); check();
      });
      chipsEl.addEventListener('pointerdown', function (e) {
        var b = e.target.closest('button'); if (!b || won) return; e.preventDefault(); sel = parseInt(b.getAttribute('data-i'), 10); render();
      });
      q('[data-nums]').onclick = function () { nums = !nums; this.classList.toggle('on', nums); if (!nums) { msg.textContent = DEF; msg.className = 'msg'; } render(); };
      q('[data-reset]').onclick = function () { if (won) return; placed = right.map(function () { return 0; }); sel = 0; msg.textContent = DEF; render(); };
      q('[data-new]').onclick = build;
      nextBtn.onclick = function () { level++; build(); };
      build();
    }
  });
})();
