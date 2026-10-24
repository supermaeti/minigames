(function () {
  var cleanup = function () {};
  function isPrime(n) { if (n < 2) return false; for (var i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; }
  function prevPrime(n) { var p = n - 1; while (p > 1 && !isPrime(p)) p--; return p > 1 ? p : null; }
  function nextPrime(n) { var p = n + 1; while (!isPrime(p)) p++; return p; }
  function factor(n) { for (var i = 2; i * i <= n; i++) if (n % i === 0) return i; return n; }
  registerGame({
    id: 'primzahl', icon: '🔍', title: 'Prim oder nicht?', desc: 'Erkenne Primzahlen und nenne ihre Nachbar-Primzahlen.',
    stop: function () { cleanup(); },
    start: function (el) {
      cleanup();
      var ID = 'primzahl', rnd = function (n) { return Math.floor(Math.random() * n); };
      var score = 0, lives = 3, n = 2, prevP = null, nextP = 3, step = 0, a1 = null, inp = '', state = 'ready', stage2 = false, tm = null, practice = false, lastN = 0;
      el.innerHTML = '<div class="top"><div class="pts"><span data-score>0</span><small>Punkte</small></div><div class="meta"><span data-lives></span><br>Rekord: <span data-best></span></div></div>' +
        '<div class="stage a" data-stage></div><div class="tbar"><i data-bar></i></div><div class="msg" data-msg></div><div data-ctl></div>' +
        '<div class="row"><button class="alt" data-help>?</button><button class="alt" data-prac>Übung: aus</button></div><div class="info hide" data-info></div>';
      var q = function (s) { return el.querySelector(s); }, stage = q('[data-stage]'), bar = q('[data-bar]'), msg = q('[data-msg]'), ctl = q('[data-ctl]'), info = q('[data-info]');
      function upd() {
        q('[data-score]').textContent = score; q('[data-best]').textContent = fmt(store.get('best_' + ID, 0));
        q('[data-lives]').textContent = practice ? 'Übung' : '❤️'.repeat(lives) + '🖤'.repeat(3 - lives);
      }
      function stopBar() { bar.style.transition = 'none'; bar.style.width = '0%'; }
      function startBar(ms) { bar.style.transition = 'none'; bar.style.width = '100%'; void bar.offsetWidth; bar.style.transition = 'width ' + ms + 'ms linear'; bar.style.width = '0%'; }
      function single(label) { ctl.innerHTML = '<button data-k="go" style="width:100%">' + label + '</button>'; }
      function timer(ms) { clearTimeout(tm); if (practice) { stopBar(); return; } startBar(ms); tm = setTimeout(function () { fail(true); }, ms); }
      function infoText() {
        var t = '<b>Teilbarkeit:</b><br>durch 2: letzte Ziffer gerade<br>durch 3: Quersumme durch 3 teilbar<br>durch 5: letzte Ziffer 0 oder 5<br>durch 11: Ziffern abwechselnd plus und minus ergibt 0 oder ein Vielfaches von 11<br>Eine Primzahl ist nur durch 1 und sich selbst teilbar (die 1 zählt nicht).';
        if (practice) t += '<br><b>Primzahlen bis 100:</b><br>2 3 5 7 11 13 17 19 23 29 31 37 41 43 47 53 59 61 67 71 73 79 83 89 97';
        info.innerHTML = t;
      }
      function pick() {
        var max = score < 4 ? 30 : score < 10 ? 60 : 100, wantPrime = Math.random() < 0.45, v, tries = 0;
        do { v = 2 + rnd(max - 1); tries++; } while ((isPrime(v) !== wantPrime || v === lastN) && tries < 200);
        lastN = v; return v;
      }
      function next() {
        n = pick(); stage2 = false; state = 'running';
        stage.innerHTML = '<div class="big">' + n + '</div><div>Prim oder nicht?</div>';
        ctl.innerHTML = '<div class="g2"><button data-k="p">Prim</button><button data-k="n">Nicht prim</button></div>';
        timer(Math.max(4000, 6500 - score * 50));
      }
      function reason() { return isPrime(n) ? n + ' ist prim' : n + ' = ' + factor(n) + ' × ' + (n / factor(n)); }
      function fail(timeout) {
        clearTimeout(tm);
        if (!practice) lives--;
        msg.textContent = (timeout ? 'Zeit! ' : '✗ ') + (stage2 ? 'Nachbarn von ' + n + ': ' + (prevP === null ? 'keine kleinere' : prevP) + ' und ' + nextP : reason()); msg.className = 'msg bad';
        upd(); after();
      }
      function after() { if (!practice && lives <= 0) over(); else next(); }
      function good(pts, text) { clearTimeout(tm); score += pts; msg.textContent = '✓ ' + text; msg.className = 'msg ok'; upd(); next(); }
      function answer1(guessPrime) {
        if (guessPrime !== isPrime(n)) { fail(false); return; }
        if (!isPrime(n)) { good(1, reason()); return; }
        stage2 = true; prevP = prevPrime(n); nextP = nextPrime(n); step = prevP === null ? 1 : 0; a1 = null; inp = ''; digits(); renderQ2(); timer(14000);
      }
      function renderQ2() {
        var d = step === 0 ? (inp || '…') : a1;
        stage.innerHTML = '<div class="big">' + n + ' ist prim ✓</div><div>Primzahl davor: <b>' + (prevP === null ? 'gibt es nicht' : d) + '</b></div><div>Primzahl danach: <b>' + (step === 1 ? (inp || '…') : '…') + '</b></div>';
      }
      function digits() {
        var h = '<div class="pad">'; for (var i = 1; i <= 9; i++) h += '<button data-k="' + i + '">' + i + '</button>';
        ctl.innerHTML = h + '<button data-k="b">⌫</button><button data-k="0">0</button><button data-k="ok">OK</button></div>';
      }
      function pressQ2(k) {
        if (k === 'b') inp = inp.slice(0, -1);
        else if (k === 'ok') {
          if (!inp) return;
          if (step === 0) { a1 = parseInt(inp, 10); inp = ''; step = 1; }
          else {
            var a2 = parseInt(inp, 10);
            if ((prevP === null || a1 === prevP) && a2 === nextP) good(2, (prevP === null ? '' : prevP + ' · ') + n + ' · ' + nextP); else fail(false);
            return;
          }
        } else if (inp.length < 3) inp += k;
        renderQ2();
      }
      function over() {
        state = 'over'; stopBar(); clearTimeout(tm);
        var old = store.get('best_' + ID, 0); setBest(ID, score); upd();
        stage.innerHTML = '<div class="big">' + score + ' Punkte</div><div>' + (score > old ? 'Neuer Rekord!' : 'Vorbei') + '</div>'; single('Nochmal');
      }
      function begin() { score = 0; lives = 3; msg.textContent = ''; msg.className = 'msg'; upd(); next(); }
      function toReady() {
        clearTimeout(tm); stopBar(); state = 'ready'; msg.textContent = ''; msg.className = 'msg'; stage.innerHTML = '<div class="big">Bereit?</div>'; single('Start'); upd(); infoText();
      }
      ctl.addEventListener('pointerdown', function (e) {
        var b = e.target.closest('button'); if (!b) return; e.preventDefault();
        var k = b.getAttribute('data-k');
        if (k === 'go') begin(); else if (state !== 'running') return;
        else if (!stage2) answer1(k === 'p'); else pressQ2(k);
      });
      function key(e) {
        if (state !== 'running' || !stage2) return;
        if (/^[0-9]$/.test(e.key)) pressQ2(e.key); else if (e.key === 'Backspace') pressQ2('b'); else if (e.key === 'Enter') pressQ2('ok');
      }
      document.addEventListener('keydown', key);
      q('[data-help]').onclick = function () { infoText(); info.classList.toggle('hide'); };
      q('[data-prac]').onclick = function () { practice = !practice; this.textContent = 'Übung: ' + (practice ? 'an' : 'aus'); this.classList.toggle('on', practice); toReady(); };
      cleanup = function () { clearTimeout(tm); state = 'gone'; document.removeEventListener('keydown', key); };
      toReady();
    }
  });
})();
