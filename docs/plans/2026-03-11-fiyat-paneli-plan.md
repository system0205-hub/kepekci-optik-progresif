# Cam Fiyat Guncelleme Paneli — Uygulama Plani

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** PIN korumali admin sayfasi ile tum stok cam, cerceve, kontak lens fiyatlarini arayuzden guncelleyebilmek. Degisiklikler recete sayfasina otomatik yansiyor.

**Architecture:** Yeni `fiyat-panel.html` sayfasi, inline CSS+JS. Varsayilan fiyatlar kod icinde sabit, kullanici degistirdiklerinde localStorage'a override olarak kaydedilir. recete.js baslarken override'lari merge ederek FIYATLAR + CAM_INDEKS_BILGI gunceller.

**Tech Stack:** Vanilla JS, localStorage, inline CSS/JS (no framework)

---

### Task 1: VARSAYILAN_FIYATLAR Sabiti ve Override Merge (recete.js)

**Files:**
- Modify: `progresif-oneri/js/recete.js:1-15` (FIYATLAR objesinden once)

**Step 1: VARSAYILAN_FIYATLAR sabitini ekle (dosya basina)**

```javascript
// ============================================================
// VARSAYILAN FIYATLAR (stok fiyat listesi 01.03.2025)
// ============================================================
var VARSAYILAN_FIYATLAR = {
  stokCam: {
    "1.50_organik_65_70_4_2": 250,
    "1.56_hmc_65_70_4_2": 500,
    "1.56_hmc_65_70_4_4": 700,
    "1.56_hmc_55_4_2": 800,
    "1.56_hmc_55_4_4": 1000,
    "1.60_shmc_70_75_6_2": 900,
    "1.60_shmc_70_75_6_4": 1000,
    "1.67_shmc_70_75_8_2": 1400,
    "1.67_shmc_70_75_8_4": 2000,
    "1.74_shmc_70_75_10_2": 2200,
    "1.74_shmc_70_75_10_4": 2800,
    "1.58_kirilmaz_65_70_4_2": 1000,
    "1.58_kirilmaz_65_70_4_4": 1300,
    "1.56_fotokromik_65_70_4_2": 1000,
    "1.56_fotokromik_65_70_4_4": 1300,
    "1.56_blue_65_70_4_2": 1000,
    "1.56_blue_65_70_4_4": 1300,
    "1.60_blue_70_75_6_2": 1400,
    "1.60_blue_70_75_6_4": 1700
  },
  cerceve: { silikon: 700, metal: 900 },
  ekUcret: { sgkKatki: 150, magazaIndirimi: 100, fasetIscilik: 400, camTransferi: 200 },
  kontakLens: {
    acuveOasys: 1200, acuveOasysToric: 1400,
    eleganceComfort: 1000, eleganceComfortToric: 1200,
    freshlook: 1000, airOptixColors: 1000, eleganceFreshcolors: 800
  }
};
```

