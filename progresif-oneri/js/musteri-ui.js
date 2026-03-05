// Kepekci Optik - Musteri UI Katmani
// Gorunum gecisleri, liste, detay, form, sorun takip

var _aktifMusteriId = null;

// ===== GORUNUM GECISLERI =====

function analizGorunumuneGecis() {
  document.getElementById("musteri-listesi-section").style.display = "none";
  document.getElementById("musteri-detay-section").style.display = "none";
  // Analiz gorunumunu goster
  var tabs = document.querySelector(".tabs");
  var main = document.querySelector("main");
  var sonuc = document.getElementById("sonuc-section");
  if (tabs) tabs.style.display = "";
  if (main) main.style.display = "";
  // Nav active guncelle
  _navAktifYap("index.html");
}

function musteriListesiGoster() {
  // Analiz gorunumunu gizle
  var tabs = document.querySelector(".tabs");
  var main = document.querySelector("main");
  if (tabs) tabs.style.display = "none";
  if (main) main.style.display = "none";
  document.getElementById("musteri-detay-section").style.display = "none";
  // Musteri listesini goster
  var section = document.getElementById("musteri-listesi-section");
  section.style.display = "";
  _navAktifYap("nav-musteriler");
  _musteriListesiRenderle();
}

function musteriDetayGoster(musteriId) {
  _aktifMusteriId = musteriId;
  document.getElementById("musteri-listesi-section").style.display = "none";
  var tabs = document.querySelector(".tabs");
  var main = document.querySelector("main");
  if (tabs) tabs.style.display = "none";
  if (main) main.style.display = "none";
  var section = document.getElementById("musteri-detay-section");
  section.style.display = "";
  _musteriDetayRenderle(musteriId);
}

function _navAktifYap(hedef) {
  document.querySelectorAll(".header__nav a").forEach(function(a) {
    a.classList.remove("active");
    if (hedef === "nav-musteriler" && a.id === "nav-musteriler") {
      a.classList.add("active");
    } else if (hedef === "index.html" && a.getAttribute("href") === "index.html") {
      a.classList.add("active");
    }
  });
}

// ===== MUSTERI LISTESI =====

function _musteriListesiRenderle(filtre) {
  var icerik = document.getElementById("musteri-liste-icerik");
  var musteriler = filtre ? musteriAra(filtre) : tumMusterileriGetir();

  if (musteriler.length === 0) {
    icerik.innerHTML = '<div class="musteri-bos">Henuz musteri kaydi yok. Analiz yaptiktan sonra "Musteri Olarak Kaydet" butonunu kullanin.</div>';
    return;
  }

  // Son kayit once
  musteriler.sort(function(a, b) {
    return (b.kayitTarih || "").localeCompare(a.kayitTarih || "");
  });

  var html = "";
  musteriler.forEach(function(m) {
    var acikSorun = acikSorunSayisi(m.id);
    var sonAnaliz = m.analizler && m.analizler.length > 0
      ? m.analizler[m.analizler.length - 1].tarih
      : "-";

    html += '<div class="musteri-kart">';
    html += '  <div class="musteri-kart__ust">';
    html += '    <span class="musteri-kart__ad">' + _escHtml(m.ad) + '</span>';
    html += '    <span class="musteri-kart__telefon">' + _escHtml(m.telefon || "") + '</span>';
    html += '  </div>';
    html += '  <div class="musteri-kart__alt">';
    html += '    <span class="musteri-kart__bilgi">Son analiz: ' + sonAnaliz;
    if (acikSorun > 0) {
      html += ' &nbsp;|&nbsp; <span class="badge badge--danger">' + acikSorun + ' acik sorun</span>';
    }
    html += '    </span>';
    html += '    <div class="musteri-kart__butonlar">';
    html += '      <button class="btn btn--outline btn--sm" onclick="musteriDetayGoster(\'' + m.id + '\')">Detay</button>';
    html += '      <button class="btn btn--primary btn--sm" onclick="musteriYeniAnaliz(\'' + m.id + '\')">Yeni Analiz</button>';
    html += '      <button class="btn btn--accent btn--sm" onclick="sorunEkleFormuGoster(\'' + m.id + '\')">Sorun Ekle</button>';
    html += '    </div>';
    html += '  </div>';
    html += '</div>';
  });

  icerik.innerHTML = html;
}

