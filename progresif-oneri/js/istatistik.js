// Kepekci Optik - Istatistik / Oruntu Analizi

function istatistikleriHesapla() {
  const musteriler = tumMusterileriGetir();

  const toplamMusteri = musteriler.length;
  let toplamSorun = 0;
  let acikSorun = 0;
  let cozulenSorun = 0;
  const kategoriSayac = {};
  let toplamRisk = 0;
  let riskSayac = 0;
  let yuksekRiskMusteri = 0;
  let yuksekRiskSorunlu = 0;

  musteriler.forEach(function(m) {
    // Sorunlar
    const sorunlar = m.sorunlar || [];
    toplamSorun += sorunlar.length;
    sorunlar.forEach(function(s) {
      if (s.durum === "acik") acikSorun++;
      if (s.durum === "cozuldu") cozulenSorun++;
      kategoriSayac[s.kategori] = (kategoriSayac[s.kategori] || 0) + 1;
    });

    // Analizler - risk skoru
    const analizler = m.analizler || [];
    let enYuksekRisk = 0;
    analizler.forEach(function(a) {
      if (a.sonuc && a.sonuc.risk && a.sonuc.risk.skor) {
        toplamRisk += a.sonuc.risk.skor;
        riskSayac++;
        if (a.sonuc.risk.skor > enYuksekRisk) {
          enYuksekRisk = a.sonuc.risk.skor;
        }
      }
    });

    // Yuksek risk ve sorun iliskisi
    if (enYuksekRisk >= 7) {
      yuksekRiskMusteri++;
      if (sorunlar.length > 0) yuksekRiskSorunlu++;
    }
  });

  // En sik kategori
  let enSikKategori = "-";
  let enSikSayi = 0;
  Object.keys(kategoriSayac).forEach(function(k) {
    if (kategoriSayac[k] > enSikSayi) {
      enSikSayi = kategoriSayac[k];
      enSikKategori = SORUN_KATEGORILERI[k] || k;
    }
  });

  // Cozum orani
  const cozumOrani = toplamSorun > 0
    ? "%" + Math.round((cozulenSorun / toplamSorun) * 100)
    : "-";

  // Ortalama risk
  const ortalamaRisk = riskSayac > 0
    ? (toplamRisk / riskSayac).toFixed(1)
    : "-";

  // Yuksek risk sorun orani
  let yuksekRiskSorunOrani = null;
  if (yuksekRiskMusteri > 0) {
    yuksekRiskSorunOrani = "%" + Math.round((yuksekRiskSorunlu / yuksekRiskMusteri) * 100) +
      " (" + yuksekRiskSorunlu + "/" + yuksekRiskMusteri + " musteri)";
  }

  return {
    toplamMusteri: toplamMusteri,
    toplamSorun: toplamSorun,
    acikSorun: acikSorun,
    cozumOrani: cozumOrani,
    enSikKategori: enSikKategori,
    ortalamaRisk: ortalamaRisk,
    yuksekRiskSorunOrani: yuksekRiskSorunOrani
  };
}
