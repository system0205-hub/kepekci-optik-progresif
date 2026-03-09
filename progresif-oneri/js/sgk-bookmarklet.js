// ============================================================
// SGK BOOKMARKLET v6 - Recete Veri Okuma & Direkt Aktarma
// Kepekci Optik - Modul 2
//
// SGK e-recete sayfasi: gss.sgk.gov.tr/Optik_Firma2_Web/ereceteGiris.faces
// Strateji v6: table.detaylarKutuCam class'i ile goz tablolarini bul.
//              Sira: [0]=UZAK SAG, [1]=UZAK SOL, [2]=YAKIN SAG, [3]=YAKIN SOL
//              QR yerine recete.html'e URL ile direkt aktarim.
// ============================================================

(function() {
  "use strict";

  var RECETE_URL = "https://system0205-hub.github.io/kepekci-optik-progresif/recete.html";

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
  // GOZ NUMARALARINI OKU - v5: detaylarKutuCam class bazli
  // ============================================================
  // SGK sayfasinda goz verileri table.detaylarKutuCam icinde.
  // Sirasiyla: [0]=UZAK SAG, [1]=UZAK SOL, [2]=YAKIN SAG, [3]=YAKIN SOL
  // Her tabloda veri satiri: 2 select (+/-) + 3+ text input (sph, cyl, aks)

  function camTablosuOku(tablo) {
    if (!tablo) return null;
    var rows = tablo.querySelectorAll("tr");
    for (var i = 0; i < rows.length; i++) {
      var sels = rows[i].querySelectorAll("select");
      var allInp = rows[i].querySelectorAll("input");
      var txtInp = [];
      for (var k = 0; k < allInp.length; k++) {
        if (allInp[k].type !== "checkbox" && allInp[k].type !== "hidden") {
          txtInp.push(allInp[k]);
        }
      }
      if (sels.length >= 2 && txtInp.length >= 3) {
        var rv = function(inp) { return parseFloat((inp.value || "0").replace(",", ".")) || 0; };
        var sv = function(sel) { return sel.value === "-" ? -1 : 1; };
        return [rv(txtInp[0]) * sv(sels[0]), rv(txtInp[1]) * sv(sels[1]), parseInt(txtInp[2].value) || 0];
      }
    }
    return null;
  }

  function tumGozlukVerileriniOku() {
    var camTablolari = document.querySelectorAll("table.detaylarKutuCam");
    // [0]=UZAK SAG, [1]=UZAK SOL, [2]=YAKIN SAG, [3]=YAKIN SOL
    var sonuc = { uzak: null, yakin: null };

    if (camTablolari.length >= 2) {
      var uzakSag = camTablosuOku(camTablolari[0]);
      var uzakSol = camTablosuOku(camTablolari[1]);
      if (uzakSag || uzakSol) {
        sonuc.uzak = { sag: uzakSag, sol: uzakSol };
      }
    }

    if (camTablolari.length >= 4) {
      var yakinSag = camTablosuOku(camTablolari[2]);
      var yakinSol = camTablosuOku(camTablolari[3]);
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
  // RECETEYE AKTAR - URL ile direkt yonlendirme
  // ============================================================
  function receteyeAktar(veri) {
    var jsonStr = JSON.stringify(veri);
    var encoded = encodeURIComponent(jsonStr);
    var url = RECETE_URL + "?d=" + encoded;

    // Bilgi ozeti
    var bilgiParts = [];
    if (veri.a) bilgiParts.push(veri.a);
    if (veri.u && veri.u.s) bilgiParts.push("U-S:" + veri.u.s.join("/"));
    if (veri.u && veri.u.l) bilgiParts.push("U-L:" + veri.u.l.join("/"));
    if (veri.y && veri.y.s) bilgiParts.push("Y-S:" + veri.y.s.join("/"));
    if (veri.y && veri.y.l) bilgiParts.push("Y-L:" + veri.y.l.join("/"));

    // Yeni sekmede ac
    var yeniSekme = window.open(url, "_blank");

    // Popup engellenirse ayni sekmede ac
    if (!yeniSekme || yeniSekme.closed) {
      window.location.href = url;
    }
  }

  // ============================================================
  // CALISTIR
  // ============================================================
  try {
    var veri = sgkVerileriOku();

    // En az bir goz verisi okunmus mu kontrol et
    if (!veri.u && !veri.y) {
      alert("Kepekci Optik:\n\nGoz numarasi okunamadi.\nLutfen e-recete sayfasinda goz bilgilerinin dolu oldugunu kontrol edin.\n\nManuel giris kullanabilirsiniz.");
      return;
    }

    receteyeAktar(veri);
  } catch (e) {
    alert("Kepekci Optik Bookmarklet Hatasi:\n" + e.message + "\n\nManuel giris kullanin.");
  }

})();
