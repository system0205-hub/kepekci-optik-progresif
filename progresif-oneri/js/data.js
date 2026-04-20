// Kepekci Optik - Progresif Cam Veritabani
// Son guncelleme: Mart 2026
// Fiyatlar: Subat 2026 kataloglarina goredir (tek cam, cift icin x2)
window.LENS_DB_VERSION = "2026-03";

window.LENS_DATABASE = {
  markalar: {
    // ==================== OPAK LENS (ONCELIK 1) ====================
    opakLens: {
      ad: "Opak Lens",
      kisaAd: "Opak",
      distrib: "Opak Lens A.S. (EyeArt)",
      oncelik: 1,
      uyumGarantisi: false,
      modeller: [
        {
          id: "opak-infinite",
          ad: "Infinite",
          seviye: "premium",
          tasarim: "freeform",
          koridorlar: [14, 15, 16, 17, 18, 19, 20],
          minFittingHeight: 14,
          teknolojiler: ["Stable View", "Mobile Adaptation", "Pure View", "Advanced Ray Tracing II"],
          ozellikler: {
            genisMesafe: true,
            genisYakin: true,
            genisOrta: true,
            yuzmeEtkisiAzaltma: true,
            dijitalCihazOptimize: true,
            surusOptimize: true
          },
          indeksler: ["1.50", "1.56", "1.60", "1.67", "1.74"],
          fiyatAraligi: null, // QR kod arkasinda, kullanicidan alinacak
          hedefKitle: "Tum meslek gruplari, en ust seviye",
          aciklama: "En ust seviye kisi ozel tasarim. Stable View ile yuzme etkisi minimuma iner. 7 farkli gecis bolgesi secenegi."
        },
        {
          id: "opak-maximo-plus",
          ad: "Maximo Plus",
          seviye: "premium",
          tasarim: "freeform",
          koridorlar: [14, 15, 16, 17, 18, 19, 20],
          minFittingHeight: 14,
          teknolojiler: ["Mobile Adaptation", "Pure View", "Advanced Ray Tracing II"],
          ozellikler: {
            genisMesafe: true,
            genisYakin: true,
            genisOrta: true,
            yuzmeEtkisiAzaltma: false,
            dijitalCihazOptimize: true,
            surusOptimize: true
          },
          indeksler: ["1.50", "1.56", "1.60", "1.67", "1.74"],
          fiyatAraligi: null,
          hedefKitle: "Dijital cihaz yogun kullananlar",
          aciklama: "Dijital cihazlarda yuksek performans. Telefon ve bilgisayar gecislerinde rahat gorus."
        },
        {
          id: "opak-retina",
          ad: "Retina",
          seviye: "premium",
          tasarim: "freeform",
          koridorlar: [14, 15, 16, 17, 18, 19, 20],
          minFittingHeight: 14,
          teknolojiler: ["Pure View", "Advanced Ray Tracing II"],
          ozellikler: {
            genisMesafe: false,
            genisYakin: true,
            genisOrta: true,
            yuzmeEtkisiAzaltma: false,
            dijitalCihazOptimize: true,
            surusOptimize: false
          },
          indeksler: ["1.50", "1.56", "1.60", "1.67"],
          fiyatAraligi: null,
          hedefKitle: "Yakin ve ara mesafe yogun: terzi, mimar, muhendis, ogretmen",
          aciklama: "Yakin alani gelistirilmis tasarim. Okuma ve bilgisayar calismasi oncelikli."
        },
        {
          id: "opak-premium-plus",
          ad: "Premium Plus",
          seviye: "orta",
          tasarim: "freeform",
          koridorlar: [14, 16, 18],
          minFittingHeight: 14,
          teknolojiler: ["Pure View", "Advanced Ray Tracing II"],
          ozellikler: {
            genisMesafe: true,
            genisYakin: true,
            genisOrta: true,
            yuzmeEtkisiAzaltma: false,
            dijitalCihazOptimize: false,
            surusOptimize: false
          },
          indeksler: ["1.50", "1.56", "1.60", "1.67"],
          fiyatAraligi: null,
          hedefKitle: "Genel kullanim",
          aciklama: "Kisi ozel tasarim, hizli alisma sureci. 3 farkli gecis bolgesi."
        },
        {
          id: "opak-premium-hd",
          ad: "Premium HD",
          seviye: "orta",
          tasarim: "freeform",
          koridorlar: [14, 15, 16, 17, 18, 19, 20],
          minFittingHeight: 14,
          teknolojiler: ["Pure View", "Advanced Ray Tracing I"],
          ozellikler: {
            genisMesafe: true,
            genisYakin: true,
            genisOrta: true,
            yuzmeEtkisiAzaltma: false,
            dijitalCihazOptimize: false,
            surusOptimize: false
          },
          indeksler: ["1.50", "1.56", "1.60", "1.67"],
          fiyatAraligi: null,
          hedefKitle: "Genel kullanim, sportif cerceveler",
          aciklama: "7 farkli gecis bolgesi. Sport HD versiyonu sportif cerceveler icin mevcut."
        },
        {
          id: "opak-ultima",
          ad: "Ultima",
          seviye: "orta",
          tasarim: "freeform",
          koridorlar: [14, 15, 16, 17, 18, 19, 20],
          minFittingHeight: 14,
          teknolojiler: ["Pure View", "Advanced Ray Tracing I"],
          ozellikler: {
            genisMesafe: true,
            genisYakin: true,
            genisOrta: true,
            yuzmeEtkisiAzaltma: false,
            dijitalCihazOptimize: false,
            surusOptimize: false
          },
          indeksler: ["1.50", "1.56", "1.60", "1.67"],
          fiyatAraligi: null,
          hedefKitle: "Genel kullanim",
          aciklama: "Yuksek performansli FreeForm. 7 gecis bolgesi secenegi."
        },
        {
          id: "opak-gold",
          ad: "Gold",
          seviye: "orta",
          tasarim: "freeform",
          koridorlar: [14, 15, 16, 17, 18, 19, 20],
          minFittingHeight: 14,
          teknolojiler: ["Pure View"],
          ozellikler: {
            genisMesafe: false,
            genisYakin: true,
            genisOrta: true,
            yuzmeEtkisiAzaltma: false,
            dijitalCihazOptimize: false,
            surusOptimize: false
          },
          indeksler: ["1.50", "1.56", "1.60", "1.67"],
          fiyatAraligi: null,
          hedefKitle: "Yakin/orta yogun: terzi, mimar, muhendis, ogretmen",
          aciklama: "Orta ve yakin alan genisletilmis. 7 gecis bolgesi."
        },
        {
          id: "opak-extra",
          ad: "Extra",
          seviye: "baslangic",
          tasarim: "freeform",
          koridorlar: [14, 16, 17, 18, 20],
          minFittingHeight: 14,
          teknolojiler: [],
          ozellikler: {
            genisMesafe: true,
            genisYakin: false,
            genisOrta: false,
            yuzmeEtkisiAzaltma: false,
            dijitalCihazOptimize: false,
            surusOptimize: false
          },
          indeksler: ["1.50", "1.56", "1.60", "1.67"],
          fiyatAraligi: null,
          hedefKitle: "Genel kullanim, baslangic",
          aciklama: "FreeForm baslangic seviyesi. 5 farkli gecis bolgesi."
        },
        {
          id: "opak-first",
          ad: "First",
          seviye: "baslangic",
          tasarim: "freeform",
          koridorlar: [14, 15, 16, 17, 18, 19, 20],
          minFittingHeight: 14,
          teknolojiler: [],
          ozellikler: {
            genisMesafe: true,
            genisYakin: false,
            genisOrta: false,
            yuzmeEtkisiAzaltma: false,
            dijitalCihazOptimize: false,
            surusOptimize: false
          },
          indeksler: ["1.50", "1.56", "1.60"],
          fiyatAraligi: null,
          hedefKitle: "Baslangic, fiyat-kalite",
          aciklama: "En uygun fiyatli FreeForm. 7 gecis bolgesi. Ilk kullananlar icin iyi secim."
        }
      ]
    },

    // ==================== KODAK (ONCELIK 2) ====================
    kodak: {
      ad: "Kodak",
      kisaAd: "Kodak",
      distrib: "Bir Optik (EssilorLuxottica)",
      oncelik: 2,
      uyumGarantisi: true,
      modeller: [
        {
          id: "kodak-unique-dro",
          ad: "Unique DRO",
          seviye: "premium",
          tasarim: "freeform",
          koridorlar: [13, 14, 15, 16, 17, 18],
          minFittingHeight: 14,
          uyumGarantisi: true,
          teknolojiler: ["Vision First", "i-Sync", "DRO", "FreeForm", "Desentrasyon"],
          ozellikler: {
            genisMesafe: true,
            genisYakin: true,
            genisOrta: true,
            yuzmeEtkisiAzaltma: false,
            dijitalCihazOptimize: false,
            surusOptimize: false
          },
          indeksler: ["1.50", "1.56", "1.60", "1.67"],
          fiyatAraligi: { min: 26900, max: 41900 },
          hedefKitle: "40+ deneyimli kullanicilar",
          aciklama: "Premium kisi ozel tasarim. DRO teknolojisi ile mesafeler arasi yumusak gecis. 6 gecis bolgesi."
        },
        {
          id: "kodak-city-lens",
          ad: "City Lens PAL",
          seviye: "premium",
          tasarim: "freeform",
          koridorlar: [13, 14, 16, 18],
          minFittingHeight: 13,
          uyumGarantisi: true,
          teknolojiler: ["Vision First", "i-Sync", "Desentrasyon"],
          ozellikler: {
            genisMesafe: true,
            genisYakin: true,
            genisOrta: true,
            yuzmeEtkisiAzaltma: false,
            dijitalCihazOptimize: true,
            surusOptimize: true
          },
          goruntuProfilleri: ["Cok Yonlu", "Uzak", "Ekran", "Yakin"],
          indeksler: ["1.50", "1.56", "1.60", "1.67"],
          fiyatAraligi: { min: 21000, max: 34900 },
          hedefKitle: "Sehir yasami, coklu aktivite",
          aciklama: "4 farkli gorus profili: Cok Yonlu (All-Around), Uzak (Extended), Ekran (Screen), Yakin (Proximity). UV/mavi isik koruma. Polarize secenegi."
        },
        {
          id: "kodak-atlas",
          ad: "Atlas",
          seviye: "orta",
          tasarim: "freeform",
          koridorlar: [13, 14, 16, 18],
          minFittingHeight: 14,
          uyumGarantisi: true,
          teknolojiler: ["Vision First", "i-Sync", "FreeForm", "Desentrasyon"],
          ozellikler: {
            genisMesafe: true,
            genisYakin: true,
            genisOrta: true,
            yuzmeEtkisiAzaltma: false,
            dijitalCihazOptimize: true,
            surusOptimize: false
          },
          indeksler: ["1.50", "1.56", "1.60", "1.67"],
          fiyatAraligi: { min: 14000, max: 26400 },
          hedefKitle: "6+ saat ekran kullanan 40+ kullanicilar",
          aciklama: "Dijital cihaz odakli, genis yakin alan. 4 koridor (13/14/16/18mm). Bilgisayar calisanlari icin ideal."
        },
        {
          id: "kodak-precise",
          ad: "Precise",
          seviye: "orta",
          tasarim: "freeform",
          koridorlar: [17],
          minFittingHeight: 18,
          uyumGarantisi: true,
          teknolojiler: ["Vision First", "FreeForm", "Desentrasyon", "Baz Kontrolu"],
          ozellikler: {
            genisMesafe: true,
            genisYakin: true,
            genisOrta: true,
            yuzmeEtkisiAzaltma: false,
            dijitalCihazOptimize: false,
            surusOptimize: false
          },
          indeksler: ["1.50", "1.56", "1.60", "1.67"],
          fiyatAraligi: { min: 9750, max: 22400 },
          hedefKitle: "40+ genel kullanim",
          aciklama: "Yumusak gecis. 17mm sabit koridor. Tek odakli konforunda progresif."
        },
        {
          id: "kodak-intro",
          ad: "Intro PAL",
          seviye: "baslangic",
          tasarim: "freeform",
          koridorlar: [18],
          minFittingHeight: 19,
          uyumGarantisi: false,
          teknolojiler: ["Vision First", "Baz Kontrolu", "FreeForm"],
          ozellikler: {
            genisMesafe: true,
            genisYakin: false,
            genisOrta: false,
            yuzmeEtkisiAzaltma: false,
            dijitalCihazOptimize: false,
            surusOptimize: false
          },
          indeksler: ["1.50", "1.56", "1.60", "1.67"],
          fiyatAraligi: { min: 7000, max: 20600 },
          hedefKitle: "Ilk kez progresif cam kullananlar",
          aciklama: "Giris seviyesi. Yumusak tasarim, kolay alisma. 18mm sabit koridor. UYUM GARANTISI YOK."
        }
      ],
      // Kodak kaplamalari (Subat 2026 katalogu)
      kaplamalar: [
        {
          id: "kodak-cnc-uv",
          ad: "CNC UV",
          tip: "anti-refle",
          ozellikler: { uvFiltresi: "UV400", antiRefle: true },
          aciklama: "Standart AR kaplama. UV400 koruma."
        },
        {
          id: "kodak-cnc-uv-blue",
          ad: "CNC UV BLUE",
          tip: "anti-refle-mavi-isik",
          ozellikler: { uvFiltresi: "UV400", maviIsikFiltresi: true, antiRefle: true },
          hedefKitle: "Uzun saat ekran karsisinda calisanlar",
          aciklama: "Mavi-mor isigi filtreler. Ekran kullanicilari icin."
        },
        {
          id: "kodak-cnc-uv-drive",
          ad: "CNC UV DRIVE",
          tip: "anti-refle-surus",
          ozellikler: { uvFiltresi: "UV400", parlamaAzaltma: "%90", antiRefle: true, geceSurus: true },
          hedefKitle: "Sik gece surusu yapanlar",
          aciklama: "Farlardan/panolardan gelen parlamalari %90 azaltir. Gece surus konforu."
        },
        {
          id: "kodak-clean-n-clear",
          ad: "Clean'N'CleAR",
          tip: "anti-refle-premium",
          ozellikler: { uvFiltresi: "UV400", antiRefle: true, tozTutmaz: true, kolayTemizlik: true, cizilmeyeDayanikli: true },
          aciklama: "En yuksek standart AR. Toz tutmaz, kolay temizlenir, cizilmeye dayanikli."
        },
        {
          id: "kodak-zerofog",
          ad: "ZeroFog",
          tip: "bugu-onleyici",
          ozellikler: { buguOnleyici: true },
          aciklama: "Bugu olusumunu engeller. Maske kullanicilari / soguk hava gecisleri icin."
        }
      ],
      // Kodak ozel islemler (Subat 2026 katalogu)
      ozelIslemler: [
        { id: "ozel-baz", ad: "Ozel Baz", ucret: 990 },
        { id: "prizmatik", ad: "Prizmatik", ucret: 610 },
        { id: "kal", ad: "KAL (Ozel Kalinlik)", ucret: 990 },
        { id: "mos", ad: "MOS (Model Secimli Rx)", ucret: 990 },
        { id: "bov-kov", ad: "BOV / KOV", ucret: 990 },
        { id: "orx", ad: "ORX (Olcekli Rx)", ucret: 990 },
        { id: "bls", ad: "BLS (Kalinlik Dengeleme)", ucret: 990 },
        { id: "nil", ad: "NIL (Nilor Kalinligi)", ucret: 990 },
        { id: "dec-tek-odakli", ad: "DEC (Odak Kaydirma) Tek Odakli", ucret: 990 },
        { id: "lazer-isaret", ad: "Lazer Ozel Isaretleme", ucret: 990 },
        { id: "acil-siparis", ad: "Acil Siparis", ucret: 1100 },
        { id: "siskod", ad: "SisKod", ucret: 990 },
        { id: "boyama-duz", ad: "Boyama Duz", ucret: 1400 },
        { id: "boyama-degrade", ad: "Boyama Degrade", ucret: 1900 },
        { id: "boyama-numune", ad: "Boyama Numuneye Gore", ucret: 2200 },
        { id: "boyama-uv400", ad: "UV 400 Boyama", ucret: 1400 },
        { id: "boyama-renk-suzer", ad: "Renk Suzer Boyama", ucret: 2600 }
      ]
    },

    // ==================== TORA (ONCELIK 3) ====================
    tora: {
      ad: "Tora",
      kisaAd: "Tora",
      distrib: "Bir Optik (EssilorLuxottica)",
      oncelik: 3,
      uyumGarantisi: false,
      modeller: [
        {
          id: "tora-brava-exclusive",
          ad: "Brava Exclusive",
          seviye: "premium",
          tasarim: "freeform",
          koridorlar: [15, 17],
          minFittingHeight: 17,
          teknolojiler: ["Panoramik Gorus", "Dinamik Gorus", "Kontrast"],
          ozellikler: {
            genisMesafe: true,
            genisYakin: true,
            genisOrta: true,
            yuzmeEtkisiAzaltma: false,
            dijitalCihazOptimize: false,
            surusOptimize: false
          },
          indeksler: ["1.50", "1.60", "1.67"],
          fiyatAraligi: { min: 8200, max: 20600 },
          hedefKitle: "Genis gorus alani ve konfor arayanlar",
          aciklama: "Panoramik gorus, kolay alisma. Short versiyon (15mm) kucuk cerceveler icin mevcut."
        },
        {
          id: "tora-astina",
          ad: "Astina",
          seviye: "orta",
          tasarim: "dijital",
          koridorlar: [15, 17],
          minFittingHeight: 17,
          teknolojiler: ["Dijital Yuzey Isleme", "Dinamik Gorus"],
          ozellikler: {
            genisMesafe: true,
            genisYakin: false,
            genisOrta: true,
            yuzmeEtkisiAzaltma: false,
            dijitalCihazOptimize: false,
            surusOptimize: false
          },
          indeksler: ["1.50", "1.56", "1.57", "1.60", "1.67"],
          fiyatAraligi: { min: 5850, max: 16600 },
          hedefKitle: "Acik hava, genel kullanim",
          aciklama: "Dengeli gorus, dis mekan odakli. Uygun fiyat. Short versiyonu (15mm) kucuk cerceveler icin mevcut."
        },
        {
          id: "tora-samira",
          ad: "Samira",
          seviye: "baslangic",
          tasarim: "dijital",
          koridorlar: [17],
          minFittingHeight: 17,
          teknolojiler: ["Dijital Yuzey Isleme"],
          ozellikler: {
            genisMesafe: true,
            genisYakin: false,
            genisOrta: false,
            yuzmeEtkisiAzaltma: false,
            dijitalCihazOptimize: false,
            surusOptimize: false
          },
          indeksler: ["1.50", "1.56", "1.57", "1.60", "1.67", "1.74"],
          fiyatAraligi: { min: 4500, max: 20100 },
          hedefKitle: "Genel kullanim, uygun fiyat",
          aciklama: "Baslangic seviyesi. Genis indeks yelpazesi (1.50-1.74). En uygun fiyat."
        }
      ],
      // Tora kaplamalari (Subat 2026 katalogu)
      kaplamalar: [
        {
          id: "tora-kappa-plus-shmc",
          ad: "Kappa Plus SHMC",
          tip: "anti-refle",
          ucret: 350,
          ozellikler: {
            uvFiltresi: "UV400",
            antiRefle: true,
            tozTutmaz: true,
            kirTutmaz: true,
            suTutmaz: true,
            cizilmeyeDayanikli: true
          },
          aciklama: "UV koruma, toz/kir/su tutmazlik, yansima onleme, cizilme direnci. Standart premium AR kaplama."
        },
        {
          id: "tora-kappa-blue-shmc",
          ad: "Kappa Blue SHMC",
          tip: "anti-refle-mavi-isik",
          ucret: 450,
          ozellikler: {
            uvFiltresi: "UV400",
            maviIsikFiltresi: true,
            antiRefle: true,
            tozTutmaz: true,
            suTutmaz: true,
            cizilmeyeDayanikli: true
          },
          hedefKitle: "Uzun saat ekran karsisinda calisanlar",
          aciklama: "Kappa Plus ozelliklerine ek olarak mavi-mor isigi filtreler. Dijital ekran konforu."
        }
      ],
      // Tora ozel islemler (Subat 2026 katalogu)
      ozelIslemler: [
        { id: "ozel-baz", ad: "Ozel Baz", ucret: 550 },
        { id: "prizmatik", ad: "Prizmatik", ucret: 220 },
        { id: "kal", ad: "KAL (Ozel Kalinlik)", ucret: 500 },
        { id: "buyuk-kucuk-oval", ad: "Buyuk/Kucuk Oval", ucret: 330 },
        { id: "balance", ad: "Balance (Kalinlik Dengeleme)", ucret: 330 },
        { id: "nil", ad: "Nil (Nilor Kalinligi)", ucret: 330 },
        { id: "acil-siparis", ad: "Acil Siparis", ucret: 880 },
        { id: "dec-tek-odakli", ad: "DEC (Odak Kaydirma) Tek Odakli", ucret: 330 },
        { id: "ozel-isaret", ad: "Ozel Isaretleme", ucret: 280 },
        { id: "boyama-duz", ad: "Duz Boyama", ucret: 500 },
        { id: "boyama-degrade", ad: "Degrade Boyama", ucret: 600 },
        { id: "boyama-numune", ad: "Numuneye Gore Boyama", ucret: 500 },
        { id: "boyama-uv400", ad: "UV 400 Boyama", ucret: 700 },
        { id: "boyama-renk-suzer", ad: "Renk Suzer Ozel Filtre", ucret: 1300 }
      ]
    },

    // ==================== NOVAX (ONCELIK 4) ====================
    novax: {
      ad: "Novax",
      kisaAd: "Novax",
      distrib: "Beta Optik",
      oncelik: 4,
      uyumGarantisi: false,
      modeller: [
        {
          id: "novax-synthesis",
          ad: "Synthesis",
          seviye: "premium",
          tasarim: "freeform",
          koridorlar: [],
          minFittingHeight: 14,
          teknolojiler: ["Yapay Zeka", "VR Gorsel Harita"],
          ozellikler: {
            genisMesafe: true,
            genisYakin: true,
            genisOrta: true,
            yuzmeEtkisiAzaltma: true,
            dijitalCihazOptimize: true,
            surusOptimize: true
          },
          indeksler: ["1.50", "1.61", "1.67", "1.74"],
          fiyatAraligi: { min: 29500, max: 96500 },
          hedefKitle: "En ust seviye, kisisel deneyim arayanlar",
          aciklama: "VR gozluk ile goz/bas hareketi analizi. Yapay zeka ile tamamen kisisel tasarim."
        }
        // NOT (2026-04-20): "Granite Kisisel" ve "Granite Standart" buradan silindi.
        // Granite bir CAM MODELI degil, PixAR GRANITE adli KAPLAMADIR.
        // Novax'in tum camlarinda standart olarak gelen super hidrofobik anti-refle
        // kaplamadir (ucretsiz, UV400, 9H sertlik). Kaplamalar asagida
        // "markalar.novax.kaplamalar[]" listesinde tanimlanmistir.
        // 20+ gercek Novax progresif modeli Faz 1.4'te eklenecek (Nucleo 5D, Nexus 4D,
        // Trion 3D, Matrix HD, Genius, Ventro, Novum NG, Sportive, DriveOn, Officient,
        // Serenity, vb.)
      ],
      // Novax kaplamalari (PixAR serisi). Standart olarak tum Novax camlarinda
      // GRANITE Standart ucretsiz gelir; GRANITE Kisisel ekstra ucretlidir.
      // BLUV (mavi isik), DRIVE (sürüs), AQUA (su iticilik) Faz 1.5'te eklenecek.
      kaplamalar: [
        {
          id: "novax-pixar-granite-standart",
          ad: "PixAR GRANITE Standart",
          tip: "anti-refle",
          ucretsiz: true,
          ozellikler: {
            superHidrofobik: true,
            uvFiltresi: "UV400",
            sertlik: "9H",
            antiStatik: true,
            kisisel: false
          },
          hedefKitle: "Tum Novax cam alicilari (varsayilan)",
          aciklama: "Novax camlarinda standart olarak gelir. Super hidrofobik yuzey, UV400 koruma, 9H yuzey sertligi."
        },
        {
          id: "novax-pixar-granite-kisisel",
          ad: "PixAR GRANITE Kisisel",
          tip: "anti-refle",
          ucretsiz: false,
          ozellikler: {
            superHidrofobik: true,
            uvFiltresi: "UV400",
            sertlik: "9H",
            antiStatik: true,
            kisisel: true
          },
          hedefKitle: "Kisiselletirilmis renk tonu isteyen musteriler",
          aciklama: "GRANITE Standart'in kisisel renk tonu secenekleriyle (yesil/mavi/kirmizi) guclendirilmis hali. Ekstra ucretli."
        }
      ]
    },

    // ==================== NIKON (ONCELIK 5) ====================
    nikon: {
      ad: "Nikon",
      kisaAd: "Nikon",
      distrib: "EssilorLuxottica",
      oncelik: 5,
      uyumGarantisi: false,
      modeller: [
        {
          id: "nikon-seemax-ultimate",
          ad: "Seemax Ultimate Z",
          seviye: "premium",
          tasarim: "freeform",
          koridorlar: [10, 12, 14, 16],
          minFittingHeight: 14,
          teknolojiler: ["Z-Contrast", "Seemax", "Cift Yuzey Asferik"],
          ozellikler: {
            genisMesafe: true,
            genisYakin: true,
            genisOrta: true,
            yuzmeEtkisiAzaltma: true,
            dijitalCihazOptimize: true,
            surusOptimize: true
          },
          indeksler: ["1.50", "1.60", "1.67", "1.74"],
          fiyatAraligi: { min: 50000, max: 92000 },
          hedefKitle: "En yuksek gorsel performans arayanlar",
          aciklama: "En ust seviye. Kisisel kontrast algisi testi ile optimize edilir. 4 gecis bolgesi."
        },
        {
          id: "nikon-presio-power",
          ad: "Presio Power Z",
          seviye: "premium",
          tasarim: "freeform",
          koridorlar: [10, 12, 14, 16],
          minFittingHeight: 14,
          teknolojiler: ["Z-Contrast", "Cift Yuzey", "Bozulma Onleyici Filtre"],
          ozellikler: {
            genisMesafe: true,
            genisYakin: true,
            genisOrta: true,
            yuzmeEtkisiAzaltma: true,
            dijitalCihazOptimize: true,
            surusOptimize: true
          },
          indeksler: ["1.50", "1.60", "1.67", "1.74"],
          fiyatAraligi: { min: 31920, max: 63000 },
          hedefKitle: "Yuksek performans, zor receteler",
          aciklama: "Stressiz gorus. Yuksek odaklanma ve netlik gerektiren isler icin ideal."
        },
        {
          id: "nikon-presio-balance",
          ad: "Presio Balance Z",
          seviye: "orta",
          tasarim: "freeform",
          koridorlar: [10, 12, 14, 16],
          minFittingHeight: 14,
          teknolojiler: ["Z-Contrast", "Cift Yuzey"],
          ozellikler: {
            genisMesafe: true,
            genisYakin: true,
            genisOrta: true,
            yuzmeEtkisiAzaltma: true,
            dijitalCihazOptimize: false,
            surusOptimize: true
          },
          indeksler: ["1.50", "1.60", "1.67", "1.74"],
          fiyatAraligi: { min: 21100, max: 46000 },
          hedefKitle: "Dengeli gorus, surus",
          aciklama: "Dengeli gorus bolgeleri. Uzak mesafe aktiviteleri icin ideal."
        },
        {
          id: "nikon-digilife",
          ad: "Digilife",
          seviye: "orta",
          tasarim: "freeform",
          koridorlar: [10, 12, 14],
          minFittingHeight: 14,
          teknolojiler: ["Dijital Mesafe Optimizasyonu"],
          ozellikler: {
            genisMesafe: false,
            genisYakin: true,
            genisOrta: true,
            yuzmeEtkisiAzaltma: false,
            dijitalCihazOptimize: true,
            surusOptimize: false
          },
          indeksler: ["1.50", "1.60", "1.67"],
          fiyatAraligi: { min: 18200, max: 36000 },
          hedefKitle: "Dijital cihaz yogun kullanicilar",
          aciklama: "Bilgisayar ve telefon gecisinde genisletilmis ara bolge."
        },
        {
          id: "nikon-presio-first",
          ad: "Presio First",
          seviye: "baslangic",
          tasarim: "dijital",
          koridorlar: [10, 12, 14],
          minFittingHeight: 14,
          teknolojiler: ["Dijital Yuzey Isleme"],
          ozellikler: {
            genisMesafe: true,
            genisYakin: true,
            genisOrta: true,
            yuzmeEtkisiAzaltma: false,
            dijitalCihazOptimize: false,
            surusOptimize: false
          },
          indeksler: ["1.50", "1.60", "1.67"],
          fiyatAraligi: { min: 11000, max: 24000 },
          hedefKitle: "Ilk kez progresif cam kullanacaklar",
          aciklama: "Ilk kullaniciya kolay alisma. Standart camlara gore %30 daha genis yakin alan."
        }
      ]
    },

    // ==================== VISIONART (ONCELIK 6) ====================
    visionart: {
      ad: "Visionart",
      kisaAd: "Visionart",
      distrib: "Bir Optik (EssilorLuxottica)",
      oncelik: 6,
      uyumGarantisi: true,
      modeller: [
        {
          id: "va-intuitiv",
          ad: "Intuitiv Max / Mio",
          seviye: "premium",
          tasarim: "freeform",
          koridorlar: [],
          minFittingHeight: 14,
          uyumGarantisi: true,
          teknolojiler: ["Cerceve Parametreleri ile Uretim", "Kisisellestirilmis Tasarim"],
          ozellikler: {
            genisMesafe: true,
            genisYakin: true,
            genisOrta: true,
            yuzmeEtkisiAzaltma: false,
            dijitalCihazOptimize: false,
            surusOptimize: false
          },
          indeksler: ["1.50", "1.60", "1.67", "1.74"],
          fiyatAraligi: { min: 19000, max: 34300 },
          uretilebilirlik: { cylMax: 4.00, addMax_max: 4.00, addMax_mio: 3.00 },
          hedefKitle: "Tum meslek gruplari",
          aciklama: "En ust seviye. Cerceve parametreleri ile uretim. MAX (ADD 4.00) ve MIO (ADD 3.00) secenekleri. Mini versiyonu da mevcut."
        },
        {
          id: "va-anateo",
          ad: "Anateo Max / Mio",
          seviye: "premium",
          tasarim: "freeform",
          koridorlar: [],
          minFittingHeight: 14,
          uyumGarantisi: true,
          teknolojiler: ["Kisisellestirilmis Tasarim"],
          ozellikler: {
            genisMesafe: true,
            genisYakin: true,
            genisOrta: true,
            yuzmeEtkisiAzaltma: false,
            dijitalCihazOptimize: false,
            surusOptimize: false
          },
          indeksler: ["1.50", "1.60", "1.67"],
          fiyatAraligi: { min: 13500, max: 26300 },
          uretilebilirlik: { cylMax: 4.00, addMax_max: 4.00, addMax_mio: 3.00 },
          hedefKitle: "Genel kullanim",
          aciklama: "Premium seviye. MAX ve MIO secenekleri. Uyum garantili. Mini versiyonu mevcut."
        },
        {
          id: "va-sirus",
          ad: "Sirus Max / Mio",
          seviye: "orta",
          tasarim: "freeform",
          koridorlar: [],
          minFittingHeight: 14,
          uyumGarantisi: true,
          teknolojiler: [],
          ozellikler: {
            genisMesafe: true,
            genisYakin: true,
            genisOrta: false,
            yuzmeEtkisiAzaltma: false,
            dijitalCihazOptimize: false,
            surusOptimize: false
          },
          indeksler: ["1.50", "1.56", "1.60", "1.67", "1.74"],
          fiyatAraligi: { min: 9500, max: 29300 },
          uretilebilirlik: { cylMax: 4.00, addMax_max: 4.00, addMax_mio: 3.00 },
          hedefKitle: "Genel kullanim, genis indeks yelpazesi",
          aciklama: "Genis malzeme secenekleri (1.50-1.74, Polart, SafeBlue). Uyum garantili. Mini versiyonu mevcut."
        },
        {
          id: "va-quadro",
          ad: "Quadro",
          seviye: "baslangic",
          tasarim: "standart",
          koridorlar: [],
          minFittingHeight: 16,
          uyumGarantisi: false,
          teknolojiler: [],
          ozellikler: {
            genisMesafe: true,
            genisYakin: false,
            genisOrta: false,
            yuzmeEtkisiAzaltma: false,
            dijitalCihazOptimize: false,
            surusOptimize: false
          },
          indeksler: ["1.50", "1.56", "1.60", "1.67"],
          fiyatAraligi: { min: 6500, max: 18600 },
          uretilebilirlik: { cylMax: 4.00, addMax: 1.00 },
          hedefKitle: "Genel kullanim, giris seviye",
          aciklama: "Standart progresif, uygun fiyat. UYUM GARANTISI YOK."
        },
        {
          id: "va-extenso",
          ad: "Extenso Dijital",
          seviye: "orta",
          tasarim: "dijital",
          ozelAmac: "ofis",
          koridorlar: [],
          minFittingHeight: 14,
          uyumGarantisi: false,
          teknolojiler: ["Dijital Yuzey Isleme", "Ofis Optimizasyonu"],
          ozellikler: {
            genisMesafe: false,
            genisYakin: true,
            genisOrta: true,
            yuzmeEtkisiAzaltma: false,
            dijitalCihazOptimize: true,
            surusOptimize: false
          },
          indeksler: ["1.50", "1.60"],
          fiyatAraligi: { min: 5650, max: 12350 },
          uretilebilirlik: { cylMax: 4.00 },
          hedefKitle: "Ofis calisanlari, dijital ekran kullanicilari",
          aciklama: "Ofis / dijital calisma camı. Yakin-orta alan optimize. UZAK SURUS ICIN UYGUN DEGIL."
        }
      ],
      // Visionart kaplamalari (Subat 2026 katalogu)
      kaplamalar: [
        {
          id: "va-neva-uv",
          ad: "NEVA + UV",
          tip: "anti-refle",
          ucret: 4100,
          ozellikler: { uvFiltresi: "UV400", antiRefle: true },
          aciklama: "Temel UV korumali AR kaplama."
        },
        {
          id: "va-neva-resist-uv",
          ad: "NEVA RESIST + UV",
          tip: "anti-refle-dayanikli",
          ucret: 1200,
          ozellikler: { uvFiltresi: "UV400", antiRefle: true, kirTutmaz: true, cizilmeyeDayanikli: true, kolayTemizlik: true },
          aciklama: "UV koruma, yansima onleme, cizilme direnci, kir tutmaz."
        },
        {
          id: "va-neva-max-blue-uv",
          ad: "NEVA MAX BLUE UV",
          tip: "anti-refle-mavi-isik",
          ucret: 1750,
          ozellikler: { uvFiltresi: "UV400", maviIsikFiltresi: true, antiRefle: true, kirTutmaz: true, cizilmeyeDayanikli: true },
          hedefKitle: "Uzun saat ekran karsisinda calisanlar",
          aciklama: "Mavi-mor isigi filtreler. Goz yorgunlugunu azaltir. En ust dayaniklilik."
        },
        {
          id: "va-muv",
          ad: "MUV (Super Premium)",
          tip: "anti-refle-premium",
          ucret: 2300,
          ozellikler: { uvFiltresi: "UV400", antiRefle: true, "2KatDayanikli": true, kirTutmaz: true, cizilmeyeDayanikli: true },
          aciklama: "2 kat daha dayanikli ve uzun omurlu. En ust seviye AR kaplama."
        },
        {
          id: "va-zerofog",
          ad: "ZeroFog (Bugu Onleyici)",
          tip: "bugu-onleyici",
          ozellikler: { buguOnleyici: true },
          aciklama: "Bugu olusumunu engeller. Ozel mendil ile temizlenmeli."
        },
        {
          id: "va-siloxan-slx",
          ad: "Siloxan (SLX)",
          tip: "ozel-yuzey",
          ucret: 2500,
          ozellikler: { suTutmaz: true, kirTutmaz: true, tozTutmaz: true },
          aciklama: "Siloxan tabanli ozel yuzey kaplamasi."
        },
        {
          id: "va-ayna-kaplama",
          ad: "Ayna Kaplama",
          tip: "ayna",
          ucret: 2750,
          ozellikler: { aynaEfekti: true, renkSecenekleri: ["Forest Green", "Gold", "Pink", "New Blue", "Silver"] },
          gerektirir: "Beyaz cam + Boyama (Grey 3 / Brown 3 / Green 3)",
          aciklama: "Ayna efektli kaplama. 5 renk secenegi. Boyama on isleme gerekir."
        }
      ],
      // Visionart ozel islemler (Subat 2026 katalogu)
      ozelIslemler: [
        { id: "ozel-baz", ad: "Ozel Baz", ucret: 990 },
        { id: "prizmatik", ad: "Prizmatik", ucret: 610 },
        { id: "kal", ad: "KAL (Ozel Kalinlik)", ucret: 990 },
        { id: "mos", ad: "MOS (Model Secimli RX)", ucret: 990 },
        { id: "orx", ad: "ORX (Olcekli RX)", ucret: 990 },
        { id: "bls", ad: "BLS (Kalinlik Dengeleme)", ucret: 990 },
        { id: "nil", ad: "Nil (Nilor Kalinligi)", ucret: 990 },
        { id: "dec-tek-odakli", ad: "DEC (Odak Kaydirma) Tek Odakli", ucret: 1060 },
        { id: "ozel-isaret-rx", ad: "Ozel Isaretleme RX", ucret: 1060 },
        { id: "acil-siparis", ad: "Acil Siparis", ucret: 1100 },
        { id: "sisart", ad: "SisArt", ucret: 990 },
        { id: "buyuk-kucuk-oval", ad: "Buyuk/Kucuk Oval", ucret: 1060 },
        { id: "boyama-duz", ad: "Boyama Duz (0-4)", ucret: 1400 },
        { id: "boyama-degrade", ad: "Boyama Degrade (0-4)", ucret: 1900 },
        { id: "boyama-numune", ad: "Boyama Numuneye Gore", ucret: 1400 },
        { id: "boyama-uv400", ad: "UV 400 Boyama", ucret: 1300 },
        { id: "boyama-renk-suzer", ad: "Renk Suzer Boyama", ucret: 2400 }
      ]
    }
  },

  // Yasam tarzi secenekleri
  yasamTarzlari: [
    { id: "ofis", ad: "Ofis Calisani (Bilgisayar)", ikon: "💻", oncelik: { dijitalCihazOptimize: 10, genisOrta: 5, genisYakin: 3 } },
    { id: "sofor", ad: "Sofor / Arac Kullanici", ikon: "🚗", oncelik: { surusOptimize: 10, genisMesafe: 8, genisOrta: 3 } },
    { id: "ogretmen", ad: "Ogretmen", ikon: "📚", oncelik: { genisOrta: 8, genisYakin: 5, genisMesafe: 3 } },
    { id: "evhanimi", ad: "Ev Hanimi / Ev Islerinde", ikon: "🏠", oncelik: { genisYakin: 8, genisOrta: 5, genisMesafe: 3 } },
    { id: "sporcu", ad: "Sporcu / Aktif Yasam", ikon: "⚽", oncelik: { genisMesafe: 8, genisOrta: 5, surusOptimize: 3 } },
    { id: "emekli", ad: "Emekli", ikon: "🌿", oncelik: { genisYakin: 8, genisOrta: 5, genisMesafe: 3 } },
    { id: "esnaf", ad: "Esnaf / Dukkan Sahibi", ikon: "🏪", oncelik: { genisOrta: 8, genisMesafe: 5, genisYakin: 5 } },
    { id: "muhendis", ad: "Muhendis / Tasarimci / Mimar", ikon: "📐", oncelik: { dijitalCihazOptimize: 10, genisYakin: 8, genisOrta: 5 } },
    { id: "diger", ad: "Diger / Genel Kullanim", ikon: "👤", oncelik: { genisMesafe: 5, genisOrta: 5, genisYakin: 5 } }
  ]
};