// ===== MUSTERI DETAY =====

function _musteriDetayRenderle(musteriId) {
  var musteri = musteriGetir(musteriId);
  if (!musteri) return;

  document.getElementById("musteri-detay-ad").textContent = musteri.ad;
  var bilgi = "";
  if (musteri.telefon) bilgi += "Tel: " + musteri.telefon + " | ";
  bilgi += "Kayit: " + musteri.kayitTarih;
  if (musteri.not) bilgi += " | Not: " + musteri.not;
  document.getElementById("musteri-detay-bilgi").textContent = bilgi;

  // Analizler
  var analizHtml = "";
  if (!musteri.analizler || musteri.analizler.length === 0) {
    analizHtml = '<div class="musteri-bos">Henuz analiz yok.</div>';
  } else {
    // Son analiz once
    for (var i = musteri.analizler.length - 1; i >= 0; i--) {
      var a = musteri.analizler[i];
      analizHtml += '<div class="analiz-kart">';
      analizHtml += '  <div class="analiz-kart__tarih">' + (a.tarih || "-") + '</div>';
      analizHtml += '  <div class="analiz-kart__detay">';
      if (a.sonuc && a.sonuc.risk) {
        analizHtml += 'Risk: ' + a.sonuc.risk.skor + '/10<br>';
      }
      if (a.recete) {
        var r = a.recete;
        analizHtml += 'SPH: ' + _fmtNum(r.sag && r.sag.sph) + '/' + _fmtNum(r.sol && r.sol.sph) + '<br>';
        analizHtml += 'ADD: ' + _fmtNum(r.sag && r.sag.add) + '/' + _fmtNum(r.sol && r.sol.add);
        if (r.sag && r.sag.cyl) {
          analizHtml += '<br>CYL: ' + _fmtNum(r.sag.cyl) + '/' + _fmtNum(r.sol && r.sol.cyl);
        }
      }
      analizHtml += '  </div>';
      analizHtml += '  <button class="btn btn--ghost btn--xs" style="margin-top:0.4rem;" onclick="musteriAnaliziGor(\'' + musteriId + '\',' + i + ')">Analizi Gor</button>';
      analizHtml += '</div>';
    }
  }
  document.getElementById("musteri-analizler-liste").innerHTML = analizHtml;

  // Sorunlar
  _sorunlarRenderle(musteriId);
}

function _sorunlarRenderle(musteriId) {
  var sorunlar = sorunlariGetir(musteriId);
  var sorunHtml = "";

  if (sorunlar.length === 0) {
    sorunHtml = '<div class="musteri-bos">Henuz sorun kaydi yok.</div>';
  } else {
    // Acik olanlar once
    var sirali = sorunlar.slice().sort(function(a, b) {
      var sira = { acik: 0, takipte: 1, cozuldu: 2 };
      return (sira[a.durum] || 0) - (sira[b.durum] || 0);
    });

    sirali.forEach(function(s) {
      var katEtiket = SORUN_KATEGORILERI[s.kategori] || s.kategori;
      var durumBilgi = SORUN_DURUMLARI[s.durum] || { etiket: s.durum, renk: "#999" };

      sorunHtml += '<div class="sorun-kart sorun-kart--' + s.durum + '">';
      sorunHtml += '  <div class="sorun-kart__ust">';
      sorunHtml += '    <span class="sorun-kart__kategori">' + katEtiket + ' <span class="badge" style="background:' + durumBilgi.renk + ';">' + durumBilgi.etiket + '</span></span>';
      sorunHtml += '    <span class="sorun-kart__tarih">' + (s.tarih || "") + '</span>';
      sorunHtml += '  </div>';
      sorunHtml += '  <div class="sorun-kart__aciklama">' + _escHtml(s.aciklama || "") + '</div>';
      if (s.cozum) {
        sorunHtml += '  <div class="sorun-kart__cozum">Cozum: ' + _escHtml(s.cozum) + '</div>';
      }
      sorunHtml += '  <div class="sorun-kart__butonlar">';
      if (s.durum === "acik") {
        sorunHtml += '    <button class="btn btn--ghost btn--xs" style="color:var(--warning);" onclick="sorunDurumDegistir(\'' + musteriId + '\',\'' + s.id + '\',\'takipte\')">Takipte</button>';
        sorunHtml += '    <button class="btn btn--ghost btn--xs" style="color:var(--success);" onclick="sorunCozulduGoster(\'' + musteriId + '\',\'' + s.id + '\')">Cozuldu</button>';
      } else if (s.durum === "takipte") {
        sorunHtml += '    <button class="btn btn--ghost btn--xs" style="color:var(--success);" onclick="sorunCozulduGoster(\'' + musteriId + '\',\'' + s.id + '\')">Cozuldu</button>';
        sorunHtml += '    <button class="btn btn--ghost btn--xs" style="color:var(--danger);" onclick="sorunDurumDegistir(\'' + musteriId + '\',\'' + s.id + '\',\'acik\')">Tekrar Ac</button>';
      }
      sorunHtml += '  </div>';
      sorunHtml += '</div>';
    });
  }
  document.getElementById("musteri-sorunlar-liste").innerHTML = sorunHtml;
}

