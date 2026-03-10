// ============================================================
// SGK RECETE & FIYAT GOSTERIM SISTEMI - recete.js
// Kepekci Optik - Modul 2
// ============================================================

// Fiyat sabitleri
var FIYATLAR = {
  cerceve: 750,
  standartCam: 300,
  sgkKatki: 150,
  magazaIndirimi: 100,
  musteriOder: 800  // 750 + 300 - 150 - 100
};

// Mevcut yuklenmis recete verisi
var mevcutRecete = null;

// Ek cam ucreti (global - fiyat karti yeniden olusturulurken kullanilir)
var ekCamUcreti = 0;

// QR tarayici referansi
var qrTarayici = null;

// ============================================================
// SEKME GECIS
// ============================================================
function sekmeGecis(sekme) {
  // Tum sekme butonlarini ve icerikleri deaktif et
  document.getElementById("tab-qr").classList.remove("active");
  document.getElementById("tab-manuel").classList.remove("active");
  document.getElementById("icerik-qr").classList.remove("active");
  document.getElementById("icerik-manuel").classList.remove("active");

  // Secilen sekmeyi aktif et
  document.getElementById("tab-" + sekme).classList.add("active");
  document.getElementById("icerik-" + sekme).classList.add("active");

  // QR sekmesinden cikinca taramayi durdur
  if (sekme !== "qr" && qrTarayici) {
    qrTaramayiDurdur();
  }
}

// ============================================================
// YAKIN BOLUMU TOGGLE
// ============================================================
function yakinBolumuToggle() {
  var checkbox = document.getElementById("m_yakin_var");
  var alan = document.getElementById("yakin-form-alani");
  alan.style.display = checkbox.checked ? "block" : "none";
}

// ============================================================
// BILDIRIM GOSTER
// ============================================================
function bildirimGoster(mesaj, tip) {
  var el = document.getElementById("bildirim");
  el.textContent = mesaj;
  el.className = "bildirim " + (tip || "basarili");
  // Goster
  setTimeout(function() { el.classList.add("gorunur"); }, 10);
  // 3 saniye sonra gizle
  setTimeout(function() { el.classList.remove("gorunur"); }, 3500);
}

// ============================================================
// MANUEL FORM OKUMA
// ============================================================
function manuelFormDegerOku(id) {
  var el = document.getElementById(id);
  if (!el) return 0;
  var val = el.value.replace(",", ".");
  return parseFloat(val) || 0;
}

function manuelReceteYukle() {
  // Hasta bilgileri
  var hastaAd = (document.getElementById("m_hasta_ad").value || "").trim();
  var hastaTc = (document.getElementById("m_hasta_tc").value || "").trim();

  // Uzak goz numaralari
  var uzakSagSphIsaret = document.getElementById("m_uzak_sag_sph_isaret").value;
  var uzakSagSph = manuelFormDegerOku("m_uzak_sag_sph");
  var uzakSagCylIsaret = document.getElementById("m_uzak_sag_cyl_isaret").value;
  var uzakSagCyl = manuelFormDegerOku("m_uzak_sag_cyl");
  var uzakSagAks = manuelFormDegerOku("m_uzak_sag_aks");

  var uzakSolSphIsaret = document.getElementById("m_uzak_sol_sph_isaret").value;
  var uzakSolSph = manuelFormDegerOku("m_uzak_sol_sph");
  var uzakSolCylIsaret = document.getElementById("m_uzak_sol_cyl_isaret").value;
  var uzakSolCyl = manuelFormDegerOku("m_uzak_sol_cyl");
  var uzakSolAks = manuelFormDegerOku("m_uzak_sol_aks");

  // Yakin goz numaralari (varsa)
  var yakinVar = document.getElementById("m_yakin_var").checked;
  var yakinVeri = null;
  if (yakinVar) {
    yakinVeri = {
      sag: {
        sph: manuelFormDegerOku("m_yakin_sag_sph"),
        sphIsaret: document.getElementById("m_yakin_sag_sph_isaret").value,
        cyl: manuelFormDegerOku("m_yakin_sag_cyl"),
        cylIsaret: document.getElementById("m_yakin_sag_cyl_isaret").value,
        aks: manuelFormDegerOku("m_yakin_sag_aks")
      },
      sol: {
        sph: manuelFormDegerOku("m_yakin_sol_sph"),
        sphIsaret: document.getElementById("m_yakin_sol_sph_isaret").value,
        cyl: manuelFormDegerOku("m_yakin_sol_cyl"),
        cylIsaret: document.getElementById("m_yakin_sol_cyl_isaret").value,
        aks: manuelFormDegerOku("m_yakin_sol_aks")
      }
    };
  }

  // Recete verisini olustur
  var recete = {
    v: 1,
    hasta: {
      ad: hastaAd || "Belirtilmedi",
      tc: hastaTc || "",
      soyad: ""
    },
    recete: {
      tarih: tarihFormatla(new Date()),
      protokolNo: "",
      teshis: "",
      doktor: ""
    },
    uzak: {
      sag: {
        sph: uzakSagSph,
        sphIsaret: uzakSagSphIsaret,
        cyl: uzakSagCyl,
        cylIsaret: uzakSagCylIsaret,
        aks: uzakSagAks
      },
      sol: {
        sph: uzakSolSph,
        sphIsaret: uzakSolSphIsaret,
        cyl: uzakSolCyl,
        cylIsaret: uzakSolCylIsaret,
        aks: uzakSolAks
      }
    },
    yakin: yakinVeri
  };

  receteYukle(recete);
}

