// Kepekci Optik - Istatistik / Oruntu Analizi

function istatistikleriHesapla() {
  var musteriler = tumMusterileriGetir();

  var toplamMusteri = musteriler.length;
  var toplamSorun = 0;
  var acikSorun = 0;
  var cozulenSorun = 0;
  var kategoriSayac = {};
  var toplamRisk = 0;
  var riskSayac = 0;
  var yuksekRiskMusteri = 0;
  var yuksekRiskSorunlu = 0;

  musteriler.forEach(function(m) {
    // Sorunlar
    var sorunlar = m.sorunlar || [];
    toplamSorun += sorunlar.length;
    sorunlar.forEach(function(s) {
      if (s.durum === "acik") acikSorun++;
      if (s.durum === "cozuldu") cozulenSorun++;
      kategoriSayac[s.kategori] = (kategoriSayac[s.kategori] || 0) + 1;
    });

    // Analizler - risk skoru
    var analizler = m.analizler || [];
    var enYuksekRisk = 0;
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
  var enSikKategori = "-";
  var enSikSayi = 0;
  Object.keys(kategoriSayac).forEach(function(k) {
    if (kategoriSayac[k] > enSikSayi) {
      enSikSayi = kategoriSayac[k];
      enSikKategori = SORUN_KATEGORILERI[k] || k;
    }
  });

  // Cozum orani
  var cozumOrani = toplamSorun > 0
    ? "%" + Math.round((cozulenSorun / toplamSorun) * 100)
    : "-";

  // Ortalama risk
  var ortalamaRisk = riskSayac > 0
    ? (toplamRisk / riskSayac).toFixed(1)
    : "-";

  // Yuksek risk sorun orani
  var yuksekRiskSorunOrani = null;
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