// ===== SORUN DURUM DEGISTIRME =====

function sorunDurumDegistir(musteriId, sorunId, yeniDurum) {
  sorunGuncelle(musteriId, sorunId, { durum: yeniDurum });
  _sorunlarRenderle(musteriId);
  // Liste gorunumundeyse onu da guncelle
  var listeSec = document.getElementById("musteri-listesi-section");
  if (listeSec && listeSec.style.display !== "none") {
    _musteriListesiRenderle();
  }
}

function sorunCozulduGoster(musteriId, sorunId) {
  _aktifCozumMusteriId = musteriId;
  _aktifCozumSorunId = sorunId;
  document.getElementById("cozum-aciklama").value = "";
  document.getElementById("cozum-modal").style.display = "flex";
}

var _aktifCozumMusteriId = null;
var _aktifCozumSorunId = null;

// ===== MUSTERI KAYIT MODAL =====

function musteriKaydetModalGoster(mevcutAnaliz) {
  var modal = document.getElementById("musteri-modal");
  document.getElementById("modal-musteri-ad").value = "";
  document.getElementById("modal-musteri-telefon").value = "";
  document.getElementById("modal-musteri-not").value = "";

  // Mevcut musterilere ekleme secenegi
  var mevcut = document.getElementById("modal-mevcut-musteri");
  var select = document.getElementById("modal-mevcut-select");
  var musteriler = tumMusterileriGetir();
  if (musteriler.length > 0) {
    mevcut.style.display = "";
    select.innerHTML = '<option value="">-- Yeni musteri olustur --</option>';
    musteriler.forEach(function(m) {
      select.innerHTML += '<option value="' + m.id + '">' + _escHtml(m.ad) + (m.telefon ? " - " + m.telefon : "") + '</option>';
    });
  } else {
    mevcut.style.display = "none";
  }

  modal.style.display = "flex";

  // Mevcut select degisince ad/tel alanlarini gizle/goster
  select.onchange = function() {
    var adInput = document.getElementById("modal-musteri-ad");
    var telInput = document.getElementById("modal-musteri-telefon");
    var notInput = document.getElementById("modal-musteri-not");
    if (this.value) {
      adInput.parentElement.style.display = "none";
      telInput.parentElement.style.display = "none";
      notInput.parentElement.style.display = "none";
    } else {
      adInput.parentElement.style.display = "";
      telInput.parentElement.style.display = "";
      notInput.parentElement.style.display = "";
    }
  };
}

function _musteriKaydetIsle() {
  var mevcutId = document.getElementById("modal-mevcut-select").value;

  if (mevcutId) {
    // Mevcut musteriye analiz ekle
    var analizData = _sonAnaliziVeriOlustur();
    if (analizData) {
      analizEkle(mevcutId, analizData);
      bildirimGoster("Analiz mevcut musteriye eklendi!", "basari");
    }
  } else {
    // Yeni musteri
    var ad = document.getElementById("modal-musteri-ad").value.trim();
    if (!ad) {
      bildirimGoster("Musteri adi zorunludur.", "hata");
      return;
    }
    var musteri = {
      ad: ad,
      telefon: document.getElementById("modal-musteri-telefon").value.trim(),
      not: document.getElementById("modal-musteri-not").value.trim()
    };
    var kayitliMusteri = musteriKaydet(musteri);

    // Mevcut analizi ekle
    var analizData = _sonAnaliziVeriOlustur();
    if (analizData) {
      analizEkle(kayitliMusteri.id, analizData);
    }
    bildirimGoster("Musteri kaydedildi: " + ad, "basari");
  }

  document.getElementById("musteri-modal").style.display = "none";
}

