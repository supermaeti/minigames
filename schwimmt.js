(function () {
  var cleanup = function () {};
  var ITEMS = [
    ['Holz', '🪵', 1, 'Holz ist leichter als Wasser.'], ['Stein', '🪨', 0, 'Ein Stein ist schwerer als Wasser.'], ['Apfel', '🍎', 1, 'Ein Apfel enthält viel Luft und schwimmt.'],
    ['rohes Ei', '🥚', 0, 'Im Süsswasser sinkt ein rohes Ei. Im Salzwasser würde es schwimmen.'], ['Schlüssel', '🔑', 0, 'Metall ist schwerer als Wasser.'], ['Münze', '🪙', 0, 'Metall sinkt.'],
    ['Anker', '⚓', 0, 'Ein Anker aus Eisen ist sehr schwer und sinkt.'], ['Schiff', '🚢', 1, 'Ein Schiff ist innen voller Luft. Darum schwimmt es, obwohl es aus Stahl ist.'],
    ['Fussball', '⚽', 1, 'Ein Ball ist innen mit Luft gefüllt.'], ['Eiswürfel', '🧊', 1, 'Eis ist etwas leichter als Wasser.'], ['Zitrone', '🍋', 1, 'Eine Zitrone schwimmt.'],
    ['Karotte', '🥕', 0, 'Eine Karotte ist schwerer als Wasser.'], ['Kartoffel', '🥔', 0, 'Eine Kartoffel sinkt.'], ['Banane', '🍌', 1, 'Eine Banane schwimmt.'],
    ['Orange mit Schale', '🍊', 1, 'Mit Schale schwimmt sie, weil die Schale Luft enthält. Geschält sinkt sie.'], ['Wassermelone', '🍉', 1, 'Eine Wassermelone schwimmt.'],
    ['Kerze', '🕯️', 1, 'Wachs ist leichter als Wasser.'], ['Ente', '🦆', 1, 'Enten haben Luft in den Federn und schwimmen.'], ['Schere', '✂️', 0, 'Metall sinkt.'],
    ['Hammer', '🔨', 0, 'Ein Hammer ist schwer und sinkt.'], ['Handy', '📱', 0, 'Ein Handy sinkt (und geht kaputt!).'], ['Blatt', '🍃', 1, 'Ein Blatt ist sehr leicht.'],
    ['Feder', '🪶', 1, 'Eine Feder ist leicht und schwimmt.'], ['Luftballon', '🎈', 1, 'Ein Luftballon ist mit Luft gefüllt.'], ['Segelboot', '⛵', 1, 'Ein Boot ist hohl und schwimmt.'],
    ['leere Flasche (zu)', '🧴', 1, 'Eine verschlossene Flasche ist mit Luft gefüllt.'], ['Backstein', '🧱', 0, 'Ein Stein aus Ton ist schwer und sinkt.'], ['Rose', '🌹', 1, 'Eine Blume ist leicht und schwimmt.'],
    ['Pokal', '🏆', 0, 'Ein Pokal aus Metall sinkt.'], ['Gummiente', '🐥', 1, 'Eine Gummiente ist innen hohl und schwimmt.'], ['Basketball', '🏀', 1, 'Der Ball ist mit Luft gefüllt.'],
    ['Zahnrad', '⚙️', 0, 'Metall sinkt.'], ['Tomate', '🍅', 1, 'Eine Tomate schwimmt meistens, sie hat viel Luft und Wasser in sich.']
  ];
  registerGame({
    id: 'schwimmt', icon: '🌊', title: 'Schwimmt oder sinkt?', desc: 'Was passiert mit dem Gegenstand im Wasser?',
    stop: function () { cleanup(); },
    start: function (el) {
      cleanup();
      var ID = 'schwimmt', score = 0, lives = 3, cur = null, deck = [], state = 'ready';
      el.innerHTML = '<div class="top"><div class="pts"><span data-score>0</span><small>Punkte</small></div><div class="meta"><span data-lives></span><br>Rekord: <span data-best></span></div></div>' +
        '<div class="stage a" data-stage></div><div class="msg" data-msg></div><div data-ctl></div>';
      var q = function (s) { return el.querySelector(s); }, stage = q('[data-stage]'), msg = q('[data-msg]'), ctl = q('[data-ctl]');
      function upd() { q('[data-score]').textContent = score; q('[data-best]').textContent = fmt(store.get('best_' + ID, 0)); q('[data-lives]').textContent = '❤️'.repeat(lives) + '🖤'.repeat(3 - lives); }
      function single(label, k) { ctl.innerHTML = '<button data-k="' + (k || 'go') + '" style="width:100%">' + label + '</button>'; }
      function draw() {
        if (!deck.length) { deck = ITEMS.slice().sort(function () { return Math.random() - 0.5; }); }
        cur = deck.pop();
        stage.innerHTML = '<div class="emo">' + cur[1] + '</div><div class="big" style="font-size:28px">' + cur[0] + '</div>';
        ctl.innerHTML = '<div class="g2"><button data-k="1">Schwimmt 🛟</button><button data-k="0">Sinkt ⬇️</button></div>'; state = 'q';
      }
      function answer(v) {
        var ok = (v === cur[2]); state = 'fb';
        if (ok) { score++; msg.className = 'msg ok'; } else { lives--; msg.className = 'msg bad'; }
        msg.textContent = (ok ? '✓ ' : '✗ ') + cur[0] + (cur[2] ? ' schwimmt. ' : ' sinkt. ') + cur[3]; upd();
        if (lives <= 0) { over(); return; }
        single('Weiter', 'next');
      }
      function over() {
        state = 'over'; var old = store.get('best_' + ID, 0); setBest(ID, score); upd();
        stage.innerHTML = '<div class="big">' + score + ' Punkte</div><div>' + (score > old ? 'Neuer Rekord!' : 'Vorbei') + '</div>'; single('Nochmal');
      }
      ctl.addEventListener('pointerdown', function (e) {
        var b = e.target.closest('button'); if (!b) return; e.preventDefault();
        var k = b.getAttribute('data-k');
        if (k === 'go') { score = 0; lives = 3; msg.textContent = ''; msg.className = 'msg'; upd(); draw(); }
        else if (k === 'next') { msg.textContent = ''; msg.className = 'msg'; draw(); }
        else if (state === 'q') answer(parseInt(k, 10));
      });
      cleanup = function () { state = 'gone'; };
      el._dbg = function () { return cur; };
      stage.innerHTML = '<div class="emo">🌊</div><div class="big" style="font-size:28px">Bereit?</div>'; single('Start'); upd();
    }
  });
})();
