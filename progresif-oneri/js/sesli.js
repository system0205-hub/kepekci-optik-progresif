/* ============================================================
   Kepekci Optik - Faz 9 Sesli Giris
   ============================================================
   Web Speech API (SpeechRecognition) + Turkce sayi parser.
   Her input'a mikrofon ikonu: basinca kayit baslar, konusanin
   Turkce metni once transkript sonra sayiya donusur.

   Onemli: Web Speech API internet baglantisi gerektirir
   (Chrome/Edge Google sunucularini kullanir). Offline'da buton
   gri olur ve "Online gerekli" uyarisi verir.

   Muzaffer Bey: "sag SPH eksi iki nokta elli" der, "−2.50" yazilir.
   ============================================================ */

(function(window) {
  'use strict';

  // ===== Turkce sayi sozlugu =====
  var RAKAMLAR = {
    'sifir': 0, 'bir': 1, 'iki': 2, 'uc': 3, 'üc': 3, 'üç': 3, 'uç': 3,
    'dort': 4, 'dört': 4, 'bes': 5, 'beş': 5, 'alti': 6, 'altı': 6,
    'yedi': 7, 'sekiz': 8, 'dokuz': 9
  };
  var ONLUKLAR = {
    'on': 10, 'yirmi': 20, 'otuz': 30, 'kirk': 40, 'kırk': 40,
    'elli': 50, 'altmis': 60, 'altmış': 60, 'yetmis': 70, 'yetmiş': 70,
    'seksen': 80, 'doksan': 90
  };
  var YUZLUKLER = { 'yuz': 100, 'yüz': 100, 'bin': 1000 };

  var KESIRLER = {
    'yarim': 0.5, 'yarı': 0.5, 'yarım': 0.5,
    'çeyrek': 0.25, 'ceyrek': 0.25
  };

  // "yirmi beş" -> 25, "yüz seksen" -> 180
  function kelimeToSayi(kelimeler) {
    if (!kelimeler || !kelimeler.length) return null;
    var toplam = 0;
    var gecici = 0;
    for (var i = 0; i < kelimeler.length; i++) {
      var k = kelimeler[i].toLowerCase().trim();
      if (RAKAMLAR.hasOwnProperty(k)) {
        gecici += RAKAMLAR[k];
      } else if (ONLUKLAR.hasOwnProperty(k)) {
        gecici += ONLUKLAR[k];
      } else if (YUZLUKLER.hasOwnProperty(k)) {
        gecici = (gecici || 1) * YUZLUKLER[k];
        if (k === 'bin') { toplam += gecici; gecici = 0; }
      } else if (KESIRLER.hasOwnProperty(k)) {
        return KESIRLER[k]; // "yarim" tek basina 0.50
      } else {
        // Rakam olarak sayi varsa dogrudan al
        var sayiDirekt = parseFloat(k.replace(',', '.'));
        if (!isNaN(sayiDirekt)) return sayiDirekt;
      }
    }
    return toplam + gecici;
  }

  // Metni analiz et: "eksi iki nokta elli" -> -2.50
  function transkripttenSayi(metin) {
    if (!metin) return null;
    var m = String(metin).toLowerCase()
      .replace(/[^\w\sğüşıöçı.,+\-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Isaret
    var isaret = 1;
    if (/\beksi\b|\bnegatif\b|^-/.test(m)) isaret = -1;
    // "arti" pozitif default

    // Temizle isaret kelimelerini
    m = m.replace(/\beksi\b|\bnegatif\b|\barti\b|\bartı\b|\bpozitif\b/g, '').trim();
    m = m.replace(/^[-+]/, '').trim();

    // Direkt sayi varsa (ornegin "1.50" veya "2,25")
    var direktMatch = m.match(/^\d+[.,]?\d*$/);
    if (direktMatch) {
      return parseFloat(direktMatch[0].replace(',', '.')) * isaret;
    }

    // "nokta" / "virgul" ile bolunen kisimlar
    var parcalar = m.split(/\b(nokta|virgul|virgül)\b/);
    if (parcalar.length > 1) {
      var tamKisim = parcalar[0].trim().split(/\s+/).filter(Boolean);
      var ondalikKisim = parcalar[2].trim().split(/\s+/).filter(Boolean);
      var tam = kelimeToSayi(tamKisim) || 0;
      // Ondalik: "elli" -> 50 -> 0.50
      // "yirmi bes" -> 25 -> 0.25
      var ondalikSayi = kelimeToSayi(ondalikKisim);
      if (ondalikSayi === null) return tam * isaret;
      // Ondalik basamak sayisi: tek basamak (<10) -> /10, iki basamak -> /100
      var bolgen = ondalikSayi < 10 ? 10 : 100;
      return (tam + ondalikSayi / bolgen) * isaret;
    }

    // Tam sayi
    var kelimeler = m.split(/\s+/).filter(Boolean);
    var tamsayi = kelimeToSayi(kelimeler);
    if (tamsayi !== null) return tamsayi * isaret;

    return null;
  }

  // Desktek kontrol
  function desteklenenMi() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  // Kayit baslat
  function kayitBaslat(callbacks) {
    if (!desteklenenMi()) {
      if (callbacks.onHata) callbacks.onHata(new Error('Tarayici sesli girisi desteklemiyor'));
      return null;
    }
    if (!navigator.onLine) {
      if (callbacks.onHata) callbacks.onHata(new Error('Sesli giris icin internet gerekli'));
      return null;
    }

    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    var rec = new SR();
    rec.lang = 'tr-TR';
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    var sonTranskript = '';
    rec.onresult = function(event) {
      var sonuc = '';
      for (var i = event.resultIndex; i < event.results.length; i++) {
        sonuc += event.results[i][0].transcript;
      }
      sonTranskript = sonuc;
      if (callbacks.onAraSonuc) callbacks.onAraSonuc(sonuc, event.results[event.results.length-1].isFinal);
    };
    rec.onerror = function(e) {
      if (callbacks.onHata) callbacks.onHata(new Error('Sesli giris hatasi: ' + (e.error || 'bilinmeyen')));
    };
    rec.onend = function() {
      if (callbacks.onBitti) callbacks.onBitti(sonTranskript);
    };

    try {
      rec.start();
    } catch (err) {
      if (callbacks.onHata) callbacks.onHata(err);
      return null;
    }
    return rec;
  }

  // Bir input'u sesli girisli hale getir
  function inputaSesBagla(inputEl, btnEl, tip /* 'sayi' veya 'metin' */) {
    if (!inputEl || !btnEl) return;
    var aktifRec = null;

    function durumGuncelle(kayitYapiyor) {
      btnEl.setAttribute('aria-pressed', String(kayitYapiyor));
      btnEl.dataset.kayit = kayitYapiyor ? '1' : '0';
      btnEl.style.background = kayitYapiyor ? '#ef4444' : '';
      btnEl.style.color = kayitYapiyor ? 'white' : '';
      btnEl.title = kayitYapiyor ? 'Durdur' : 'Sesli giris';
    }

    btnEl.addEventListener('click', function(e) {
      e.preventDefault();
      if (aktifRec) {
        try { aktifRec.stop(); } catch(_){}
        aktifRec = null;
        durumGuncelle(false);
        return;
      }

      durumGuncelle(true);
      aktifRec = kayitBaslat({
        onAraSonuc: function(metin, final) {
          if (final) {
            if (tip === 'sayi') {
              var sayi = transkripttenSayi(metin);
              if (sayi !== null && !isNaN(sayi)) {
                // Isaret ayri input'a yazilmali mi kontrol et
                var isaretSelect = inputEl.dataset.isaretSelect
                  ? document.getElementById(inputEl.dataset.isaretSelect)
                  : null;
                if (isaretSelect) {
                  isaretSelect.value = sayi < 0 ? '-' : '+';
                  isaretSelect.dispatchEvent(new Event('change', { bubbles: true }));
                  inputEl.value = Math.abs(sayi).toFixed(2);
                } else {
                  inputEl.value = sayi.toFixed(2);
                }
              } else {
                // Sayi parse edemedi - ham metin goster
                inputEl.value = metin;
                if (typeof window.bildirimGoster === 'function') {
                  window.bildirimGoster('Sayi anlasilamadi: "' + metin + '"', 'uyari');
                }
              }
            } else {
              inputEl.value = metin.trim();
            }
            inputEl.dispatchEvent(new Event('input', { bubbles: true }));
            inputEl.dispatchEvent(new Event('change', { bubbles: true }));
          }
        },
        onHata: function(err) {
          durumGuncelle(false);
          aktifRec = null;
          if (typeof window.bildirimGoster === 'function') {
            window.bildirimGoster(err.message || 'Sesli giris basarisiz', 'hata');
          }
        },
        onBitti: function() {
          aktifRec = null;
          durumGuncelle(false);
        }
      });
    });
  }

  // Public API
  window.KepekciSes = {
    desteklenenMi: desteklenenMi,
    kayitBaslat: kayitBaslat,
    transkripttenSayi: transkripttenSayi,
    kelimeToSayi: kelimeToSayi,
    inputaSesBagla: inputaSesBagla
  };

})(window);
