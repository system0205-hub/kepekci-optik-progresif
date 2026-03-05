// Kepekci Optik - Yardimci Fonksiyonlar

/**
 * Aks degerini 0-180 arasina normalize eder
 */
function normalizeAks(aks) {
  if (aks === null || aks === undefined || aks === "") return null;
  aks = parseFloat(aks);
  if (isNaN(aks)) return null;
  while (aks < 0) aks += 180;
  while (aks > 180) aks -= 180;
  return Math.round(aks);
}

/**
 * Oblik aks mi kontrol eder (30-60 veya 120-150 arasi)
 * Oblik akslar progresif camda en zor adaptasyona neden olur
 */
function oblicMi(aks) {
  if (aks === null || aks === undefined) return false;
  aks = normalizeAks(aks);
  return (aks >= 30 && aks <= 60) || (aks >= 120 && aks <= 150);
}

/**
 * Kismen oblik aks mi (61-89 veya 91-119 arasi)
 */
function kismenOblicMi(aks) {
  if (aks === null || aks === undefined) return false;
  aks = normalizeAks(aks);
  return (aks >= 61 && aks <= 89) || (aks >= 91 && aks <= 119);
}

/**
 * Para formatla: 12500 -> "12.500 TL"
 */
function formatParaTL(sayi) {
  if (sayi === null || sayi === undefined) return "Fiyat icin sorununz";
  return sayi.toLocaleString("tr-TR") + " TL";
}

/**
 * Fiyat araligini formatla
 */
function formatFiyatAraligi(fiyatAraligi) {
  if (!fiyatAraligi) return "Fiyat icin satin alma birimine sorunuz";
  return formatParaTL(fiyatAraligi.min) + " - " + formatParaTL(fiyatAraligi.max);
}

/**
 * Recete validasyonu
 * Hatalari dizi olarak dondurur, bos dizi = gecerli
 */
function validasyonRecete(recete) {
  const hatalar = [];

  ["sag", "sol"].forEach(function(goz) {
    const gozAdi = goz === "sag" ? "Sag Goz" : "Sol Goz";
    const g = recete[goz];

    // SPH kontrolu
    if (g.sph === null || g.sph === undefined || g.sph === "") {
      hatalar.push(gozAdi + ": Uzak numara (SPH) bos birakilamaz");
    } else {
      const sph = parseFloat(g.sph);
      if (isNaN(sph)) {
        hatalar.push(gozAdi + ": Uzak numara (SPH) gecersiz");
      } else if (sph < -20 || sph > 20) {
        hatalar.push(gozAdi + ": Uzak numara (SPH) -20.00 ile +20.00 arasinda olmali");
      }
    }

    // CYL kontrolu
    if (g.cyl !== null && g.cyl !== undefined && g.cyl !== "" && g.cyl !== 0) {
      const cyl = parseFloat(g.cyl);
      if (isNaN(cyl)) {
        hatalar.push(gozAdi + ": Silindir (CYL) gecersiz");
      } else if (cyl < -6 || cyl > 6) {
        hatalar.push(gozAdi + ": Silindir (CYL) -6.00 ile +6.00 arasinda olmali");
      }

      // CYL varsa AX zorunlu
      if (cyl !== 0 && (g.ax === null || g.ax === undefined || g.ax === "")) {
        hatalar.push(gozAdi + ": Silindir (CYL) girildiyse Derece (AX) zorunludur");
      }
    }

    // AX kontrolu
    if (g.ax !== null && g.ax !== undefined && g.ax !== "") {
      const ax = parseFloat(g.ax);
      if (isNaN(ax) || ax < 0 || ax > 180) {
        hatalar.push(gozAdi + ": Derece (AX) 0 ile 180 arasinda olmali");
      }
    }

    // ADD kontrolu
    if (g.add === null || g.add === undefined || g.add === "") {
      hatalar.push(gozAdi + ": Yakin ilave (ADD) bos birakilamaz");
    } else {
      const add = parseFloat(g.add);
      if (isNaN(add)) {
        hatalar.push(gozAdi + ": Yakin ilave (ADD) gecersiz");
      } else if (add < 0.50 || add > 4.00) {
        hatalar.push(gozAdi + ": Yakin ilave (ADD) 0.50 ile 4.00 arasinda olmali");
      }
    }
  });

  // PD kontrolu
  if (recete.pdSag === null || recete.pdSag === undefined || recete.pdSag === "") {
    hatalar.push("Sag goz mesafesi (PD) bos birakilamaz");
  } else {
    const pd = parseFloat(recete.pdSag);
    if (isNaN(pd) || pd < 20 || pd > 45) {
      hatalar.push("Sag goz mesafesi (PD) 20-45 mm arasinda olmali");
    }
  }

  if (recete.pdSol === null || recete.pdSol === undefined || recete.pdSol === "") {
    hatalar.push("Sol goz mesafesi (PD) bos birakilamaz");
  } else {
    const pd = parseFloat(recete.pdSol);
    if (isNaN(pd) || pd < 20 || pd > 45) {
      hatalar.push("Sol goz mesafesi (PD) 20-45 mm arasinda olmali");
    }
  }

  return hatalar;
}

