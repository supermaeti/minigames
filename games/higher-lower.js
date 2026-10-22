registerGame({
  id: 'higher-lower', icon: '🃏', title: 'Höher oder Tiefer', desc: 'Rate, ob die nächste Karte höher, tiefer oder gleich ist.',
  stop: function () {},
  start: function (el) {
    var ID = 'higher-lower', SUITS = ['♠', '♥', '♦', '♣'], LABEL = { 11: 'J', 12: 'Q', 13: 'K', 14: 'A' };
    var NAMES = { lower: 'Tiefer', equal: 'Gleich', higher: 'Höher' };
    var deck = [], cur = null, points = 10, bet = 1, gamble = false, help = false, over = false;
    var best = Math.max(10, store.get('best_' + ID, 10));
    el.innerHTML =
      '<div class="top"><div class="pts"><span data-pts>10</span><small>Punkte</small></div>' +
      '<div class="meta">Rekord: <span data-best></span><br>Karten übrig: <span data-left></span></div></div>' +
      '<div class="card" data-card><span data-rank></span><span class="s" data-suit></span></div>' +
      '<div class="msg" data-msg></div>' +
      '<div data-betbox><div class="lbl">Einsatz</div><div class="row" data-bets></div></div>' +
      '<div class="row" data-guess><button data-g="lower">Tiefer</button><button data-g="equal">Gleich</button><button data-g="higher">Höher</button></div>' +
      '<div class="row"><button class="alt" data-gamble></button><button class="alt" data-help></button></div>' +
      '<div class="row"><button class="alt hide" data-again>Neues Spiel</button></div>' +
      '<div class="rules">Ass ist die höchste Karte. Richtig = + Einsatz, falsch = − Einsatz. «Gleich» richtig = doppelte Punkte. Bei gleichem Wert sind Höher/Tiefer falsch. Bei 0 Punkten ist Schluss. Hilfe zeigt die Wahrscheinlichkeiten anhand der restlichen Karten und kostet 0,5 Punkte pro Tipp.</div>';
    var q = function (s) { return el.querySelector(s); };

    function newDeck() {
      var d = [];
      for (var s = 0; s < 4; s++) for (var v = 2; v <= 14; v++) d.push({ v: v, s: SUITS[s] });
      for (var i = d.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = d[i]; d[i] = d[j]; d[j] = t; }
      return d;
    }
    function draw() { if (!deck.length) deck = newDeck(); return deck.pop(); }
    function name(c) { return (LABEL[c.v] || c.v) + c.s; }
    function probs() {
      var d = deck.length ? deck : newDeck(), l = 0, e = 0, h = 0;
      d.forEach(function (c) { if (c.v < cur.v) l++; else if (c.v > cur.v) h++; else e++; });
      var n = d.length;
      return { lower: Math.round(100 * l / n), equal: Math.round(100 * e / n), higher: Math.round(100 * h / n) };
    }
    function setMsg(t, cls) { var m = q('[data-msg]'); m.textContent = t; m.className = 'msg' + (cls ? ' ' + cls : ''); }
    function flip() { var c = q('[data-card]'); c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop'); }
    function burst() {
      var r = q('[data-card]').getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      var cols = ['#f5c542', '#e8553d', '#4c8a62', '#4aa3df', '#c77dff'];
      for (var i = 0; i < 18; i++) {
        var s = document.createElement('span'), a = Math.random() * Math.PI * 2, d = 60 + Math.random() * 80;
        s.className = 'spark'; s.style.left = cx - 4 + 'px'; s.style.top = cy - 4 + 'px'; s.style.background = cols[i % cols.length];
        s.style.setProperty('--dx', Math.cos(a) * d + 'px'); s.style.setProperty('--dy', Math.sin(a) * d + 'px');
        s.addEventListener('animationend', function () { this.remove(); });
        document.body.appendChild(s);
      }
    }
    function show() {
      q('[data-rank]').textContent = LABEL[cur.v] || cur.v; q('[data-suit]').textContent = cur.s;
      q('[data-card]').className = 'card' + (cur.s === '♥' || cur.s === '♦' ? ' red' : '');
      q('[data-pts]').textContent = fmt(points); q('[data-best]').textContent = fmt(best); q('[data-left]').textContent = deck.length;
      q('[data-betbox]').classList.toggle('hide', !gamble);
      var gb = q('[data-gamble]'); gb.textContent = 'Gamble: ' + (gamble ? 'an' : 'aus'); gb.classList.toggle('on', gamble);
      var hb = q('[data-help]'); hb.textContent = 'Hilfe: ' + (help ? 'an' : 'aus'); hb.classList.toggle('on', help);
      var pr = help ? probs() : null;
      q('[data-guess]').querySelectorAll('button').forEach(function (b) {
        var g = b.getAttribute('data-g');
        b.innerHTML = NAMES[g] + (pr ? '<br><small>' + pr[g] + ' %</small>' : ''); b.disabled = over;
      });
      var bs = q('[data-bets]'); bs.innerHTML = '';
      [1, 2, 3].forEach(function (n) {
        var b = document.createElement('button');
        b.textContent = n + '×'; b.className = 'alt' + (bet === n ? ' on' : ''); b.disabled = over || n > points;
        b.onclick = function () { bet = n; show(); };
        bs.appendChild(b);
      });
      q('[data-again]').classList.toggle('hide', !over);
    }
    function guess(g) {
      if (over) return;
      if (!gamble) bet = 1;
      if (bet > points) bet = Math.max(1, Math.floor(points));
      var prev = cur, next = draw();
      var res = next.v > prev.v ? 'higher' : next.v < prev.v ? 'lower' : 'equal', delta = 0, txt;
      if (g === 'equal') {
        if (res === 'equal') { delta = 2 * bet; txt = 'Gleich! Doppelte Punkte: +' + delta; }
        else { delta = -bet; txt = 'Falsch: ' + (res === 'higher' ? 'höher' : 'tiefer') + '. −' + bet; }
      } else if (res === 'equal') { delta = -bet; txt = 'Gleicher Wert – falsch. −' + bet; }
      else if (g === res) { delta = bet; txt = 'Richtig! +' + bet; }
      else { delta = -bet; txt = 'Falsch. −' + bet; }
      points = Math.max(0, points + delta - (help ? 0.5 : 0));
      if (help) txt += ' (Hilfe −0,5)';
      if (points > best) { best = points; setBest(ID, best); }
      cur = next;
      if (bet > points) bet = Math.max(1, Math.floor(points));
      if (points <= 0) { over = true; setMsg(name(prev) + ' → ' + name(next) + '. ' + txt + ' Spiel vorbei!', 'bad'); }
      else setMsg(name(prev) + ' → ' + name(next) + '. ' + txt, delta > 0 ? 'ok' : delta < 0 ? 'bad' : '');
      show(); flip();
      if (delta > 0) burst();
    }
    function begin() {
      deck = newDeck(); points = 10; bet = 1; over = false; cur = draw();
      setMsg('Wird die nächste Karte tiefer, gleich oder höher?'); show();
    }
    q('[data-guess]').querySelectorAll('button').forEach(function (b) { b.onclick = function () { guess(b.getAttribute('data-g')); }; });
    q('[data-gamble]').onclick = function () { gamble = !gamble; if (!gamble) bet = 1; show(); };
    q('[data-help]').onclick = function () { help = !help; show(); };
    q('[data-again]').onclick = begin;
    begin();
  }
});
