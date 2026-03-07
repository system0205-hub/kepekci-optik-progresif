// ============================================================
// SGK BOOKMARKLET - Recete Veri Okuma & QR Kod Uretme
// Kepekci Optik - Modul 2
//
// Bu script, SGK e-recete sayfasinda (gss.sgk.gov.tr)
// bookmarklet ile calistirilir. Sayfadaki recete verilerini
// okur ve QR kod olarak ekranda gosterir.
// ============================================================

(function() {
  "use strict";

  // Zaten calisiyorsa tekrar calistirma
  if (document.getElementById("kepekci-qr-overlay")) {
    document.getElementById("kepekci-qr-overlay").remove();
    return;
  }

  // ============================================================
  // DOM OKUMA STRATEJILERI
  // ============================================================

  // Strateji 1: Dogrudan ID ile
  function getById(id) {
    var el = document.getElementById(id);
    return el ? (el.value || el.textContent || "").trim() : "";
  }

  // Strateji 2: ID sonu eslesmesi (JSF form:alan formatina uygun)
  function getByIdEndsWith(suffix) {
    var el = document.querySelector('[id$="' + suffix + '"]');
    return el ? (el.value || el.textContent || "").trim() : "";
  }

  // Strateji 3: Label metninden input bul
  function getByLabelText(labelText) {
    var labels = document.querySelectorAll("label, td, th, span");
    for (var i = 0; i < labels.length; i++) {
      var text = (labels[i].textContent || "").trim();
      if (text.indexOf(labelText) >= 0) {
        // Kardes veya sonraki input/td'yi bul
        var next = labels[i].nextElementSibling;
        if (next) {
          var input = next.querySelector ? next.querySelector("input, select") : null;
          if (input) return (input.value || "").trim();
          return (next.textContent || "").trim();
        }
        // Ayni parent icerisinde input ara
        var parent = labels[i].parentElement;
        if (parent) {
          var inputs = parent.querySelectorAll("input, select");
          for (var j = 0; j < inputs.length; j++) {
            if (inputs[j].value) return inputs[j].value.trim();
          }
        }
      }
    }
    return "";
  }

  // Coklu strateji ile deger oku
  function oku(id, idSuffix, labelText) {
    return getById(id) || getByIdEndsWith(idSuffix || id) || getByLabelText(labelText || "") || "";
  }

  // Sayi okuma (ondalik virgul destegi)
  function sayiOku(id, idSuffix, labelText) {
    var val = oku(id, idSuffix, labelText);
    val = val.replace(",", ".");
    return parseFloat(val) || 0;
  }

  // Isaret okuma (+ veya -)
  function isaretOku(id, idSuffix) {
    var val = oku(id, idSuffix, "");
    if (val === "-" || val === "minus" || val === "eksi") return "-";
    return "+";
  }

  // ============================================================
  // SGK SAYFASINDAN VERI CEKME
  // ============================================================
  function sgkVerileriOku() {
    var veri = {
      v: 1,
      hasta: {
        tc: "",
        ad: "",
        soyad: "",
        yas: 0,
        cinsiyet: ""
      },
      recete: {
        tarih: "",
        protokolNo: "",
        teshis: "",
        doktor: ""
      },
      uzak: null,
      yakin: null
    };

    // ---- HASTA BILGILERI ----
    veri.hasta.tc = oku("tcKimlikNo", "tcKimlikNo", "T.C. Kimlik");
    veri.hasta.ad = oku("hastaAd", "hastaAd", "Hasta Ad");
    veri.hasta.soyad = oku("hastaSoyad", "hastaSoyad", "Hasta Soyad");

    // Ad soyad tek alanda olabilir
    if (!veri.hasta.ad && !veri.hasta.soyad) {
      var adSoyad = oku("hastaAdSoyad", "hastaAdSoyad", "Ad Soyad");
      if (adSoyad) {
        var parcalar = adSoyad.split(" ");
        veri.hasta.soyad = parcalar.pop() || "";
        veri.hasta.ad = parcalar.join(" ") || "";
      }
    }

    // ---- RECETE BILGILERI ----
    veri.recete.tarih = oku("receteTarih", "receteTarih", "Tarih");
    veri.recete.protokolNo = oku("protokolNo", "protokolNo", "Protokol");
    veri.recete.doktor = oku("doktorAd", "doktorAd", "Doktor");
    veri.recete.teshis = oku("teshisKodu", "teshisKodu", "Teshis");

    // ---- UZAK GOZ NUMARALARI ----
    // SGK sayfasinda tablo satirlari olarak gorunebilir
    // Her goz icin SPH, CYL, AKS alanlari olabilir

    var uzakSagSph = sayiOku("uzakSagSph", "uzakSagSph", "Uzak Sag SPH");
    var uzakSagCyl = sayiOku("uzakSagCyl", "uzakSagCyl", "Uzak Sag CYL");
    var uzakSagAks = sayiOku("uzakSagAks", "uzakSagAks", "Uzak Sag AKS");
    var uzakSolSph = sayiOku("uzakSolSph", "uzakSolSph", "Uzak Sol SPH");
    var uzakSolCyl = sayiOku("uzakSolCyl", "uzakSolCyl", "Uzak Sol CYL");
    var uzakSolAks = sayiOku("uzakSolAks", "uzakSolAks", "Uzak Sol AKS");

    // Isaretler
    var uzakSagSphIsaret = isaretOku("uzakSagSphIsaret", "uzakSagSphIsaret");
    var uzakSagCylIsaret = isaretOku("uzakSagCylIsaret", "uzakSagCylIsaret");
    var uzakSolSphIsaret = isaretOku("uzakSolSphIsaret", "uzakSolSphIsaret");
    var uzakSolCylIsaret = isaretOku("uzakSolCylIsaret", "uzakSolCylIsaret");

    // Eger hicbir uzak deger yoksa, tablo satirlarindan okumayı dene
    if (uzakSagSph === 0 && uzakSolSph === 0) {
      var tabloVerisi = tabloOku();
      if (tabloVerisi) {
        if (tabloVerisi.uzak) {
          uzakSagSph = tabloVerisi.uzak.sagSph || 0;
          uzakSagCyl = tabloVerisi.uzak.sagCyl || 0;
          uzakSagAks = tabloVerisi.uzak.sagAks || 0;
          uzakSolSph = tabloVerisi.uzak.solSph || 0;
          uzakSolCyl = tabloVerisi.uzak.solCyl || 0;
          uzakSolAks = tabloVerisi.uzak.solAks || 0;
          uzakSagSphIsaret = tabloVerisi.uzak.sagSphIsaret || "+";
          uzakSagCylIsaret = tabloVerisi.uzak.sagCylIsaret || "+";
          uzakSolSphIsaret = tabloVerisi.uzak.solSphIsaret || "+";
          uzakSolCylIsaret = tabloVerisi.uzak.solCylIsaret || "+";
        }
        if (tabloVerisi.yakin) {
          veri.yakin = {
            sag: {
              sph: tabloVerisi.yakin.sagSph || 0,
              sphIsaret: tabloVerisi.yakin.sagSphIsaret || "+",
              cyl: tabloVerisi.yakin.sagCyl || 0,
              cylIsaret: tabloVerisi.yakin.sagCylIsaret || "+",
              aks: tabloVerisi.yakin.sagAks || 0
            },
            sol: {
              sph: tabloVerisi.yakin.solSph || 0,
              sphIsaret: tabloVerisi.yakin.solSphIsaret || "+",
              cyl: tabloVerisi.yakin.solCyl || 0,
              cylIsaret: tabloVerisi.yakin.solCylIsaret || "+",
              aks: tabloVerisi.yakin.solAks || 0
            }
          };
        }
      }
    }

    veri.uzak = {
      sag: { sph: uzakSagSph, sphIsaret: uzakSagSphIsaret, cyl: uzakSagCyl, cylIsaret: uzakSagCylIsaret, aks: uzakSagAks },
      sol: { sph: uzakSolSph, sphIsaret: uzakSolSphIsaret, cyl: uzakSolCyl, cylIsaret: uzakSolCylIsaret, aks: uzakSolAks }
    };

    // ---- YAKIN GOZ NUMARALARI ----
    if (!veri.yakin) {
      var yakinSagSph = sayiOku("yakinSagSph", "yakinSagSph", "Yakin Sag SPH");
      var yakinSolSph = sayiOku("yakinSolSph", "yakinSolSph", "Yakin Sol SPH");
      if (yakinSagSph !== 0 || yakinSolSph !== 0) {
        veri.yakin = {
          sag: {
            sph: yakinSagSph,
            sphIsaret: isaretOku("yakinSagSphIsaret", "yakinSagSphIsaret"),
            cyl: sayiOku("yakinSagCyl", "yakinSagCyl", "Yakin Sag CYL"),
            cylIsaret: isaretOku("yakinSagCylIsaret", "yakinSagCylIsaret"),
            aks: sayiOku("yakinSagAks", "yakinSagAks", "Yakin Sag AKS")
          },
          sol: {
            sph: yakinSolSph,
            sphIsaret: isaretOku("yakinSolSphIsaret", "yakinSolSphIsaret"),
            cyl: sayiOku("yakinSolCyl", "yakinSolCyl", "Yakin Sol CYL"),
            cylIsaret: isaretOku("yakinSolCylIsaret", "yakinSolCylIsaret"),
            aks: sayiOku("yakinSolAks", "yakinSolAks", "Yakin Sol AKS")
          }
        };
      }
    }

    return veri;
  }

  // ============================================================
  // TABLO OKUMA (SGK'nin tablo yapisinden numara cekme)
  // ============================================================
  function tabloOku() {
    var tablolar = document.querySelectorAll("table");
    var sonuc = { uzak: null, yakin: null };

    for (var t = 0; t < tablolar.length; t++) {
      var tablo = tablolar[t];
      var satirlar = tablo.querySelectorAll("tr");

      for (var i = 0; i < satirlar.length; i++) {
        var hucreler = satirlar[i].querySelectorAll("td, th");
        var satirMetni = (satirlar[i].textContent || "").toLowerCase();

        // "uzak" veya "yakin" iceren satirlari bul
        if (satirMetni.indexOf("uzak") >= 0 || satirMetni.indexOf("yakin") >= 0) {
          var tip = satirMetni.indexOf("yakin") >= 0 ? "yakin" : "uzak";
          var veriler = tabloSatirindanNumaraOku(satirlar, i);
          if (veriler) {
            sonuc[tip] = veriler;
          }
        }
      }
    }

    if (sonuc.uzak || sonuc.yakin) return sonuc;
    return null;
  }

  function tabloSatirindanNumaraOku(satirlar, baslangic) {
    // Basit yaklaşım: SPH, CYL, AKS degerlerini satirlardaki sayilardan cek
    var sayilar = [];
    for (var i = baslangic; i < Math.min(baslangic + 3, satirlar.length); i++) {
      var hucreler = satirlar[i].querySelectorAll("td");
      for (var j = 0; j < hucreler.length; j++) {
        var text = (hucreler[j].textContent || "").trim().replace(",", ".");
        var num = parseFloat(text);
        if (!isNaN(num) || text === "0") {
          sayilar.push({ deger: num || 0, metin: text });
        }
      }
    }

    // En az 6 sayi bulduysa (sag SPH, CYL, AKS + sol SPH, CYL, AKS)
    if (sayilar.length >= 6) {
      return {
        sagSph: Math.abs(sayilar[0].deger),
        sagSphIsaret: sayilar[0].deger < 0 ? "-" : "+",
        sagCyl: Math.abs(sayilar[1].deger),
        sagCylIsaret: sayilar[1].deger < 0 ? "-" : "+",
        sagAks: sayilar[2].deger,
        solSph: Math.abs(sayilar[3].deger),
        solSphIsaret: sayilar[3].deger < 0 ? "-" : "+",
        solCyl: Math.abs(sayilar[4].deger),
        solCylIsaret: sayilar[4].deger < 0 ? "-" : "+",
        solAks: sayilar[5].deger
      };
    }
    return null;
  }

  // ============================================================
  // QR KOD URETME & GOSTERME
  // ============================================================
  function qrKoduGoster(veri) {
    var jsonStr = JSON.stringify(veri);

    // Overlay olustur
    var overlay = document.createElement("div");
    overlay.id = "kepekci-qr-overlay";
    overlay.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);" +
      "z-index:999999;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:Arial,sans-serif;";

    // Baslik
    var baslik = document.createElement("div");
    baslik.style.cssText = "color:#fff;font-size:20px;font-weight:bold;margin-bottom:8px;";
    baslik.textContent = "Kepekci Optik - SGK Recete QR";
    overlay.appendChild(baslik);

    // Hasta bilgisi
    var hastaBilgi = document.createElement("div");
    hastaBilgi.style.cssText = "color:#aaa;font-size:14px;margin-bottom:20px;";
    var hastaAd = (veri.hasta.ad || "") + " " + (veri.hasta.soyad || "");
    hastaBilgi.textContent = hastaAd.trim() || "Hasta bilgisi okunamadi";
    overlay.appendChild(hastaBilgi);

    // QR kod container
    var qrContainer = document.createElement("div");
    qrContainer.id = "kepekci-qr-container";
    qrContainer.style.cssText = "background:#fff;padding:20px;border-radius:12px;";
    overlay.appendChild(qrContainer);

    // Alt bilgi
    var altBilgi = document.createElement("div");
    altBilgi.style.cssText = "color:#888;font-size:13px;margin-top:16px;text-align:center;";
    altBilgi.innerHTML = "Tabletten <strong>SGK Recete</strong> sayfasini acin ve QR kodu tarayin.<br>" +
      '<span style="font-size:12px;">(' + jsonStr.length + ' karakter)</span>';
    overlay.appendChild(altBilgi);

    // Kapat butonu
    var kapatBtn = document.createElement("button");
    kapatBtn.textContent = "Kapat";
    kapatBtn.style.cssText = "margin-top:20px;padding:12px 40px;background:#e74c3c;color:#fff;border:none;" +
      "border-radius:8px;font-size:16px;cursor:pointer;font-weight:bold;";
    kapatBtn.onclick = function() { overlay.remove(); };
    overlay.appendChild(kapatBtn);

    // Overlay'i sayfaya ekle
    document.body.appendChild(overlay);

    // QRCode.js kutuphanesini CDN'den yukle
    if (typeof QRCode !== "undefined") {
      qrOlustur(qrContainer, jsonStr);
    } else {
      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js";
      script.onload = function() {
        qrOlustur(qrContainer, jsonStr);
      };
      script.onerror = function() {
        // QR kutuphane yuklenemedi — yedek: kopyala
        qrContainer.innerHTML = '<div style="padding:20px;text-align:center;color:#e74c3c;">' +
          '<p style="font-weight:bold;margin-bottom:12px;">QR kod olusturulamadi</p>' +
          '<p style="font-size:13px;margin-bottom:16px;">Veri panoya kopyalandi. Tablette "Manuel Giris" kullanin.</p>' +
          '</div>';
        panoyaKopyala(jsonStr);
      };
      document.head.appendChild(script);
    }
  }

  function qrOlustur(container, metin) {
    try {
      new QRCode(container, {
        text: metin,
        width: 320,
        height: 320,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.M
      });
    } catch (e) {
      container.innerHTML = '<div style="padding:20px;text-align:center;color:#e74c3c;">' +
        '<p>QR kod olusturulamadi: ' + e.message + '</p></div>';
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
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
    } catch (e) {
      // Sessizce gecis
    }
  }

  // ============================================================
  // ANA CALISTIRMA
  // ============================================================
  try {
    var receteVerisi = sgkVerileriOku();
    qrKoduGoster(receteVerisi);
  } catch (e) {
    alert("Kepekci Optik SGK Bookmarklet Hatasi:\n" + e.message + "\n\nManuel giris kullanin.");
  }

})();
