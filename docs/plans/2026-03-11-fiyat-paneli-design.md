# Cam Fiyat Guncelleme Paneli — Tasarim

Tarih: 2026-03-11

## Amac
Tum stok cam, cerceve, kontak lens ve ek ucret fiyatlarini kod degistirmeden
arayuzden guncelleyebilmek. Degisiklikler cam karsilastirma tablosuna ve
SGK recete fiyat kartina otomatik yansiyor.

## Erisim ve Guvenlik
- Yeni sayfa: `fiyat-panel.html`
- 4 haneli PIN koruması (ilk giriste PIN olusturulur)
- PIN localStorage'da SHA-256 hash olarak saklanir
- Header nav'a "Fiyat Paneli" linki eklenir

## Arayuz (3 Sekmeli)

### Sekme 1: Stok Cam Fiyatlari
Kategoriler: 1.50 Organik, 1.56 HMC, 1.60 SHMC, 1.67 SHMC, 1.74 SHMC,
1.58 Kirilmaz, 1.56 Fotokromik, 1.56 Blue, 1.60 Blue

Her satirda: Urun adi | Tek cam fiyati | Duzenle butonu
Inline edit: deger degistir → Kaydet bas

### Sekme 2: Cerceve & Ek Ucretler
- Silikon Ekonomik Cerceve: 700 TL
- Metal Ekonomik Cerceve: 900 TL
- SGK Katki: 150 TL
- Magaza Indirimi: 100 TL
- Faset iscilik: 400 TL
- Cam transferi: 200 TL

### Sekme 3: Kontak Lens
Acuve Oasys, Toric, Elegance, Freshlook, AirOptix, Freshcolors

## Veri Yapisi (localStorage)

### Varsayilan fiyatlar: VARSAYILAN_FIYATLAR (kod icinde sabit)
```javascript
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
  cerceve: {
    silikon: 700,
    metal: 900
  },
  ekUcret: {
    sgkKatki: 150,
    magazaIndirimi: 100,
    fasetIscilik: 400,
    camTransferi: 200
  },
  kontakLens: {
    acuveOasys: 1200,
    acuveOasysToric: 1400,
    eleganceComfort: 1000,
    eleganceComfortToric: 1200,
    freshlook: 1000,
    airOptixColors: 1000,
    eleganceFreshcolors: 800
  }
};
```

### Override sistemi
- Kullanici degistirdiginde: `localStorage.setItem("kepekci_fiyat_override", JSON.stringify({...}))`
- Sadece degisen fiyatlar override'da saklanir (diff)
- Uygulama baslarken: VARSAYILAN uzerine override merge edilir

## Otomatik Yansima

### recete.js'e etki:
1. `FIYATLAR` objesi → cerceve, standartCam, sgkKatki, magazaIndirimi otomatik guncellenir
2. `CAM_INDEKS_BILGI.fiyatFarki` → paket fiyat farklari (standart pakete gore) otomatik hesaplanir
3. `fiyatKartiniDoldur()` zaten FIYATLAR objesini kullandigi icin otomatik dogru gosterir

### Hesaplama formulleri:
- Paket fiyat = (tekCam * 2) + cerceve - sgkKatki
- Standart paket = 1.50 organik 4/2 paket fiyati
- Fiyat farki = ilgili indeks paket fiyati - standart paket fiyati

## Dosyalar
- `fiyat-panel.html`: Yeni sayfa (HTML + CSS + JS, inline)
- `js/recete.js`: FIYATLAR objesini localStorage override ile baslatma + VARSAYILAN_FIYATLAR sabiti
- `recete.html`: Nav'a "Fiyat Paneli" linki eklenir
- `sw.js`: fiyat-panel.html cache'e eklenir + version++
