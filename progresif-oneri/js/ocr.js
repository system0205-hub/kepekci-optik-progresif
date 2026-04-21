/* ============================================================
   Kepekci Optik - Faz 8 OCR (Recete Fotograf Tanima)
   ============================================================
   Tesseract.js CDN'den lazy-load.
   Turkce + Ingilizce dil paketi.
   OCR -> regex parse -> dogrulama ekrani -> forma doldur.

   Muzaffer Bey'in kuralı: ticari kullanım, yanlis OCR = kayip,
   bu yuzden kullanici ONAYLAMADAN form doldurulmaz.
   ============================================================ */

(function(window) {
  'use strict';

  var TESSERACT_CDN = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.0.4/dist/tesseract.min.js';
  var TESSERACT_LANG = 'tur+eng';
  var tesseractYuklendi = false;
  var tesseractYukleniyor = null;

  // Tesseract.js'i bir defa yukle (lazy)
  function tesseractYukle() {
    if (tesseractYuklendi) return Promise.resolve();
    if (tesseractYukleniyor) return tesseractYukleniyor;

    tesseractYukleniyor = new Promise(function(resolve, reject) {
      if (typeof window.Tesseract !== 'undefined') {
        tesseractYuklendi = true;
        resolve();
        return;
      }
      var script = document.createElement('script');
      script.src = TESSERACT_CDN;
      script.async = true;
      script.onload = function() {
        tesseractYuklendi = true;
        resolve();
      };
      script.onerror = function() {
        tesseractYukleniyor = null;
        reject(new Error('Tesseract.js yuklenemedi - internet baglantisini kontrol edin'));
      };
      document.head.appendChild(script);
    });
    return tesseractYukleniyor;
  }

  // OCR calistir
  function ocrCalistir(resimKaynagi, ilerleme) {
    return tesseractYukle().then(function() {
      return window.Tesseract.recognize(resimKaynagi, TESSERACT_LANG, {
        logger: function(m) {
          if (ilerleme && m.status === 'recognizing text') {
            ilerleme(Math.round(m.progress * 100));
          }
        }
      });
    }).then(function(sonuc) {
      return sonuc.data.text || '';
    });
  }

  // Recete metninden degerleri parse et
  // Tesseract bazen "+" isaretini "t" olarak okuyabilir, normalize ederiz
  function metniTemizle(metin) {
    return String(metin || '')
      .replace(/\r\n/g, '\n')          // Windows -> Unix newline
      .replace(/[,]/g, '.')            // Virgul -> nokta
      .replace(/\bt(\d)/gi, '+$1')     // "t150" -> "+150"
      .replace(/[Oo](?=\d)/g, '0')     // O -> 0 sayi basinda
      .replace(/[Il](?=\d\.\d|\s|$)/g, '1') // I/l -> 1 bazi baglamlarda
      .replace(/[ \t]+/g, ' ')         // Satir ici coklu bosluk tek'e (newline korur)
      .replace(/\n{2,}/g, '\n')        // Coklu newline tek'e
      .trim();
  }

  // Sayi ve isaret ayir: "+2.50" -> { sayi: 2.50, isaret: '+' }
  function sayiIsaretAyir(str) {
    if (!str) return null;
    var m = String(str).trim().match(/^([+-]?)(\d+(?:\.\d+)?)$/);
    if (!m) return null;
    var sayi = parseFloat(m[2]);
    if (isNaN(sayi)) return null;
    var isaret = m[1] === '-' ? '-' : '+';
    return { sayi: Math.abs(sayi), isaret: isaret };
  }

  // Ana parse fonksiyonu
  function receteyiParse(rawMetin) {
    var metin = metniTemizle(rawMetin);
    var satirlar = metin.split(/\n|\r/).map(function(s){ return s.trim(); }).filter(Boolean);

    var sonuc = {
      uzak: {
        sag: { sph: null, sphIsaret: '+', cyl: null, cylIsaret: '-', aks: null },
        sol: { sph: null, sphIsaret: '+', cyl: null, cylIsaret: '-', aks: null }
      },
      yakin: {
        sag: { sph: null, sphIsaret: '+', cyl: null, cylIsaret: '-', aks: null },
        sol: { sph: null, sphIsaret: '+', cyl: null, cylIsaret: '-', aks: null }
      },
      add: { sag: null, sol: null },
      hastaAd: null,
      guven: {} // her alan icin "bulundu" / "bulunamadi"
    };

    // Hasta adi: "Ad Soyad:" veya "Hasta:" sonrasi
    var adMatch = metin.match(/(?:hasta|ad\s*soyad|adi\s*soyadi)[\s:]+([A-ZĞÜŞİÖÇ][A-ZĞÜŞİÖÇa-zğüşıöç ]+?)(?:\n|T\.C|TC|$)/i);
    if (adMatch) sonuc.hastaAd = adMatch[1].trim();

    // Her satiri tara, OD/OS/RE/LE/R/L ile baslayanlari bul
    function gozSatirParse(satir) {
      // Ornekler:
      //   OD +1.25 -0.50 180
      //   RE SPH +1.25 CYL -0.50 AX 180
      //   R  -2.00 -0.75 90
      var sayilar = [];
      // SPH (+/- 20 arasi)
      var sphMatch = satir.match(/SPH[\s:]*([+-]?\d+(?:\.\d+)?)/i);
      // CYL (-8 ile +8 arasi, cogunlukla negatif)
      var cylMatch = satir.match(/CYL[\s:]*([+-]?\d+(?:\.\d+)?)/i);
      // AX (0-180)
      var axMatch = satir.match(/AX(?:IS)?[\s:]*(\d{1,3})/i);

      if (!sphMatch || !cylMatch) {
        // Etiketsiz format: 3 sayi siralama
        var nums = satir.match(/([+-]?\d+\.\d+|\d{1,3})(?![\d.])/g);
        if (nums && nums.length >= 3) {
          // Sayilari siniflandir
          var olasi = nums.slice(0, 5);
          var sph = null, cyl = null, ax = null;
          for (var i = 0; i < olasi.length; i++) {
            var n = olasi[i];
            var deg = parseFloat(n);
            if (isNaN(deg)) continue;
            if (n.indexOf('.') >= 0) {
              // Ondalikli = SPH veya CYL
              if (sph === null) sph = n;
              else if (cyl === null) cyl = n;
            } else {
              // Tam sayi = muhtemelen AX
              if (deg >= 0 && deg <= 180 && ax === null) ax = deg;
            }
          }
          return { sph: sph, cyl: cyl, ax: ax };
        }
      }

      return {
        sph: sphMatch ? sphMatch[1] : null,
        cyl: cylMatch ? cylMatch[1] : null,
        ax: axMatch ? parseInt(axMatch[1], 10) : null
      };
    }

    // Satirlara tek tek bak
    var uzakMode = true;  // true = uzak, false = yakin (ADD bolumu)
    satirlar.forEach(function(satir) {
      // ADD bolumune gectigimizi anla
      if (/^(YAKIN|NEAR|READING|ADD|ADDITION)\b/i.test(satir)) {
        uzakMode = false;
      }
      if (/^(UZAK|DISTANCE|DISTANT)\b/i.test(satir)) {
        uzakMode = true;
      }

      // Sag goz: OD, RE, R, SAG
      if (/^(OD|RE|R[\s:]|SAG\b)/i.test(satir)) {
        var p = gozSatirParse(satir);
        if (p.sph !== null) {
          var sph = sayiIsaretAyir(p.sph);
          if (sph) {
            var hedef = uzakMode ? sonuc.uzak.sag : sonuc.yakin.sag;
            hedef.sph = sph.sayi.toFixed(2);
            hedef.sphIsaret = sph.isaret;
          }
        }
        if (p.cyl !== null) {
          var cyl = sayiIsaretAyir(p.cyl);
          if (cyl) {
            var hedefC = uzakMode ? sonuc.uzak.sag : sonuc.yakin.sag;
            hedefC.cyl = cyl.sayi.toFixed(2);
            hedefC.cylIsaret = cyl.isaret;
          }
        }
        if (p.ax !== null) {
          var hedefA = uzakMode ? sonuc.uzak.sag : sonuc.yakin.sag;
          hedefA.aks = p.ax;
        }
      }

      // Sol goz: OS, LE, L, SOL
      if (/^(OS|LE|L[\s:]|SOL\b)/i.test(satir)) {
        var ps = gozSatirParse(satir);
        if (ps.sph !== null) {
          var sphs = sayiIsaretAyir(ps.sph);
          if (sphs) {
            var hedefS = uzakMode ? sonuc.uzak.sol : sonuc.yakin.sol;
            hedefS.sph = sphs.sayi.toFixed(2);
            hedefS.sphIsaret = sphs.isaret;
          }
        }
        if (ps.cyl !== null) {
          var cyls = sayiIsaretAyir(ps.cyl);
          if (cyls) {
            var hedefCS = uzakMode ? sonuc.uzak.sol : sonuc.yakin.sol;
            hedefCS.cyl = cyls.sayi.toFixed(2);
            hedefCS.cylIsaret = cyls.isaret;
          }
        }
        if (ps.ax !== null) {
          var hedefAS = uzakMode ? sonuc.uzak.sol : sonuc.yakin.sol;
          hedefAS.aks = ps.ax;
        }
      }

      // ADD degeri: "ADD +2.00" veya "ADD: 2.00"
      var addMatch = satir.match(/ADD[\s:]+\+?(\d+(?:\.\d+)?)/i);
      if (addMatch) {
        var addDeger = parseFloat(addMatch[1]);
        if (!isNaN(addDeger) && addDeger > 0 && addDeger <= 5) {
          if (sonuc.add.sag === null) sonuc.add.sag = addDeger.toFixed(2);
          else if (sonuc.add.sol === null) sonuc.add.sol = addDeger.toFixed(2);
        }
      }
    });

    // ADD tek goze atanmissa digerine de kopyala (cogu recetede tek ADD yazilir)
    if (sonuc.add.sag && !sonuc.add.sol) sonuc.add.sol = sonuc.add.sag;
    if (sonuc.add.sol && !sonuc.add.sag) sonuc.add.sag = sonuc.add.sol;

    // Yakin recete yoksa ama ADD varsa, yakin SPH = uzak SPH + ADD hesapla
    function yakinHesapla(uzakSph, uzakSphIsaret, addDeger) {
      if (uzakSph === null || addDeger === null) return null;
      var uzak = parseFloat(uzakSph) * (uzakSphIsaret === '-' ? -1 : 1);
      var yakin = uzak + parseFloat(addDeger);
      return {
        sph: Math.abs(yakin).toFixed(2),
        sphIsaret: yakin >= 0 ? '+' : '-'
      };
    }
    if (!sonuc.yakin.sag.sph && sonuc.add.sag) {
      var ys = yakinHesapla(sonuc.uzak.sag.sph, sonuc.uzak.sag.sphIsaret, sonuc.add.sag);
      if (ys) {
        sonuc.yakin.sag.sph = ys.sph;
        sonuc.yakin.sag.sphIsaret = ys.sphIsaret;
        sonuc.yakin.sag.cyl = sonuc.uzak.sag.cyl;
        sonuc.yakin.sag.cylIsaret = sonuc.uzak.sag.cylIsaret;
        sonuc.yakin.sag.aks = sonuc.uzak.sag.aks;
      }
    }
    if (!sonuc.yakin.sol.sph && sonuc.add.sol) {
      var yl = yakinHesapla(sonuc.uzak.sol.sph, sonuc.uzak.sol.sphIsaret, sonuc.add.sol);
      if (yl) {
        sonuc.yakin.sol.sph = yl.sph;
        sonuc.yakin.sol.sphIsaret = yl.sphIsaret;
        sonuc.yakin.sol.cyl = sonuc.uzak.sol.cyl;
        sonuc.yakin.sol.cylIsaret = sonuc.uzak.sol.cylIsaret;
        sonuc.yakin.sol.aks = sonuc.uzak.sol.aks;
      }
    }

    return sonuc;
  }

  // Form alanlarini doldur (kullanici onayladiktan sonra)
  function formaDoldur(veri) {
    function set(id, deger) {
      var el = document.getElementById(id);
      if (el && deger !== null && deger !== undefined && deger !== '') {
        el.value = deger;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
    if (veri.hastaAd) set('m_hasta_ad', veri.hastaAd);

    // Uzak sag
    set('m_uzak_sag_sph_isaret', veri.uzak.sag.sphIsaret);
    set('m_uzak_sag_sph', veri.uzak.sag.sph);
    set('m_uzak_sag_cyl_isaret', veri.uzak.sag.cylIsaret);
    set('m_uzak_sag_cyl', veri.uzak.sag.cyl);
    set('m_uzak_sag_aks', veri.uzak.sag.aks);
    // Uzak sol
    set('m_uzak_sol_sph_isaret', veri.uzak.sol.sphIsaret);
    set('m_uzak_sol_sph', veri.uzak.sol.sph);
    set('m_uzak_sol_cyl_isaret', veri.uzak.sol.cylIsaret);
    set('m_uzak_sol_cyl', veri.uzak.sol.cyl);
    set('m_uzak_sol_aks', veri.uzak.sol.aks);

    // Yakin varsa checkbox + alanlar
    var yakinVar = (veri.yakin.sag.sph || veri.yakin.sol.sph) ? true : false;
    if (yakinVar) {
      var chk = document.getElementById('m_yakin_var');
      if (chk && !chk.checked) {
        chk.checked = true;
        chk.dispatchEvent(new Event('change', { bubbles: true }));
      }
      set('m_yakin_sag_sph_isaret', veri.yakin.sag.sphIsaret);
      set('m_yakin_sag_sph', veri.yakin.sag.sph);
      set('m_yakin_sag_cyl_isaret', veri.yakin.sag.cylIsaret);
      set('m_yakin_sag_cyl', veri.yakin.sag.cyl);
      set('m_yakin_sag_aks', veri.yakin.sag.aks);
      set('m_yakin_sol_sph_isaret', veri.yakin.sol.sphIsaret);
      set('m_yakin_sol_sph', veri.yakin.sol.sph);
      set('m_yakin_sol_cyl_isaret', veri.yakin.sol.cylIsaret);
      set('m_yakin_sol_cyl', veri.yakin.sol.cyl);
      set('m_yakin_sol_aks', veri.yakin.sol.aks);
    }
  }

  // OCR sonucunu dogrulama tablosunu olustur (HTML string)
  function dogrulamaTablosuHtml(veri) {
    function bos(v) { return v === null || v === undefined || v === '' ? '<em style="color:#94a3b8;">-</em>' : v; }
    function row(etiket, sag, sol) {
      return '<tr><th style="text-align:left;padding:6px 10px;background:var(--yuzey-ucuncul);">' + etiket +
        '</th><td style="padding:6px 10px;font-family:monospace;">' + bos(sag) +
        '</td><td style="padding:6px 10px;font-family:monospace;">' + bos(sol) + '</td></tr>';
    }
    var html = '';
    if (veri.hastaAd) {
      html += '<p class="kp-p"><strong>Hasta:</strong> ' + escapeText(veri.hastaAd) + '</p>';
    }
    html += '<h4 class="kp-h4" style="margin-top:12px;">Uzak Recete</h4>';
    html += '<table style="width:100%;border-collapse:collapse;margin-top:8px;">';
    html += '<thead><tr><th></th><th style="padding:6px 10px;">Sag (OD)</th><th style="padding:6px 10px;">Sol (OS)</th></tr></thead><tbody>';
    html += row('SPH', veri.uzak.sag.sphIsaret + veri.uzak.sag.sph, veri.uzak.sol.sphIsaret + veri.uzak.sol.sph);
    html += row('CYL', veri.uzak.sag.cylIsaret + veri.uzak.sag.cyl, veri.uzak.sol.cylIsaret + veri.uzak.sol.cyl);
    html += row('AKS', veri.uzak.sag.aks, veri.uzak.sol.aks);
    html += '</tbody></table>';

    if (veri.yakin.sag.sph || veri.yakin.sol.sph || veri.add.sag || veri.add.sol) {
      html += '<h4 class="kp-h4" style="margin-top:16px;">Yakin Recete / ADD</h4>';
      html += '<table style="width:100%;border-collapse:collapse;margin-top:8px;">';
      html += '<thead><tr><th></th><th style="padding:6px 10px;">Sag</th><th style="padding:6px 10px;">Sol</th></tr></thead><tbody>';
      html += row('SPH', veri.yakin.sag.sphIsaret + veri.yakin.sag.sph, veri.yakin.sol.sphIsaret + veri.yakin.sol.sph);
      if (veri.add.sag || veri.add.sol) {
        html += row('ADD', veri.add.sag ? '+' + veri.add.sag : null, veri.add.sol ? '+' + veri.add.sol : null);
      }
      html += '</tbody></table>';
    }

    return html;
  }

  function escapeText(str) {
    var div = document.createElement('div');
    div.textContent = String(str || '');
    return div.innerHTML;
  }

  // Dosya okuma yardımcısı
  function dosyayiOku(file) {
    return new Promise(function(resolve, reject) {
      var reader = new FileReader();
      reader.onload = function() { resolve(reader.result); };
      reader.onerror = function() { reject(new Error('Dosya okunamadi')); };
      reader.readAsDataURL(file);
    });
  }

  // Public API
  window.KepekciOCR = {
    ocrCalistir: ocrCalistir,
    receteyiParse: receteyiParse,
    formaDoldur: formaDoldur,
    dogrulamaTablosuHtml: dogrulamaTablosuHtml,
    dosyayiOku: dosyayiOku,
    metniTemizle: metniTemizle,
    sayiIsaretAyir: sayiIsaretAyir
  };

})(window);
