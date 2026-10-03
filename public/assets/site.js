/* BYOK shared page script. Handles: Copy full code, View source, and sizing/fonts for the embedded tool. */
(function () {
  'use strict';
  var base = document.currentScript ? new URL('.', document.currentScript.src) : null;
  var cache = {};

  function load(url) {
    if (cache[url]) return Promise.resolve(cache[url]);
    return fetch(url, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.text();
    }).then(function (t) { cache[url] = t; return t; });
  }

  function legacyCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', '');
    ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return legacyCopy(text); });
    }
    return Promise.resolve(legacyCopy(text));
  }

  function flash(btn, msg, bad) {
    var orig = btn.getAttribute('data-label') || btn.textContent;
    btn.setAttribute('data-label', orig);
    btn.textContent = msg;
    var state = document.querySelector('[data-copy-state]');
    if (state) { state.textContent = bad ? 'Copy was blocked by the browser. Use Download .html instead.' : ''; state.className = 'copy-state' + (bad ? ' bad' : ''); }
    clearTimeout(btn._t);
    btn._t = setTimeout(function () { btn.textContent = orig; }, 1800);
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('[data-copy]') : null;
    if (btn) {
      load(btn.getAttribute('data-copy')).then(function (text) {
        return copyText(text).then(function (ok) { flash(btn, ok ? 'Copied ✓' : 'Copy failed', !ok); });
      }).catch(function () { flash(btn, 'Copy failed', true); });
      return;
    }
    var tog = e.target.closest ? e.target.closest('[data-source]') : null;
    if (tog) {
      var box = document.getElementById(tog.getAttribute('aria-controls'));
      var pre = box.querySelector('pre');
      var open = box.hidden;
      box.hidden = !open;
      tog.setAttribute('aria-expanded', String(open));
      tog.textContent = open ? 'Hide source' : 'View source';
      if (open && pre.getAttribute('data-loaded') !== '1') {
        load(tog.getAttribute('data-source')).then(function (t) {
          pre.textContent = t; pre.setAttribute('data-loaded', '1');
        }).catch(function () { pre.textContent = 'Could not load the source. Open ' + tog.getAttribute('data-source') + ' directly.'; });
      }
    }
  });

  /* Embedded tool: apply site fonts (the tool file itself makes no external requests) and follow its height. */
  var frames = document.querySelectorAll('iframe[data-tool]');
  for (var i = 0; i < frames.length; i++) {
    (function (fr) {
      fr.addEventListener('load', function () {
        try {
          var d = fr.contentDocument;
          if (d && base && !d.getElementById('byok-fonts')) {
            var l = d.createElement('link');
            l.id = 'byok-fonts'; l.rel = 'stylesheet'; l.href = new URL('fonts.css', base).href;
            d.head.appendChild(l);
          }
        } catch (e) { /* not same-origin; tool keeps system fonts */ }
      });
    })(frames[i]);
  }
  window.addEventListener('message', function (e) {
    if (!e.data || typeof e.data.byokHeight !== 'number') return;
    for (var i = 0; i < frames.length; i++) {
      if (frames[i].contentWindow === e.source) frames[i].style.height = Math.max(480, Math.ceil(e.data.byokHeight) + 8) + 'px';
    }
  });
})();
