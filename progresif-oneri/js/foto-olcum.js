// Kepekci Optik - Fotograftan Olcum Modulu
// Canvas API ile fotograf uzerinde nokta isaretleyerek olcum alma

(function() {
  "use strict";

  // --- Sabitler ---
  var OLCEK_MM = 30; // Olcek kartindaki referans mesafesi (mm)
  var MAX_DOSYA_BOYUT = 10 * 1024 * 1024; // 10 MB
  var NOKTA_YARICAP = 8;
  var BUYUTME_ADIM = 0.2;
  var MIN_ZOOM = 0.3;
  var MAX_ZOOM = 5;

  // Nokta renkleri ve adlari
  var NOKTALAR = [
    { ad: "Olcek Sol Ucu", renk: "#ef4444", talimat: "Olcek kartindaki referans cizgisinin <strong>sol ucuna</strong> tiklayin." },
    { ad: "Olcek Sag Ucu", renk: "#f97316", talimat: "Olcek kartindaki referans cizgisinin <strong>sag ucuna</strong> tiklayin." },
    { ad: "Sag Goz Odak Noktasi", renk: "#22c55e", talimat: "Sag gozdeki <strong>isaretlenmis odak noktasina</strong> (pupil merkezine) tiklayin." },
    { ad: "Sol Goz Odak Noktasi", renk: "#3b82f6", talimat: "Sol gozdeki <strong>isaretlenmis odak noktasina</strong> (pupil merkezine) tiklayin." },
    { ad: "Sag Cerceve Alt Kenar", renk: "#a855f7", talimat: "Sag gozdeki odak noktasinin <strong>tam altindaki cerceve alt kenarina</strong> tiklayin." },
    { ad: "Sol Cerceve Alt Kenar", renk: "#ec4899", talimat: "Sol gozdeki odak noktasinin <strong>tam altindaki cerceve alt kenarina</strong> tiklayin." }
  ];

  // --- Durum ---
  var durum = {
    gorsel: null,          // Image nesnesi
    noktalar: [],          // [{x, y}] - canvas koordinatlari (orijinal gorsel uzerinde)
    mevcutAdim: 0,         // 0=yukle, 1-6=noktalar
    zoom: 1,
    panX: 0,
    panY: 0,
    surukle: false,
    sonSurukX: 0,
    sonSurukY: 0,
    canvasGenislik: 0,
    canvasYukseklik: 0
  };

  // --- DOM Referanslari ---
  var yukleAlani, dosyaSecici, canvasSarmalayici, canvas, ctx;
  var talimatKutusu, talimatBaslik, talimatMetin;
  var aracCubugu, sonucPaneli, adimGostergesi;
  var btnGeriAl, btnSifirla, btnBuyut, btnKucult, btnYenidenYukle;
  var btnKullan, btnTekrarOlc;

  // --- Baslat ---
  document.addEventListener("DOMContentLoaded", function() {
    yukleAlani = document.getElementById("yukleAlani");
    dosyaSecici = document.getElementById("dosyaSecici");
    canvasSarmalayici = document.getElementById("canvasSarmalayici");
    canvas = document.getElementById("olcumCanvas");
    ctx = canvas.getContext("2d");
    talimatKutusu = document.getElementById("talimatKutusu");
    talimatBaslik = document.getElementById("talimatBaslik");
    talimatMetin = document.getElementById("talimatMetin");
    aracCubugu = document.getElementById("aracCubugu");
    sonucPaneli = document.getElementById("sonucPaneli");
    adimGostergesi = document.getElementById("adimGostergesi");
    btnGeriAl = document.getElementById("btnGeriAl");
    btnSifirla = document.getElementById("btnSifirla");
    btnBuyut = document.getElementById("btnBuyut");
    btnKucult = document.getElementById("btnKucult");
    btnYenidenYukle = document.getElementById("btnYenidenYukle");
    btnKullan = document.getElementById("btnKullan");
    btnTekrarOlc = document.getElementById("btnTekrarOlc");

    baglaOlaylar();
  });

  function baglaOlaylar() {
    // Yukle alani tiklama
    yukleAlani.addEventListener("click", function() {
      dosyaSecici.click();
    });

    // Dosya secici
    dosyaSecici.addEventListener("change", function(e) {
      if (e.target.files && e.target.files[0]) {
        dosyaYukle(e.target.files[0]);
      }
    });

    // Surukle birak
    yukleAlani.addEventListener("dragover", function(e) {
      e.preventDefault();
      yukleAlani.classList.add("surukle-aktif");
    });

    yukleAlani.addEventListener("dragleave", function() {
      yukleAlani.classList.remove("surukle-aktif");
    });

    yukleAlani.addEventListener("drop", function(e) {
      e.preventDefault();
      yukleAlani.classList.remove("surukle-aktif");
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        dosyaYukle(e.dataTransfer.files[0]);
      }
    });

    // Canvas tiklama (nokta koyma)
    canvas.addEventListener("click", function(e) {
      if (durum.surukle) return; // Surukle modunda tiklama
      canvasTikla(e);
    });

    // Canvas surukle (pan)
    canvas.addEventListener("mousedown", function(e) {
      if (e.button === 2 || e.ctrlKey) { // Sag tik veya Ctrl+tik ile surukle
        e.preventDefault();
        durum.surukle = true;
        durum.sonSurukX = e.clientX;
        durum.sonSurukY = e.clientY;
        canvas.style.cursor = "grabbing";
      }
    });

    canvas.addEventListener("mousemove", function(e) {
      if (durum.surukle) {
        var dx = e.clientX - durum.sonSurukX;
        var dy = e.clientY - durum.sonSurukY;
        durum.panX += dx;
        durum.panY += dy;
        durum.sonSurukX = e.clientX;
        durum.sonSurukY = e.clientY;
        ciz();
      }
    });

    document.addEventListener("mouseup", function() {
      if (durum.surukle) {
        durum.surukle = false;
        canvas.style.cursor = "crosshair";
      }
    });

    canvas.addEventListener("contextmenu", function(e) { e.preventDefault(); });

    // Fare tekeri ile zoom
    canvas.addEventListener("wheel", function(e) {
      e.preventDefault();
      var delta = e.deltaY > 0 ? -BUYUTME_ADIM : BUYUTME_ADIM;
      zoomYap(durum.zoom + delta);
    }, { passive: false });

    // Dokunmatik destek
    var sonDokunmaUzakligi = 0;
    canvas.addEventListener("touchstart", function(e) {
      if (e.touches.length === 2) {
        var dx = e.touches[0].clientX - e.touches[1].clientX;
        var dy = e.touches[0].clientY - e.touches[1].clientY;
        sonDokunmaUzakligi = Math.sqrt(dx * dx + dy * dy);
      }
    }, { passive: true });

    canvas.addEventListener("touchmove", function(e) {
      if (e.touches.length === 2) {
        e.preventDefault();
        var dx = e.touches[0].clientX - e.touches[1].clientX;
        var dy = e.touches[0].clientY - e.touches[1].clientY;
        var uzaklik = Math.sqrt(dx * dx + dy * dy);
        var oran = uzaklik / sonDokunmaUzakligi;
        zoomYap(durum.zoom * oran);
        sonDokunmaUzakligi = uzaklik;
      }
    }, { passive: false });

    // Butonlar
    btnGeriAl.addEventListener("click", geriAl);
    btnSifirla.addEventListener("click", sifirlaNoktalar);
    btnBuyut.addEventListener("click", function() { zoomYap(durum.zoom + BUYUTME_ADIM); });
    btnKucult.addEventListener("click", function() { zoomYap(durum.zoom - BUYUTME_ADIM); });
    btnYenidenYukle.addEventListener("click", yenidenYukle);
    btnKullan.addEventListener("click", degerleriKullan);
    btnTekrarOlc.addEventListener("click", sifirlaNoktalar);
  }

  // --- Dosya Yukleme ---
  function dosyaYukle(dosya) {
    // Tip kontrolu
    if (!dosya.type.match(/^image\/(jpeg|png)$/)) {
      bildirimGoster("Sadece JPG ve PNG dosyalar desteklenir.", "hata");
      return;
    }

    // Boyut kontrolu
    if (dosya.size > MAX_DOSYA_BOYUT) {
      bildirimGoster("Dosya boyutu 10 MB'yi asamaz.", "hata");
      return;
    }

    var reader = new FileReader();
    reader.onload = function(e) {
      var img = new Image();
      img.onload = function() {
        durum.gorsel = img;
        durum.noktalar = [];
        durum.mevcutAdim = 1;
        durum.zoom = 1;
        durum.panX = 0;
        durum.panY = 0;

        canvasHazirla();
        goruntuguncelle();
      };
      img.onerror = function() {
        bildirimGoster("Gorsel yuklenemedi. Lutfen baska bir dosya deneyin.", "hata");
      };
      img.src = e.target.result;
    };
    reader.onerror = function() {
      bildirimGoster("Dosya okunamadi. Lutfen tekrar deneyin.", "hata");
    };
    reader.readAsDataURL(dosya);
  }

  // --- Canvas Hazirlama ---
  function canvasHazirla() {
    var sarmalayiciGenislik = canvasSarmalayici.parentElement.clientWidth;
    var oran = durum.gorsel.width / durum.gorsel.height;
    var canvasYukseklik = Math.min(600, sarmalayiciGenislik / oran);
    var canvasGenislik = canvasYukseklik * oran;

    if (canvasGenislik > sarmalayiciGenislik) {
      canvasGenislik = sarmalayiciGenislik;
      canvasYukseklik = canvasGenislik / oran;
    }

    canvas.width = canvasGenislik * 2; // Retina icin 2x
    canvas.height = canvasYukseklik * 2;
    canvas.style.width = canvasGenislik + "px";
    canvas.style.height = canvasYukseklik + "px";

    durum.canvasGenislik = canvasGenislik;
    durum.canvasYukseklik = canvasYukseklik;

    // Zoom'u goruntunun canvas'a sigmasi icin ayarla
    durum.zoom = 1;
    durum.panX = 0;
    durum.panY = 0;

    ciz();
  }

  // --- Cizim ---
  function ciz() {
    var cg = durum.canvasGenislik * 2;
    var cy = durum.canvasYukseklik * 2;

    ctx.clearRect(0, 0, cg, cy);

    // Gorseli ciz (zoom ve pan dahil)
    ctx.save();
    ctx.translate(cg / 2 + durum.panX * 2, cy / 2 + durum.panY * 2);
    ctx.scale(durum.zoom, durum.zoom);

    var gorsG = durum.gorsel.width;
    var gorsY = durum.gorsel.height;

    // Gorseli canvas ortasina yerlestir
    ctx.drawImage(durum.gorsel, -gorsG / 2, -gorsY / 2, gorsG, gorsY);
    ctx.restore();

    // Noktalari ciz
    for (var i = 0; i < durum.noktalar.length; i++) {
      var p = gorseldenCanvasa(durum.noktalar[i].x, durum.noktalar[i].y);
      var renk = NOKTALAR[i].renk;

      // Cember
      ctx.beginPath();
      ctx.arc(p.x * 2, p.y * 2, NOKTA_YARICAP * 2, 0, Math.PI * 2);
      ctx.fillStyle = renk;
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 3;
      ctx.stroke();

      // Etiket
      ctx.font = "bold 22px system-ui, -apple-system, sans-serif";
      ctx.fillStyle = renk;
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 4;
      var etiket = (i + 1).toString();
      ctx.strokeText(etiket, p.x * 2 + 16, p.y * 2 + 6);
      ctx.fillText(etiket, p.x * 2 + 16, p.y * 2 + 6);
    }

    // Olcek cizgisi (ilk iki nokta arasi)
    if (durum.noktalar.length >= 2) {
      var p1 = gorseldenCanvasa(durum.noktalar[0].x, durum.noktalar[0].y);
      var p2 = gorseldenCanvasa(durum.noktalar[1].x, durum.noktalar[1].y);

      ctx.beginPath();
      ctx.moveTo(p1.x * 2, p1.y * 2);
      ctx.lineTo(p2.x * 2, p2.y * 2);
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Olcek etiketi
      var ortaX = (p1.x + p2.x);
      var ortaY = (p1.y + p2.y) - 20;
      ctx.font = "bold 24px system-ui, -apple-system, sans-serif";
      ctx.fillStyle = "#ef4444";
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 4;
      ctx.strokeText(OLCEK_MM + " mm", ortaX, ortaY);
      ctx.fillText(OLCEK_MM + " mm", ortaX, ortaY);
    }

    // Fitting height cizgileri (odak -> alt kenar)
    if (durum.noktalar.length >= 5) {
      // Sag goz: nokta 2 (odak) -> nokta 4 (alt kenar)
      var sagOdak = gorseldenCanvasa(durum.noktalar[2].x, durum.noktalar[2].y);
      var sagAlt = gorseldenCanvasa(durum.noktalar[4].x, durum.noktalar[4].y);

      ctx.beginPath();
      ctx.moveTo(sagOdak.x * 2, sagOdak.y * 2);
      ctx.lineTo(sagAlt.x * 2, sagAlt.y * 2);
      ctx.strokeStyle = "#22c55e";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (durum.noktalar.length >= 6) {
      // Sol goz: nokta 3 (odak) -> nokta 5 (alt kenar)
      var solOdak = gorseldenCanvasa(durum.noktalar[3].x, durum.noktalar[3].y);
      var solAlt = gorseldenCanvasa(durum.noktalar[5].x, durum.noktalar[5].y);

      ctx.beginPath();
      ctx.moveTo(solOdak.x * 2, solOdak.y * 2);
      ctx.lineTo(solAlt.x * 2, solAlt.y * 2);
      ctx.strokeStyle = "#3b82f6";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 3]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  // --- Koordinat Donusumleri ---
  // Canvas tiklamasindan gorsel koordinatina
  function canvasGorsel(canvasX, canvasY) {
    var cg = durum.canvasGenislik;
    var cy = durum.canvasYukseklik;
    var gorsG = durum.gorsel.width;
    var gorsY = durum.gorsel.height;

    // Canvas pikselinden gorsel piksellerine
    var x = (canvasX - cg / 2 - durum.panX) / durum.zoom + gorsG / 2;
    var y = (canvasY - cy / 2 - durum.panY) / durum.zoom + gorsY / 2;

    return { x: x, y: y };
  }

  // Gorsel koordinatindan canvas koordinatina
  function gorseldenCanvasa(gx, gy) {
    var cg = durum.canvasGenislik;
    var cy = durum.canvasYukseklik;
    var gorsG = durum.gorsel.width;
    var gorsY = durum.gorsel.height;

    var x = (gx - gorsG / 2) * durum.zoom + cg / 2 + durum.panX;
    var y = (gy - gorsY / 2) * durum.zoom + cy / 2 + durum.panY;

    return { x: x, y: y };
  }

  // --- Canvas Tiklama ---
  function canvasTikla(e) {
    if (!durum.gorsel || durum.mevcutAdim < 1 || durum.mevcutAdim > 6) return;

    var rect = canvas.getBoundingClientRect();
    var canvasX = e.clientX - rect.left;
    var canvasY = e.clientY - rect.top;

    var gorselKoord = canvasGorsel(canvasX, canvasY);

    // Gorsel disinda mi?
    if (gorselKoord.x < 0 || gorselKoord.y < 0 ||
        gorselKoord.x > durum.gorsel.width || gorselKoord.y > durum.gorsel.height) {
      bildirimGoster("Lutfen fotografin uzerine tiklayin.", "uyari");
      return;
    }

    durum.noktalar.push({ x: gorselKoord.x, y: gorselKoord.y });
    durum.mevcutAdim++;

    ciz();
    goruntuguncelle();

    // Tum noktalar tamamlandi mi?
    if (durum.noktalar.length === 6) {
      hesaplaOlcumler();
    }
  }

  // --- Hesaplama ---
  function hesaplaOlcumler() {
    // Olcek faktoru: piksel basina mm
    var olcekP1 = durum.noktalar[0];
    var olcekP2 = durum.noktalar[1];
    var olcekPiksel = mesafe(olcekP1, olcekP2);

    if (olcekPiksel < 10) {
      bildirimGoster("Olcek noktalari cok yakin. Lutfen tekrar deneyin.", "hata");
      sifirlaNoktalar();
      return;
    }

    var mmPerPiksel = OLCEK_MM / olcekPiksel;

    // PD hesaplama: Sag ve sol odak noktasi arasindaki yatay mesafe
    var sagOdak = durum.noktalar[2];
    var solOdak = durum.noktalar[3];

    // Burunun ortasi referans (iki odak noktasinin orta noktasi)
    var burunOrtaX = (sagOdak.x + solOdak.x) / 2;

    // Monokuler PD: her gozden burun ortasina olan yatay mesafe
    var pdSagPx = Math.abs(sagOdak.x - burunOrtaX);
    var pdSolPx = Math.abs(solOdak.x - burunOrtaX);

    var pdSagMm = pdSagPx * mmPerPiksel;
    var pdSolMm = pdSolPx * mmPerPiksel;

    // Fitting height: odak noktasindan cerceve alt kenarina dikey mesafe
    var sagAlt = durum.noktalar[4];
    var solAlt = durum.noktalar[5];

    var fhSagPx = Math.abs(sagAlt.y - sagOdak.y);
    var fhSolPx = Math.abs(solAlt.y - solOdak.y);

    var fhSagMm = fhSagPx * mmPerPiksel;
    var fhSolMm = fhSolPx * mmPerPiksel;

    // Dusuk veya yuksek deger uyarisi
    var uyarilar = [];
    if (pdSagMm < 25 || pdSagMm > 40) uyarilar.push("Sag goz mesafesi beklenen aralik disinda (" + pdSagMm.toFixed(1) + " mm). Kontrol edin.");
    if (pdSolMm < 25 || pdSolMm > 40) uyarilar.push("Sol goz mesafesi beklenen aralik disinda (" + pdSolMm.toFixed(1) + " mm). Kontrol edin.");
    if (fhSagMm < 10 || fhSagMm > 35) uyarilar.push("Sag odak yuksekligi beklenen aralik disinda (" + fhSagMm.toFixed(1) + " mm). Kontrol edin.");
    if (fhSolMm < 10 || fhSolMm > 35) uyarilar.push("Sol odak yuksekligi beklenen aralik disinda (" + fhSolMm.toFixed(1) + " mm). Kontrol edin.");

    if (uyarilar.length > 0) {
      bildirimGoster(uyarilar[0], "uyari");
    }

    // Yuvarla (0.5 mm hassasiyetinde)
    pdSagMm = Math.round(pdSagMm * 2) / 2;
    pdSolMm = Math.round(pdSolMm * 2) / 2;
    fhSagMm = Math.round(fhSagMm * 2) / 2;
    fhSolMm = Math.round(fhSolMm * 2) / 2;

    // Sonuclari goster
    document.getElementById("sonucPdSag").textContent = pdSagMm.toFixed(1);
    document.getElementById("sonucPdSol").textContent = pdSolMm.toFixed(1);
    document.getElementById("sonucFhSag").textContent = fhSagMm.toFixed(1);
    document.getElementById("sonucFhSol").textContent = fhSolMm.toFixed(1);

    sonucPaneli.classList.add("goster");

    // Sonuclari sakla
    durum.sonuclar = {
      pdSag: pdSagMm,
      pdSol: pdSolMm,
      fhSag: fhSagMm,
      fhSol: fhSolMm
    };
  }

  function mesafe(p1, p2) {
    var dx = p2.x - p1.x;
    var dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // --- Degerleri Ana Forma Aktar ---
  function degerleriKullan() {
    if (!durum.sonuclar) return;

    var s = durum.sonuclar;

    // Ana sayfaya yonlendir (URL parametreleri ile)
    var params = new URLSearchParams();
    params.set("pdSag", s.pdSag);
    params.set("pdSol", s.pdSol);
    params.set("fhSag", s.fhSag);
    params.set("fhSol", s.fhSol);
    params.set("kaynak", "foto");

    window.location.href = "index.html?" + params.toString();
  }

  // --- Zoom ---
  function zoomYap(yeniZoom) {
    durum.zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, yeniZoom));
    ciz();
  }

  // --- Geri Al ---
  function geriAl() {
    if (durum.noktalar.length === 0) return;

    durum.noktalar.pop();
    durum.mevcutAdim = durum.noktalar.length + 1;

    sonucPaneli.classList.remove("goster");
    ciz();
    goruntuguncelle();
  }

  // --- Sifirla ---
  function sifirlaNoktalar() {
    durum.noktalar = [];
    durum.mevcutAdim = 1;
    durum.sonuclar = null;

    sonucPaneli.classList.remove("goster");
    ciz();
    goruntuguncelle();
  }

  // --- Yeniden Yukle ---
  function yenidenYukle() {
    durum.gorsel = null;
    durum.noktalar = [];
    durum.mevcutAdim = 0;
    durum.zoom = 1;
    durum.panX = 0;
    durum.panY = 0;
    durum.sonuclar = null;

    dosyaSecici.value = "";
    sonucPaneli.classList.remove("goster");
    goruntuguncelle();
  }

  // --- Goruntuyu Guncelle ---
  function goruntuguncelle() {
    var gorselVar = durum.gorsel !== null;

    // Yukle alani
    if (gorselVar) {
      yukleAlani.classList.add("gizle");
    } else {
      yukleAlani.classList.remove("gizle");
    }

    // Canvas
    if (gorselVar) {
      canvasSarmalayici.classList.add("goster");
    } else {
      canvasSarmalayici.classList.remove("goster");
    }

    // Arac cubugu
    if (gorselVar) {
      aracCubugu.classList.add("goster");
    } else {
      aracCubugu.classList.remove("goster");
    }

    // Talimat kutusu
    if (gorselVar && durum.mevcutAdim >= 1 && durum.mevcutAdim <= 6) {
      talimatKutusu.classList.add("goster");
      var noktaIdx = durum.mevcutAdim - 1;
      talimatBaslik.textContent = "Adim " + durum.mevcutAdim + ": " + NOKTALAR[noktaIdx].ad;
      talimatMetin.innerHTML = NOKTALAR[noktaIdx].talimat;
    } else if (gorselVar && durum.mevcutAdim > 6) {
      talimatKutusu.classList.add("goster");
      talimatBaslik.textContent = "Tamamlandi!";
      talimatMetin.innerHTML = "Tum noktalar isaretlendi. Olcumler asagida hesaplandi.";
    } else {
      talimatKutusu.classList.remove("goster");
    }

    // Geri al butonu
    btnGeriAl.disabled = durum.noktalar.length === 0;

    // Adim gostergesi
    var adimlar = adimGostergesi.querySelectorAll(".adim");
    for (var i = 0; i < adimlar.length; i++) {
      adimlar[i].classList.remove("aktif", "tamamlandi");

      if (i === 0) {
        // Fotograf yukle adimi
        if (!gorselVar) {
          adimlar[i].classList.add("aktif");
        } else {
          adimlar[i].classList.add("tamamlandi");
        }
      } else {
        // Nokta adimlari (1-6)
        var noktaIdx = i - 1;
        if (noktaIdx < durum.noktalar.length) {
          adimlar[i].classList.add("tamamlandi");
        } else if (noktaIdx === durum.noktalar.length && gorselVar) {
          adimlar[i].classList.add("aktif");
        }
      }
    }

    // Nokta bilgi listesi
    for (var j = 0; j < NOKTALAR.length; j++) {
      var noktaBilgiEl = document.getElementById("noktaBilgi" + j);
      if (noktaBilgiEl) {
        if (j < durum.noktalar.length) {
          noktaBilgiEl.classList.add("tamamlandi");
        } else {
          noktaBilgiEl.classList.remove("tamamlandi");
        }
      }
    }
  }

})();
