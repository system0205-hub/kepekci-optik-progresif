// Kepekci Optik - Ana Uygulama Mantigi
// DOM etkilesimi, form okuma, sonuc gosterme

document.addEventListener("DOMContentLoaded", function() {

  // ===== STEPPER BUTONLARI (+/- butonlari) =====
  document.querySelectorAll(".stepper__btn").forEach(function(btn) {
    btn.addEventListener("click", function() {
      const input = this.closest(".stepper").querySelector(".stepper__input");
      if (!input) return;
      const step = parseFloat(input.step) || 0.25;
      const min = parseFloat(input.min);
      const max = parseFloat(input.max);
      let val = parseFloat(input.value) || 0;

      if (this.classList.contains("stepper__btn--plus") || this.dataset.dir === "up") {
        val = Math.round((val + step) * 100) / 100;
      } else {
        val = Math.round((val - step) * 100) / 100;
      }

      if (!isNaN(min) && val < min) val = min;
      if (!isNaN(max) && val > max) val = max;

      input.value = val.toFixed(2);
      input.dispatchEvent(new Event("change"));
    });
  });

  // ===== TOGGLE SWITCH =====
  var toggleCheckbox = document.getElementById("ilk_progresif");
  var toggleText = document.getElementById("toggle-status-text");
  if (toggleCheckbox && toggleText) {
    toggleCheckbox.addEventListener("change", function() {
      toggleText.textContent = this.checked ? "Evet" : "Hayir";
      toggleText.className = this.checked ? "toggle-status toggle-status--yes" : "toggle-status toggle-status--no";
    });
  }

  // ===== COLLAPSIBLE (Acilir/Kapanir) BOLUMLER =====
  document.querySelectorAll("[data-collapse-toggle]").forEach(function(btn) {
    btn.addEventListener("click", function() {
      var targetId = this.getAttribute("data-collapse-toggle");
      var target = document.getElementById(targetId);
      if (target) {
        var isOpen = target.classList.toggle("open");
        this.classList.toggle("open", isOpen);
      }
    });
  });

  // Risk faktorleri toggle
  var riskToggle = document.getElementById("risk-factors-toggle");
  var riskList = document.getElementById("risk-factors-list");
  if (riskToggle && riskList) {
    riskToggle.addEventListener("click", function() {
      var isOpen = riskList.classList.toggle("open");
      this.classList.toggle("open", isOpen);
    });
  }

  // Hasta notlari toggle
  var notToggle = document.getElementById("patient-notes-toggle");
  var notContent = document.getElementById("patient-notes-content");
  if (notToggle && notContent) {
    notToggle.addEventListener("click", function() {
      var isOpen = notContent.classList.toggle("open");
      this.classList.toggle("open", isOpen);
    });
  }

  // Paket detaylari toggle (her tier icin)
  ["premium", "orta", "baslangic"].forEach(function(tier) {
    var detToggle = document.getElementById("rec-" + tier + "-details-toggle");
    var detContent = document.getElementById("rec-" + tier + "-details");
    if (detToggle && detContent) {
      detToggle.addEventListener("click", function() {
        var isOpen = detContent.classList.toggle("open");
        this.classList.toggle("open", isOpen);
      });
    }
  });

  // ===== TAB GECISI =====
  document.querySelectorAll(".tab-btn").forEach(function(tab) {
    tab.addEventListener("click", function() {
      var target = this.dataset.tab;
      if (target === "foto-olcum") {
        window.location.href = "foto-olcum.html";
        return;
      }
      document.querySelectorAll(".tab-btn").forEach(function(t) { t.classList.remove("active"); });
      this.classList.add("active");
    });
  });

  // ===== ANALIZ ET BUTONU =====
  var btnAnaliz = document.getElementById("btn-analiz");
  if (btnAnaliz) {
    btnAnaliz.addEventListener("click", function() {
      analizBaslat();
    });
  }

  // ===== YAZDIR / PDF RAPOR BUTONU =====
  var btnYazdir = document.getElementById("btn-yazdir");
  if (btnYazdir) {
    btnYazdir.addEventListener("click", function() {
      // Rapor basligi bilgilerini doldur
      var raporTarih = document.getElementById("rapor-tarih");
      if (raporTarih) {
        raporTarih.textContent = "Rapor Tarihi: " + new Date().toLocaleDateString("tr-TR");
      }
      var raporMusteri = document.getElementById("rapor-musteri-bilgi");
      if (raporMusteri) {
        // Formdaki bilgileri ozetle
        var pdS = formDegeriOku("pd_sag");
        var pdL = formDegeriOku("pd_sol");
        var bilgi = "";
        if (pdS && pdL) bilgi = "PD: " + pdS + "/" + pdL + " mm";
        raporMusteri.textContent = bilgi;
      }
      window.print();
    });
  }

  // ===== KOPYALA BUTONU =====
  var btnKopyala = document.getElementById("btn-kopyala");
  if (btnKopyala) {
    btnKopyala.addEventListener("click", function() {
      var metin = sonuclariMetneOlustur();
      kopyalaSonuc(metin);
    });
  }

  // ===== HASTA TALIMATI YAZDIR BUTONU =====
  var btnHastaTalimati = document.getElementById("btn-hasta-talimati");
  if (btnHastaTalimati) {
    btnHastaTalimati.addEventListener("click", function() {
      hastaTalimatiAc();
    });
  }

  // ===== WHATSAPP PAYLAS BUTONU =====
  var btnWhatsapp = document.getElementById("btn-whatsapp");
  if (btnWhatsapp) {
    btnWhatsapp.addEventListener("click", function() {
      var metin = sonuclariMetneOlustur();
      if (!metin || metin === "Henuz analiz yapilmadi.") {
        bildirimGoster("Once analiz yapin.", "hata");
        return;
      }
      // WhatsApp karakter limiti ~65536, kisa tutalim
      if (metin.length > 4000) {
        metin = metin.substring(0, 4000) + "\n\n... (devami icin raporu yazdirin)";
      }
      var url = "https://wa.me/?text=" + encodeURIComponent(metin);
      window.open(url, "_blank");
    });
  }

  // ===== LOCALSTORAGE - Son girilen degerleri hatirlama =====
  sonDegerleriYukle();

  // ===== FOTOGRAFTAN GELEN OLCUMLERI OKU =====
  fotoOlcumParametreleriniOku();
});

// ===== ANA ANALIZ FONKSIYONU =====
function analizBaslat() {
  // Form degerlerini oku
  var recete = {
    sag: {
      sph: formDegeriOku("od_sph"),
      cyl: formDegeriOku("od_cyl"),
      ax: formDegeriOku("od_ax"),
      add: formDegeriOku("od_add")
    },
    sol: {
      sph: formDegeriOku("os_sph"),
      cyl: formDegeriOku("os_cyl"),
      ax: formDegeriOku("os_ax"),
      add: formDegeriOku("os_add")
    },
    pdSag: formDegeriOku("pd_sag"),
    pdSol: formDegeriOku("pd_sol")
  };

  // CYL yoksa (0 veya null), AX anlamsiz - null yap
  // Doktor CYL yazmamissa astigmat yok demektir, AX degeri de yoktur
  ["sag", "sol"].forEach(function(goz) {
    if (!recete[goz].cyl || recete[goz].cyl === 0) {
      recete[goz].cyl = null;
      recete[goz].ax = null;
    }
  });

  var cerceve = {
    fittingHeight: formDegeriOku("fitting_height"),
    bOlcusu: formDegeriOku("b_measure"),
    aOlcusu: formDegeriOku("a_measure")
  };

  // 1E: Opsiyonel POW parametreleri
  var powParams = {
    vertex: formDegeriOku("vertex_mesafe"),
    pantoskopik: formDegeriOku("pantoskopik_egim"),
    wrap: formDegeriOku("yuz_sarma")
  };

  var yasamTarziEl = document.getElementById("yasam_tarzi");
  var yasamTarzi = yasamTarziEl ? yasamTarziEl.value : "diger";

  var ilkProgresifEl = document.getElementById("ilk_progresif");
  var ilkKullanim = ilkProgresifEl ? ilkProgresifEl.checked : false;

  // Validasyon
  var receteHatalari = validasyonRecete(recete);
  var cerceveHatalari = validasyonCerceve(cerceve);
  var tumHatalar = receteHatalari.concat(cerceveHatalari);

  if (tumHatalar.length > 0) {
    hatalariGoster(tumHatalar);
    return;
  }

  // Hata isaretlerini temizle
  hatalariTemizle();

  // Analiz yap (try/catch ile sessiz hatalari yakala)
  try {
    var sonuc = analizEt(recete, cerceve, yasamTarzi, ilkKullanim);

    // Siparis bilgileri ve montaj kontrol listesi olustur
    sonuc.siparisBilgileri = siparisBilgileriOlustur(recete, cerceve, sonuc, powParams);
    sonuc.montajKontrolListesi = montajKontrolListesiOlustur(recete, cerceve, sonuc, ilkKullanim);

    // Son analiz sonucunu global'de tut (kopyalama ve talimati icin)
    window._sonAnaliz = sonuc;
    window._sonRecete = recete;
    window._sonCerceve = cerceve;
    window._sonPowParams = powParams;

    // Sonuclari goster
    sonuclariGoster(sonuc);

    // LocalStorage'a kaydet
    sonDegerleriKaydet(recete, cerceve, yasamTarzi, ilkKullanim);
  } catch (e) {
    console.error("Analiz hatasi:", e);
    bildirimGoster("Analiz sirasinda bir hata olustu. Lutfen degerleri kontrol edin.", "hata");
  }
}