function _sonAnaliziVeriOlustur() {
  if (!window._sonRecete || !window._sonAnaliz) return null;
  return {
    tarih: new Date().toISOString().split("T")[0],
    recete: JSON.parse(JSON.stringify(window._sonRecete)),
    cerceve: JSON.parse(JSON.stringify(window._sonCerceve || {})),
    sonuc: {
      risk: window._sonAnaliz.risk ? { skor: window._sonAnaliz.risk.skor, seviye: window._sonAnaliz.risk.seviye } : null,
      koridor: window._sonAnaliz.koridor ? { idealKoridor: window._sonAnaliz.koridor.idealKoridor } : null,
      indeksOnerisi: window._sonAnaliz.indeksOnerisi || null
    },
    powParams: JSON.parse(JSON.stringify(window._sonPowParams || {}))
  };
}

// ===== YENI MUSTERI FORMU (listeden) =====

function yeniMusteriFormuGoster() {
  var modal = document.getElementById("musteri-modal");
  document.getElementById("modal-baslik").textContent = "Yeni Musteri";
  document.getElementById("modal-musteri-ad").value = "";
  document.getElementById("modal-musteri-telefon").value = "";
  document.getElementById("modal-musteri-not").value = "";
  document.getElementById("modal-mevcut-musteri").style.display = "none";
  // Ad/tel/not alanlarini goster
  document.getElementById("modal-musteri-ad").parentElement.style.display = "";
  document.getElementById("modal-musteri-telefon").parentElement.style.display = "";
  document.getElementById("modal-musteri-not").parentElement.style.display = "";
  document.getElementById("modal-mevcut-select").value = "";
  modal.style.display = "flex";
}

// ===== YENI ANALIZ (mevcut musteriye) =====

function musteriYeniAnaliz(musteriId) {
  _aktifMusteriId = musteriId;
  // Analiz gorunumune gec
  analizGorunumuneGecis();
  bildirimGoster("Formu doldurup analiz yapin, sonra 'Musteri Olarak Kaydet' ile bu musteriye ekleyin.", "bilgi");
}

// ===== MUSTERI ANALIZI GOR =====

function musteriAnaliziGor(musteriId, analizIndex) {
  var musteri = musteriGetir(musteriId);
  if (!musteri || !musteri.analizler || !musteri.analizler[analizIndex]) return;

  var analiz = musteri.analizler[analizIndex];

  // Form'a yaz ve analiz baslat
  if (analiz.recete) {
    _formaDoldur(analiz.recete, analiz.cerceve, analiz.powParams);
  }

  analizGorunumuneGecis();

  // Kucuk gecikme ile analiz baslat (form degerlerinin oturmasini bekle)
  setTimeout(function() {
    analizBaslat();
  }, 100);
}

function _formaDoldur(recete, cerceve, powParams) {
  if (recete.sag) {
    _setInput("od_sph", recete.sag.sph);
    _setInput("od_cyl", recete.sag.cyl);
    _setInput("od_ax", recete.sag.ax);
    _setInput("od_add", recete.sag.add);
  }
  if (recete.sol) {
    _setInput("os_sph", recete.sol.sph);
    _setInput("os_cyl", recete.sol.cyl);
    _setInput("os_ax", recete.sol.ax);
    _setInput("os_add", recete.sol.add);
  }
  _setInput("pd_sag", recete.pdSag);
  _setInput("pd_sol", recete.pdSol);
  if (cerceve) {
    _setInput("fitting_height", cerceve.fittingHeight);
    _setInput("b_measure", cerceve.bOlcusu);
    _setInput("a_measure", cerceve.aOlcusu);
  }
  if (powParams) {
    _setInput("vertex_mesafe", powParams.vertex);
    _setInput("pantoskopik_egim", powParams.pantoskopik);
    _setInput("yuz_sarma", powParams.wrap);
  }
}

