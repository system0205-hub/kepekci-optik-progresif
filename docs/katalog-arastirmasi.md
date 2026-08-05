# Katalog Araştırması — Koridor ve Ölü Alan Verileri

**Tarih:** 5 Ağustos 2026
**Amaç:** `data.js`'deki eksik koridor verilerini kataloglardan tamamlamak +
paket kademesine göre ölü alan (periferik bozulma) karşılaştırması için gerçek veri aramak.

---

## Durum tablosu

| Katalog | Sayfa | Tarandı | Koridor verisi | Ölü alan verisi |
|---|---|---|---|---|
| Tora | 10 | ✅ | ✅ alındı | ✅ yıldız derecelendirme |
| Visionart | 20 | ✅ | ✅ alındı (kısmen) | ⚠️ sadece karşılaştırma fotoğrafı |
| Kodak | 26 | ❌ | — | — |
| Nikon | 38 | ❌ | — | — |
| Novax | 59 | ❌ | — | — |
| Opak Lens | 48 | ❌ | — | — |

---

## Tora (tamamlandı)

**Koridorlar** (montaj şemaları, s.8-10) — `data.js` ile uyumlu, değişiklik gerekmedi:
- Brava Exclusive **17mm** / Brava Exclusive Short **15mm** → `[15, 17]` ✓
- Astina **17mm** / Astina Short **15mm** → `[15, 17]` ✓
- Samira **17mm** → `[17]` ✓

**Ölü alan verisi** — üreticinin 6 boyutlu yıldız derecelendirmesi (s.3-5):

| Boyut | Brava (premium) | Astina (orta) | Samira (başlangıç) |
|---|---|---|---|
| Kolay Adaptasyon | 4 | 4 | 3 |
| Geniş Görüş | 5 | 4 | 3 |
| İç Mekan | 4 | 4 | 3 |
| **Yanal Alanların İyileştirilmesi** | **5** | **4** | **3** |
| Dinamik Görüş | 4 | 4 | 3 |
| Kontrast | 5 | 4 | 3 |

"Yanal alanların iyileştirilmesi" = periferik bozulma azaltma = aradığımız ölü alan göstergesi.

---

## Visionart (tamamlandı)

**Koridorlar** (montaj şemaları, s.12-15). `data.js`'de hepsi `[]` boştu:

| Model | Katalog | data.js'e eklendi |
|---|---|---|
| Intuitiv Max 17 / Mio 15 / Mini 15 | net | ✅ `[15, 17]` |
| Sirus Max 18 / Mio 16 / Mini 16 | net | ✅ `[16, 18]` |
| Quadro 18 / Mini 16 | net | ✅ `[16, 18]` |
| **Anateo Max 17-13 / Mio 16-12 / Mini 15-11** | ⚠️ **belirsiz** | ❌ eklenmedi |
| **Extenso Dijital 4-8-12** | ⚠️ **belirsiz** | ❌ eklenmedi |

### ⚠️ Muzaffer Bey'e sorulacak
Anateo ve Extenso şemalarında **iki sayı yan yana** yazıyor (17 ve 13 gibi, farkları hep 4).
Diğer modellerde tek sayı var. Hangisi koridor uzunluğu?
Olasılık: büyük sayı = montaj haçından yakın referansa, küçük sayı = uzak referanstan yakın referansa
(ya da tersi). Doğrulanmadan veritabanına yazılmadı.

**Uyum garantisi** (s.19) — `data.js` ile uyumlu ✓
"100% uyum garantisi: Intuitiv Max, Anateo Max ve Sirus Max ürünlerinde geçerlidir."
Quadro ve Extenso kapsam dışı. Veritabanında doğru girilmiş.

**Ölü alan verisi:** Yıldız derecelendirmesi yok. Her premium model için
"Standart Progresif vs [model]" karşılaştırma fotoğrafı var (s.4-7) — niteliksel.

**Bonus:** s.10'da gerçek cam kalınlık tablosu var (-4.00D 80ø ve +4.00D 65ø için
1.5/1.6/1.67/1.74 kenar ve merkez kalınlıkları). İleride "kalınlık kesiti" özelliği
yapılırsa gerçek veri burada.

---

## Kalan iş

1. **Kodak, Nikon, Novax, Opak kataloglarını tara** (171 sayfa).
   Öncelik: **Novax** — 28 modelin tamamında `koridorlar: []` boş.
2. Anateo/Extenso belirsizliğini Muzaffer Bey'e doğrulat.
3. Toplanan ölü alan verileriyle paket karşılaştırma görseli yap.

## Araştırma notu (web)

- Koridor tanımı doğrulandı: montaj haçı ile yakın görüş referans noktası arası dikey mesafe.
- Minimum odak yüksekliği = koridor + 4mm → sektör standardı, motor doğru uyguluyor.
- Okuma alanı en az 4-5mm olmalı → motorun eşikleri doğru.
- ⚠️ Üreticilerin yayınladığı ISO silindir haritaları plano +2.00 ADD üzerine kurulu;
  gerçek reçetelerde tasarımın davranışını yansıtmıyor. Yani harita bulunsa bile
  hastaya özel kesin sonuç vermez.
- Minkwitz doğrulandı: istenmeyen astigmat, güç değişim hızının 2 katı hızla artar.
  Premium tasarım bunu **azaltmaz, yeniden dağıtır** — kritik bölgelerden uzağa iter.
