(function () {
  var cleanup = function () {};
  registerGame({
    id: 'time-guess', icon: '⏱️', title: 'Zeitgefühl', desc: 'Schätze die Zeit und drück im richtigen Moment.',
    stop: function () { cleanup(); },
    start: function (el) {
      cleanup();
      var ID = 'time-guess', ROUNDS = 5, MSGS = ['Nicht drücken!', 'Jetzt!', 'Fast…', 'Noch 2 s', 'Zu spät?', '3… 2… 1…', 'Pssst!'];
      var round = 0, total = 0, target = 0, t0 = 0, state = 'ready', distract = false, timers = [];
      var rnd = function (n) { return Math.floor(Math.random() * n); };
      var f2 = function (n) { return n.toFixed(2).replace('.', ','); };
      el.innerHTML =
        '<div class="top"><div class="pts"><span data-total>0</span><small>Punkte</small></div>' +
        '<div class="meta">Runde <span data-round>1</span>/' + ROUNDS + '<br>Rekord: <span data-best></span></div></div>' +
        '<div class="stage" data-stage></div><div class="msg" data-msg></div>' +
        '<div class="row"><button data-main>Start</button></div>' +
        '<div class="row"><button class="alt" data-dis></button></div>' +
        '<div class="rules">Starte die Runde, schätze die angesagte Zeit und drück «Jetzt!», wenn du glaubst, sie ist um. Ein Zähler ist nicht sichtbar. Je näher dran, desto mehr Punkte (max. 100 pro Runde). Mit Ablenkung gibt es ×1,5.</div>';
      var q = function (s) { return el.querySelector(s); };
      var stage = q('[data-stage]'), main = q('[data-main]'), msg = q('[data-msg]');

      function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
      function clearAll() { timers.forEach(clearTimeout); timers = []; }
      cleanup = function () { clearAll(); state = 'gone'; };

      function updTop() {
        q('[data-total]').textContent = total; q('[data-round]').textContent = Math.min(round, ROUNDS);
        q('[data-best]').textContent = fmt(store.get('best_' + ID, 0));
        var d = q('[data-dis]'); d.textContent = 'Ablenkung: ' + (distract ? 'an' : 'aus') + ' (×1,5)'; d.classList.toggle('on', distract);
      }
      function newRound() {
        round++; target = 1 + rnd(10); state = 'ready';
        stage.style.background = ''; stage.innerHTML = '<div><div class="big">' + target + ' s</div>schätzen</div>';
        main.textContent = 'Start'; msg.textContent = ''; updTop();
      }
      function startDistraction() {
        var kind = ['flash', 'shapes', 'msg'][rnd(3)];
        stage.innerHTML = '';
        (function loop() {
          if (state !== 'running') return;
          if (kind === 'flash') stage.style.background = 'hsl(' + rnd(360) + ' 70% 55%)';
          else if (kind === 'shapes') {
            var s = document.createElement('div'), z = 20 + rnd(30);
            s.className = 'shape'; s.style.width = s.style.height = z + 'px';
            s.style.left = rnd(80) + '%'; s.style.top = rnd(80) + '%'; s.style.background = 'hsl(' + rnd(360) + ' 70% 55%)';
            s.style.setProperty('--dx', (rnd(120) - 60) + 'px'); s.style.setProperty('--dy', (rnd(120) - 60) + 'px');
            stage.appendChild(s); later(function () { s.remove(); }, 900);
          } else {
            stage.innerHTML = '<span>' + MSGS[rnd(MSGS.length)] + '</span>'; later(function () { stage.innerHTML = ''; }, 700);
          }
          later(loop, 400 + rnd(700));
        })();
      }
      function act() {
        if (state === 'ready') {
          t0 = performance.now(); state = 'running'; main.textContent = 'Jetzt!'; msg.textContent = '';
          if (distract) startDistraction(); else stage.innerHTML = '<span>…</span>';
        } else if (state === 'running') {
          var e = (performance.now() - t0) / 1000, diff = e - target;
          clearAll(); stage.style.background = ''; stage.innerHTML = '<div class="big">' + f2(e) + ' s</div>';
          var dev = Math.max(0, Math.abs(diff) - 0.08);
          var pts = Math.round(100 * Math.max(0, 1 - dev / target / 0.5));
          if (distract) pts = Math.round(pts * 1.5);
          total += pts; updTop();
          msg.innerHTML = 'Ziel ' + target + ' s · ' + f2(Math.abs(diff)) + ' s ' + (diff > 0 ? 'zu spät' : 'zu früh') + '<br>+' + pts + ' Punkte';
          if (round >= ROUNDS) {
            state = 'done'; var old = store.get('best_' + ID, 0); setBest(ID, total); updTop();
            msg.innerHTML += '<br><b>Gesamt: ' + total + (total > old ? ' – neuer Rekord!' : '') + '</b>'; main.textContent = 'Nochmal';
          } else { state = 'result'; main.textContent = 'Nächste Runde'; }
        } else if (state === 'result') newRound();
        else if (state === 'done') { total = 0; round = 0; newRound(); }
      }
      main.addEventListener('pointerdown', function (e) { e.preventDefault(); act(); });
      main.addEventListener('click', function (e) { if (e.detail === 0) act(); });
      q('[data-dis]').onclick = function () { if (state !== 'running') { distract = !distract; updTop(); } };
      newRound();
    }
  });
})();
