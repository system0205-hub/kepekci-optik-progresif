// ============================================================
// SGK BOOKMARKLET v2 - Recete Veri Okuma & QR Kod Uretme
// Kepekci Optik - Modul 2
//
// SGK e-recete sayfasi: gss.sgk.gov.tr/Optik_Firma2_Web/ereceteGiris.faces
// Sayfa yapisi: JSF tablo tabanli, Turkce etiketler
// ============================================================

(function() {
  "use strict";

  // Zaten calisiyorsa kapat
  if (document.getElementById("kepekci-qr-overlay")) {
    document.getElementById("kepekci-qr-overlay").remove();
    return;
  }

  // ============================================================
  // YARDIMCI FONKSIYONLAR
  // ============================================================

  // Turkce karakterleri ASCII'ye cevir (QR boyutunu kucultmek icin)
  function turkceTemizle(str) {
    if (!str) return "";
    return str.replace(/\u00c7/g,"C").replace(/\u00e7/g,"c")
              .replace(/\u011e/g,"G").replace(/\u011f/g,"g")
              .replace(/\u0130/g,"I").replace(/\u0131/g,"i")
              .replace(/\u00d6/g,"O").replace(/\u00f6/g,"o")
              .replace(/\u015e/g,"S").replace(/\u015f/g,"s")
              .replace(/\u00dc/g,"U").replace(/\u00fc/g,"u");
  }

  // Sayfadaki tum td/th/span/label icinde metin ara, yanindaki degeri al
  function etikettenDegerBul(etiketMetni) {
    var tds = document.querySelectorAll("td, th, span, label");
    for (var i = 0; i < tds.length; i++) {
      var text = (tds[i].textContent || "").trim();
      // Tam veya kismi eslesme
      if (text.indexOf(etiketMetni) >= 0 && text.length < etiketMetni.length + 20) {
        // Kardes hucreyi kontrol et
        var next = tds[i].nextElementSibling;
        if (next) {
          // Icerideki input/select var mi?
          var input = next.querySelector("input, select");
          if (input) return (input.value || "").trim();
          // Yoksa text content
          var val = (next.textContent || "").trim();
          if (val) return val;
        }
      }
    }
    return "";
  }

  // ID sonu ile element bul
  function idSonuIleBul(suffix) {
    var el = document.querySelector('[id$="' + suffix + '"]');
    return el ? (el.value || el.textContent || "").trim() : "";
  }

  // ============================================================
  // GOZ NUMARALARINI TABLO YAPISINDAN OKU
  // ============================================================
  function gozlukBolumuOku(bolumBasligi) {
    // "UZAK GOZLUK" veya "YAKIN GOZLUK" metnini sayfada bul
    var tumElementler = document.querySelectorAll("td, th, span, div, fieldset, legend");
    var bolumElement = null;

    for (var i = 0; i < tumElementler.length; i++) {
      var text = (tumElementler[i].textContent || "").trim().toUpperCase();
      // Tam eslesmesine yakin ol (uzun textContent olanları atla)
      if (text.indexOf(bolumBasligi) >= 0 && text.length < bolumBasligi.length + 30) {
        bolumElement = tumElementler[i];
        break;
      }
    }

    if (!bolumElement) return null;

    // Bu elementin parent containerini bul (fieldset veya buyuk tablo)
    var container = bolumElement;
    for (var j = 0; j < 8; j++) {
      if (!container.parentElement) break;
      container = container.parentElement;
      // Iceride "SAG CAM" ve "Kure" iceren tablo var mi kontrol et
      var icerik = (container.textContent || "").toUpperCase();
      if (icerik.indexOf("SAG CAM") >= 0 || icerik.indexOf("SA\u011e CAM") >= 0 ||
          icerik.indexOf("SA\u0047 CAM") >= 0) {
        if (icerik.indexOf("KURE") >= 0 || icerik.indexOf("K\u00dcRE") >= 0 ||
            icerik.indexOf("K\u00dc") >= 0) {
          break; // Dogru container
        }
      }
    }

    // Container icerisindeki tum input ve select'leri topla
    var sonuc = { sag: null, sol: null };
    var tablolar = container.querySelectorAll("table");

    for (var t = 0; t < tablolar.length; t++) {
      var tabloMetni = (tablolar[t].textContent || "").toUpperCase();
      var tabloTip = null;

      if (tabloMetni.indexOf("SAG CAM") >= 0 || tabloMetni.indexOf("SA\u011e CAM") >= 0 ||
          tabloMetni.indexOf("SA\u0047 CAM") >= 0) {
        // Bu tablo icerisinde SOL CAM da var mi?
        if (tabloMetni.indexOf("SOL CAM") >= 0) {
          // Ikisi ayni tabloda — satirlardan ayir
          sonuc.sag = tabloSatirindenOku(tablolar[t], "SAG");
          sonuc.sol = tabloSatirindenOku(tablolar[t], "SOL");
        } else {
          tabloTip = "sag";
        }
      } else if (tabloMetni.indexOf("SOL CAM") >= 0) {
        tabloTip = "sol";
      }

      if (tabloTip) {
        var okunan = tabloInputlarindenOku(tablolar[t]);
        if (okunan) sonuc[tabloTip] = okunan;
      }
    }

    // Eger tablo bazli okuma basarisiz olduysa, tum inputlari sirali oku
    if (!sonuc.sag && !sonuc.sol) {
      sonuc = containerInputlarindenOku(container);
    }

    if (sonuc.sag || sonuc.sol) return sonuc;
    return null;
  }

  // Tek bir tablodan SAG veya SOL satirini oku
  function tabloSatirindenOku(tablo, tip) {
    var satirlar = tablo.querySelectorAll("tr");
    for (var i = 0; i < satirlar.length; i++) {
      var satirText = (satirlar[i].textContent || "").toUpperCase();
      var eslesme = (tip === "SAG") ?
        (satirText.indexOf("SAG") >= 0 || satirText.indexOf("SA\u011e") >= 0) :
        (satirText.indexOf("SOL") >= 0);

      if (eslesme) {
        return satirInputlarindenOku(satirlar[i]);
      }
    }
    return null;
  }

  // Bir satirdaki input ve selectlerden goz degerlerini oku
  function satirInputlarindenOku(satir) {
    var inputs = satir.querySelectorAll("input[type='text'], input:not([type])");
    var selects = satir.querySelectorAll("select");
    var checkboxes = satir.querySelectorAll("input[type='checkbox']");

    // En az 2 input olmali (kure, silindir) — aks ayri olabilir
    if (inputs.length < 2) return null;

    // Isaret selectleri: genellikle 2 tane (SPH icin, CYL icin)
    var sphIsaret = "+";
    var cylIsaret = "+";
    if (selects.length >= 1) sphIsaret = selects[0].value === "-" ? "-" : "+";
    if (selects.length >= 2) cylIsaret = selects[1].value === "-" ? "-" : "+";

    var kure = parseFloat((inputs[0].value || "0").replace(",", ".")) || 0;
    var silindir = parseFloat((inputs[1].value || "0").replace(",", ".")) || 0;
    var aks = inputs.length >= 3 ? (parseInt(inputs[2].value) || 0) : 0;

    // Isareti uygula
    var sph = sphIsaret === "-" ? -Math.abs(kure) : Math.abs(kure);
    var cyl = cylIsaret === "-" ? -Math.abs(silindir) : Math.abs(silindir);

    return [sph, cyl, aks];
  }

  // Bir tablodan tum inputlari oku (basit yaklasim)
  function tabloInputlarindenOku(tablo) {
    var satirlar = tablo.querySelectorAll("tr");
    // Header olmayan ilk satiri bul
    for (var i = 0; i < satirlar.length; i++) {
      var sonuc = satirInputlarindenOku(satirlar[i]);
      if (sonuc) return sonuc;
    }
    return null;
  }

  // Container icerisindeki tum inputlari sirali oku (son care)
  function containerInputlarindenOku(container) {
    var inputs = container.querySelectorAll("input[type='text'], input:not([type])");
    var selects = container.querySelectorAll("select");

    // Checkbox olmayan inputlari filtrele
    var numInputs = [];
    for (var i = 0; i < inputs.length; i++) {
      if (inputs[i].type !== "checkbox" && inputs[i].type !== "hidden") {
        numInputs.push(inputs[i]);
      }
    }

    // En az 6 input olmali: sag(kure,silindir,aks) + sol(kure,silindir,aks)
    if (numInputs.length < 6) return { sag: null, sol: null };

    // Selectlerden isaretleri oku
    var isaretler = [];
    for (var i = 0; i < selects.length; i++) {
      if (selects[i].options && selects[i].options.length <= 3) {
        isaretler.push(selects[i].value === "-" ? -1 : 1);
      }
    }

    function okuIdx(idx, isaretIdx) {
      var val = parseFloat((numInputs[idx].value || "0").replace(",", ".")) || 0;
      var sign = (isaretIdx < isaretler.length) ? isaretler[isaretIdx] : 1;
      return val * sign;
    }

    return {
      sag: [okuIdx(0, 0), okuIdx(1, 1), parseInt(numInputs[2].value) || 0],
      sol: [okuIdx(3, 2), okuIdx(4, 3), parseInt(numInputs[5].value) || 0]
    };
  }

  // ============================================================
  // ANA VERI TOPLAMA
  // ============================================================
  function sgkVerileriOku() {
    // Compact format v2: kisa anahtarlar, isaret sayi icerisinde
    var veri = { v: 2 };

    // Hasta / recete bilgileri
    var doktor = etikettenDegerBul("Doktor Ad") || idSonuIleBul("doktorAd") || "";
    var tarih = etikettenDegerBul("Tarih") || idSonuIleBul("receteTarih") || "";
    var protokol = etikettenDegerBul("Protokol No") || idSonuIleBul("protokolNo") || "";
    var sgkNo = etikettenDegerBul("Sosyal G") || etikettenDegerBul("venlik No") || idSonuIleBul("sgkNo") || "";

    // Recete tarihi: birden fazla tarih alani olabilir, ilkini al
    if (!tarih) {
      var tarihInputs = document.querySelectorAll('input[id*="arih"], input[id*="date"], input[id*="Tarih"]');
      if (tarihInputs.length > 0) tarih = tarihInputs[0].value || "";
    }

    if (doktor) veri.dr = turkceTemizle(doktor);
    if (tarih) veri.t = tarih;
    if (protokol) veri.p = protokol;
    if (sgkNo) veri.tc = sgkNo;

    // Uzak gozluk
    var uzak = gozlukBolumuOku("UZAK");
    if (uzak) {
      veri.u = {};
      if (uzak.sag) veri.u.s = uzak.sag;
      if (uzak.sol) veri.u.l = uzak.sol;
    }

    // Yakin gozluk
    var yakin = gozlukBolumuOku("YAKIN");
    if (yakin) {
      veri.y = {};
      if (yakin.sag) veri.y.s = yakin.sag;
      if (yakin.sol) veri.y.l = yakin.sol;
    }

    return veri;
  }

  // ============================================================
  // QR KOD GOSTERME
  // ============================================================
  function qrKoduGoster(veri) {
    var jsonStr = JSON.stringify(veri);

    // Overlay
    var overlay = document.createElement("div");
    overlay.id = "kepekci-qr-overlay";
    overlay.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);" +
      "z-index:999999;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:Arial,sans-serif;";

    // Baslik
    var baslik = document.createElement("div");
    baslik.style.cssText = "color:#fff;font-size:20px;font-weight:bold;margin-bottom:4px;";
    baslik.textContent = "Kepekci Optik - SGK Recete QR";
    overlay.appendChild(baslik);

    // Hasta/doktor bilgisi
    var bilgi = document.createElement("div");
    bilgi.style.cssText = "color:#aaa;font-size:14px;margin-bottom:16px;text-align:center;";
    var bilgiText = [];
    if (veri.dr) bilgiText.push("Dr. " + veri.dr);
    if (veri.t) bilgiText.push(veri.t);
    if (veri.p) bilgiText.push("P:" + veri.p);
    bilgi.textContent = bilgiText.join(" | ") || "Bilgi okunamadi";
    overlay.appendChild(bilgi);

    // Numara ozeti
    var ozet = document.createElement("div");
    ozet.style.cssText = "color:#6f6;font-size:13px;margin-bottom:12px;text-align:center;font-family:monospace;";
    var ozetParts = [];
    if (veri.u && veri.u.s) ozetParts.push("U-S:" + veri.u.s.join("/"));
    if (veri.u && veri.u.l) ozetParts.push("U-L:" + veri.u.l.join("/"));
    if (veri.y && veri.y.s) ozetParts.push("Y-S:" + veri.y.s.join("/"));
    if (veri.y && veri.y.l) ozetParts.push("Y-L:" + veri.y.l.join("/"));
    ozet.textContent = ozetParts.join("  ") || "Numara okunamadi";
    overlay.appendChild(ozet);

    // QR container
    var qrDiv = document.createElement("div");
    qrDiv.id = "kepekci-qr-container";
    qrDiv.style.cssText = "background:#fff;padding:16px;border-radius:12px;";
    overlay.appendChild(qrDiv);

    // Alt bilgi
    var alt = document.createElement("div");
    alt.style.cssText = "color:#888;font-size:12px;margin-top:12px;text-align:center;";
    alt.textContent = "Tabletten SGK Recete sayfasini acin ve QR kodu tarayin. (" + jsonStr.length + " kr)";
    overlay.appendChild(alt);

    // Kapat butonu
    var kapatBtn = document.createElement("button");
    kapatBtn.textContent = "Kapat";
    kapatBtn.style.cssText = "margin-top:16px;padding:12px 40px;background:#e74c3c;color:#fff;border:none;" +
      "border-radius:8px;font-size:16px;cursor:pointer;font-weight:bold;";
    kapatBtn.onclick = function() { overlay.remove(); };
    overlay.appendChild(kapatBtn);

    document.body.appendChild(overlay);

    // QR olustur
    function qrYukleVeOlustur() {
      if (typeof QRCode !== "undefined") {
        qrOlustur(qrDiv, jsonStr);
      } else {
        var s = document.createElement("script");
        s.src = "https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js";
        s.onload = function() { qrOlustur(qrDiv, jsonStr); };
        s.onerror = function() {
          qrDiv.innerHTML = '<div style="padding:20px;text-align:center;color:#e74c3c;">' +
            '<p style="font-weight:bold;">QR kutuphane yuklenemedi</p>' +
            '<p style="font-size:12px;margin-top:8px;">Veri panoya kopyalandi.</p></div>';
          panoyaKopyala(jsonStr);
        };
        document.head.appendChild(s);
      }
    }
    qrYukleVeOlustur();
  }

  function qrOlustur(container, metin) {
    try {
      new QRCode(container, {
        text: metin,
        width: 400,
        height: 400,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.L  // L = en dusuk hata duzeltme = en fazla kapasite
      });
    } catch (e) {
      container.innerHTML = '<div style="padding:20px;text-align:center;color:#e74c3c;">' +
        '<p>QR olusturulamadi: ' + e.message + '</p>' +
        '<p style="font-size:12px;margin-top:8px;">Veri panoya kopyalandi.</p></div>';
      panoyaKopyala(metin);
    }
  }

  function panoyaKopyala(metin) {
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(metin);
      } else {
        var ta = document.createElement("textarea");
        ta.value = metin;
        ta.style.cssText = "position:fixed;left:-9999px;";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
    } catch (e) {}
  }

  // ============================================================
  // CALISTIR
  // ============================================================
  try {
    var veri = sgkVerileriOku();
    qrKoduGoster(veri);
  } catch (e) {
    alert("Kepekci Optik Bookmarklet Hatasi:\n" + e.message + "\n\nManuel giris kullanin.");
  }

})();
