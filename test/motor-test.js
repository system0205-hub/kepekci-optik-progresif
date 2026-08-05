// ============================================================
// Kepekci Optik - Motor Regresyon Testi
//
// CALISTIRMA:  node test/motor-test.js
//
// AMAC: app.js ile engine.js arasindaki veri koprusunu korur.
// Faz 2'de motora eklenen kontrol katmani, app.js'in gonderdigi
// alan adlarini okuyamadigi icin aylarca sessizce calismadi.
// Bu test o tur bir kopuklugu HEMEN yakalar.
//
// KURAL: Bu testteki "recete" ve "cerceve" objeleri,
// app.js -> analizBaslat() fonksiyonunun urettigi yapinin
// BIREBIR aynisi olmalidir. app.js'te form okuma degisirse
// buradaki objeler de guncellenmelidir.
// ============================================================

const fs = require('fs');
const path = require('path');

const KOK = path.join(__dirname, '..', 'progresif-oneri');

global.window = {};
eval(fs.readFileSync(path.join(KOK, 'js/data.js'), 'utf8'));
eval(fs.readFileSync(path.join(KOK, 'js/utils.js'), 'utf8'));
eval(fs.readFileSync(path.join(KOK, 'js/engine.js'), 'utf8'));
eval(fs.readFileSync(path.join(KOK, 'js/yorum.js'), 'utf8'));

// yorum.js kendini IIFE icinde saklar ve window'a acar (tarayicidaki gibi).
const uretYorum = global.window.uretYorum;

let gecen = 0;
let kalan = 0;

function kontrol(baslik, kosul, detay) {
  if (kosul) {
    gecen++;
    console.log('  [GECTI] ' + baslik);
  } else {
    kalan++;
    console.log('  [KALDI] ' + baslik);
    if (detay) console.log('          -> ' + detay);
  }
}

// --- app.js analizBaslat() ile ayni yapi ---------------------
function receteOlustur(ozel) {
  return Object.assign({
    sag: { sph: -2.00, cyl: -0.75, ax: 180, add: 2.00 },
    sol: { sph: -2.25, cyl: -0.50, ax: 175, add: 2.00 },
    pdSag: 32,
    pdSol: 31.5
  }, ozel || {});
}

function cerceveOlustur(ozel) {
  return Object.assign({
    fittingHeight: 20, bOlcusu: 38, aOlcusu: 52,
    b: 38, a: 52,
    pantoskopikAci: 10, bombeAcisi: 5, verteksMm: 13,
    fhSag: 20, fhSol: 20
  }, ozel || {});
}

function analiz(recete, cerceve, yasamId, ilk) {
  return analizEt(recete || receteOlustur(), cerceve || cerceveOlustur(),
    yasamId || 'ofis', !!ilk,
    { yasam: { ofisSaat: 8, dijitalSaat: 6 }, yas: null, premiumFreeForm: false });
}

console.log('');
console.log('============================================');
console.log(' KEPEKCI OPTIK - MOTOR REGRESYON TESTI');
console.log('============================================');

// ============================================================
console.log('\n1) PD KOPRUSU - form degeri motora ulasiyor mu?');
// ============================================================
{
  const sonuc = analiz();
  const pdUyarisi = sonuc.uyarilar.find(u => u.kural === 'T1-2');

  kontrol('Monokuler PD girilmisken "PD girilmedi" uyarisi CIKMAMALI',
    !pdUyarisi,
    pdUyarisi ? 'Cikan uyari: ' + pdUyarisi.mesaj : null);

  kontrol('Normal recetede siparis EDILEBILIR olmali',
    sonuc.siparisEdilebilir === true,
    'siparisEdilebilir = ' + sonuc.siparisEdilebilir);

  const kritikler = sonuc.uyarilar.filter(u => u.tip === 'kritik');
  kontrol('Normal recetede kritik uyari OLMAMALI',
    kritikler.length === 0,
    kritikler.length ? kritikler.map(u => u.kural + ': ' + u.mesaj).join(' | ') : null);
}

// ============================================================
console.log('\n2) PD GERCEKTEN EKSIKSE uyari CIKMALI (ters kontrol)');
// ============================================================
{
  const r = receteOlustur();
  delete r.pdSag;
  delete r.pdSol;
  const sonuc = analiz(r);
  const pdUyarisi = sonuc.uyarilar.find(u => u.kural === 'T1-2');

  kontrol('PD hic girilmemisse uyari CIKMALI',
    !!pdUyarisi,
    pdUyarisi ? null : 'Uyari cikmadi - kontrol devre disi kalmis olabilir');
}