// ===== SONUCLARI GOSTERME =====
function sonuclariGoster(sonuc) {
  var sonucSection = document.getElementById("sonuc-section");
  if (!sonucSection) return;

  // Risk skoru
  gosterRiskSkoru(sonuc.risk);

  // Koridor onerisi
  gosterKoridorOnerisi(sonuc.koridor);

  // Yakin gozluk numarasi
  gosterYakinGozluk(window._sonRecete);

  // Marka/model onerileri (eski 3-kart sistemi yedek)
  gosterMarkaOnerileri(sonuc.oneriler);

  // Marka bazli tab sistemi
  if (sonuc.markaOneri) {
    gosterMarkaTabliOnerileri(sonuc.markaOneri);
  }

  // Uyarilar
  gosterUyarilar(sonuc.uyarilar);

  // Bilgi notlari (Oblik, Minkwitz vb.)
  gosterBilgiNotlari(sonuc.bilgiNotlari);

  // Cam karsilastirma tablolari
  olusturKarsilastirmaTablolari();

  // Siparis kontrol listesi
  gosterSiparisKontrol(sonuc.siparisBilgileri);

  // Montaj kontrol listesi
  gosterMontajKontrol(sonuc.montajKontrolListesi);

  // Hasta notlari
  gosterHastaNotlari(sonuc.hastaNotlari);

  // Sonuc bolumunu goster
  sonucSection.style.display = "block";
  sonucSection.classList.add("visible");

  // Sonuca scroll
  setTimeout(function() {
    sonucSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 100);
}

function gosterRiskSkoru(risk) {
  var circle = document.getElementById("risk-circle");
  var number = document.getElementById("risk-number");
  var label = document.getElementById("risk-label");
  var desc = document.getElementById("risk-desc");
  var factorsList = document.getElementById("risk-factors-list");

  if (number) number.textContent = risk.skor;

  if (label) {
    label.textContent = risk.seviye.etiket;
    label.style.color = risk.seviye.renk;
  }

  // SVG daire animasyonu
  if (circle) {
    var circumference = 2 * Math.PI * 58; // r=58
    var progress = risk.skor / 10;
    circle.style.strokeDasharray = circumference;
    circle.style.strokeDashoffset = circumference * (1 - progress);
    circle.style.stroke = risk.seviye.renk;
  }

  if (desc) {
    if (risk.skor >= 7) {
      desc.textContent = "Bu recete progresif cam alismayını zorlastiracak unsurlara sahip. Kesinlikle ust seviye kisisel tasarim secilmeli.";
    } else if (risk.skor >= 5) {
      desc.textContent = "Orta duzey zorluk. Kisisel tasarim tercih edilmeli, adaptasyon icin sabir gerekebilir.";
    } else {
      desc.textContent = "Dusuk zorluk. Cogu progresif cam tasarimi ile rahat bir alisma beklenir.";
    }
  }

  // Risk faktorleri listesi
  if (factorsList) {
    factorsList.innerHTML = "";
    risk.detaylar.forEach(function(detay) {
      var li = document.createElement("li");
      li.textContent = detay;
      factorsList.appendChild(li);
    });
    if (risk.detaylar.length === 0) {
      var li = document.createElement("li");
      li.textContent = "Ozel bir risk faktoru bulunmadi.";
      factorsList.appendChild(li);
    }
  }
}

function gosterKoridorOnerisi(koridor) {
  var value = document.getElementById("corridor-value");
  var reason = document.getElementById("corridor-reason");
  var note = document.getElementById("corridor-note");

  if (value) value.textContent = koridor.idealKoridor;
  if (reason) reason.textContent = koridor.koridorAd + " - " + koridor.aciklama;
  if (note) note.textContent = "Minimum odak yuksekligi: " + koridor.minFittingHeight + " mm";
}

// ===== YAKIN GOZLUK NUMARASI =====
function gosterYakinGozluk(recete) {
  // Yakin SPH = Uzak SPH + ADD
  var yakinSphSag = parseFloat(recete.sag.sph || 0) + parseFloat(recete.sag.add || 0);
  var yakinSphSol = parseFloat(recete.sol.sph || 0) + parseFloat(recete.sol.add || 0);
  var yakinCylSag = parseFloat(recete.sag.cyl || 0);
  var yakinCylSol = parseFloat(recete.sol.cyl || 0);
  var yakinAxSag = parseInt(recete.sag.ax || 0);
  var yakinAxSol = parseInt(recete.sol.ax || 0);

  function formatNum(val) {
    var n = parseFloat(val);
    if (isNaN(n)) return "0.00";
    var sign = n >= 0 ? "+" : "";
    return sign + n.toFixed(2);
  }

  var sphSagEl = document.getElementById("yakin_sph_sag");
  var cylSagEl = document.getElementById("yakin_cyl_sag");
  var axSagEl = document.getElementById("yakin_ax_sag");
  var sphSolEl = document.getElementById("yakin_sph_sol");
  var cylSolEl = document.getElementById("yakin_cyl_sol");
  var axSolEl = document.getElementById("yakin_ax_sol");
  var bilgiEl = document.getElementById("yakin-add-bilgi");

  if (sphSagEl) sphSagEl.value = formatNum(yakinSphSag);
  if (cylSagEl) cylSagEl.value = yakinCylSag !== 0 ? formatNum(yakinCylSag) : "";
  if (axSagEl) axSagEl.value = yakinCylSag !== 0 ? yakinAxSag + "\u00B0" : "";
  if (sphSolEl) sphSolEl.value = formatNum(yakinSphSol);
  if (cylSolEl) cylSolEl.value = yakinCylSol !== 0 ? formatNum(yakinCylSol) : "";
  if (axSolEl) axSolEl.value = yakinCylSol !== 0 ? yakinAxSol + "\u00B0" : "";

  if (bilgiEl) {
    var addFarki = Math.abs(parseFloat(recete.sag.add || 0) - parseFloat(recete.sol.add || 0));
    var bilgi = "ADD: Sag +" + parseFloat(recete.sag.add || 0).toFixed(2) + " / Sol +" + parseFloat(recete.sol.add || 0).toFixed(2);
    if (addFarki > 0.001) {
      bilgi += "  (Farkli ADD degerleri!)";
    }
    bilgiEl.textContent = bilgi;
  }

  // Tum alanlari readonly yap (varsayilan)
  [sphSagEl, cylSagEl, axSagEl, sphSolEl, cylSolEl, axSolEl].forEach(function(el) {
    if (el) el.readOnly = true;
  });

  var btn = document.getElementById("yakinDuzenleBtn");
  if (btn) btn.textContent = "Elle Duzenle";
}

function yakinGozlukDuzenle() {
  var alanlar = ["yakin_sph_sag", "yakin_cyl_sag", "yakin_ax_sag", "yakin_sph_sol", "yakin_cyl_sol", "yakin_ax_sol"];
  var ilk = document.getElementById("yakin_sph_sag");
  var btn = document.getElementById("yakinDuzenleBtn");

  if (ilk && ilk.readOnly) {
    // Duzenle moduna gec
    alanlar.forEach(function(id) {
      var el = document.getElementById(id);
      if (el) {
        el.readOnly = false;
        el.style.background = "#fffbe6";
        el.style.borderColor = "#f59e0b";
      }
    });
    if (btn) btn.textContent = "Kilitle";
  } else {
    // Kilitle
    alanlar.forEach(function(id) {
      var el = document.getElementById(id);
      if (el) {
        el.readOnly = true;
        el.style.background = "";
        el.style.borderColor = "";
      }
    });
    if (btn) btn.textContent = "Elle Duzenle";
  }
}

function gosterMarkaOnerileri(oneriler) {
  var tierler = ["premium", "orta", "baslangic"];

  tierler.forEach(function(tier) {
    var card = document.getElementById("rec-card-" + tier);
    if (!card) return;

    var oneri = oneriler[tier];

    if (!oneri) {
      card.style.display = "none";
      return;
    }

    card.style.display = "block";

    var brand = document.getElementById("rec-" + tier + "-brand");
    var model = document.getElementById("rec-" + tier + "-model");
    var badges = document.getElementById("rec-" + tier + "-badges");
    var price = document.getElementById("rec-" + tier + "-price");
    var features = document.getElementById("rec-" + tier + "-features");
    var why = document.getElementById("rec-" + tier + "-why");
    var warning = document.getElementById("rec-" + tier + "-warning");

    if (brand) brand.textContent = oneri.markaAd;
    if (model) model.textContent = oneri.model.ad;

    if (badges) {
      badges.innerHTML =
        '<span class="badge badge--' + oneri.model.seviye + '">' + seviyeEtiketi(oneri.model.seviye) + '</span> ' +
        '<span class="badge badge--design">' + tasarimEtiketi(oneri.model.tasarim) + '</span>';
      if (oneri.uyumGarantisi) {
        badges.innerHTML += ' <span class="badge badge--guarantee">Uyum Garantili</span>';
      }
    }

    if (price) {
      price.textContent = formatFiyatAraligi(oneri.model.fiyatAraligi);
    }

    if (features) {
      features.innerHTML = "";
      // Koridor secenekleri
      if (oneri.model.koridorlar && oneri.model.koridorlar.length > 0) {
        var li = document.createElement("li");
        li.innerHTML = '<svg class="icon icon--sm"><use href="#icon-check"/></svg> Gecis bolgesi secenekleri: ' + oneri.model.koridorlar.join(", ") + ' mm';
        features.appendChild(li);
      }
      // Ozellikler
      var ozellikAdlari = {
        genisMesafe: "Genis uzak gorus alani",
        genisYakin: "Genis yakin gorus alani",
        genisOrta: "Genis ara mesafe (bilgisayar)",
        yuzmeEtkisiAzaltma: "Yuzme etkisi azaltilmis",
        dijitalCihazOptimize: "Dijital cihazlar icin optimize",
        surusOptimize: "Arac kullanimi icin optimize"
      };
      if (oneri.model.ozellikler) {
        Object.keys(ozellikAdlari).forEach(function(key) {
          if (oneri.model.ozellikler[key]) {
            var li = document.createElement("li");
            li.innerHTML = '<svg class="icon icon--sm"><use href="#icon-check"/></svg> ' + ozellikAdlari[key];
            features.appendChild(li);
          }
        });
      }
    }

    if (why) {
      var nedenler = oneri.nedenler.length > 0 ? oneri.nedenler.join(". ") + "." : oneri.model.aciklama;
      why.textContent = nedenler;
    }

    // Kademe-risk uyari mesaji
    if (warning) {
      if (oneri.uyariMesaji) {
        warning.textContent = oneri.uyariMesaji;
        warning.style.display = "block";
      } else {
        warning.style.display = "none";
      }
    }

    // Paket Detaylari doldur
    var detailsContent = document.getElementById("rec-" + tier + "-details");
    var detailsToggle = document.getElementById("rec-" + tier + "-details-toggle");
    if (detailsContent && oneri.siparisBilgileri) {
      // Toggle'i kapat (onceki analizden acik kalmis olabilir)
      detailsContent.classList.remove("open");
      if (detailsToggle) detailsToggle.classList.remove("open");

      var html = "";

      // 1. Cam Hakkinda
      if (oneri.model.aciklama) {
        html += '<div class="detail-block">';
        html += '<div class="detail-block__title">Cam Hakkinda</div>';
        html += '<div class="detail-block__text">' + oneri.model.aciklama + '</div>';
        html += '</div>';
      }

      // 2. Teknolojiler
      if (oneri.model.teknolojiler && oneri.model.teknolojiler.length > 0) {
        html += '<div class="detail-block">';
        html += '<div class="detail-block__title">Teknolojiler</div>';
        html += '<div class="detail-tags">';
        oneri.model.teknolojiler.forEach(function(t) {
          html += '<span class="detail-tag">' + t + '</span>';
        });
        html += '</div></div>';
      }

      // 3. Goruntu Profilleri (varsa)
      if (oneri.model.goruntuProfilleri && oneri.model.goruntuProfilleri.length > 0) {
        html += '<div class="detail-block">';
        html += '<div class="detail-block__title">Goruntu Profilleri</div>';
        html += '<div class="detail-tags">';
        oneri.model.goruntuProfilleri.forEach(function(p) {
          html += '<span class="detail-tag">' + p + '</span>';
        });
        html += '</div></div>';
      }

      // 4. Hedef Kitle
      if (oneri.model.hedefKitle) {
        html += '<div class="detail-block">';
        html += '<div class="detail-block__title">Hedef Kitle</div>';
        html += '<div class="detail-block__text">' + oneri.model.hedefKitle + '</div>';
        html += '</div>';
      }

      // 5. Bu Recete Icin Beklenen Zorluklar
      if (oneri.siparisBilgileri.receteZorluklari && oneri.siparisBilgileri.receteZorluklari.length > 0) {
        html += '<div class="detail-block">';
        html += '<div class="detail-block__title">Bu Recete Icin Beklenen Zorluklar</div>';
        oneri.siparisBilgileri.receteZorluklari.forEach(function(z) {
          html += '<div class="detail-difficulty">\u26A0 ' + z + '</div>';
        });
        html += '</div>';
      }

      // 6. Siparis Parametreleri
      if (oneri.siparisBilgileri.siparisParametreleri && oneri.siparisBilgileri.siparisParametreleri.length > 0) {
        html += '<div class="detail-block">';
        html += '<div class="detail-block__title">Siparis Parametreleri</div>';
        oneri.siparisBilgileri.siparisParametreleri.forEach(function(p) {
          html += '<div class="detail-param">';
          html += '<span class="detail-param__label">' + p.ad + '</span>';
          html += '<span class="detail-param__value">' + p.deger + '</span>';
          html += '</div>';
          if (p.aciklama) {
            html += '<div class="detail-param__note">' + p.aciklama + '</div>';
          }
        });
        html += '</div>';
      }

      // 7. Mevcut Indeks Secenekleri
      if (oneri.model.indeksler && oneri.model.indeksler.length > 0) {
        html += '<div class="detail-block">';
        html += '<div class="detail-block__title">Mevcut Indeks Secenekleri</div>';
        html += '<div class="detail-tags">';
        var onerilenIdx = oneri.siparisBilgileri.onerilenIndeks;
        oneri.model.indeksler.forEach(function(idx) {
          if (idx === onerilenIdx) {
            html += '<span class="detail-tag" style="background:#d1fae5;color:#065f46;font-weight:600;">' + idx + ' \u2713</span>';
          } else {
            html += '<span class="detail-tag">' + idx + '</span>';
          }
        });
        html += '</div></div>';
      }

      detailsContent.innerHTML = html;
    }
  });
}

// ===== MARKA BAZLI TAB SISTEMI =====

function gosterMarkaTabliOnerileri(markaOneri) {
  var tabsContainer = document.getElementById("brand-tabs");
  var selectionsContainer = document.getElementById("brand-selections");
  var allModelsContainer = document.getElementById("brand-all-models");
  if (!tabsContainer || !selectionsContainer || !allModelsContainer) return;

  var markaKeys = Object.keys(markaOneri);
  if (markaKeys.length === 0) return;

  // Marka butonlarini olustur
  tabsContainer.innerHTML = "";
  markaKeys.forEach(function(key, idx) {
    var m = markaOneri[key];
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "brand-tab-btn" + (idx === 0 ? " active" : "");
    btn.innerHTML = m.markaAd + '<span class="brand-tab-count">(' + m.tumModeller.length + ')</span>';
    btn.setAttribute("data-marka", key);
    btn.addEventListener("click", function() {
      // Aktif butonu degistir
      tabsContainer.querySelectorAll(".brand-tab-btn").forEach(function(b) { b.classList.remove("active"); });
      btn.classList.add("active");
      // Icerigi render et
      renderBrandContent(markaOneri[key], key, selectionsContainer, allModelsContainer);
    });
    tabsContainer.appendChild(btn);
  });

  // Ilk markayi render et
  renderBrandContent(markaOneri[markaKeys[0]], markaKeys[0], selectionsContainer, allModelsContainer);
}

function renderBrandContent(markaData, markaKey, selectionsEl, allModelsEl) {
  selectionsEl.innerHTML = "";
  allModelsEl.innerHTML = "";

  var kategoriler = [
    { key: "ekonomik", etiket: "Ekonomik", ikon: "&#128176;" },
    { key: "enIyiSecim", etiket: "En Iyi Secim", ikon: "&#9989;" },
    { key: "alternatif", etiket: "Alternatif", ikon: "&#9889;" },
    { key: "best", etiket: "Best", ikon: "&#127942;" }
  ];

  kategoriler.forEach(function(kat) {
    var secim = markaData.secimler[kat.key];
    var card = document.createElement("div");
    card.className = "brand-card brand-card--" + kat.key;

    if (!secim) {
      card.innerHTML =
        '<div class="brand-card__header brand-card__header--' + kat.key + '">' +
        '<span>' + kat.ikon + '</span> ' + kat.etiket +
        '</div>' +
        '<div class="brand-card__empty">Bu kategoride uygun model yok</div>';
      selectionsEl.appendChild(card);
      return;
    }

    var model = secim.model;
    var seviyeStr = seviyeEtiketi(model.seviye);
    var tasarimStr = tasarimEtiketi(model.tasarim);
    var fiyatStr = formatFiyatAraligi(model.fiyatAraligi);

    // Ozellik listesi
    var featuresHtml = "";
    var ozellikAdlari = {
      genisMesafe: "Genis uzak gorus",
      genisYakin: "Genis yakin alan",
      genisOrta: "Genis ara mesafe",
      yuzmeEtkisiAzaltma: "Yuzme etkisi azaltma",
      dijitalCihazOptimize: "Dijital optimize",
      surusOptimize: "Surus optimize"
    };
    if (model.ozellikler) {
      Object.keys(ozellikAdlari).forEach(function(k) {
        if (model.ozellikler[k]) {
          featuresHtml += '<li><svg class="icon icon--sm"><use href="#icon-check"/></svg> ' + ozellikAdlari[k] + '</li>';
        }
      });
    }
    if (model.koridorlar && model.koridorlar.length > 0) {
      featuresHtml += '<li><svg class="icon icon--sm"><use href="#icon-check"/></svg> Koridor: ' + model.koridorlar.join(", ") + ' mm</li>';
    }

    // Neden secildi
    var nedenStr = secim.nedenler && secim.nedenler.length > 0 ? secim.nedenler.join(". ") + "." : "";

    // Sorun/avantaj blogu
    var issuesHtml = "";
    if ((secim.sorunlar && secim.sorunlar.length > 0) || (secim.avantajlar && secim.avantajlar.length > 0)) {
      var issueId = "issue-" + markaKey + "-" + kat.key;
      issuesHtml += '<div class="brand-card__issues">';
      issuesHtml += '<button type="button" class="brand-issue-toggle" onclick="toggleBrandIssue(\'' + issueId + '\', this)">';
      issuesHtml += '<span>Detayli Analiz</span><span class="chevron">&#9660;</span></button>';
      issuesHtml += '<div class="brand-issue-content" id="' + issueId + '">';
      if (secim.sorunlar) {
        secim.sorunlar.forEach(function(s) {
          issuesHtml += '<div class="issue-item issue-item--sorun">&#9888; ' + s + '</div>';
        });
      }
      if (secim.avantajlar) {
        secim.avantajlar.forEach(function(a) {
          issuesHtml += '<div class="issue-item issue-item--avantaj">&#10003; ' + a + '</div>';
        });
      }
      issuesHtml += '</div></div>';
    }

    card.innerHTML =
      '<div class="brand-card__header brand-card__header--' + kat.key + '">' +
      '<span>' + kat.ikon + '</span> ' + kat.etiket +
      '</div>' +
      '<div class="brand-card__body">' +
      '<div class="brand-card__model-name">' + model.ad + '</div>' +
      '<div class="brand-card__level">' + seviyeStr + ' | ' + tasarimStr + '</div>' +
      (fiyatStr ? '<div class="brand-card__price">' + fiyatStr + '</div>' : '') +
      '<ul class="brand-card__features">' + featuresHtml + '</ul>' +
      (nedenStr ? '<div class="brand-card__why">' + nedenStr + '</div>' : '') +
      issuesHtml +
      '</div>';

    selectionsEl.appendChild(card);
  });

  // Uyum garantisi notu
  if (markaData.uyumGarantisi) {
    var garantiNote = document.createElement("div");
    garantiNote.style.cssText = "margin-top:0.5rem;padding:0.4rem 0.7rem;background:#d1fae5;border-left:3px solid #27ae60;border-radius:4px;font-size:0.78rem;color:#065f46;";
    garantiNote.textContent = "Bu marka uyum garantisi sunuyor — alisma sorununda degisim imkani var.";
    selectionsEl.appendChild(garantiNote);
  }

  // Tum modeller acilir bolumu
  if (markaData.tumModeller && markaData.tumModeller.length > 0) {
    var toggleId = "all-models-" + markaKey;
    var toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.className = "brand-all-toggle";
    toggleBtn.innerHTML = '<span>Tum Modeller (' + markaData.tumModeller.length + ')</span><span class="chevron">&#9660;</span>';
    toggleBtn.addEventListener("click", function() {
      toggleBtn.classList.toggle("open");
      var list = document.getElementById(toggleId);
      if (list) list.classList.toggle("open");
    });
    allModelsEl.appendChild(toggleBtn);

    var listDiv = document.createElement("div");
    listDiv.className = "brand-all-list";
    listDiv.id = toggleId;

    markaData.tumModeller.forEach(function(m) {
      var detailId = "model-detail-" + markaKey + "-" + m.model.id;
      var row = document.createElement("div");
      row.className = "brand-model-row";
      row.innerHTML =
        '<div class="brand-model-row__info">' +
        '<div class="brand-model-row__name">' + m.model.ad + '</div>' +
        '<div class="brand-model-row__level">' + seviyeEtiketi(m.model.seviye) + ' | ' + tasarimEtiketi(m.model.tasarim) + '</div>' +
        '</div>' +
        '<div class="brand-model-row__score">' + m.puan + ' puan</div>' +
        '<button type="button" class="brand-model-row__detail-btn" onclick="toggleModelDetail(\'' + detailId + '\')">Detay</button>';
      listDiv.appendChild(row);

      // Model detay blogu
      var detailDiv = document.createElement("div");
      detailDiv.className = "brand-model-detail";
      detailDiv.id = detailId;

      var detailHtml = "";
      if (m.model.aciklama) {
        detailHtml += '<div style="margin-bottom:0.3rem;">' + m.model.aciklama + '</div>';
      }
      if (m.model.koridorlar && m.model.koridorlar.length > 0) {
        detailHtml += '<div style="margin-bottom:0.2rem;">Koridorlar: ' + m.model.koridorlar.join(", ") + ' mm</div>';
      }
      if (m.model.teknolojiler && m.model.teknolojiler.length > 0) {
        detailHtml += '<div style="margin-bottom:0.2rem;">Teknolojiler: ' + m.model.teknolojiler.join(", ") + '</div>';
      }
      if (m.sorunlar && m.sorunlar.length > 0) {
        m.sorunlar.forEach(function(s) {
          detailHtml += '<div class="issue-item issue-item--sorun">&#9888; ' + s + '</div>';
        });
      }
      if (m.avantajlar && m.avantajlar.length > 0) {
        m.avantajlar.forEach(function(a) {
          detailHtml += '<div class="issue-item issue-item--avantaj">&#10003; ' + a + '</div>';
        });
      }
      detailDiv.innerHTML = detailHtml;
      listDiv.appendChild(detailDiv);
    });

    allModelsEl.appendChild(listDiv);
  }
}

// Toggle yardimci fonksiyonlari
function toggleBrandIssue(id, btn) {
  var el = document.getElementById(id);
  if (!el) return;
  el.classList.toggle("open");
  btn.classList.toggle("open");
}

function toggleModelDetail(id) {
  var el = document.getElementById(id);
  if (!el) return;
  el.classList.toggle("open");
}

function gosterUyarilar(uyarilar) {
  var section = document.getElementById("uyarilar-section");
  var list = document.getElementById("uyarilar-list");
  if (!section || !list) return;

  if (uyarilar.length === 0) {
    section.style.display = "none";
    return;
  }

  section.style.display = "block";
  list.innerHTML = "";

  uyarilar.forEach(function(uyari) {
    var tipSinif = "warning-card--bilgi";
    var tipIkon = "#icon-info";
    if (uyari.tip === "kritik") { tipSinif = "warning-card--kritik"; tipIkon = "#icon-warning"; }
    else if (uyari.tip === "uyari") { tipSinif = "warning-card--uyari"; tipIkon = "#icon-warning"; }

    var div = document.createElement("div");
    div.className = "warning-card " + tipSinif;
    div.innerHTML =
      '<span class="icon"><svg><use href="' + tipIkon + '"/></svg></span>' +
      '<div class="warning-card__text">' +
        '<div class="warning-card__title">' + uyari.mesaj + '</div>' +
        (uyari.oneri ? '<div>' + uyari.oneri + '</div>' : '') +
      '</div>';
    list.appendChild(div);
  });
}

// ===== BILGI NOTLARI (OBLIK, MINKWITZ) =====
function gosterBilgiNotlari(notlar) {
  var section = document.getElementById("bilgi-notlari-section");
  var list = document.getElementById("bilgi-notlari-list");
  if (!section || !list) return;

  if (!notlar || notlar.length === 0) {
    section.style.display = "none";
    return;
  }

  section.style.display = "block";
  list.innerHTML = "";

  notlar.forEach(function(not) {
    var kartDiv = document.createElement("div");
    kartDiv.className = "info-note info-note--" + not.renk;

    var svgHtml = "";
    if (not.svgTip === "aks-dairesi") {
      svgHtml = olusturAksDairesiSvg(not.sagAks, not.solAks);
    } else if (not.svgTip === "minkwitz-grafik") {
      svgHtml = olusturMinkwitzGrafikSvg(not.addDeger, not.koridorDeger, not.gucDegisimHizi);
    } else if (not.svgTip === "prizma-grafik") {
      svgHtml = olusturPrizmaSvg(not.prizmaSag, not.prizmaSol, not.prizmaFark);
    }

    var icerikHtml = "";
    not.icerik.forEach(function(item) {
      icerikHtml +=
        '<div class="info-note__qa">' +
          '<div class="info-note__soru">' + item.soru + '</div>' +
          '<div class="info-note__cevap">' + item.cevap + '</div>' +
        '</div>';
    });

    kartDiv.innerHTML =
      '<div class="info-note__header" onclick="this.parentElement.classList.toggle(\'acik\')">' +
        '<div class="info-note__baslik">' +
          '<span class="info-note__ikon">&#9432;</span>' +
          '<span>' + not.baslik + '</span>' +
        '</div>' +
        '<div class="info-note__degerler">' + not.gozDegerleri + '</div>' +
        '<span class="info-note__chevron">&#9660;</span>' +
      '</div>' +
      '<div class="info-note__body">' +
        (svgHtml ? '<div class="info-note__svg">' + svgHtml + '</div>' : '') +
        '<div class="info-note__icerik">' + icerikHtml + '</div>' +
      '</div>';

    list.appendChild(kartDiv);
  });
}

function olusturAksDairesiSvg(sagAks, solAks) {
  var r = 55;
  var cx = 65;
  var cy = 65;

  function aksArc(aks, renk, etiket) {
    // Oblik bolgeler: 30-60 ve 120-150
    var oblikMi_ = (aks >= 30 && aks <= 60) || (aks >= 120 && aks <= 150);
    var ibreRenk = oblikMi_ ? "#ef4444" : "#22c55e";
    var rad = (90 - aks) * Math.PI / 180;
    var x2 = cx + r * 0.85 * Math.cos(rad);
    var y2 = cy - r * 0.85 * Math.sin(rad);
    return '<line x1="' + cx + '" y1="' + cy + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="' + ibreRenk + '" stroke-width="3" stroke-linecap="round"/>' +
           '<text x="' + (x2 + (x2 > cx ? 5 : -15)).toFixed(1) + '" y="' + (y2 + (y2 > cy ? 12 : -4)).toFixed(1) + '" font-size="9" fill="' + ibreRenk + '" font-weight="700">' + etiket + '</text>';
  }

  // Oblik bolgeleri kirmizi arc olarak goster
  function oblikArc(start, end) {
    var r2 = r - 3;
    var s = (90 - start) * Math.PI / 180;
    var e = (90 - end) * Math.PI / 180;
    var x1 = cx + r2 * Math.cos(s);
    var y1 = cy - r2 * Math.sin(s);
    var x2 = cx + r2 * Math.cos(e);
    var y2 = cy - r2 * Math.sin(e);
    return '<path d="M' + x1.toFixed(1) + ' ' + y1.toFixed(1) + ' A' + r2 + ' ' + r2 + ' 0 0 1 ' + x2.toFixed(1) + ' ' + y2.toFixed(1) + '" fill="none" stroke="#ef4444" stroke-width="6" opacity="0.25"/>';
  }

  var svg = '<svg viewBox="0 0 130 130" width="130" height="130">' +
    '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="#cbd5e1" stroke-width="1.5"/>' +
    // Derece isaretleri
    '<text x="' + cx + '" y="8" text-anchor="middle" font-size="9" fill="#64748b">90\u00b0</text>' +
    '<text x="125" y="' + (cy + 4) + '" text-anchor="end" font-size="9" fill="#64748b">0\u00b0</text>' +
    '<text x="' + cx + '" y="128" text-anchor="middle" font-size="9" fill="#64748b">270\u00b0</text>' +
    '<text x="5" y="' + (cy + 4) + '" font-size="9" fill="#64748b">180\u00b0</text>' +
    // Oblik bolgeler (kirmizi arc)
    oblikArc(30, 60) +
    oblikArc(120, 150) +
    // Oblik etiketleri
    '<text x="105" y="30" font-size="7" fill="#ef4444" font-weight="600">OBL\u0130K</text>' +
    '<text x="5" y="30" font-size="7" fill="#ef4444" font-weight="600">OBL\u0130K</text>' +
    // Aks ibreleri
    aksArc(sagAks, "R:" + sagAks + "\u00b0") +
    aksArc(solAks, "L:" + solAks + "\u00b0") +
    // Merkez nokta
    '<circle cx="' + cx + '" cy="' + cy + '" r="3" fill="#1e3a5f"/>' +
    '</svg>';
  return svg;
}

function olusturMinkwitzGrafikSvg(addDeger, koridor, gdh) {
  var w = 220;
  var h = 100;
  var barH = 20;

  // Guc degisim hizi bar grafigi
  var gdhPct = Math.min(gdh / 0.25, 1) * 160;
  var barRenk = gdh > 0.18 ? "#ef4444" : (gdh > 0.14 ? "#f97316" : "#22c55e");

  // Ideal ve limit cizgileri
  var idealX = (0.14 / 0.25) * 160 + 30;
  var limitX = (0.18 / 0.25) * 160 + 30;

  var svg = '<svg viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '">' +
    // Baslik
    '<text x="5" y="14" font-size="9" fill="#1e3a5f" font-weight="700">Guc Degisim Hizi (D/mm)</text>' +
    // Arka plan bar
    '<rect x="30" y="25" width="160" height="' + barH + '" rx="4" fill="#f1f5f9" stroke="#e2e8f0"/>' +
    // Ideal bolge (yesil)
    '<rect x="30" y="25" width="' + (idealX - 30) + '" height="' + barH + '" rx="4" fill="#dcfce7" opacity="0.5"/>' +
    // Deger bar
    '<rect x="30" y="25" width="' + gdhPct + '" height="' + barH + '" rx="4" fill="' + barRenk + '" opacity="0.7"/>' +
    // Deger yazisi
    '<text x="' + (30 + gdhPct + 4) + '" y="39" font-size="10" fill="' + barRenk + '" font-weight="700">' + gdh.toFixed(3) + '</text>' +
    // Ideal cizgisi
    '<line x1="' + idealX + '" y1="22" x2="' + idealX + '" y2="48" stroke="#22c55e" stroke-width="1.5" stroke-dasharray="3,2"/>' +
    '<text x="' + idealX + '" y="58" text-anchor="middle" font-size="7" fill="#22c55e">0.14 ideal</text>' +
    // Limit cizgisi
    '<line x1="' + limitX + '" y1="22" x2="' + limitX + '" y2="48" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="3,2"/>' +
    '<text x="' + limitX + '" y="58" text-anchor="middle" font-size="7" fill="#ef4444">0.18 limit</text>' +
    // Formul
    '<text x="5" y="80" font-size="8" fill="#64748b">Formul: ADD (' + addDeger.toFixed(2) + ') / Koridor (' + koridor + 'mm) = ' + gdh.toFixed(3) + ' D/mm</text>' +
    '<text x="5" y="93" font-size="8" fill="#64748b">Periferik astigmatizma = 2 x ' + gdh.toFixed(3) + ' = ' + (gdh * 2).toFixed(3) + ' D/mm</text>' +
    '</svg>';
  return svg;
}

function olusturPrizmaSvg(prizmaSag, prizmaSol, prizmaFark) {
  var w = 170;
  var h = 130;
  var barW = 40;
  var maxPrizma = Math.max(prizmaSag, prizmaSol, 3); // Min 3 olcek

  // Bar yukseklikleri (max 70px)
  var sagBarH = Math.min((prizmaSag / maxPrizma) * 70, 70);
  var solBarH = Math.min((prizmaSol / maxPrizma) * 70, 70);

  // Renkler
  var sagRenk = prizmaSag > prizmaSol ? "#ef4444" : "#3b82f6";
  var solRenk = prizmaSol > prizmaSag ? "#ef4444" : "#3b82f6";
  var farkRenk = prizmaFark >= 1.50 ? "#ef4444" : "#f97316";

  // Pozisyonlar
  var baseY = 90;
  var sagX = 25;
  var solX = 95;

  // Referans cizgisi: 1.00 prizma
  var refY = baseY - ((1.00 / maxPrizma) * 70);

  var svg = '<svg viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '">' +
    // Baslik
    '<text x="' + (w / 2) + '" y="14" text-anchor="middle" font-size="9" fill="#1e3a5f" font-weight="700">Prizmatik Etki (\u0394)</text>' +

    // Referans cizgisi (1.00 tolerans)
    '<line x1="15" y1="' + refY + '" x2="' + (w - 15) + '" y2="' + refY + '" stroke="#94a3b8" stroke-width="0.8" stroke-dasharray="4,3"/>' +
    '<text x="' + (w - 12) + '" y="' + (refY + 3) + '" font-size="6" fill="#94a3b8" text-anchor="end">1.0\u0394</text>' +

    // Sag goz bar
    '<rect x="' + sagX + '" y="' + (baseY - sagBarH) + '" width="' + barW + '" height="' + sagBarH + '" rx="4" fill="' + sagRenk + '" opacity="0.75"/>' +
    '<text x="' + (sagX + barW / 2) + '" y="' + (baseY - sagBarH - 4) + '" text-anchor="middle" font-size="10" fill="' + sagRenk + '" font-weight="700">' + prizmaSag.toFixed(2) + '</text>' +
    '<text x="' + (sagX + barW / 2) + '" y="' + (baseY + 12) + '" text-anchor="middle" font-size="8" fill="#475569">Sag</text>' +

    // Sol goz bar
    '<rect x="' + solX + '" y="' + (baseY - solBarH) + '" width="' + barW + '" height="' + solBarH + '" rx="4" fill="' + solRenk + '" opacity="0.75"/>' +
    '<text x="' + (solX + barW / 2) + '" y="' + (baseY - solBarH - 4) + '" text-anchor="middle" font-size="10" fill="' + solRenk + '" font-weight="700">' + prizmaSol.toFixed(2) + '</text>' +
    '<text x="' + (solX + barW / 2) + '" y="' + (baseY + 12) + '" text-anchor="middle" font-size="8" fill="#475569">Sol</text>' +

    // Fark gostergesi (iki bar arasinda ok)
    '<line x1="' + (sagX + barW + 3) + '" y1="' + (baseY - sagBarH / 2) + '" x2="' + (solX - 3) + '" y2="' + (baseY - solBarH / 2) + '" stroke="' + farkRenk + '" stroke-width="1.5" stroke-dasharray="3,2"/>' +
    '<text x="' + ((sagX + barW + solX) / 2) + '" y="' + (baseY - Math.max(sagBarH, solBarH) / 2 - 6) + '" text-anchor="middle" font-size="9" fill="' + farkRenk + '" font-weight="700">\u0394' + prizmaFark.toFixed(2) + '</text>' +

    // Alt formul
    '<text x="' + (w / 2) + '" y="' + (h - 4) + '" text-anchor="middle" font-size="7" fill="#94a3b8">P = mesafe(cm) x guc(D)</text>' +
    '</svg>';

  return svg;
}

// ===== CAM KARSILASTIRMA =====
function olusturKarsilastirmaTablolari() {
  olusturMarkaKarsilastirma();
  olusturOzellikKarsilastirma();
  olusturFiyatKarsilastirma();
  baslatKarsilastirmaTabGecisleri();
}

function olusturMarkaKarsilastirma() {
  var container = document.getElementById("marka-karsilastirma-tablo");
  if (!container || !window.LENS_DATABASE) return;

  var markalar = window.LENS_DATABASE.markalar;
  var markaKeys = Object.keys(markalar).sort(function(a, b) {
    return (markalar[a].oncelik || 99) - (markalar[b].oncelik || 99);
  });

  // En fazla 5 marka goster
  markaKeys = markaKeys.slice(0, 5);

  var thead = '<tr><th>Ozellik</th>';
  markaKeys.forEach(function(key) {
    thead += '<th>' + markalar[key].kisaAd + '</th>';
  });
  thead += '</tr>';

  // Seviye bazli modelleri bul
  var seviyeler = ["premium", "orta", "giris"];
  var seviyeAdlari = { premium: "Premium Model", orta: "Orta Seviye Model", giris: "Giris Seviye Model" };

  var tbody = "";
  seviyeler.forEach(function(seviye) {
    tbody += '<tr><td><strong>' + seviyeAdlari[seviye] + '</strong></td>';
    markaKeys.forEach(function(key) {
      var model = markalar[key].modeller.find(function(m) { return m.seviye === seviye; });
      tbody += '<td>' + (model ? model.ad : '-') + '</td>';
    });
    tbody += '</tr>';
  });

  // Teknoloji sayisi
  tbody += '<tr><td>Toplam Model Sayisi</td>';
  markaKeys.forEach(function(key) {
    tbody += '<td>' + markalar[key].modeller.length + '</td>';
  });
  tbody += '</tr>';

  // Tasarim tipleri
  tbody += '<tr><td>FreeForm Model Sayisi</td>';
  markaKeys.forEach(function(key) {
    var ff = markalar[key].modeller.filter(function(m) { return m.tasarim === "freeform"; }).length;
    tbody += '<td>' + ff + '</td>';
  });
  tbody += '</tr>';

  // Min fitting height
  tbody += '<tr><td>Min Fitting Height</td>';
  markaKeys.forEach(function(key) {
    var mins = markalar[key].modeller.map(function(m) { return m.minFittingHeight || 99; });
    var minFH = Math.min.apply(null, mins);
    tbody += '<td>' + (minFH < 99 ? minFH + 'mm' : '-') + '</td>';
  });
  tbody += '</tr>';

  // Uyum garantisi
  tbody += '<tr><td>Uyum Garantisi</td>';
  markaKeys.forEach(function(key) {
    var garanti = markalar[key].uyumGarantisi;
    tbody += '<td>' + (garanti ? '<span class="kt-badge kt-badge--success">Var</span>' : '<span class="kt-badge kt-badge--danger">Yok</span>') + '</td>';
  });
  tbody += '</tr>';

  container.innerHTML = '<table class="karsilastirma-tablo"><thead>' + thead + '</thead><tbody>' + tbody + '</tbody></table>';
}

function olusturOzellikKarsilastirma() {
  var container = document.getElementById("ozellik-karsilastirma-tablo");
  if (!container || !window.LENS_DATABASE) return;

  var markalar = window.LENS_DATABASE.markalar;
  var ozellikAdlari = {
    yuzmeEtkisiAzaltma: "Yuzme Etkisi Azaltma",
    surusOptimize: "Surus Optimizasyonu",
    dijitalCihazOptimize: "Dijital Cihaz Optimizasyonu",
    genisMesafe: "Genis Mesafe Alani",
    genisYakin: "Genis Yakin Alani",
    genisOrta: "Genis Ara Mesafe Alani"
  };

  var tbody = "";
  Object.keys(ozellikAdlari).forEach(function(ozellikKey) {
    var modeller = [];
    Object.keys(markalar).forEach(function(markaKey) {
      markalar[markaKey].modeller.forEach(function(model) {
        if (model.ozellikler && model.ozellikler[ozellikKey]) {
          modeller.push(markalar[markaKey].kisaAd + " " + model.ad);
        }
      });
    });
    tbody += '<tr>' +
      '<td><strong>' + ozellikAdlari[ozellikKey] + '</strong></td>' +
      '<td>' + (modeller.length > 0 ? modeller.join(', ') : '-') + '</td>' +
      '</tr>';
  });

  container.innerHTML =
    '<table class="karsilastirma-tablo">' +
    '<thead><tr><th>Ozellik</th><th>Bu Ozellige Sahip Modeller</th></tr></thead>' +
    '<tbody>' + tbody + '</tbody>' +
    '</table>';
}

function olusturFiyatKarsilastirma() {
  var container = document.getElementById("fiyat-karsilastirma-tablo");
  if (!container || !window.LENS_DATABASE) return;

  var markalar = window.LENS_DATABASE.markalar;
  var satirlar = [];

  // Tum markalardaki fiyati olan modelleri topla
  Object.keys(markalar).forEach(function(markaKey) {
    var marka = markalar[markaKey];
    marka.modeller.forEach(function(model) {
      if (model.fiyatAraligi && model.fiyatAraligi.min) {
        satirlar.push({
          marka: marka.kisaAd,
          model: model.ad,
          seviye: model.seviye,
          tasarim: model.tasarim,
          minFiyat: model.fiyatAraligi.min,
          maxFiyat: model.fiyatAraligi.max,
          indeksler: model.indeksler || []
        });
      }
    });
  });

  if (satirlar.length === 0) {
    container.innerHTML = '<p style="color:var(--text-light);text-align:center;">Fiyat bilgisi bulunan cam modeli yok.</p>';
    return;
  }

  // Min fiyata gore sirala
  satirlar.sort(function(a, b) { return a.minFiyat - b.minFiyat; });

  var seviyeRenk = {
    premium: "#e8f5e9",
    orta: "#fff8e1",
    baslangic: "#fce4ec",
    giris: "#fce4ec"
  };

  var html = '<table class="karsilastirma-tablo">';
  html += '<thead><tr><th>Marka</th><th>Model</th><th>Seviye</th><th>Tasarim</th><th>Fiyat Araligi (Tek Cam)</th><th>Indeksler</th></tr></thead>';
  html += '<tbody>';

  satirlar.forEach(function(s) {
    var bg = seviyeRenk[s.seviye] || "";
    var seviyeAd = seviyeEtiketi(s.seviye);
    var tasarimAd = tasarimEtiketi(s.tasarim);
    html += '<tr style="background:' + bg + ';">';
    html += '<td>' + s.marka + '</td>';
    html += '<td><strong>' + s.model + '</strong></td>';
    html += '<td>' + seviyeAd + '</td>';
    html += '<td>' + tasarimAd + '</td>';
    html += '<td>' + formatParaTL(s.minFiyat) + ' - ' + formatParaTL(s.maxFiyat) + '</td>';
    html += '<td>' + s.indeksler.join(', ') + '</td>';
    html += '</tr>';
  });

  html += '</tbody></table>';
  html += '<p style="font-size:0.8rem;color:var(--text-muted);margin-top:0.5rem;">* Fiyatlar tek cam icindir. Cift cam icin x2. Bazi markalarin fiyatlari QR kod uzerinden ogrenilir.</p>';
  container.innerHTML = html;
}

function baslatKarsilastirmaTabGecisleri() {
  var tablar = document.querySelectorAll(".karsilastirma-tab");
  var icerikler = document.querySelectorAll(".karsilastirma-icerik");

  tablar.forEach(function(tab) {
    tab.addEventListener("click", function() {
      var hedef = this.getAttribute("data-ktab");

      tablar.forEach(function(t) { t.classList.remove("active"); });
      icerikler.forEach(function(i) { i.classList.remove("active"); });

      this.classList.add("active");
      var hedefIcerik = document.getElementById("ktab-" + hedef);
      if (hedefIcerik) hedefIcerik.classList.add("active");
    });
  });
}

// ===== SIPARIS KONTROL LISTESI =====
function gosterSiparisKontrol(bilgiler) {
  var section = document.getElementById("siparis-kontrol-section");
  if (!section || !bilgiler) return;

  section.style.display = "block";

  // Zorunlu bilgiler
  var zorunluList = document.getElementById("siparis-zorunlu-list");
  if (zorunluList) {
    zorunluList.innerHTML = "<h4 style='color: var(--primary); margin-bottom: 8px; font-size: 0.95rem;'>Zorunlu Siparis Bilgileri</h4>";
    bilgiler.zorunlu.forEach(function(item) {
      var icon = item.durum === "kritik" ? "&#10071;" : "&#10003;";
      var renk = item.durum === "kritik" ? "var(--danger)" : "var(--success)";
      var deger = "";
      if (item.sag !== undefined && item.sol !== undefined) {
        deger = "Sag: " + item.sag + " / Sol: " + item.sol;
      } else if (item.deger !== undefined) {
        deger = item.deger;
      }
      var mesajHtml = item.mesaj ? '<div style="font-size: 0.8rem; color: var(--danger); margin-top: 2px; font-weight: 600;">' + item.mesaj + '</div>' : '';
      var div = document.createElement("div");
      div.style.cssText = "display: flex; align-items: flex-start; gap: 8px; padding: 6px 0; border-bottom: 1px solid var(--border-light);";
      div.innerHTML =
        '<span style="color:' + renk + '; font-weight: bold; min-width: 20px; text-align: center;">' + icon + '</span>' +
        '<div style="flex:1;"><div style="display: flex; justify-content: space-between;"><strong style="font-size: 0.9rem;">' + item.ad + '</strong><span style="font-size: 0.9rem; color: var(--text);">' + deger + '</span></div>' + mesajHtml + '</div>';
      zorunluList.appendChild(div);
    });
  }

  // Onerilen bilgiler (POW)
  var onerilenList = document.getElementById("siparis-onerilen-list");
  if (onerilenList && bilgiler.onerilen.length > 0) {
    onerilenList.innerHTML = "<h4 style='color: var(--warning); margin-bottom: 8px; font-size: 0.95rem;'>Onerilen Olcumler (FreeForm icin)</h4>";
    bilgiler.onerilen.forEach(function(item) {
      var icon = item.durum === "eksik" ? "&#9888;" : "&#10003;";
      var renk = item.durum === "eksik" ? "var(--warning)" : "var(--success)";
      var deger = item.deger || "Olculmedil";
      var mesajHtml = item.mesaj ? '<div style="font-size: 0.8rem; color: var(--warning); margin-top: 2px;">' + item.mesaj + '</div>' : '';
      var div = document.createElement("div");
      div.style.cssText = "display: flex; align-items: flex-start; gap: 8px; padding: 6px 0; border-bottom: 1px solid var(--border-light);";
      div.innerHTML =
        '<span style="color:' + renk + '; font-weight: bold; min-width: 20px; text-align: center;">' + icon + '</span>' +
        '<div style="flex:1;"><div style="display: flex; justify-content: space-between;"><strong style="font-size: 0.9rem;">' + item.ad + '</strong><span style="font-size: 0.9rem; color: var(--text-light);">' + deger + '</span></div>' + mesajHtml + '</div>';
      onerilenList.appendChild(div);
    });
  } else if (onerilenList) {
    onerilenList.innerHTML = "";
  }

  // Firma notu
  var firmaNotuEl = document.getElementById("firma-notu-icerik");
  if (firmaNotuEl) {
    firmaNotuEl.textContent = bilgiler.firmaNotu;
  }

  // Kopyala butonlari
  var btnSiparisKopyala = document.getElementById("btn-siparis-kopyala");
  if (btnSiparisKopyala) {
    btnSiparisKopyala.onclick = function() {
      var metin = "SIPARIS BILGILERI\n";
      metin += "=================\n";
      bilgiler.zorunlu.forEach(function(item) {
        if (item.sag !== undefined) {
          metin += item.ad + ": Sag " + item.sag + " / Sol " + item.sol + "\n";
        } else if (item.deger !== undefined) {
          metin += item.ad + ": " + item.deger + "\n";
        }
      });
      if (bilgiler.onerilen.length > 0) {
        metin += "\nONERILEN OLCUMLER\n";
        bilgiler.onerilen.forEach(function(item) {
          metin += item.ad + ": " + (item.deger || "Olculmedi") + "\n";
        });
      }
      metin += "\nFIRMA NOTU\n";
      metin += bilgiler.firmaNotu;
      navigator.clipboard.writeText(metin).then(function() {
        bildirimGoster("Siparis bilgileri panoya kopyalandi!", "basari");
      });
    };
  }

  var btnFirmaNotuKopyala = document.getElementById("btn-firma-notu-kopyala");
  if (btnFirmaNotuKopyala) {
    btnFirmaNotuKopyala.onclick = function() {
      navigator.clipboard.writeText(bilgiler.firmaNotu).then(function() {
        bildirimGoster("Firma notu panoya kopyalandi!", "basari");
      });
    };
  }
}

// ===== MONTAJ KONTROL LISTESI =====
function gosterMontajKontrol(liste) {
  var section = document.getElementById("montaj-kontrol-section");
  if (!section || !liste) return;

  section.style.display = "block";

  // Toggle
  var toggle = document.getElementById("montaj-toggle");
  var icerik = document.getElementById("montaj-icerik");
  if (toggle && icerik) {
    toggle.onclick = function() {
      var gorunur = icerik.style.display !== "none";
      icerik.style.display = gorunur ? "none" : "block";
      var chevron = toggle.querySelector(".chevron");
      if (chevron) chevron.style.transform = gorunur ? "" : "rotate(180deg)";
    };
  }

  // Ozel uyarilar
  var uyarilarDiv = document.getElementById("montaj-ozel-uyarilar");
  if (uyarilarDiv) {
    uyarilarDiv.innerHTML = "";
    liste.ozelUyarilar.forEach(function(uyari) {
      var div = document.createElement("div");
      div.style.cssText = "background: #fef3cd; border: 1px solid #ffc107; border-radius: var(--radius-sm); padding: 10px 12px; margin-bottom: 8px; font-size: 0.88rem; color: #856404; font-weight: 500;";
      if (uyari.indexOf("DIKKAT") !== -1 || uyari.indexOf("HEMEN") !== -1) {
        div.style.background = "#f8d7da";
        div.style.borderColor = "#f5c6cb";
        div.style.color = "#721c24";
      }
      div.textContent = uyari;
      uyarilarDiv.appendChild(div);
    });
  }

  // Montaj listeleri olustur
  montajListesiDoldur("montaj-oncesi-list", liste.oncesi, "#3498db");
  montajListesiDoldur("montaj-sirasi-list", liste.sirasi, "#e67e22");
  montajListesiDoldur("montaj-sonrasi-list", liste.sonrasi, "#27ae60");
}

function montajListesiDoldur(elementId, items, renk) {
  var ul = document.getElementById(elementId);
  if (!ul) return;
  ul.innerHTML = "";
  items.forEach(function(item, index) {
    var li = document.createElement("li");
    li.style.cssText = "display: flex; align-items: flex-start; gap: 10px; padding: 6px 0; border-bottom: 1px solid var(--border-light); font-size: 0.88rem;";
    li.innerHTML =
      '<span style="background:' + renk + '; color: #fff; border-radius: 50%; min-width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700;">' + (index + 1) + '</span>' +
      '<span style="flex: 1; line-height: 1.4;">' + item + '</span>';
    ul.appendChild(li);
  });
}

function gosterHastaNotlari(notlar) {
  var content = document.getElementById("patient-notes-content");
  if (!content) return;

  content.innerHTML = "";
  notlar.forEach(function(not) {
    var div = document.createElement("div");
    div.className = "patient-note";
    div.innerHTML =
      '<h4 class="patient-note__title">' + not.baslik + '</h4>' +
      '<p class="patient-note__text">' + not.metin + '</p>';
    content.appendChild(div);
  });
}

// ===== HATA GOSTERME =====
function hatalariGoster(hatalar) {
  // Mevcut hatalari temizle
  hatalariTemizle();

  bildirimGoster(hatalar[0], "hata");

  // Analiz butonunun uzerinde hata listesi goster
  var wrapper = document.querySelector(".analyze-wrapper");
  if (wrapper) {
    var hataDiv = document.createElement("div");
    hataDiv.className = "analiz-hata-listesi";
    hataDiv.innerHTML = '<strong>Lutfen kontrol edin:</strong><ul>' +
      hatalar.map(function(h) { return '<li>' + h + '</li>'; }).join('') +
      '</ul>';
    wrapper.insertBefore(hataDiv, wrapper.firstChild);
    // Hataya scroll
    hataDiv.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  // Hata olan alanlari kirmizi isaretle
  hatalar.forEach(function(hata) {
    var altCizgi = hata.toLowerCase();
    var alanIdleri = [];
    if (altCizgi.indexOf("sag goz") !== -1) {
      if (altCizgi.indexOf("sph") !== -1 || altCizgi.indexOf("uzak") !== -1) alanIdleri.push("od_sph");
      if (altCizgi.indexOf("cyl") !== -1 || altCizgi.indexOf("silindir") !== -1) alanIdleri.push("od_cyl");
      if (altCizgi.indexOf("ax") !== -1 || altCizgi.indexOf("derece") !== -1) alanIdleri.push("od_ax");
      if (altCizgi.indexOf("add") !== -1 || altCizgi.indexOf("yakin") !== -1) alanIdleri.push("od_add");
    }
    if (altCizgi.indexOf("sol goz") !== -1) {
      if (altCizgi.indexOf("sph") !== -1 || altCizgi.indexOf("uzak") !== -1) alanIdleri.push("os_sph");
      if (altCizgi.indexOf("cyl") !== -1 || altCizgi.indexOf("silindir") !== -1) alanIdleri.push("os_cyl");
      if (altCizgi.indexOf("ax") !== -1 || altCizgi.indexOf("derece") !== -1) alanIdleri.push("os_ax");
      if (altCizgi.indexOf("add") !== -1 || altCizgi.indexOf("yakin") !== -1) alanIdleri.push("os_add");
    }
    if (altCizgi.indexOf("sag goz mesafesi") !== -1 || altCizgi.indexOf("sag pd") !== -1) alanIdleri.push("pd_sag");
    if (altCizgi.indexOf("sol goz mesafesi") !== -1 || altCizgi.indexOf("sol pd") !== -1) alanIdleri.push("pd_sol");
    if (altCizgi.indexOf("odak yuksekligi") !== -1) alanIdleri.push("fitting_height");
    if (altCizgi.indexOf("cerceve yuksekligi") !== -1) alanIdleri.push("b_measure");

    alanIdleri.forEach(function(id) {
      var el = document.getElementById(id);
      if (el) el.classList.add("input--error");
    });
  });
}

function hatalariTemizle() {
  document.querySelectorAll(".input--error").forEach(function(el) {
    el.classList.remove("input--error");
  });
  // Hata listesini de temizle
  var mevcutHataListesi = document.querySelector(".analiz-hata-listesi");
  if (mevcutHataListesi) mevcutHataListesi.remove();
}

// ===== SONUCLARI METIN OLARAK OLUSTUR (Kopyalama icin) =====
function sonuclariMetneOlustur() {
  if (!window._sonAnaliz) return "Henuz analiz yapilmadi.";

  var s = window._sonAnaliz;
  var r = window._sonRecete;
  var c = window._sonCerceve;
  var satirlar = [];

  satirlar.push("=== KEPEKCI OPTIK - PROGRESIF CAM ANALIZ SONUCU ===");
  satirlar.push("");
  satirlar.push("RECETE:");
  satirlar.push("Sag Goz: SPH " + r.sag.sph + " CYL " + (r.sag.cyl || "0") + " AX " + (r.sag.ax || "-") + " ADD " + r.sag.add);
  satirlar.push("Sol Goz: SPH " + r.sol.sph + " CYL " + (r.sol.cyl || "0") + " AX " + (r.sol.ax || "-") + " ADD " + r.sol.add);
  satirlar.push("Goz Mesafesi: Sag " + r.pdSag + "mm / Sol " + r.pdSol + "mm");
  satirlar.push("Odak Yuksekligi: " + c.fittingHeight + "mm | Cerceve Yuksekligi: " + c.bOlcusu + "mm");
  satirlar.push("");
  satirlar.push("ZORLUK DERECESI: " + s.risk.skor + "/10 (" + s.risk.seviye.etiket + ")");
  satirlar.push("");
  satirlar.push("GECIS BOLGESI ONERISI: " + s.koridor.idealKoridor + "mm");
  satirlar.push(s.koridor.aciklama);
  satirlar.push("");
  satirlar.push("MARKA/MODEL ONERILERI:");
  satirlar.push("");

  var tierEtiketleri = {
    premium: "EN IYI SECIM (Premium)",
    orta: "ALTERNATIF (Orta Seviye)",
    baslangic: "EKONOMIK (Baslangic)"
  };

  ["premium", "orta", "baslangic"].forEach(function(tier) {
    var o = s.oneriler[tier];
    if (!o) return;

    satirlar.push("--- " + tierEtiketleri[tier] + " ---");
    satirlar.push(o.markaAd + " " + o.model.ad + " (" + seviyeEtiketi(o.model.seviye) + ")");
    if (o.model.fiyatAraligi) {
      satirlar.push("   Fiyat: " + formatFiyatAraligi(o.model.fiyatAraligi));
    }
    if (o.model.aciklama) {
      satirlar.push("   Aciklama: " + o.model.aciklama);
    }
    if (o.model.teknolojiler && o.model.teknolojiler.length > 0) {
      satirlar.push("   Teknolojiler: " + o.model.teknolojiler.join(", "));
    }
    if (o.siparisBilgileri) {
      satirlar.push("   Onerilen Koridor: " + o.siparisBilgileri.onerilenKoridor + "mm");
      satirlar.push("   Onerilen Indeks: " + o.siparisBilgileri.onerilenIndeks);
    }
    if (o.nedenler.length > 0) {
      satirlar.push("   Neden: " + o.nedenler.join(", "));
    }
    if (o.uyariMesaji) {
      satirlar.push("   NOT: " + o.uyariMesaji);
    }
    satirlar.push("");
  });

  // Marka bazli detayli oneriler
  if (s.markaOneri) {
    satirlar.push("");
    satirlar.push("==============================");
    satirlar.push("MARKA BAZLI DETAYLI ONERILER:");
    satirlar.push("==============================");

    var katEtiketleri = {
      ekonomik: "Ekonomik",
      enIyiSecim: "En Iyi Secim",
      alternatif: "Alternatif",
      best: "Best (Sorunsuz)"
    };

    Object.keys(s.markaOneri).forEach(function(markaKey) {
      var m = s.markaOneri[markaKey];
      satirlar.push("");
      satirlar.push("=== " + m.markaAd + " ===");
      if (m.uyumGarantisi) satirlar.push("   [Uyum Garantili]");

      ["ekonomik", "enIyiSecim", "alternatif", "best"].forEach(function(kat) {
        var sec = m.secimler[kat];
        if (!sec) return;
        satirlar.push("");
        satirlar.push("  >> " + katEtiketleri[kat] + ": " + sec.model.ad + " (" + seviyeEtiketi(sec.model.seviye) + ")");
        if (sec.model.fiyatAraligi) {
          satirlar.push("     Fiyat: " + formatFiyatAraligi(sec.model.fiyatAraligi));
        }
        if (sec.nedenler && sec.nedenler.length > 0) {
          satirlar.push("     Neden: " + sec.nedenler.join(", "));
        }
        if (sec.sorunlar && sec.sorunlar.length > 0) {
          satirlar.push("     Sorunlar:");
          sec.sorunlar.forEach(function(sr) {
            satirlar.push("       - " + sr);
          });
        }
        if (sec.avantajlar && sec.avantajlar.length > 0) {
          satirlar.push("     Avantajlar:");
          sec.avantajlar.forEach(function(av) {
            satirlar.push("       + " + av);
          });
        }
      });
    });
  }

  if (s.uyarilar.length > 0) {
    satirlar.push("");
    satirlar.push("UYARILAR:");
    s.uyarilar.forEach(function(u) {
      satirlar.push("- " + u.mesaj);
      if (u.oneri) satirlar.push("  Oneri: " + u.oneri);
    });
  }

  satirlar.push("");
  satirlar.push("---");
  satirlar.push("Kepekci Optik - Progresif Cam Oneri Sistemi");

  return satirlar.join("\n");
}

// ===== HASTA TALIMATI SAYFASINI AC =====
function hastaTalimatiAc() {
  if (!window._sonAnaliz) {
    bildirimGoster("Once analiz yapin!", "uyari");
    return;
  }

  var params = new URLSearchParams();
  params.set("risk", window._sonAnaliz.risk.skor);
  params.set("ilk", document.getElementById("ilk_progresif") && document.getElementById("ilk_progresif").checked ? "true" : "false");
  params.set("meslek", document.getElementById("yasam_tarzi") ? document.getElementById("yasam_tarzi").value : "diger");

  // Adaptasyon suresi bilgisi
  var riskSkor = window._sonAnaliz.risk.skor;
  if (riskSkor >= 7) {
    params.set("adaptasyonMin", "14");
    params.set("adaptasyonMax", "28");
  } else if (riskSkor >= 5) {
    params.set("adaptasyonMin", "7");
    params.set("adaptasyonMax", "18");
  } else {
    params.set("adaptasyonMin", "3");
    params.set("adaptasyonMax", "14");
  }

  window.open("hasta-talimati.html?" + params.toString(), "_blank");
}

// ===== LOCALSTORAGE =====
function sonDegerleriKaydet(recete, cerceve, yasamTarzi, ilkKullanim) {
  try {
    var veri = {
      recete: recete,
      cerceve: cerceve,
      yasamTarzi: yasamTarzi,
      ilkKullanim: ilkKullanim,
      tarih: new Date().toISOString()
    };
    localStorage.setItem("kepekci_son_giris", JSON.stringify(veri));
  } catch (e) {
    // localStorage mevcut degilse sessizce gec
  }
}

function sonDegerleriYukle() {
  try {
    var veri = localStorage.getItem("kepekci_son_giris");
    if (!veri) return;

    var obj = JSON.parse(veri);
    if (!obj || !obj.recete) return;

    // 24 saatten eskiyse yukleme
    var tarih = new Date(obj.tarih);
    var simdi = new Date();
    if (simdi - tarih > 24 * 60 * 60 * 1000) return;

    // Sadece cerceve ve yasam tarzi degerlerini yukle (recete her seferinde farkli)
    if (obj.cerceve) {
      setInputValue("fitting_height", obj.cerceve.fittingHeight);
      setInputValue("b_measure", obj.cerceve.bOlcusu);
      setInputValue("a_measure", obj.cerceve.aOlcusu);
    }
    if (obj.yasamTarzi) {
      var yt = document.getElementById("yasam_tarzi");
      if (yt) yt.value = obj.yasamTarzi;
    }
  } catch (e) {
    // Hata durumunda sessizce gec
  }
}

function setInputValue(id, value) {
  if (value === null || value === undefined) return;
  var el = document.getElementById(id);
  if (el) el.value = value;
}

// ===== FOTOGRAFTAN GELEN OLCUMLERI OKU =====
function fotoOlcumParametreleriniOku() {
  var params = new URLSearchParams(window.location.search);
  var kaynak = params.get("kaynak");

  if (kaynak !== "foto" && kaynak !== "kamera") return;

  var pdSag = params.get("pdSag");
  var pdSol = params.get("pdSol");
  var fhSag = params.get("fhSag");
  var fhSol = params.get("fhSol");

  // Degerleri forma yaz
  if (pdSag) setInputValue("pd_sag", pdSag);
  if (pdSol) setInputValue("pd_sol", pdSol);

  // Fitting height: iki gozun ortalamasini al (genellikle ayni veya 1mm fark)
  if (fhSag && fhSol) {
    var fhOrtalama = Math.round((parseFloat(fhSag) + parseFloat(fhSol)) * 2) / 2;
    setInputValue("fitting_height", fhOrtalama);
  } else if (fhSag) {
    setInputValue("fitting_height", fhSag);
  } else if (fhSol) {
    setInputValue("fitting_height", fhSol);
  }

  // Bildirim goster
  var kaynakMesaj = kaynak === "kamera" ? "Kameradan" : "Fotograftan";
  bildirimGoster(kaynakMesaj + " alinan olcumler forma aktarildi! Lutfen degerlerini kontrol edin.", "basarili");

  // URL parametrelerini temizle (sayfayi yeniden yuklemeden)
  if (window.history && window.history.replaceState) {
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}
