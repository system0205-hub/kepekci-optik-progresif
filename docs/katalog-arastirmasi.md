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

---

# 🔴 NOVAX — FARKLI KORİDOR ÖLÇÜM SİSTEMİ (SİPARİŞ HATASI RİSKİ)

Novax kataloğu s.51 "Progresif/Degresif Gravürlerin Anlamı" tablosu:

| Sembol | Novax "koridor yüksekliği" | Novax "montaj yüksekliği" |
|---|---|---|
| D | 5 mm | 14 mm |
| E | 7 mm | 16 mm |
| F | 9 mm | 18 mm |
| A | 11 mm | 20 mm |
| G | 12 mm | 21 mm |

**Novax'ta montaj yüksekliği = koridor + 9.**
Sektör standardı ise montaj yüksekliği = koridor + 4 (araştırmayla doğrulandı).

Yani Novax "koridor" derken diğer üreticilerden FARKLI bir şey ölçüyor.

## Dönüşüm formülü (tabloyla birebir doğrulandı)

    Diğer markaların koridoru = Novax koridoru + 5

| Novax | Karşılığı | Kontrol: montaj yüks. |
|---|---|---|
| D = 5 | 10 mm | 10+4 = 14 ✓ |
| E = 7 | 12 mm | 12+4 = 16 ✓ |
| F = 9 | 14 mm | 14+4 = 18 ✓ |
| A = 11 | 16 mm | 16+4 = 20 ✓ |
| G = 12 | 17 mm | 17+4 = 21 ✓ |

Beş satırın beşi de tutuyor.

## RİSK

Motor 16 mm koridor önerdiğinde, Novax'a "16" denirse Novax bunu kendi
skalasında arar; 16'ya en yakın sembolü (G=12'nin üstü) sanır.
DOĞRUSU: 16 mm = Novax **A** sembolü = Novax skalasında 11.
5 mm'lik sapma = yanlış cam = geri dönüşü olmayan zarar.

`data.js`'de Novax'ın 28 modelinin tamamında `koridorlar: []` boş olduğu için
sistem şu an bu konuda hiçbir uyarı vermiyor.

## Katalogdan okunan Novax model koridorları (Novax skalasında)

| Model | Novax skalası | Dönüşümlü (diğer markalar gibi) |
|---|---|---|
| Synthesis Progresif | 5-7-9-11 | 10-12-14-16 |
| Synthesis Ofis | 5 | 10 |
| Synthesis Anti-fatigue | 7 | 12 |
| Nucleo Progresif | 7-9-11 | 12-14-16 |
| Nexus 4D | 5-7-9-11 | 10-12-14-16 |
| Trion 3D | 5-7-9-11 | 10-12-14-16 |
| Nucleo Ofis | 5-9 | 10-14 |
| Nucleo Drive/Sport/Pilot | 7-9 | 12-14 |
| Nucleo Anti-fatigue | 9 | 14 |
| Matrix HD | 5-7-9-11 | 10-12-14-16 |
| Genius | 7-9-11 | 12-14-16 |
| Ventro | 7-9-11 | 12-14-16 |
| Novum NG | 7-9-11 | 12-14-16 |
| Sportive | 12 | 17 |
| DriveOn | 12 | 17 |
| Officient | 9 | 14 |
| Serenity | 9 | 14 |

## ⚠️ MUZAFFER BEY'E SORULACAK — veritabanına yazılmadan önce

Novax'a sipariş verirken hangi sayıyı söylüyorsun?
  (a) Novax'ın kendi skalası (5/7/9/11/12 veya D/E/F/A/G sembolü)
  (b) Diğer markalardaki gibi mm (14/16/18)

Cevaba göre `data.js`'e hangi değerlerin yazılacağı ve sipariş ekranında
hangisinin gösterileceği belirlenecek. Doğrulanmadan yazılmadı.

## Ek bulgu — Novax'ta hazır şikayet teşhis tablosu var (s.7-8)

Katalogda "Yakın/Uzak Görüş Problemleri, Nedenleri ve Çözümleri" tabloları var:
belirti → olası neden → çözüm, montaj hatası / reçete hatası ayrımıyla.
Daha önce konuştuğumuz "şikayet teşhis ağacı" özelliği için hazır içerik.

## Ek bulgu — ölü alan verisi (Novax)

Sayısal iddialar mevcut:
- Nucleo 5D Drive: astigmatik etkiyi premium progresiflere göre **%14,6 azaltır**,
  uzak bölge **%70**, uzak-orta bölge **%45** daha geniş.
- Synthesis: istenmeyen astigmatik etkiyi **%20'ye kadar** azaltır.
- Nexus 4D / AmplifEye: uzak, orta veya yakından biri **%30**, üçü birden **%20** genişletilebilir.
- Nucleo 5D kullanıcı anketi: %100 memnun, %94 tüm mesafelerde net, %83 dijital cihazda net.
