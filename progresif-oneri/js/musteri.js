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