function _setInput(id, val) {
  var el = document.getElementById(id);
  if (!el || val === null || val === undefined) return;
  el.value = val;
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
}

// ===== SORUN EKLEME =====

function sorunEkleFormuGoster(musteriId) {
  _aktifMusteriId = musteriId;
  document.getElementById("sorun-kategori").value = "";
  document.getElementById("sorun-aciklama").value = "";
  document.getElementById("sorun-modal").style.display = "flex";
}

function _sorunEkleIsle() {
  var kategori = document.getElementById("sorun-kategori").value;
  var aciklama = document.getElementById("sorun-aciklama").value.trim();

  if (!kategori) {
    bildirimGoster("Kategori secin.", "hata");
    return;
  }
  if (!aciklama) {
    bildirimGoster("Aciklama yazin.", "hata");
    return;
  }

  sorunEkle(_aktifMusteriId, {
    kategori: kategori,
    aciklama: aciklama
  });

  document.getElementById("sorun-modal").style.display = "none";
  bildirimGoster("Sorun eklendi.", "basari");

  // Detay gorunumundeyse guncelle
  var detaySec = document.getElementById("musteri-detay-section");
  if (detaySec && detaySec.style.display !== "none") {
    _sorunlarRenderle(_aktifMusteriId);
  }
}

// ===== MUSTERI DUZENLEME =====

function musteriDuzenleFormuGoster() {
  var musteri = musteriGetir(_aktifMusteriId);
  if (!musteri) return;
  document.getElementById("duzenle-ad").value = musteri.ad || "";
  document.getElementById("duzenle-telefon").value = musteri.telefon || "";
  document.getElementById("duzenle-not").value = musteri.not || "";
  document.getElementById("duzenle-modal").style.display = "flex";
}

function _musteriDuzenleIsle() {
  var ad = document.getElementById("duzenle-ad").value.trim();
  if (!ad) {
    bildirimGoster("Ad zorunludur.", "hata");
    return;
  }
  musteriGuncelle(_aktifMusteriId, {
    ad: ad,
    telefon: document.getElementById("duzenle-telefon").value.trim(),
    not: document.getElementById("duzenle-not").value.trim()
  });
  document.getElementById("duzenle-modal").style.display = "none";
  bildirimGoster("Musteri guncellendi.", "basari");
  _musteriDetayRenderle(_aktifMusteriId);
}

// ===== MUSTERI SILME =====

function musteriSilOnay() {
  var musteri = musteriGetir(_aktifMusteriId);
  if (!musteri) return;
  if (confirm(musteri.ad + " adli musteriyi silmek istediginizden emin misiniz?")) {
    musteriSil(_aktifMusteriId);
    bildirimGoster("Musteri silindi.", "basari");
    musteriListesiGoster();
  }
}

// ===== ISTATISTIKLER =====

function _istatistikleriGoster() {
  var panel = document.getElementById("istatistik-panel");
  if (panel.style.display === "none") {
    panel.style.display = "";
    var stats = istatistikleriHesapla();
    _istatistikRenderle(stats);
  } else {
    panel.style.display = "none";
  }
}

function _istatistikRenderle(stats) {
  var panel = document.getElementById("istatistik-panel");
  var html = '<div class="istatistik-grid">';

  html += _istatistikKart(stats.toplamMusteri, "Toplam Musteri");
  html += _istatistikKart(stats.toplamSorun, "Toplam Sorun");
  html += _istatistikKart(stats.acikSorun, "Acik Sorun");
  html += _istatistikKart(stats.cozumOrani, "Cozum Orani");
  html += _istatistikKart(stats.enSikKategori, "En Sik Sorun");
  html += _istatistikKart(stats.ortalamaRisk, "Ort. Risk Skoru");

  html += '</div>';

  if (stats.yuksekRiskSorunOrani) {
    html += '<div style="margin-top:1rem; padding:0.8rem; background:var(--bg); border-radius:var(--radius-sm); font-size:0.9rem;">';
    html += '<strong>Risk-Sorun Iliskisi:</strong> Yuksek riskli recetelerde (7+) sorun orani: ' + stats.yuksekRiskSorunOrani;
    html += '</div>';
  }

  panel.innerHTML = html;
}

