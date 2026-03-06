// Kepekci Optik - Coklu Dil Altyapisi (i18n)
// Kullanim: t("anahtar") seklinde cagrilir

var _aktifDil = "tr";
var _diller = {};

// Turkce (varsayilan)
_diller.tr = {
  // Genel
  "app.baslik": "Kepekci Optik - Progresif Cam Oneri Sistemi",
  "app.footer": "Bu sistem oneri niteligindedir, kesin teshis yerine gecmez.",

  // Formlar
  "form.sagGoz": "Sag Goz",
  "form.solGoz": "Sol Goz",
  "form.uzakNumara": "Uzak Numara (SPH)",
  "form.silindir": "Silindir (CYL)",
  "form.derece": "Derece (AX)",
  "form.yakinIlave": "Yakin Ilave (ADD)",
  "form.gozMesafesi": "Goz Mesafesi (PD)",
  "form.odakYuksekligi": "Odak Yuksekligi",
  "form.cerceveYuksekligi": "Cerceve Yuksekligi (B)",
  "form.cerceveGenisligi": "Cerceve Genisligi (A)",

  // Sonuclar
  "sonuc.zorlukDerecesi": "Zorluk Derecesi",
  "sonuc.gecisOnerisi": "Gecis Bolgesi (Koridor) Onerisi",
  "sonuc.markaOnerileri": "Marka/Model Onerileri",
  "sonuc.uyarilar": "Uyarilar",
  "sonuc.bilgiNotlari": "Bilgi Notlari",
  "sonuc.camKarsilastirma": "Cam Karsilastirma",
  "sonuc.siparisKontrol": "Siparis Kontrol Listesi",
  "sonuc.montajKontrol": "Montaj Kontrol Listesi",

  // Butonlar
  "btn.analizYap": "Analiz Yap",
  "btn.yazdir": "Yazdir",
  "btn.kopyala": "Kopyala",
  "btn.hastaTalimati": "Hasta Talimati Yazdir",
  "btn.musteriKaydet": "Musteri Olarak Kaydet",
  "btn.whatsappPaylas": "WhatsApp Paylas",
  "btn.veriYedekle": "Veri Yedekle",
  "btn.veriYukle": "Veri Yukle",

  // Musteri
  "musteri.baslik": "Musteriler",
  "musteri.yeniMusteri": "+ Yeni Musteri",
  "musteri.aramaPlaceholder": "Ad veya telefon ile ara...",
  "musteri.istatistikler": "Istatistikler",
  "musteri.analizeDon": "Analize Don",

  // Risk
  "risk.dusuk": "Dusuk Zorluk",
  "risk.orta": "Orta Zorluk",
  "risk.yuksek": "Yuksek Zorluk",
  "risk.cokYuksek": "Cok Yuksek Zorluk",

  // Bildirimler
  "bildirim.kaydedildi": "Kaydedildi!",
  "bildirim.silindi": "Silindi!",
  "bildirim.hata": "Bir hata olustu.",
  "bildirim.kopyalandi": "Sonuclar panoya kopyalandi!"
};

// Ingilizce
_diller.en = {
  // General
  "app.baslik": "Kepekci Optik - Progressive Lens Recommendation System",
  "app.footer": "This system is advisory only and does not replace clinical diagnosis.",

  // Forms
  "form.sagGoz": "Right Eye",
  "form.solGoz": "Left Eye",
  "form.uzakNumara": "Distance Power (SPH)",
  "form.silindir": "Cylinder (CYL)",
  "form.derece": "Axis (AX)",
  "form.yakinIlave": "Near Addition (ADD)",
  "form.gozMesafesi": "Pupillary Distance (PD)",
  "form.odakYuksekligi": "Fitting Height",
  "form.cerceveYuksekligi": "Frame Height (B)",
  "form.cerceveGenisligi": "Frame Width (A)",

  // Results
  "sonuc.zorlukDerecesi": "Difficulty Level",
  "sonuc.gecisOnerisi": "Corridor Recommendation",
  "sonuc.markaOnerileri": "Brand/Model Recommendations",
  "sonuc.uyarilar": "Warnings",
  "sonuc.bilgiNotlari": "Information Notes",
  "sonuc.camKarsilastirma": "Lens Comparison",
  "sonuc.siparisKontrol": "Order Checklist",
  "sonuc.montajKontrol": "Fitting Checklist",

  // Buttons
  "btn.analizYap": "Analyze",
  "btn.yazdir": "Print",
  "btn.kopyala": "Copy",
  "btn.hastaTalimati": "Print Patient Instructions",
  "btn.musteriKaydet": "Save as Customer",
  "btn.whatsappPaylas": "Share via WhatsApp",
  "btn.veriYedekle": "Backup Data",
  "btn.veriYukle": "Restore Data",

  // Customer
  "musteri.baslik": "Customers",
  "musteri.yeniMusteri": "+ New Customer",
  "musteri.aramaPlaceholder": "Search by name or phone...",
  "musteri.istatistikler": "Statistics",
  "musteri.analizeDon": "Back to Analysis",

  // Risk
  "risk.dusuk": "Low Difficulty",
  "risk.orta": "Medium Difficulty",
  "risk.yuksek": "High Difficulty",
  "risk.cokYuksek": "Very High Difficulty",

  // Notifications
  "bildirim.kaydedildi": "Saved!",
  "bildirim.silindi": "Deleted!",
  "bildirim.hata": "An error occurred.",
  "bildirim.kopyalandi": "Results copied to clipboard!"
};

/**
 * Ceviri fonksiyonu
 * @param {string} anahtar - Ceviri anahtari (ornegin "btn.yazdir")
 * @returns {string} Cevrilen metin veya anahtar
 */
function t(anahtar) {
  var dil = _diller[_aktifDil];
  if (dil && dil[anahtar]) return dil[anahtar];
  // Fallback: Turkce
  if (_diller.tr && _diller.tr[anahtar]) return _diller.tr[anahtar];
  return anahtar;
}

/**
 * Aktif dili degistir
 * @param {string} dilKodu - "tr" veya "en"
 */
function dilDegistir(dilKodu) {
  if (!_diller[dilKodu]) {
    console.warn("Desteklenmeyen dil:", dilKodu);
    return;
  }
  _aktifDil = dilKodu;
  try {
    localStorage.setItem("kepekci_dil", dilKodu);
  } catch (e) { /* ignore */ }

  // data-i18n attribute'lu elementleri guncelle
  document.querySelectorAll("[data-i18n]").forEach(function(el) {
    var anahtar = el.getAttribute("data-i18n");
    el.textContent = t(anahtar);
  });

  // data-i18n-placeholder attribute'lu elementleri guncelle
  document.querySelectorAll("[data-i18n-placeholder]").forEach(function(el) {
    var anahtar = el.getAttribute("data-i18n-placeholder");
    el.placeholder = t(anahtar);
  });
}

/**
 * Mevcut dili dondur
 */
function aktifDilGetir() {
  return _aktifDil;
}

/**
 * Kayitli dili yukle (sayfa yuklendiginde)
 */
function kayitliDiliYukle() {
  try {
    var kayitli = localStorage.getItem("kepekci_dil");
    if (kayitli && _diller[kayitli]) {
      _aktifDil = kayitli;
    }
  } catch (e) { /* ignore */ }
}

// Sayfa yuklendiginde kayitli dili oku
kayitliDiliYukle();
