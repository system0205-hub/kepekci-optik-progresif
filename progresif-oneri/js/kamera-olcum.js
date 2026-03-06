// Kepekci Optik - Kameradan Olcum Modulu
// MediaPipe Face Landmarker ile otomatik iris tespiti + referans kart kalibrasyonu

(function() {
  "use strict";

  // --- Sabitler ---
  var OLCEK_MM = 30; // Olcek kartindaki referans mesafesi (mm)
  var IRIS_CAPI_MM = 11.7; // Ortalama insan iris capi (mm) - kartsiz kalibrasyon icin
  var NOKTA_YARICAP = 8;
  var BUYUTME_ADIM = 0.2;
  var MIN_ZOOM = 0.3;
  var MAX_ZOOM = 5;

  // Mesafe ve konverjans sabitleri
  var STOP_MESAFE_MM = 27; // Vertex mesafesi + kornea-rotasyon merkezi arasi (mm)

  // Cihaz tespiti ve HFOV ayari
  var MOBIL_CIHAZ = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  var HFOV_LAPTOP = 70;  // Laptop on kamera yatay gorus acisi (derece)
  var HFOV_TELEFON = 78;  // Telefon on kamera yatay gorus acisi (derece)
  var VARSAYILAN_HFOV_DERECE = MOBIL_CIHAZ ? HFOV_TELEFON : HFOV_LAPTOP;

  var OPTIMAL_MESAFE_MIN_CM = MOBIL_CIHAZ ? 30 : 35; // Minimum ideal mesafe (cm)
  var OPTIMAL_MESAFE_MAX_CM = 50; // Maksimum ideal mesafe (cm)

  // Otomatik yakalama sabitleri
  var OTO_YAKALAMA_SURE_MS = 3000; // Ideal mesafede bekleme suresi (3 saniye)
  var OTO_YAKALAMA_AKTIF = true;

  // Burun koprüsu landmark indeksi (monokuler PD icin yuz merkez hatti)
  var BURUN_KOPRUSU = 168; // Iki goz arasindaki burun koprüsü tepesi

  // PD stabilizasyon sabitleri
  var PD_ORTALAMA_KARE = 10; // Son 10 karenin ortalamasini al
  var PD_MIN_MESAFE_CM = 25; // Bu mesafenin altinda PD gosterme

  // MediaPipe iris landmark indeksleri
  var IRIS_SOL_MERKEZ = 468; // Kamera perspektifinden sol = kisinin sag gozu
  var IRIS_SAG_MERKEZ = 473; // Kamera perspektifinden sag = kisinin sol gozu
  var IRIS_SOL_CEVRE = [469, 470, 471, 472]; // Sol iris cevre noktalari
  var IRIS_SAG_CEVRE = [474, 475, 476, 477]; // Sag iris cevre noktalari

  // Manuel nokta bilgileri (olcek + cerceve alt kenar)
  var NOKTALAR = [
    { ad: "Olcek Sol Ucu", renk: "#ef4444", talimat: "Olcek kartindaki referans cizgisinin <strong>sol ucuna</strong> tiklayin." },
    { ad: "Olcek Sag Ucu", renk: "#f97316", talimat: "Olcek kartindaki referans cizgisinin <strong>sag ucuna</strong> tiklayin." },
    { ad: "Sag Cerceve Alt Kenar", renk: "#a855f7", talimat: "Sag gozdeki odak noktasinin <strong>tam altindaki cerceve alt kenarina</strong> tiklayin." },
    { ad: "Sol Cerceve Alt Kenar", renk: "#ec4899", talimat: "Sol gozdeki odak noktasinin <strong>tam altindaki cerceve alt kenarina</strong> tiklayin." }
  ];

  // Adimlar: 0=kurulum, 1=kamera, 2=yakalandi, 3=olcek1, 4=olcek2, 5=cerceveSag, 6=cerceveSol, 7=tamamlandi
  var ADIM = {
    KURULUM: 0,
    KAMERA: 1,
    YAKALANDI: 2,
    OLCEK_1: 3,
    OLCEK_2: 4,
    CERCEVE_SAG: 5,
    CERCEVE_SOL: 6,
    TAMAMLANDI: 7
  };

  // --- Durum ---
  var durum = {
    faceLandmarker: null,
    modelHazir: false,
    videoStream: null,
    kameraAktif: false,
    facingMode: "user", // "user" = on kamera, "environment" = arka kamera
    mevcutAdim: ADIM.KURULUM,
    // Canli algilama
    animFrameId: null,
    sonIrisler: null, // { sagX, sagY, solX, solY } - normalize degerler
    yuzGuveni: 0,
    // Yakalanan kare
    yakalananGorsel: null, // Image nesnesi
    irisNoktalar: null, // { sagX, sagY, solX, solY } - piksel koordinatlari (gorsel uzerinde)
    irisCaplari: null, // { sagCap, solCap } - piksel cinsinden iris caplari
    // Manuel noktalar (olcek + cerceve alt kenar)
    manuelNoktalar: [], // [{x, y}] - gorsel koordinatlari
    // Canvas
    zoom: 1,
    panX: 0,
    panY: 0,
    surukle: false,
    sonSurukX: 0,
    sonSurukY: 0,
    canvasGenislik: 0,
    canvasYukseklik: 0,
    // Sonuclar
    sonuclar: null
  };

  // --- DOM Referanslari ---
  var kameraKurulum, videoSarmalayici, kameraVideo, onizlemeCanvas, onizlemeCtx;
  var canvasSarmalayici, olcumCanvas, olcumCtx;
  var talimatKutusu, talimatBaslik, talimatMetin;
  var aracCubugu, sonucPaneli, adimGostergesi;
  var algilamaDurumu, canliPd, mesafeGosterge, yukleniyorKapsam;
  var btnKameraBaslat, btnCek, btnKameraDegistir;
  var btnGeriAl, btnSifirla, btnBuyut, btnKucult, btnYenidenCek;
  var btnKullan, btnTekrarOlc;

  // --- Baslat ---
  document.addEventListener("DOMContentLoaded", function() {
    kameraKurulum = document.getElementById("kameraKurulum");
    videoSarmalayici = document.getElementById("videoSarmalayici");
    kameraVideo = document.getElementById("kameraVideo");
    onizlemeCanvas = document.getElementById("onizlemeCanvas");
    onizlemeCtx = onizlemeCanvas.getContext("2d");
    canvasSarmalayici = document.getElementById("canvasSarmalayici");
    olcumCanvas = document.getElementById("olcumCanvas");
    olcumCtx = olcumCanvas.getContext("2d");
    talimatKutusu = document.getElementById("talimatKutusu");
    talimatBaslik = document.getElementById("talimatBaslik");
    talimatMetin = document.getElementById("talimatMetin");
    aracCubugu = document.getElementById("aracCubugu");
    sonucPaneli = document.getElementById("sonucPaneli");
    adimGostergesi = document.getElementById("adimGostergesi");
    algilamaDurumu = document.getElementById("algilamaDurumu");
    canliPd = document.getElementById("canliPd");
    mesafeGosterge = document.getElementById("mesafeGosterge");
    yukleniyorKapsam = document.getElementById("yukleniyorKapsam");
    btnKameraBaslat = document.getElementById("btnKameraBaslat");
    btnCek = document.getElementById("btnCek");
    btnKameraDegistir = document.getElementById("btnKameraDegistir");
    btnGeriAl = document.getElementById("btnGeriAl");
    btnSifirla = document.getElementById("btnSifirla");
    btnBuyut = document.getElementById("btnBuyut");
    btnKucult = document.getElementById("btnKucult");
    btnYenidenCek = document.getElementById("btnYenidenCek");
    btnKullan = document.getElementById("btnKullan");
    btnTekrarOlc = document.getElementById("btnTekrarOlc");

    baglaOlaylar();
    mediapipeHazirBekle();
  });

  // --- MediaPipe Hazir Bekleme ---
  function mediapipeHazirBekle() {
    if (window.FaceLandmarker) {
      faceLandmarkerOlustur();
    } else {
      window.addEventListener("mediapipe-ready", function() {
        faceLandmarkerOlustur();
      });
    }
  }

  // --- MediaPipe Face Landmarker Baslat ---
  function faceLandmarkerOlustur() {
    yukleniyorKapsam.classList.add("goster");
    kameraKurulum.classList.add("gizle");

    window.FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm"
    ).then(function(filesetResolver) {
      return window.FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          delegate: "GPU"
        },
        outputFaceBlendshapes: false,
        outputFacialTransformationMatrixes: false,
        runningMode: "VIDEO",
        numFaces: 1
      });
    }).then(function(landmarker) {
      durum.faceLandmarker = landmarker;
      durum.modelHazir = true;

      yukleniyorKapsam.classList.remove("goster");
      kameraKurulum.classList.remove("gizle");

      bildirimGoster("AI yuz algilama modeli yuklendi!", "basarili");
    }).catch(function(hata) {
      yukleniyorKapsam.classList.remove("goster");
      kameraKurulum.classList.remove("gizle");

      console.error("MediaPipe yukleme hatasi:", hata);
      bildirimGoster("AI modeli yuklenemedi. Internet baglantinizi kontrol edin ve sayfayi yenileyin.", "hata");
    });
  }

  // --- Olaylar ---
  function baglaOlaylar() {
    btnKameraBaslat.addEventListener("click", function() {
      // HTTPS kontrolu (file:// protokolu de guvenli baglam sayilir)
      var guvenli = location.protocol === "https:" ||
                    location.protocol === "file:" ||
                    location.hostname === "localhost" ||
                    location.hostname === "127.0.0.1";
      if (!guvenli) {
        bildirimGoster("Kamera erisimi icin HTTPS baglantisi gereklidir.", "hata");
        return;
      }
      kameraBaslat();
    });

    btnCek.addEventListener("click", kareCek);
    btnKameraDegistir.addEventListener("click", kameraDegistir);
    btnYenidenCek.addEventListener("click", yenidenCek);

    // Canvas tiklama (nokta koyma)
    olcumCanvas.addEventListener("click", function(e) {
      if (durum.surukle) return;
      canvasTikla(e);
    });

    // Canvas surukle (pan)
    olcumCanvas.addEventListener("mousedown", function(e) {
      if (e.button === 2 || e.ctrlKey) {
        e.preventDefault();
        durum.surukle = true;
        durum.sonSurukX = e.clientX;
        durum.sonSurukY = e.clientY;
        olcumCanvas.style.cursor = "grabbing";
      }
    });

    olcumCanvas.addEventListener("mousemove", function(e) {
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
        olcumCanvas.style.cursor = "crosshair";
      }
    });

    olcumCanvas.addEventListener("contextmenu", function(e) { e.preventDefault(); });

    // Fare tekeri ile zoom
    olcumCanvas.addEventListener("wheel", function(e) {
      e.preventDefault();
      var delta = e.deltaY > 0 ? -BUYUTME_ADIM : BUYUTME_ADIM;
      zoomYap(durum.zoom + delta);
    }, { passive: false });

    // Dokunmatik destek
    var sonDokunmaUzakligi = 0;
    olcumCanvas.addEventListener("touchstart", function(e) {
      if (e.touches.length === 2) {
        var dx = e.touches[0].clientX - e.touches[1].clientX;
        var dy = e.touches[0].clientY - e.touches[1].clientY;
        sonDokunmaUzakligi = Math.sqrt(dx * dx + dy * dy);
      }
    }, { passive: true });

    olcumCanvas.addEventListener("touchmove", function(e) {
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
    btnKullan.addEventListener("click", degerleriKullan);
    btnTekrarOlc.addEventListener("click", function() { yenidenCek(); });
  }

  // ===== KAMERA FONKSIYONLARI =====

  function kameraBaslat() {
    if (!durum.modelHazir) {
      bildirimGoster("AI modeli henuz yuklenmedi. Lutfen bekleyin.", "uyari");
      return;
    }

    var constraints = {
      video: {
        facingMode: durum.facingMode,
        width: { ideal: 1280, min: 640 },
        height: { ideal: 720, min: 480 }
      }
    };

    navigator.mediaDevices.getUserMedia(constraints)
      .then(function(stream) {
        durum.videoStream = stream;
        kameraVideo.srcObject = stream;
        durum.kameraAktif = true;

        kameraVideo.addEventListener("loadedmetadata", function() {
          // Onizleme canvas boyutlarini video ile esitle
          onizlemeCanvas.width = kameraVideo.videoWidth;
          onizlemeCanvas.height = kameraVideo.videoHeight;

          // Cihaz bilgisini logla
          console.log("[Kamera Kalibrasyon] Cihaz: " + (MOBIL_CIHAZ ? "Telefon" : "Laptop") +
            " | HFOV: " + VARSAYILAN_HFOV_DERECE + "° | Min mesafe: " + OPTIMAL_MESAFE_MIN_CM + "cm");

          durum.mevcutAdim = ADIM.KAMERA;
          goruntuguncelle();

          // Canli algilama baslat
          canliAlgilamaBaslat();
        }, { once: true });
      })
      .catch(function(hata) {
        console.error("Kamera hatasi:", hata);
        if (hata.name === "NotAllowedError") {
          bildirimGoster("Kamera izni reddedildi. Tarayici ayarlarindan kamera iznini verin.", "hata");
        } else if (hata.name === "NotFoundError") {
          bildirimGoster("Kamera bulunamadi. Fotograftan olcum almak icin foto olcum sayfasini kullanin.", "hata");
        } else {
          bildirimGoster("Kamera acilamadi: " + hata.message, "hata");
        }
      });
  }

  function kameraDurdur() {
    if (durum.videoStream) {
      durum.videoStream.getTracks().forEach(function(track) { track.stop(); });
      durum.videoStream = null;
    }
    durum.kameraAktif = false;

    if (durum.animFrameId) {
      cancelAnimationFrame(durum.animFrameId);
      durum.animFrameId = null;
    }
  }

  function kameraDegistir() {
    durum.facingMode = durum.facingMode === "user" ? "environment" : "user";

    // Ayna efektini ayarla
    if (durum.facingMode === "user") {
      kameraVideo.style.transform = "scaleX(-1)";
      onizlemeCanvas.style.transform = "scaleX(-1)";
    } else {
      kameraVideo.style.transform = "scaleX(1)";
      onizlemeCanvas.style.transform = "scaleX(1)";
    }

    kameraDurdur();
    kameraBaslat();
  }

  // ===== CANLI ALGILAMA =====

  function canliAlgilamaBaslat() {
    if (!durum.faceLandmarker || !durum.kameraAktif) return;

    // Running mode'u VIDEO olarak ayarla
    durum.faceLandmarker.setOptions({ runningMode: "VIDEO" });

    var kareSayaci = 0;
    var performansAzalt = MOBIL_CIHAZ; // Mobilde her 3 karede 1

    // Otomatik yakalama degiskenleri
    var otoYakalama = {
      idealBaslangic: 0,     // ideal mesafeye giris zamani
      geriSayimAktif: false,
      kalanMs: OTO_YAKALAMA_SURE_MS
    };

    // PD stabilizasyon buffer'i
    var pdBuffer = [];  // Son N karenin PD degerleri

    function algilamaDongusu() {
      if (!durum.kameraAktif || durum.mevcutAdim !== ADIM.KAMERA) return;

      kareSayaci++;

      // Mobilde her 3 karede 1, masaustunde her kare
      if (performansAzalt && kareSayaci % 3 !== 0) {
        durum.animFrameId = requestAnimationFrame(algilamaDongusu);
        return;
      }

      if (kameraVideo.readyState >= 2) { // HAVE_CURRENT_DATA
        var sonuc;
        try {
          sonuc = durum.faceLandmarker.detectForVideo(kameraVideo, performance.now());
        } catch (e) {
          console.error("Yuz algilama hatasi:", e);
          durum.animFrameId = requestAnimationFrame(algilamaDongusu);
          return;
        }

        // Onizleme canvas'ini temizle
        onizlemeCtx.clearRect(0, 0, onizlemeCanvas.width, onizlemeCanvas.height);

        if (sonuc.faceLandmarks && sonuc.faceLandmarks.length > 0) {
          var landmarks = sonuc.faceLandmarks[0];
          var w = onizlemeCanvas.width;
          var h = onizlemeCanvas.height;

          // Iris merkezlerini al
          var solIris = landmarks[IRIS_SOL_MERKEZ]; // Kisinin sag gozu
          var sagIris = landmarks[IRIS_SAG_MERKEZ]; // Kisinin sol gozu

          if (solIris && sagIris) {
            durum.sonIrisler = {
              sagX: solIris.x, sagY: solIris.y, // Kamera sol = kisinin sag
              solX: sagIris.x, solY: sagIris.y  // Kamera sag = kisinin sol
            };

            // Iris noktalarini ciz
            // Sag goz (yesil)
            onizlemeCtx.beginPath();
            onizlemeCtx.arc(solIris.x * w, solIris.y * h, 6, 0, Math.PI * 2);
            onizlemeCtx.fillStyle = "rgba(34, 197, 94, 0.8)";
            onizlemeCtx.fill();
            onizlemeCtx.strokeStyle = "#fff";
            onizlemeCtx.lineWidth = 2;
            onizlemeCtx.stroke();

            // Sol goz (mavi)
            onizlemeCtx.beginPath();
            onizlemeCtx.arc(sagIris.x * w, sagIris.y * h, 6, 0, Math.PI * 2);
            onizlemeCtx.fillStyle = "rgba(59, 130, 246, 0.8)";
            onizlemeCtx.fill();
            onizlemeCtx.strokeStyle = "#fff";
            onizlemeCtx.lineWidth = 2;
            onizlemeCtx.stroke();

            // Iris cevre noktalari - sag goz
            for (var i = 0; i < IRIS_SOL_CEVRE.length; i++) {
              var p = landmarks[IRIS_SOL_CEVRE[i]];
              onizlemeCtx.beginPath();
              onizlemeCtx.arc(p.x * w, p.y * h, 3, 0, Math.PI * 2);
              onizlemeCtx.fillStyle = "rgba(34, 197, 94, 0.5)";
              onizlemeCtx.fill();
            }

            // Iris cevre noktalari - sol goz
            for (var j = 0; j < IRIS_SAG_CEVRE.length; j++) {
              var q = landmarks[IRIS_SAG_CEVRE[j]];
              onizlemeCtx.beginPath();
              onizlemeCtx.arc(q.x * w, q.y * h, 3, 0, Math.PI * 2);
              onizlemeCtx.fillStyle = "rgba(59, 130, 246, 0.5)";
              onizlemeCtx.fill();
            }

            // Canli PD goster (iris capi uzerinden mm tahmini, sag/sol ayri)
            // Iris capini piksel cinsinden hesapla (her iki gozun ortalamasi)
            var sagIrisCapPx = 0, solIrisCapPx = 0;
            for (var ii = 0; ii < IRIS_SOL_CEVRE.length; ii++) {
              var cp = landmarks[IRIS_SOL_CEVRE[ii]];
              sagIrisCapPx += Math.sqrt(Math.pow((cp.x - solIris.x) * w, 2) + Math.pow((cp.y - solIris.y) * h, 2));
            }
            sagIrisCapPx = (sagIrisCapPx / IRIS_SOL_CEVRE.length) * 2;
            for (var jj = 0; jj < IRIS_SAG_CEVRE.length; jj++) {
              var cq = landmarks[IRIS_SAG_CEVRE[jj]];
              solIrisCapPx += Math.sqrt(Math.pow((cq.x - sagIris.x) * w, 2) + Math.pow((cq.y - sagIris.y) * h, 2));
            }
            solIrisCapPx = (solIrisCapPx / IRIS_SAG_CEVRE.length) * 2;
            var ortIrisCapPx = (sagIrisCapPx + solIrisCapPx) / 2;
            var pxToMm = IRIS_CAPI_MM / ortIrisCapPx;

            // Mesafe tahmini (iris capindan)
            var tahminMesafeMm = mesafeTahminEt(ortIrisCapPx, w);
            var tahminMesafeCm = Math.round(tahminMesafeMm / 10);

            // Monokuler PD hesapla - burun koprusu landmark'i ile (R != L olabilir)
            var burunKoprusu = landmarks[BURUN_KOPRUSU];
            var burunX = burunKoprusu ? burunKoprusu.x * w : (solIris.x * w + sagIris.x * w) / 2;
            var yakinPdSag = Math.abs(solIris.x * w - burunX) * pxToMm;  // Kisinin sag gozu
            var yakinPdSol = Math.abs(sagIris.x * w - burunX) * pxToMm;  // Kisinin sol gozu
            var yakinPdToplam = Math.abs(solIris.x * w - sagIris.x * w) * pxToMm;

            // Konverjans duzeltmesi: yakin PD -> uzak PD
            var pdSag = uzakPdHesapla(yakinPdSag, tahminMesafeMm);
            var pdSol = uzakPdHesapla(yakinPdSol, tahminMesafeMm);
            var pdToplam = uzakPdHesapla(yakinPdToplam, tahminMesafeMm);

            // PD stabilizasyonu: son N karenin hareketli ortalamasi
            pdBuffer.push({ sag: pdSag, sol: pdSol, toplam: pdToplam });
            if (pdBuffer.length > PD_ORTALAMA_KARE) pdBuffer.shift();
            var ortPdSag = 0, ortPdSol = 0, ortPdToplam = 0;
            for (var pb = 0; pb < pdBuffer.length; pb++) {
              ortPdSag += pdBuffer[pb].sag;
              ortPdSol += pdBuffer[pb].sol;
              ortPdToplam += pdBuffer[pb].toplam;
            }
            ortPdSag /= pdBuffer.length;
            ortPdSol /= pdBuffer.length;
            ortPdToplam /= pdBuffer.length;

            // Son canli PD degerlerini sakla (fotograf PD hesabi icin)
            durum.canliPdVerisi = {
              pdSag: ortPdSag,
              pdSol: ortPdSol,
              pdToplam: ortPdToplam
            };

            // Mesafe cok yakinsa PD guvenilir degil - uyari goster
            if (tahminMesafeCm < PD_MIN_MESAFE_CM) {
              canliPd.textContent = "PD: -- mm (cok yakin, uzaklasin)";
            } else {
              canliPd.textContent = "PD: ~" + ortPdToplam.toFixed(1) + " mm (R: " + ortPdSag.toFixed(1) + " | L: " + ortPdSol.toFixed(1) + ")";
            }
            canliPd.classList.add("goster");
            var mDurum = mesafeDurumu(tahminMesafeCm);
            mesafeGosterge.className = "mesafe-gosterge goster " + mDurum;
            if (mDurum === "ideal") {
              // Otomatik yakalama: geri sayim
              if (OTO_YAKALAMA_AKTIF && !otoYakalama.geriSayimAktif) {
                otoYakalama.idealBaslangic = performance.now();
                otoYakalama.geriSayimAktif = true;
              }
              if (otoYakalama.geriSayimAktif) {
                var gecenMs = performance.now() - otoYakalama.idealBaslangic;
                otoYakalama.kalanMs = OTO_YAKALAMA_SURE_MS - gecenMs;
                if (otoYakalama.kalanMs <= 0) {
                  // Otomatik yakalama!
                  otoYakalama.geriSayimAktif = false;
                  mesafeGosterge.textContent = "Yakalandi!";
                  kareCek();
                  return; // Donguyu durdur
                }
                var kalanSn = Math.ceil(otoYakalama.kalanMs / 1000);
                mesafeGosterge.textContent = "~" + tahminMesafeCm + " cm - Ideal!\n" + kalanSn + " sn...";
              } else {
                mesafeGosterge.textContent = "~" + tahminMesafeCm + " cm - Ideal!";
              }
            } else {
              // Ideal degilse geri sayimi sifirla
              otoYakalama.geriSayimAktif = false;
              otoYakalama.kalanMs = OTO_YAKALAMA_SURE_MS;
              if (mDurum === "cok_yakin") {
                mesafeGosterge.textContent = "~" + tahminMesafeCm + " cm\nCok yakin! Uzaklastin";
              } else if (mDurum === "yakin") {
                mesafeGosterge.textContent = "~" + tahminMesafeCm + " cm\nBiraz uzaklastin";
              } else if (mDurum === "cok_uzak") {
                mesafeGosterge.textContent = "~" + tahminMesafeCm + " cm\nCok uzak! Yaklastin";
              } else {
                mesafeGosterge.textContent = "~" + tahminMesafeCm + " cm\nBiraz yaklastin";
              }
            }

            // Durum: bulundu
            algilamaDurumu.textContent = "Yuz algilandi";
            algilamaDurumu.className = "algilama-durumu bulundu";
          }
        } else {
          durum.sonIrisler = null;
          canliPd.classList.remove("goster");
          mesafeGosterge.classList.remove("goster");
          algilamaDurumu.textContent = "Yuz bulunamadi";
          algilamaDurumu.className = "algilama-durumu bulunamadi";
        }
      }

      durum.animFrameId = requestAnimationFrame(algilamaDongusu);
    }

    // Algilama durumunu guncelle
    algilamaDurumu.textContent = "Model hazir - yuz araniyor...";
    algilamaDurumu.className = "algilama-durumu yukleniyor";

    durum.animFrameId = requestAnimationFrame(algilamaDongusu);
  }

  // ===== KARE YAKALAMA =====

  function kareCek() {
    if (!durum.kameraAktif || !durum.sonIrisler) {
      bildirimGoster("Yuz algilanamadi. Lutfen yuzunuzu kameraya dogru tutun.", "uyari");
      return;
    }

    // Canli algilamayi durdur
    if (durum.animFrameId) {
      cancelAnimationFrame(durum.animFrameId);
      durum.animFrameId = null;
    }

    // Video karesi al
    var tempCanvas = document.createElement("canvas");
    tempCanvas.width = kameraVideo.videoWidth;
    tempCanvas.height = kameraVideo.videoHeight;
    var tempCtx = tempCanvas.getContext("2d");

    // On kamera ise ayna et
    if (durum.facingMode === "user") {
      tempCtx.translate(tempCanvas.width, 0);
      tempCtx.scale(-1, 1);
    }
    tempCtx.drawImage(kameraVideo, 0, 0);

    // Kamerayi durdur
    kameraDurdur();

    // Yakalanan kareyi Image nesnesine cevir
    var dataUrl = tempCanvas.toDataURL("image/jpeg", 0.95);
    var img = new Image();
    img.onload = function() {
      durum.yakalananGorsel = img;

      // Son algilama sonuclarini IMAGE modunda tekrar calistir (daha yuksek dogruluk)
      durum.faceLandmarker.setOptions({ runningMode: "IMAGE" });

      var sonuc;
      try {
        sonuc = durum.faceLandmarker.detect(img);
      } catch (e) {
        console.error("Fotograf yuz algilama hatasi:", e);
        bildirimGoster("Yuz algilama sirasinda hata olustu. Tekrar deneyin.", "hata");
        kameraBaslat();
        return;
      }

      if (sonuc.faceLandmarks && sonuc.faceLandmarks.length > 0) {
        var landmarks = sonuc.faceLandmarks[0];
        var w = img.width;
        var h = img.height;

        var solIris = landmarks[IRIS_SOL_MERKEZ]; // 468
        var sagIris = landmarks[IRIS_SAG_MERKEZ]; // 473

        // On kamerada pikseller aynalanir, landmark esleme ters donmeli
        if (durum.facingMode === "user") {
          // Aynalanmis goruntu: 468 artik sol gozu, 473 artik sag gozu gosterir
          durum.irisNoktalar = {
            sagX: sagIris.x * w, sagY: sagIris.y * h,
            solX: solIris.x * w, solY: solIris.y * h
          };
        } else {
          // Arka kamera (aynasiz): orijinal esleme
          durum.irisNoktalar = {
            sagX: solIris.x * w, sagY: solIris.y * h,
            solX: sagIris.x * w, solY: sagIris.y * h
          };
        }

        // Iris caplarini hesapla (piksel cinsinden)
        var sagCevreDizi, solCevreDizi, sagMerkez, solMerkez;
        if (durum.facingMode === "user") {
          // Aynalanmis: cevre dizileri de ters
          sagCevreDizi = IRIS_SAG_CEVRE;
          solCevreDizi = IRIS_SOL_CEVRE;
          sagMerkez = { x: sagIris.x * w, y: sagIris.y * h };
          solMerkez = { x: solIris.x * w, y: solIris.y * h };
        } else {
          sagCevreDizi = IRIS_SOL_CEVRE;
          solCevreDizi = IRIS_SAG_CEVRE;
          sagMerkez = { x: solIris.x * w, y: solIris.y * h };
          solMerkez = { x: sagIris.x * w, y: sagIris.y * h };
        }

        var sagIrisCevreler = sagCevreDizi.map(function(idx) {
          return { x: landmarks[idx].x * w, y: landmarks[idx].y * h };
        });
        var solIrisCevreler = solCevreDizi.map(function(idx) {
          return { x: landmarks[idx].x * w, y: landmarks[idx].y * h };
        });

        durum.irisCaplari = {
          sagCap: irisCapiHesapla(sagMerkez, sagIrisCevreler),
          solCap: irisCapiHesapla(solMerkez, solIrisCevreler)
        };

        // Burun koprusu pozisyonunu sakla (monokuler PD icin)
        var burunKoprusuYakalama = landmarks[BURUN_KOPRUSU];
        if (burunKoprusuYakalama) {
          if (durum.facingMode === "user") {
            durum.burunKoprusuX = burunKoprusuYakalama.x * w; // Aynalanmis
          } else {
            durum.burunKoprusuX = burunKoprusuYakalama.x * w;
          }
        } else {
          durum.burunKoprusuX = (durum.irisNoktalar.sagX + durum.irisNoktalar.solX) / 2;
        }

        // Kamera mesafesini tahmin et ve sakla (konverjans duzeltmesi icin)
        var ortIrisCapYakalama = (durum.irisCaplari.sagCap + durum.irisCaplari.solCap) / 2;
        durum.tahminMesafeMm = mesafeTahminEt(ortIrisCapYakalama, w);

        // Canvas hazirla
        durum.manuelNoktalar = [];
        durum.mevcutAdim = ADIM.YAKALANDI;
        durum.zoom = 1;
        durum.panX = 0;
        durum.panY = 0;

        canvasHazirla();
        goruntuguncelle();

        bildirimGoster("Gozler otomatik algilandi! Simdi olcek kartini isaretleyin.", "basarili");

        // Adimi ilerlet: Olcek 1'e gec
        durum.mevcutAdim = ADIM.OLCEK_1;
        goruntuguncelle();
      } else {
        bildirimGoster("Yakalanan karede yuz tespit edilemedi. Lutfen tekrar deneyin.", "hata");
        // Kamerayi tekrar ac
        kameraBaslat();
      }
    };
    img.src = dataUrl;
  }

  // Iris capi hesapla (merkez ve cevre noktalari arasindaki ortalama mesafe * 2)
  function irisCapiHesapla(merkez, cevreler) {
    var toplamMesafe = 0;
    for (var i = 0; i < cevreler.length; i++) {
      toplamMesafe += mesafe(merkez, cevreler[i]);
    }
    return (toplamMesafe / cevreler.length) * 2;
  }

  // ===== MESAFE TAHMINI VE KONVERJANS DUZELTMESI =====

  // Iris capi (piksel) ve video genisligi kullanarak kamera mesafesini tahmin et (mm)
  // Pinhole kamera modeli: mesafe = (f_px * iris_mm) / iris_px
  function mesafeTahminEt(irisCapPx, videoGenislik) {
    var hfovRad = VARSAYILAN_HFOV_DERECE * Math.PI / 180;
    var fPx = (videoGenislik / 2) / Math.tan(hfovRad / 2);
    return (fPx * IRIS_CAPI_MM) / irisCapPx;
  }

  // Yakin PD'yi uzak PD'ye donustur (konverjans duzeltmesi)
  // Formul: Uzak_PD = Yakin_PD * (mesafe + 27) / mesafe
  function uzakPdHesapla(yakinPdMm, mesafeMm) {
    if (mesafeMm <= 0) return yakinPdMm;
    return yakinPdMm * (mesafeMm + STOP_MESAFE_MM) / mesafeMm;
  }

  // Mesafe durumunu degerlendir (UI icin)
  function mesafeDurumu(mesafeCm) {
    if (mesafeCm < OPTIMAL_MESAFE_MIN_CM - 5) return "cok_yakin"; // kirmizi
    if (mesafeCm < OPTIMAL_MESAFE_MIN_CM) return "yakin"; // sari
    if (mesafeCm > OPTIMAL_MESAFE_MAX_CM + 10) return "cok_uzak"; // kirmizi
    if (mesafeCm > OPTIMAL_MESAFE_MAX_CM) return "uzak"; // sari
    return "ideal"; // yesil
  }

  // ===== CANVAS HAZIRLAMA VE CIZIM =====

  function canvasHazirla() {
    var sarmalayiciGenislik = canvasSarmalayici.parentElement.clientWidth;
    var oran = durum.yakalananGorsel.width / durum.yakalananGorsel.height;
    var canvasYukseklik = Math.min(600, sarmalayiciGenislik / oran);
    var canvasGenislik = canvasYukseklik * oran;

    if (canvasGenislik > sarmalayiciGenislik) {
      canvasGenislik = sarmalayiciGenislik;
      canvasYukseklik = canvasGenislik / oran;
    }

    olcumCanvas.width = canvasGenislik * 2; // Retina
    olcumCanvas.height = canvasYukseklik * 2;
    olcumCanvas.style.width = canvasGenislik + "px";
    olcumCanvas.style.height = canvasYukseklik + "px";

    durum.canvasGenislik = canvasGenislik;
    durum.canvasYukseklik = canvasYukseklik;

    ciz();
  }

  function ciz() {
    if (!durum.yakalananGorsel) return;

    var cg = durum.canvasGenislik * 2;
    var cy = durum.canvasYukseklik * 2;

    olcumCtx.clearRect(0, 0, cg, cy);

    // Gorseli ciz (zoom ve pan dahil)
    olcumCtx.save();
    olcumCtx.translate(cg / 2 + durum.panX * 2, cy / 2 + durum.panY * 2);
    olcumCtx.scale(durum.zoom, durum.zoom);

    var gorsG = durum.yakalananGorsel.width;
    var gorsY = durum.yakalananGorsel.height;

    olcumCtx.drawImage(durum.yakalananGorsel, -gorsG / 2, -gorsY / 2, gorsG, gorsY);
    olcumCtx.restore();

    // Otomatik algilanan iris noktalarini ciz
    if (durum.irisNoktalar) {
      // Sag goz (yesil)
      var sagP = gorseldenCanvasa(durum.irisNoktalar.sagX, durum.irisNoktalar.sagY);
      olcumCtx.beginPath();
      olcumCtx.arc(sagP.x * 2, sagP.y * 2, NOKTA_YARICAP * 2.5, 0, Math.PI * 2);
      olcumCtx.fillStyle = "rgba(34, 197, 94, 0.6)";
      olcumCtx.fill();
      olcumCtx.strokeStyle = "#22c55e";
      olcumCtx.lineWidth = 3;
      olcumCtx.stroke();

      // Sag goz etiketi
      olcumCtx.font = "bold 22px system-ui, -apple-system, sans-serif";
      olcumCtx.fillStyle = "#22c55e";
      olcumCtx.strokeStyle = "#fff";
      olcumCtx.lineWidth = 4;
      olcumCtx.strokeText("R", sagP.x * 2 + 18, sagP.y * 2 + 6);
      olcumCtx.fillText("R", sagP.x * 2 + 18, sagP.y * 2 + 6);

      // Sol goz (mavi)
      var solP = gorseldenCanvasa(durum.irisNoktalar.solX, durum.irisNoktalar.solY);
      olcumCtx.beginPath();
      olcumCtx.arc(solP.x * 2, solP.y * 2, NOKTA_YARICAP * 2.5, 0, Math.PI * 2);
      olcumCtx.fillStyle = "rgba(59, 130, 246, 0.6)";
      olcumCtx.fill();
      olcumCtx.strokeStyle = "#3b82f6";
      olcumCtx.lineWidth = 3;
      olcumCtx.stroke();

      // Sol goz etiketi
      olcumCtx.fillStyle = "#3b82f6";
      olcumCtx.strokeStyle = "#fff";
      olcumCtx.lineWidth = 4;
      olcumCtx.strokeText("L", solP.x * 2 + 18, solP.y * 2 + 6);
      olcumCtx.fillText("L", solP.x * 2 + 18, solP.y * 2 + 6);
    }

    // Manuel noktalari ciz
    for (var i = 0; i < durum.manuelNoktalar.length; i++) {
      var p = gorseldenCanvasa(durum.manuelNoktalar[i].x, durum.manuelNoktalar[i].y);
      var renk = NOKTALAR[i].renk;

      // Cember
      olcumCtx.beginPath();
      olcumCtx.arc(p.x * 2, p.y * 2, NOKTA_YARICAP * 2, 0, Math.PI * 2);
      olcumCtx.fillStyle = renk;
      olcumCtx.fill();
      olcumCtx.strokeStyle = "#fff";
      olcumCtx.lineWidth = 3;
      olcumCtx.stroke();

      // Etiket
      olcumCtx.font = "bold 22px system-ui, -apple-system, sans-serif";
      olcumCtx.fillStyle = renk;
      olcumCtx.strokeStyle = "#fff";
      olcumCtx.lineWidth = 4;
      var etiket = (i + 1).toString();
      olcumCtx.strokeText(etiket, p.x * 2 + 16, p.y * 2 + 6);
      olcumCtx.fillText(etiket, p.x * 2 + 16, p.y * 2 + 6);
    }

    // Olcek cizgisi (ilk 2 manuel nokta arasi)
    if (durum.manuelNoktalar.length >= 2) {
      var p1 = gorseldenCanvasa(durum.manuelNoktalar[0].x, durum.manuelNoktalar[0].y);
      var p2 = gorseldenCanvasa(durum.manuelNoktalar[1].x, durum.manuelNoktalar[1].y);

      olcumCtx.beginPath();
      olcumCtx.moveTo(p1.x * 2, p1.y * 2);
      olcumCtx.lineTo(p2.x * 2, p2.y * 2);
      olcumCtx.strokeStyle = "#ef4444";
      olcumCtx.lineWidth = 3;
      olcumCtx.setLineDash([8, 4]);
      olcumCtx.stroke();
      olcumCtx.setLineDash([]);

      // Olcek etiketi
      var ortaX = (p1.x + p2.x);
      var ortaY = (p1.y + p2.y) - 20;
      olcumCtx.font = "bold 24px system-ui, -apple-system, sans-serif";
      olcumCtx.fillStyle = "#ef4444";
      olcumCtx.strokeStyle = "#fff";
      olcumCtx.lineWidth = 4;
      olcumCtx.strokeText(OLCEK_MM + " mm", ortaX, ortaY);
      olcumCtx.fillText(OLCEK_MM + " mm", ortaX, ortaY);
    }

    // Fitting height cizgileri
    if (durum.irisNoktalar && durum.manuelNoktalar.length >= 3) {
      // Sag goz: iris -> cerceve alt (nokta index 2)
      var sagOdak = gorseldenCanvasa(durum.irisNoktalar.sagX, durum.irisNoktalar.sagY);
      var sagAlt = gorseldenCanvasa(durum.manuelNoktalar[2].x, durum.manuelNoktalar[2].y);

      olcumCtx.beginPath();
      olcumCtx.moveTo(sagOdak.x * 2, sagOdak.y * 2);
      olcumCtx.lineTo(sagAlt.x * 2, sagAlt.y * 2);
      olcumCtx.strokeStyle = "#22c55e";
      olcumCtx.lineWidth = 2;
      olcumCtx.setLineDash([6, 3]);
      olcumCtx.stroke();
      olcumCtx.setLineDash([]);
    }

    if (durum.irisNoktalar && durum.manuelNoktalar.length >= 4) {
      // Sol goz: iris -> cerceve alt (nokta index 3)
      var solOdak = gorseldenCanvasa(durum.irisNoktalar.solX, durum.irisNoktalar.solY);
      var solAlt = gorseldenCanvasa(durum.manuelNoktalar[3].x, durum.manuelNoktalar[3].y);

      olcumCtx.beginPath();
      olcumCtx.moveTo(solOdak.x * 2, solOdak.y * 2);
      olcumCtx.lineTo(solAlt.x * 2, solAlt.y * 2);
      olcumCtx.strokeStyle = "#3b82f6";
      olcumCtx.lineWidth = 2;
      olcumCtx.setLineDash([6, 3]);
      olcumCtx.stroke();
      olcumCtx.setLineDash([]);
    }
  }

  // ===== KOORDINAT DONUSUMLERI =====

  function canvasGorsel(canvasX, canvasY) {
    var cg = durum.canvasGenislik;
    var cy = durum.canvasYukseklik;
    var gorsG = durum.yakalananGorsel.width;
    var gorsY = durum.yakalananGorsel.height;

    // gorseldenCanvasa'nin tersi: CSS -> gorsel piksel
    // CSS offset'i 2 ile carpip zoom'a boluyoruz (retina 2x telafisi)
    var x = (canvasX - cg / 2 - durum.panX) * 2 / durum.zoom + gorsG / 2;
    var y = (canvasY - cy / 2 - durum.panY) * 2 / durum.zoom + gorsY / 2;

    return { x: x, y: y };
  }

  function gorseldenCanvasa(gx, gy) {
    var cg = durum.canvasGenislik;
    var cy = durum.canvasYukseklik;
    var gorsG = durum.yakalananGorsel.width;
    var gorsY = durum.yakalananGorsel.height;

    // Goruntu native boyutunda 2x retina canvas uzerine ciziliyor
    // 1 goruntu pikseli = 1 canvas pikseli = 0.5 CSS pikseli
    // Bu yuzden offset'i zoom/2 ile carpiyoruz (CSS koordinat alani icin)
    var x = (gx - gorsG / 2) * durum.zoom / 2 + cg / 2 + durum.panX;
    var y = (gy - gorsY / 2) * durum.zoom / 2 + cy / 2 + durum.panY;

    return { x: x, y: y };
  }

  // ===== CANVAS TIKLAMA (MANUEL NOKTALAR) =====

  function canvasTikla(e) {
    if (!durum.yakalananGorsel || durum.mevcutAdim < ADIM.OLCEK_1 || durum.mevcutAdim > ADIM.CERCEVE_SOL) return;

    var rect = olcumCanvas.getBoundingClientRect();
    var canvasX = e.clientX - rect.left;
    var canvasY = e.clientY - rect.top;

    var gorselKoord = canvasGorsel(canvasX, canvasY);

    // Gorsel disinda mi?
    if (gorselKoord.x < 0 || gorselKoord.y < 0 ||
        gorselKoord.x > durum.yakalananGorsel.width || gorselKoord.y > durum.yakalananGorsel.height) {
      bildirimGoster("Lutfen fotografin uzerine tiklayin.", "uyari");
      return;
    }

    durum.manuelNoktalar.push({ x: gorselKoord.x, y: gorselKoord.y });
    durum.mevcutAdim++;

    ciz();
    goruntuguncelle();

    // Tum noktalar tamamlandi mi? (4 manuel nokta)
    if (durum.manuelNoktalar.length === 4) {
      hesaplaOlcumler();
    }
  }

  // ===== OLCUM HESAPLAMA =====

  function hesaplaOlcumler() {
    // Olcek faktoru: piksel basina mm
    var olcekP1 = durum.manuelNoktalar[0];
    var olcekP2 = durum.manuelNoktalar[1];
    var olcekPiksel = mesafe(olcekP1, olcekP2);

    if (olcekPiksel < 50) {
      bildirimGoster("Olcek noktalari cok yakin. Daha net isaretleyin veya zoom yapin.", "hata");
      geriAl();
      geriAl();
      return;
    }

    // Olcek cizgisinin egimini kontrol et (max 15 derece)
    var olcekAci = Math.abs(Math.atan2(olcekP2.y - olcekP1.y, olcekP2.x - olcekP1.x) * 180 / Math.PI);
    if (olcekAci > 15 && olcekAci < 165) {
      bildirimGoster("Olcek karti cok egik gorunuyor. Lutfen karti duz tutun.", "uyari");
    }

    var mmPerPiksel = OLCEK_MM / olcekPiksel;

    // PD hesaplama: canli moddan alinan degerler (IMAGE mode farkini onler)
    var pdSagMm, pdSolMm;

    if (durum.canliPdVerisi) {
      // Canli modda hesaplanan PD degerleri (VIDEO mode, kanitlanmis dogru)
      pdSagMm = durum.canliPdVerisi.pdSag;
      pdSolMm = durum.canliPdVerisi.pdSol;
    } else if (durum.irisNoktalar && durum.irisCaplari) {
      // Fallback: IMAGE mode ile hesapla (canli veri yoksa)
      // Burun koprusu landmark'i ile monokuler PD (iris ortasi degil!)
      var burunRefX = durum.burunKoprusuX || (durum.irisNoktalar.sagX + durum.irisNoktalar.solX) / 2;
      var pdSagPx = Math.abs(durum.irisNoktalar.sagX - burunRefX);
      var pdSolPx = Math.abs(durum.irisNoktalar.solX - burunRefX);
      var ortIrisCap = (durum.irisCaplari.sagCap + durum.irisCaplari.solCap) / 2;
      var irisMmPerPx = IRIS_CAPI_MM / ortIrisCap;
      pdSagMm = pdSagPx * irisMmPerPx;
      pdSolMm = pdSolPx * irisMmPerPx;
    }

    // Fitting height (iris -> cerceve alt kenar)
    var sagAlt = durum.manuelNoktalar[2];
    var solAlt = durum.manuelNoktalar[3];

    var fhSagPx = Math.abs(sagAlt.y - durum.irisNoktalar.sagY);
    var fhSolPx = Math.abs(solAlt.y - durum.irisNoktalar.solY);

    var fhSagMm = fhSagPx * mmPerPiksel;
    var fhSolMm = fhSolPx * mmPerPiksel;

    // Uyarilar
    var uyarilar = [];
    if (pdSagMm < 25 || pdSagMm > 40) uyarilar.push("Sag goz mesafesi beklenen aralik disinda (" + pdSagMm.toFixed(1) + " mm).");
    if (pdSolMm < 25 || pdSolMm > 40) uyarilar.push("Sol goz mesafesi beklenen aralik disinda (" + pdSolMm.toFixed(1) + " mm).");
    if (fhSagMm < 10 || fhSagMm > 35) uyarilar.push("Sag odak yuksekligi beklenen aralik disinda (" + fhSagMm.toFixed(1) + " mm).");
    if (fhSolMm < 10 || fhSolMm > 35) uyarilar.push("Sol odak yuksekligi beklenen aralik disinda (" + fhSolMm.toFixed(1) + " mm).");

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
    durum.mevcutAdim = ADIM.TAMAMLANDI;
    goruntuguncelle();

    durum.sonuclar = {
      pdSag: pdSagMm,
      pdSol: pdSolMm,
      fhSag: fhSagMm,
      fhSol: fhSolMm
    };

    bildirimGoster("Olcumler hesaplandi! Degerleri kontrol edin.", "basarili");
  }

  function mesafe(p1, p2) {
    var dx = p2.x - p1.x;
    var dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // ===== DEGERLERI KULLAN =====

  function degerleriKullan() {
    if (!durum.sonuclar) return;

    var s = durum.sonuclar;
    var params = new URLSearchParams();
    params.set("pdSag", s.pdSag);
    params.set("pdSol", s.pdSol);
    params.set("fhSag", s.fhSag);
    params.set("fhSol", s.fhSol);
    params.set("kaynak", "kamera");

    window.location.href = "index.html?" + params.toString();
  }

  // ===== ZOOM =====

  function zoomYap(yeniZoom) {
    durum.zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, yeniZoom));
    ciz();
  }

  // ===== GERI AL =====

  function geriAl() {
    if (durum.manuelNoktalar.length === 0) return;

    durum.manuelNoktalar.pop();
    durum.mevcutAdim = ADIM.OLCEK_1 + durum.manuelNoktalar.length;

    sonucPaneli.classList.remove("goster");
    durum.sonuclar = null;
    ciz();
    goruntuguncelle();
  }

  // ===== SIFIRLA =====

  function sifirlaNoktalar() {
    durum.manuelNoktalar = [];
    durum.mevcutAdim = ADIM.OLCEK_1;
    durum.sonuclar = null;

    sonucPaneli.classList.remove("goster");
    ciz();
    goruntuguncelle();
  }

  // ===== YENIDEN CEK =====

  function yenidenCek() {
    durum.yakalananGorsel = null;
    durum.irisNoktalar = null;
    durum.irisCaplari = null;
    durum.manuelNoktalar = [];
    durum.mevcutAdim = ADIM.KURULUM;
    durum.zoom = 1;
    durum.panX = 0;
    durum.panY = 0;
    durum.sonuclar = null;

    sonucPaneli.classList.remove("goster");
    goruntuguncelle();

    // Kamerayi tekrar ac
    kameraBaslat();
  }

  // ===== GORUNTU GUNCELLE =====

  function goruntuguncelle() {
    var adim = durum.mevcutAdim;

    // Kamera kurulum
    if (adim === ADIM.KURULUM) {
      kameraKurulum.classList.remove("gizle");
    } else {
      kameraKurulum.classList.add("gizle");
    }

    // Video
    if (adim === ADIM.KAMERA) {
      videoSarmalayici.classList.add("goster");
    } else {
      videoSarmalayici.classList.remove("goster");
    }

    // Canvas
    if (adim >= ADIM.YAKALANDI && adim <= ADIM.TAMAMLANDI) {
      canvasSarmalayici.classList.add("goster");
    } else {
      canvasSarmalayici.classList.remove("goster");
    }

    // Arac cubugu
    if (adim >= ADIM.OLCEK_1 && adim <= ADIM.TAMAMLANDI) {
      aracCubugu.classList.add("goster");
    } else {
      aracCubugu.classList.remove("goster");
    }

    // Talimat kutusu
    if (adim >= ADIM.OLCEK_1 && adim <= ADIM.CERCEVE_SOL) {
      talimatKutusu.classList.add("goster");
      var noktaIdx = adim - ADIM.OLCEK_1;
      talimatBaslik.textContent = "Adim " + (noktaIdx + 1) + ": " + NOKTALAR[noktaIdx].ad;
      talimatMetin.innerHTML = NOKTALAR[noktaIdx].talimat;
    } else if (adim === ADIM.TAMAMLANDI) {
      talimatKutusu.classList.add("goster");
      talimatBaslik.textContent = "Tamamlandi!";
      talimatMetin.innerHTML = "Tum olcumler tamamlandi. Sonuclar asagida gosteriliyor.";
    } else if (adim === ADIM.KAMERA) {
      talimatKutusu.classList.add("goster");
      talimatBaslik.textContent = "Kamera Acik";
      talimatMetin.innerHTML = "Yuzunuzu kameraya dogru tutun. Yesil ve mavi noktalar gozlerinizde gorunecek. Olcek kartini yuzunuzun yakininda tutun. Hazir olunca <strong>fotograf cekin</strong>.";
    } else {
      talimatKutusu.classList.remove("goster");
    }

    // Geri al butonu
    btnGeriAl.disabled = durum.manuelNoktalar.length === 0;

    // Adim gostergesi
    var adimlar = adimGostergesi.querySelectorAll(".adim");
    for (var i = 0; i < adimlar.length; i++) {
      adimlar[i].classList.remove("aktif", "tamamlandi");

      // Mapping: 0=Kamera, 1=Goz Algilama, 2=Kalibrasyon, 3=Cerceve, 4=Sonuc
      if (i === 0) {
        // Kamera
        if (adim === ADIM.KURULUM || adim === ADIM.KAMERA) {
          adimlar[i].classList.add("aktif");
        } else if (adim > ADIM.KAMERA) {
          adimlar[i].classList.add("tamamlandi");
        }
      } else if (i === 1) {
        // Goz Algilama
        if (adim === ADIM.YAKALANDI) {
          adimlar[i].classList.add("aktif");
        } else if (adim > ADIM.YAKALANDI) {
          adimlar[i].classList.add("tamamlandi");
        }
      } else if (i === 2) {
        // Kalibrasyon (olcek 1 + 2)
        if (adim === ADIM.OLCEK_1 || adim === ADIM.OLCEK_2) {
          adimlar[i].classList.add("aktif");
        } else if (adim > ADIM.OLCEK_2) {
          adimlar[i].classList.add("tamamlandi");
        }
      } else if (i === 3) {
        // Cerceve (sag + sol)
        if (adim === ADIM.CERCEVE_SAG || adim === ADIM.CERCEVE_SOL) {
          adimlar[i].classList.add("aktif");
        } else if (adim > ADIM.CERCEVE_SOL) {
          adimlar[i].classList.add("tamamlandi");
        }
      } else if (i === 4) {
        // Sonuc
        if (adim === ADIM.TAMAMLANDI) {
          adimlar[i].classList.add("aktif");
        }
      }
    }

    // Nokta bilgi listesi guncelle
    // ilk 2: otomatik (iris) - her zaman tamamlandi goster yakalandi adimindan sonra
    var noktaBilgi0 = document.getElementById("noktaBilgi0");
    var noktaBilgi1 = document.getElementById("noktaBilgi1");
    if (noktaBilgi0) {
      if (adim >= ADIM.OLCEK_1) {
        noktaBilgi0.classList.add("tamamlandi");
      } else {
        noktaBilgi0.classList.remove("tamamlandi");
      }
    }
    if (noktaBilgi1) {
      if (adim >= ADIM.OLCEK_1) {
        noktaBilgi1.classList.add("tamamlandi");
      } else {
        noktaBilgi1.classList.remove("tamamlandi");
      }
    }

    // Manuel noktalar
    for (var j = 0; j < NOKTALAR.length; j++) {
      var noktaBilgiEl = document.getElementById("noktaBilgi" + (j + 2));
      if (noktaBilgiEl) {
        if (j < durum.manuelNoktalar.length) {
          noktaBilgiEl.classList.add("tamamlandi");
        } else {
          noktaBilgiEl.classList.remove("tamamlandi");
        }
      }
    }
  }

})();