// ============================================================
console.log('\n3) PD FARKI buyukse uyari CIKMALI');
// ============================================================
{
  const sonuc = analiz(receteOlustur({ pdSag: 36, pdSol: 28 })); // 8mm fark
  const farkUyarisi = sonuc.uyarilar.find(u => u.kural === 'T1-2b');

  kontrol('8mm PD farkinda asimetri uyarisi CIKMALI',
    !!farkUyarisi,
    farkUyarisi ? null : 'Fark kontrolu calismiyor');
}

// ============================================================
console.log('\n4) ONERI YAPISI - app.js dogru tuketebiliyor mu?');
// ============================================================
{
  const sonuc = analiz();

  kontrol('oneriler bir OBJE olmali (dizi degil)',
    sonuc.oneriler && !Array.isArray(sonuc.oneriler) && typeof sonuc.oneriler === 'object',
    'Gercek tip: ' + (Array.isArray(sonuc.oneriler) ? 'dizi' : typeof sonuc.oneriler));

  kontrol('premium/orta/baslangic kademeleri bulunmali',
    sonuc.oneriler && 'premium' in sonuc.oneriler
      && 'orta' in sonuc.oneriler && 'baslangic' in sonuc.oneriler,
    'Bulunan alanlar: ' + Object.keys(sonuc.oneriler || {}).join(', '));

  const dolu = ['premium', 'orta', 'baslangic'].filter(t => sonuc.oneriler[t]);
  kontrol('En az bir kademede model onerilmeli',
    dolu.length > 0,
    'Dolu kademe sayisi: ' + dolu.length);

  const ilk = sonuc.oneriler[dolu[0]];
  kontrol('Onerideki puan alani "puan" adiyla gelmeli',
    ilk && typeof ilk.puan === 'number',
    ilk ? 'puan = ' + ilk.puan + ' (skor = ' + ilk.skor + ')' : null);
}

// ============================================================
console.log('\n5) YORUM URETIMI - app.js Faz 4 blogu calisiyor mu?');
// ============================================================
{
  const sonuc = analiz();

  // app.js icindeki yorum uretim mantiginin AYNISI
  const yorumSirasi = ['premium', 'orta', 'baslangic']
    .map(t => sonuc.oneriler ? sonuc.oneriler[t] : null)
    .filter(o => o && o.model);

  kontrol('Yorum uretimi icin en az bir oneri hazirlanmali',
    yorumSirasi.length > 0,
    'yorumSirasi uzunlugu: ' + yorumSirasi.length);

  const receteYorumFormat = {
    sag: { sph: -2.00, cyl: -0.75, add: 2.00 },
    sol: { sph: -2.25, cyl: -0.50, add: 2.00 }
  };

  const yorumlar = yorumSirasi.map((oneri, idx) => uretYorum(
    oneri.model, receteYorumFormat, { ofisSaat: 8, dijitalSaat: 6 },
    {
      siralama: idx,
      skor: oneri.puan || oneri.skor || 0,
      ilkKullanim: false,
      altModel: (idx + 1 < yorumSirasi.length) ? yorumSirasi[idx + 1].model : null,
      siparisEdilebilir: sonuc.siparisEdilebilir !== false,
      secim: null
    }
  )).filter(Boolean);

  kontrol('Her oneri icin yorum uretilmeli',
    yorumlar.length === yorumSirasi.length && yorumlar.length > 0,
    yorumlar.length + ' yorum / ' + yorumSirasi.length + ' oneri');

  const y = yorumlar[0];
  kontrol('Yorum metni dolu gelmeli (bos alan olmamali)',
    y && y.baslik && y.nedenUygun && y.buCamiAlirsaniz,
    y ? 'baslik="' + y.baslik + '" etiket="' + y.etiket + '"' : null);
}

// ============================================================
console.log('\n5b) AKS KOPRUSU - form "ax" degeri motora ulasiyor mu?');
// ============================================================
{
  // Oblik aks (45) + CYL 2.00 -> T2-9 "oblik astigmat" uyarisi CIKMALI.
  // Aks motora ulasmazsa _oblikMi(null)=false doner ve kural sessizce atlanir.
  const r = receteOlustur({
    sag: { sph: -2.00, cyl: -2.00, ax: 45, add: 2.00 },
    sol: { sph: -2.00, cyl: -2.00, ax: 135, add: 2.00 }
  });
  const sonuc = analiz(r);
  const oblik = sonuc.uyarilar.find(u => u.kural === 'T2-9');

  kontrol('Oblik aks (45/135) + CYL 2.00 -> T2-9 uyarisi CIKMALI',
    !!oblik,
    oblik ? null : 'Aks motora ulasmiyor - kural sessizce atlaniyor');
}

