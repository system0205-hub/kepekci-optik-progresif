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
| **Novax** | **59** | **✅** | **✅ alındı (19 model)** | **✅ sayısal iddialar** |
| **Kodak** | **26** | **✅** | **✅ eşel sayfaları — veritabanı zaten doğruydu** | ⚠️ yıldız derecelendirme |
| **Nikon** | **38** | **✅** | **✅ doğrulandı (10/12/14)** | **✅ sayısal iddialar** |
| **Opak Lens** | **48** | **✅** | **✅ doğru — terim farkı çözüldü** | ⚠️ yıldız derecelendirme |

**Altı kataloğun altısı da tarandı. Toplam 260 sayfa.**

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
| **Anateo Max 17 / Mio 16 / Mini 15** | ✅ **çözüldü** | ✅ `[15, 16, 17]` |
| **Extenso Dijital 12** | ✅ **çözüldü** | ✅ `[12]` |

### ✅ Anateo / Extenso belirsizliği çözüldü (6 Ağustos 2026)

Anateo şemasında (s.13) iki sayı yan yana yazıyor: Max **17-13**, Mio **16-12**,
Mini **15-11**. Farkları hep tam **4**. Extenso'da (s.15) üç sayı: **4 / 8 / 12** —
yine 12 = 8 + 4.

**Bu 4 mm, montaj haçı ile prizma referans noktası (PRP) arasındaki mesafedir.**
Kodak kataloğu bunu açıkça yazıyor: *"Fitting Cross Above PRP: 4 mm"*.
Yani iki sayı aynı mesafenin iki farklı başlangıç noktasından ölçülmüş hali:

- **Büyük sayı** = montaj haçından yakın referansa → **sektörün koridor tanımı**
- Küçük sayı = 4 mm aşağıdaki PRP'den yakın referansa

**Teyit:** Intuitiv, Sirus ve Quadro şemalarında tek sayı var ve o sayı "0" çizgisinden
(montaj haçı) ölçülüyor — veritabanında zaten öyle girilmişti ve doğruydu.
Anateo aynı yapıyı iki sayıyla gösteriyor, o kadar.

Muzaffer Bey'in tahmini de aynı yöndeydi: *"Anateo katalogda koridorları da yazılmış
ama o da bence aynıdır."*

**Ayrıca düzeltildi:** Visionart'ın `minFittingHeight` değerleri koridorlarıyla
uyumsuzdu (Intuitiv koridor 15 ama minFH 14 yazıyordu). Katalog Visionart için minFH
yayınlamadığından motorun kendi kuralı uygulandı: **en kısa koridor + 4**.
Intuitiv 19, Anateo 19, Sirus 20, Quadro 20, Extenso 16.

**Uyum garantisi** (s.19) — `data.js` ile uyumlu ✓
"100% uyum garantisi: Intuitiv Max, Anateo Max ve Sirus Max ürünlerinde geçerlidir."
Quadro ve Extenso kapsam dışı. Veritabanında doğru girilmiş.

**Ölü alan verisi:** Yıldız derecelendirmesi yok. Her premium model için
"Standart Progresif vs [model]" karşılaştırma fotoğrafı var (s.4-7) — niteliksel.

**Bonus:** s.10'da gerçek cam kalınlık tablosu var (-4.00D 80ø ve +4.00D 65ø için
1.5/1.6/1.67/1.74 kenar ve merkez kalınlıkları). İleride "kalınlık kesiti" özelliği
yapılırsa gerçek veri burada.

---

# 🟢 KODAK — veritabanı zaten kusursuzdu

Kodak kataloğu s.22-26'da her model için **eşel (montaj şablonu) sayfası** var.
Sektörde bu kadar net teknik veri veren tek katalog bu.

| Model | Minimum Fitting Height | Corridor Length | Min Height to Top Rim | Fitting Cross Above PRP |
|---|---|---|---|---|
| Unique DRO | 14 mm | 13/14/15/16/17/18 mm | 9 mm | 4 mm |
| City Lens | 13 mm | 13/14/16/18 mm **veya Auto Select** | 9 mm | 4 mm |
| Atlas | 14 mm | 13, 14, 16, 18 mm | 9 mm | 4 mm |
| Precise | 18 mm | 17 mm | 9 mm | 4 mm |
| Intro | 19 mm | 18 mm | 9 mm | **2 mm** |

`data.js` ile karşılaştırma: **15/15 alan doğru.** Koridorlar, minFittingHeight ve
uyum garantisi bayrakları katalogla birebir. Değişiklik gerekmedi.

Uyum garantisi (s.21): City Lens PAL, Unique DRO, Atlas, Precise geçerli. Intro **kapsam dışı**.
Veritabanında böyle girilmiş ✓

## Kodak'ta iki not

