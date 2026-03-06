# Telefon Kamera PD Olcum Kalibrasyonu - Tasarim

## Problem
Kameradan PD olcum sistemi laptop icin optimize edilmis. Telefonda:
- Kamera goruş acisi (HFOV) farkli: laptop ~70°, telefon ~78°
- Kullanici telefonu daha yakindan tutuyor (~20cm vs laptop ~45cm)
- Yanlis HFOV → yanlis mesafe tahmini → yanlis PD degeri

## Cozum: 3 Katmanli Yaklasim

### 1. Otomatik HFOV Algilama
- `navigator.userAgent` ile mobil cihaz tespiti
- Mobil: HFOV = 78° (iPhone/Android on kamera ortalamasi)
- Desktop: HFOV = 70° (mevcut deger)
- `mesafeTahminEt()` fonksiyonu dinamik HFOV kullanacak

### 2. Gelismis Mesafe Rehberi
- Buyuk, belirgin mesafe gostergesi
- Renk kodlari: kirmizi (<30cm), sari (30-35cm), yesil (35-50cm), sari (>50cm)
- Telefonda min mesafe 30cm, laptop'ta 35cm
- Yuz boyutu rehberi: ideal mesafede yuzun kapsadigi alan yuzdesini kontrol et

### 3. Otomatik Yakalama
- Mesafe ideal araliga girdiginde 3 saniye geri sayim baslat
- Geri sayim sirasinda mesafe idealden cikarsa sifirla
- Tamamlandiginda otomatik kare yakala
- Animasyonlu geri sayim gostergesi

## Degistirilecek Dosya
- `progresif-oneri/js/kamera-olcum.js` (tek dosya)

## Mevcut Fonksiyonlar (yeniden kullanilacak)
- `mesafeTahminEt(irisCapPx, videoGenislik)` - HFOV parametresi eklenecek
- `mesafeDurumu(mesafeCm)` - mobil esik degerleri eklenecek
- `canliAlgilamaBaslat()` - geri sayim ve oto-yakalama mantigi eklenecek
- `kareCek()` - geri sayim tamamlandiginda tetiklenecek

## Dogrulama
1. Dev server'da laptop ile test: mevcut PD dogru cikmali (regresyon yok)
2. Preview'da mobil viewport ile test: HFOV 78° kullanildigini dogrula
3. Mesafe gostergesi renk gecislerini gorsel olarak dogrula
4. Geri sayim mantigi: ideal mesafede baslamali, cikildiginda sifirlanmali
