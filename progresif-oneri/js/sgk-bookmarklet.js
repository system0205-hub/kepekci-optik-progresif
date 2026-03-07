// ============================================================
// SGK BOOKMARKLET v4 - Recete Veri Okuma & QR Kod Uretme
// Kepekci Optik - Modul 2
//
// SGK e-recete sayfasi: gss.sgk.gov.tr/Optik_Firma2_Web/ereceteGiris.faces
// Strateji v4: "SAG CAM" ve "SOL CAM" etiketlerini bulup her birinin
//              kendi ic tablosundan ayri ayri oku.
//              v3 bug: Parent row'da "Kontrol Sag Cam" ekstra inputlari
//              index kaydiriyordu. v4 bunu cozuyor.
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

  function turkceTemizle(str) {
    if (!str) return "";
    return str.replace(/\u00c7/g,"C").replace(/\u00e7/g,"c")
              .replace(/\u011e/g,"G").replace(/\u011f/g,"g")
              .replace(/\u0130/g,"I").replace(/\u0131/g,"i")
              .replace(/\u00d6/g,"O").replace(/\u00f6/g,"o")
              .replace(/\u015e/g,"S").replace(/\u015f/g,"s")
              .replace(/\u00dc/g,"U").replace(/\u00fc/g,"u");
  }

  // Sayfadaki tum td/th/span/label icinde etiket ara, yanindaki degeri al
  function etikettenDegerBul(etiketMetni) {
    var cells = document.querySelectorAll("td, th, span, label");
    for (var i = 0; i < cells.length; i++) {
      var text = (cells[i].textContent || "").trim();
      if (text.indexOf(etiketMetni) >= 0 && text.length < etiketMetni.length + 20) {
        var next = cells[i].nextElementSibling;
        if (next) {
          var input = next.querySelector("input, select");
          if (input) return (input.value || "").trim();
          var val = (next.textContent || "").trim();
          if (val) return val;
        }
      }
    }
    return "";
  }

  // ============================================================
  // GOZ NUMARALARINI OKU - v4: SAG CAM / SOL CAM etiket bazli
  // ============================================================
  // SGK sayfasinda goz verileri ic ice tablolarda bulunur.
  // "SAG CAM" ve "SOL CAM" yazan hucreleri bul, her birinin
  // kendi tablosundan verileri ayri ayri oku.
  // Boylece aradaki "Kontrol Sag Cam" gibi ekstra inputlar
  // index kaydirmaz.
  //
  // Her goz tablosunda veri satiri:
  //   [checkbox] [+/- select] [sferik input] [+/- select] [silindirik input] [aks input]
  // Yani: 1 checkbox, 2 select, 3 text input
  //
  // Sayfada ilk SAG+SOL cifti = UZAK, ikinci cifti = YAKIN.

  // Element'in en yakin table atasini bul (closest IE destegi yok)
  function enYakinTablo(el) {
    var node = el;
    while (node) {
      node = node.parentElement;
      if (node && node.tagName === "TABLE") return node;
    }
    return null;
  }

  // Bir ic tablodan goz verisi oku (SAG veya SOL tek goz)
  function gozTablosuOku(tablo) {
    if (!tablo) return null;

    // Tablodaki tum satirlari tara, veri satiri bul
    var rows = tablo.querySelectorAll("tr");
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var sels = row.querySelectorAll("select");
      var allInp = row.querySelectorAll("input");
      var txtInp = [];
      for (var k = 0; k < allInp.length; k++) {
        if (allInp[k].type !== "checkbox" && allInp[k].type !== "hidden") {
          txtInp.push(allInp[k]);
        }
      }

      // Veri satiri: en az 2 select (+/- isaretler) ve 3 text input (sph, cyl, aks)
      if (sels.length >= 2 && txtInp.length >= 3) {
        var rv = function(inp) { return parseFloat((inp.value || "0").replace(",", ".")) || 0; };
        var sv = function(sel) { return sel.value === "-" ? -1 : 1; };

        return [rv(txtInp[0]) * sv(sels[0]), rv(txtInp[1]) * sv(sels[1]), parseInt(txtInp[2].value) || 0];
      }
    }
    return null;
  }

  // Sayfada "SAG CAM" ve "SOL CAM" etiketlerini bul, tablodan oku
  function tumGozlukVerileriniOku() {
    var cells = document.querySelectorAll("td, th, span, label");
    var sagTabloListesi = [];
    var solTabloListesi = [];

    for (var i = 0; i < cells.length; i++) {
      var txt = (cells[i].textContent || "").trim().toUpperCase();
      // Turkce karakter normalizasyonu
      txt = txt.replace(/\u015e/g, "S").replace(/\u011e/g, "G")
               .replace(/\u0130/g, "I").replace(/\u00dc/g, "U")
               .replace(/\u00d6/g, "O").replace(/\u00c7/g, "C");

      if (txt === "SAG CAM" || txt === "SAG" || txt.indexOf("SAG CAM") >= 0) {
        var tbl = enYakinTablo(cells[i]);
        if (tbl) sagTabloListesi.push(tbl);
      }
      if (txt === "SOL CAM" || txt === "SOL" || txt.indexOf("SOL CAM") >= 0) {
        var tbl2 = enYakinTablo(cells[i]);
        if (tbl2) solTabloListesi.push(tbl2);
      }
    }

    // Ilk cift = UZAK, ikinci cift = YAKIN
    var sonuc = { uzak: null, yakin: null };

    if (sagTabloListesi.length >= 1 || solTabloListesi.length >= 1) {
      var uzakSag = sagTabloListesi.length >= 1 ? gozTablosuOku(sagTabloListesi[0]) : null;
      var uzakSol = solTabloListesi.length >= 1 ? gozTablosuOku(solTabloListesi[0]) : null;
      if (uzakSag || uzakSol) {
        sonuc.uzak = { sag: uzakSag, sol: uzakSol };
      }
    }

    if (sagTabloListesi.length >= 2 || solTabloListesi.length >= 2) {
      var yakinSag = sagTabloListesi.length >= 2 ? gozTablosuOku(sagTabloListesi[1]) : null;
      var yakinSol = solTabloListesi.length >= 2 ? gozTablosuOku(solTabloListesi[1]) : null;
      if (yakinSag || yakinSol) {
        sonuc.yakin = { sag: yakinSag, sol: yakinSol };
      }
    }

    return sonuc;
  }

  // ============================================================
  // ANA VERI TOPLAMA
  // ============================================================
  function sgkVerileriOku() {
    var veri = { v: 2 };

    // Hasta bilgileri
    var ad = etikettenDegerBul("Ad\u0131") || etikettenDegerBul("Ad\u00fd") || "";
    var soyad = etikettenDegerBul("Soyad") || "";
    var doktor = etikettenDegerBul("Doktor Ad") || "";
    var tarih = etikettenDegerBul("Re\u00e7ete Tarih") || etikettenDegerBul("Recete Tarih") || "";
    var protokol = etikettenDegerBul("Protokol No") || "";
    var sgkNo = etikettenDegerBul("Sosyal G") || etikettenDegerBul("venlik No") || "";

    // Tarih: birden fazla alan olabilir
    if (!tarih) {
      var tarihInputs = document.querySelectorAll('input[id*="arih"], input[id*="date"], input[id*="Tarih"]');
      if (tarihInputs.length > 0) tarih = tarihInputs[0].value || "";
    }

    var adSoyad = ((ad || "") + " " + (soyad || "")).trim();
    if (adSoyad) veri.a = turkceTemizle(adSoyad);
    if (doktor) veri.dr = turkceTemizle(doktor);
    if (tarih) veri.t = tarih;
    if (protokol) veri.p = protokol;
    if (sgkNo) veri.tc = sgkNo;

    // Goz numaralari
    var gozVerisi = tumGozlukVerileriniOku();

    if (gozVerisi.uzak) {
      veri.u = {};
      if (gozVerisi.uzak.sag) veri.u.s = gozVerisi.uzak.sag;
      if (gozVerisi.uzak.sol) veri.u.l = gozVerisi.uzak.sol;
    }
    if (gozVerisi.yakin) {
      veri.y = {};
      if (gozVerisi.yakin.sag) veri.y.s = gozVerisi.yakin.sag;
      if (gozVerisi.yakin.sol) veri.y.l = gozVerisi.yakin.sol;
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
    overlay.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.92);" +
      "z-index:999999;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:Arial,sans-serif;";

    // Baslik
    var baslik = document.createElement("div");
    baslik.style.cssText = "color:#fff;font-size:20px;font-weight:bold;margin-bottom:4px;";
    baslik.textContent = "Kepekci Optik - SGK Recete QR";
    overlay.appendChild(baslik);

    // Hasta/doktor bilgisi
    var bilgi = document.createElement("div");
    bilgi.style.cssText = "color:#aaa;font-size:14px;margin-bottom:12px;text-align:center;";
    var bilgiParts = [];
    if (veri.a) bilgiParts.push(veri.a);
    if (veri.dr) bilgiParts.push("Dr. " + veri.dr);
    if (veri.t) bilgiParts.push(veri.t);
    bilgi.textContent = bilgiParts.join(" | ") || "Bilgi okunamadi";
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

  function qrOlustur(container, metin) {
    try {
      new QRCode(container, {
        text: metin,
        width: 400,
        height: 400,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.L
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