// ============================================================
// QR v2 KOMPAKT FORMATI v1'E CEVIRME
// ============================================================
// Bookmarklet v2 formati: {"v":2,"dr":"...","t":"...","p":"...","tc":"...",
//   "u":{"s":[sph,cyl,aks],"l":[sph,cyl,aks]},
//   "y":{"s":[sph,cyl,aks],"l":[sph,cyl,aks]}}
// sph/cyl isareti sayinin icinde (orn: -0.25 = negatif)
function v2yiV1eCevir(veri) {
  function gozCevir(arr) {
    if (!arr || !Array.isArray(arr)) return null;
    var sph = arr[0] || 0;
    var cyl = arr[1] || 0;
    var aks = arr[2] || 0;
    return {
      sph: Math.abs(sph),
      sphIsaret: sph < 0 ? "-" : "+",
      cyl: Math.abs(cyl),
      cylIsaret: cyl < 0 ? "-" : "+",
      aks: aks
    };
  }

  var sonuc = {
    v: 1,
    hasta: {
      ad: veri.a || "",
      tc: veri.tc || "",
      soyad: ""
    },
    recete: {
      tarih: veri.t || "",
      protokolNo: veri.p || "",
      teshis: "",
      doktor: veri.dr || ""
    },
    uzak: null,
    yakin: null
  };

  // Uzak
  if (veri.u) {
    sonuc.uzak = {};
    if (veri.u.s) sonuc.uzak.sag = gozCevir(veri.u.s);
    if (veri.u.l) sonuc.uzak.sol = gozCevir(veri.u.l);
  }

  // Yakin
  if (veri.y) {
    sonuc.yakin = {};
    if (veri.y.s) sonuc.yakin.sag = gozCevir(veri.y.s);
    if (veri.y.l) sonuc.yakin.sol = gozCevir(veri.y.l);
  }

  return sonuc;
}

