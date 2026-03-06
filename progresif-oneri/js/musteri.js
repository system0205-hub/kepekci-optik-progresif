// Kepekci Optik - Musteri Veri Katmani
// localStorage CRUD islemleri

const MUSTERI_KEY = "kepekci_musteriler";

function _musteriListesiOku() {
  try {
    const data = localStorage.getItem(MUSTERI_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Musteri verisi okunamadi:", e);
    return [];
  }
}

function _musteriListesiYaz(liste) {
  try {
    localStorage.setItem(MUSTERI_KEY, JSON.stringify(liste));
  } catch (e) {
    console.error("Musteri verisi yazilamadi:", e);
    bildirimGoster("Veri kaydedilemedi. Depolama alani dolu olabilir.", "hata");
  }
}

function musteriKaydet(musteri) {
  const liste = _musteriListesiOku();
  if (!musteri.id) {
    musteri.id = "m_" + Date.now();
  }
  if (!musteri.kayitTarih) {
    musteri.kayitTarih = new Date().toISOString().split("T")[0];
  }
  if (!musteri.analizler) musteri.analizler = [];
  if (!musteri.sorunlar) musteri.sorunlar = [];
  liste.push(musteri);
  _musteriListesiYaz(liste);
  return musteri;
}

function musteriGetir(id) {
  const liste = _musteriListesiOku();
  for (let i = 0; i < liste.length; i++) {
    if (liste[i].id === id) return liste[i];
  }
  return null;
}

function tumMusterileriGetir() {
  return _musteriListesiOku();
}

function musteriGuncelle(id, data) {
  const liste = _musteriListesiOku();
  for (let i = 0; i < liste.length; i++) {
    if (liste[i].id === id) {
      Object.keys(data).forEach(function(key) {
        liste[i][key] = data[key];
      });
      _musteriListesiYaz(liste);
      return liste[i];
    }
  }
  return null;
}

function musteriSil(id) {
  const liste = _musteriListesiOku();
  const yeniListe = liste.filter(function(m) { return m.id !== id; });
  _musteriListesiYaz(yeniListe);
  return yeniListe.length < liste.length;
}

function musteriAra(sorgu) {
  if (!sorgu || sorgu.trim() === "") return tumMusterileriGetir();
  const s = sorgu.toLowerCase().trim();
  return _musteriListesiOku().filter(function(m) {
    return (m.ad && m.ad.toLowerCase().indexOf(s) !== -1) ||
           (m.telefon && m.telefon.indexOf(s) !== -1);
  });
}

/**
 * Tum musteri verilerini JSON dosyasi olarak indir (yedekleme)
 */
function veriYedekle() {
  const musteriler = _musteriListesiOku();
  if (musteriler.length === 0) {
    bildirimGoster("Yedeklenecek musteri verisi bulunamadi.", "hata");
    return;
  }

  const yedekVeri = {
    uygulama: "Kepekci Optik - Progresif Cam Oneri Sistemi",
    versiyon: "1.0",
    tarih: new Date().toISOString(),
    musteriSayisi: musteriler.length,
    musteriler: musteriler
  };

  const json = JSON.stringify(yedekVeri, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const tarih = new Date().toISOString().slice(0, 10);
  const dosyaAdi = "kepekci-optik-yedek-" + tarih + ".json";

  const a = document.createElement("a");
  a.href = url;
  a.download = dosyaAdi;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  bildirimGoster(musteriler.length + " musteri verisi yedeklendi.", "basarili");
}

/**
 * JSON yedek dosyasindan musteri verilerini geri yukle
 * @param {File} dosya - Kullanicinin sectigi JSON dosyasi
 */
function veriGeriYukle(dosya) {
  if (!dosya) return;

  if (!dosya.name.endsWith(".json")) {
    bildirimGoster("Lutfen .json uzantili bir yedek dosyasi secin.", "hata");
    return;
  }

  const reader = new FileReader();

  reader.onload = function(e) {
    try {
      const veri = JSON.parse(e.target.result);

      // Validasyon
      if (!veri.musteriler || !Array.isArray(veri.musteriler)) {
        bildirimGoster("Gecersiz yedek dosyasi: musteri verisi bulunamadi.", "hata");
        return;
      }

      // Her musterinin temel alanlarini kontrol et
      for (let i = 0; i < veri.musteriler.length; i++) {
        const m = veri.musteriler[i];
        if (!m.id || !m.ad) {
          bildirimGoster("Gecersiz yedek dosyasi: " + (i + 1) + ". musteri verisi bozuk.", "hata");
          return;
        }
      }

      // Mevcut verileri kontrol et
      const mevcutListe = _musteriListesiOku();
      if (mevcutListe.length > 0) {
        const onay = confirm(
          "Dikkat: Mevcut " + mevcutListe.length + " musteri verisi silinecek ve " +
          veri.musteriler.length + " musteri verisi ile degistirilecek.\n\n" +
          "Devam etmek istiyor musunuz?"
        );
        if (!onay) {
          bildirimGoster("Geri yukleme iptal edildi.", "bilgi");
          return;
        }
      }

      _musteriListesiYaz(veri.musteriler);
      bildirimGoster(
        veri.musteriler.length + " musteri verisi basariyla geri yuklendi." +
        (veri.tarih ? " (Yedek tarihi: " + veri.tarih.slice(0, 10) + ")" : ""),
        "basarili"
      );

      // Listeyi yenile (musteri-ui.js'deki fonksiyon)
      if (typeof musteriListesiGoster === "function") {
        musteriListesiGoster();
      }
    } catch (err) {
      console.error("Yedek dosyasi okunamadi:", err);
      bildirimGoster("Yedek dosyasi okunamadi. Dosya bozuk olabilir.", "hata");
    }
  };

  reader.onerror = function() {
    bildirimGoster("Dosya okunamadi. Lutfen tekrar deneyin.", "hata");
  };

  reader.readAsText(dosya);
}

function analizEkle(musteriId, analizData) {
  const liste = _musteriListesiOku();
  for (let i = 0; i < liste.length; i++) {
    if (liste[i].id === musteriId) {
      if (!liste[i].analizler) liste[i].analizler = [];
      if (!analizData.tarih) {
        analizData.tarih = new Date().toISOString().split("T")[0];
      }
      liste[i].analizler.push(analizData);
      _musteriListesiYaz(liste);
      return liste[i];
    }
  }
  return null;
}