function _istatistikKart(deger, etiket) {
  return '<div class="istatistik-kart"><div class="istatistik-kart__sayi">' + deger + '</div><div class="istatistik-kart__etiket">' + etiket + '</div></div>';
}

// ===== YARDIMCI =====

function _escHtml(str) {
  var div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function _fmtNum(val) {
  if (val === null || val === undefined || val === "") return "-";
  var n = parseFloat(val);
  if (isNaN(n)) return "-";
  return (n >= 0 ? "+" : "") + n.toFixed(2);
}

// ===== EVENT LISTENERS =====

document.addEventListener("DOMContentLoaded", function() {
  // Musteri kaydet butonu (analiz sonucu)
  var btnKaydet = document.getElementById("btn-musteri-kaydet");
  if (btnKaydet) {
    btnKaydet.addEventListener("click", function() {
      if (!window._sonAnaliz) {
        bildirimGoster("Once analiz yapin.", "hata");
        return;
      }
      document.getElementById("modal-baslik").textContent = "Musteri Olarak Kaydet";
      // Ad/tel/not alanlarini goster
      document.getElementById("modal-musteri-ad").parentElement.style.display = "";
      document.getElementById("modal-musteri-telefon").parentElement.style.display = "";
      document.getElementById("modal-musteri-not").parentElement.style.display = "";
      musteriKaydetModalGoster(true);
    });
  }

  // Modal butonlari
  document.getElementById("modal-iptal").addEventListener("click", function() {
    document.getElementById("musteri-modal").style.display = "none";
  });
  document.getElementById("modal-kaydet").addEventListener("click", _musteriKaydetIsle);

  // Sorun modal
  document.getElementById("sorun-modal-iptal").addEventListener("click", function() {
    document.getElementById("sorun-modal").style.display = "none";
  });
  document.getElementById("sorun-modal-kaydet").addEventListener("click", _sorunEkleIsle);

  // Duzenleme modal
  document.getElementById("duzenle-iptal").addEventListener("click", function() {
    document.getElementById("duzenle-modal").style.display = "none";
  });
  document.getElementById("duzenle-kaydet").addEventListener("click", _musteriDuzenleIsle);

  // Cozum modal
  document.getElementById("cozum-modal-iptal").addEventListener("click", function() {
    document.getElementById("cozum-modal").style.display = "none";
  });
  document.getElementById("cozum-modal-kaydet").addEventListener("click", function() {
    var cozum = document.getElementById("cozum-aciklama").value.trim();
    sorunGuncelle(_aktifCozumMusteriId, _aktifCozumSorunId, { durum: "cozuldu", cozum: cozum });
    document.getElementById("cozum-modal").style.display = "none";
    bildirimGoster("Sorun cozuldu olarak isaretlendi.", "basari");
    // Gorunumu guncelle
    var detaySec = document.getElementById("musteri-detay-section");
    if (detaySec && detaySec.style.display !== "none") {
      _sorunlarRenderle(_aktifCozumMusteriId);
    }
  });

  // Yeni musteri butonu (listeden)
  document.getElementById("btn-yeni-musteri").addEventListener("click", yeniMusteriFormuGoster);

  // Musteri duzenleme
  document.getElementById("btn-musteri-duzenle").addEventListener("click", musteriDuzenleFormuGoster);

  // Musteri silme
  document.getElementById("btn-musteri-sil").addEventListener("click", musteriSilOnay);

  // Sorun ekle (detaydan)
  document.getElementById("btn-sorun-ekle").addEventListener("click", function() {
    sorunEkleFormuGoster(_aktifMusteriId);
  });

  // Istatistikler
  document.getElementById("btn-istatistikler").addEventListener("click", _istatistikleriGoster);

  // Arama
  document.getElementById("musteri-arama-input").addEventListener("input", function() {
    _musteriListesiRenderle(this.value);
  });

  // Modal overlay tiklamayla kapatma
  document.querySelectorAll(".modal-overlay").forEach(function(modal) {
    modal.addEventListener("click", function(e) {
      if (e.target === this) {
        this.style.display = "none";
      }
    });
  });
});
