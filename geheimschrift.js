(function () {
  var ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var WORDS = ['HAUS', 'BAUM', 'HUND', 'KATZE', 'BROT', 'MILCH', 'VOGEL', 'FISCH', 'TISCH', 'STUHL', 'LAMPE', 'BLUME', 'WOLKE', 'REGEN', 'SCHULE', 'FREUND', 'PIZZA', 'BANANE', 'ZITRONE', 'GITARRE', 'ELEFANT', 'GIRAFFE', 'DELFIN', 'TRAKTOR', 'ROBOTER', 'COMPUTER', 'RAKETE', 'SCHATZ', 'PIRAT', 'SONNE', 'MONTAG', 'WINTER', 'SCHNEE', 'BERG', 'FLUSS', 'WIESE', 'KUH', 'PFERD', 'APFEL', 'KIRSCHE', 'SCHOKOLADE', 'FAHRRAD', 'FLUGZEUG'];
  function shift(s, k) { return s.split('').map(function (c) { return ABC[(ABC.indexOf(c) + k % 26 + 26) % 26]; }).join(''); }
  registerGame({
    id: 'geheimschrift', icon: '🕵️', title: 'Geheimschrift', desc: 'Entschlüssle das Wort, indem du die Buchstaben zurückschiebst.',
    stop: function () {},
    start: function (el) {
      var ID = 'geheimschrift', rnd = function (n) { return Math.floor(Math.random() * n); };
      var level = 1, word = '', key = 0, enc = '', cur = 0, moves = 0, won = false;
      el.innerHTML = '<div class="top"><div class="pts"><span data-lv>1</span><small>Level</small></div><div class="meta">Züge: <span data-mv>0</span><br>Rekord: <span data-best></span> Level</div></div>' +
        '<div class="stage a" data-stage></div><div class="row"><button data-minus>−</button><button class="alt" data-sh style="flex:2">Verschiebung: 0</button><button data-plus>+</button></div>' +
        '<div class="abc" data-a1></div><div class="abc d" data-a2></div><div class="msg" data-msg></div>' +
        '<div class="row"><button class="alt" data-hint>Tipp</button><button class="alt" data-new>Neues Wort</button></div><div class="row"><button class="hide" data-next style="width:100%">Nächstes Level</button></div>';
      var q = function (s) { return el.querySelector(s); }, stage = q('[data-stage]'), msg = q('[data-msg]'), nextBtn = q('[data-next]');
      function build() {
        var minL = level <= 2 ? 3 : level <= 5 ? 4 : 5, maxL = level <= 2 ? 5 : level <= 5 ? 7 : 11;
        var pool = WORDS.filter(function (w) { return w.length >= minL && w.length <= maxL; });
        word = pool[rnd(pool.length)]; key = level <= 2 ? 1 + rnd(3) : level <= 5 ? 1 + rnd(6) : 1 + rnd(25);
        enc = shift(word, key); cur = 0; moves = 0; won = false; nextBtn.classList.add('hide'); msg.textContent = ''; msg.className = 'msg'; render();
      }
      function render() {
        var dec = shift(enc, -cur);
        stage.innerHTML = '<div>Geheimwort</div><div class="big mono">' + enc + '</div><div>entschlüsselt</div><div class="big mono">' + dec + '</div>';
        q('[data-sh]').textContent = 'Verschiebung: ' + cur;
        q('[data-a1]').innerHTML = ABC.split('').map(function (c) { return '<span>' + c + '</span>'; }).join('');
        q('[data-a2]').innerHTML = ABC.split('').map(function (c) { return '<span>' + shift(c, -cur) + '</span>'; }).join('');
        q('[data-lv]').textContent = level; q('[data-mv]').textContent = moves; q('[data-best]').textContent = fmt(store.get('best_' + ID, 0));
      }
      function change(d) {
        if (won) return; cur = (cur + d + 26) % 26; moves++; render();
        if (shift(enc, -cur) === word) {
          won = true; setBest(ID, level); msg.textContent = '✓ Das Wort lautet ' + word + '!'; msg.className = 'msg ok'; nextBtn.classList.remove('hide');
        }
      }
      q('[data-minus]').onclick = function () { change(-1); };
      q('[data-plus]').onclick = function () { change(1); };
      q('[data-hint]').onclick = function () {
        if (won) return; msg.textContent = 'Tipp: Das Wort beginnt mit «' + word[0] + '». Suche oben «' + enc[0] + '» und stelle ein, dass darunter «' + word[0] + '» steht.'; msg.className = 'msg';
      };
      q('[data-new]').onclick = build;
      nextBtn.onclick = function () { level++; build(); };
      build();
    }
  });
})();
