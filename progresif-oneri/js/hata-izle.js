/* ============================================================
   Kepekci Optik - Faz 11 Error Telemetry
   ============================================================
   Tablet'te sessiz hatalarin iz birakmasi icin localStorage
   tabanli basit hata defteri. Son 50 hata saklanir.

   API:
     HataDefteri.oku()       -> son hatalar
     HataDefteri.temizle()   -> defteri sil
     HataDefteri.kaydet(obj) -> manuel ekle
   ============================================================ */

(function(window) {
  'use strict';

  var KEY = 'kepekci_hata_defteri';
  var MAX = 50;

  function oku() {
    try {
      var raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : [];
    } catch(e) {
      return [];
    }
  }

  function yaz(liste) {
    try {
      if (liste.length > MAX) liste = liste.slice(-MAX);
      localStorage.setItem(KEY, JSON.stringify(liste));
    } catch(e) {
      // localStorage full veya private mode - sessizce yut
    }
  }

  function kaydet(hata) {
    var liste = oku();
    liste.push(Object.assign({
      zaman: new Date().toISOString(),
      sayfa: location.pathname,
      tarayici: navigator.userAgent.substring(0, 100)
    }, hata));
    yaz(liste);
  }

  function temizle() {
    try { localStorage.removeItem(KEY); } catch(e) {}
  }

  // Global error handler
  window.addEventListener('error', function(e) {
    kaydet({
      tip: 'error',
      mesaj: e.message || 'Bilinmeyen hata',
      dosya: e.filename || '?',
      satir: e.lineno || 0,
      sutun: e.colno || 0,
      stack: e.error && e.error.stack ? String(e.error.stack).substring(0, 500) : null
    });
  });

  // Unhandled promise rejection
  window.addEventListener('unhandledrejection', function(e) {
    var mesaj = 'Promise rejection';
    try {
      if (e.reason) {
        mesaj = e.reason.message || String(e.reason);
      }
    } catch(_){}
    kaydet({
      tip: 'promise',
      mesaj: mesaj.substring(0, 300),
      stack: e.reason && e.reason.stack ? String(e.reason.stack).substring(0, 500) : null
    });
  });

  // Public API
  window.HataDefteri = {
    oku: oku,
    kaydet: kaydet,
    temizle: temizle
  };

  // Developer console icin
  if (typeof console !== 'undefined') {
    console.log('[Kepekci] Hata izleyici aktif. Son hatalar: HataDefteri.oku()');
  }

})(window);
