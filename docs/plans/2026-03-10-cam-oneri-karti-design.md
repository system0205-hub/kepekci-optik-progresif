# Cam Oneri Karti - Tasarim Dokumani

## Amac
Recete numarasina gore cam inceltme onerisi gosteren premium gradient kart. Fiyat kartinin hemen ustunde yer alir. Her zaman ust segment cama yonlendirme amaci tasir (upsell).

## Konum
Fiyat kartinin (`#fiyat-kart`) hemen ustunde, ayri bir kart olarak.

## Kademe Sistemi

### Kademe 1 — Dusuk Numara (SPH < 2.00)
- **Indeks:** 1.56 (%20 Inceltme)
- **Gradient:** Yumusak amber/altin (sakin ama dikkat cekici)
- **Mesaj:** "Gorus kalitenizi artirmak icin antirefle kaplama ve mavi isik filtreli cam onerilir"
- **Amac:** Standart cam yeterli demeden, filtreli + antirefle gibi ek ozelliklerle ust gruba yonlendirme

### Kademe 2 — Orta Numara (SPH 2.00-3.99)
- **Indeks:** 1.60 (%35 Inceltme)
- **Gradient:** Turuncu (orta seviye vurgu)
- **Mesaj:** "Numaraniza uygun inceltilmis cam ile daha ince ve estetik bir gorunum elde edin"

### Kademe 3 — Yuksek Numara (SPH >= 4.00)
- **Indeks:** 1.67 (%50) veya 1.74 (%60 Inceltme)
- **Gradient:** Kirmizi/koyu (guclu vurgu)
- **Mesaj:** "Yuksek numaraniz icin inceltilmis cam siddetle tavsiye edilir — daha hafif, daha ince gozluk deneyimi"

## Gorsel Yapi
```
+--[ Cam Oneri Karti ]----------------------------------+
|  (gradient arka plan - kademeye gore degisir)          |
|  ICON  Cam Onerisi: 1.XX Indeks   [%XX Inceltme]     |
|  alt mesaj (kademeye gore)                            |
+-------------------------------------------------------+
```

- Ikon: diamond (U+1F48E)
- Indeks + inceltme yuzde badge (beyaz arka plan, yuvarlak)
- Alt mesaj: italik, kucuk font
- Kart: border-radius, box-shadow, beyaz yazi

## Hesaplama Mantigi
Mevcut `hesaplaIndeksOnerisi(recete)` fonksiyonu (engine.js:919-927) kullanilir:
- SPH >= 6.00 -> 1.74
- SPH >= 4.00 || CYL >= 2.50 -> 1.67
- SPH >= 2.00 || CYL >= 1.50 -> 1.60
- Diger -> 1.56

Indeks -> inceltme yuzde eslestirmesi:
- 1.56 -> %20
- 1.60 -> %35
- 1.67 -> %50
- 1.74 -> %60

## Degistirilecek Dosyalar
1. `progresif-oneri/js/recete.js` — Oneri karti olusturma fonksiyonu
2. `progresif-oneri/recete.html` — CSS stilleri
3. `progresif-oneri/sw.js` — Cache version guncelleme