// ============================================================
// RECETE YUKLEME (ortak — QR ve Manuel icin)
// ============================================================
function receteYukle(veri) {
  mevcutRecete = veri;

  // Veri giris bolumunu gizle, musteri gosterim bolumunu goster
  document.getElementById("veri-giris-bolumu").style.display = "none";
  var gosterim = document.getElementById("musteri-gosterim");
  gosterim.classList.add("gorunur");

  // Hasta bilgilerini doldur
  var hastaAd = "";
  if (veri.hasta) {
    hastaAd = (veri.hasta.ad || "") + " " + (veri.hasta.soyad || "");
    hastaAd = hastaAd.trim() || "Belirtilmedi";
  }
  document.getElementById("g_hasta_ad").textContent = hastaAd;

  // Avatar harfi
  var avatarEl = document.getElementById("g_hasta_avatar");
  if (avatarEl) {
    avatarEl.textContent = hastaAd.charAt(0).toUpperCase() || "?";
  }

  // Detay grid (yeni kart bazli yapi)
  var detayGrid = document.getElementById("g_hasta_detay_grid");
  var detayHtml = "";
  if (veri.hasta && veri.hasta.tc) {
    detayHtml += '<div class="detay-item"><div class="detay-etiket">TC Kimlik</div><div class="detay-deger">' + veri.hasta.tc + '</div></div>';
  }
  if (veri.recete && veri.recete.tarih) {
    detayHtml += '<div class="detay-item"><div class="detay-etiket">Recete Tarihi</div><div class="detay-deger">' + veri.recete.tarih + '</div></div>';
  }
  if (veri.recete && veri.recete.doktor) {
    detayHtml += '<div class="detay-item"><div class="detay-etiket">Doktor</div><div class="detay-deger">Dr. ' + veri.recete.doktor + '</div></div>';
  }
  if (veri.recete && veri.recete.protokolNo) {
    detayHtml += '<div class="detay-item"><div class="detay-etiket">Protokol No</div><div class="detay-deger">' + veri.recete.protokolNo + '</div></div>';
  }
  detayGrid.innerHTML = detayHtml;

  // Recete tablosunu doldur
  receteTablosunuDoldur(veri);

  // SGK uyarilarini goster
  sgkUyarilariGoster(veri);

  // Fiyat kartini doldur
  fiyatKartiniDoldur(veri);

  // Progresif butonunu ayarla
  progresifButonuAyarla(veri);

  bildirimGoster("Recete basariyla yuklendi!", "basarili");
}

// ============================================================
// GOZ NUMARA KARTLARI (yeni kart bazli tasarim)
// ============================================================
function numaraFormatla(deger, isaret) {
  if (!deger && deger !== 0) return "-";
  var val = parseFloat(deger);
  if (val === 0) return "0.00";
  var prefix = isaret || (val >= 0 ? "+" : "-");
  return prefix + Math.abs(val).toFixed(2);
}

function numaraSinifi(deger, isaret) {
  var val = parseFloat(deger) || 0;
  if (val === 0) return "notr";
  return isaret === "-" ? "negatif" : "pozitif";
}

function gozSatiriOlustur(etiket, gozVeri) {
  if (!gozVeri) return "";
  var sphSinif = numaraSinifi(gozVeri.sph, gozVeri.sphIsaret);
  var cylSinif = numaraSinifi(gozVeri.cyl, gozVeri.cylIsaret);
  var html = '<div class="goz-satir">';
  html += '<span class="goz-satir-etiket">' + etiket + '</span>';
  html += '<div class="goz-deger-grup">';
  html += '<div class="goz-deger"><div class="goz-deger-baslik">SPH</div><div class="goz-deger-sayi ' + sphSinif + '">' + numaraFormatla(gozVeri.sph, gozVeri.sphIsaret) + '</div></div>';
  html += '<div class="goz-deger"><div class="goz-deger-baslik">CYL</div><div class="goz-deger-sayi ' + cylSinif + '">' + numaraFormatla(gozVeri.cyl, gozVeri.cylIsaret) + '</div></div>';
  html += '<div class="goz-deger"><div class="goz-deger-baslik">AKS</div><div class="goz-deger-sayi notr">' + (gozVeri.aks || 0) + '&deg;</div></div>';
  html += '</div></div>';
  return html;
}

function receteTablosunuDoldur(veri) {
  var container = document.getElementById("g_goz_kartlar");
  var html = "";

  // Uzak kart
  if (veri.uzak) {
    html += '<div class="goz-kart uzak">';
    html += '<div class="goz-kart-header"><span class="goz-ikon">&#128065;</span> Uzak Gozluk</div>';
    html += '<div class="goz-kart-body">';
    html += gozSatiriOlustur("SAG", veri.uzak.sag);
    html += gozSatiriOlustur("SOL", veri.uzak.sol);
    html += '</div></div>';
  }

  // Yakin kart
  if (veri.yakin) {
    html += '<div class="goz-kart yakin">';
    html += '<div class="goz-kart-header"><span class="goz-ikon">&#128214;</span> Yakin Gozluk</div>';
    html += '<div class="goz-kart-body">';
    html += gozSatiriOlustur("SAG", veri.yakin.sag);
    html += gozSatiriOlustur("SOL", veri.yakin.sol);
    html += '</div></div>';
  }

  container.innerHTML = html;
}

