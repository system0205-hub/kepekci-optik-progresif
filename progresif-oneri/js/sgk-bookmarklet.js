// ============================================================
// SGK BOOKMARKLET v8 - Hibrit okuma (class + etiket fallback)
// Kepekci Optik - Modul 2
//
// SGK e-recete sayfasi: gss.sgk.gov.tr/Optik_Firma2_Web/ereceteGiris.faces
// Strateji v8: Iki farkli okuma yontemini dener
//   Yontem A (hizli): table.detaylarKutuCam (v5/v6/v7 yolu)
//   Yontem B (fallback): "SAG CAM" / "SOL CAM" etiket arama (v4 yolu)
//   Yakin bulunamazsa B yolu otomatik denenir.
//
// Muzaffer Bey notu: progresif recetede uzak VP (sifir) + yakin numarali
// olabilir. Uzak yok diye atma, yakin ayri ayri oku.
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

  // En yakin TABLE atasini bul (etiket -> tablo)
  function enYakinTablo(el) {
    var node = el;
    while (node) {
      node = node.parentElement;
      if (node && node.tagName === "TABLE") return node;
    }
    return null;
  }

  // Etiket tabanli okuma (v4 yolu) - fallback
  function etiketTabanliOku() {
    var cells = document.querySelectorAll("td, th, span, label");
    var sagTabloListesi = [];
    var solTabloListesi = [];

    for (var i = 0; i < cells.length; i++) {
      var txt = (cells[i].textContent || "").trim().toUpperCase();
      // Turkce karakter normalizasyonu
      txt = txt.replace(/\u015e|\u015f/g, "S").replace(/\u011e|\u011f/g, "G")
               .replace(/\u0130|\u0131/g, "I").replace(/\u00dc|\u00fc/g, "U")
               .replace(/\u00d6|\u00f6/g, "O").replace(/\u00c7|\u00e7/g, "C");

      // Cok uzun text'leri atla (baslik olabilir ama bir metnin parcasi olamaz)
      if (txt.length > 30) continue;

      if (txt === "SAG CAM" || txt === "SAG" || txt === "SAG GOZ" ||
          txt.indexOf("SAG CAM") >= 0 || txt.indexOf("SAG GOZ") >= 0) {
        var tbl = enYakinTablo(cells[i]);
        if (tbl && sagTabloListesi.indexOf(tbl) < 0) sagTabloListesi.push(tbl);
      }
      if (txt === "SOL CAM" || txt === "SOL" || txt === "SOL GOZ" ||
          txt.indexOf("SOL CAM") >= 0 || txt.indexOf("SOL GOZ") >= 0) {
        var tbl2 = enYakinTablo(cells[i]);
        if (tbl2 && solTabloListesi.indexOf(tbl2) < 0) solTabloListesi.push(tbl2);
      }
    }

    var sonuc = { uzak: null, yakin: null, yontem: "etiket" };
    var uzakSag = sagTabloListesi.length >= 1 ? camTablosuOku(sagTabloListesi[0]) : null;
    var uzakSol = solTabloListesi.length >= 1 ? camTablosuOku(solTabloListesi[0]) : null;
    if (uzakSag || uzakSol) sonuc.uzak = { sag: uzakSag, sol: uzakSol };

    var yakinSag = sagTabloListesi.length >= 2 ? camTablosuOku(sagTabloListesi[1]) : null;
    var yakinSol = solTabloListesi.length >= 2 ? camTablosuOku(solTabloListesi[1]) : null;
    if (yakinSag || yakinSol) sonuc.yakin = { sag: yakinSag, sol: yakinSol };

    // Teshise ekle
    if (window._sgkTeshis) {
      window._sgkTeshis.etiketSag = sagTabloListesi.length;
      window._sgkTeshis.etiketSol = solTabloListesi.length;
    }

    return sonuc;
  }

  // Class tabanli okuma (v5-v7 yolu)
  function classTabanliOku() {
    var camTablolari = document.querySelectorAll("table.detaylarKutuCam");
    if (camTablolari.length === 0) {
      camTablolari = document.querySelectorAll('table[class*="detay"], table[class*="Kutu"], table[class*="Cam"]');
    }

    window._sgkTeshis = {
      toplamTablo: camTablolari.length,
      okunabilir: [],
      okunamayan: []
    };

    var okunanlar = [];
    for (var i = 0; i < camTablolari.length; i++) {
      var okundu = camTablosuOku(camTablolari[i]);
      okunanlar.push(okundu);
      if (okundu) {
        window._sgkTeshis.okunabilir.push({ indeks: i, veri: okundu, sinif: camTablolari[i].className });
      } else {
        window._sgkTeshis.okunamayan.push({ indeks: i, satirSayisi: camTablolari[i].querySelectorAll("tr").length, sinif: camTablolari[i].className });
      }
    }

    var sonuc = { uzak: null, yakin: null, yontem: "class" };
    if (okunanlar[0] || okunanlar[1]) sonuc.uzak = { sag: okunanlar[0] || null, sol: okunanlar[1] || null };
    if (okunanlar[2] || okunanlar[3]) sonuc.yakin = { sag: okunanlar[2] || null, sol: okunanlar[3] || null };
    return sonuc;
  }

  function tumGozlukVerileriniOku() {
    // v8 - Hibrit: class yolu + etiket yolu fallback
    var classSonuc = classTabanliOku();

    // Class yolu ile HEM uzak HEM yakin okunduysa donduru
    if (classSonuc.uzak && classSonuc.yakin) {
      return classSonuc;
    }

    // Aksi halde etiket tabanli dene
    var etiketSonuc = etiketTabanliOku();

    // Iki yolun sonuclarini birlestir (biri uzak veya yakin bulabilir)
    var birlesik = {
      uzak: classSonuc.uzak || etiketSonuc.uzak,
      yakin: classSonuc.yakin || etiketSonuc.yakin,
      yontem: (classSonuc.uzak && !etiketSonuc.uzak) ? "class" :
              (!classSonuc.uzak && etiketSonuc.uzak) ? "etiket" : "hibrit"
    };
    if (window._sgkTeshis) window._sgkTeshis.kullanilanYontem = birlesik.yontem;
    return birlesik;
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

    // Hicbir goz verisi okunmadiysa tek satir bildirim
    if (!veri.u && !veri.y) {
      alert("Goz verisi okunamadi. Manuel giris kullanin.");
      return;
    }

    // Yakin yoksa bile sessizce devam - kullanici eski gibi aksa
    // (teshis _sgkTeshis global'inde, F12 ile ihtiyac duyan gorur)
    receteyeAktar(veri);
  } catch (e) {
    alert("Bookmarklet hatasi: " + e.message);
  }

})();