**Step 2: fiyatlariYukle() fonksiyonu ekle (VARSAYILAN_FIYATLAR'dan hemen sonra)**

```javascript
function fiyatlariYukle() {
  // localStorage'dan override'lari al
  var override = {};
  try {
    var raw = localStorage.getItem("kepekci_fiyat_override");
    if (raw) override = JSON.parse(raw);
  } catch(e) { /* ignore */ }

  // Deep merge: varsayilan + override
  var f = JSON.parse(JSON.stringify(VARSAYILAN_FIYATLAR));
  for (var kat in override) {
    if (f[kat]) {
      for (var key in override[kat]) {
        f[kat][key] = override[kat][key];
      }
    }
  }

  // FIYATLAR objesini guncelle
  FIYATLAR.cerceve = f.cerceve.silikon;
  FIYATLAR.standartCam = f.stokCam["1.50_organik_65_70_4_2"] * 2;
  FIYATLAR.sgkKatki = f.ekUcret.sgkKatki;
  FIYATLAR.magazaIndirimi = f.ekUcret.magazaIndirimi;
  FIYATLAR.musteriOder = FIYATLAR.cerceve + FIYATLAR.standartCam - FIYATLAR.sgkKatki - FIYATLAR.magazaIndirimi;

  // CAM_INDEKS_BILGI fiyat farklarini guncelle
  var standartPaket = (f.stokCam["1.50_organik_65_70_4_2"] * 2) + f.cerceve.silikon - f.ekUcret.sgkKatki;
  var idx56paket = (f.stokCam["1.56_hmc_65_70_4_2"] * 2) + f.cerceve.silikon - f.ekUcret.sgkKatki;
  var idx60paket = (f.stokCam["1.60_shmc_70_75_6_2"] * 2) + f.cerceve.silikon - f.ekUcret.sgkKatki;
  var idx67paket = (f.stokCam["1.67_shmc_70_75_8_2"] * 2) + f.cerceve.silikon - f.ekUcret.sgkKatki;
  var idx74paket = (f.stokCam["1.74_shmc_70_75_10_2"] * 2) + f.cerceve.silikon - f.ekUcret.sgkKatki;

  CAM_INDEKS_BILGI["1.56"].fiyatFarki = idx56paket - standartPaket;
  CAM_INDEKS_BILGI["1.60"].fiyatFarki = idx60paket - standartPaket;
  CAM_INDEKS_BILGI["1.67"].fiyatFarki = idx67paket - standartPaket;
  CAM_INDEKS_BILGI["1.74"].fiyatFarki = idx74paket - standartPaket;

  return f;
}
```

**Step 3: Sayfa yuklendiginde fiyatlariYukle() cagir**

Mevcut DOMContentLoaded veya init fonksiyonunda `fiyatlariYukle()` cagrisini ekle.

**Step 4: Syntax kontrolu**

Run: `node -c progresif-oneri/js/recete.js`
Expected: No error

**Step 5: Commit**

```bash
git add progresif-oneri/js/recete.js
git commit -m "feat: VARSAYILAN_FIYATLAR sabiti ve localStorage override merge"
```

---

### Task 2: fiyat-panel.html Sayfa Iskeleti + PIN Ekrani

**Files:**
- Create: `progresif-oneri/fiyat-panel.html`

**Step 1: Temel HTML iskeleti + PIN giris ekrani**

Icerik:
- recete.html ile ayni header tasarimi (Kepekci Optik baslik, nav linkler)
- PIN giris modal: 4 haneli input + "Giris" butonu
- Ilk kullanim: "PIN olustur" modu (2 kez gir, onaylansin)
- PIN dogrulama: SHA-256 hash karsilastirmasi (crypto.subtle.digest)
- Basarili giriste panel acilir
- CSS: header, PIN ekrani, tab yapisi

**Step 2: 3 sekmeli tab yapisi (bos icerik)**

- Sekme 1: "Stok Cam" (active)
- Sekme 2: "Cerceve & Ek"
- Sekme 3: "Kontak Lens"
- Tab degistirme JS fonksiyonu

**Step 3: Test**

Tarayicida `fiyat-panel.html` ac.
- PIN ekrani gorunmeli
- 4 hane gir → panel acilmali
- Sekmeler degismeli

**Step 4: Commit**

```bash
git add progresif-oneri/fiyat-panel.html
git commit -m "feat: fiyat paneli PIN ekrani ve tab iskeleti"
```

---

### Task 3: Sekme 1 — Stok Cam Fiyat Tablosu

**Files:**
- Modify: `progresif-oneri/fiyat-panel.html`

**Step 1: Stok cam kategorilerini tablo olarak render et**

VARSAYILAN_FIYATLAR.stokCam verisini kullanarak:
- Kategori basliklari: 1.50 Organik, 1.56 HMC, 1.60 SHMC, 1.67 SHMC, 1.74 SHMC, 1.58 Kirilmaz, 1.56 Fotokromik, 1.56 Blue, 1.60 Blue
- Her satirda: urun adi | mevcut fiyat | "Duzenle" butonu
- Duzenle tiklaninca: fiyat alani input'a donusur + "Kaydet" + "Iptal" butonlari
- Kaydet tiklaninca: localStorage override'a yaz, satir turuncu isaretlenir
- Override olan satirlar turuncu arka plan ile gosterilir

**Step 2: "Tum Cam Fiyatlarini Sifirla" butonu**

Override'dan stokCam anahtarini siler, tablou yeniden render eder.

**Step 3: Commit**

```bash
git commit -am "feat: stok cam fiyat tablosu (sekme 1)"
```

---

### Task 4: Sekme 2 — Cerceve & Ek Ucretler

**Files:**
- Modify: `progresif-oneri/fiyat-panel.html`

**Step 1: Cerceve ve ek ucret satirlarini render et**

Ayni inline edit mantigi:
- Silikon Cerceve, Metal Cerceve
- SGK Katki, Magaza Indirimi
- Faset Iscilik, Cam Transferi

**Step 2: Commit**

```bash
git commit -am "feat: cerceve ve ek ucretler tablosu (sekme 2)"
```

---

### Task 5: Sekme 3 — Kontak Lens

**Files:**
- Modify: `progresif-oneri/fiyat-panel.html`

**Step 1: Kontak lens satirlarini render et**

Ayni inline edit mantigi: Acuve, Elegance, Freshlook, AirOptix, Freshcolors

**Step 2: Commit**

```bash
git commit -am "feat: kontak lens tablosu (sekme 3)"
```

---

### Task 6: Nav Linki + SW Cache

**Files:**
- Modify: `progresif-oneri/recete.html:1110-1116` (nav)
- Modify: `progresif-oneri/sw.js:2-25` (CACHE_NAME + OFFLINE_URLS)

**Step 1: recete.html nav'a "Fiyat Paneli" linki ekle**

```html
<a href="fiyat-panel.html">Fiyat Paneli</a>
```

SGK Recete'den sonra, Olcum Rehberi'nden once.

**Step 2: sw.js guncelle**

- CACHE_NAME: "kepekci-optik-v11" → "kepekci-optik-v12"
- OFFLINE_URLS'e `"./fiyat-panel.html"` ekle

**Step 3: Commit**

```bash
git add progresif-oneri/recete.html progresif-oneri/sw.js
git commit -m "feat: fiyat paneli nav linki + SW cache v12"
```

---

### Task 7: Entegrasyon Testi + Push

**Step 1: Preview'da fiyat-panel.html ac**
- PIN gir, panel acilsin
- Stok cam tablosu dogru fiyatlari gostermeli

**Step 2: Bir fiyat degistir (orn 1.56 HMC 500→600)**
- Kaydet tikla, satir turuncu olmali

**Step 3: recete.html'e gec, recete gir**
- Fiyat kartinda guncellenmis fiyat gorunmeli
- Cam karsilastirma tablosunda fiyat farklari dogru olmali

**Step 4: "Sifirla" tikla → orijinal fiyatlar donmeli**

**Step 5: Push**

```bash
git push
```