// ============================================================
// SGK UYARILARI (animasyonlu premium badge)
// ============================================================
function sgkUyariOlustur(baslik, tutar, aciklama, gecikme) {
  var html = '<div class="sgk-uyari" style="animation-delay:' + gecikme + 's;">';
  html += '<div class="uyari-badge"><span class="uyari-badge-ikon">&#9888;</span></div>';
  html += '<div class="uyari-icerik">';
  html += '<div class="uyari-metin">' + baslik + '</div>';
  html += '<div class="uyari-aciklama">' + aciklama + '</div>';
  html += '</div>';
  html += '<span class="uyari-tutar">' + tutar + ' TL</span>';
  html += '</div>';
  return html;
}

function sgkUyarilariGoster(veri) {
  var container = document.getElementById("g_sgk_uyarilar");
  var html = "";

  html += sgkUyariOlustur(
    "UZAK GOZLUK SGK Odemesi",
    FIYATLAR.sgkKatki,
    "SGK tarafindan karsilanacaktir",
    0
  );

  if (veri.yakin) {
    html += sgkUyariOlustur(
      "YAKIN GOZLUK SGK Odemesi",
      FIYATLAR.sgkKatki,
      "SGK tarafindan karsilanacaktir",
      0.15
    );
  }

  container.innerHTML = html;
}

// ============================================================
// FIYAT KARTI (premium kart tasarimi)
// ============================================================
function fiyatKartiniDoldur(veri) {
  var container = document.getElementById("g_fiyat_detay");
  var yakinVar = veri.yakin !== null && veri.yakin !== undefined;
  var adet = yakinVar ? 2 : 1;

  // Ek cam ucretini toplama dahil et (bir kez, grup basina degil)
  var toplamMusteriOder = FIYATLAR.musteriOder * adet + ekCamUcreti;

  var html = "";

  var tipler = ["Uzak Gozluk"];
  if (yakinVar) tipler.push("Yakin Gozluk");

  for (var i = 0; i < tipler.length; i++) {
    var grupIkon = i === 0 ? "uzak-ikon" : "yakin-ikon";
    var grupEmoji = i === 0 ? "&#128065;" : "&#128214;";
    html += '<div class="fiyat-grup-baslik"><span class="grup-ikon ' + grupIkon + '">' + grupEmoji + '</span>' + tipler[i] + '</div>';
    html += '<div class="fiyat-satir"><span class="etiket"><span class="satir-ikon cerceve-ikon">&#128083;</span>Cerceve</span><span class="tutar">' + FIYATLAR.cerceve + ' TL</span></div>';
    html += '<div class="fiyat-satir"><span class="etiket"><span class="satir-ikon cam-ikon">&#128308;</span>Standart Cam (2 adet)</span><span class="tutar">' + FIYATLAR.standartCam + ' TL</span></div>';
    html += '<div class="fiyat-satir"><span class="etiket"><span class="satir-ikon sgk-ikon">&#127975;</span>SGK Katkisi</span><span class="tutar indirim">-' + FIYATLAR.sgkKatki + ' TL</span></div>';
    html += '<div class="fiyat-satir"><span class="etiket"><span class="satir-ikon indirim-ikon">&#11088;</span>Magaza Indirimi</span><span class="tutar indirim">-' + FIYATLAR.magazaIndirimi + ' TL</span></div>';
    html += '<div class="fiyat-satir alt-toplam"><span class="etiket">' + tipler[i] + ' Tutari</span><span class="tutar">' + formatParaTL(FIYATLAR.musteriOder) + '</span></div>';
  }

  // Ek cam ucreti satiri (gruplardan sonra, input'tan once - tek satirda gosterilir)
  if (ekCamUcreti > 0) {
    html += '<div class="fiyat-satir ek-cam"><span class="etiket"><span class="satir-ikon ekcam-ikon">&#128142;</span>Ek Cam Ucreti</span><span class="tutar ek-cam-tutar">+' + formatParaTL(ekCamUcreti) + '</span></div>';
  }

  // Ek Cam Ucreti giris alani (fiyat karti body icinde, gruplardan sonra)
  html += '<div class="ek-cam-girisi">';
  html += '<span class="ek-cam-ikon">&#128142;</span>';
  html += '<label for="ek_cam_fiyat">Ek Cam Ucreti:</label>';
  html += '<input type="number" id="ek_cam_fiyat" placeholder="Tutar" step="50" min="0" inputmode="numeric" value="' + (ekCamUcreti > 0 ? ekCamUcreti : '') + '" />';
  html += '<span class="birim">TL</span>';
  html += '<button class="btn-ek-uygula" onclick="ekCamUygula()">Uygula</button>';
  html += '<button class="btn-ek-temizle" onclick="ekCamTemizle()" style="' + (ekCamUcreti > 0 ? '' : 'display:none;') + '">Temizle</button>';
  html += '</div>';

  container.innerHTML = html;

  // Footer etiket ve toplam tutarini guncelle
  var etiketEl = document.getElementById("g_toplam_etiket");
  var toplamEl = document.getElementById("g_toplam_tutar");
  if (ekCamUcreti > 0) {
    etiketEl.textContent = "TOPLAM VATANDAS ODEYECEGI";
    toplamEl.style.color = "#fbbf24";
  } else {
    etiketEl.textContent = "VATANDASIN ODEYECEGI EN DUSUK TUTAR";
    toplamEl.style.color = "#ffffff";
  }
  toplamEl.textContent = formatParaTL(toplamMusteriOder);
}

