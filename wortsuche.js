(function () {
  var THEMES = {
    'Küche': ['TOPF', 'PFANNE', 'MESSER', 'GABEL', 'LÖFFEL', 'TELLER', 'TASSE', 'HERD', 'OFEN', 'SIEB', 'SCHÜSSEL', 'KOCHEN', 'BACKEN', 'GLAS'],
    'Essen': ['BROT', 'KÄSE', 'MILCH', 'BUTTER', 'APFEL', 'BIRNE', 'SUPPE', 'NUDELN', 'REIS', 'SALAT', 'KUCHEN', 'FRÜCHTE', 'GEMÜSE', 'HONIG'],
    'Haushalt': ['BESEN', 'PUTZEN', 'WASCHEN', 'LAMPE', 'TEPPICH', 'SOFA', 'TISCH', 'STUHL', 'SCHRANK', 'BETT', 'FENSTER', 'TÜR', 'VORHANG', 'KISSEN'],
    'Verkehr': ['AUTO', 'BUS', 'TRAM', 'ZUG', 'VELO', 'STRASSE', 'BAHNHOF', 'AMPEL', 'STAU', 'SCHIFF', 'BRÜCKE', 'TUNNEL', 'FLUGZEUG', 'TAXI'],
    'Wetter': ['REGEN', 'SCHNEE', 'WIND', 'SONNE', 'WOLKE', 'NEBEL', 'GEWITTER', 'BLITZ', 'DONNER', 'HAGEL', 'FROST', 'HITZE', 'KÄLTE', 'STURM'],
    'Kleidung': ['HOSE', 'JACKE', 'SCHUH', 'MÜTZE', 'SOCKE', 'HEMD', 'KLEID', 'ROCK', 'SCHAL', 'GÜRTEL', 'PULLOVER', 'MANTEL', 'STIEFEL', 'KRAWATTE'],
    'Garten': ['BLUME', 'BAUM', 'RASEN', 'ROSE', 'HECKE', 'ERDE', 'SAMEN', 'STRAUCH', 'BEET', 'SCHAUFEL', 'HARKE', 'KOMPOST', 'GIESSEN', 'WIESE'],
    'Werkzeug': ['HAMMER', 'ZANGE', 'SÄGE', 'BOHRER', 'NAGEL', 'SCHRAUBE', 'FEILE', 'MEISSEL', 'LEITER', 'DÜBEL', 'WINKEL', 'HOBEL', 'KELLE', 'SCHERE'],
    'Büro': ['STIFT', 'PAPIER', 'ORDNER', 'LOCHER', 'SCHERE', 'KLEBER', 'DRUCKER', 'LINEAL', 'MAPPE', 'TASTATUR', 'MAUS', 'RECHNER', 'KALENDER', 'AKTE'],
    'Freizeit': ['SPIEL', 'FILM', 'BUCH', 'MUSIK', 'WANDERN', 'SCHWIMMEN', 'TANZEN', 'MALEN', 'ANGELN', 'KEGELN', 'JASSEN', 'LESEN', 'BASTELN', 'SPORT'],
    'Einkaufen': ['LADEN', 'KASSE', 'KORB', 'WAGEN', 'PREIS', 'RABATT', 'QUITTUNG', 'TASCHE', 'WARE', 'MARKT', 'KUNDE', 'GELD', 'KARTE', 'BEUTEL']
  };
  var D8 = [[0, 1], [1, 0], [1, 1], [-1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1]];
  var FILL = 'EEEEENNNIIRRSSTTAADDHUULLCCGGMMOOBBWWFFKKZPVJYXQÄÖÜ';
  registerGame({
    id: 'wortsuche', icon: '🔤', title: 'Buchstabensalat', desc: 'Finde die versteckten Wörter im Raster.',
    stop: function () {},
    start: function (el) {
      var ID = 'wortsuche', rnd = function (n) { return Math.floor(Math.random() * n); };
      var level = 1, n = 6, grid = [], words = [], found = {}, owner = {}, theme = '', anchor = null, sel = [], dragging = false, from = null, hint = null, done = false, ci = 0;
      el.innerHTML = '<div class="top"><div class="pts"><span data-lv>1</span><small>Level</small></div><div class="meta">Gefunden: <span data-fd>0</span>/<span data-tot>0</span><br>Rekord: <span data-best></span> Level</div></div>' +
        '<div class="lbl" data-theme></div><div class="wg" data-grid></div><div class="words" data-words></div><div class="msg" data-msg></div>' +
        '<div class="row"><button class="alt" data-hint>Tipp</button><button class="alt" data-new>Neu</button></div>' +
        '<div class="row"><button class="hide" data-next style="width:100%">Nächstes Level</button></div>';
      var q = function (s) { return el.querySelector(s); }, gridEl = q('[data-grid]'), msg = q('[data-msg]'), nextBtn = q('[data-next]');
      function place(word, dirs) {
        for (var t = 0; t < 300; t++) {
          var d = dirs[rnd(dirs.length)], len = word.length, r = rnd(n), c = rnd(n), er = r + d[0] * (len - 1), ec = c + d[1] * (len - 1), i;
          if (er < 0 || er >= n || ec < 0 || ec >= n) continue;
          var ok = true;
          for (i = 0; i < len; i++) { var ch = grid[r + d[0] * i][c + d[1] * i]; if (ch && ch !== word[i]) { ok = false; break; } }
          if (!ok) continue;
          var cells = [];
          for (i = 0; i < len; i++) { grid[r + d[0] * i][c + d[1] * i] = word[i]; cells.push([r + d[0] * i, c + d[1] * i]); }
          return cells;
        }
        return null;
      }
      function build() {
        n = Math.min(10, 6 + Math.floor((level - 1) / 2));
        var k = Math.min(9, 3 + level), dirs = D8.slice(0, level <= 2 ? 2 : level <= 4 ? 4 : 8), keys = Object.keys(THEMES);
        do {
          theme = keys[rnd(keys.length)];
          grid = []; for (var r = 0; r < n; r++) { grid.push([]); for (var c = 0; c < n; c++) grid[r].push(''); }
          var pool = THEMES[theme].filter(function (w) { return w.length <= n; }).sort(function () { return Math.random() - 0.5; });
          words = [];
          for (var i = 0; i < pool.length && words.length < k; i++) if (place(pool[i], dirs)) words.push(pool[i]);
        } while (words.length < Math.min(k, 3));
        for (r = 0; r < n; r++) for (c = 0; c < n; c++) if (!grid[r][c]) grid[r][c] = FILL[rnd(FILL.length)];
        found = {}; owner = {}; sel = []; anchor = null; hint = null; done = false; ci = 0;
        msg.textContent = ''; msg.className = 'msg'; nextBtn.classList.add('hide');
        gridEl.style.gridTemplateColumns = 'repeat(' + n + ',1fr)'; gridEl.innerHTML = '';
        for (r = 0; r < n; r++) for (c = 0; c < n; c++) {
          var d = document.createElement('div'); d.className = 'wc'; d.textContent = grid[r][c]; d.setAttribute('data-r', r); d.setAttribute('data-c', c); gridEl.appendChild(d);
        }
        q('[data-theme]').textContent = 'Thema: ' + theme;
        wordList(); paint();
      }
      function wordList() {
        q('[data-words]').innerHTML = words.map(function (w) { return '<span class="' + (found[w] ? 'done' : '') + '">' + w + '</span>'; }).join('');
        q('[data-lv]').textContent = level; q('[data-fd]').textContent = Object.keys(found).length; q('[data-tot]').textContent = words.length;
        q('[data-best]').textContent = fmt(store.get('best_' + ID, 0));
      }
      function paint() {
        var cells = gridEl.children;
        for (var i = 0; i < cells.length; i++) {
          var r = +cells[i].getAttribute('data-r'), c = +cells[i].getAttribute('data-c'), key = r + ',' + c, cls = 'wc';
          if (owner[key] !== undefined) cls += ' f' + owner[key];
          if (sel.some(function (s) { return s[0] === r && s[1] === c; }) || (anchor && anchor[0] === r && anchor[1] === c)) cls += ' sel';
          if (hint && hint[0] === r && hint[1] === c) cls += ' hint';
          cells[i].className = cls;
        }
      }
      function line(a, b) {
        var dr = b[0] - a[0], dc = b[1] - a[1];
        if (!dr && !dc) return [a];
        var dd = [[0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1], [-1, 0], [-1, 1]];
        var d = dd[((Math.round(Math.atan2(dr, dc) / (Math.PI / 4)) % 8) + 8) % 8];
        var L = Math.max(0, Math.round((dr * d[0] + dc * d[1]) / (d[0] * d[0] + d[1] * d[1]))), out = [];
        for (var i = 0; i <= L; i++) { var r = a[0] + d[0] * i, c = a[1] + d[1] * i; if (r < 0 || r >= n || c < 0 || c >= n) break; out.push([r, c]); }
        return out;
      }
      function check(cells) {
        if (cells.length < 2) return;
        var s = cells.map(function (p) { return grid[p[0]][p[1]]; }).join(''), rv = s.split('').reverse().join('');
        for (var i = 0; i < words.length; i++) {
          var w = words[i];
          if (!found[w] && (s === w || rv === w)) {
            found[w] = cells; cells.forEach(function (p) { owner[p[0] + ',' + p[1]] = ci % 6; }); ci++;
            wordList();
            if (Object.keys(found).length === words.length) {
              done = true; setBest(ID, level); wordList();
              msg.textContent = '✓ Alle Wörter gefunden!'; msg.className = 'msg ok'; nextBtn.classList.remove('hide');
            } else { msg.textContent = '✓ ' + w; msg.className = 'msg ok'; }
            return;
          }
        }
        msg.textContent = ''; msg.className = 'msg';
      }
      function cellAt(e) {
        var t = e.target && e.target.closest ? e.target.closest('.wc') : null;
        if (!t && document.elementFromPoint && e.clientX !== undefined) { var u = document.elementFromPoint(e.clientX, e.clientY); t = u && u.closest ? u.closest('.wc') : null; }
        return t ? [+t.getAttribute('data-r'), +t.getAttribute('data-c')] : null;
      }
      gridEl.addEventListener('pointerdown', function (e) {
        e.preventDefault(); if (done) return;
        var cell = cellAt(e); if (!cell) return; hint = null;
        if (gridEl.setPointerCapture && e.pointerId !== undefined) { try { gridEl.setPointerCapture(e.pointerId); } catch (x) {} }
        if (anchor) { var a = anchor; anchor = null; check(line(a, cell)); sel = []; dragging = false; paint(); return; }
        dragging = true; from = cell; sel = [cell]; paint();
      });
      gridEl.addEventListener('pointermove', function (e) {
        if (!dragging) return; var cell = cellAt(e); if (!cell) return; sel = line(from, cell); paint();
      });
      function up() {
        if (!dragging) return; dragging = false;
        if (sel.length < 2) { anchor = from; sel = []; } else check(sel);
        sel = sel.length < 2 ? [] : []; paint();
      }
      gridEl.addEventListener('pointerup', up);
      gridEl.addEventListener('pointercancel', function () { dragging = false; sel = []; paint(); });
      q('[data-hint]').onclick = function () {
        if (done) return;
        var open = words.filter(function (w) { return !found[w]; }); if (!open.length) return;
        var w = open[rnd(open.length)], pos = null;
        // Startfeld des Wortes suchen
        outer: for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) for (var k = 0; k < 8; k++) {
          var ok = true; for (var i = 0; i < w.length; i++) { var rr = r + D8[k][0] * i, cc = c + D8[k][1] * i; if (rr < 0 || rr >= n || cc < 0 || cc >= n || grid[rr][cc] !== w[i]) { ok = false; break; } }
          if (ok) { pos = [r, c]; break outer; }
        }
        hint = pos; msg.textContent = 'Tipp: Das Wort «' + w + '» beginnt beim markierten Feld.'; msg.className = 'msg'; paint();
      };
      q('[data-new]').onclick = build;
      nextBtn.onclick = function () { level++; build(); };
      build();
    }
  });
})();
