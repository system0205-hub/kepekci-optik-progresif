# Cam Karsilastirma Tablosu Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Cam oneri kartina "Karsilastir" butonu ekleyip, tiklaninca fiyat kartinin altinda indeksleri yan yana gosteren akordeon tablo acmak.

**Architecture:** Cam oneri kartina buton eklenir. Tiklaninca `g_cam_karsilastirma` container'a 4 sutunlu karsilastirma tablosu (1.56/1.60/1.67/1.74) render edilir. Onerilen indeks vurgulanir. Toggle mantigi ile acilip kapanir.

**Tech Stack:** Vanilla JS, inline CSS (recete.html style blogu), localStorage yok — tamamen statik veri.

---

### Task 1: CSS Stilleri Ekle

**Files:**
- Modify: `progresif-oneri/recete.html` (style blogu, satir ~816 civari, cam-oneri-kart CSS'inden sonra)

**Step 1: Karsilastirma tablosu CSS ekle**

recete.html'deki `@media (max-width: 480px)` satirindan ONCE (cam-oneri-mesaj'dan sonra) su CSS'i ekle:

```css
/* Karsilastir butonu (cam oneri karti icinde) */
.btn-karsilastir {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  margin-left: 62px;
  padding: 8px 18px;
  background: rgba(255,255,255,0.2);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 20px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  z-index: 1;
  backdrop-filter: blur(4px);
}
.btn-karsilastir:hover {
  background: rgba(255,255,255,0.3);
  transform: translateY(-1px);
}
.btn-karsilastir .ok-ikon {
  transition: transform 0.3s ease;
  font-size: 0.7rem;
}
.btn-karsilastir.acik .ok-ikon {
  transform: rotate(180deg);
}

/* Cam karsilastirma tablosu container */
.cam-karsilastirma {
  background: #ffffff;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  border: 1px solid rgba(0,0,0,0.06);
  animation: fadeInUp 0.3s ease;
}
.cam-karsilastirma-header {
  background: linear-gradient(135deg, #1e293b, #334155);
  padding: 14px 20px;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}
.cam-karsilastirma-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0;
}
.cam-sutun {
  padding: 16px 12px;
  text-align: center;
  border-right: 1px solid #f1f5f9;
  transition: background 0.2s ease;
}
.cam-sutun:last-child {
  border-right: none;
}
.cam-sutun.onerilen {
  background: linear-gradient(180deg, #ecfdf5, #f0fdf4);
  border: 2px solid #22c55e;
  border-radius: 0;
  position: relative;
}
.cam-sutun.onerilen::before {
  content: "ONERILEN";
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  background: #22c55e;
  color: #fff;
  font-size: 0.6rem;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 0 0 8px 8px;
  letter-spacing: 1px;
}
.cam-sutun-indeks {
  font-size: 1.3rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 4px;
  margin-top: 8px;
}
.cam-sutun-inceltme {
  display: inline-block;
  background: #f1f5f9;
  color: #475569;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 700;
  margin-bottom: 12px;
}
.cam-sutun.onerilen .cam-sutun-inceltme {
  background: #dcfce7;
  color: #166534;
}
.cam-ozellik-satir {
  padding: 8px 0;
  border-top: 1px solid #f1f5f9;
}
.cam-ozellik-etiket {
  font-size: 0.65rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}
.cam-ozellik-deger {
  font-size: 0.85rem;
  font-weight: 600;
  color: #334155;
}
.cam-kalinlik-bar {
  height: 6px;
  border-radius: 3px;
  background: #e2e8f0;
  margin: 6px auto 0;
  width: 80%;
  position: relative;
  overflow: hidden;
}
.cam-kalinlik-bar-dolu {
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, #22c55e, #eab308, #ef4444);
}
.cam-sutun-fiyat {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 2px solid #e2e8f0;
}
.cam-sutun-fiyat .fiyat-farki {
  font-size: 1.1rem;
  font-weight: 800;
  font-family: "SF Mono", "Fira Code", "Consolas", monospace;
}
.cam-sutun-fiyat .fiyat-farki.baz { color: #64748b; }
.cam-sutun-fiyat .fiyat-farki.artis { color: #ea580c; }
.cam-sutun.onerilen .cam-sutun-fiyat .fiyat-farki { color: #16a34a; }
.cam-sutun-fiyat .fiyat-aciklama {
  font-size: 0.65rem;
  color: #94a3b8;
  margin-top: 2px;
}

/* Responsive: mobilde 2x2 grid */
@media (max-width: 480px) {
  .cam-karsilastirma-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .cam-sutun {
    border-bottom: 1px solid #f1f5f9;
  }
  .cam-sutun-indeks { font-size: 1.1rem; }
  .btn-karsilastir { margin-left: 0; }
}
```

