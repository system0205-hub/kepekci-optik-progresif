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
      ad: "",
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

  var detayParcalari = [];
  if (veri.hasta && veri.hasta.tc) {
    detayParcalari.push("TC: " + veri.hasta.tc);
  }
  if (veri.recete && veri.recete.tarih) {
    detayParcalari.push("Tarih: " + veri.recete.tarih);
  }
  if (veri.recete && veri.recete.doktor) {
    detayParcalari.push("Dr. " + veri.recete.doktor);
  }
  document.getElementById("g_hasta_tc").textContent = detayParcalari[0] || "";
  document.getElementById("g_recete_tarih").textContent = detayParcalari[1] ? " | " + detayParcalari[1] : "";
  document.getElementById("g_doktor").textContent = detayParcalari[2] ? " | " + detayParcalari[2] : "";

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
// RECETE TABLOSU
// ============================================================
function numaraFormatla(deger, isaret) {
  if (!deger && deger !== 0) return "-";
  var val = parseFloat(deger);
  if (val === 0) return "0.00";
  var prefix = isaret || (val >= 0 ? "+" : "-");
  return prefix + Math.abs(val).toFixed(2);
}

function receteTablosunuDoldur(veri) {
  var tbody = document.getElementById("g_recete_tablo_body");
  var html = "";

  // Uzak - Sag
  if (veri.uzak && veri.uzak.sag) {
    var s = veri.uzak.sag;
    html += "<tr><td><strong>Uzak - Sag (OD)</strong></td>";
    html += "<td>" + numaraFormatla(s.sph, s.sphIsaret) + "</td>";
    html += "<td>" + numaraFormatla(s.cyl, s.cylIsaret) + "</td>";
    html += "<td>" + (s.aks || 0) + "</td></tr>";
  }
  // Uzak - Sol
  if (veri.uzak && veri.uzak.sol) {
    var s = veri.uzak.sol;
    html += "<tr><td><strong>Uzak - Sol (OS)</strong></td>";
    html += "<td>" + numaraFormatla(s.sph, s.sphIsaret) + "</td>";
    html += "<td>" + numaraFormatla(s.cyl, s.cylIsaret) + "</td>";
    html += "<td>" + (s.aks || 0) + "</td></tr>";
  }
  // Yakin - Sag
  if (veri.yakin && veri.yakin.sag) {
    var s = veri.yakin.sag;
    html += "<tr><td><strong>Yakin - Sag (OD)</strong></td>";
    html += "<td>" + numaraFormatla(s.sph, s.sphIsaret) + "</td>";
    html += "<td>" + numaraFormatla(s.cyl, s.cylIsaret) + "</td>";
    html += "<td>" + (s.aks || 0) + "</td></tr>";
  }
  // Yakin - Sol
  if (veri.yakin && veri.yakin.sol) {
    var s = veri.yakin.sol;
    html += "<tr><td><strong>Yakin - Sol (OS)</strong></td>";
    html += "<td>" + numaraFormatla(s.sph, s.sphIsaret) + "</td>";
    html += "<td>" + numaraFormatla(s.cyl, s.cylIsaret) + "</td>";
    html += "<td>" + (s.aks || 0) + "</td></tr>";
  }

  tbody.innerHTML = html;
}