**1. Precise / Short (13 mm) veritabanında yok.**
s.14: "Küçük çerçeveler için kısa koridor (13mm) seçeneği (Precise / Short)".
Eşel sayfası sadece standart Precise'i (17mm koridor, 18mm MFH) gösteriyor.
Precise'in tek koridoru 17mm ve 18mm montaj istiyor — küçük çerçevede kullanılamaz.
Short varyantı bu boşluğu dolduruyor ama veritabanında `koridorlarShort` alanı boş.
Motor bu alanı zaten okuyabiliyor (engine.js:644), sadece veri yok.

*Not: Aynı cümle Intro sayfasında (s.16) da var ama orada "(Precise / Short)" yazması
kopyala-yapıştır artığı; Intro'nun kendi eşeli 18mm koridor / 19mm MFH diyor.*

**2. Kodak'ın minFH tanımı sektörden farklı.**
Kodak'ta minFH = en kısa koridor **+1**. (DRO 13→14, CityLens 13→13, Atlas 13→14,
Precise 17→18, Intro 18→19.) Sektör/motor kuralı ise koridor **+4**.
Kodak mutlak üretim tabanını yazıyor, konforlu okuma alanını değil.
İkisi çelişmiyor — farklı şeyler. Biri "üretilebilir mi", diğeri "rahat okur mu".

---

# 🟢 NIKON — koridorlar doğrulandı, bir model eksik

Nikon fiyat tablolarının başlığında koridor seçenekleri yazıyor: **10/12/14**.
Altı progresif tablosunun altısında da aynı.

| Katalog sayfası | Model | Koridor | data.js |
|---|---|---|---|
| s.15 | SeeMax Ultimate Z | 10/12/14 | ✓ doğru |
| s.16 | **Presio Ultimate Z** | 10/12/14 | 🔴 **model yok** |
| s.19 | Presio Power Z | 10/12/14 | ✓ doğru |
| s.20 | Presio Balance Z | 10/12/14 | ✓ doğru |
| s.22-23 | Presio First | "Üç farklı koridor mesafesi (10/12/14)" | ✓ doğru |
| s.24 | DigiLife | 10/12/14 | ✓ doğru |
| s.27 | RelaxSee Neo | **koridor başlığı yok** | ⚠️ düzeltildi |

## Düzeltildi — RelaxSee Neo

Veritabanında `[10, 12, 14]` yazıyordu. Kataloğun RelaxSee Neo fiyat tablosunda
(s.27) diğer progresiflerdeki 10/12/14 başlığı **yok**. RelaxSee Neo progresif değil;
"göz yorgunluğunu gideren cam, tüm yaş grupları için" — üst Net Bölge + alt Rahat
Bölge ikiz tasarımı, Air/Lite/Neo/Super destek kademeleri.

Kural: **katalog söylüyorsa yaz, susuyorsa boş bırak.** Novax'ın anti-fatigue
modellerine koridor yazıldı çünkü Novax kataloğu listeliyor; Nikon susuyor, boş bırakıldı.
`koridorlar: []`, `minFittingHeight: null` yapıldı.

## 🔴 Presio Ultimate Z veritabanında yok

Katalog s.14 iki ürünü birlikte anlatıyor (SeeMax Ultimate Z + Presio Ultimate Z),
s.15 ve s.16'da **ayrı fiyat tabloları** var:

| | SeeMax Ultimate Z | Presio Ultimate Z |
|---|---|---|
| 1.50 SeeCoat+UV | 53.000 TL | **28.500 TL** |
| 1.74 Gen S | 100.700 TL | 58.900 TL |
| Fark | — | yaklaşık **yarı fiyat** |

Aynı Z-Contrast tasarımı; SeeMax kişiselleştirilmiş (çerçeve parametreleri +
kontrast algı testi), Presio standart sürümü. Veritabanında sadece pahalı olan var.
Premium isteyen ama bütçesi SeeMax'a yetmeyen hastada bu model kaçırılıyor.

Nikon kataloğunda eşel sayfası yok, minFH verilmiyor. Koridor 10 → sektör kuralıyla
minFH 14. Veritabanındaki 14 değerleri bu yüzden tutarlı.

## Nikon ölü alan verisi (Z Serisi, s.12-13, s.22)