**Step 2: Commit**
```bash
git add progresif-oneri/recete.html
git commit -m "feat(css): cam karsilastirma tablosu stilleri"
```

---

### Task 2: Karsilastir Butonu Ekle (cam oneri kartina)

**Files:**
- Modify: `progresif-oneri/js/recete.js` — `camOneriKartiniDoldur()` fonksiyonu (satir ~419-435)

**Step 1: Buton HTML'i ekle**

`camOneriKartiniDoldur()` fonksiyonunda, `cam-oneri-mesaj` div'inden sonra, kapanış `</div>`'inden once buton ekle:

Mevcut kod (satir ~432):
```javascript
  html += '<div class="cam-oneri-mesaj">' + mesaj + '</div>';
  html += '</div>';
```

Yeni kod:
```javascript
  html += '<div class="cam-oneri-mesaj">' + mesaj + '</div>';
  html += '<button class="btn-karsilastir" onclick="camKarsilastirmaToggle()" id="btn-karsilastir">';
  html += '<span>Camlari Karsilastir</span> <span class="ok-ikon">&#9660;</span>';
  html += '</button>';
  html += '</div>';
```

**Step 2: Commit**
```bash
git add progresif-oneri/js/recete.js
git commit -m "feat: cam oneri kartina karsilastir butonu ekle"
```

---

### Task 3: Karsilastirma Container Div Ekle

**Files:**
- Modify: `progresif-oneri/recete.html` — HTML body (g_cam_oneri ile g_fiyat_kart arasina)

**Step 1: Container div ekle**

recete.html'de `g_cam_oneri` div'i ile `fiyat-kart` div'i arasina:

```html
      <!-- Cam Karsilastirma Tablosu -->
      <div id="g_cam_karsilastirma" style="display:none;">
        <!-- JS ile doldurulacak -->
      </div>
```

**Step 2: Commit**
```bash
git add progresif-oneri/recete.html
git commit -m "feat: cam karsilastirma container div ekle"
```

---

### Task 4: Karsilastirma Tablosu JS Fonksiyonlari

