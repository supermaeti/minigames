// Menü, Routing, Speicher. Spiele melden sich mit registerGame({...}) an.
(function () {
  var games = [];
  window.registerGame = function (g) { games.push(g); };
  window.fmt = function (n) { return String(n).replace('.', ','); };
  window.store = {
    get: function (k, d) { try { var v = localStorage.getItem('mg_' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem('mg_' + k, JSON.stringify(v)); } catch (e) {} }
  };
  window.setBest = function (id, v) { if (v > store.get('best_' + id, 0)) store.set('best_' + id, v); };

  var app = document.getElementById('app'), current = null;
  function leave() { if (current && current.stop) current.stop(); current = null; }
  function menu() {
    leave();
    app.innerHTML = '<h1>Minigames</h1><div class="grid"></div>';
    var grid = app.querySelector('.grid');
    games.forEach(function (g) {
      var a = document.createElement('a');
      a.className = 'tile'; a.href = '#' + g.id;
      a.innerHTML = '<strong>' + g.icon + ' ' + g.title + '</strong><span>' + g.desc + '</span><small>Rekord: ' + fmt(store.get('best_' + g.id, 0)) + '</small>';
      grid.appendChild(a);
    });
  }
  function open(id) {
    var g = games.filter(function (x) { return x.id === id; })[0];
    if (!g) return menu();
    leave(); current = g;
    app.innerHTML = '<div class="bar"><a class="back" href="#">← Menü</a><b>' + g.title + '</b></div><div id="game"></div>';
    g.start(document.getElementById('game'));
  }
  function route() { var id = location.hash.slice(1); id ? open(id) : menu(); }
  addEventListener('hashchange', route);
  addEventListener('DOMContentLoaded', route);
  if ('serviceWorker' in navigator) addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
})();
