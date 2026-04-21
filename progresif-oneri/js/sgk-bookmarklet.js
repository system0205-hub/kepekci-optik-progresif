// ============================================================
// SGK BOOKMARKLET v9 - Pattern tabanli saglam okuma
// Kepekci Optik - Modul 2
//
// SGK Medula e-recete: gss.sgk.gov.tr/Optik_Firma2_Web/ereceteGiris.faces
//
// v9 Stratejisi (sira ile dener, ilk basarili olani kullanir):
//   A) PATTERN: <tr> icinde [checkbox? + 2 select + 3 input] paterni
//      (class'a bagimli degil, DOM yapisi parmak izi)
//   B) ETIKET: "SAG CAM" / "SOL CAM" / "SAG GOZ" metni -> en yakin tablo
//   C) CLASS:  table.detaylarKutuCam (eski v5-v7 yolu)
//
// Pozisyon:
//   - Pattern yolu: ilk 2 satir=uzak (sag,sol), 3-4=yakin (sag,sol)
//   - Pattern yolu etiket kontrolu: "uzak"/"yakin" metin yakindaysa
//     grup buna gore belirlenir
//
// Muzaffer Bey notu: progresif recetede uzak VP (0) + yakin numarali olabilir.
// Sifir deger okumadan atma yok - her satiri sirasiyla alir.
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

  function turkceBuyuk(s) {
    return String(s || "").toUpperCase()
      .replace(/\u0130/g, "I").replace(/\u0131/g, "I")
      .replace(/\u011e/g, "G").replace(/\u011f/g, "G")
      .replace(/\u00dc/g, "U").replace(/\u00fc/g, "U")
      .replace(/\u015e/g, "S").replace(/\u015f/g, "S")
      .replace(/\u00d6/g, "O").replace(/\u00f6/g, "O")
      .replace(/\u00c7/g, "C").replace(/\u00e7/g, "C");
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

  // Tek bir satirdan SPH/CYL/AKS uclusu oku
  // Format: [checkbox?] [sfh_isaret select] [sph input] [cyl_isaret select] [cyl input] [aks input]
  // Dondurur: [sph, cyl, aks] (null eger satir pattern'e uymazsa)
  function satirdanOku(row) {
    if (!row) return null;
    var sels = row.querySelectorAll("select");
    var allInp = row.querySelectorAll("input");
    var txtInp = [];
    for (var k = 0; k < allInp.length; k++) {
      if (allInp[k].type !== "checkbox" && allInp[k].type !== "hidden") {
        txtInp.push(allInp[k]);
      }
    }
    if (sels.length >= 2 && txtInp.length >= 3) {
      var rv = function(inp) { return parseFloat((inp.value || "0").replace(",", ".")) || 0; };
      var sv = function(sel) { return sel.value === "-" ? -1 : 1; };
      return [
        rv(txtInp[0]) * sv(sels[0]),
        rv(txtInp[1]) * sv(sels[1]),
        parseInt(txtInp[2].value, 10) || 0
      ];
    }
    return null;
  }

  function satirPatternUyar(row) {
    var sels = row.querySelectorAll("select").length;
    var allInp = row.querySelectorAll("input");
    var txt = 0;
    for (var k = 0; k < allInp.length; k++) {
      if (allInp[k].type !== "checkbox" && allInp[k].type !== "hidden") txt++;
    }
    return sels >= 2 && txt >= 3;
  }

  // En yakin uste dogru ilgili uzak/yakin etiketini bul (veya pozisyona gore tahmin)
  function satirinBolumu(row) {
    // Satirin ve ustundeki elementlerin yazisina bak
    var ctx = "";
    var node = row;
    var hop = 0;
    while (node && hop < 10) {
      var t = (node.textContent || "").toUpperCase();
      ctx = t + " " + ctx;
      node = node.parentElement;
      hop++;
      if (ctx.length > 2000) break;
    }
    ctx = turkceBuyuk(ctx);

    var uzakIdx = ctx.indexOf("UZAK");
    var yakinIdx = ctx.indexOf("YAKIN");

    if (yakinIdx >= 0 && uzakIdx < 0) return "yakin";
    if (uzakIdx >= 0 && yakinIdx < 0) return "uzak";
    // Her ikisi de varsa: satira en yakin kelime hangisi
    if (uzakIdx >= 0 && yakinIdx >= 0) {
      // Satir metnini kontrol et (satira en yakin baglam)
      var rowText = turkceBuyuk(row.textContent || "");
      if (rowText.indexOf("YAKIN") >= 0) return "yakin";
      if (rowText.indexOf("UZAK") >= 0) return "uzak";
      // Geriye dogru kardes elementleri tara
      var prev = row.previousElementSibling;
      var h = 0;
      while (prev && h < 5) {
        var tt = turkceBuyuk(prev.textContent || "");
        if (tt.indexOf("YAKIN") >= 0) return "yakin";
        if (tt.indexOf("UZAK") >= 0) return "uzak";
        prev = prev.previousElementSibling;
        h++;
      }
    }
    return "bilinmiyor";
  }

  // Satirin "SAG" mi "SOL" mu oldugunu kestir
  function satirinGozu(row) {
    var rowText = turkceBuyuk(row.textContent || "");
    if (rowText.indexOf("SAG") >= 0 || rowText.indexOf("R.") >= 0) return "sag";
    if (rowText.indexOf("SOL") >= 0 || rowText.indexOf("L.") >= 0) return "sol";
    // Kardes veya parent metni
    var prev = row.previousElementSibling;
    var h = 0;
    while (prev && h < 3) {
      var tt = turkceBuyuk(prev.textContent || "");
      if (tt.indexOf("SAG") >= 0) return "sag";
      if (tt.indexOf("SOL") >= 0) return "sol";
      prev = prev.previousElementSibling;
      h++;
    }
    return "bilinmiyor";
  }

  // ============================================================
  // A) PATTERN YOLU (v9 ana strateji)
  // ============================================================
  function patternYoluOku(teshis) {
    var tumSatirlar = document.querySelectorAll("tr");
    var gozSatirlari = [];
    for (var i = 0; i < tumSatirlar.length; i++) {
      if (satirPatternUyar(tumSatirlar[i])) gozSatirlari.push(tumSatirlar[i]);
    }
    teshis.patternSatirSayisi = gozSatirlari.length;

    if (gozSatirlari.length === 0) return null;

    // Her satirin bolum + goz tahmini
    var siniflanmis = gozSatirlari.map(function(row, idx) {
      return {
        veri: satirdanOku(row),
        bolum: satirinBolumu(row),
        goz: satirinGozu(row),
        idx: idx
      };
    });
    teshis.patternSiniflanmis = siniflanmis.map(function(s) {
      return { idx: s.idx, bolum: s.bolum, goz: s.goz, veri: s.veri };
    });

    var sonuc = { uzak: null, yakin: null };

    // Adim 1: Bolum+goz hem bilindiyse direkt ata
    siniflanmis.forEach(function(s) {
      if (s.bolum === "uzak" && s.goz !== "bilinmiyor" && s.veri) {
        sonuc.uzak = sonuc.uzak || {};
        sonuc.uzak[s.goz] = s.veri;
      } else if (s.bolum === "yakin" && s.goz !== "bilinmiyor" && s.veri) {
        sonuc.yakin = sonuc.yakin || {};
        sonuc.yakin[s.goz] = s.veri;
      }
    });

    // Adim 2: Hala bosluk varsa pozisyona gore doldur
    //   Kural: ilk 2 satir uzak (sag, sol), sonraki 2 yakin (sag, sol)
    if ((!sonuc.uzak || (!sonuc.uzak.sag && !sonuc.uzak.sol)) ||
        (!sonuc.yakin || (!sonuc.yakin.sag && !sonuc.yakin.sol))) {
      // Pozisyon bazli dusun
      if (siniflanmis.length >= 2 && !sonuc.uzak) {
        sonuc.uzak = {
          sag: siniflanmis[0].veri,
          sol: siniflanmis[1] ? siniflanmis[1].veri : null
        };
      }
      if (siniflanmis.length >= 4 && !sonuc.yakin) {
        sonuc.yakin = {
          sag: siniflanmis[2].veri,
          sol: siniflanmis[3] ? siniflanmis[3].veri : null
        };
      }
    }

    return sonuc;
  }

  // ============================================================
  // B) ETIKET YOLU (v4 fallback)
  // ============================================================
  function enYakinTablo(el) {
    var node = el;
    while (node) {
      node = node.parentElement;
      if (node && node.tagName === "TABLE") return node;
    }
    return null;
  }

  function etiketYoluOku(teshis) {
    var cells = document.querySelectorAll("td, th, span, label");
    var sagTabloListesi = [];
    var solTabloListesi = [];

    for (var i = 0; i < cells.length; i++) {
      var txt = turkceBuyuk((cells[i].textContent || "").trim());
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
    teshis.etiketSag = sagTabloListesi.length;
    teshis.etiketSol = solTabloListesi.length;

    function tablodanOku(t) {
      if (!t) return null;
      var rows = t.querySelectorAll("tr");
      for (var j = 0; j < rows.length; j++) {
        var v = satirdanOku(rows[j]);
        if (v) return v;
      }
      return null;
    }

    var sonuc = { uzak: null, yakin: null };
    var uzakSag = tablodanOku(sagTabloListesi[0]);
    var uzakSol = tablodanOku(solTabloListesi[0]);
    if (uzakSag || uzakSol) sonuc.uzak = { sag: uzakSag, sol: uzakSol };

    var yakinSag = tablodanOku(sagTabloListesi[1]);
    var yakinSol = tablodanOku(solTabloListesi[1]);
    if (yakinSag || yakinSol) sonuc.yakin = { sag: yakinSag, sol: yakinSol };

    return sonuc;
  }

  // ============================================================
  // C) CLASS YOLU (v5-v7 fallback)
  // ============================================================
  function classYoluOku(teshis) {
    var camTablolari = document.querySelectorAll("table.detaylarKutuCam");
    if (camTablolari.length === 0) {
      camTablolari = document.querySelectorAll('table[class*="detay"], table[class*="Kutu"], table[class*="Cam"]');
    }
    teshis.classToplamTablo = camTablolari.length;

    var okunan = [];
    for (var i = 0; i < camTablolari.length; i++) {
      var rows = camTablolari[i].querySelectorAll("tr");
      var bulundu = null;
      for (var j = 0; j < rows.length; j++) {
        bulundu = satirdanOku(rows[j]);
        if (bulundu) break;
      }
      okunan.push(bulundu);
    }
    teshis.classOkunan = okunan.slice();

    var sonuc = { uzak: null, yakin: null };
    if (okunan[0] || okunan[1]) sonuc.uzak = { sag: okunan[0] || null, sol: okunan[1] || null };
    if (okunan[2] || okunan[3]) sonuc.yakin = { sag: okunan[2] || null, sol: okunan[3] || null };
    return sonuc;
  }

  // ============================================================
  // HIBRIT OKUMA
  // ============================================================
  function tumGozlukVerileriniOku() {
    var teshis = {};

    var patternSonuc = patternYoluOku(teshis);
    var etiketSonuc  = etiketYoluOku(teshis);
    var classSonuc   = classYoluOku(teshis);

    teshis.pattern = patternSonuc;
    teshis.etiket = etiketSonuc;
    teshis.class = classSonuc;

    // En cok veri iceren sonucu sec (uzak+yakin > uzak > yakin > yok)
    function skorla(s) {
      if (!s) return 0;
      var skor = 0;
      if (s.uzak && (s.uzak.sag || s.uzak.sol)) skor += 2;
      if (s.uzak && s.uzak.sag) skor += 1;
      if (s.uzak && s.uzak.sol) skor += 1;
      if (s.yakin && (s.yakin.sag || s.yakin.sol)) skor += 3; // yakin daha degerli
      if (s.yakin && s.yakin.sag) skor += 1;
      if (s.yakin && s.yakin.sol) skor += 1;
      return skor;
    }

    var skorP = skorla(patternSonuc);
    var skorE = skorla(etiketSonuc);
    var skorC = skorla(classSonuc);

    teshis.skorlar = { pattern: skorP, etiket: skorE, class: skorC };

    var kazanan = patternSonuc;
    teshis.kullanilanYontem = "pattern";
    if (skorE > skorP) { kazanan = etiketSonuc; teshis.kullanilanYontem = "etiket"; }
    if (skorC > Math.max(skorP, skorE)) { kazanan = classSonuc; teshis.kullanilanYontem = "class"; }

    // BIRLESIM: Kazanan yolda yakin yoksa digerlerinden al
    if (kazanan && !kazanan.yakin) {
      if (etiketSonuc && etiketSonuc.yakin) kazanan.yakin = etiketSonuc.yakin;
      else if (classSonuc && classSonuc.yakin) kazanan.yakin = classSonuc.yakin;
      else if (patternSonuc && patternSonuc.yakin) kazanan.yakin = patternSonuc.yakin;
    }
    if (kazanan && !kazanan.uzak) {
      if (etiketSonuc && etiketSonuc.uzak) kazanan.uzak = etiketSonuc.uzak;
      else if (classSonuc && classSonuc.uzak) kazanan.uzak = classSonuc.uzak;
      else if (patternSonuc && patternSonuc.uzak) kazanan.uzak = patternSonuc.uzak;
    }

    window._sgkTeshis = teshis;
    return kazanan || { uzak: null, yakin: null };
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

    var gozVerisi = tumGozlukVerileriniOku();

    if (gozVerisi.uzak) {
      veri.u = {};
      if (gozVerisi.uzak.sag) veri.u.s = gozVerisi.uzak.sag;
      if (gozVerisi.uzak.sol) veri.u.l = gozVerisi.uzak.sol;
      if (!veri.u.s && !veri.u.l) delete veri.u;
    }
    if (gozVerisi.yakin) {
      veri.y = {};
      if (gozVerisi.yakin.sag) veri.y.s = gozVerisi.yakin.sag;
      if (gozVerisi.yakin.sol) veri.y.l = gozVerisi.yakin.sol;
      if (!veri.y.s && !veri.y.l) delete veri.y;
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

    var yeniSekme = window.open(url, "_blank");
    if (!yeniSekme || yeniSekme.closed) {
      window.location.href = url;
    }
  }

  // ============================================================
  // CALISTIR
  // ============================================================
  try {
    var veri = sgkVerileriOku();
    if (!veri.u && !veri.y) {
      alert("Goz verisi okunamadi. Manuel giris kullanin.\nTeshis: F12 -> Console -> _sgkTeshis");
      return;
    }
    // Sessiz aktar - uzak var ve yakin yoksa da gonder (eski v6 davranisi)
    receteyeAktar(veri);
  } catch (e) {
    alert("Bookmarklet hatasi: " + e.message);
  }

})();