**Files:**
- Modify: `progresif-oneri/js/recete.js` — yeni fonksiyonlar ekle (camOneriKartiniDoldur'dan sonra)

**Step 1: Toggle ve render fonksiyonlarini yaz**

`camOneriKartiniDoldur()` fonksiyonunun kapanisandan sonra, `fiyatKartiniDoldur()` fonksiyonundan once:

```javascript
// ============================================================
// CAM KARSILASTIRMA TABLOSU
// ============================================================
var CAM_INDEKS_BILGI = {
  "1.56": { inceltme: 20, kalinlik: 100, agirlik: "Standart", kaplama: "Sert Kaplama", fiyatFarki: 0 },
  "1.60": { inceltme: 35, kalinlik: 70,  agirlik: "Hafif",    kaplama: "Antirefle + UV", fiyatFarki: 200 },
  "1.67": { inceltme: 50, kalinlik: 45,  agirlik: "Cok Hafif", kaplama: "Antirefle + UV + Mavi Isik", fiyatFarki: 500 },
  "1.74": { inceltme: 60, kalinlik: 30,  agirlik: "Ultra Hafif", kaplama: "Antirefle + UV + Mavi Isik + Hidrofobik", fiyatFarki: 900 }
};

function camKarsilastirmaToggle() {
  var container = document.getElementById("g_cam_karsilastirma");
  var btn = document.getElementById("btn-karsilastir");
  if (!container) return;

  if (container.style.display === "none" || !container.style.display) {
    // Ac
    camKarsilastirmaTablosunuOlustur();
    container.style.display = "block";
    if (btn) btn.classList.add("acik");
  } else {
    // Kapat
    container.style.display = "none";
    if (btn) btn.classList.remove("acik");
  }
}

function camKarsilastirmaTablosunuOlustur() {
  var container = document.getElementById("g_cam_karsilastirma");
  if (!container || !mevcutRecete || !mevcutRecete.uzak) return;

  // Onerilen indeksi hesapla
  var onerilen = _hesaplaOnerilen();

  var indeksler = ["1.56", "1.60", "1.67", "1.74"];
  var html = '<div class="cam-karsilastirma">';
  html += '<div class="cam-karsilastirma-header">';
  html += '<span>&#128269;</span> Cam Indeks Karsilastirmasi';
  html += '</div>';
  html += '<div class="cam-karsilastirma-grid">';

  for (var i = 0; i < indeksler.length; i++) {
    var idx = indeksler[i];
    var bilgi = CAM_INDEKS_BILGI[idx];
    var isOnerilen = (idx === onerilen);

    html += '<div class="cam-sutun' + (isOnerilen ? ' onerilen' : '') + '">';
    html += '<div class="cam-sutun-indeks">' + idx + '</div>';
    html += '<div class="cam-sutun-inceltme">%' + bilgi.inceltme + ' Inceltme</div>';

    // Kalinlik bar
    html += '<div class="cam-ozellik-satir">';
    html += '<div class="cam-ozellik-etiket">Kalinlik</div>';
    html += '<div class="cam-kalinlik-bar"><div class="cam-kalinlik-bar-dolu" style="width:' + bilgi.kalinlik + '%;"></div></div>';
    html += '</div>';

    // Agirlik
    html += '<div class="cam-ozellik-satir">';
    html += '<div class="cam-ozellik-etiket">Agirlik</div>';
    html += '<div class="cam-ozellik-deger">' + bilgi.agirlik + '</div>';
    html += '</div>';

    // Kaplama
    html += '<div class="cam-ozellik-satir">';
    html += '<div class="cam-ozellik-etiket">Kaplama</div>';
    html += '<div class="cam-ozellik-deger" style="font-size:0.72rem;">' + bilgi.kaplama + '</div>';
    html += '</div>';

    // Fiyat farki
    html += '<div class="cam-sutun-fiyat">';
    if (bilgi.fiyatFarki === 0) {
      html += '<div class="fiyat-farki baz">Baz Fiyat</div>';
      html += '<div class="fiyat-aciklama">Standart cam dahil</div>';
    } else {
      html += '<div class="fiyat-farki artis">+' + formatParaTL(bilgi.fiyatFarki) + '</div>';
      html += '<div class="fiyat-aciklama">Standart cama ek</div>';
    }
    html += '</div>';

    html += '</div>'; // cam-sutun
  }

  html += '</div>'; // grid
  html += '</div>'; // cam-karsilastirma

  container.innerHTML = html;
}

function _hesaplaOnerilen() {
  if (!mevcutRecete || !mevcutRecete.uzak) return "1.56";
  var sphMax = Math.max(
    Math.abs(parseFloat(mevcutRecete.uzak.sag.sph) || 0),
    Math.abs(parseFloat(mevcutRecete.uzak.sol.sph) || 0)
  );
  var cylMax = Math.max(
    Math.abs(parseFloat(mevcutRecete.uzak.sag.cyl) || 0),
    Math.abs(parseFloat(mevcutRecete.uzak.sol.cyl) || 0)
  );
  if (sphMax >= 6.00) return "1.74";
  if (sphMax >= 4.00 || cylMax >= 2.50) return "1.67";
  if (sphMax >= 2.00 || cylMax >= 1.50) return "1.60";
  return "1.56";
}
```

**Step 2: Commit**
```bash
git add progresif-oneri/js/recete.js
git commit -m "feat: cam karsilastirma tablosu JS fonksiyonlari"
```

---

### Task 5: SW Cache Version Guncelle

**Files:**
- Modify: `progresif-oneri/sw.js` — CACHE_NAME

**Step 1: v9 -> v10**
```javascript
var CACHE_NAME = "kepekci-optik-v10";
```

**Step 2: Commit**
```bash
git add progresif-oneri/sw.js
git commit -m "chore: sw cache v9 -> v10"
```

---

### Task 6: Preview Test

**Step 1:** Preview server baslatilir veya mevcut server reload edilir
**Step 2:** SW unregister + cache clear + hard reload
**Step 3:** Test senaryolari:
- Dusuk numara (SPH 1.00) yukle -> Kademe 1 cam oneri karti gorunur, "Karsilastir" butonu var
- "Karsilastir" butonuna tikla -> 4 sutunlu tablo acilir, 1.56 "ONERILEN" badge'i ile vurgulanir
- Tekrar tikla -> tablo kapanir
- Orta numara (SPH 3.00) yukle -> 1.60 "ONERILEN" olarak vurgulanir
- Yuksek numara (SPH 5.00) yukle -> 1.67 "ONERILEN"
- Mobil (375px) kontrol -> 2x2 grid
- Konsol hatasi: 0

**Step 4: Final commit + push**
```bash
git push
```
