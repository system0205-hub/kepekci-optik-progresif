// ============================================================
// KORIDOR DEGER KILIDI
//
// CALISTIRMA:  node test/koridor-kilit-test.js
//
// NEDEN VAR:
// Gecis bolgesi (koridor) degeri FABRIKAYA SIPARIS olarak gider.
// Yanlis deger = yanlis uretilmis cam = geri donusu olmayan zarar.
//
// Bu test, bugun uretilen koridor degerlerini SABITLER. Motorda
// yapilan herhangi bir degisiklik bu degerlerden birini kaydirirsa
// test KIRMIZI yanar.
//
// ONEMLI: Buradaki beklenen degerler "dogru cevap" degil,
// "BUGUNKU cevap"tir. Bir degeri bilerek degistiriyorsan:
//   1. Once NEDEN degistigini yaz (klinik gerekce),
//   2. Muzaffer Bey'e dogrulat,
//   3. Sonra buradaki beklenen degeri guncelle.
// Testi "gecsin diye" guncelleme.
// ============================================================

const fs = require('fs');
const path = require('path');
const KOK = path.join(__dirname, '..', 'progresif-oneri');

global.window = {};
eval(fs.readFileSync(path.join(KOK, 'js/data.js'), 'utf8'));
eval(fs.readFileSync(path.join(KOK, 'js/utils.js'), 'utf8'));
eval(fs.readFileSync(path.join(KOK, 'js/engine.js'), 'utf8'));

function R(sagSph, cyl, ax, add, solSph) {
  return {
    sag: { sph: sagSph, cyl: cyl, ax: ax, add: add },
    sol: { sph: solSph !== undefined ? solSph : sagSph, cyl: cyl, ax: ax, add: add },
    pdSag: 32, pdSol: 31.5
  };
}
function C(b, fh) {
  return {
    fittingHeight: fh, bOlcusu: b, aOlcusu: 52, b: b, a: 52,
    fhSag: fh, fhSol: fh, pantoskopikAci: 10, bombeAcisi: 5, verteksMm: 13
  };
}

// ---- KILITLI DEGERLER -------------------------------------------------
// [aciklama, recete, cerceve, ilkKullanim, BEKLENEN_KORIDOR, BEKLENEN_GRUP]
const KILIT = [
  ['Standart miyop / orta cerceve',      R(-2.00, -0.50, 180, 2.00), C(32, 20), false, 16, '-/-'],
  ['Standart miyop / buyuk cerceve',     R(-2.00, -0.50, 180, 2.00), C(36, 24), false, 18, '-/-'],
  ['Standart miyop / kucuk cerceve',     R(-2.00, -0.50, 180, 2.00), C(26, 17), false, 14, '-/-'],
  ['Yuksek miyop -9.00',                 R(-9.00, -0.50, 180, 1.75), C(32, 20), false, 14, '-/-'],
  ['Orta miyop -4.00 / dusuk ADD',       R(-4.00, -0.50, 180, 1.75), C(32, 20), false, 15, '-/-'],
  ['Hipermetrop +5.00 / dusuk ADD',      R( 5.00,     0, null, 1.75), C(32, 22), false, 14, '+/+'],
  ['Hipermetrop +3.00 / orta ADD',       R( 3.00,     0, null, 2.25), C(32, 22), false, 16, '+/+'],
  ['Hipermetrop +3.00 / yuksek ADD',     R( 3.00,     0, null, 2.75), C(32, 22), false, 18, '+/+'],
  // 16mm: temel secim 14mm, ancak Minkwitz kurali (ADD >= 2.50) 2mm uzatiyor.
  // Guc degisim hizi 3.00/14 = 0.214 D/mm (ust sinir 0.18) -> 3.00/16 = 0.1875.
  ['Yuksek ADD 3.00 / kucuk cerceve',    R(-2.00, -0.50, 180, 3.00), C(26, 17), false, 16, '-/-'],
  ['Yuksek silindir -2.50',              R(-2.00, -2.50, 180, 2.00), C(26, 17), false, 14, '-/-'],
  ['Anizometropi +2 / -2 oblik aks',     R( 2.00, -1.00,  45, 2.00, -2.00), C(32, 20), false, 16, '+/-'],
  ['Oblik + silindir anizometrop',       R( 1.50, -1.50,  45, 2.00, -1.00), C(30, 19), false, 16, '+/-'],
  ['Ilk kullanim / dar cerceve',         R(-1.50, -0.25, 180, 1.50), C(24, 16), true,  14, '-/-'],
  ['Cok yuksek ADD 3.50',                R(-3.00, -0.75,  90, 3.50), C(36, 24), false, 18, '-/-'],
  ['Plano uzak + ADD (VP recete)',       R( 0.00,     0, null, 2.00), C(32, 20), false, 16, 'notr'],
  ['Cok kucuk cerceve / dusuk ADD',      R(-1.00, -0.25, 180, 1.25), C(22, 15), false, 13, '-/-'],
];

