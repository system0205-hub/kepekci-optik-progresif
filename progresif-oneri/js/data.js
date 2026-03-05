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
          minFittingHeight: 14,
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
          fiyatAraligi: { min: 21000, max: 34000 },
          hedefKitle: "Sehir yasami, coklu aktivite",
          aciklama: "4 farkli gorus profili: Cok Yonlu, Uzak (surus), Ekran (bilgisayar), Yakin (okuma). UV/mavi isik koruma."
        },
        {
          id: "kodak-atlas",
          ad: "Atlas",
          seviye: "orta",
          tasarim: "freeform",
          koridorlar: [17],
          minFittingHeight: 18,
          teknolojiler: ["Vision First", "i-Sync", "FreeForm", "Desentrasyon"],
          ozellikler: {
            genisMesafe: false,
            genisYakin: true,
            genisOrta: true,
            yuzmeEtkisiAzaltma: false,
            dijitalCihazOptimize: true,
            surusOptimize: false
          },
          indeksler: ["1.50", "1.56", "1.60", "1.67"],
          fiyatAraligi: { min: 14000, max: 26400 },
          hedefKitle: "6+ saat ekran kullanan 40+ kullanicilar",
          aciklama: "Dijital cihaz odakli, genis yakin alan. Sabit 17mm gecis bolgesi. Bilgisayar calisanlari icin ideal."
        },
        {
          id: "kodak-precise",
          ad: "Precise",
          seviye: "orta",
          tasarim: "freeform",
          koridorlar: [18],
          koridorlarShort: [13],
          minFittingHeight: 19,
          minFittingHeightShort: 14,
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
          aciklama: "Yumusak gecis. Kucuk cerceve icin Short versiyonu (13mm) mevcut."
        },
        {
          id: "kodak-intro",
          ad: "Intro PAL",
          seviye: "baslangic",
          tasarim: "dijital",
          koridorlar: [13, 18],
          minFittingHeight: 14,
          teknolojiler: ["Vision First", "Baz Kontrolu"],
          ozellikler: {
            genisMesafe: true,
            genisYakin: false,
            genisOrta: false,
            yuzmeEtkisiAzaltma: false,
            dijitalCihazOptimize: false,
            surusOptimize: false
          },
          indeksler: ["1.50", "1.56", "1.60", "1.67"],
          fiyatAraligi: { min: 6950, max: 18400 },
          hedefKitle: "Ilk kez progresif cam kullananlar",
          aciklama: "Giris seviyesi. Yumusak tasarim, kolay alisma. Ilk kullanici icin ideal."
        }
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
          koridorlar: [17],
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
          aciklama: "Dengeli gorus, dis mekan odakli. Uygun fiyat."
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
          fiyatAraligi: { min: 4800, max: 22000 },
          hedefKitle: "Genel kullanim, uygun fiyat",
          aciklama: "Baslangic seviyesi. Genis indeks yelpazesi. En uygun fiyat."
        }
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
        },
        {
          id: "novax-granite-kisisel",
          ad: "Granite Kisisel",
          seviye: "premium",
          tasarim: "freeform",
          koridorlar: [],
          minFittingHeight: 14,
          teknolojiler: ["Degisken Bazli Kisisel"],
          ozellikler: {
            genisMesafe: true,
            genisYakin: true,
            genisOrta: true,
            yuzmeEtkisiAzaltma: false,
            dijitalCihazOptimize: true,
            surusOptimize: true
          },
          goruntuProfilleri: ["Drive", "Sport", "Pilot", "Ofis"],
          indeksler: ["1.50", "1.58", "1.61", "1.67", "1.74"],
          fiyatAraligi: { min: 17500, max: 48500 },
          hedefKitle: "Kisisel, yuksek performans arayanlar",
          aciklama: "4 farkli profil: Surus, Spor, Pilot, Ofis. Degisken baz ile kisisel uretim."
        },
        {
          id: "novax-granite-standart",
          ad: "Granite Standart",
          seviye: "baslangic",
          tasarim: "standart",
          koridorlar: [],
          minFittingHeight: 16,
          teknolojiler: [],
          ozellikler: {
            genisMesafe: true,
            genisYakin: false,
            genisOrta: false,
            yuzmeEtkisiAzaltma: false,
            dijitalCihazOptimize: false,
            surusOptimize: false
          },
          indeksler: ["1.50", "1.58", "1.61", "1.67", "1.74"],
          fiyatAraligi: { min: 7500, max: 28000 },
          hedefKitle: "Genel kullanim, uygun fiyat",
          aciklama: "4 farkli standart seri (MX, GN, VR, NG). Genis indeks yelpazesi."
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
          teknolojiler: ["Cerceve Parametreleri ile Uretim"],
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
          hedefKitle: "Tum meslek gruplari",
          aciklama: "En ust seviye. Cerceve parametreleri ile uretim. MAX (ADD 4.00) ve MIO (ADD 3.00) secenekleri."
        },
        {
          id: "va-anateo",
          ad: "Anateo Max / Mio",
          seviye: "orta",
          tasarim: "freeform",
          koridorlar: [],
          minFittingHeight: 14,
          teknolojiler: [],
          ozellikler: {
            genisMesafe: true,
            genisYakin: true,
            genisOrta: true,
            yuzmeEtkisiAzaltma: false,
            dijitalCihazOptimize: false,
            surusOptimize: false
          },
          indeksler: ["1.50", "1.60", "1.67"],
          fiyatAraligi: { min: 13000, max: 26300 },
          hedefKitle: "Genel kullanim",
          aciklama: "Orta seviye. MAX ve MIO secenekleri. Uyum garantili."
        },
        {
          id: "va-sirus",
          ad: "Sirus Max / Mio",
          seviye: "orta",
          tasarim: "freeform",
          koridorlar: [],
          minFittingHeight: 14,
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
          fiyatAraligi: { min: 9500, max: 24000 },
          hedefKitle: "Genel kullanim, genis indeks yelpazesi",
          aciklama: "Genis malzeme secenekleri. Uyum garantili."
        },
        {
          id: "va-quadro",
          ad: "Quadro",
          seviye: "baslangic",
          tasarim: "standart",
          koridorlar: [],
          minFittingHeight: 16,
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
          fiyatAraligi: { min: 6500, max: 16000 },
          hedefKitle: "Genel kullanim, giris seviye",
          aciklama: "Standart progresif, uygun fiyat."
        }
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