// ============================================================
// EK CAM UCRETI UYGULA
// ============================================================
function ekCamUygula() {
  var input = document.getElementById("ek_cam_fiyat");
  var val = parseFloat((input.value || "").replace(",", "."));
  if (!val || val <= 0) {
    bildirimGoster("Gecerli bir tutar girin", "uyari");
    return;
  }
  ekCamUcreti = val;
  fiyatKartiniDoldur(mevcutRecete);
  bildirimGoster("Ek cam ucreti eklendi: " + formatParaTL(val), "basarili");
}

// ============================================================
// EK CAM UCRETI TEMIZLE
// ============================================================
function ekCamTemizle() {
  ekCamUcreti = 0;
  fiyatKartiniDoldur(mevcutRecete);
  bildirimGoster("Ek cam ucreti kaldirildi", "basarili");
}

// ============================================================
// PARA FORMATLAMA
// ============================================================
function formatParaTL(sayi) {
  if (sayi === null || sayi === undefined) return "0 TL";
  var num = Math.round(sayi);
  return num.toLocaleString("tr-TR") + " TL";
}

// ============================================================
// TARIH FORMATLAMA
// ============================================================
function tarihFormatla(tarih) {
  var gun = ("0" + tarih.getDate()).slice(-2);
  var ay = ("0" + (tarih.getMonth() + 1)).slice(-2);
  var yil = tarih.getFullYear();
  return gun + "/" + ay + "/" + yil;
}

// ============================================================
// PROGRESIF BUTONU AYARLAMA
// ============================================================
function progresifButonuAyarla(veri) {
  var btn = document.getElementById("btn-progresif");
  if (!veri.yakin) {
    btn.disabled = true;
    btn.title = "Progresif cam icin yakin recete gerekli (ADD hesaplanamaz)";
    btn.style.opacity = "0.5";
  } else {
    btn.disabled = false;
    btn.title = "";
    btn.style.opacity = "1";
  }
}

