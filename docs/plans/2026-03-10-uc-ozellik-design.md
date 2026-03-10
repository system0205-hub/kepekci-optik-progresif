# Uc Ozellik Tasarim Dokumani
Tarih: 2026-03-10

## Ozellik 1: Cam Karsilastirma Tablosu

### Amac
Musteriye farkli cam indekslerini yan yana gostererek upsell yapmak.

### Konum ve Tetiklenme
- Cam oneri kartinda "Karsilastir" butonu eklenir
- Tiklaninca fiyat kartinin altinda akordeon seklinde acilir
- Tekrar tiklaninca kapanir

### Icerik (her indeks icin bir sutun)
Sutunlar: 1.56 / 1.60 / 1.67 / 1.74 (mevcut olanlara gore)
Her sutunda:
- Indeks numarasi
- Inceltme yuzdesi (%20, %35, %50, %60)
- Kalinlik gorseli (bar/progress seklinde — ince vs kalin)
- Agirlik (hafif/orta/agir)
- Kaplama: antirefle, UV, mavi isik filtre bilgisi
- Fiyat farki: "+XXX TL" (tahmini, baz indeks 1.56'ya gore)
- Onerilen indeks yesil border ile vurgulanir

### Veri Kaynagi
- Indeks bilgileri: sabit mapping (1.56->%20, 1.60->%35, vb.)
- Fiyat farklari: data.js'deki LENS_DATABASE veya sabit tahmini farklar
- Onerilen indeks: camOneriKartiniDoldur()'dan mevcut hesaplama

### Dosyalar
- recete.html: CSS + container div
- recete.js: camKarsilastirmaTablosuGoster/Gizle fonksiyonlari
- sw.js: cache version++

---

## Ozellik 2: Musteri Veritabani

### Amac
Gelen musterilerin recetesini ve cam secimini kaydetmek, tekrar geldiklerinde gecmisini gormek.

### Mevcut Altyapi
musteri.js (localStorage CRUD) ve musteri-ui.js (liste/detay UI) zaten mevcut.
index.html icinde musteri listesi section'lari var.

### Ek Islevler
- recete.html'de "Musteriyi Kaydet" butonu:
  - Hasta ad, TC, recete numaralari, tarih
  - Onerilen cam indeksi
  - Secilen fiyat (musteriOder + ekCamUcreti)
  - localStorage'a musteriKaydet() ile kaydedilir
- Musteri detay sayfasinda gecmis receteler listesi
- TC veya isimle arama

### Veri Yapisi (localStorage)
```
{
  id: "m_1710000000",
  ad: "MEHMET YILMAZ",
  tc: "12345678901",
  kayitTarih: "2026-03-10",
  receteler: [
    {
      tarih: "2026-03-10",
      uzak: { sag: {...}, sol: {...} },
      yakin: { sag: {...}, sol: {...} },
      onerilenIndeks: "1.60",
      odemeTutar: 1300,
      notlar: ""
    }
  ]
}
```

### Dosyalar
- recete.js: musteriKaydetButonu fonksiyonu
- recete.html: "Musteriyi Kaydet" butonu + modal/form
- musteri.js: recete ekleme fonksiyonu (musteriReceteEkle)
- musteri-ui.js: recete gecmisi gosterimi
- sw.js: cache version++

---

## Ozellik 3: Cam Fiyat Guncelleme Paneli

### Amac
data.js'deki cam fiyatlarini kod degistirmeden arayuzden guncellemek.

### Erisim
- Yeni sayfa: fiyat-panel.html
- Basit PIN koruması (4-6 haneli sayi, localStorage'da hash olarak saklanir)
- Header nav'a "Fiyat Paneli" linki eklenir

### Calisma Mantigi (Override Sistemi)
- Orijinal data.js DOKUNULMAZ (kaynak dosya korunur)
- Kullanici fiyat degistirdiginde localStorage'a kaydedilir:
  `kepekci_fiyat_override = { "cerceve": 800, "standartCam": 350, ... }`
- Uygulama baslarken: once localStorage kontrol, varsa override kullan, yoksa data.js
- Sifirla butonu: override'lari siler, orijinal fiyatlara doner

### Arayuz
- Mevcut fiyat listesi tablo halinde (cerceve, cam, SGK, indirim)
- Her satirin yaninda "Duzenle" butonu
- Inline edit: degeri degistir, "Kaydet" bas
- Degistirilmis fiyatlar turuncu arka planla isaretlenir
- "Tum Fiyatlari Sifirla" butonu

### Dosyalar
- fiyat-panel.html: yeni sayfa (HTML + CSS + JS)
- recete.js: FIYATLAR objesini localStorage override ile baslatma
- sw.js: yeni sayfa cache'e eklenir + version++

---

## Uygulama Sirasi
1. Cam Karsilastirma Tablosu (en hizli, satisa direkt etki)
2. Fiyat Guncelleme Paneli (operasyonel ihtiyac)
3. Musteri Veritabani (mevcut altyapi uzerine gelistirme)
