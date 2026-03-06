// Kepekci Optik - Musteri UI Katmani
// Gorunum gecisleri, liste, detay, form, sorun takip

let _aktifMusteriId = null;

// ===== GORUNUM GECISLERI =====

function analizGorunumuneGecis() {
  document.getElementById("musteri-listesi-section").style.display = "none";
  document.getElementById("musteri-detay-section").style.display = "none";
  // Analiz gorunumunu goster
  const tabs = document.querySelector(".tabs");
  const main = document.querySelector("main");
  const sonuc = document.getElementById("sonuc-section");
  if (tabs) tabs.style.display = "";
  if (main) main.style.display = "";
  // Nav active guncelle
  _navAktifYap("index.html");
}

function musteriListesiGoster() {
  // Analiz gorunumunu gizle
  const tabs = document.querySelector(".tabs");
  const main = document.querySelector("main");
  if (tabs) tabs.style.display = "none";
  if (main) main.style.display = "none";
  document.getElementById("musteri-detay-section").style.display = "none";
  // Musteri listesini goster
  const section = document.getElementById("musteri-listesi-section");
  section.style.display = "";
  _navAktifYap("nav-musteriler");
  _musteriListesiRenderle();
}

function musteriDetayGoster(musteriId) {
  _aktifMusteriId = musteriId;
  document.getElementById("musteri-listesi-section").style.display = "none";
  const tabs = document.querySelector(".tabs");
  const main = document.querySelector("main");
  if (tabs) tabs.style.display = "none";
  if (main) main.style.display = "none";
  const section = document.getElementById("musteri-detay-section");
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
  const icerik = document.getElementById("musteri-liste-icerik");
  const musteriler = filtre ? musteriAra(filtre) : tumMusterileriGetir();

  if (musteriler.length === 0) {
    icerik.innerHTML = '<div class="musteri-bos">Henuz musteri kaydi yok. Analiz yaptiktan sonra "Musteri Olarak Kaydet" butonunu kullanin.</div>';
    return;
  }

  // Son kayit once
  musteriler.sort(function(a, b) {
    return (b.kayitTarih || "").localeCompare(a.kayitTarih || "");
  });

  let html = "";
  musteriler.forEach(function(m) {
    const acikSorun = acikSorunSayisi(m.id);
    const sonAnaliz = m.analizler && m.analizler.length > 0
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
  const musteri = musteriGetir(musteriId);
  if (!musteri) return;

  document.getElementById("musteri-detay-ad").textContent = musteri.ad;
  let bilgi = "";
  if (musteri.telefon) bilgi += "Tel: " + musteri.telefon + " | ";
  bilgi += "Kayit: " + musteri.kayitTarih;
  if (musteri.not) bilgi += " | Not: " + musteri.not;
  document.getElementById("musteri-detay-bilgi").textContent = bilgi;

  // Analizler
  let analizHtml = "";
  if (!musteri.analizler || musteri.analizler.length === 0) {
    analizHtml = '<div class="musteri-bos">Henuz analiz yok.</div>';
  } else {
    if (musteri.analizler.length >= 2) {
      analizHtml += '<div style="margin-bottom:0.6rem;"><button class="btn btn--ghost btn--xs" id="btn-karsilastir" disabled>Secilenleri Karsilastir</button></div>';
    }
    // Son analiz once
    for (let i = musteri.analizler.length - 1; i >= 0; i--) {
      const a = musteri.analizler[i];
      analizHtml += '<div class="analiz-kart">';
      if (musteri.analizler.length >= 2) {
        analizHtml += '<label style="float:right;cursor:pointer;"><input type="checkbox" class="analiz-karsilastir-cb" data-index="' + i + '" style="margin:0;"> Sec</label>';
      }
      analizHtml += '  <div class="analiz-kart__tarih">' + (a.tarih || "-") + '</div>';
      analizHtml += '  <div class="analiz-kart__detay">';
      if (a.sonuc && a.sonuc.risk) {
        analizHtml += 'Risk: ' + a.sonuc.risk.skor + '/10<br>';
      }
      if (a.recete) {
        const r = a.recete;
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

  // Karsilastirma checkbox event'leri
  if (musteri.analizler && musteri.analizler.length >= 2) {
    const cbList = document.querySelectorAll(".analiz-karsilastir-cb");
    const btnKarsilastir = document.getElementById("btn-karsilastir");
    cbList.forEach(function(cb) {
      cb.addEventListener("change", function() {
        const secili = document.querySelectorAll(".analiz-karsilastir-cb:checked");
        btnKarsilastir.disabled = secili.length < 2;
      });
    });
    btnKarsilastir.addEventListener("click", function() {
      const secili = document.querySelectorAll(".analiz-karsilastir-cb:checked");
      const indexler = [];
      secili.forEach(function(cb) { indexler.push(parseInt(cb.dataset.index)); });
      if (indexler.length >= 2) {
        _analizKarsilastirGoster(musteriId, indexler);
      }
    });
  }

  // Sorunlar
  _sorunlarRenderle(musteriId);
}

function _sorunlarRenderle(musteriId) {
  const sorunlar = sorunlariGetir(musteriId);
  let sorunHtml = "";

  if (sorunlar.length === 0) {
    sorunHtml = '<div class="musteri-bos">Henuz sorun kaydi yok.</div>';
  } else {
    // Acik olanlar once
    const sirali = sorunlar.slice().sort(function(a, b) {
      const sira = { acik: 0, takipte: 1, cozuldu: 2 };
      return (sira[a.durum] || 0) - (sira[b.durum] || 0);
    });

    sirali.forEach(function(s) {
      const katEtiket = SORUN_KATEGORILERI[s.kategori] || s.kategori;
      const durumBilgi = SORUN_DURUMLARI[s.durum] || { etiket: s.durum, renk: "#999" };

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
  const listeSec = document.getElementById("musteri-listesi-section");
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

let _aktifCozumMusteriId = null;
let _aktifCozumSorunId = null;

// ===== MUSTERI KAYIT MODAL =====

function musteriKaydetModalGoster(mevcutAnaliz) {
  const modal = document.getElementById("musteri-modal");
  document.getElementById("modal-musteri-ad").value = "";
  document.getElementById("modal-musteri-telefon").value = "";
  document.getElementById("modal-musteri-not").value = "";

  // Mevcut musterilere ekleme secenegi
  const mevcut = document.getElementById("modal-mevcut-musteri");
  const select = document.getElementById("modal-mevcut-select");
  const musteriler = tumMusterileriGetir();
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
    const adInput = document.getElementById("modal-musteri-ad");
    const telInput = document.getElementById("modal-musteri-telefon");
    const notInput = document.getElementById("modal-musteri-not");
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
  const mevcutId = document.getElementById("modal-mevcut-select").value;

  if (mevcutId) {
    // Mevcut musteriye analiz ekle
    const analizData = _sonAnaliziVeriOlustur();
    if (analizData) {
      analizEkle(mevcutId, analizData);
      bildirimGoster("Analiz mevcut musteriye eklendi!", "basari");
    }
  } else {
    // Yeni musteri
    const ad = document.getElementById("modal-musteri-ad").value.trim();
    if (!ad) {
      bildirimGoster("Musteri adi zorunludur.", "hata");
      return;
    }
    const musteri = {
      ad: ad,
      telefon: document.getElementById("modal-musteri-telefon").value.trim(),
      not: document.getElementById("modal-musteri-not").value.trim()
    };
    const kayitliMusteri = musteriKaydet(musteri);

    // Mevcut analizi ekle
    const analizData = _sonAnaliziVeriOlustur();
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
  const modal = document.getElementById("musteri-modal");
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
  const musteri = musteriGetir(musteriId);
  if (!musteri || !musteri.analizler || !musteri.analizler[analizIndex]) return;

  const analiz = musteri.analizler[analizIndex];

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
  const el = document.getElementById(id);
  if (!el || val === null || val === undefined) return;
  el.value = val;
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
}

// ===== ANALIZ KARSILASTIRMA =====

function _analizKarsilastirGoster(musteriId, indexler) {
  const musteri = musteriGetir(musteriId);
  if (!musteri || !musteri.analizler) return;

  const analizler = indexler.map(function(i) { return musteri.analizler[i]; }).filter(Boolean);
  if (analizler.length < 2) return;

  // Kronolojik siralama
  analizler.sort(function(a, b) { return (a.tarih || "").localeCompare(b.tarih || ""); });

  let html = '<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:0.85rem;">';
  html += '<thead><tr><th style="border:1px solid #ddd;padding:6px;background:#f0f4f8;">Parametre</th>';
  analizler.forEach(function(a) {
    html += '<th style="border:1px solid #ddd;padding:6px;background:#f0f4f8;">' + (a.tarih || "-") + '</th>';
  });
  html += '</tr></thead><tbody>';

  // Satirlar
  const satirlar = [
    { baslik: "Sag SPH", al: function(a) { return _fmtNum(a.recete && a.recete.sag && a.recete.sag.sph); } },
    { baslik: "Sag CYL", al: function(a) { return _fmtNum(a.recete && a.recete.sag && a.recete.sag.cyl); } },
    { baslik: "Sag AX", al: function(a) { return _fmtNum(a.recete && a.recete.sag && a.recete.sag.ax); } },
    { baslik: "Sag ADD", al: function(a) { return _fmtNum(a.recete && a.recete.sag && a.recete.sag.add); } },
    { baslik: "Sol SPH", al: function(a) { return _fmtNum(a.recete && a.recete.sol && a.recete.sol.sph); } },
    { baslik: "Sol CYL", al: function(a) { return _fmtNum(a.recete && a.recete.sol && a.recete.sol.cyl); } },
    { baslik: "Sol AX", al: function(a) { return _fmtNum(a.recete && a.recete.sol && a.recete.sol.ax); } },
    { baslik: "Sol ADD", al: function(a) { return _fmtNum(a.recete && a.recete.sol && a.recete.sol.add); } },
    { baslik: "PD Sag", al: function(a) { return _fmtNum(a.recete && a.recete.pdSag); } },
    { baslik: "PD Sol", al: function(a) { return _fmtNum(a.recete && a.recete.pdSol); } },
    { baslik: "Odak Yuk.", al: function(a) { return _fmtNum(a.cerceve && a.cerceve.fittingHeight); } },
    { baslik: "Risk Skoru", al: function(a) { return a.sonuc && a.sonuc.risk ? a.sonuc.risk.skor + "/10" : "-"; } }
  ];

  satirlar.forEach(function(satir) {
    html += '<tr><td style="border:1px solid #ddd;padding:6px;font-weight:600;">' + satir.baslik + '</td>';
    const degerler = analizler.map(satir.al);
    analizler.forEach(function(a, idx) {
      let stil = "border:1px solid #ddd;padding:6px;text-align:center;";
      // Degisim varsa vurgula
      if (idx > 0 && degerler[idx] !== degerler[idx - 1] && degerler[idx] !== "-" && degerler[idx - 1] !== "-") {
        stil += "background:#fff3cd;font-weight:600;";
      }
      html += '<td style="' + stil + '">' + degerler[idx] + '</td>';
    });
    html += '</tr>';
  });

  html += '</tbody></table></div>';

  // Modal'da goster
  let modal = document.getElementById("karsilastirma-modal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "karsilastirma-modal";
    modal.className = "modal-overlay";
    modal.innerHTML = '<div class="modal-content" style="max-width:700px;"><h3 class="modal-title">Analiz Karsilastirma</h3><div id="karsilastirma-icerik"></div><div style="text-align:center;margin-top:1rem;"><button class="btn btn--outline" id="btn-karsilastirma-kapat">Kapat</button></div></div>';
    document.body.appendChild(modal);
    modal.addEventListener("click", function(e) {
      if (e.target === this) this.style.display = "none";
    });
    document.getElementById("btn-karsilastirma-kapat").addEventListener("click", function() {
      modal.style.display = "none";
    });
  }
  document.getElementById("karsilastirma-icerik").innerHTML = html;
  modal.style.display = "flex";
}

// ===== SORUN EKLEME =====

function sorunEkleFormuGoster(musteriId) {
  _aktifMusteriId = musteriId;
  document.getElementById("sorun-kategori").value = "";
  document.getElementById("sorun-aciklama").value = "";
  document.getElementById("sorun-modal").style.display = "flex";
}

function _sorunEkleIsle() {
  const kategori = document.getElementById("sorun-kategori").value;
  const aciklama = document.getElementById("sorun-aciklama").value.trim();

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
  const detaySec = document.getElementById("musteri-detay-section");
  if (detaySec && detaySec.style.display !== "none") {
    _sorunlarRenderle(_aktifMusteriId);
  }
}

// ===== MUSTERI DUZENLEME =====

function musteriDuzenleFormuGoster() {
  const musteri = musteriGetir(_aktifMusteriId);
  if (!musteri) return;
  document.getElementById("duzenle-ad").value = musteri.ad || "";
  document.getElementById("duzenle-telefon").value = musteri.telefon || "";
  document.getElementById("duzenle-not").value = musteri.not || "";
  document.getElementById("duzenle-modal").style.display = "flex";
}

function _musteriDuzenleIsle() {
  const ad = document.getElementById("duzenle-ad").value.trim();
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
  const musteri = musteriGetir(_aktifMusteriId);
  if (!musteri) return;
  if (confirm(musteri.ad + " adli musteriyi silmek istediginizden emin misiniz?")) {
    musteriSil(_aktifMusteriId);
    bildirimGoster("Musteri silindi.", "basari");
    musteriListesiGoster();
  }
}

// ===== ISTATISTIKLER =====

function _istatistikleriGoster() {
  const panel = document.getElementById("istatistik-panel");
  if (panel.style.display === "none") {
    panel.style.display = "";
    const stats = istatistikleriHesapla();
    _istatistikRenderle(stats);
  } else {
    panel.style.display = "none";
  }
}

function _istatistikRenderle(stats) {
  const panel = document.getElementById("istatistik-panel");
  let html = '<div class="istatistik-grid">';

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
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function _fmtNum(val) {
  if (val === null || val === undefined || val === "") return "-";
  const n = parseFloat(val);
  if (isNaN(n)) return "-";
  return (n >= 0 ? "+" : "") + n.toFixed(2);
}

// ===== EVENT LISTENERS =====

document.addEventListener("DOMContentLoaded", function() {
  // Musteri kaydet butonu (analiz sonucu)
  const btnKaydet = document.getElementById("btn-musteri-kaydet");
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
    const cozum = document.getElementById("cozum-aciklama").value.trim();
    sorunGuncelle(_aktifCozumMusteriId, _aktifCozumSorunId, { durum: "cozuldu", cozum: cozum });
    document.getElementById("cozum-modal").style.display = "none";
    bildirimGoster("Sorun cozuldu olarak isaretlendi.", "basari");
    // Gorunumu guncelle
    const detaySec = document.getElementById("musteri-detay-section");
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

  // Veri yedekleme
  document.getElementById("btn-veri-yedekle").addEventListener("click", veriYedekle);

  // Veri geri yukleme
  const btnVeriYukle = document.getElementById("btn-veri-yukle");
  const yedekDosyaInput = document.getElementById("yedek-dosya-input");
  btnVeriYukle.addEventListener("click", function() {
    yedekDosyaInput.click();
  });
  yedekDosyaInput.addEventListener("change", function() {
    if (this.files && this.files[0]) {
      veriGeriYukle(this.files[0]);
      this.value = ""; // ayni dosyanin tekrar secilmesine izin ver
    }
  });

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