// ============================================================
// PROGRESIF ONERISINE GIT (MODUL 1 ENTEGRASYONU)
// ============================================================
function progresifOnerisineGit() {
  if (!mevcutRecete || !mevcutRecete.yakin) {
    bildirimGoster("Progresif cam icin yakin recete gerekli!", "hata");
    return;
  }

  var v = mevcutRecete;
  var params = new URLSearchParams();

  // Isaret ile birlestirilmis SPH degerleri
  // Uzak SPH (isareti dahil)
  var odSph = isaretliDeger(v.uzak.sag.sph, v.uzak.sag.sphIsaret);
  var osSph = isaretliDeger(v.uzak.sol.sph, v.uzak.sol.sphIsaret);

  // Uzak CYL (isareti dahil)
  var odCyl = isaretliDeger(v.uzak.sag.cyl, v.uzak.sag.cylIsaret);
  var osCyl = isaretliDeger(v.uzak.sol.cyl, v.uzak.sol.cylIsaret);

  // Yakin SPH (ADD hesaplamak icin)
  var yakinSagSph = isaretliDeger(v.yakin.sag.sph, v.yakin.sag.sphIsaret);
  var yakinSolSph = isaretliDeger(v.yakin.sol.sph, v.yakin.sol.sphIsaret);

  // ADD = Yakin SPH - Uzak SPH
  var odAdd = +(yakinSagSph - odSph).toFixed(2);
  var osAdd = +(yakinSolSph - osSph).toFixed(2);

  // Minimum ADD kontrolu
  if (odAdd < 0.50) odAdd = 0.50;
  if (osAdd < 0.50) osAdd = 0.50;

  // URL parametrelerini ayarla
  params.set("od_sph", odSph.toFixed(2));
  params.set("od_cyl", odCyl.toFixed(2));
  params.set("od_ax", v.uzak.sag.aks || 0);
  params.set("od_add", odAdd.toFixed(2));

  params.set("os_sph", osSph.toFixed(2));
  params.set("os_cyl", osCyl.toFixed(2));
  params.set("os_ax", v.uzak.sol.aks || 0);
  params.set("os_add", osAdd.toFixed(2));

  params.set("kaynak", "recete");

  // index.html'e yonlendir
  window.location.href = "index.html?" + params.toString();
}

// Isaret ve mutlak degeri birlestirip sayi dondur
function isaretliDeger(mutlakDeger, isaret) {
  var val = parseFloat(mutlakDeger) || 0;
  if (isaret === "-") return -Math.abs(val);
  return Math.abs(val);
}

// ============================================================
// YENI RECETE
// ============================================================
function yeniRecete() {
  mevcutRecete = null;
  document.getElementById("veri-giris-bolumu").style.display = "block";
  document.getElementById("musteri-gosterim").classList.remove("gorunur");
  manuelFormuTemizle();
}

// ============================================================
// FORMU TEMIZLE
// ============================================================
function manuelFormuTemizle() {
  document.getElementById("m_hasta_ad").value = "";
  document.getElementById("m_hasta_tc").value = "";

  // Uzak numaralari sifirla
  var uzakAlanlar = ["m_uzak_sag_sph", "m_uzak_sag_cyl", "m_uzak_sag_aks",
                     "m_uzak_sol_sph", "m_uzak_sol_cyl", "m_uzak_sol_aks"];
  for (var i = 0; i < uzakAlanlar.length; i++) {
    var el = document.getElementById(uzakAlanlar[i]);
    if (el) el.value = el.id.indexOf("aks") >= 0 ? "0" : "0.00";
  }

  // Isaret secicilerini + yap
  var isaretler = document.querySelectorAll(".isaret-secici select");
  for (var i = 0; i < isaretler.length; i++) {
    isaretler[i].value = "+";
  }

  // Yakin formu gizle ve temizle
  document.getElementById("m_yakin_var").checked = false;
  yakinBolumuToggle();
  var yakinAlanlar = ["m_yakin_sag_sph", "m_yakin_sag_cyl", "m_yakin_sag_aks",
                      "m_yakin_sol_sph", "m_yakin_sol_cyl", "m_yakin_sol_aks"];
  for (var i = 0; i < yakinAlanlar.length; i++) {
    var el = document.getElementById(yakinAlanlar[i]);
    if (el) el.value = el.id.indexOf("aks") >= 0 ? "0" : "0.00";
  }
}

// ============================================================
// QR KOD TARAMA (html5-qrcode)
// ============================================================
function qrTaramayiBaslat() {
  // html5-qrcode yuklenmis mi kontrol et
  if (typeof Html5Qrcode === "undefined") {
    // Kutupahne henuz yuklenmemis, CDN'den yukle
    var script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/html5-qrcode@2.3.8/html5-qrcode.min.js";
    script.onload = function() {
      qrTarayiciBaslat();
    };
    script.onerror = function() {
      bildirimGoster("QR kutuphane yuklenemedi. Manuel giris kullanin.", "hata");
      sekmeGecis("manuel");
    };
    document.head.appendChild(script);
    document.getElementById("qr-durum").innerHTML = '<p>QR kutuphane yukleniyor...</p>';
    return;
  }
  qrTarayiciBaslat();
}