Z Serisi vs standart progresif (Presio First referans alınarak):
- Loş ışıkta **%52**, normal ışıkta **%13** daha fazla kontrast iletimi
- **%42** daha geniş görme alanı (adisyonun %50'sinden tam adisyona kadar, mm²)
- Baş hareketi telafisi: 70 cm'de **%13**, 35 cm'de **%5** azalma

Presio First vs standart cam: uzakta **+%12**, ortada **+%13**, yakında **+%30**
daha geniş görüş; yanal bozulma **%11'e kadar** azalma.

⚠️ Ölçüm koşulu dipnotta: "Plan +2.00, **12 mm koridor**". Yani bu yüzdeler tek bir
koridor/reçete için. Farklı reçetede farklı çıkar.

---

# 🟢 OPAK LENS — terim farkı, ölçek farkı değil

**Sonuç: Opak'ın 14-20 sayıları koridordur. Veritabanı doğru, düzeltme gerekmedi.**

Katalog bu alana **"M. Montaj Yüksekliği"** diyor ve sipariş parametresi olarak da
"montaj yüksekliği" yazıyor. Bu, Novax'taki gibi bir ölçek kayması ihtimalini akla
getirdi — araştırıldı ve **öyle olmadığı** anlaşıldı.

## Kararı belirleyen iki şey

**1. Kataloğun kendi uyarısı (s.28):**

> "Montaj yüksekliği **kesinlikle çerçeve büyüklüğüne göre seçilmemelidir**."

Eğer bu sayı "çerçevede ne kadar yerim var" olsaydı, tam da çerçeve büyüklüğüne göre
seçilirdi. Seçilmemesi söyleniyor ve seçim tablosu **adisyon + toplam diyoptriye**
göre veriliyor. Yani bu, çerçeve ölçüsü değil, reçetenin gerektirdiği bir **tasarım
parametresi** — yani koridor.

**2. Muzaffer Bey'in uygulama teyidi (5 Ağustos 2026):**

> "Bence Opak ile hiç karıştırmayalım, montaj yüksekliği aslında bence onların koridoru."

Opak'a iki şekilde sipariş veriliyor:
- "Odaktan camın bitiş noktasına 25 mm geliyor" → Opak koridoru kendisi seçiyor
- "16 koridor yapalım" → doğru cam geliyor

İkinci yöntemin yıllardır sorunsuz çalışması, Opak'ın 16'sının gerçekten 16 mm koridor
olduğunu gösteriyor. **Motorun koridor değeri Opak'a doğrudan söylenebilir.**

`data.js` değişmedi, motor değişmedi, arayüz değişmedi. Sadece açıklayıcı yorum eklendi.

---

## Aşağıdakiler kayıt için — Opak'ın terminolojisi nasıl işliyor

## Gravür tablosu (s.24)

Katalogda cam üzerindeki rakamın ne anlama geldiği yazıyor:

| İşaret | **M.M.Y.** |
|---|---|
| 4 | 14 mm |
| 5 | 15 mm |
| 6 | 16 mm |
| 7 | 17 mm |
| 8 | 18 mm |
| 9 | 19 mm |
| 0 | 20 mm |

**M.M.Y. = Minimum Montaj Yüksekliği.** Koridor değil.

## Sipariş parametresi

Her Opak modelinin "Gerekli Bilgiler" listesi aynı:

> • Reçete bilgileri • Çerçeve bilgileri • Kişisel parametreler
> • **Montaj yüksekliği** • Çap bilgisi • Kaplama bilgisi

15 modelin 15'inde "Montaj yüksekliği" yazıyor, hiçbirinde "koridor" yazmıyor.
Opak "koridor" kelimesini sadece pazarlama metninde kullanıyor
("7 değişik koridor yapısı"), spec alanında "montaj yüksekliği" diyor.
**Aynı şeyin iki adı.**

## Ultra Short — 10, 11, 12, 13 mm

Küçük çerçeveler için özel tasarım. Koridor ölçeğinde okununca da tutarlı:
10-13 mm gerçekten çok kısa koridorlar, "ultra short" adını hak ediyor.
Standart modeller 14'ten başlıyor, Ultra Short 10'a kadar iniyor.

## Opak'ın kendi tavsiye tablosu (s.28)

**Minimum Montaj Yüksekliği Tavsiye Tablosu** — reçeteye göre hangi MMY seçilmeli:

| Adisyon | Toplam diyoptri -5.00/+5.00 arası | -5.00 üstü | +5.00 üstü |
|---|---|---|---|
| 1.00 – 1.50 | 16 | 15 | 17 |
| 1.75 – 2.50 | 17 | 16 | 18 |
| 2.75 – 3.00 | 18 | 17 | 19 |

Bu tablo motorun yaptığı işin ta kendisi — üreticinin kendi koridor seçim kuralı.
Ve tablo **çerçeve ölçüsünü hiç sormuyor**; sadece reçeteye bakıyor. Katalog bunu
ayrıca yazıyla da vurguluyor ("kesinlikle çerçeve büyüklüğüne göre seçilmemelidir").
Koridor olduğunun en net göstergesi bu.

## 🟡 Motor ile Opak tablosu iki noktada ayrışıyor — kontrol edilmeli

Opak'ın tablosu koridor seçim kuralı olduğuna göre, motorun kararlarıyla
karşılaştırılabilir. İki yerde ters düşüyorlar:

**1. Yüksek hipermetropta yön farkı.**
Opak +5.00 üstü reçetede koridoru bir kademe **uzatıyor** (17-19).
Motor ise "Hipermetrop +5.00 / düşük ADD" senaryosunda **14 mm** veriyor.
Opak aynı vakada 17 diyor. 3 mm fark ve ters yön.
Yüksek miyopta ikisi hemfikir (Opak kısaltıyor, motor da 14 veriyor).

**2. Yüksek adisyonda 2 mm fark.**
Opak ADD 2.75-3.00 için 18 diyor. Motor "Yüksek ADD 3.00 / küçük çerçeve"
senaryosunda 16 veriyor — çünkü çerçeve sınırını da hesaba katıyor.
Opak tablosu çerçeveyi hiç sormadığı için bu fark beklenebilir; motorun
çerçeveyi dikkate alması muhtemelen daha doğru. Yine de kayıt altına alındı.

⚠️ Bunlar **fabrikaya giden sayıyı** ilgilendiriyor. Koridor değer kilidi testi
(21 kontrol) tam da bu değerleri koruyor. Değiştirilmedi — önce Muzaffer Bey'in
yüksek hipermetrop vakalarındaki tecrübesi sorulmalı.

## Opak'ta 6 model veritabanında yok

| Model | M.M.Y. | ADD | Ne işe yarıyor |
|---|---|---|---|
| **Ultra Short** | **10, 11, 12, 13 mm** | 0.50–4.00 | **Küçük çerçeve — progresif kullanamayanlar için** |
| Office Screens | 15 mm | 1.00–3.50 | Meeting (3,5m) / Desktop (1,5m) / Laptop (0,8m) |
| Relax | 16 mm | 0.50/0.75/1.00 | Presbiyop öncesi, 25-45 yaş dijital yorgunluk |
| Driver | 20 mm | 0.75–3.50 | Şoför; yakın alanı yok, ADD %25 düşük üretilir |
| Junior | 14-18 mm | 0.50–4.00 | Çocuk progresif (doktor tavsiyesiyle) |
| Myo Control+ | otomatik | — | Çocukta miyopi kontrolü (Baby/Junior/Teen) |

**Ultra Short en önemlisi.** Uygulama "çerçeve yetersiz" uyarısı verdiğinde
cevabın ta kendisi bu cam ve veritabanında yok.

## Opak'ın sipariş öncesi soru listesi (s.28) — hazır içerik

Katalog "doğru dizayn ve koridor seçimi için" şunların sorulmasını istiyor:

- İlk kullanıcı mı?
- Değilse tek odaklı mı bifokal mi kullanmış?
- Daha önce progresif kullandıysa **hangi dizayn ve koridor**?
- Kullandığı üründen memnun mu? Ne kadar süre kullanmış?
- Yaşam tarzı, meslek, hobi, bilgisayar, araç kullanımı
- ⚠️ **Sağ-sol arasında 1.00 D'den fazla fark varsa, adisyona göre olması
  gerekenden daha KISA montaj yüksekliği seçilmeli**
- ⚠️ **"Montaj yüksekliği kesinlikle çerçeve büyüklüğüne göre seçilmemelidir"**

## 🟡 Opak'ın anizometropi kuralı motorda YOK — kontrol edildi

Opak diyor ki:

> "Sağ – sol göz arasında 1.00 diyoptriden fazla farklılık varsa, adisyona göre
> olması gerekenden **daha kısa** bir montaj yüksekliği seçilmelidir."

**Motorda ne var:** `engine.js:410-418` anizometropi için sadece **uyarı** üretiyor.
sphFark ≥ 2.00 D'de Prentice kuralıyla prizma farkını hesaplayıp yazıyor
(`(idealKoridor / 10) * sphFark`), sphFark ≥ 1.00 D'de "montaj hassasiyeti önemli"
diyor. Koridoru **kısaltmıyor**.

**Optik mantığı:** Anizometropide aşağı bakıldıkça dikey prizmatik dengesizlik artar.
Kısa koridor okuma bölgesini yukarı çeker → daha az aşağı bakış → daha az dengesizlik.
Yani Opak'ın kuralı fizik olarak doğru ve motorun mevcut mantığıyla çelişiyor:
motor yüksek ADD'de koridoru **uzatıyor** (Minkwitz), Opak anizometropide
**kısaltmayı** söylüyor. İkisi aynı hastada çakışabilir.

⚠️ **Bu değişiklik fabrikaya giden sayıyı değiştirir.** Koridor değer kilidi testi
(21 kontrol) tam da bunu koruyor. Muzaffer Bey onayı olmadan dokunulmadı.

---

# ✅ YÜKSEK ARTI NUMARADA KORİDOR — araştırıldı, motor haklı

**Soru:** Opak +5.00 üstü reçetede koridoru uzatıyor (17-19). Motor kısaltıyor (14).
Hangisi doğru?

**Muzaffer Bey'in tecrübesi (6 Ağustos 2026):** *"14 daha iyi gibi."*

**Dış kaynak araştırması bunu doğruluyor. İki bağımsız delil:**

### 1. Prizma yükü — kısa koridor yükü ciddi biçimde azaltıyor

Yayınlanmış hesap: **+6.00 D** reçetede
- **15 mm** koridor → yakın noktada **9Δ** base-up prizma
- **10 mm** koridor → **6Δ** base-up prizma

Yani koridoru 5 mm kısaltmak prizma yükünü **3Δ** düşürüyor. Prentice kuralının
doğrudan sonucu: prizma = (haçtan aşağı mesafe, cm) × (diyoptri). Numara ne kadar
yüksekse mesafenin bedeli o kadar ağır. Yüksek artıda uzun koridor, yakına
bakıldığında dikey dengesizliği büyütüyor.

Bu, motorun anizometropi uyarısındaki Prentice hesabıyla aynı fizik
(`engine.js:414`, `(idealKoridor / 10) * sphFark`).

### 2. Artı camda efektif koridor zaten uzuyor

Üretici tasarım verisi: aynı nominal tasarımda, aynı ADD'de
- miyop set → efektif koridor ≈ **18,25 mm**
- hipermetrop set → efektif koridor ≈ **19,00 mm** (2.00 ADD'de)

Yani artı camda güç, nominal koridordan **daha aşağıda** tamamlanıyor.
Aynı optik davranışı elde etmek için hipermetropta **daha kısa nominal koridor**
seçmek gerekiyor. Bu da motorun yaptığı şey.

### Karar

**Motor değiştirilmedi.** Üç kaynak aynı yönü gösteriyor: hastanın tecrübesi,
prizma hesabı ve üretici tasarım verisi.

Opak'ın tablosu neden ters olabilir: onların başlığı "Minimum **Montaj** Yüksekliği".
Yüksek artı camlar merkezde kalın, kenarda ince — üretim için daha fazla dikey
alan gerekebilir. Yani optik bir koridor kuralı değil, **üretim/blank kısıtı** olması
muhtemel. İki tablo farklı sorulara cevap veriyor olabilir.

**Kaynaklar:**
- [Minkwitz, Mystery and the Madness of Progressive Lenses Part 2 — 20/20 Magazine](https://www.2020mag.com/article/minkwitz-mystery-and-the-madness-of-progressive-lenses-part-2-p2p-012026)
- [Progressive power lenses part 1 — Optician Online](https://www.opticianonline.net/cpd-archive/158)
- [Progressive Lens overview — ScienceDirect Topics](https://www.sciencedirect.com/topics/medicine-and-dentistry/progressive-lens)
- [Optimized Progressive Lens Designs — Optometry Advisor](https://www.optometryadvisor.com/features/different-progressive-lens-designs-may-benefit-different-patients/)

---

# 📊 MARKA KARŞILAŞTIRMASI — herkes farklı şey ölçüyor

Altı kataloğun sonucu: **"koridor" kelimesi markadan markaya farklı şey demek.**
Sipariş verirken hangi sayının hangi ölçek olduğunu bilmek zorunlu.

| Marka | Katalogdaki sayı ne? | Sipariş parametresi | Motorla ilişki |
|---|---|---|---|
| **Kodak** | Koridor uzunluğu (gerçek) | Koridor | ✅ Doğrudan uyumlu |
| **Tora** | Koridor uzunluğu (gerçek) | Koridor | ✅ Doğrudan uyumlu |
| **Visionart** | Koridor uzunluğu (gerçek) | Koridor | ✅ Doğrudan uyumlu |
| **Nikon** | Koridor uzunluğu (gerçek) | Koridor | ✅ Doğrudan uyumlu |
| **Novax** | Kendi gravür kodu (koridor − 5) | Standart mm | ✅ Dönüştürüldü |
| **Opak** | Koridor — ama adı "montaj yüksekliği" | Koridor (ya da ölçülen odak yüksekliği) | ✅ Doğrudan uyumlu |

**Yani ölçek farkı olan tek marka Novax.** Diğer beşinde motorun koridor değeri
doğrudan söylenebilir. Opak'ta sadece kelime farklı: onlar "montaj yüksekliği"
diyor, kastettikleri koridor.

Montaj yüksekliği tanımı da markadan markaya değişiyor:

| Marka | Montaj yüksekliği = koridor + ? | Ne anlatıyor |
|---|---|---|
| Kodak | +1 | Mutlak üretim tabanı |
| Novax | +4 | Konforlu okuma alanı |
| Motor (uygulama) | +4 | Konforlu okuma alanı |
| Opak (tavsiye tablosu) | reçeteye göre 15-19 | Reçete bazlı tavsiye |

Motor Novax'la aynı hizada, Kodak'tan 3 mm daha temkinli. Temkinli olmak güvenli
(daha büyük çerçeve önerir) ama teorik olarak çalışacak bir çerçeveyi reddedebilir.

---

## Kalan iş

~~Katalog tarama~~ ✅ **BİTTİ — altı kataloğun altısı da tarandı (260 sayfa).**

### Muzaffer Bey'e sorulacaklar — 3'ün 3'ü cevaplandı

1. ~~Opak'a hangi sayı söyleniyor?~~ ✅ **Cevaplandı** — Opak'ın "montaj yüksekliği"
   onların koridoru. Ölçek farkı yok, düzeltme gerekmedi.
2. ~~Yüksek hipermetropta koridor uzatılmalı mı?~~ ✅ **Cevaplandı** — kısa doğru.
   Tecrübe + prizma hesabı + üretici tasarım verisi aynı yönde. Motor değişmedi.
3. ~~Visionart Anateo / Extenso~~ ✅ **Çözüldü** — büyük sayı koridor, küçük sayı
   4mm aşağıdaki PRP'den ölçüm. data.js'e yazıldı.
4. FlexiFit / AutoFit sürekli koridor → **firmaya sorulacak** (Muzaffer Bey hallediyor).

### Yapılacak işler

5. **Opak Ultra Short'u veritabanına ekle** (10-13 mm). Uygulama "çerçeve yetersiz"
   dediğinde önerecek cam bu ve şu an yok.
6. Nikon **Presio Ultimate Z**'yi ekle (SeeMax'ın yarı fiyatı, aynı Z tasarımı).
7. Kodak **Precise / Short** 13 mm varyantını `koridorlarShort` alanına ekle.
7. Opak'ın diğer eksik modelleri: Office Screens, Relax, Driver, Junior, Myo Control+.
9. Opak s.28 sipariş öncesi soru listesini motora/arayüze taşı. Özellikle:
   anizometropi >1.00 D ise montaj yüksekliğini kısalt kuralı motorda var mı?
10. Novax şikayet teşhis tablosunu (aşağıda tam metin) uygulamaya al.
11. Toplanan ölü alan verileriyle paket karşılaştırma görseli yap.

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

## ✅ BAĞIMSIZ DOĞRULAMA — formül üreticinin kendi metniyle teyitli

Yukarıdaki dönüşüm tek bir tabloya dayansaydı zayıf olurdu (Novax'ın kendi ofseti
sabit 9 olduğu için beş satır aslında tek bir ilişkiyi tekrarlıyor).
Ancak katalogda **ikinci, bağımsız** bir kanıt var:

**Officient sayfası (katalog s.38):**
> "Yakın görüş noktası göz bebeğinin **14 mm** altında tutulmaktadır.
> Bu kadar uzun bir koridor adaptasyon hissini sağlamaktadır."

Sektör tanımı: koridor = montaj haçı (göz bebeği hizası) → yakın görüş referans noktası.
Yani Novax burada Officient'in koridorunu **14 mm** olarak tarif ediyor.
Gravür tablosunda Officient'in değeri **9**.

    9 + 5 = 14   ✓  Formül üreticinin kendi cümlesiyle doğrulandı.

Bu, dönüşümün tahmin değil ölçüm olduğunu gösteriyor.
Novax'ın "koridor" dediği şey, güç değişiminin gerçekleştiği bölge;
sektörün "koridor" dediği şey ise montaj haçından yakın referansa kadar olan
toplam mesafe. Aradaki 5 mm, haç ile güç değişiminin başladığı nokta arasındaki
sabit ölü mesafe.

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

## ✅ KARAR VERİLDİ (5 Ağustos 2026) — Muzaffer Bey

> "Novax'ta sorun yok, eski düzen devam edeceğiz. Onlar sadece kendi içlerinde kodlamışlar."

**Karar:** Uygulama sektör standardı mm ile konuşmaya devam edecek (14/16/18…).
Novax'ın 5/7/9/11/12 ve D/E/F/A/G değerleri Novax'ın **kendi iç gravür kodlaması**;
sipariş verirken kullanılan sayı değil.

**Bunun sonucu:** `data.js`'e **dönüştürülmüş (standart) değerler** yazıldı.
Yani Synthesis'in koridorları veritabanında `[10, 12, 14, 16]` olarak duruyor
(Novax gravüründe 5-7-9-11). Sipariş ekranında da bu standart mm görünür —
diğer markalarla aynı dil.

Novax skalası veritabanında **satır sonu yorumu** olarak korundu, çünkü
camın üzerindeki gravürü okurken (ör. gelen camı kontrol ederken) karşılığını
bilmek gerekiyor.

### data.js'e yazılan değerler (19 model)

| Model | Novax gravürü | data.js (standart mm) | minFittingHeight |
|---|---|---|---|
| Synthesis Progresif | 5-7-9-11 | `[10, 12, 14, 16]` | 14 |
| Nucleo 5D Progresif | 7-9-11 | `[12, 14, 16]` | 16 |
| Nexus 4D | 5-7-9-11 | `[10, 12, 14, 16]` | 14 |
| Trion 3D 2.0 | 5-7-9-11 | `[10, 12, 14, 16]` | 14 |
| Synthesis Ofis | 5 | `[10]` | 14 |
| Nucleo 5D Ofis | 5-9 | `[10, 14]` | 14 |
| Nucleo 5D Drive | 7-9 | `[12, 14]` | 16 |
| Nucleo 5D Sport | 7-9 | `[12, 14]` | 16 |
| Nucleo 5D Pilot | 7-9 | `[12, 14]` | 16 |
| Synthesis Anti-fatigue | 7 | `[12]` | 16 |
| Nucleo 5D Anti-fatigue | 9 | `[14]` | 18 |
| Matrix HD | 5-7-9-11 | `[10, 12, 14, 16]` | 14 |
| Genius | 7-9-11 | `[12, 14, 16]` | 16 |
| Ventro | 7-9-11 | `[12, 14, 16]` | 16 |
| Novum NG | 7-9-11 | `[12, 14, 16]` | 16 |
| Sportive Progresif | 12 | `[17]` | 21 |
| DriveOn Progresif | 12 | `[17]` | 21 |
| Officient | 9 | `[14]` | 18 |
| Serenity | 9 | `[14]` | 18 |

`minFittingHeight` artık hesaplanmış değil, **kataloğun kendi montaj yüksekliği
sütunundan** geliyor (D=14, E=16, F=18, A=11→20, G=21). Önceden hepsi 14 yazıyordu;
7 modelde bu yanlıştı.

Myopi-X, Myopi-X C.I.R.C.L.E. ve iki bifokal modelde koridor **kasıtlı olarak boş**
bırakıldı — bunlar progresif değil.

### Bu değişikliğin pratikte anlamı

Önce 22 Novax modelinin tamamı koridor kontrolünde "bilgi yok → nötr" geçiyordu;
sistem hiçbir uyarı vermiyordu. Artık:

- **Sportive ve DriveOn tek koridorlu (17 mm) ve 21 mm montaj yüksekliği istiyor.**
  Küçük/sığ çerçevede bu camlar kullanılamaz — sistem artık uyarıyor.
  Bu, kataloğun tamamındaki en yüksek montaj gereksinimi.
- Motor 18 mm koridor önerdiğinde (büyük çerçeve + yüksek ADD hipermetrop)
  **hiçbir genel amaçlı Novax modelinde tam karşılık yok** — en uzunu 16 mm.
  Böyle reçetelerde Novax dışı marka daha uygun.
- Ofis/degresif modeller (Synthesis Ofis 10 mm) normal progresif reçetelerde
  artık doğru şekilde uyumsuz işaretleniyor.

### ⚠️ Yeni açık konu — FlexiFit / AutoFit sürekli koridor

Katalog s.6'ya göre iki modelde koridor **ayrık değerlerle sınırlı değil**:

- **FlexiFit (Nucleo 5D):** "OptiPAL üzerinden koridor tanımını tam kontrol etme
  imkânı sunar ve uzunluğu standart 2 mm yerine **0,1 mm hassasiyetle**
  belirlenebilmesini sağlar."
- **AutoFit (Synthesis):** VR ölçümüyle kişiye özel koridor uzunluğunu
  0,1 mm hassasiyetle otomatik belirler.

Yani Nucleo 5D ve Synthesis'e teorik olarak 13 mm veya 15 mm de sipariş edilebilir;
gravür sembolü en yakın değere yuvarlanır. Veritabanında şu an ayrık değerler var
(kataloğun garanti ettiği değerler bunlar). Motor 13/15 mm önerdiğinde bu iki model
"tam uyum" yerine "yakın" puanı alıyor — teknik olarak eksik puanlama.

**Muzaffer Bey'e sorulacak:** OptiPAL'de Nucleo 5D / Synthesis siparişi verirken
koridor kutusuna ara değer (13, 15 gibi) girilebiliyor mu, yoksa liste mi çıkıyor?
Cevaba göre bu iki modele `koridorAralik: [12, 16]` gibi bir alan eklenebilir.

## Ek bulgu — Novax şikayet teşhis tablosu (s.7-8) — TAM METİN

"Şikayet teşhis ağacı" özelliği için hazır içerik. Katalogdan birebir alındı.
🔧 = Montaj Hatası, 📋 = Reçete Hatası (kataloğun kendi ayrımı).

### Problem: Net Olmayan Yakın Görüş

| Hasta ne yapıyor (belirti) | Olası neden | Çözüm |
|---|---|---|
| Okuma sırasında başını yukarı kaldırıyor | 🔧 Camlar çerçeveye gereğinden aşağı konumlandırılmış | Plaket ayarı ile çerçeveyi doğru pozisyona yükselt |
| Net görmek için bakışını orta alandan yapmaya çalışıyor | 📋 Yakın alan ek adisyon değeri yüksek | Reçete değerlerini tekrar kontrol et |
| Net görmek için başını sağa sola hareket ettiriyor | 🔧 PD mesafesi hatalı ölçülmüş | Monoküler PD ölçümünü tekrar yap; gerekirse camı doğru ölçüye göre yeniden yerleştir |
| Yukarıdakilerin hiçbiri uymuyorsa | 📋 Hipermetrop (+) düşük / miyop (−) fazla / yakın ek (adisyon) yetersiz | Reçete değerlerini kontrol et, gerekirse camları yeniden merkezle |

### Problem: Sınırlı Okuma Alanı

| Hasta ne yapıyor (belirti) | Olası neden | Çözüm |
|---|---|---|
| Çerçeveyi yüzüne doğru yaklaştırma ihtiyacı duyuyor | 🔧 Camlar yüzden olması gerekenden uzakta duruyor | Plaket ayarı ile çerçeveyi yüze bir miktar yaklaştır |
| Okurken başını belirli bir açıya getirme ihtiyacı duyuyor | 🔧 Okuma alanı için gerekli açı verilmeden montaj yapılmış | Çerçeveye yaklaşık **8–12° pantoskopik açı** uygula |

### Problem: Net Olmayan Uzak Görüş

| Hasta ne yapıyor (belirti) | Olası neden | Çözüm |
|---|---|---|
| Daha net görmek için başını aşağı eğiyor | 🔧 Camlar çerçeve içinde olması gerekenden yukarıda | Plaket ayarı ile çerçeveyi aşağı yönde doğru pozisyona getir |
| Daha iyi görmek için başını yukarı kaldırıyor | 📋 Miyop (−) uzak değeri fazla ya da hipermetrop (+) uzak değeri yetersiz | Reçeteyi kontrol et; gerekirse uzak refraksiyonu yeniden ölçtürüp camları revize et |
| Daha iyi görmek için başını sağa sola çeviriyor | 🔧 PD mesafesi hatalı ölçülmüş | Monoküler PD ölçümünü tekrar yap; gerekirse camı yeniden yerleştir |
| Yukarıdakilerin hiçbiri uymuyorsa | 📋 Uzak refraksiyon değeri hatalı | Reçete bilgilerini yeniden değerlendir, ölçümü tekrarlayıp camı yeniden düzenle |

### Problem: Uzakta Periferik Bulanıklık ve Dengesiz Görüş

| Hasta ne yapıyor (belirti) | Olası neden | Çözüm |
|---|---|---|
| Çerçeveyi yüzüne yaklaştırınca görüşü düzeliyor | 🔧 Camlar yüzden olması gerekenden uzakta duruyor | Plaket ayarı ile çerçeveyi yüze bir miktar yaklaştır |
| Çerçeveyi bükünce görüş kalitesi artıyor | 🔧 Camlar fazla düz konumlandırılmış, yüz formuna uyum sağlamamış | Çerçeve bombe açısını hastanın yüz yapısına uygun ayarla |

**Dikkat çeken nokta:** 12 belirtinin 8'i montaj hatası. Yani şikayetlerin çoğunda
cam yanlış değil, montaj yanlış. Teşhis ağacı bu ayrımı en başta sormalı —
"camı değiştirelim" demeden önce plaket/pantoskopik/bombe ayarı denenmeli.

## Ek bulgu — ölü alan verisi (Novax)

Sayısal iddialar mevcut:
- Nucleo 5D Drive: astigmatik etkiyi premium progresiflere göre **%14,6 azaltır**,
  uzak bölge **%70**, uzak-orta bölge **%45** daha geniş.
- Synthesis: istenmeyen astigmatik etkiyi **%20'ye kadar** azaltır.
- Nexus 4D / AmplifEye: uzak, orta veya yakından biri **%30**, üçü birden **%20** genişletilebilir.
- Nucleo 5D kullanıcı anketi: %100 memnun, %94 tüm mesafelerde net, %83 dijital cihazda net.
