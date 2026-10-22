(function () {
  var cleanup = function () {};
  registerGame({
    id: 'blitz-tippen', icon: '👆', title: 'Blitz-Tippen', desc: 'So oft wie möglich tippen – 10 Sekunden.',
    stop: function () { cleanup(); },
    start: function (el) {
      cleanup();
      var ID = 'blitz-tippen', T = 10000, n = 0, state = 'ready', iv = null, lock = null, t0 = 0;
      var HINT = 'Die Zeit startet beim ersten Tipp.';
      el.innerHTML = '<div class="top"><div class="pts"><span data-n>0</span><small>Tipper</small></div><div class="meta">Zeit: <span data-t>10,0</span> s<br>Rekord: <span data-best></span></div></div>' +
        '<div class="msg" data-msg>' + HINT + '</div><div class="row"><button class="tap" data-btn>Tippen!</button></div>';
      var q = function (s) { return el.querySelector(s); }, btn = q('[data-btn]'), msg = q('[data-msg]');
      function upd() { q('[data-n]').textContent = n; q('[data-best]').textContent = fmt(store.get('best_' + ID, 0)); }
      cleanup = function () { clearInterval(iv); clearTimeout(lock); state = 'gone'; };
      function finish() {
        clearInterval(iv); state = 'locked'; q('[data-t]').textContent = '0,0';
        var old = store.get('best_' + ID, 0); setBest(ID, n); upd();
        msg.innerHTML = '<b>' + n + ' Tipper</b> (' + fmt((n / 10).toFixed(1)) + ' pro Sekunde)' + (n > old ? ' – neuer Rekord!' : '');
        btn.textContent = '…';
        lock = setTimeout(function () { state = 'done'; btn.textContent = 'Nochmal'; }, 800);
      }
      function tap() {
        if (state === 'ready') {
          state = 'running'; t0 = performance.now(); n = 1; msg.textContent = ''; upd();
          iv = setInterval(function () {
            var left = T - (performance.now() - t0);
            if (left <= 0) finish(); else q('[data-t]').textContent = fmt((left / 1000).toFixed(1));
          }, 50);
        } else if (state === 'running') {
          if (performance.now() - t0 >= T) { finish(); return; }
          n++; upd();
        } else if (state === 'done') {
          n = 0; state = 'ready'; btn.textContent = 'Tippen!'; msg.textContent = HINT; q('[data-t]').textContent = '10,0'; upd();
        }
      }
      btn.addEventListener('pointerdown', function (e) { e.preventDefault(); tap(); });
      btn.addEventListener('click', function (e) { if (e.detail === 0) tap(); });
      upd();
    }
  });
})();