function qrTarayiciBaslat() {
  var durumEl = document.getElementById("qr-durum");
  durumEl.innerHTML = '<p>Kamera aciliyor...</p>';

  document.getElementById("btn-qr-baslat").style.display = "none";
  document.getElementById("btn-qr-durdur").style.display = "inline-flex";

  qrTarayici = new Html5Qrcode("qr-okuyucu");

  var config = {
    fps: 10,
    qrbox: { width: 300, height: 300 },
    aspectRatio: 1.0
  };

  qrTarayici.start(
    { facingMode: "environment" },
    config,
    function onScanSuccess(decodedText) {
      // Basarili tarama
      qrTaramayiDurdur();
      try {
        var veri = JSON.parse(decodedText);
        if (!veri || !veri.v) {
          bildirimGoster("Gecersiz QR kod verisi. Tekrar deneyin.", "hata");
          return;
        }
        // v2 kompakt format ise v1'e cevir
        if (veri.v === 2) {
          veri = v2yiV1eCevir(veri);
        }
        if (veri.uzak || veri.yakin) {
          receteYukle(veri);
        } else {
          bildirimGoster("QR kodda numara verisi bulunamadi.", "hata");
        }
      } catch (e) {
        bildirimGoster("QR kod okunamadi: " + e.message, "hata");
      }
    },
    function onScanFailure() {
      // Tarama devam ediyor, bos birak
    }
  ).catch(function(err) {
    durumEl.innerHTML = '<p style="color:var(--danger);">Kamera acilamadi: ' + err + '</p>' +
      '<p style="font-size:0.85rem; margin-top:8px;">Manuel giris sekmesini kullanabilirsiniz.</p>';
    document.getElementById("btn-qr-baslat").style.display = "inline-flex";
    document.getElementById("btn-qr-durdur").style.display = "none";
    qrTarayici = null;
  });
}

function qrTaramayiDurdur() {
  if (qrTarayici) {
    qrTarayici.stop().then(function() {
      qrTarayici.clear();
      qrTarayici = null;
    }).catch(function() {
      qrTarayici = null;
    });
  }
  document.getElementById("btn-qr-baslat").style.display = "inline-flex";
  document.getElementById("btn-qr-durdur").style.display = "none";
  document.getElementById("qr-durum").innerHTML =
    '<p>QR kod taramak icin asagidaki butona basin.</p>' +
    '<p style="font-size:0.85rem; color:var(--text-muted); margin-top:8px;">PC\'deki SGK sayfasinda bookmarklet ile olusturulan QR kodu tarayin.</p>';
}

// ============================================================
// URL PARAMETRE ALGILAMA (Bookmarklet v6 direkt aktarim)
// ============================================================
// Bookmarklet SGK verisini okuyup recete.html?d=ENCODED_JSON seklinde acar.
// Bu fonksiyon ?d= parametresini algilar, cozumler ve receteYukle() ile yukler.
function urlParametresiKontrol() {
  try {
    var params = new URLSearchParams(window.location.search);
    var d = params.get("d");
    if (!d) return;

    // URL'yi temizle (adres cubugundan veriyi kaldir)
    history.replaceState({}, "", window.location.pathname);

    // JSON coz
    var veri = JSON.parse(d);

    // v2 formatini v1'e cevir
    if (veri.v === 2) {
      veri = v2yiV1eCevir(veri);
    }

    // Receteyi yukle
    receteYukle(veri);
  } catch (e) {
    bildirimGoster("Veri aktarim hatasi: " + e.message, "hata");
  }
}

// ============================================================
// SAYFA YUKLEME
// ============================================================
document.addEventListener("DOMContentLoaded", function() {
  // URL'den gelen veri var mi kontrol et (bookmarklet v6)
  urlParametresiKontrol();
});
