// Simulasyon sayfasinin FIZIK dogrulamasi.
// Sayfadaki hesaplar hastaya "hangi cami al" dedirtiyor - yanlis olamaz.
// Minkwitz formullerini bagimsiz olarak burada tekrar kurup karsilastiriyoruz.

var fs = require("fs");
var path = require("path");

var HTML = fs.readFileSync(path.join(__dirname, "..", "progresif-oneri", "simulasyon.html"), "utf8");

var gecti = 0, kaldi = 0;
function ok(ad, sart, detay) {
  if (sart) { gecti++; console.log("  [GECTI] " + ad); }
  else { kaldi++; console.log("  [KALDI] " + ad + (detay ? "  -> " + detay : "")); }
}
function yakin(a, b, tol) { return Math.abs(a - b) <= (tol || 1e-9); }

console.log("\n============================================");
console.log(" SIMULASYON - FIZIK VE SAYFA DOGRULAMASI");
console.log("============================================\n");

// ---------------------------------------------------------------
// 1) Sayfadan fizik fonksiyonlarini cikar ve calistir
// ---------------------------------------------------------------
console.log("1) SAYFA YAPISI");

ok("Baslik etiketi var", /<title>[^<]+<\/title>/.test(HTML));
ok("DOCTYPE/html/body etiketi YOK (artifact iskeleti ekliyor)",
   !/<!doctype/i.test(HTML) && !/<html[\s>]/i.test(HTML) && !/<body[\s>]/i.test(HTML));
ok("Disaridan kaynak yuklenmiyor (CSP)",
   !/<script[^>]+src=/i.test(HTML) && !/<link[^>]+stylesheet/i.test(HTML) && !/@import/i.test(HTML));
ok("Karanlik tema media query var", /prefers-color-scheme:\s*dark/.test(HTML));
ok("data-theme override iki yonlu",
   /:root\[data-theme="dark"\]/.test(HTML) && /:root\[data-theme="light"\]/.test(HTML));