// ============================================================
// SGK UYARILARI
// ============================================================
function sgkUyarilariGoster(veri) {
  var container = document.getElementById("g_sgk_uyarilar");
  var html = "";

  // Uzak gozluk uyarisi (her zaman var)
  html += '<div class="sgk-uyari">';
  html += '<span class="uyari-ikon">&#x1F534;</span>';
  html += '<div>';
  html += '<div class="uyari-metin">UZAK GOZLUK: ' + FIYATLAR.sgkKatki + ' TL SGK odemesi</div>';
  html += '<div class="uyari-aciklama">Bu tutar SGK tarafindan karsilanacak, vatandas odemeyecektir.</div>';
  html += '</div>';
  html += '</div>';

  // Yakin gozluk uyarisi (varsa)
  if (veri.yakin) {
    html += '<div class="sgk-uyari">';
    html += '<span class="uyari-ikon">&#x1F534;</span>';
    html += '<div>';
    html += '<div class="uyari-metin">YAKIN GOZLUK: ' + FIYATLAR.sgkKatki + ' TL SGK odemesi</div>';
    html += '<div class="uyari-aciklama">Bu tutar SGK tarafindan karsilanacak, vatandas odemeyecektir.</div>';
    html += '</div>';
    html += '</div>';
  }

  container.innerHTML = html;
}

// ============================================================
// FIYAT KARTI
// ============================================================
function fiyatKartiniDoldur(veri) {
  var container = document.getElementById("g_fiyat_detay");
  var yakinVar = veri.yakin !== null && veri.yakin !== undefined;
  var adet = yakinVar ? 2 : 1;
  var toplamMusteriOder = FIYATLAR.musteriOder * adet;

  var html = "";

  // Her recete tipi icin fiyat detayi
  var tipler = ["Uzak Gozluk"];
  if (yakinVar) tipler.push("Yakin Gozluk");

  for (var i = 0; i < tipler.length; i++) {
    if (tipler.length > 1) {
      html += '<div style="font-weight:600; color:var(--text); margin-top:' + (i > 0 ? '16px' : '0') + '; margin-bottom:8px;">' + tipler[i] + '</div>';
    }
    html += '<div class="fiyat-satir"><span class="etiket">Cerceve</span><span class="tutar">' + FIYATLAR.cerceve + ' TL</span></div>';
    html += '<div class="fiyat-satir"><span class="etiket">Standart Cam</span><span class="tutar">' + FIYATLAR.standartCam + ' TL</span></div>';
    html += '<div class="fiyat-satir"><span class="etiket">SGK Katkisi</span><span class="tutar indirim">-' + FIYATLAR.sgkKatki + ' TL</span></div>';
    html += '<div class="fiyat-satir"><span class="etiket">Magaza Indirimi</span><span class="tutar indirim">-' + FIYATLAR.magazaIndirimi + ' TL</span></div>';
    html += '<div class="fiyat-satir"><span class="etiket"><strong>' + tipler[i] + ' Tutari</strong></span><span class="tutar"><strong>' + FIYATLAR.musteriOder + ' TL</strong></span></div>';
  }

  // Toplam
  html += '<div class="fiyat-satir fiyat-toplam">';
  html += '<span class="etiket"><strong>TOPLAM VATANDAS ODEYECEGI TUTAR</strong></span>';
  html += '<span class="tutar toplam" id="g_toplam_tutar">' + formatParaTL(toplamMusteriOder) + '</span>';
  html += '</div>';

  container.innerHTML = html;

  // Ozel fiyat alanini temizle
  document.getElementById("ozel_fiyat").value = "";
}

// ============================================================
// OZEL FIYAT GUNCELLE
// ============================================================
function ozelFiyatGuncelle() {
  var ozelInput = document.getElementById("ozel_fiyat");
  var toplamEl = document.getElementById("g_toplam_tutar");
  if (!toplamEl) return;

  var val = parseFloat((ozelInput.value || "").replace(",", "."));
  if (val > 0) {
    toplamEl.textContent = formatParaTL(val);
    toplamEl.style.color = "var(--warning)";
  } else {
    // Standart fiyata don
    var yakinVar = mevcutRecete && mevcutRecete.yakin;
    var adet = yakinVar ? 2 : 1;
    toplamEl.textContent = formatParaTL(FIYATLAR.musteriOder * adet);
    toplamEl.style.color = "";
  }
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
// SAYFA YUKLEME
// ============================================================
document.addEventListener("DOMContentLoaded", function() {
  // Sayfa hazir
});
