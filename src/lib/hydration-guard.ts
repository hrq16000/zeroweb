/**
 * Guard de hidratação (roda antes do bundle do app, no <head>).
 *
 * Motivo: quando o navegador serve um bundle JS defasado (deploy novo, cache
 * agressivo ou dev-server re-otimizando dependências), o payload SSR
 * (`window.$_TSR.router`) não bate com o client e o TanStack lança
 * "Invariant failed: Expected to find a dehydrated data on window.$_TSR.router",
 * resultando em tela branca.
 *
 * O script abaixo é dependency-free e propositalmente em ES5:
 *  1. captura o erro (telemetria em /api/public/hydration-report);
 *  2. tenta UMA recarga com cache-busting (?__hb=...);
 *  3. se ainda falhar, mostra um fallback amigável em vez de tela branca.
 */
export const HYDRATION_GUARD_SCRIPT = `(function(){
  if (window.__0webHydrationGuard) return; window.__0webHydrationGuard = 1;
  var KEY = '0web:hydration-retry';
  var done = false;
  function report(reason, detail){
    try {
      console.error('[hydration]', reason, detail);
      var body = JSON.stringify({
        reason: reason,
        detail: String(detail || '').slice(0, 500),
        path: location.pathname,
        ua: (navigator.userAgent || '').slice(0, 200),
        ts: Date.now()
      });
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/public/hydration-report', new Blob([body], { type: 'application/json' }));
      } else {
        fetch('/api/public/hydration-report', { method: 'POST', body: body, headers: { 'Content-Type': 'application/json' }, keepalive: true })['catch'](function(){});
      }
    } catch (e) {}
  }
  function fallback(){
    try {
      if (document.getElementById('hydration-fallback')) return;
      var d = document.createElement('div');
      d.id = 'hydration-fallback';
      d.setAttribute('style', 'position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;background:#fff;color:#0b1120;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;padding:24px;text-align:center');
      d.innerHTML = '<div style="max-width:420px"><h1 style="font-size:20px;font-weight:700;margin:0 0 8px">Não conseguimos carregar esta página</h1>'
        + '<p style="font-size:14px;line-height:1.5;color:#475569;margin:0 0 20px">Isso costuma acontecer quando o navegador guardou uma versão antiga do site. Atualize para carregar a versão mais recente.</p>'
        + '<button id="hydration-fallback-reload" style="background:#0066FF;color:#fff;border:0;border-radius:999px;padding:12px 22px;font-weight:600;cursor:pointer">Atualizar página</button>'
        + '<div style="margin-top:12px"><a href="/" style="color:#0066FF;font-size:13px">Ir para o início</a></div></div>';
      document.body.appendChild(d);
      var b = document.getElementById('hydration-fallback-reload');
      if (b) b.onclick = function(){ try { sessionStorage.removeItem(KEY); } catch (e) {} location.reload(); };
    } catch (e) {}
  }
  function recover(reason, detail){
    if (done) return; done = true;
    report(reason, detail);
    var tries = 0;
    try { tries = parseInt(sessionStorage.getItem(KEY) || '0', 10) || 0; } catch (e) {}
    if (tries < 1) {
      try { sessionStorage.setItem(KEY, String(tries + 1)); } catch (e) {}
      try {
        var u = new URL(location.href);
        u.searchParams.set('__hb', Date.now().toString(36));
        location.replace(u.toString());
        return;
      } catch (e) {}
    }
    fallback();
  }
  function looksLikeHydrationError(msg){
    return /\\$_TSR|dehydrated|Invariant failed|Failed to fetch dynamically imported module|error loading dynamically imported module/i.test(String(msg || ''));
  }
  window.addEventListener('error', function(ev){
    var msg = (ev && (ev.message || (ev.error && ev.error.message))) || '';
    if (looksLikeHydrationError(msg)) recover('runtime_error', msg);
  });
  window.addEventListener('unhandledrejection', function(ev){
    var r = ev && ev.reason;
    var msg = (r && (r.message || r)) || '';
    if (looksLikeHydrationError(msg)) recover('unhandled_rejection', msg);
  });
  window.addEventListener('load', function(){
    setTimeout(function(){
      if (done) return;
      var text = (document.body && document.body.innerText || '').trim();
      var blank = text.length < 10;
      if (blank) {
        recover('blank_screen', 'tsr=' + !!(window.$_TSR) + ' blank=1');
      } else {
        try { sessionStorage.removeItem(KEY); } catch (e) {}
      }
    }, 5000);
  });
})();`;
