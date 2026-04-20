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
  const el = document.getElementById(id);
  if (!el) return null;
  const val = el.value.trim();
  if (val === "") {
    // type="number" input'larda .value bos donse bile valueAsNumber dogru olabilir
    if (el.type === "number" && !isNaN(el.valueAsNumber)) {
      return el.valueAsNumber;
    }
    return null;
  }
  // Turkce lokalde virgulu noktaya cevir
  const normalized = val.replace(",", ".");
  const num = parseFloat(normalized);
  if (isNaN(num)) return null;
  return num;
}

/**
 * HTML kacis karakterleri - XSS koruma
 * Kullanici verisini innerHTML'e vermeden once sar
 */
function escapeHtml(s) {
  if (s === null || s === undefined) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Raw bir degeri guvenli sayi olarak oku
 * formDegeriOku'dan farki: bu fonksiyon bir ID degil ham deger alir
 * Bos / null / undefined / NaN durumunda varsayilan dondurur
 * Turkce virgul otomatik noktaya cevrilir
 */
function sayiOku(x, varsayilan) {
  if (varsayilan === undefined) varsayilan = null;
  if (x === null || x === undefined || x === "") return varsayilan;
  var str = String(x).trim();
  if (str === "") return varsayilan;
  var normalized = str.replace(",", ".");
  var num = parseFloat(normalized);
  if (isNaN(num)) return varsayilan;
  return num;
}

/**
 * Basit modal ac - baslik + icerik + butonlar
 * butonlar: [{text: "Tamam", onClick: fn, tip: "primary|danger|ghost"}, ...]
 * ESC ile kapanir, arka planda focus trap
 * Uyari/onay/hata mesajlari icin kullanilir
 */
function modalAc(baslik, icerik, butonlar) {
  // Varsayilan butonlar
  if (!butonlar || butonlar.length === 0) {
    butonlar = [{ text: "Tamam", onClick: null, tip: "primary" }];
  }
  // Overlay
  var overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-labelledby", "modal-baslik");
  overlay.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;";

  // Icerik kutusu
  var kutu = document.createElement("div");
  kutu.className = "modal-kutu";
  kutu.style.cssText = "background:#fff;border-radius:12px;padding:24px;max-width:480px;width:90%;box-shadow:0 20px 60px rgba(0,0,0,0.3);";

  // Baslik
  var h = document.createElement("h3");
  h.id = "modal-baslik";
  h.textContent = baslik;
  h.style.cssText = "margin:0 0 16px 0;font-size:18px;color:#1f2937;";
  kutu.appendChild(h);

  // Icerik (kullanici veri icerebilir - escape et)
  var body = document.createElement("div");
  body.className = "modal-icerik";
  // icerik HTML icerebilir ama cagiran sorumlu - biz escape etmeyiz, ham veriyle cagrilsinsa textContent kullansinlar
  if (typeof icerik === "string") {
    body.innerHTML = icerik;
  } else if (icerik instanceof HTMLElement) {
    body.appendChild(icerik);
  }
  body.style.cssText = "margin-bottom:20px;color:#374151;line-height:1.6;";
  kutu.appendChild(body);

  // Butonlar
  var butonKutu = document.createElement("div");
  butonKutu.style.cssText = "display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;";
  var ilkButon = null;
  butonlar.forEach(function (b, idx) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = b.text;
    var renk = "#3b82f6"; // primary mavi
    if (b.tip === "danger") renk = "#ef4444";
    else if (b.tip === "ghost") renk = "transparent";
    var yazi = b.tip === "ghost" ? "#6b7280" : "#fff";
    btn.style.cssText = "padding:10px 20px;border-radius:8px;border:" + (b.tip === "ghost" ? "1px solid #d1d5db" : "none") + ";background:" + renk + ";color:" + yazi + ";font-size:14px;font-weight:500;cursor:pointer;min-height:44px;min-width:80px;";
    btn.addEventListener("click", function () {
      if (b.onClick) b.onClick();
      kapat();
    });
    butonKutu.appendChild(btn);
    if (idx === 0) ilkButon = btn;
  });
  kutu.appendChild(butonKutu);
  overlay.appendChild(kutu);

  // Focus trap - sadece modal icindeki elementlere tab
  function focusTrap(e) {
    if (e.key === "Tab") {
      var focuslanabilir = kutu.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if (focuslanabilir.length === 0) return;
      var ilk = focuslanabilir[0];
      var son = focuslanabilir[focuslanabilir.length - 1];
      if (e.shiftKey && document.activeElement === ilk) {
        e.preventDefault();
        son.focus();
      } else if (!e.shiftKey && document.activeElement === son) {
        e.preventDefault();
        ilk.focus();
      }
    } else if (e.key === "Escape") {
      kapat();
    }
  }

  function kapat() {
    document.removeEventListener("keydown", focusTrap);
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
  }

  document.body.appendChild(overlay);
  document.addEventListener("keydown", focusTrap);
  if (ilkButon) ilkButon.focus();

  return { kapat: kapat, overlay: overlay };
}