/**
 * Cerceve validasyonu
 */
function validasyonCerceve(cerceve) {
  const hatalar = [];

  if (!cerceve.fittingHeight || cerceve.fittingHeight < 8 || cerceve.fittingHeight > 40) {
    hatalar.push("Odak yuksekligi 8-40 mm arasinda olmali");
  }

  if (!cerceve.bOlcusu || cerceve.bOlcusu < 15 || cerceve.bOlcusu > 60) {
    hatalar.push("Cerceve yuksekligi (dikey) 15-60 mm arasinda olmali");
  }

  if (cerceve.aOlcusu && (cerceve.aOlcusu < 30 || cerceve.aOlcusu > 70)) {
    hatalar.push("Cerceve genisligi (yatay) 30-70 mm arasinda olmali");
  }

  // Fitting height, B olcusunden buyuk olamaz
  if (cerceve.fittingHeight && cerceve.bOlcusu && cerceve.fittingHeight > cerceve.bOlcusu) {
    hatalar.push("Odak yuksekligi, cerceve yuksekliginden buyuk olamaz");
  }

  return hatalar;
}

/**
 * Sonuclari yazdir (sadece sonuc alanini)
 */
function yazdirSonuc() {
  window.print();
}

/**
 * Sonuclari panoya kopyala
 */
function kopyalaSonuc(sonucMetni) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(sonucMetni).then(function() {
      bildirimGoster("Sonuclar panoya kopyalandi!", "basarili");
    }).catch(function() {
      fallbackKopyala(sonucMetni);
    });
  } else {
    fallbackKopyala(sonucMetni);
  }
}

function fallbackKopyala(metin) {
  const ta = document.createElement("textarea");
  ta.value = metin;
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
  bildirimGoster("Sonuclar panoya kopyalandi!", "basarili");
}

/**
 * Bildirim goster
 */
function bildirimGoster(mesaj, tip) {
  const mevcut = document.querySelector(".bildirim");
  if (mevcut) mevcut.remove();

  const el = document.createElement("div");
  el.className = "bildirim bildirim-" + (tip || "bilgi");
  el.textContent = mesaj;
  document.body.appendChild(el);

  setTimeout(function() {
    el.classList.add("bildirim-goster");
  }, 10);

  setTimeout(function() {
    el.classList.remove("bildirim-goster");
    setTimeout(function() { el.remove(); }, 300);
  }, 3000);
}

/**
 * Seviye etiketini Turkce dondur
 */
function seviyeEtiketi(seviye) {
  switch (seviye) {
    case "premium": return "Ust Seviye (Kisisel Tasarim)";
    case "orta": return "Orta Seviye";
    case "baslangic": return "Baslangic Seviyesi";
    default: return seviye;
  }
}

/**
 * Tasarim etiketini Turkce dondur
 */
function tasarimEtiketi(tasarim) {
  switch (tasarim) {
    case "freeform": return "Kisisel Tasarim (FreeForm)";
    case "dijital": return "Dijital Isleme";
    case "standart": return "Standart";
    default: return tasarim;
  }
}

/**
 * Risk seviyesinin rengini ve etiketini dondur
 */
function riskSeviyesi(skor) {
  if (skor <= 3) return { renk: "#22c55e", arkaplan: "#f0fdf4", etiket: "Dusuk Zorluk", sinif: "risk-dusuk" };
  if (skor <= 5) return { renk: "#eab308", arkaplan: "#fefce8", etiket: "Orta Zorluk", sinif: "risk-orta" };
  if (skor <= 7) return { renk: "#f97316", arkaplan: "#fff7ed", etiket: "Yuksek Zorluk", sinif: "risk-yuksek" };
  return { renk: "#ef4444", arkaplan: "#fef2f2", etiket: "Cok Yuksek Zorluk", sinif: "risk-kritik" };
}

/**
 * Form degerini oku (bos ise null dondur)
 * Turkce lokalde virgul (,) ondalik ayirici olarak kullanilir.
 * Chrome'da type="number" input'a virgulle yazilinca .value bos donebilir,
 * bu durumda .valueAsNumber fallback olarak kullanilir.
 */
function formDegeriOku(id) {
  var el = document.getElementById(id);
  if (!el) return null;
  var val = el.value.trim();
  if (val === "") {
    // type="number" input'larda .value bos donse bile valueAsNumber dogru olabilir
    if (el.type === "number" && !isNaN(el.valueAsNumber)) {
      return el.valueAsNumber;
    }
    return null;
  }
  // Turkce lokalde virgulu noktaya cevir
  var normalized = val.replace(",", ".");
  var num = parseFloat(normalized);
  if (isNaN(num)) return null;
  return num;
}