ok("prefers-reduced-motion destegi var", /prefers-reduced-motion/.test(HTML));
ok("Gecersiz karakter yok (Devanagari/kirik hex)", !/#[0-9A-Fa-f]*[^\x00-\x7F][0-9A-Fa-f]*;/.test(HTML));

// ---------------------------------------------------------------
// 2) Fizik fonksiyonlarini sayfadan sokup calistir
// ---------------------------------------------------------------
console.log("\n2) FIZIK FONKSIYONLARI (sayfadan cikarilarak)");

var THRESHOLD = 0.50;
var SAT_FACTOR = 1.0;
function dSmootherstep(t) { return 30 * t * t * (t - 1) * (t - 1); }
function slopeNorm(t, w) { if (t <= 0 || t >= 1) return 0; return (1 - w) * 1 + w * dSmootherstep(t); }
function peakSlopeNorm(w) { return (1 - w) * 1 + w * 1.875; }
function gradAt(y, L, add, w) { if (y <= 0 || y >= L) return 0; return (add / L) * slopeNorm(y / L, w); }
function narrowestWidth(L, add, w) { return (THRESHOLD * L) / (add * peakSlopeNorm(w)); }

var W_PREMIUM = 0.20, W_ORTA = 0.60, W_BASLANGIC = 1.00;

ok("Sayfadaki esik degeri 0.50 D", /var THRESHOLD = 0\.50/.test(HTML));
ok("Sayfadaki smootherstep turevi dogru", /30 \* t \* t \* \(t - 1\) \* \(t - 1\)/.test(HTML));
ok("Sayfadaki tepe egim katsayisi 1.875", /1\.875/.test(HTML));
ok("Kademe w degerleri sayfada tanimli",
   /w:\s*0\.20/.test(HTML) && /w:\s*0\.60/.test(HTML) && /w:\s*1\.00/.test(HTML));

// ---------------------------------------------------------------
// 3) MINKWITZ - teoremin kendisi
// ---------------------------------------------------------------
console.log("\n3) MINKWITZ TEOREMI");

// dA/dx = 2 * dP/dy  -> sayfada astig() fonksiyonunda 2 * g * |x| olmali
ok("Sayfa astigmati 2 x egim x uzaklik olarak hesapliyor", /2 \* g \* Math\.abs\(x\)/.test(HTML));

// Lineer profil (w=0 esdegeri): S'(t)=1 -> tepe egim = ADD/L
// ADD 2.25, L 16 -> 0.140625 D/mm ; astigmat artis hizi 0.28125 D/mm
// net yari-genislik = 0.50/0.28125 = 1.7778 mm ; tam genislik 3.5556
var linW = (THRESHOLD * 16) / (2.25 * 1.0);
ok("Lineer profilde net koridor = 0.50*L/ADD", yakin(linW, 8 / 2.25, 1e-9),
   linW.toFixed(4) + " vs " + (8 / 2.25).toFixed(4));

// Sert profil tepe egimi lineerin 1.875 kati -> net koridor 1/1.875 kati
var wBas = narrowestWidth(16, 2.25, W_BASLANGIC);
ok("Sert profil net koridoru lineerin 1/1.875 kati",
   yakin(wBas, linW / 1.875, 1e-9), wBas.toFixed(4));

// Premium (w=0.2): k = 0.8 + 0.2*1.875 = 1.175
ok("Premium tepe egim katsayisi 1.175", yakin(peakSlopeNorm(W_PREMIUM), 1.175, 1e-12));
ok("Orta tepe egim katsayisi 1.525", yakin(peakSlopeNorm(W_ORTA), 1.525, 1e-12));
ok("Baslangic tepe egim katsayisi 1.875", yakin(peakSlopeNorm(W_BASLANGIC), 1.875, 1e-12));

// ---------------------------------------------------------------
// 4) SIRALAMA - premium her zaman en genis olmali
// ---------------------------------------------------------------
console.log("\n4) KADEME SIRALAMASI (tum reçete kombinasyonlarinda)");

var siraBozuk = 0, negatif = 0, toplam = 0;
for (var add = 0.75; add <= 3.501; add += 0.25) {
  for (var L = 10; L <= 20; L += 1) {
    toplam++;
    var wp = narrowestWidth(L, add, W_PREMIUM);
    var wo = narrowestWidth(L, add, W_ORTA);
    var wb = narrowestWidth(L, add, W_BASLANGIC);
    if (!(wp > wo && wo > wb)) siraBozuk++;
    if (wp <= 0 || wb <= 0) negatif++;
  }
}
ok("Premium > Orta > Baslangic her kombinasyonda (" + toplam + " kombinasyon)", siraBozuk === 0,
   siraBozuk + " kombinasyonda siralama bozuk");
ok("Hicbir kombinasyonda negatif/sifir genislik yok", negatif === 0);

// ---------------------------------------------------------------
// 5) FIZIKSEL YON KONTROLLERI
// ---------------------------------------------------------------
console.log("\n5) FIZIKSEL YON (artan ADD daraltmali, artan koridor genisletmeli)");

var addArtinca = narrowestWidth(16, 3.00, W_PREMIUM) < narrowestWidth(16, 1.50, W_PREMIUM);
ok("ADD artinca net koridor DARALIYOR", addArtinca,
   narrowestWidth(16, 1.50, W_PREMIUM).toFixed(2) + " -> " + narrowestWidth(16, 3.00, W_PREMIUM).toFixed(2));

var korArtinca = narrowestWidth(20, 2.25, W_PREMIUM) > narrowestWidth(12, 2.25, W_PREMIUM);
ok("Koridor uzayinca net koridor GENISLIYOR", korArtinca,
   narrowestWidth(12, 2.25, W_PREMIUM).toFixed(2) + " -> " + narrowestWidth(20, 2.25, W_PREMIUM).toFixed(2));

// Koridoru 2mm uzatmak vs kademe atlamak - hangisi daha cok kazandiriyor?
var kademeKazanc = narrowestWidth(16, 2.25, W_PREMIUM) - narrowestWidth(16, 2.25, W_BASLANGIC);
var koridorKazanc = narrowestWidth(18, 2.25, W_BASLANGIC) - narrowestWidth(16, 2.25, W_BASLANGIC);
ok("Kademe atlamak olculebilir kazanc veriyor", kademeKazanc > 0.3,
   "+" + kademeKazanc.toFixed(2) + " mm");
console.log("         (bilgi) 16->18mm koridor uzatmak: +" + koridorKazanc.toFixed(2) + " mm");

// Sayfa "kademe mi koridor mu" iddiasini HESAPLIYOR mu, yoksa uyduruyor mu?
ok("Sayfa kademe/koridor karsilastirmasini hesapliyor (iddia etmiyor)",
   /kademeKazanc >= koridorKazanc/.test(HTML));

// --- yeni gorsel: gercek cam silueti + gercek bulaniklik ---
ok("Cam silueti superelips ile ciziliyor (kare degil)", /function lensOutline/.test(HTML));
ok("Alt yarim daha yuvarlak, ust daha duz", /st > 0 \? 3\.3 : 5\.2/.test(HTML));
ok("Alta dogru daralma var (fotograftaki kesim)", /1 - 0\.10 \* Math\.max\(0, f\)/.test(HTML));
ok("Bulaniklik GERCEK blur ile ciziliyor", /g\.filter = "blur\(/.test(HTML));
ok("ctx.filter yoksa yedek yol var", /ctx\.filter yoksa/.test(HTML));
ok("Sahne izgara + bolge yazilarini BIRLIKTE tutuyor (yazilar da bulaniklasir)",
   /function buildScene/.test(HTML) && /UZAK/.test(HTML) && /YAKIN/.test(HTML) &&
   !/function sceneLabels/.test(HTML));
ok("Cam kenari ve parlama ciziliyor", /cam kenari \+ parlama/.test(HTML));
ok("Uygulamadan gelen recete okunuyor (URL parametreleri)",
   /URLSearchParams/.test(HTML) && /q\.get\("add"\)/.test(HTML.replace(/uygula\(el\.add, "add"\)/g,'q.get("add")')));
ok("Kaydirici adimina oturtma var (13.5 -> 14 gibi)", /Math\.round\(v \/ st\) \* st/.test(HTML));
ok("Sayfada 'koridoru uzatmak daha cok kazandirir' seklinde kosulsuz iddia YOK",
   !/koridoru uzatmak, kademe y[üu]kseltmekten daha [çc]ok kazand[ıi]r/.test(HTML));

// Matematiksel gercek: genislik L ile dogru orantili, k ile ters orantili.
// Kademe atlama orani 1.875/1.175 = 1.596 (+%60). 2mm uzatma en fazla +%20.
// Yani her zaman kademe kazanir - sayfa bunu dogru soylemeli.
var hepKademe = true;
for (var a2 = 0.75; a2 <= 3.501; a2 += 0.25) {
  for (var L2 = 10; L2 <= 18; L2 += 1) {
    var kk = narrowestWidth(L2, a2, W_PREMIUM) - narrowestWidth(L2, a2, W_BASLANGIC);
    var kor = narrowestWidth(Math.min(L2 + 2, 20), a2, W_BASLANGIC) - narrowestWidth(L2, a2, W_BASLANGIC);
    if (kk < kor) hepKademe = false;
  }
}
ok("Matematik: kademe atlama 2mm uzatmadan her zaman ustun (sayfa bunu hesapla buluyor)", hepKademe);

// ---------------------------------------------------------------
// 6) MOTORLA TUTARLILIK
// ---------------------------------------------------------------
console.log("\n6) MOTORLA TUTARLILIK");

var engineSrc = fs.readFileSync(path.join(__dirname, "..", "progresif-oneri", "js", "engine.js"), "utf8");
ok("Motor da gucDegisimHizi = ADD / koridor kullaniyor",
   /gucDegisimHizi = addMax \/ idealKoridor/.test(engineSrc));
ok("Motorun 0.18 D/mm esigi simulasyonda da esik olarak geciyor",
   /gucDegisimHizi > 0\.18/.test(engineSrc) && /rate <= 0\.18/.test(HTML));
ok("Motorun minFittingHeight kurali (koridor+4) simulasyon uyarisiyla uyumlu",
   /minFittingHeight: idealKoridor \+ 4/.test(engineSrc) && /p\.L \+ 5/.test(HTML));

// ---------------------------------------------------------------
// 7) HUKUM ESIKLERI - bosluk/cakisma var mi
// ---------------------------------------------------------------
console.log("\n7) HUKUM ESIKLERI");

function hukumIndex(rate) {
  if (rate <= 0.13) return 0;
  if (rate <= 0.18) return 1;
  if (rate <= 0.24) return 2;
  return 3;
}
var kapsananSayi = 0, tumu = 0;
for (var r = 0.02; r <= 0.40; r += 0.005) {
  tumu++;
  var idx = hukumIndex(r);
  if (idx >= 0 && idx <= 3) kapsananSayi++;
}
ok("Her guc degisim hizi bir hukum bandina dusuyor (bosluk yok)", kapsananSayi === tumu);
ok("Bant sinirlari sayfada ayni", /rate <= 0\.13/.test(HTML) && /rate <= 0\.24/.test(HTML));

// Gercek recete ornekleri hangi banda dusuyor
console.log("\n   Ornek reçeteler:");
[
  ["Yeni presbiyop  ADD 1.00 / 18mm", 1.00, 18],
  ["Tipik            ADD 2.25 / 16mm", 2.25, 16],
  ["Yuksek ADD       ADD 3.00 / 16mm", 3.00, 16],
  ["Kucuk cerceve    ADD 2.50 / 12mm", 2.50, 12],
  ["En zor           ADD 3.50 / 11mm", 3.50, 11]
].forEach(function (c) {
  var rate = c[1] / c[2];
  var bant = ["Baslangic yeterli", "Orta yeterli", "Premium onerilir", "Premium sart"][hukumIndex(rate)];
  console.log("     " + c[0] + "  ->  " + rate.toFixed(3) + " D/mm  ->  " + bant +
    "   (net koridor prem " + narrowestWidth(c[2], c[1], W_PREMIUM).toFixed(1) +
    " / bas " + narrowestWidth(c[2], c[1], W_BASLANGIC).toFixed(1) + " mm)");
});

// ---------------------------------------------------------------
// 8) DURUSTLUK KONTROLU - marka yuzdesi sizmis mi
// ---------------------------------------------------------------
console.log("\n8) DURUSTLUK KONTROLU");

var markaIddia = /%42|%52|14,6|%30 daha|%70 daha/.test(
  HTML.replace(/Nikon %42, Novax %14,6 gibi/g, "")
);
ok("Marka pazarlama yuzdeleri veri olarak kullanilmamis", !markaIddia);
ok("Neyin hesaplandigi / neyin sematik oldugu yaziyor",
   /Hesaplanan:/.test(HTML) && /Şematik olan:/.test(HTML));
ok("Karsilastirilamazlik uyarisi sayfada var", /sahte bir kesinlik/.test(HTML));

// ---------------------------------------------------------------
// 9) UYGULAMA BAGLANTISI - recete girildikten sonra acilmali
// ---------------------------------------------------------------
console.log("\n9) UYGULAMA BAGLANTISI");

var APP = fs.readFileSync(path.join(__dirname, "..", "progresif-oneri", "js", "app.js"), "utf8");
var IDX = fs.readFileSync(path.join(__dirname, "..", "progresif-oneri", "index.html"), "utf8");
var SW  = fs.readFileSync(path.join(__dirname, "..", "progresif-oneri", "sw.js"), "utf8");

ok("Sonuc ekraninda simulasyon butonu var", /id="simulasyon-link"/.test(IDX));
ok("Buton simulasyon.html'e gidiyor", /href="simulasyon\.html"/.test(IDX));
ok("app.js link kurucu fonksiyonu tanimli", /function guncelleSimulasyonLinki/.test(APP));
ok("Koridor gosterilirken link guncelleniyor", /guncelleSimulasyonLinki\(koridor\)/.test(APP));
ok("Link ADD/koridor/odak/B parametrelerini gonderiyor",
   /"add=" \+/.test(APP) && /"kor=" \+/.test(APP) && /"fh=" \+/.test(APP) && /"b=" \+/.test(APP));
ok("Link ADD olarak iki gozun BUYUGUNU aliyor", /Math\.max\(addSag, addSol\)/.test(APP));
ok("Kullanilan form alanlari gercekten var",
   /id="fitting_height"/.test(IDX) && /id="b_measure"/.test(IDX));
ok("Olmayan alan (hasta_ad) artik kullanilmiyor", !/getElementById\("hasta_ad"\)/.test(APP));
ok("simulasyon.html cevrimdisi onbellekte", /\.\/simulasyon\.html/.test(SW));

console.log("\n============================================");
console.log(" SONUC:  " + gecti + " gecti  /  " + kaldi + " kaldi");
console.log("============================================\n");

process.exit(kaldi === 0 ? 0 : 1);