let gecen = 0, kalan = 0;
const kaymalar = [];

console.log('');
console.log('='.repeat(72));
console.log(' KORIDOR DEGER KILIDI  -  fabrikaya giden sayi degismedi mi?');
console.log('='.repeat(72));
console.log('');

KILIT.forEach(function (k) {
  const ad = k[0], recete = k[1], cerceve = k[2], ilk = k[3];
  const beklenenKor = k[4], beklenenGrup = k[5];

  const s = belirleKoridorTipi(cerceve, 5, recete, ilk);
  const korOk = s.idealKoridor === beklenenKor;
  const grupOk = s.diopterGrubu === beklenenGrup;

  if (korOk && grupOk) {
    gecen++;
    console.log('  [SABIT] ' + ad.padEnd(36) + beklenenKor + 'mm  [' + beklenenGrup + ']');
  } else {
    kalan++;
    console.log('  [KAYDI] ' + ad);
    if (!korOk) {
      console.log('          KORIDOR: beklenen ' + beklenenKor + 'mm  ->  gelen ' + s.idealKoridor + 'mm');
      kaymalar.push(ad + ': ' + beklenenKor + 'mm -> ' + s.idealKoridor + 'mm');
    }
    if (!grupOk) {
      console.log('          GRUP   : beklenen ' + beklenenGrup + '  ->  gelen ' + s.diopterGrubu);
    }
  }
});

// ---- Koridorun kendi ic tutarliligi -----------------------------------
console.log('');
console.log('  Ic tutarlilik:');

function bak(ad, kosul, detay) {
  if (kosul) { gecen++; console.log('  [OK]    ' + ad); }
  else { kalan++; console.log('  [HATA]  ' + ad + (detay ? '  -> ' + detay : '')); }
}

let hepsiAralikta = true, aralikDetay = '';
KILIT.forEach(function (k) {
  const s = belirleKoridorTipi(k[2], 5, k[1], k[3]);
  if (s.idealKoridor < 11 || s.idealKoridor > 18) {
    hepsiAralikta = false;
    aralikDetay = k[0] + ' -> ' + s.idealKoridor + 'mm';
  }
});
bak('Tum koridorlar 11-18mm uretim araliginda', hepsiAralikta, aralikDetay);

let tamsayi = true;
KILIT.forEach(function (k) {
  const s = belirleKoridorTipi(k[2], 5, k[1], k[3]);
  if (s.idealKoridor !== Math.round(s.idealKoridor)) tamsayi = false;
});
bak('Koridor degerleri tam sayi (siparis edilebilir)', tamsayi);

let minFhTutarli = true;
KILIT.forEach(function (k) {
  const s = belirleKoridorTipi(k[2], 5, k[1], k[3]);
  if (s.minFittingHeight !== s.idealKoridor + 4) minFhTutarli = false;
});
bak('minFittingHeight = koridor + 4 kurali korunuyor', minFhTutarli);

// Ilk kullanimda asla 14mm altina inilmemeli
const ilkKul = belirleKoridorTipi(C(22, 15), 5, R(-1.00, -0.25, 180, 1.25), true);
bak('Ilk kullanimda koridor >= 14mm', ilkKul.idealKoridor >= 14,
  'gelen: ' + ilkKul.idealKoridor + 'mm');

// Yuksek silindirde asla 14mm altina inilmemeli
const yukCyl = belirleKoridorTipi(C(22, 15), 5, R(-1.00, -2.50, 180, 1.25), false);
bak('Yuksek silindirde (>=2.00) koridor >= 14mm', yukCyl.idealKoridor >= 14,
  'gelen: ' + yukCyl.idealKoridor + 'mm');

console.log('');
console.log('='.repeat(72));
if (kalan === 0) {
  console.log(' SONUC: ' + gecen + ' kontrol gecti. Koridor degerleri DEGISMEDI.');
} else {
  console.log(' SONUC: ' + kalan + ' KONTROL KAYDI!  ' + gecen + ' gecti.');
  console.log('');
  console.log(' !!! FABRIKAYA GIDEN KORIDOR DEGERI DEGISTI !!!');
  kaymalar.forEach(function (m) { console.log('     - ' + m); });
  console.log('');
  console.log(' Bu degisiklik BILEREK yapildiysa: klinik gerekcesini yaz,');
  console.log(' Muzaffer Bey e dogrulat, sonra test dosyasindaki beklenen');
  console.log(' degeri guncelle. Aksi halde motoru geri al.');
}
console.log('='.repeat(72));
console.log('');

process.exit(kalan > 0 ? 1 : 0);
