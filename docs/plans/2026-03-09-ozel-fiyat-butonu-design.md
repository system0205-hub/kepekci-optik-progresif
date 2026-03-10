# Özel Fiyat Butonlu Kampanya Sistemi

## Problem
Mevcut özel fiyat kutusu sadece input + `onchange` ile çalışıyor. Buton yok, görsel geri bildirim zayıf. Kullanıcı neyi yaptığını net görmüyor.

## Tasarım

### Özel Fiyat Kutusu (recete.html)
Mevcut sarı kutunun içine:
- 🏷️ ikon + "Özel Fiyat:" label + input (mevcut)
- **"Uygula" butonu** (yeşil, input'un yanında)
- **"Temizle" butonu** (gri, küçük, sadece fiyat uygulandığında görünür)

### Fiyat Tablosu Değişikliği
"Uygula" butonuna basınca:
1. Standart fiyat satırları **olduğu gibi kalır** (çerçeve, cam, SGK, indirim, alt toplamlar)
2. Footer'ın hemen üstüne yeni bir **"Mağaza Özel Fiyatı"** kampanya satırı eklenir (yeşil badge)
3. Footer'daki **toplam tutar özel fiyatı gösterir** (renk sarıya döner)

### Temizle
"Temizle" butonu → kampanya satırı kaybolur → toplam standart fiyata döner → input temizlenir

### Mobil/Tablet
- Butonlar input ile aynı satırda, flex-wrap ile küçük ekranlarda alta geçer
- Dokunma hedefleri min 44px

## Dosyalar
- `progresif-oneri/recete.html` — Özel fiyat kutusuna butonlar ekle, kampanya satırı için placeholder
- `progresif-oneri/js/recete.js` — `ozelFiyatGuncelle()` fonksiyonunu güncelle (butonlu + kampanya satırı)
- `progresif-oneri/sw.js` — Cache bump v6
