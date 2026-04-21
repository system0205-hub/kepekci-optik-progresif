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
        // ============ PREMIUM PROGRESIF (Mart 2026 Novax katalogu) ============
        {
          id: "novax-synthesis",
          ad: "Synthesis Progresif",
          seviye: "premium",
          tasarim: "freeform-morphing",
          ozelAmac: null,
          koridorlar: [],
          minFittingHeight: 14,
          uyumGarantisi: false,
          vrGerektirir: true,
          teknolojiler: ["Gaze Analyzer", "Stabilis", "DuoBalance", "OptiPure", "DigitAll", "MidPoint Plus", "SlimEdge", "AutoFit", "Morphing Tasarim"],
          ozellikler: {
            genisMesafe: true,
            genisYakin: true,
            genisOrta: true,
            yuzmeEtkisiAzaltma: true,
            dijitalCihazOptimize: true,
            surusOptimize: true
          },
          indeksler: ["1.50", "1.61", "1.67", "1.74"],
          fiyatAraligi: { min: 32500, max: 105500 },
          hedefKitle: "Performans beklentisi cok yuksek olan progresif cam kullanicilari",
          aciklama: "VR cihazi ile bakis dinamikleri haritasi. Morphing Tasarim ile kisiye ozel. Yapay zeka optimizasyonu. Beyaz 1.50=32.500TL, 1.74=70.500TL. Fotokromik/polarize varyantlar dahil max 105.500TL."
        },
        {
          id: "novax-nucleo-5d-progresif",
          ad: "Nucleo 5D Progresif",
          seviye: "premium",
          tasarim: "freeform-personalized",
          ozelAmac: null,
          koridorlar: [],
          minFittingHeight: 14,
          uyumGarantisi: false,
          teknolojiler: ["Front Surface Innovation", "Rayform AI", "AmplifEye", "Stabilis", "DuoBalance", "DigitAll", "MidPoint Plus", "FlexiFit"],
          ozellikler: {
            genisMesafe: true,
            genisYakin: true,
            genisOrta: true,
            yuzmeEtkisiAzaltma: true,
            dijitalCihazOptimize: true,
            surusOptimize: false
          },
          indeksler: ["1.50", "1.61", "1.67", "1.74"],
          fiyatAraligi: { min: 24500, max: 91500 },
          hedefKitle: "Mukemmel gorus deneyimi arayan progresif cam kullanicilari",
          aciklama: "Stabilis metodolojisi ile binoculer gorus. 4 kisisel konfigurasyon (Dengeli/Uzak/Orta/Yakin). Rayform AI ile akomodasyon hesabi."
        },
        {
          id: "novax-nexus-4d",
          ad: "Nexus 4D",
          seviye: "premium",
          tasarim: "freeform-personalized",
          ozelAmac: null,
          koridorlar: [],
          minFittingHeight: 14,
          uyumGarantisi: false,
          teknolojiler: ["AmplifEye", "Stabilis", "DuoBalance", "OptiPure", "DigitAll", "MidPoint Plus", "SlimEdge"],
          ozellikler: {
            genisMesafe: true,
            genisYakin: true,
            genisOrta: true,
            yuzmeEtkisiAzaltma: false,
            dijitalCihazOptimize: true,
            surusOptimize: false
          },
          indeksler: ["1.50", "1.58", "1.61", "1.67", "1.74"],
          fiyatAraligi: { min: 20500, max: 74000 },
          hedefKitle: "Gorus deneyimini yasam tarzina gore ozellestirmek isteyenler",
          aciklama: "YENI. 4 konfigurasyon (+30% Uzak/Orta/Yakin + %20 Dengeli). Ilk kez progresif cam kullananlar icin kolay adaptasyon. Bombeli cerceve destegi."
        },
        {
          id: "novax-trion-3d",
          ad: "Trion 3D 2.0",
          seviye: "premium",
          tasarim: "freeform-personalized",
          ozelAmac: null,
          koridorlar: [],
          minFittingHeight: 14,
          uyumGarantisi: false,
          teknolojiler: ["Rayform AI", "Stabilis", "DuoBalance", "DigitAll", "MidPoint Plus"],
          ozellikler: {
            genisMesafe: true,
            genisYakin: true,
            genisOrta: true,
            yuzmeEtkisiAzaltma: false,
            dijitalCihazOptimize: true,
            surusOptimize: false
          },
          indeksler: ["1.50", "1.58", "1.61", "1.67", "1.74"],
          fiyatAraligi: { min: 16500, max: 70000 },
          hedefKitle: "Gorus deneyiminde ideal performans arayanlar",
          aciklama: "YENI. 3D ic yuzey tasarim. Cerceve parametreleri (PD/pantoskopik/verteks/bombe) ile uretim."
        },
        // ============ PREMIUM OZEL AMACLI ============
        {
          id: "novax-synthesis-ofis",
          ad: "Synthesis Ofis (Degresif)",
          seviye: "premium",
          tasarim: "freeform-morphing-degresif",
          ozelAmac: "ofis",
          koridorlar: [],
          minFittingHeight: 14,
          uyumGarantisi: false,
          vrGerektirir: true,
          teknolojiler: ["Gaze Analyzer", "OptiPure", "MidPoint Plus", "SlimEdge"],
          ozellikler: {
            genisMesafe: false,
            genisYakin: true,
            genisOrta: true,
            yuzmeEtkisiAzaltma: false,
            dijitalCihazOptimize: true,
            surusOptimize: false
          },
          indeksler: ["1.50", "1.61", "1.67", "1.74"],
          fiyatAraligi: { min: 26500, max: 66500 },
          hedefKitle: "Farkli calisma alanlarina gore net gorus isteyen kullanicilar",
          aciklama: "Ofis/ic mekan icin kisiye ozel degresif. VR ile bakis dinamigi. UZAK SURUS ICIN UYGUN DEGIL."
        },
        {
          id: "novax-nucleo-5d-ofis",
          ad: "Nucleo 5D Ofis",
          seviye: "premium",
          tasarim: "freeform-degresif",
          ozelAmac: "ofis",
          koridorlar: [],
          minFittingHeight: 14,
          uyumGarantisi: false,
          teknolojiler: ["Front Surface Innovation", "Rayform AI", "MidPoint Plus"],
          ozellikler: {
            genisMesafe: false,
            genisYakin: true,
            genisOrta: true,
            yuzmeEtkisiAzaltma: false,
            dijitalCihazOptimize: true,
            surusOptimize: false
          },
          indeksler: ["1.50", "1.61", "1.67", "1.74"],
          fiyatAraligi: { min: 21500, max: 61500 },
          hedefKitle: "Gun boyu ekran kullanan secik presbiyoplar",
          aciklama: "4 calisma mesafe secenegi: 1.3m (yakin ofis), 2m (orta ofis), 4m (genis oda), 6m (cok genis). UZAK SURUS ICIN UYGUN DEGIL."
        },
        {
          id: "novax-nucleo-5d-drive",
          ad: "Nucleo 5D Drive",
          seviye: "premium",
          tasarim: "freeform-personalized",
          ozelAmac: "drive",
          koridorlar: [],
          minFittingHeight: 14,
          uyumGarantisi: false,
          teknolojiler: ["Front Surface Innovation", "Rayform AI", "Stabilis", "DuoBalance", "DigitAll", "MidPoint Plus", "FlexiFit"],
          ozellikler: {
            genisMesafe: true,
            genisYakin: true,
            genisOrta: true,
            yuzmeEtkisiAzaltma: false,
            dijitalCihazOptimize: false,
            surusOptimize: true
          },
          indeksler: ["1.50", "1.61", "1.67", "1.74"],
          fiyatAraligi: { min: 26500, max: 93500 },
          hedefKitle: "Gece suruslerinde konfor arayan presbiyoplar",
          aciklama: "Gece miyopisi telafisi (ust bolge -0.25D). Uzak %70, uzak-orta %45 genis. Astigmatik etki -%14.6."
        },
        {
          id: "novax-nucleo-5d-sport",
          ad: "Nucleo 5D Sport",
          seviye: "premium",
          tasarim: "freeform-personalized",
          ozelAmac: "sport",
          koridorlar: [],
          minFittingHeight: 14,
          uyumGarantisi: false,
          teknolojiler: ["Front Surface Innovation", "Rayform AI", "Stabilis", "DuoBalance", "DigitAll", "MidPoint Plus", "FlexiFit"],
          ozellikler: {
            genisMesafe: true,
            genisYakin: true,
            genisOrta: true,
            yuzmeEtkisiAzaltma: true,
            dijitalCihazOptimize: false,
            surusOptimize: true
          },
          indeksler: ["1.50", "1.61", "1.67", "1.74"],
          fiyatAraligi: { min: 26500, max: 93500 },
          hedefKitle: "Spor yaparken bombeli gozluklerde net gorus isteyen aktif kullanicilar",
          aciklama: "180 derece panoramik uzak gorus. Bombeli cerceveler icin optimize. Aktif yasam tarzi."
        },
        {
          id: "novax-nucleo-5d-pilot",
          ad: "Nucleo 5D Pilot",
          seviye: "premium",
          tasarim: "freeform-personalized-dual-near",
          ozelAmac: "pilot",
          koridorlar: [],
          minFittingHeight: 14,
          uyumGarantisi: false,
          teknolojiler: ["Rayform AI", "Stabilis", "DuoBalance", "DigitAll", "MidPoint Plus", "FlexiFit"],
          ozellikler: {
            genisMesafe: true,
            genisYakin: true,
            genisOrta: true,
            yuzmeEtkisiAzaltma: false,
            dijitalCihazOptimize: false,
            surusOptimize: false
          },
          indeksler: ["1.50", "1.61", "1.67", "1.74"],
          fiyatAraligi: { min: 26500, max: 93500 },
          hedefKitle: "Pilotlar, dis hekimleri, tesisatcilar, araba tamircileri",
          aciklama: "Ust bolgede 42mm yakin gorus ek adisyon alani. Hem ust hem alt yakin gorus."
        },
        {
          id: "novax-synthesis-antifatigue",
          ad: "Synthesis Anti-fatigue",
          seviye: "premium",
          tasarim: "freeform-morphing-antifatigue",
          ozelAmac: "antifatigue",
          koridorlar: [],
          minFittingHeight: null,
          uyumGarantisi: false,
          vrGerektirir: true,
          teknolojiler: ["Gaze Analyzer", "Stabilis", "OptiPure", "MidPoint Plus", "SlimEdge"],
          ozellikler: {
            genisMesafe: true,
            genisYakin: true,
            genisOrta: false,
            yuzmeEtkisiAzaltma: false,
            dijitalCihazOptimize: true,
            surusOptimize: false
          },
          indeksler: ["1.50", "1.61", "1.67", "1.74"],
          fiyatAraligi: { min: 21500, max: 64500 },
          addSecenekleri: { hipermetrop: [0.60, 0.80, 1.00, 1.20], miyop: [0.40, 0.60, 0.80, 1.00] },
          hedefKitle: "Dijital goz yorgunlugu ve bas agrisi hassasiyeti olan genc yetiskinler",
          aciklama: "Presbiyopi ONCESI anti-fatigue cam. VR ile kisisel bakis dinamigi. Miyop/Hipermetrop ayri adisyon secenekleri."
        },
        {
          id: "novax-nucleo-5d-antifatigue",
          ad: "Nucleo 5D Anti-fatigue",
          seviye: "premium",
          tasarim: "double-asferik-antifatigue",
          ozelAmac: "antifatigue",
          koridorlar: [],
          minFittingHeight: null,
          uyumGarantisi: false,
          teknolojiler: ["Rayform AI", "Stabilis", "MidPoint Plus"],
          ozellikler: {
            genisMesafe: true,
            genisYakin: true,
            genisOrta: false,
            yuzmeEtkisiAzaltma: false,
            dijitalCihazOptimize: true,
            surusOptimize: false
          },
          indeksler: ["1.61", "1.67", "1.74"],
          fiyatAraligi: { min: 26500, max: 59500 },
          addSecenekleri: { seviyeler: [0.50, 0.75, 1.00] },
          hedefKitle: "Goz yorgunlugu yasayan genc yetiskinler",
          aciklama: "3 adisyon seviyesi (0.50/0.75/1.00D). Yogunlastirilmis yakin adisyon. Tek odakli konforunda."
        },
        // ============ CLASSIC PROGRESIF ============
        {
          id: "novax-matrix-hd",
          ad: "Matrix HD",
          seviye: "orta",
          tasarim: "freeform",
          ozelAmac: null,
          koridorlar: [],
          minFittingHeight: 14,
          uyumGarantisi: false,
          teknolojiler: ["Rayform AI", "DuoBalance", "DigitAll", "MidPoint Plus"],
          ozellikler: { genisMesafe: true, genisYakin: true, genisOrta: true, yuzmeEtkisiAzaltma: false, dijitalCihazOptimize: true, surusOptimize: false },
          indeksler: ["1.50", "1.58", "1.61", "1.67", "1.74"],
          fiyatAraligi: { min: 12500, max: 62000 },
          hedefKitle: "Yumusak ve dengeli gecisle dogal gorus arayan kullanicilar",
          aciklama: "YENI. Kisisel progresif tasarim altyapisi, varsayilan parametrelerle uretim. Hizli adaptasyon."
        },
        {
          id: "novax-genius",
          ad: "Genius",
          seviye: "orta",
          tasarim: "freeform",
          ozelAmac: null,
          koridorlar: [],
          minFittingHeight: 14,
          uyumGarantisi: false,
          teknolojiler: ["Rayform AI", "DuoBalance", "DigitAll", "MidPoint"],
          ozellikler: { genisMesafe: true, genisYakin: true, genisOrta: true, yuzmeEtkisiAzaltma: false, dijitalCihazOptimize: false, surusOptimize: true },
          indeksler: ["1.50", "1.58", "1.61", "1.67", "1.74"],
          fiyatAraligi: { min: 10500, max: 60000 },
          hedefKitle: "Aktif presbiyoplar, dis mekanda net gorus arayanlar",
          aciklama: "YENI. Uzak gorus alani oncelikli. Acik alanlarda net ve rahat gorus."
        },
        {
          id: "novax-ventro",
          ad: "Ventro",
          seviye: "baslangic",
          tasarim: "freeform",
          ozelAmac: null,
          koridorlar: [],
          minFittingHeight: 14,
          uyumGarantisi: false,
          teknolojiler: ["DuoBalance", "MidPoint"],
          ozellikler: { genisMesafe: false, genisYakin: true, genisOrta: true, yuzmeEtkisiAzaltma: false, dijitalCihazOptimize: true, surusOptimize: false },
          indeksler: ["1.50", "1.58", "1.61", "1.67"],
          fiyatAraligi: { min: 8500, max: 21000 },
          hedefKitle: "Ic mekanda okuma, ekran kullanimi odakli presbiyoplar",
          aciklama: "Yakin gorus oncelikli. Ic yuzey tasarim, genis yakin alan. UZAK SURUS ICIN UYGUN DEGIL."
        },
        {
          id: "novax-novum-ng",
          ad: "Novum NG",
          seviye: "baslangic",
          tasarim: "freeform",
          ozelAmac: null,
          koridorlar: [],
          minFittingHeight: 14,
          uyumGarantisi: false,
          teknolojiler: ["Rayform AI", "DuoBalance", "MidPoint"],
          ozellikler: { genisMesafe: true, genisYakin: true, genisOrta: true, yuzmeEtkisiAzaltma: false, dijitalCihazOptimize: false, surusOptimize: false },
          indeksler: ["1.50", "1.58", "1.61", "1.67"],
          fiyatAraligi: { min: 7500, max: 20000 },
          hedefKitle: "Ilk progresif kullanicilari, farkli yasam tarzlari",
          aciklama: "FreeForm. Dengeli gorus alanlari, kisa sure adaptasyon. En ekonomik kisisel progresif."
        },
        // ============ CLASSIC OZEL AMACLI ============
        {
          id: "novax-sportive",
          ad: "Sportive Progresif",
          seviye: "orta",
          tasarim: "freeform-personalized",
          ozelAmac: "sport",
          koridorlar: [],
          minFittingHeight: 14,
          uyumGarantisi: false,
          teknolojiler: ["Rayform AI", "Stabilis", "DuoBalance", "DigitAll", "MidPoint Plus"],
          ozellikler: { genisMesafe: true, genisYakin: true, genisOrta: true, yuzmeEtkisiAzaltma: true, dijitalCihazOptimize: false, surusOptimize: true },
          indeksler: ["1.50", "1.58", "1.61", "1.67", "1.74"],
          fiyatAraligi: { min: 17500, max: 71000 },
          hedefKitle: "Yuksek bombeli spor cerceveler kullanan aktif kullanicilar (bisiklet/golf/kayak/tenis/atis/yelken)",
          aciklama: "YENI. Spor aktivitelerine ozel. Tek odakli ve progresif secenekleri."
        },
        {
          id: "novax-driveon",
          ad: "DriveOn Progresif",
          seviye: "orta",
          tasarim: "freeform-personalized",
          ozelAmac: "drive",
          koridorlar: [],
          minFittingHeight: 14,
          uyumGarantisi: false,
          standartKaplama: "novax-pixar-drive",
          teknolojiler: ["Rayform AI", "Stabilis", "DuoBalance", "DigitAll", "MidPoint Plus"],
          ozellikler: { genisMesafe: true, genisYakin: true, genisOrta: true, yuzmeEtkisiAzaltma: false, dijitalCihazOptimize: false, surusOptimize: true },
          indeksler: ["1.50", "1.58", "1.61", "1.67", "1.74"],
          fiyatAraligi: { min: 17500, max: 71000 },
          hedefKitle: "Sik arac kullanan, uzun yol ve gece surucu presbiyoplar",
          aciklama: "YENI. Surucu gorus alani optimize. PixAR DRIVE kaplama STANDART (yansima %0.5 alti). UV400+UV420."
        },
        {
          id: "novax-officient",
          ad: "Officient",
          seviye: "baslangic",
          tasarim: "degresif",
          ozelAmac: "ofis",
          koridorlar: [],
          minFittingHeight: 14,
          uyumGarantisi: false,
          teknolojiler: [],
          ozellikler: { genisMesafe: false, genisYakin: true, genisOrta: true, yuzmeEtkisiAzaltma: true, dijitalCihazOptimize: true, surusOptimize: false },
          indeksler: ["1.50", "1.58", "1.61", "1.67", "1.74"],
          fiyatAraligi: { min: 7500, max: 33500 },
          hedefKitle: "Orta yas grubu profesyoneller, ofis calisanlari",
          aciklama: "7 degresyon secenegi. Yakin gorus gozbebegi 14mm alt. Yuzme etkisi yok. UZAK SURUS ICIN UYGUN DEGIL."
        },
        {
          id: "novax-serenity",
          ad: "Serenity",
          seviye: "baslangic",
          tasarim: "tek-odakli-antifatigue",
          ozelAmac: "antifatigue",
          koridorlar: [],
          minFittingHeight: null,
          uyumGarantisi: false,
          teknolojiler: ["MidPoint"],
          ozellikler: { genisMesafe: true, genisYakin: true, genisOrta: false, yuzmeEtkisiAzaltma: false, dijitalCihazOptimize: true, surusOptimize: false },
          indeksler: ["1.50", "1.58", "1.61", "1.67", "1.74"],
          fiyatAraligi: { min: 8000, max: 53000 },
          addSecenekleri: { seviyeler: [0.30, 0.50, 0.75, 1.00, 1.25, 1.50] },
          hedefKitle: "Dijital goz yorgunlugu yasayan tek odakli kullanicilar (presbiyopi oncesi)",
          aciklama: "YENI. 6 adisyon seviyesi. Anti-fatigue tek odakli cam. Presbiyopi hazirlik donemi."
        },
        // ============ MIYOPI KONTROL ============
        {
          id: "novax-myopi-x",
          ad: "Myopi-X",
          seviye: "baslangic",
          tasarim: "miyopi-kontrol",
          ozelAmac: "miyopikontrol",
          koridorlar: [],
          minFittingHeight: null,
          uyumGarantisi: false,
          teknolojiler: ["Yapay Zeka", "Periferik Defokus"],
          ozellikler: { genisMesafe: true, genisYakin: false, genisOrta: false, yuzmeEtkisiAzaltma: false, dijitalCihazOptimize: false, surusOptimize: false },
          indeksler: ["1.50", "1.58", "1.61", "1.67", "1.74"],
          fiyatAraligi: { min: 9500, max: 36500 },
          hedefKitle: "Miyopisi ilerleyen cocuklar",
          aciklama: "Yapay zeka ile uretilen ilk miyopi kontrol cami. Periferik hipermetropik defokus ile goz kuresi uzamasini yavaslatir."
        },
        {
          id: "novax-myopi-x-circle",
          ad: "Myopi-X C.I.R.C.L.E.",
          seviye: "baslangic",
          tasarim: "miyopi-kontrol-defokus",
          ozelAmac: "miyopikontrol",
          koridorlar: [],
          minFittingHeight: null,
          uyumGarantisi: false,
          teknolojiler: ["Defokus Mikro Lens Dizisi", "FreeForm Ic Yuzey"],
          ozellikler: { genisMesafe: true, genisYakin: false, genisOrta: false, yuzmeEtkisiAzaltma: false, dijitalCihazOptimize: false, surusOptimize: false },
          indeksler: ["1.61"],
          fiyatAraligi: { min: 12000, max: 12000 },
          hedefKitle: "Miyopisi ilerleyen cocuklar (yeni nesil defokus)",
          aciklama: "YENI. 907 sferik olmayan mikro lens, 12 dairesel halka. Defokus/Adisyon +3.50 ~ +4.50D."
        },
        // ============ BIFOKAL ============
        {
          id: "novax-bifokal-d28",
          ad: "Bifokal Standart D28",
          seviye: "baslangic",
          tasarim: "bifokal",
          ozelAmac: "bifokal",
          koridorlar: [],
          minFittingHeight: null,
          uyumGarantisi: false,
          teknolojiler: [],
          ozellikler: { genisMesafe: true, genisYakin: true, genisOrta: false, yuzmeEtkisiAzaltma: false, dijitalCihazOptimize: false, surusOptimize: false },
          indeksler: ["1.50", "1.58", "1.61", "1.67", "1.74"],
          fiyatAraligi: { min: 7500, max: 52500 },
          hedefKitle: "Progresif kullanamayan / asiri anizometrop presbiyoplar",
          aciklama: "Ekonomik bifokal. D28 segment. Iki farkli gorus mesafesi."
        },
        {
          id: "novax-bifokal-freeform-rs",
          ad: "Bifokal FreeForm RS28/40/60",
          seviye: "orta",
          tasarim: "bifokal-freeform",
          ozelAmac: "bifokal",
          koridorlar: [],
          minFittingHeight: null,
          uyumGarantisi: false,
          teknolojiler: ["FreeForm"],
          ozellikler: { genisMesafe: true, genisYakin: true, genisOrta: false, yuzmeEtkisiAzaltma: false, dijitalCihazOptimize: false, surusOptimize: false },
          indeksler: ["1.50", "1.58", "1.61", "1.67", "1.74"],
          fiyatAraligi: { min: 7500, max: 52500 },
          hedefKitle: "Kucuk yastaki cocuklar, progresife uyum saglamayan presbiyoplar, monoculer goz tembellikleri",
          aciklama: "FreeForm bifokal, belirgin olmayan segment. 3 segment secenegi (RS28/RS40/RS60). Goruntu atlamasi olmadan yakin gorus."
        }
      ],
      // Novax kaplamalari (PixAR serisi - Mart 2026 katalogu).
      // GRANITE Standart ucretsiz, her Novax caminda varsayilan.
      // BLUV (+1150), DRIVE (+1900), AQUA (+1900) opsiyonel ek kaplamalar.
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
        },
        {
          id: "novax-pixar-bluv",
          ad: "PixAR BLUV",
          kod: "PIX500BL",
          tip: "mavi-isik-filtresi",
          ucret: 1150,
          ozellikler: {
            superHidrofobik: true,
            uvFiltresi: "UV420",
            maviIsikFiltresi: true,
            sertlik: "9H"
          },
          hedefKitle: "Uzun saat ekran karsisinda calisanlar",
          aciklama: "Mavi-mor isigi (380-420nm) filtreleyen kaplama. Dijital goz yorgunlugunu azaltir. +1.150TL."
        },
        {
          id: "novax-pixar-drive",
          ad: "PixAR DRIVE",
          kod: "PIX800DV",
          tip: "surus",
          ucret: 1900,
          ozellikler: {
            superHidrofobik: true,
            uvFiltresi: "UV400",
            parlamaAzaltma: true,
            geceSurus: true,
            sertlik: "9H"
          },
          hedefKitle: "Sik gece surusu yapanlar",
          aciklama: "Arac farlarindan, sokak lambalarindan gelen parlamalari azaltir. Gece kontrast iyilestirici. +1.900TL."
        },
        {
          id: "novax-pixar-aqua",
          ad: "PixAR AQUA",
          kod: "PIX800AU",
          tip: "su-iticilik",
          ucret: 1900,
          ozellikler: {
            superHidrofobik: true,
            uvFiltresi: "UV400",
            suIticilikGuclu: true,
            buguOnleyici: true,
            sertlik: "9H"
          },
          hedefKitle: "Su sporlari, yagmurlu iklim, yuzme seven kullanicilar",
          aciklama: "Extra su iticilik (lotus etkisi). Yagmur damlalari kaymaz. Buguya karsi dayanikli. +1.900TL."
        }
      ],
      // Novax ozel islemler (Mart 2026 katalogu - tahmini, ayri sayfada detaylandirilacak)
      ozelIslemler: [
        { id: "midpoint-plus", ad: "MidPoint Plus (Pantoskopik+Verteks+Bombe)", ucret: 750 },
        { id: "ara-cap", ad: "Ara Cap", ucret: 360 },
        { id: "prizma", ad: "Prizmatik", ucret: 450 }
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