// ============================================================
console.log('\n5c) DIK AKS ise oblik uyarisi CIKMAMALI (ters kontrol)');
// ============================================================
{
  const r = receteOlustur({
    sag: { sph: -2.00, cyl: -2.00, ax: 180, add: 2.00 },
    sol: { sph: -2.00, cyl: -2.00, ax: 90, add: 2.00 }
  });
  const sonuc = analiz(r);
  const oblik = sonuc.uyarilar.find(u => u.kural === 'T2-9');

  kontrol('Aks 180/90 (dik) iken oblik uyarisi CIKMAMALI',
    !oblik,
    oblik ? 'Yanlis uyari: ' + oblik.mesaj : null);
}

// ============================================================
console.log('\n5d) KORIDOR KOPRUSU - hesaplanan koridor kontrole gidiyor mu?');
// ============================================================
{
  // b=24, fh=16 -> idealKoridor 14 -> minimum B = 28mm. b=24 yetersiz.
  // Koridor kontrole ulasmazsa T1-1 kurali sessizce atlanir.
  const sonuc = analiz(null, cerceveOlustur({
    bOlcusu: 24, b: 24, fittingHeight: 16, fhSag: 16, fhSol: 16
  }));
  const koridorIhlali = sonuc.uyarilar.find(u => u.kural === 'T1-1');

  kontrol('Sig cerceve (B=24, koridor=14) -> T1-1 uyarisi CIKMALI',
    !!koridorIhlali,
    koridorIhlali ? null : 'Koridor degeri kontrole ulasmiyor');

  kontrol('Koridor degeri hesaplanmis olmali',
    sonuc.koridor.idealKoridor === 14,
    'idealKoridor = ' + sonuc.koridor.idealKoridor);
}

// ============================================================
console.log('\n5e) SIFIR DEGERI - "0" girildi mi, girilmedi mi?');
// ============================================================
{
  // Duz cerceve: pantoskopik 0 derece GECERLI bir olcumdur.
  // "parseFloat(x) || null" kalibi sifiri yutup kurali atlardi.
  const sonuc = analiz(null, cerceveOlustur({ pantoskopikAci: 0 }));
  const pantoIhlali = sonuc.uyarilar.find(u => u.kural === 'T1-5');

  kontrol('Pantoskopik 0 derece -> aralik disi uyarisi CIKMALI',
    !!pantoIhlali,
    pantoIhlali ? null : 'Sifir "girilmedi" sayiliyor - kural atlaniyor');

  // Ters kontrol: 10 derece ideal aralikta, uyari cikmamali
  const normal = analiz(null, cerceveOlustur({ pantoskopikAci: 10 }));
  kontrol('Pantoskopik 10 derece (ideal) -> uyari CIKMAMALI',
    !normal.uyarilar.find(u => u.kural === 'T1-5'));
}

// ============================================================
console.log('\n6) YUKSEK RISK - kritik uyari mekanizmasi calisiyor mu?');
// ============================================================
{
  // Yuksek silindir + yuksek add + anizometropi -> risk yuksek olmali
  const r = receteOlustur({
    sag: { sph: -6.00, cyl: -3.00, ax: 45, add: 3.00 },
    sol: { sph: -2.00, cyl: -0.50, ax: 90, add: 3.00 }
  });
  const sonuc = analiz(r, cerceveOlustur({ fittingHeight: 15, bOlcusu: 24, b: 24, fhSag: 15, fhSol: 15 }));

  kontrol('Zor recetede risk skoru yuksek olmali (>= 5)',
    sonuc.risk.skor >= 5,
    'Risk skoru: ' + sonuc.risk.skor);

  kontrol('Zor recetede uyari uretilmeli',
    sonuc.uyarilar.length > 0,
    'Uyari sayisi: ' + sonuc.uyarilar.length);
}

// ============================================================
console.log('\n7) MOTOR CIKTI BUTUNLUGU');
// ============================================================
{
  const sonuc = analiz();
  kontrol('risk.skor sayi olmali', typeof sonuc.risk.skor === 'number');
  kontrol('koridor.idealKoridor sayi olmali',
    typeof sonuc.koridor.idealKoridor === 'number',
    'Deger: ' + sonuc.koridor.idealKoridor);
  kontrol('uyarilar dizi olmali', Array.isArray(sonuc.uyarilar));
  kontrol('hastaNotlari uretilmeli', !!sonuc.hastaNotlari);
}

// ============================================================
console.log('');
console.log('============================================');
console.log(' SONUC:  ' + gecen + ' gecti  /  ' + kalan + ' kaldi');
console.log('============================================');
console.log('');

process.exit(kalan > 0 ? 1 : 0);
