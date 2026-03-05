// Kepekci Optik - Sorun Takip Veri Katmani

var SORUN_KATEGORILERI = {
  alisma: "Alisma sorunu",
  yakin_bulanik: "Yakin bulanik",
  uzak_bulanik: "Uzak bulanik",
  basdonmesi: "Bas donmesi / agrisi",
  cerceve: "Cerceve sorunu",
  montaj: "Montaj hatasi",
  diger: "Diger"
};

var SORUN_DURUMLARI = {
  acik: { etiket: "Acik", renk: "#e74c3c" },
  takipte: { etiket: "Takipte", renk: "#f39c12" },
  cozuldu: { etiket: "Cozuldu", renk: "#27ae60" }
};

function sorunEkle(musteriId, sorun) {
  var musteri = musteriGetir(musteriId);
  if (!musteri) return null;

  if (!sorun.id) sorun.id = "s_" + Date.now();
  if (!sorun.tarih) sorun.tarih = new Date().toISOString().split("T")[0];
  if (!sorun.durum) sorun.durum = "acik";
  if (!sorun.cozum) sorun.cozum = "";

  if (!musteri.sorunlar) musteri.sorunlar = [];
  musteri.sorunlar.push(sorun);
  musteriGuncelle(musteriId, { sorunlar: musteri.sorunlar });
  return sorun;
}

function sorunGuncelle(musteriId, sorunId, data) {
  var musteri = musteriGetir(musteriId);
  if (!musteri || !musteri.sorunlar) return null;

  for (var i = 0; i < musteri.sorunlar.length; i++) {
    if (musteri.sorunlar[i].id === sorunId) {
      Object.keys(data).forEach(function(key) {
        musteri.sorunlar[i][key] = data[key];
      });
      musteriGuncelle(musteriId, { sorunlar: musteri.sorunlar });
      return musteri.sorunlar[i];
    }
  }
  return null;
}

function sorunlariGetir(musteriId) {
  var musteri = musteriGetir(musteriId);
  if (!musteri) return [];
  return musteri.sorunlar || [];
}

function acikSorunSayisi(musteriId) {
  var sorunlar = sorunlariGetir(musteriId);
  var sayi = 0;
  sorunlar.forEach(function(s) {
    if (s.durum === "acik") sayi++;
  });
  return sayi;
}
