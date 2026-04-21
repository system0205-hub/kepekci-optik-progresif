// Kepekci Optik - Progresif Cam Oneri Motoru
// Tum karar mantigi bu dosyadadir. DOM bagimliligi yoktur.

/**
 * ANA FONKSIYON: Tum analizi yapar ve sonuc dondurur
 */
function analizEt(recete, cerceve, yasamTarziId, ilkKullanim, opts) {
  const riskSonuc = hesaplaRiskSkoru(recete, cerceve, ilkKullanim);
  const koridorSonuc = belirleKoridorTipi(cerceve, riskSonuc.skor, recete, ilkKullanim);
  const markaOnerileri = onerMarkalar(riskSonuc.skor, koridorSonuc, yasamTarziId, ilkKullanim, recete, cerceve);
  const uyarilar = kontrolEt(recete, cerceve, koridorSonuc);
  const hastaNotlari = olusturHastaBilgilendirme(riskSonuc.skor, ilkKullanim, recete, yasamTarziId);
  const bilgiNotlari = olusturBilgiNotlari(recete, koridorSonuc, riskSonuc);

  // FAZ 2: Yeni 17 Sifir Hata + 17 Edge Case kurallarinin entegrasyonu
  // recete formatini flat yapiya cevir
  const ctxOpts = opts || {};
  const flatR = {
    sagSph: parseFloat(recete.sag.sph),
    solSph: parseFloat(recete.sol.sph),
    sagCyl: parseFloat(recete.sag.cyl) || 0,
    solCyl: parseFloat(recete.sol.cyl) || 0,
    sagAks: parseFloat(recete.sag.aks),
    solAks: parseFloat(recete.sol.aks),
    sagAdd: parseFloat(recete.sag.add) || 0,
    solAdd: parseFloat(recete.sol.add) || 0,
    monokPdSag: parseFloat(recete.sag.monokPd || recete.monokPdSag),
    monokPdSol: parseFloat(recete.sol.monokPd || recete.monokPdSol)
  };
  // NaN -> null (kontrol fonksiyonlari null'i tolerans olarak yorumlar)
  Object.keys(flatR).forEach(function (k) { if (isNaN(flatR[k])) flatR[k] = null; });

  const flatC = {
    b: parseFloat(cerceve.b) || null,
    koridorMm: koridorSonuc && koridorSonuc.koridor ? koridorSonuc.koridor : (parseFloat(cerceve.koridorMm) || null),
    fhSag: parseFloat(cerceve.fhSag) || null,
    fhSol: parseFloat(cerceve.fhSol) || null,
    pantoskopikAci: parseFloat(cerceve.pantoskopikAci) || null,
    bombeAcisi: parseFloat(cerceve.bombeAcisi) || null,
    verteksMm: parseFloat(cerceve.verteksMm) || null,
    a: parseFloat(cerceve.a) || null,
    dbl: parseFloat(cerceve.dbl) || null
  };

  const fittingIhlaller = kontrolFittingGeometri(flatR, flatC, {
    ilkKullanim: ilkKullanim,
    premiumFreeForm: !!ctxOpts.premiumFreeForm,
    model: ctxOpts.model || null
  });
  const kaplamaIhlaller = kontrolKaplamaUyumu(
    ctxOpts.yasam || {},
    ctxOpts.secilenMateryal || null,
    ctxOpts.secilenKaplama || null
  );
  const kenarUyarilar = kontrolKenarDurumlari(flatR, flatC, {
    yas: ctxOpts.yas || 0,
    ilkKullanim: ilkKullanim
  });

  // Yeni uyarilari mevcut uyarilar dizisine ekle (UI uyumlu format)
  function _seviyeToTip(s) { return s === "zorunlu" ? "kritik" : (s === "uyari" ? "uyari" : "bilgi"); }
  fittingIhlaller.forEach(function (i) {
    uyarilar.push({ tip: _seviyeToTip(i.seviye), kural: i.kural, mesaj: i.mesaj, oneri: i.duzelt, kaynak: "T1-fitting" });
  });
  kaplamaIhlaller.forEach(function (i) {
    uyarilar.push({ tip: _seviyeToTip(i.seviye), kural: i.kural, mesaj: i.mesaj, oneri: i.duzelt, kaynak: "T3-kaplama" });
  });
  kenarUyarilar.forEach(function (u) {
    uyarilar.push({
      tip: _seviyeToTip(u.seviye), kural: u.kural, mesaj: u.mesaj,
      oneri: u.duzelt, onerilenModeller: u.onerilenModeller, kaynak: "T2-edge"
    });
  });

  // 1D: Birlesik risk "DUR" esigi — cok yuksek risk skorlarinda kesin uyari
  if (riskSonuc.skor >= 8) {
    uyarilar.unshift({
      tip: "kritik",
      mesaj: "DUR! Bu recete icin standart progresif KULLANMAYIN. FreeForm kisisel tasarim ZORUNLU.",
      oneri: "Bu zorluk seviyesinde standart cam ile musteri KESINLIKLE sikayet edecektir. Ozel tasarim ile siparis verin."
    });
  }
  if (riskSonuc.skor >= 7 && ilkKullanim) {
    uyarilar.unshift({
      tip: "uyari",
      mesaj: "Yuksek riskli recete + ilk kullanici. Progresif vermeden once doktorla gorusmeyi dusunun.",
      oneri: "Bu zorluk seviyesinde ilk kez progresif kullanan hasta icin uyumsuzluk riski cok yuksek. Doktor ile gorusun."
    });
  }

  const markaOneri = markaBasliOner(riskSonuc.skor, koridorSonuc, yasamTarziId, ilkKullanim, recete, cerceve);

  // siparis edilebilir mi? "kritik/zorunlu" varsa pasif
  const siparisEdilebilir = !uyarilar.some(function (u) { return u.tip === "kritik"; });

  return {
    risk: riskSonuc,
    koridor: koridorSonuc,
    oneriler: markaOnerileri,
    markaOneri: markaOneri,
    uyarilar: uyarilar,
    hastaNotlari: hastaNotlari,
    bilgiNotlari: bilgiNotlari,
    // FAZ 2 yeni alanlar (UI Faz 3'te tuketecek)
    fittingIhlaller: fittingIhlaller,
    kaplamaIhlaller: kaplamaIhlaller,
    kenarUyarilar: kenarUyarilar,
    siparisEdilebilir: siparisEdilebilir
  };
}

/**
 * ADIM 1: Risk Skoru Hesaplama (1-10)
 */
function hesaplaRiskSkoru(recete, cerceve, ilkKullanim) {
  let skor = 0;
  const detaylar = [];

  // Her goz icin recete risklerini hesapla
  ["sag", "sol"].forEach(function(goz) {
    const g = recete[goz];
    const gozAdi = goz === "sag" ? "Sag goz" : "Sol goz";
    const cylAbs = Math.abs(parseFloat(g.cyl) || 0);
    const sphAbs = Math.abs(parseFloat(g.sph) || 0);
    const aks = normalizeAks(g.ax);

    // Yuksek silindir
    if (cylAbs >= 3.00) {
      skor += 3;
      detaylar.push(gozAdi + ": Cok yuksek silindir (" + cylAbs.toFixed(2) + ") - Zorluk +3");
    } else if (cylAbs >= 2.00) {
      skor += 2;
      detaylar.push(gozAdi + ": Yuksek silindir (" + cylAbs.toFixed(2) + ") - Zorluk +2");
    } else if (cylAbs >= 1.50) {
      skor += 1;
      detaylar.push(gozAdi + ": Orta silindir (" + cylAbs.toFixed(2) + ") - Zorluk +1");
    }

    // Oblik aks
    if (cylAbs > 0 && aks !== null) {
      if (oblicMi(aks)) {
        skor += 2;
        detaylar.push(gozAdi + ": Oblik derece (" + aks + "°) - En zor alisma, Zorluk +2");
      } else if (kismenOblicMi(aks)) {
        skor += 1;
        detaylar.push(gozAdi + ": Kismen oblik derece (" + aks + "°) - Zorluk +1");
      }
    }

    // Yuksek uzak numara
    if (sphAbs >= 6.00) {
      skor += 2;
      detaylar.push(gozAdi + ": Cok yuksek uzak numara (" + g.sph + ") - Zorluk +2");
    } else if (sphAbs >= 4.00) {
      skor += 1;
      detaylar.push(gozAdi + ": Yuksek uzak numara (" + g.sph + ") - Zorluk +1");
    }

    // 1A: Esdeger kure (ES) kontrolu — ES = SPH + (CYL / 2)
    // Yuksek ES, tum cam yuzeyinde distorsiyon arttirir
    var sphVal = parseFloat(g.sph) || 0;
    var cylVal = parseFloat(g.cyl) || 0;
    var es = Math.abs(sphVal + (cylVal / 2));
    if (es >= 8.00) {
      skor += 2;
      detaylar.push(gozAdi + ": Cok yuksek esdeger kure (ES " + es.toFixed(2) + "D) - Ozel tasarim sart, Zorluk +2");
    }
  });

  // ADD riski
  const addSag = parseFloat(recete.sag.add) || 0;
  const addSol = parseFloat(recete.sol.add) || 0;
  const addMax = Math.max(addSag, addSol);

  if (addMax >= 3.00) {
    skor += 3;
    detaylar.push("Cok yuksek yakin ilave (ADD " + addMax.toFixed(2) + ") - Zorluk +3");
  } else if (addMax >= 2.50) {
    skor += 2;
    detaylar.push("Yuksek yakin ilave (ADD " + addMax.toFixed(2) + ") - Zorluk +2");
  } else if (addMax >= 2.00) {
    skor += 1;
    detaylar.push("Orta yakin ilave (ADD " + addMax.toFixed(2) + ") - Zorluk +1");
  }

  // Anizometropi (gozler arasi numara farki)
  const sphFark = Math.abs((parseFloat(recete.sag.sph) || 0) - (parseFloat(recete.sol.sph) || 0));
  if (sphFark >= 2.00) {
    skor += 2;
    detaylar.push("Gozler arasi numara farki yuksek (" + sphFark.toFixed(2) + ") - Zorluk +2");
  } else if (sphFark >= 1.00) {
    skor += 1;
    detaylar.push("Gozler arasi numara farki var (" + sphFark.toFixed(2) + ") - Zorluk +1");
  }

  // Diferansiyel prizmatik etki riski (Prentice kurali)
  // Not: Koridor henuz hesaplanmadi, varsayilan 16mm (1.6cm) kullanilir
  var sphSagAbs = Math.abs(parseFloat(recete.sag.sph) || 0);
  var sphSolAbs = Math.abs(parseFloat(recete.sol.sph) || 0);
  var varsayilanKoridorCm = 1.6; // 16mm
  var prizmaFarkTahmini = varsayilanKoridorCm * Math.abs(sphSagAbs - sphSolAbs);

  if (prizmaFarkTahmini >= 2.00) {
    skor += 2;
    detaylar.push("Diferansiyel prizmatik etki yuksek (~" + prizmaFarkTahmini.toFixed(2) + "\u0394 tahmini) - Zorluk +2");
  } else if (prizmaFarkTahmini >= 1.50) {
    skor += 1;
    detaylar.push("Diferansiyel prizmatik etki mevcut (~" + prizmaFarkTahmini.toFixed(2) + "\u0394 tahmini) - Zorluk +1");
  }

  // Cerceve riskleri
  if (cerceve.fittingHeight < 16) {
    skor += 2;
    detaylar.push("Odak yuksekligi cok dusuk (" + cerceve.fittingHeight + "mm) - Zorluk +2");
  } else if (cerceve.fittingHeight < 18) {
    skor += 1;
    detaylar.push("Odak yuksekligi dusuk (" + cerceve.fittingHeight + "mm) - Zorluk +1");
  }

  if (cerceve.bOlcusu < 24) {
    skor += 2;
    detaylar.push("Cerceve yuksekligi cok dusuk (" + cerceve.bOlcusu + "mm) - Zorluk +2");
  } else if (cerceve.bOlcusu < 28) {
    skor += 1;
    detaylar.push("Cerceve yuksekligi dusuk (" + cerceve.bOlcusu + "mm) - Zorluk +1");
  }

  // Ilk kullanim riski
  if (ilkKullanim) {
    skor += 1;
    detaylar.push("Ilk kez progresif cam kullanicisi - Zorluk +1");
  }

  // Normalize: min 1, max 10
  skor = Math.max(1, Math.min(10, skor));

  return {
    skor: skor,
    detaylar: detaylar,
    seviye: riskSeviyesi(skor)
  };
}

/**
 * ADIM 2: Gecis Bolgesi (Koridor) Secimi
 */
function belirleKoridorTipi(cerceve, riskSkoru, recete, ilkKullanim) {
  const fh = cerceve.fittingHeight;
  const b = cerceve.bOlcusu;
  const addMax = Math.max(parseFloat(recete.sag.add) || 0, parseFloat(recete.sol.add) || 0);
  const cylMax = Math.max(Math.abs(parseFloat(recete.sag.cyl) || 0), Math.abs(parseFloat(recete.sol.cyl) || 0));

  let idealKoridor;
  let koridorAd;
  const uyarilar = [];

  // Temel koridor secimi cerceve boyutlarina gore
  if (b >= 32 && fh >= 22) {
    idealKoridor = 18;
    koridorAd = "Uzun Gecis Bolgesi (16-18mm)";
  } else if (b >= 28 && fh >= 18) {
    idealKoridor = 16;
    koridorAd = "Standart Gecis Bolgesi (14-16mm)";
  } else if (b >= 24 && fh >= 16) {
    idealKoridor = 14;
    koridorAd = "Orta Gecis Bolgesi (13-15mm)";
  } else {
    idealKoridor = 13;
    koridorAd = "Kisa Gecis Bolgesi (11-13mm)";
    uyarilar.push("Cerceve cok kucuk, kisa gecis bolgesi zorunlu. Yakin gorus alani sinirli olabilir.");
  }

  // === DIYOPTRI GRUBU ALGILAMA ===
  // Kaynak: Nature Scientific Reports 2017 (PMC5451391), Review of Optometry,
  // MI Education "Corridor Conundrums", OptisyenCOM (TR)
  const sphSag = parseFloat(recete.sag.sph) || 0;
  const sphSol = parseFloat(recete.sol.sph) || 0;
  const sphMax = Math.max(Math.abs(sphSag), Math.abs(sphSol));
  const sphFark = Math.abs(sphSag - sphSol);
  const esSag = Math.abs(sphSag + ((parseFloat(recete.sag.cyl) || 0) / 2));
  const esSol = Math.abs(sphSol + ((parseFloat(recete.sol.cyl) || 0) / 2));
  const esMax = Math.max(esSag, esSol);

  var diopterGrubu;
  if (sphSag > 0 && sphSol > 0) {
    diopterGrubu = "+/+";
  } else if (sphSag < 0 && sphSol < 0) {
    diopterGrubu = "-/-";
  } else if (sphFark >= 1.00 && ((sphSag > 0 && sphSol < 0) || (sphSag < 0 && sphSol > 0))) {
    diopterGrubu = "+/-";
  } else {
    diopterGrubu = "notr";
  }

  // === DIYOPTRI GRUBUNA GORE KORIDOR DUZELTMELERI ===

  if (diopterGrubu === "+/+") {
    // HIPERMETROP GRUBU
    // Klinik kanit: Pozitif numara ile baz-yukari prizma etkisi ciddi.
    // +6.00D recetede 1.5cm koridorda 9 prizma baz-yukari olusur (Review of Optometry).
    // Kisa koridor baz-yukari primayi azaltir, okuma bolgesine erisimi kolaylastirir.
    if (sphMax > 4.00 && addMax < 2.00) {
      idealKoridor = Math.min(idealKoridor, 14);
      koridorAd = "Kisa Gecis Bolgesi (max 14mm) - Yuksek hipermetrop grubu";
      uyarilar.push("+/+ grup: Her iki goz yuksek pozitif (SPH " + sphMax.toFixed(2) + "D). Dik baz egrisi nedeniyle uzun koridor periferik distorsiyonu ciddi artirir. Max 14mm koridor uygulanmistir.");
    } else if (sphMax > 2.00 && addMax < 2.50) {
      idealKoridor = Math.min(idealKoridor, 16);
      koridorAd = "Standart Gecis Bolgesi (max 16mm) - Pozitif numara grubu icin optimize";
      uyarilar.push("+/+ grup: Pozitif numara (SPH " + sphMax.toFixed(2) + "D) ile ADD dusuk (" + addMax.toFixed(2) + "). 16mm koridor yeterli, daha kisa koridor baz-yukari prizma etkisini azaltir.");
    } else if (sphSag > 0 && sphSol > 0 && addMax < 2.50 && idealKoridor >= 18) {
      idealKoridor = 16;
      koridorAd = "Standart Gecis Bolgesi (16mm) - Pozitif numara grubu icin optimize";
      uyarilar.push("+/+ grup: Her iki goz pozitif ve ADD dusuk (" + addMax.toFixed(2) + "). 16mm koridor yeterli.");
    }
    // Minkwitz override: ADD >= 2.50 ise uzun koridor korumali
    if (addMax >= 2.50) {
      uyarilar.push("+/+ grup: ADD yuksek (" + addMax.toFixed(2) + "). Minkwitz teoremi geregi uzun koridor gerekli (pozitif numaraya ragmen). Periferik distorsiyon tolerans edilmelidir. Soft tasarim + cift yuzey onerilir.");
    }

  } else if (diopterGrubu === "-/-") {
    // MIYOP GRUBU
    // Klinik kanit: Miyop hastalar periferik bulanikliga daha toleransli (MI Education).
    // Kucultulmus goruntu nedeniyle periferik bulaniklik daha az fark edilir.
    // Turkce kaynak: "Miyopik receteler icin 2mm kisa koridor secin" (OptisyenCOM).
    if (esMax > 8.00 && addMax < 2.00) {
      var yeniKoridor = idealKoridor - 2;
      if (yeniKoridor >= 11) {
        idealKoridor = yeniKoridor;
        koridorAd = "Kisaltilmis Gecis Bolgesi (" + idealKoridor + "mm) - Yuksek miyop grubu";
        uyarilar.push("-/- grup: Esdeger kure " + esMax.toFixed(2) + "D (yuksek miyop). Hasta periferik bulanikliga zaten alisik, koridor 2mm kisaltildi. Okuma bolgesine hizli erisim saglandi.");
      }
    } else if (sphMax >= 2.00 && sphMax <= 6.00 && addMax < 2.00) {
      var yeniKoridor2 = idealKoridor - 1;
      if (yeniKoridor2 >= 11) {
        idealKoridor = yeniKoridor2;
        koridorAd = "Hafif Kisaltilmis Gecis Bolgesi (" + idealKoridor + "mm) - Miyop grubu";
        uyarilar.push("-/- grup: Orta miyopi (SPH " + sphMax.toFixed(2) + "D). Miyop hastalar kisa koridora daha iyi adapte olur, 1mm kisaltildi.");
      }
    }
    if (addMax >= 2.00 && sphMax >= 4.00) {
      uyarilar.push("-/- grup: Yuksek miyopi + orta/yuksek ADD. Degisken koridor tasarimli cam (FreeForm) kesinlikle onerilir.");
    }

  } else if (diopterGrubu === "+/-") {
    // ANIZOMETROPIK GRUBU
    // Klinik kanit: Diferansiyel prizmatik etki (Review of Optometry).
    // 1-2D fark genellikle sorun yaratmaz ama hassas hastalarda 1.00D'de bile uyum sorunu olabilir.
    var sagOblique = oblicMi(recete.sag.ax);
    var solOblique = oblicMi(recete.sol.ax);
    if ((sagOblique || solOblique) && cylMax >= 1.00) {
      idealKoridor = Math.max(idealKoridor, 16);
      koridorAd = "Uzatilmis Gecis Bolgesi (min 16mm) - Anizometropi + oblik aks";
      uyarilar.push("+/- grup: Oblik aks + silindir (" + cylMax.toFixed(2) + "D) birlesimi. Kayma etkisi nedeniyle minimum 16mm koridor uygulanmistir. FreeForm sart.");
    } else if (cylMax >= 1.50) {
      idealKoridor = Math.max(idealKoridor, 14);
      uyarilar.push("+/- grup: Yuksek silindir (" + cylMax.toFixed(2) + "D) ile minimum 14mm koridor uygulanmistir.");
    }
    if (sphFark >= 3.00) {
      uyarilar.push("DIKKAT: Ciddi anizometropi (" + sphFark.toFixed(2) + "D fark). Uyum sorunu olasiligi YUKSEK. Hasta mutlaka bilgilendirilmeli. Slab-off gerekebilir.");
    } else if (sphFark >= 2.25) {
      uyarilar.push("ONEMLI: Anizometropik recete (" + sphFark.toFixed(2) + "D fark). FreeForm + binokulari harmonizasyon sart.");
    }
    uyarilar.push("+/- grup: Gozler farkli isaret numaraya sahip. Adaptasyon suresi uzayabilir, hasta bilgilendirilmeli.");
  }
  // "notr" grubu: standart kurallar yeterli, ozel duzeltme gerekmez

  // === YUKSEK SILINDIR: Kisa koridordan kacin ===
  if (cylMax >= 2.00 && idealKoridor < 14) {
    idealKoridor = 14;
    koridorAd = "Orta Gecis Bolgesi (14mm) - Yuksek silindir nedeniyle";
    uyarilar.push("Yuksek silindir (" + cylMax.toFixed(2) + ") nedeniyle kisa gecis bolgesi onerilmez. En az 14mm secildi.");
  }

  // === YUKSEK ADD: Minkwitz teoremi — uzun koridor zorunlu ===
  // Peer-reviewed: Periferik astigmatizma = 2 x (ADD / koridor). Yuksek ADD'de kisa koridor MATEMATIKSEL olarak sorun yaratir.
  if (addMax >= 2.50 && idealKoridor < 16) {
    const eski = idealKoridor;
    idealKoridor = Math.min(idealKoridor + 2, 18);
    if (idealKoridor !== eski) {
      koridorAd = "Uzatilmis Gecis Bolgesi (" + idealKoridor + "mm) - Minkwitz: yuksek ADD";
      uyarilar.push("Minkwitz teoremi: ADD " + addMax.toFixed(2) + " icin uzun koridor zorunlu. Kisa koridorda ara bolge genisligi yetersiz kalir. " + idealKoridor + "mm'ye uzatildi.");
    }
  }

  // === ILK KULLANIM: Kisa koridordan kacin ===
  if (ilkKullanim && idealKoridor < 14) {
    idealKoridor = 14;
    uyarilar.push("Ilk kullanici icin kisa gecis bolgesi alismay zorlastirir. En az 14mm secildi.");
  }

  // === ANIZOMETROPI UYARISI (tum gruplar icin) ===
  if (diopterGrubu !== "+/-") {
    // +/- grubunda zaten uyari verildi, tekrar etme
    if (sphFark >= 2.00) {
      var _pFark = (idealKoridor / 10) * sphFark;
      uyarilar.push("ONEMLI: Gozler arasi numara farki yuksek (" + sphFark.toFixed(2) + "D). Prentice kurali: ~" + _pFark.toFixed(2) + "\u0394 prizma farki olusur (" + idealKoridor + "mm koridorda). Kisisel tasarim (FreeForm) onerilir.");
    } else if (sphFark >= 1.00) {
      uyarilar.push("Gozler arasi numara farki mevcut (" + sphFark.toFixed(2) + "D). Montaj hassasiyeti onemli.");
    }
  }

  // === FITTING HEIGHT UYUMLULUK KONTROLU ===
  const okumaAlani = fh - idealKoridor;
  if (okumaAlani < 3) {
    uyarilar.push("UYARI: Odak yuksekligi (" + fh + "mm) - Gecis bolgesi (" + idealKoridor + "mm) = " + okumaAlani + "mm. Yetersiz okuma alani! Daha buyuk cerceve onerilir.");
  } else if (okumaAlani < 5) {
    uyarilar.push("Okuma alani sinirli (" + okumaAlani + "mm). Daha uzun cerceve dusunulebilir.");
  }

  if (fh < idealKoridor) {
    uyarilar.push("KRITIK: Odak yuksekligi (" + fh + "mm) secilen gecis bolgesinden (" + idealKoridor + "mm) kisa! Cerceve degistirilmeli veya daha kisa gecis bolgesi secilmeli.");
  }

  // === MINKWITZ GUC DEGISIM HIZI KONTROLU ===
  // Peer-reviewed formul: Guc degisim hizi = ADD / koridor uzunlugu
  // Ideal aralik: 0.10 - 0.18 D/mm. 0.18 ustu: periferik distorsiyon belirgin artar
  var gucDegisimHizi = 0;
  if (addMax > 0 && idealKoridor > 0) {
    gucDegisimHizi = addMax / idealKoridor;
    if (gucDegisimHizi > 0.18) {
      uyarilar.push("Minkwitz: Guc degisim hizi YUKSEK (" + gucDegisimHizi.toFixed(3) + " D/mm). ADD " + addMax.toFixed(2) + " / " + idealKoridor + "mm. Periferik distorsiyon belirgin, FreeForm + yuzme etkisi azaltma sart.");
    }
  }

  return {
    idealKoridor: idealKoridor,
    koridorAd: koridorAd,
    minFittingHeight: idealKoridor + 4,
    diopterGrubu: diopterGrubu,
    gucDegisimHizi: gucDegisimHizi,
    uyarilar: uyarilar,
    aciklama: koridorAciklamasi(idealKoridor, fh, b, cylMax, addMax, ilkKullanim, recete)
  };
}

function koridorAciklamasi(koridor, fh, b, cylMax, addMax, ilkKullanim, recete) {
  const parcalar = [];
  parcalar.push("Cerceve yuksekligi " + b + "mm ve odak yuksekligi " + fh + "mm degerleri icin " + koridor + "mm gecis bolgesi secildi.");

  if (recete) {
    const sphSag = parseFloat(recete.sag.sph) || 0;
    const sphSol = parseFloat(recete.sol.sph) || 0;
    const sphMax = Math.max(Math.abs(sphSag), Math.abs(sphSol));
    const sphFark = Math.abs(sphSag - sphSol);
    const esSag = Math.abs(sphSag + ((parseFloat(recete.sag.cyl) || 0) / 2));
    const esSol = Math.abs(sphSol + ((parseFloat(recete.sol.cyl) || 0) / 2));
    const esMax = Math.max(esSag, esSol);

    // +/+ grubu aciklamasi
    if (sphSag > 0 && sphSol > 0) {
      if (addMax < 2.50) {
        parcalar.push("Diyoptri grubu: +/+ (hipermetrop). Pozitif numarada dik baz egrisi uzun koridorda daha fazla periferik distorsiyon yaratir. Kisa/orta koridor tercih edildi. Baz-yukari prizma etkisi azaltildi.");
        if (sphMax > 4.00) {
          parcalar.push("SPH " + sphMax.toFixed(2) + "D yuksek hipermetrop oldugundan koridor max 14mm ile sinirlandirildi.");
        }
      } else {
        parcalar.push("Diyoptri grubu: +/+ (hipermetrop). ADD yuksek (" + addMax.toFixed(2) + ") oldugu icin Minkwitz teoremi geregi uzun koridor korundu. Pozitif numara kaynaklı distorsiyon soft tasarim + cift yuzey (dual surfacing) ile minimize edilmelidir.");
      }
    }

    // -/- grubu aciklamasi
    if (sphSag < 0 && sphSol < 0) {
      if (esMax > 8.00) {
        parcalar.push("Diyoptri grubu: -/- (yuksek miyop). Esdeger kure " + esMax.toFixed(2) + "D. Miyop hastalar kucultulmus goruntu nedeniyle periferik bulanikliga zaten alisiktir. Koridor kisaltilarak okuma bolgesine daha hizli erisim saglandi.");
      } else {
        parcalar.push("Diyoptri grubu: -/- (miyop). Miyop hastalar progresif cama genellikle kolay adapte olur. Standart kurallara yakin koridor secildi.");
      }
    }

    // +/- grubu aciklamasi
    if (sphFark >= 1.00 && ((sphSag > 0 && sphSol < 0) || (sphSag < 0 && sphSol > 0))) {
      parcalar.push("Diyoptri grubu: +/- (anizometropik). Gozler farkli isaret numaraya sahip (" + sphFark.toFixed(2) + "D fark). Diferansiyel prizmatik etki nedeniyle binokulari harmonizasyon zorlasir. FreeForm kisisel tasarim kesinlikle onerilir.");
    }

    // Anizometropi aciklamasi (genel)
    if (sphFark >= 1.00) {
      parcalar.push("Gozler arasi " + sphFark.toFixed(2) + "D numara farki mevcut. Montaj hassasiyeti ve kisisel tasarim onemlidir.");
    }
  }

  if (cylMax >= 2.00) {
    parcalar.push("Yuksek silindir (" + cylMax.toFixed(2) + "D) nedeniyle kisa gecis bolgesi onerilmez. Astigmatizma dagılımı icin daha uzun koridor gerekli.");
  }

  if (addMax >= 2.50) {
    parcalar.push("Yuksek yakin ilave (ADD " + addMax.toFixed(2) + ") nedeniyle uzun gecis bolgesi tercih edildi (Minkwitz teoremi).");
  }

  if (ilkKullanim) {
    parcalar.push("Ilk kullanici oldugu icin daha uzun gecis bolgesi alismay kolaylastirir.");
  }

  // Minkwitz guc degisim hizi aciklamasi
  if (addMax > 0 && koridor > 0) {
    var gdh = addMax / koridor;
    var gdhYorum;
    if (gdh > 0.18) {
      gdhYorum = "YUKSEK: Periferik distorsiyon belirgin olacak. FreeForm + yuzme etkisi azaltma kesinlikle gerekli.";
    } else if (gdh > 0.14) {
      gdhYorum = "ORTA: Kabul edilebilir duzey. Standard tasarimlar yeterli olabilir.";
    } else {
      gdhYorum = "DUSUK: Rahat gecis beklenir. Genis ara bolge.";
    }
    parcalar.push("Minkwitz guc degisim hizi: " + gdh.toFixed(3) + " D/mm (ADD " + addMax.toFixed(2) + " / " + koridor + "mm). " + gdhYorum);
  }

  return parcalar.join(" ");
}

/**
 * ADIM 3: Marka/Model Puanlama ve Oneri
 */
function onerMarkalar(riskSkoru, koridorSonuc, yasamTarziId, ilkKullanim, recete, cerceve) {
  const db = window.LENS_DATABASE;
  const tumModeller = [];

  // Tum markalari ve modelleri topla
  Object.keys(db.markalar).forEach(function(markaKey) {
    const marka = db.markalar[markaKey];
    marka.modeller.forEach(function(model) {
      tumModeller.push({
        markaKey: markaKey,
        markaAd: marka.ad,
        markaOncelik: marka.oncelik,
        uyumGarantisi: marka.uyumGarantisi,
        model: model
      });
    });
  });

  // Recete parametreleri
  const addMax = Math.max(parseFloat(recete.sag.add) || 0, parseFloat(recete.sol.add) || 0);
  const cylMax = Math.max(Math.abs(parseFloat(recete.sag.cyl) || 0), Math.abs(parseFloat(recete.sol.cyl) || 0));
  const oblicAks = oblicMi(recete.sag.ax) || oblicMi(recete.sol.ax);

  // Yasam tarzi onceliklerini bul
  const yasamTarzi = db.yasamTarzlari.find(function(yt) { return yt.id === yasamTarziId; }) || db.yasamTarzlari[db.yasamTarzlari.length - 1];

  // Her model icin puan hesapla (ortak fonksiyonu kullan)
  const puanliModeller = tumModeller.map(function(item) {
    var sonuc = puanlaModel(item.model, item, koridorSonuc, yasamTarzi, ilkKullanim, riskSkoru, recete);
    return {
      markaAd: item.markaAd,
      markaKey: item.markaKey,
      model: item.model,
      puan: sonuc.puan,
      nedenler: sonuc.nedenler,
      uyumGarantisi: item.uyumGarantisi
    };
  });

  // Kademeye gore grupla
  var gruplar = { premium: [], orta: [], baslangic: [] };
  puanliModeller.forEach(function(m) {
    var tier = m.model.seviye;
    if (gruplar[tier]) gruplar[tier].push(m);
  });

  // Her grup icinde puana gore sirala, en iyisini sec
  var sonuc = {};
  ["premium", "orta", "baslangic"].forEach(function(tier) {
    var grup = gruplar[tier];
    grup.sort(function(a, b) { return b.puan - a.puan; });

    if (grup.length > 0) {
      sonuc[tier] = grup[0];
      sonuc[tier].uyariMesaji = null;
      // Paket detaylari: siparis bilgileri ekle
      sonuc[tier].siparisBilgileri = {
        onerilenKoridor: koridorSonuc.idealKoridor,
        onerilenIndeks: hesaplaIndeksOnerisi(recete),
        receteZorluklari: receteZorluklariOlustur(riskSkoru, recete, grup[0].model),
        siparisParametreleri: siparisParametreleriOlustur(recete, cerceve, koridorSonuc, grup[0].model)
      };
    } else {
      sonuc[tier] = null;
    }
  });

  // Kademe-risk uyari mesajlari
  if (riskSkoru >= 7) {
    if (sonuc.orta) {
      sonuc.orta.uyariMesaji = "Bu zorluk seviyesi icin ust seviye cam tavsiye edilir, ancak butce kisitliysa orta seviye de kullanilabilir.";
    }
    if (sonuc.baslangic) {
      sonuc.baslangic.uyariMesaji = "Bu zorluk icin baslangic seviyesi ideal degildir. Alisma guc olabilir, ancak butce cok kisitliysa kullanilabilir.";
    }
  } else if (riskSkoru >= 5) {
    if (sonuc.baslangic) {
      sonuc.baslangic.uyariMesaji = "Orta zorluk seviyesinde baslangic cam yeterli olabilir, ancak alisma sureci uzayabilir.";
    }
  }

  return sonuc;
}

/**
 * ORTAK PUANLAMA: Tek bir modeli puanlar
 * onerMarkalar ve markaBasliOner tarafindan kullanilir
 */
function puanlaModel(model, item, koridorSonuc, yasamTarzi, ilkKullanim, riskSkoru, recete) {
  var puan = 0;
  var nedenler = [];
  var addMax = Math.max(parseFloat(recete.sag.add) || 0, parseFloat(recete.sol.add) || 0);
  var cylMax = Math.max(Math.abs(parseFloat(recete.sag.cyl) || 0), Math.abs(parseFloat(recete.sol.cyl) || 0));
  var oblicAks = oblicMi(recete.sag.ax) || oblicMi(recete.sol.ax);

  // 1. Koridor uygunlugu
  var tumKoridorlar = (model.koridorlar && model.koridorlar.length > 0) ? model.koridorlar.slice() : [];
  // Kodak Precise gibi koridorlarShort alani varsa ekle
  if (model.koridorlarShort && model.koridorlarShort.length > 0) {
    model.koridorlarShort.forEach(function(k) {
      if (tumKoridorlar.indexOf(k) === -1) tumKoridorlar.push(k);
    });
  }

  if (tumKoridorlar.length > 0) {
    if (tumKoridorlar.indexOf(koridorSonuc.idealKoridor) !== -1) {
      puan += 15;
      nedenler.push("Onerilen gecis bolgesi (" + koridorSonuc.idealKoridor + "mm) mevcut");
    } else {
      var enYakin = tumKoridorlar.reduce(function(en, k) {
        return Math.abs(k - koridorSonuc.idealKoridor) < Math.abs(en - koridorSonuc.idealKoridor) ? k : en;
      });
      var fark = Math.abs(enYakin - koridorSonuc.idealKoridor);
      if (fark <= 2) { puan += 8; }
      else { puan -= 10; }
    }
  } else {
    // Koridor bilgisi yok (Novax, Visionart) - notr
    puan += 5;
  }

  // 2. Yasam tarzi uygunlugu
  if (yasamTarzi && yasamTarzi.oncelik) {
    Object.keys(yasamTarzi.oncelik).forEach(function(ozellik) {
      if (model.ozellikler && model.ozellikler[ozellik]) {
        var bonus = yasamTarzi.oncelik[ozellik];
        puan += bonus;
        if (bonus >= 8) {
          nedenler.push(yasam_tarzi_aciklama(ozellik));
        }
      }
    });
  }

  // 3. Ilk kullanim bonusu
  if (ilkKullanim) {
    if (model.hedefKitle && model.hedefKitle.toLowerCase().indexOf("ilk") !== -1) {
      puan += 10;
      nedenler.push("Ilk kullananlar icin tasarlanmis");
    }
    if (tumKoridorlar.length > 0) {
      var uzunKoridorVar = tumKoridorlar.some(function(k) { return k >= 16; });
      if (uzunKoridorVar) { puan += 3; }
    }
  }

  // 4. FreeForm zorunlulugu
  if (riskSkoru >= 6) {
    if (model.tasarim === "freeform") {
      puan += 10;
      nedenler.push("Kisisel tasarim (FreeForm) teknolojisi");
    } else {
      puan -= 15;
    }
  }

  // 5. Yuksek CYL + oblik aks
  if (cylMax >= 2.00 && oblicAks) {
    if (model.tasarim === "freeform") {
      puan += 15;
      nedenler.push("Yuksek silindir + oblik derece icin kisisel tasarim sart");
    } else {
      puan -= 20;
    }
  }

  // 6. Yuzme etkisi azaltma
  if (addMax >= 2.50 && model.ozellikler && model.ozellikler.yuzmeEtkisiAzaltma) {
    puan += 10;
    nedenler.push("Yuzme etkisini azaltma ozelligi (yuksek yakin ilave icin onemli)");
  }

  // 7. Uyum garantisi bonusu
  if (riskSkoru >= 6 && item.uyumGarantisi) {
    puan += 5;
    nedenler.push("Marka uyum garantisi sunuyor");
  }

  // 8. Marka onceligi
  puan += (7 - item.markaOncelik) * 0.5;

  return { puan: puan, nedenler: nedenler };
}

/**
 * MODEL SORUN/AVANTAJ ANALIZI: Receteye ozel sorun ve avantaj metinleri uretir
 */
function modelSorunAnalizi(model, recete, koridorSonuc, riskSkoru, yasamTarziId) {
  var sorunlar = [];
  var avantajlar = [];
  var addMax = Math.max(parseFloat(recete.sag.add) || 0, parseFloat(recete.sol.add) || 0);
  var cylMax = Math.max(Math.abs(parseFloat(recete.sag.cyl) || 0), Math.abs(parseFloat(recete.sol.cyl) || 0));
  var oblicAks = oblicMi(recete.sag.ax) || oblicMi(recete.sol.ax);

  // Koridor kontrolu (koridorlarShort dahil)
  var tumKoridorlar = (model.koridorlar && model.koridorlar.length > 0) ? model.koridorlar.slice() : [];
  if (model.koridorlarShort && model.koridorlarShort.length > 0) {
    model.koridorlarShort.forEach(function(k) {
      if (tumKoridorlar.indexOf(k) === -1) tumKoridorlar.push(k);
    });
  }

  // --- SORUNLAR ---

  // 1. Koridor uyumsuzlugu
  if (tumKoridorlar.length > 0 && tumKoridorlar.indexOf(koridorSonuc.idealKoridor) === -1) {
    var enYakin = tumKoridorlar.reduce(function(en, k) {
      return Math.abs(k - koridorSonuc.idealKoridor) < Math.abs(en - koridorSonuc.idealKoridor) ? k : en;
    });
    sorunlar.push("Bu camda ideal " + koridorSonuc.idealKoridor + "mm koridor yok, en yakin " + enYakin + "mm. " +
      (enYakin > koridorSonuc.idealKoridor ? "Daha uzun koridor okuma bolgesini asagiya iter." : "Daha kisa koridor ara bolgeyi daraltabilir."));
  }

  // 2. Yuzme etkisi
  if (addMax >= 2.50 && (!model.ozellikler || !model.ozellikler.yuzmeEtkisiAzaltma)) {
    sorunlar.push("ADD " + addMax.toFixed(2) + " ile yuzme etkisi azaltma ozelligi yok. Kenarlarda distorsiyon ve yuzme hissi belirgin olacak.");
  }

  // 3. FreeForm zorunlulugu
  if (riskSkoru >= 6 && model.tasarim !== "freeform") {
    sorunlar.push("Bu cam FreeForm degil. Risk " + riskSkoru + "/10 olan bu recetede alisma sorunlari BEKLENIR. Standart tasarim bu zorlukta yetersiz kalir.");
  } else if (riskSkoru >= 4 && model.tasarim === "standart") {
    sorunlar.push("Standart tasarim, orta zorlukta bile alisma suresini uzatabilir.");
  }

  // 4. Yasam tarzi uyumsuzlugu
  if (yasamTarziId === "ofis" || yasamTarziId === "muhendis") {
    if (!model.ozellikler || !model.ozellikler.dijitalCihazOptimize) {
      sorunlar.push("Bilgisayar/dijital cihaz yogun kullanim icin optimize edilmemis. 50-70cm mesafede netlik azalabilir.");
    }
  }
  if (yasamTarziId === "sofor") {
    if (!model.ozellikler || !model.ozellikler.surusOptimize) {
      sorunlar.push("Arac kullanimi icin optimize edilmemis. Genis mesafe alani sinirli olabilir, dikiz aynasi gecislerinde bulaniklik yasanabilir.");
    }
  }

  // 5. Genis yakin alan eksikligi
  if (addMax >= 2.00 && (!model.ozellikler || !model.ozellikler.genisYakin)) {
    sorunlar.push("Genis yakin alan ozelligi yok. ADD " + addMax.toFixed(2) + " ile okuma sirasinda gozu camin alt bolgesine tam yonlendirmek gerekir.");
  }

  // 6. Yuksek CYL + standart
  if (cylMax >= 2.00 && model.tasarim !== "freeform") {
    sorunlar.push("Yuksek silindir (" + cylMax.toFixed(2) + "D) ile standart tasarimda periferik distorsiyon belirgin olacak.");
  }

  // 7. Oblik aks + sinirli koridor
  if (oblicAks && cylMax >= 1.50 && tumKoridorlar.length > 0) {
    var uzunKoridor = tumKoridorlar.some(function(k) { return k >= 16; });
    if (!uzunKoridor) {
      sorunlar.push("Oblik aks + silindir " + cylMax.toFixed(2) + "D birlesiminde sinirli koridor secenekleri alisma suresini uzatabilir.");
    }
  }

  // --- AVANTAJLAR ---

  // 1. Yuzme etkisi azaltma
  if (model.ozellikler && model.ozellikler.yuzmeEtkisiAzaltma) {
    if (addMax >= 2.00) {
      avantajlar.push("Yuzme etkisi azaltma sayesinde ADD " + addMax.toFixed(2) + " ile bile kenar distorsiyonu minimumda olacak.");
    } else {
      avantajlar.push("Yuzme etkisi azaltma teknolojisi mevcut — dusuk ADD'de bile ekstra konfor saglar.");
    }
  }

  // 2. FreeForm + yuksek risk
  if (model.tasarim === "freeform" && riskSkoru >= 5) {
    avantajlar.push("FreeForm kisisel tasarim, bu recete icin (risk " + riskSkoru + "/10) en iyi alisma suresini saglar.");
  }

  // 3. Genis koridor secenekleri
  if (tumKoridorlar.length >= 5) {
    avantajlar.push(tumKoridorlar.length + " farkli gecis bolgesi ile cerceve degisikliginde bile uygun koridor secimi mumkun.");
  }

  // 4. Koridor tam uyum
  if (tumKoridorlar.length > 0 && tumKoridorlar.indexOf(koridorSonuc.idealKoridor) !== -1) {
    avantajlar.push("Onerilen " + koridorSonuc.idealKoridor + "mm gecis bolgesi bu camda mevcut — ideal uyum.");
  }

  // 5. Koridor otomatik (Novax, Visionart)
  if (tumKoridorlar.length === 0) {
    avantajlar.push("Koridor secimi cerceve parametrelerine gore otomatik belirlenir — uretici optimizasyonu.");
  }

  // 6. Ozellik bazli avantajlar
  if (model.ozellikler) {
    if (model.ozellikler.dijitalCihazOptimize && (yasamTarziId === "ofis" || yasamTarziId === "muhendis")) {
      avantajlar.push("Dijital cihaz optimizasyonu — bilgisayar ve telefon gecislerinde genis, net ara bolge.");
    }
    if (model.ozellikler.surusOptimize && yasamTarziId === "sofor") {
      avantajlar.push("Surus optimizasyonu — genis mesafe alani ve dikiz aynasi gecislerinde hizli odaklanma.");
    }
    if (model.ozellikler.genisMesafe && model.ozellikler.genisYakin && model.ozellikler.genisOrta) {
      avantajlar.push("Uzak, orta ve yakin mesafede genis gorus alani — tum aktiviteler icin dengeli performans.");
    }
  }

  // 7. Teknoloji avantajlari
  if (model.teknolojiler && model.teknolojiler.length > 0) {
    avantajlar.push("Teknolojiler: " + model.teknolojiler.join(", ") + ".");
  }

  // 8. Uyum garantisi
  // (item seviyesinde kontrol edilir, burada model seviyesi)

  return { sorunlar: sorunlar, avantajlar: avantajlar };
}

/**
 * MARKA BAZLI 4'LU ONERI: Her marka icin ekonomik/en iyi secim/alternatif/best secer
 */
function markaBasliOner(riskSkoru, koridorSonuc, yasamTarziId, ilkKullanim, recete, cerceve) {
  var db = window.LENS_DATABASE;
  var yasamTarzi = db.yasamTarzlari.find(function(yt) { return yt.id === yasamTarziId; }) || db.yasamTarzlari[db.yasamTarzlari.length - 1];
  var sonuc = {};

  Object.keys(db.markalar).forEach(function(markaKey) {
    var marka = db.markalar[markaKey];

    // Her modeli puanla ve sorun/avantaj analizi yap
    var puanliModeller = marka.modeller.map(function(model) {
      var item = {
        markaKey: markaKey,
        markaAd: marka.ad,
        markaOncelik: marka.oncelik,
        uyumGarantisi: marka.uyumGarantisi,
        model: model
      };
      var puanSonuc = puanlaModel(model, item, koridorSonuc, yasamTarzi, ilkKullanim, riskSkoru, recete);
      var analiz = modelSorunAnalizi(model, recete, koridorSonuc, riskSkoru, yasamTarziId);

      return {
        model: model,
        puan: puanSonuc.puan,
        nedenler: puanSonuc.nedenler,
        sorunlar: analiz.sorunlar,
        avantajlar: analiz.avantajlar,
        siparisBilgileri: {
          onerilenKoridor: koridorSonuc.idealKoridor,
          onerilenIndeks: hesaplaIndeksOnerisi(recete),
          receteZorluklari: receteZorluklariOlustur(riskSkoru, recete, model),
          siparisParametreleri: siparisParametreleriOlustur(recete, cerceve, koridorSonuc, model)
        }
      };
    });

    // Puana gore sirala
    puanliModeller.sort(function(a, b) { return b.puan - a.puan; });

    // --- 4 KATEGORI SECIMI ---
    var seviyeSirasi = ["baslangic", "orta", "premium"];

    // Koridor uyumlu mu kontrolu
    function koridorUygunMu(model) {
      var tumK = (model.koridorlar && model.koridorlar.length > 0) ? model.koridorlar.slice() : [];
      if (model.koridorlarShort) model.koridorlarShort.forEach(function(k) { if (tumK.indexOf(k) === -1) tumK.push(k); });
      if (tumK.length === 0) return true; // otomatik koridor
      var enYakin = tumK.reduce(function(en, k) {
        return Math.abs(k - koridorSonuc.idealKoridor) < Math.abs(en - koridorSonuc.idealKoridor) ? k : en;
      });
      return Math.abs(enYakin - koridorSonuc.idealKoridor) <= 2;
    }

    // EKONOMIK: En dusuk seviye, receteyi karsilayabilen
    var ekonomik = null;
    for (var si = 0; si < seviyeSirasi.length && !ekonomik; si++) {
      var seviye = seviyeSirasi[si];
      var adaylar = puanliModeller.filter(function(m) {
        if (m.model.seviye !== seviye) return false;
        if (riskSkoru >= 7 && m.model.tasarim !== "freeform") return false;
        if (!koridorUygunMu(m.model)) return false;
        return true;
      });
      if (adaylar.length > 0) {
        // Fiyat varsa en dusuk fiyatliyi sec
        adaylar.sort(function(a, b) {
          var fa = (a.model.fiyatAraligi && a.model.fiyatAraligi.min) ? a.model.fiyatAraligi.min : 999999;
          var fb = (b.model.fiyatAraligi && b.model.fiyatAraligi.min) ? b.model.fiyatAraligi.min : 999999;
          return fa - fb;
        });
        ekonomik = adaylar[0];
        ekonomik.kategoriNeden = "En uygun fiyatli secenek. " + seviyeEtiketi(seviye) + " seviyede bu receteyi karsilayabilen en ekonomik cam.";
      }
    }

    // BEST: En yuksek puanli, premium oncelikli
    var best = null;
    // ADD >= 2.50 ise yuzmeEtkisiAzaltma olanı tercih et
    var bestAdaylar = puanliModeller.slice();
    if (addMax >= 2.50) {
      var yuzmeOlanlar = bestAdaylar.filter(function(m) {
        return m.model.ozellikler && m.model.ozellikler.yuzmeEtkisiAzaltma;
      });
      if (yuzmeOlanlar.length > 0) bestAdaylar = yuzmeOlanlar;
    }
    // Premium oncelikli
    var premiumBest = bestAdaylar.filter(function(m) { return m.model.seviye === "premium"; });
    if (premiumBest.length > 0) {
      best = premiumBest[0];
    } else {
      best = bestAdaylar[0] || null;
    }
    if (best) {
      best.kategoriNeden = "En yuksek performans. Bunu secerseniz sorunsuz, konforlu bir cam deneyimi beklenir.";
      if (best.model.ozellikler && best.model.ozellikler.yuzmeEtkisiAzaltma && addMax >= 2.00) {
        best.kategoriNeden += " Yuzme etkisi azaltma teknolojisi sayesinde kenar distorsiyonu minimumda.";
      }
    }

    // EN IYI SECIM: Orta seviyede en yuksek puanli (veya non-premium en iyi)
    var addMax = Math.max(parseFloat(recete.sag.add) || 0, parseFloat(recete.sol.add) || 0);
    var enIyiSecim = null;
    var ortaModeller = puanliModeller.filter(function(m) { return m.model.seviye === "orta"; });
    if (ortaModeller.length > 0) {
      // best veya ekonomikle ayni degilse sec
      enIyiSecim = ortaModeller.find(function(m) {
        return (!best || m.model.id !== best.model.id) && (!ekonomik || m.model.id !== ekonomik.model.id);
      }) || ortaModeller[0];
    } else {
      // Orta yoksa en yuksek puanli non-premium, non-ekonomik
      enIyiSecim = puanliModeller.find(function(m) {
        return (!best || m.model.id !== best.model.id) && (!ekonomik || m.model.id !== ekonomik.model.id);
      }) || null;
    }
    if (enIyiSecim) {
      enIyiSecim.kategoriNeden = "Fiyat/performans dengesi en iyi secenek. Bu recete icin yeterli ozelliklere sahip, makul fiyatli cam.";
    }

    // ALTERNATIF: Ikinci en yuksek puanli, farkli seviye tercih
    var alternatif = null;
    var kullanilan = [];
    if (ekonomik) kullanilan.push(ekonomik.model.id);
    if (enIyiSecim) kullanilan.push(enIyiSecim.model.id);
    if (best) kullanilan.push(best.model.id);

    // Farkli seviyeden tercih
    var enIyiSeviye = enIyiSecim ? enIyiSecim.model.seviye : null;
    var farkliSeviye = puanliModeller.filter(function(m) {
      return kullanilan.indexOf(m.model.id) === -1 && m.model.seviye !== enIyiSeviye;
    });
    if (farkliSeviye.length > 0) {
      alternatif = farkliSeviye[0];
    } else {
      // Farkli seviye yoksa herhangi kullanimayan
      alternatif = puanliModeller.find(function(m) {
        return kullanilan.indexOf(m.model.id) === -1;
      }) || null;
    }
    if (alternatif) {
      alternatif.kategoriNeden = "Alternatif secenek. " + seviyeEtiketi(alternatif.model.seviye) + " seviyede farkli bir yaklasim sunar.";
    }

    sonuc[markaKey] = {
      markaAd: marka.ad,
      markaKey: markaKey,
      uyumGarantisi: marka.uyumGarantisi,
      secimler: {
        ekonomik: ekonomik,
        enIyiSecim: enIyiSecim,
        alternatif: alternatif,
        best: best
      },
      tumModeller: puanliModeller
    };
  });

  return sonuc;
}

/**
 * Indeks onerisi hesapla (SPH ve CYL'ye gore)
 */
function hesaplaIndeksOnerisi(recete) {
  // ES (Spherical Equivalent) = SPH + CYL/2 — indeks secimi icin ana metrik (T2)
  var sphSag = parseFloat(recete.sag.sph) || 0;
  var sphSol = parseFloat(recete.sol.sph) || 0;
  var cylSag = parseFloat(recete.sag.cyl) || 0;
  var cylSol = parseFloat(recete.sol.cyl) || 0;
  var esSag = Math.abs(sphSag + cylSag / 2);
  var esSol = Math.abs(sphSol + cylSol / 2);
  var maxES = Math.max(esSag, esSol);
  // Yuksek CYL'de ek upgrade (oblik aks bagimsiz):
  var cylMax = Math.max(Math.abs(cylSag), Math.abs(cylSol));

  if (maxES >= 8.0) return "1.74";       // Plan T2: ±8+ -> 1.74 zorunlu
  if (maxES >= 6.0) return "1.67";       // Plan T2: ±6-8 -> 1.67 zorunlu
  if (maxES >= 4.0) return "1.67";       // Plan T2: ±4-6 -> 1.60 veya 1.67 (kozmetik); 1.67 oneri
  if (maxES >= 3.0) return "1.60";       // Plan T2: ±3-4 -> 1.60
  if (cylMax >= 2.50) return "1.67";     // Yuksek CYL ekstra incelik
  if (cylMax >= 1.50) return "1.60";
  return "1.50";                          // Plan T2: ±0-3 -> 1.50/1.56 (en yuksek Abbe)
}

/**
 * Indeks onerisi aciklamasi (ES merdiveni bazli)
 */
function indeksOneriAciklama(recete) {
  var sphSag = parseFloat(recete.sag.sph) || 0;
  var sphSol = parseFloat(recete.sol.sph) || 0;
  var cylSag = parseFloat(recete.sag.cyl) || 0;
  var cylSol = parseFloat(recete.sol.cyl) || 0;
  var esSag = Math.abs(sphSag + cylSag / 2);
  var esSol = Math.abs(sphSol + cylSol / 2);
  var maxES = Math.max(esSag, esSol);
  var cylMax = Math.max(Math.abs(cylSag), Math.abs(cylSol));

  if (maxES >= 8.0) return "ES " + maxES.toFixed(2) + "D - en ince cam zorunlu (1.74)";
  if (maxES >= 6.0) return "ES " + maxES.toFixed(2) + "D - 1.67 zorunlu";
  if (maxES >= 4.0) return "ES " + maxES.toFixed(2) + "D - 1.67 onerilir, kozmetik icin 1.74";
  if (maxES >= 3.0) return "ES " + maxES.toFixed(2) + "D - 1.60 yeterli";
  if (cylMax >= 2.50) return "Yuksek CYL nedeniyle 1.67 onerilir";
  if (cylMax >= 1.50) return "Orta CYL icin 1.60 yeterli";
  return "Dusuk recete - 1.50 (en yuksek Abbe = en net gorus)";
}

/**
 * Receteye ozel zorluk notlari olustur
 */
function receteZorluklariOlustur(riskSkoru, recete, model) {
  var zorluklar = [];
  var cylSag = Math.abs(parseFloat(recete.sag.cyl) || 0);
  var cylSol = Math.abs(parseFloat(recete.sol.cyl) || 0);
  var cylMax = Math.max(cylSag, cylSol);
  var addMax = Math.max(parseFloat(recete.sag.add) || 0, parseFloat(recete.sol.add) || 0);
  var sphFark = Math.abs((parseFloat(recete.sag.sph) || 0) - (parseFloat(recete.sol.sph) || 0));
  var oblicAks = oblicMi(recete.sag.ax) || oblicMi(recete.sol.ax);

  // 1B: SPH-CYL oran kontrolu — CYL orantisiz yuksekse recete hata olabilir
  var sphSagAbs = Math.abs(parseFloat(recete.sag.sph) || 0);
  var sphSolAbs = Math.abs(parseFloat(recete.sol.sph) || 0);
  var sphCylOransiz = false;
  if (cylSag > 0 && sphSagAbs > 0 && cylSag > sphSagAbs * 3) sphCylOransiz = true;
  if (cylSol > 0 && sphSolAbs > 0 && cylSol > sphSolAbs * 3) sphCylOransiz = true;
  if (sphCylOransiz) {
    zorluklar.push("DIKKAT: Silindir, numara ile orantisiz yuksek. Receteyi tekrar dogrulayin.");
  }

  if (cylMax >= 2.00) {
    zorluklar.push("Yuksek silindir (" + cylMax.toFixed(2) + ") nedeniyle yan taraflarda bulaniklik olabilir");
  }
  if (oblicAks) {
    zorluklar.push("Capraz (oblik) silindir derecesi alismayi zorlastirir, sabir gerektirir");
  }
  if (addMax >= 2.50) {
    zorluklar.push("Yuksek yakin ilave (ADD " + addMax.toFixed(2) + ") nedeniyle gecis bolgesi dar olabilir");
    if (!model.ozellikler || !model.ozellikler.yuzmeEtkisiAzaltma) {
      zorluklar.push("Bu camda yuzme etkisi azaltma ozelligi yok, hafif yuzme etkisi hissedilebilir");
    }
  }
  if (sphFark >= 1.50) {
    zorluklar.push("Gozler arasi numara farki (" + sphFark.toFixed(2) + ") alismayi uzatabilir");
  }
  if (model.tasarim !== "freeform" && riskSkoru >= 5) {
    zorluklar.push("Bu cam FreeForm tasarim degildir, yuksek zorlukta alisma suresi uzayabilir");
  }

  return zorluklar;
}

/**
 * Siparis parametreleri listesi olustur
 */
function siparisParametreleriOlustur(recete, cerceve, koridorSonuc, model) {
  var params = [];
  var onerilenIndeks = hesaplaIndeksOnerisi(recete);

  // Gecis bolgesi
  if (model.koridorlar && model.koridorlar.length > 0) {
    var koridorSecenekleri = model.koridorlar.join(", ") + " mm";
    var idealVar = model.koridorlar.indexOf(koridorSonuc.idealKoridor) !== -1;
    if (idealVar) {
      params.push({ ad: "Gecis Bolgesi", deger: koridorSonuc.idealKoridor + "mm (onerilen)", aciklama: "Secenekler: " + koridorSecenekleri });
    } else {
      var enYakin = model.koridorlar.reduce(function(en, k) {
        return Math.abs(k - koridorSonuc.idealKoridor) < Math.abs(en - koridorSonuc.idealKoridor) ? k : en;
      });
      params.push({ ad: "Gecis Bolgesi", deger: enYakin + "mm (en yakin)", aciklama: "Ideal " + koridorSonuc.idealKoridor + "mm, secenekler: " + koridorSecenekleri });
    }
  } else {
    params.push({ ad: "Gecis Bolgesi", deger: "Otomatik", aciklama: "Marka cerceve parametrelerine gore belirler" });
  }

  // Indeks
  var indeksMevcut = model.indeksler && model.indeksler.indexOf(onerilenIndeks) !== -1;
  if (indeksMevcut) {
    params.push({ ad: "Onerilen Indeks", deger: onerilenIndeks, aciklama: indeksOneriAciklama(recete) });
  } else if (model.indeksler && model.indeksler.length > 0) {
    // En yakin indeksi bul
    var yakIn = model.indeksler[model.indeksler.length - 1]; // En yuksek
    params.push({ ad: "Onerilen Indeks", deger: yakIn + " (en yakin)", aciklama: "Ideal " + onerilenIndeks + " bu modelde yok, mevcut: " + model.indeksler.join(", ") });
  }

  // PD
  params.push({ ad: "Sag PD", deger: recete.pdSag + " mm" });
  params.push({ ad: "Sol PD", deger: recete.pdSol + " mm" });

  // Fitting Height
  params.push({ ad: "Odak Yuksekligi", deger: cerceve.fittingHeight + " mm" });

  // B Olcusu
  params.push({ ad: "Cerceve Yuksekligi (B)", deger: cerceve.bOlcusu + " mm" });

  // A Olcusu (varsa)
  if (cerceve.aOlcusu) {
    params.push({ ad: "Cerceve Genisligi (A)", deger: cerceve.aOlcusu + " mm" });
  }

  return params;
}

function yasam_tarzi_aciklama(ozellik) {
  switch (ozellik) {
    case "dijitalCihazOptimize": return "Bilgisayar/telefon kullanimi icin optimize";
    case "surusOptimize": return "Arac kullanimi icin optimize";
    case "genisMesafe": return "Genis uzak gorus alani";
    case "genisYakin": return "Genis yakin gorus alani";
    case "genisOrta": return "Genis ara mesafe (bilgisayar mesafesi)";
    case "yuzmeEtkisiAzaltma": return "Yuzme etkisi azaltilmis";
    default: return ozellik;
  }
}

/**
 * ADIM 4: Uyari ve Kontrol Sistemi
 */
function kontrolEt(recete, cerceve, koridorSonuc) {
  const uyarilar = [];

  // Cerceve boyut kontrolleri
  if (cerceve.bOlcusu < 22) {
    uyarilar.push({
      tip: "kritik",
      mesaj: "Cerceve yuksekligi 22mm'den kucuk! Progresif cam icin uygun olmayabilir.",
      oneri: "Daha yuksek bir cerceve secilmeli. Minimum 24mm, ideal 28mm+ onerilir."
    });
  }

  if (cerceve.fittingHeight < 14) {
    uyarilar.push({
      tip: "kritik",
      mesaj: "Odak yuksekligi 14mm'den kucuk! Cogu progresif cam tasarimi icin yetersiz.",
      oneri: "Minimum 14mm odak yuksekligi saglayan bir cerceve secilmeli."
    });
  }

  // Fitting height - koridor uyumu
  const fark = cerceve.fittingHeight - koridorSonuc.idealKoridor;
  if (fark < 3 && fark >= 0) {
    uyarilar.push({
      tip: "uyari",
      mesaj: "Okuma alani cok sinirli olacak (sadece " + fark + "mm alan).",
      oneri: "Daha uzun cerceve veya daha kisa gecis bolgesi dusunulmeli."
    });
  }

  // Recete kontrolleri
  const addMax = Math.max(parseFloat(recete.sag.add) || 0, parseFloat(recete.sol.add) || 0);
  const cylMax = Math.max(Math.abs(parseFloat(recete.sag.cyl) || 0), Math.abs(parseFloat(recete.sol.cyl) || 0));

  if (addMax >= 3.00) {
    uyarilar.push({
      tip: "uyari",
      mesaj: "Yuksek yakin ilave (ADD " + addMax.toFixed(2) + "). Alisma suresi uzayabilir.",
      oneri: "Ust seviye kisisel tasarim tercih edilmeli. Hastaya 2-3 hafta alisma sureci hakkinda bilgi verilmeli."
    });
  }

  if (cylMax >= 2.50) {
    uyarilar.push({
      tip: "uyari",
      mesaj: "Yuksek silindir (" + cylMax.toFixed(2) + "). Yan taraflarda bulaniklik artabilir.",
      oneri: "Kisisel tasarim (FreeForm) zorunlu. Standart tasarim kesinlikle onerilmez."
    });
  } else if (cylMax >= 2.00) {
    uyarilar.push({
      tip: "bilgi",
      mesaj: "Orta-yuksek silindir (" + cylMax.toFixed(2) + "). Kisisel tasarim onemle tavsiye edilir.",
      oneri: "FreeForm tasarim ile yan goruste iyilesme saglanir."
    });
  }

  // PD kontrolu
  const pdSag = parseFloat(recete.pdSag) || 0;
  const pdSol = parseFloat(recete.pdSol) || 0;
  if (Math.abs(pdSag - pdSol) >= 3) {
    uyarilar.push({
      tip: "bilgi",
      mesaj: "Sag-sol goz mesafesi farki " + Math.abs(pdSag - pdSol).toFixed(1) + "mm. Asimetrik goz mesafesi.",
      oneri: "Her goz icin ayri ayri goz mesafesi (monokuler PD) ile siparis verilmeli. Binokuleri ikiye bolmeyin."
    });
  }

  // Anizometropi
  const sphFark = Math.abs((parseFloat(recete.sag.sph) || 0) - (parseFloat(recete.sol.sph) || 0));
  if (sphFark >= 2.00) {
    uyarilar.push({
      tip: "uyari",
      mesaj: "Gozler arasi numara farki yuksek (" + sphFark.toFixed(2) + " dioptri). Alisma zorlasabilir.",
      oneri: "Kisisel tasarim tercih edilmeli. Hastaya kademeli alisma onerilmeli."
    });
  }

  // ADD farki
  const addFark = Math.abs((parseFloat(recete.sag.add) || 0) - (parseFloat(recete.sol.add) || 0));
  if (addFark >= 0.50) {
    uyarilar.push({
      tip: "bilgi",
      mesaj: "Sag ve sol goz yakin ilavesi farkli (fark: " + addFark.toFixed(2) + ").",
      oneri: "Doktorla kontrol edilmesi onerilir. Bu durum bazen recete hatasindan kaynaklanabilir."
    });
  }

  // Oblik aks uyarisi
  if (oblicMi(recete.sag.ax) || oblicMi(recete.sol.ax)) {
    uyarilar.push({
      tip: "uyari",
      mesaj: "Oblik (capraz) silindir derecesi mevcut. Bu, alismanin en zor oldugu durumdur.",
      oneri: "Kesinlikle ust seviye kisisel tasarim (FreeForm) secilmeli. Hastaya alisma suresinin uzayabilecegi belirtilmeli."
    });
  }

  // 1C: Oblik aks + yuksek silindir BIRLESIK KRITIK uyari
  // Tek tek kontrol ediliyordu ama ikisi birlikte en kotu senaryo
  var oblikVeYuksekCyl = false;
  ["sag", "sol"].forEach(function(goz) {
    var cylVal = Math.abs(parseFloat(recete[goz].cyl) || 0);
    if (cylVal >= 1.50 && oblicMi(recete[goz].ax)) {
      oblikVeYuksekCyl = true;
    }
  });
  if (oblikVeYuksekCyl) {
    uyarilar.push({
      tip: "kritik",
      mesaj: "KRITIK: Yuksek silindir + oblik aks birlesimi. En zor alisma senaryosu.",
      oneri: "FreeForm kisisel tasarim ZORUNLU. Standart progresif KESINLIKLE kullanmayin. Hastaya uzun alisma sureci (3-4 hafta) anlatilmali."
    });
  }

  // Koridor uyarilarini ekle
  koridorSonuc.uyarilar.forEach(function(u) {
    uyarilar.push({ tip: "uyari", mesaj: u, oneri: "" });
  });

  return uyarilar;
}

/**
 * ADIM 5: Hasta Bilgilendirme Notlari
 */
function olusturHastaBilgilendirme(riskSkoru, ilkKullanim, recete, yasamTarziId) {
  const notlar = [];

  // Alisma suresi
  if (riskSkoru >= 7) {
    notlar.push({ baslik: "Alisma Sureci", metin: "Alisma sureci 2-4 hafta surebilir. Bu sure boyunca sabriniz cok onemlidir. Ilk gunlerde hafif bas donmesi ve bulanti olabilir, bu normaldir ve zamanla gecer." });
  } else if (riskSkoru >= 4) {
    notlar.push({ baslik: "Alisma Sureci", metin: "Alisma sureci yaklasik 1-2 haftadir. Ilk birkac gun hafif rahatsizlik hissedebilirsiniz." });
  } else {
    notlar.push({ baslik: "Alisma Sureci", metin: "Alisma genellikle birkac gun icerisinde tamamlanir." });
  }

  // Ilk kullanim notlari
  if (ilkKullanim) {
    notlar.push({ baslik: "Ilk Kullanim", metin: "Ilk 3 gun gozlugunuzu mutlaka gun boyu takin, cikarmayin. Eski gozlugunuzu kullanmayin. Gozlugunuze ne kadar cok sure verirseniz, o kadar cabuk alisirsiniz." });
  }

  // Genel tavsiyeler
  notlar.push({ baslik: "Uzaga Bakarken", metin: "Basinizi duz tutun, camin ust bolgesinden bakin. Karsiyi rahatca goreceksiniz." });
  notlar.push({ baslik: "Bilgisayar/Telefon", metin: "Ceneyi hafifce kaldirin, camin orta bolgesini kullanin. Ekrani goz hizanizin biraz altinda konumlandirin." });
  notlar.push({ baslik: "Okuma ve Yakin Is", metin: "Gozlerinizi asagi kaydirin, kitabi/telefonu gobeginiz hizasinda tutun. Camin alt bolgesini kullanin." });
  notlar.push({ baslik: "Yanlara Bakarken", metin: "ONEMLI: Gozlerinizi degil, BASINIZI cevirin. Goz ucuyla bakmak bulanikliga neden olur." });
  notlar.push({ baslik: "Merdiven Inerken", metin: "Basinizi hafifce one egin ve asagi bakin. Ayaklarinizi camin alt kismindan degil, basinizi egerek gorun." });

  // Arac kullanimi
  if (yasamTarziId === "sofor" || riskSkoru <= 5) {
    notlar.push({ baslik: "Arac Kullanimi", metin: "Aynalara bakarken basinizi cevirin, goz ucuyla bakmayin. Ilk birkac gun kisa mesafelerde deneyim kazanin." });
  } else {
    notlar.push({ baslik: "Arac Kullanimi", metin: "Ilk 1 hafta uzun yol arac kullanmaktan kacinin. Kisa mesafelerde pratik yapin, alisinca uzun mesafeye gecin." });
  }

  // Yuksek ADD ozel
  const addMax = Math.max(parseFloat(recete.sag.add) || 0, parseFloat(recete.sol.add) || 0);
  if (addMax >= 2.50) {
    notlar.push({ baslik: "Goz Dinlendirme", metin: "Uzun sureli yakin calisma yaptiktan sonra gozleri dinlendirmek icin 20 dakikada bir 20 saniye uzaga bakin (20-20-20 kurali)." });
  }

  // Kenar bulanikligi aciklamasi (Minkwitz teoremi)
  notlar.push({ baslik: "Kenar Bulanikligi", metin: "Progresif camlarin kenarlari DOGASI GEREGI hafif bulaniktir. Bu bir hata DEGILDIR. Gozlerinizi degil, basinizi cevirerek bakarsaniz sorun yasamazsiniz. Zamanla beyin bu alanlari filtrelemeyi ogrenir." });

  // Acil durum (montaj hatasi belirtisi)
  notlar.push({ baslik: "ONEMLI: Acil Durumlar", metin: "Ilk 24-48 saat icinde SIDDETLI bas agrisi, bas donmesi veya mide bulantisi yasarsaniz HEMEN bize geri gelin. Bu normal alisma degil, montaj hatasi belirtisi olabilir." });

  // Ilk kullanim — tum gun takin
  if (ilkKullanim) {
    notlar.push({ baslik: "Surekli Kullanim", metin: "Ilk 1-2 hafta gozlugunuzu TUM GUN takin. Eski gozlugunuze DONMEYIN. Eski gozluge her donuste alisma sureci sifirlanir." });
  }

  // Sorun durumu
  notlar.push({ baslik: "Sorun Yasarsaniz", metin: "3 hafta boyunca duzgun kullanima ragmen hala sorun yasiyorsaniz, lutfen bize gelin. Olcumlerinizi tekrar kontrol edelim." });

  return notlar;
}

/**
 * BOLUM 2: Siparis Bilgileri ve Firma Notu Olusturucu
 * Firmaya gonderilmesi gereken bilgileri listeler ve eksikleri uyarir
 */
function siparisBilgileriOlustur(recete, cerceve, sonuc, powParams) {
  var bilgiler = {
    zorunlu: [],
    onerilen: [],
    firmaNotu: ""
  };

  // Zorunlu siparis bilgileri
  bilgiler.zorunlu.push({
    ad: "SPH",
    sag: recete.sag.sph || "0.00",
    sol: recete.sol.sph || "0.00",
    durum: "tamam"
  });
  bilgiler.zorunlu.push({
    ad: "CYL",
    sag: recete.sag.cyl || "—",
    sol: recete.sol.cyl || "—",
    durum: "tamam"
  });
  bilgiler.zorunlu.push({
    ad: "AX",
    sag: recete.sag.cyl ? (recete.sag.ax || "—") : "—",
    sol: recete.sol.cyl ? (recete.sol.ax || "—") : "—",
    durum: "tamam"
  });
  bilgiler.zorunlu.push({
    ad: "ADD",
    sag: recete.sag.add || "—",
    sol: recete.sol.add || "—",
    durum: "tamam"
  });

  // PD — KRITIK: Firmaya MUTLAKA bildirilmeli
  bilgiler.zorunlu.push({
    ad: "PD (monokuler)",
    sag: recete.pdSag ? (recete.pdSag + " mm") : "EKSIK!",
    sol: recete.pdSol ? (recete.pdSol + " mm") : "EKSIK!",
    durum: "kritik",
    mesaj: "FIRMAYA MUTLAKA BILDIRIN! PD olmadan cam optik merkezi yanlis konumlanir."
  });

  // Fitting Height — KRITIK
  bilgiler.zorunlu.push({
    ad: "Fitting Height",
    deger: cerceve.fittingHeight ? (cerceve.fittingHeight + " mm") : "EKSIK!",
    durum: "kritik",
    mesaj: "FIRMAYA MUTLAKA BILDIRIN! FH olmadan koridor konumu yanlis olur."
  });

  // Koridor
  bilgiler.zorunlu.push({
    ad: "Koridor",
    deger: sonuc.koridor.idealKoridor + " mm",
    durum: "tamam"
  });

  // Cam Indeksi
  var onerilenIndeks = hesaplaIndeksOnerisi(recete);
  bilgiler.zorunlu.push({
    ad: "Cam Indeksi",
    deger: onerilenIndeks,
    durum: "tamam"
  });

  // POW parametreleri — FreeForm onerildiginde onemli
  // Risk >= 5 ise FreeForm onerisi zaten verilmektedir
  var freeformOnerili = sonuc.risk.skor >= 5;
  // Oneriler objesinde freeform tasarim var mi kontrol et
  if (!freeformOnerili && sonuc.oneriler) {
    Object.keys(sonuc.oneriler).forEach(function(key) {
      var grup = sonuc.oneriler[key];
      if (Array.isArray(grup)) {
        grup.forEach(function(model) {
          if (model.tasarim === "freeform") freeformOnerili = true;
        });
      }
    });
  }

  if (freeformOnerili) {
    if (!powParams || !powParams.vertex) {
      bilgiler.onerilen.push({ ad: "Vertex Mesafesi", durum: "eksik", mesaj: "FreeForm cam icin vertex mesafesi olculmeli (normal: 12-14mm)" });
    } else {
      bilgiler.onerilen.push({ ad: "Vertex Mesafesi", deger: powParams.vertex + " mm", durum: "tamam" });
    }
    if (!powParams || !powParams.pantoskopik) {
      bilgiler.onerilen.push({ ad: "Pantoskopik Egim", durum: "eksik", mesaj: "FreeForm cam icin pantoskopik egim olculmeli (ideal: 8-12°)" });
    } else {
      bilgiler.onerilen.push({ ad: "Pantoskopik Egim", deger: powParams.pantoskopik + "°", durum: "tamam" });
    }
    if (!powParams || !powParams.wrap) {
      bilgiler.onerilen.push({ ad: "Yuz Sarma Acisi", durum: "eksik", mesaj: "FreeForm cam icin yuz sarma acisi olculmeli (>10° sorun yaratabilir)" });
    } else {
      bilgiler.onerilen.push({ ad: "Yuz Sarma Acisi", deger: powParams.wrap + "°", durum: "tamam" });
    }
  }

  // Firma notu olustur
  bilgiler.firmaNotu = firmaNotuOlustur(recete, cerceve, sonuc, powParams);

  return bilgiler;
}

/**
 * Firmaya gonderilecek otomatik siparis notu olusturur
 */
function firmaNotuOlustur(recete, cerceve, sonuc, powParams) {
  var satirlar = [];

  // Recete ozeti
  var sphSag = recete.sag.sph || "0.00";
  var sphSol = recete.sol.sph || "0.00";
  var cylSag = recete.sag.cyl ? recete.sag.cyl : "—";
  var cylSol = recete.sol.cyl ? recete.sol.cyl : "—";
  var axSag = recete.sag.cyl ? (recete.sag.ax || "—") : "—";
  var axSol = recete.sol.cyl ? (recete.sol.ax || "—") : "—";
  var addSag = recete.sag.add || "—";
  var addSol = recete.sol.add || "—";

  satirlar.push("SPH: " + sphSag + " / " + sphSol + " | CYL: " + cylSag + " / " + cylSol + " | AX: " + axSag + " / " + axSol + " | ADD: " + addSag + " / " + addSol);
  satirlar.push("PD: " + (recete.pdSag || "?") + " / " + (recete.pdSol || "?") + " (monokuler) | FH: " + (cerceve.fittingHeight || "?") + "mm | Koridor: " + sonuc.koridor.idealKoridor + "mm | Indeks: " + hesaplaIndeksOnerisi(recete));

  // Ozel notlar
  var notlar = [];

  // Anizometropi varsa
  var sphFark = Math.abs((parseFloat(recete.sag.sph) || 0) - (parseFloat(recete.sol.sph) || 0));
  if (sphFark >= 1.00) {
    notlar.push("Anizometropi mevcut (" + sphFark.toFixed(2) + "D). Monokuler PD'ye gore merkezleyin.");
  }

  // Oblik aks varsa
  if (oblicMi(recete.sag.ax) || oblicMi(recete.sol.ax)) {
    notlar.push("Oblik aks mevcut. Cam rotasyonuna dikkat.");
  }

  // Yuksek silindir
  var cylMax = Math.max(Math.abs(parseFloat(recete.sag.cyl) || 0), Math.abs(parseFloat(recete.sol.cyl) || 0));
  if (cylMax >= 2.00) {
    notlar.push("Yuksek silindir (" + cylMax.toFixed(2) + "D). Aks hassasiyeti kritik.");
  }

  // POW parametreleri
  if (powParams) {
    var powNotlar = [];
    if (powParams.vertex) powNotlar.push("VD: " + powParams.vertex + "mm");
    if (powParams.pantoskopik) powNotlar.push("PT: " + powParams.pantoskopik + "°");
    if (powParams.wrap) powNotlar.push("Wrap: " + powParams.wrap + "°");
    if (powNotlar.length > 0) {
      satirlar.push("POW: " + powNotlar.join(" | "));
    }
  }

  if (notlar.length > 0) {
    satirlar.push("NOT: " + notlar.join(" "));
  }

  return satirlar.join("\n");
}

/**
 * BOLUM 3: Montaj Kontrol Listesi Olusturucu
 * Receteye OZEL montaj kontrol listesi
 */
function montajKontrolListesiOlustur(recete, cerceve, sonuc, ilkKullanim) {
  var liste = {
    oncesi: [
      "Cerceveyi ONCE ayarlayin (burun mesnetleri, kulak kancalari)",
      "Cam uzerindeki + isaretini kontrol edin (isaret silinmemis olmali)",
      "FH: " + (cerceve.fittingHeight || "?") + "mm — gozbebegi merkezinden cerceve alt kenarina olcun",
      "PD: Sag " + (recete.pdSag || "?") + " / Sol " + (recete.pdSol || "?") + " — + isaretini pupil merkeziyle hizalayin"
    ],
    sirasi: [
      "Cam donmemis mi kontrol edin (+ isareti yatay hizada olmali)",
      "Sag-sol cam karismamis mi kontrol edin (N harfi burun tarafinda olmali)",
      "Kesim sonrasi cam cerceveye siki oturuyor mu (bosluk yok, sikmis da degil)"
    ],
    sonrasi: [
      "Musteri gozlugu taktiktan sonra UZAGI net goruyor mu? (duz bakis, camin ust bolumu)",
      "Hafif asagi bakinca bilgisayar/telefon net mi? (ara mesafe, camin orta bolumu)",
      "Asagi bakinca yakini net goruyor mu? (okuma, camin alt bolumu)",
      "Kenarlardan hafif bulaniklik NORMAL — musteriye aciklayin (Minkwitz teoremi)"
    ],
    ozelUyarilar: []
  };

  // Receteye ozel uyarilar
  var cylMax = Math.max(Math.abs(parseFloat(recete.sag.cyl) || 0), Math.abs(parseFloat(recete.sol.cyl) || 0));
  if (cylMax >= 1.50) {
    liste.ozelUyarilar.push("DIKKAT: Yuksek silindir (" + cylMax.toFixed(2) + "D). Cam KESINLIKLE donmemeli! Aks yonu cok hassas.");
  }

  var sphFark = Math.abs((parseFloat(recete.sag.sph) || 0) - (parseFloat(recete.sol.sph) || 0));
  if (sphFark >= 1.00) {
    liste.ozelUyarilar.push("Iki goz arasinda " + sphFark.toFixed(2) + "D numara farki var. Montaj hassasiyeti kritik — PD'yi mutlaka monokuler olcun.");
  }

  if (ilkKullanim) {
    liste.ozelUyarilar.push("Ilk kullanici: 3-4 hafta alisma suresi. Ilk 1-2 hafta tum gun takmasi gerekir.");
    liste.ozelUyarilar.push("Ilk 24-48 saat icinde siddetli bas agrisi/bas donmesi = montaj hatasi olabilir, HEMEN geri gelsin.");
  }

  // Yuksek ADD
  var addMax = Math.max(parseFloat(recete.sag.add) || 0, parseFloat(recete.sol.add) || 0);
  if (addMax >= 2.50) {
    liste.ozelUyarilar.push("Yuksek ADD (" + addMax.toFixed(2) + "D). Yakin bolgesi dar olacak — okuma testi mutlaka yapin.");
  }

  // Oblik aks
  if (oblicMi(recete.sag.ax) || oblicMi(recete.sol.ax)) {
    liste.ozelUyarilar.push("Oblik aks mevcut. Cam kesimi ve montajda aks yonune ekstra dikkat edin.");
  }

  return liste;
}

/**
 * BILGI NOTLARI: Oblik, Minkwitz vb. egitici aciklamalar
 */
function olusturBilgiNotlari(recete, koridorSonuc, riskSonuc) {
  var notlar = [];

  // --- OBLIK ASTIGMATIZMA NOTU ---
  var sagOblik = oblicMi(recete.sag.ax);
  var solOblik = oblicMi(recete.sol.ax);
  var sagKismenOblik = kismenOblicMi(recete.sag.ax);
  var solKismenOblik = kismenOblicMi(recete.sol.ax);

  if (sagOblik || solOblik) {
    var oblikGozler = [];
    if (sagOblik) oblikGozler.push("Sag goz: " + recete.sag.ax + "\u00b0");
    if (solOblik) oblikGozler.push("Sol goz: " + recete.sol.ax + "\u00b0");

    var cylMax = Math.max(Math.abs(parseFloat(recete.sag.cyl) || 0), Math.abs(parseFloat(recete.sol.cyl) || 0));

    notlar.push({
      id: "oblik",
      baslik: "Oblik (Capraz) Astigmatizma Nedir?",
      ikon: "warning",
      renk: cylMax >= 1.50 ? "kritik" : "uyari",
      gozDegerleri: oblikGozler.join(" | "),
      icerik: [
        {
          soru: "Oblik astigmatizma ne demektir?",
          cevap: "Goz astigmatizmasinin ekseni 30\u00b0-60\u00b0 veya 120\u00b0-150\u00b0 arasindadir. Bu capraz konumdaki silindir, progresif cam tasariminda en zor uyum senaryosunu olusturur."
        },
        {
          soru: "Neden sorun cikarir?",
          cevap: "Progresif camlarin zaten daralan gecis bolgesinde, oblik silindir ek bir bozulma (distorsiyon) yaratir. Kenar bulanikligi artar, yuzme etkisi belirginlesir ve gecis bolgesi daha da daralir."
        },
        {
          soru: "Ne yapilmali?",
          cevap: cylMax >= 1.50
            ? "KRITIK: Silindir degeri " + cylMax.toFixed(2) + "D ile oblik birlesimi en zor senaryo. FreeForm kisisel tasarim ZORUNLU. Standart progresif KESINLIKLE KULLANAMAYIN. Hastaya 3-4 hafta alisma sureci aciklanmali."
            : "FreeForm kisisel tasarim KESINLIKLE onerilir. Uzun koridor (min 16mm) tercih edin. Hastaya alisma suresinin 2-3 hafta olabilecegini belirtin."
        }
      ],
      svgTip: "aks-dairesi",
      sagAks: parseFloat(recete.sag.ax) || 0,
      solAks: parseFloat(recete.sol.ax) || 0
    });
  } else if (sagKismenOblik || solKismenOblik) {
    var kGozler = [];
    if (sagKismenOblik) kGozler.push("Sag goz: " + recete.sag.ax + "\u00b0");
    if (solKismenOblik) kGozler.push("Sol goz: " + recete.sol.ax + "\u00b0");

    notlar.push({
      id: "kismen-oblik",
      baslik: "Kismen Oblik Aks Tespit Edildi",
      ikon: "info",
      renk: "bilgi",
      gozDegerleri: kGozler.join(" | "),
      icerik: [
        {
          soru: "Kismen oblik ne demektir?",
          cevap: "Silindir ekseni 61\u00b0-89\u00b0 veya 91\u00b0-119\u00b0 arasindadir. Tam oblik (30\u00b0-60\u00b0 / 120\u00b0-150\u00b0) kadar zorlayici degildir ama yine de dikkat gerektirir."
        },
        {
          soru: "Ne yapilmali?",
          cevap: "FreeForm tasarim tercih edilir. Hastaya alisma suresi hakkinda bilgi verilmelidir."
        }
      ],
      svgTip: "aks-dairesi",
      sagAks: parseFloat(recete.sag.ax) || 0,
      solAks: parseFloat(recete.sol.ax) || 0
    });
  }

  // --- MINKWITZ TEOREMI NOTU ---
  var addMax = Math.max(parseFloat(recete.sag.add) || 0, parseFloat(recete.sol.add) || 0);
  var koridor = koridorSonuc.koridor || 14;
  var gucDegisimHizi = addMax > 0 && koridor > 0 ? addMax / koridor : 0;

  if (addMax >= 2.00 || gucDegisimHizi > 0.14) {
    var gdhYorum, gdhRenk;
    if (gucDegisimHizi > 0.18) {
      gdhYorum = "YUKSEK — Periferik distorsiyon belirgin olacak. FreeForm + yuzme etkisi azaltma kesinlikle gerekli.";
      gdhRenk = "kritik";
    } else if (gucDegisimHizi > 0.14) {
      gdhYorum = "ORTA — Kabul edilebilir duzey. FreeForm tercih edilmeli.";
      gdhRenk = "uyari";
    } else {
      gdhYorum = "DUSUK — Rahat gecis beklenir. Genis ara bolge.";
      gdhRenk = "bilgi";
    }

    notlar.push({
      id: "minkwitz",
      baslik: "Minkwitz Teoremi ve Kenar Bulanikligi",
      ikon: "info",
      renk: gdhRenk,
      gozDegerleri: "ADD: " + addMax.toFixed(2) + " D | Koridor: " + koridor + " mm | Guc degisim hizi: " + gucDegisimHizi.toFixed(3) + " D/mm",
      icerik: [
        {
          soru: "Minkwitz teoremi nedir?",
          cevap: "Alman matematikci Minkwitz'in 1963'te kanitladigi teorem: Progresif camda periferik astigmatizma (kenar bulanikligi), yakin ilave (ADD) degerinin 2 katidir ve koridor uzunlugu ile ters orantilidir. Formul: Periferik Astigmatizma = 2 x ADD / Koridor Uzunlugu"
        },
        {
          soru: "Pratik anlami nedir?",
          cevap: "ADD degeri arttikca kenar bulanikligi MATEMATIKSEL olarak artar. Bu bir tasarim hatasi degildir, fizik kanunudur. Hicbir cam bu bulanikligi tamamen ortadan kaldiramaz, ancak FreeForm tasarimlar minimize edebilir."
        },
        {
          soru: "Guc degisim hizi ne demek?",
          cevap: "ADD / Koridor orani guc degisim hizini verir. Sizin degeriniz: " + gucDegisimHizi.toFixed(3) + " D/mm. Ideal: 0.14 D/mm alti. Kabul edilebilir: 0.14-0.18 D/mm. Sorunlu: 0.18 D/mm ustu. Degeriniz: " + gdhYorum
        },
        {
          soru: "Neden uzun koridor gerekli?",
          cevap: "Koridor uzadikca ADD degeri daha yumusak dagilir ve guc degisim hizi duser. Ornek: ADD 2.50 / 14mm koridor = 0.179 D/mm (yuksek). ADD 2.50 / 18mm koridor = 0.139 D/mm (ideal). Bu yuzden yuksek ADD'de uzun koridor MATEMATIK olarak zorunludur."
        }
      ],
      svgTip: "minkwitz-grafik",
      addDeger: addMax,
      koridorDeger: koridor,
      gucDegisimHizi: gucDegisimHizi
    });
  }

  // --- DIFERANSIYEL PRIZMATIK ETKI NOTU (Prentice Kurali) ---
  var sphSag = Math.abs(parseFloat(recete.sag.sph) || 0);
  var sphSol = Math.abs(parseFloat(recete.sol.sph) || 0);
  var pKoridor = koridorSonuc.idealKoridor;
  var pKoridorCm = pKoridor / 10; // mm → cm
  var pAddMax = Math.max(parseFloat(recete.sag.add) || 0, parseFloat(recete.sol.add) || 0);

  // Prentice kurali: P = c x F (c = santimetre, F = diyoptri)
  var prizmaSag = pKoridorCm * sphSag;
  var prizmaSol = pKoridorCm * sphSol;
  var prizmaFark = Math.abs(prizmaSag - prizmaSol);

  if (prizmaFark >= 1.00) {
    // Alternatif koridor hesabi (kisa koridor ile ne olur?)
    var altKoridor = Math.min(pKoridor, 14);
    var altKoridorCm = altKoridor / 10;
    var altPrizmaSag = altKoridorCm * sphSag;
    var altPrizmaSol = altKoridorCm * sphSol;
    var altPrizmaFark = Math.abs(altPrizmaSag - altPrizmaSol);

    // Renk: >=1.50delta kritik, 1.00-1.50delta uyari
    var prizmaRenk = prizmaFark >= 1.50 ? "kritik" : "uyari";
    var slabOffGerekli = prizmaFark >= 1.50;

    // Minkwitz catismasi kontrolu
    var minkwitzCatismasi = pAddMax >= 2.00 && prizmaFark >= 1.50;

    // Risk seviyesi metni — daha net ve yonlendirici
    var prizmaRiskYorum = "";
    if (prizmaFark >= 2.00) {
      prizmaRiskYorum = "YUKSEK RISK — Cift gorme (diplopi) olasiligi var. Bu hastaya standart stok cam UYGUN DEGILDIR. Asagidaki 'Ne yapmaliyiz?' bolumune bakiniz.";
    } else if (prizmaFark >= 1.50) {
      prizmaRiskYorum = "ORTA-YUKSEK RISK — Bas agrisi ve uyum guclugu beklenir. FreeForm tasarim ZORUNLUDUR. Asagidaki 'Ne yapmaliyiz?' bolumune bakiniz.";
    } else {
      prizmaRiskYorum = "DIKKAT — Hassas hastalarda uyum sorunu olusabilir. FreeForm tasarim onerilir, stok camda dikkatli montaj gerekir.";
    }

    // Koridor kisaltma karsilastirmasi — Minkwitz catismasiyla birlikte
    var koridorKarsilastirma = "";
    if (altKoridor < pKoridor) {
      koridorKarsilastirma = "Hesap: " + pKoridor + "mm koridor → " + prizmaFark.toFixed(2) + "Δ fark. " +
        altKoridor + "mm koridor → " + altPrizmaFark.toFixed(2) + "Δ fark. ";
      if (minkwitzCatismasi) {
        koridorKarsilastirma += "ANCAK: Bu hastanin ADD degeri " + pAddMax.toFixed(2) + "D (yuksek). Minkwitz teoremine gore kisa koridor periferik bozulmayi arttirir. " +
          "SONUC: Koridoru kisaltmak YANLIS COZUMDUR. Dogru cozum: Slab-off prizmasi veya FreeForm tasarimla prizma kompanzasyonu.";
      } else {
        koridorKarsilastirma += "ADD degeri " + pAddMax.toFixed(2) + "D (dusuk-orta). Kisa koridor secenegi uygulanabilir, " +
          "ancak en iyi sonuc icin FreeForm tasarim tercih edilmelidir.";
      }
    } else {
      koridorKarsilastirma = "Koridor zaten " + pKoridor + "mm (en kisa seviye). Koridoru daha fazla kisaltmak mumkun degil. " +
        "Cozum: Slab-off prizmasi, FreeForm prizma kompanzasyonu veya bir goze kontak lens.";
    }

    // Pratik oneri metni — en onemli soru
    var pratikOneri = "";
    if (prizmaFark >= 2.00) {
      pratikOneri = "1) ZORUNLU: FreeForm bireysel tasarim cam secin (stok cam UYGUN DEGIL). " +
        "2) ONERILEN: Slab-off prizmasi degerlendirilmeli — cam laboratuvarinizla gorusun. " +
        "3) ALTERNATIF: Dusuk goze kontak lens + diger goze gozluk (mono-vizyon). " +
        "4) MONTAJ: Optik merkez yuksekliklerini +/- 0.5mm hassasiyetle ayarlayin.";
    } else if (prizmaFark >= 1.50) {
      pratikOneri = "1) ONERILEN: FreeForm bireysel tasarim cam secin. " +
        "2) DEGERLENDIR: Slab-off prizmasi — " + prizmaFark.toFixed(2) + "Δ fark sinirda, hasta sikayetine gore karar verin. " +
        "3) MONTAJ: Optik merkez yuksekliklerini hassas ayarlayin, PD olcumunu dogrulayin. " +
        "4) TAKIP: Hastaya 1 hafta uyum suresi sonrasi kontrol randevusu verin.";
    } else {
      pratikOneri = "1) TERCIH: FreeForm bireysel tasarim cam daha iyi sonuc verir. " +
        "2) STOK CAM: Kullanilabilir, ancak montaj hassasiyeti cok onemli. " +
        "3) MONTAJ: Optik merkez ve PD olcumlerini dikkatle yapin. " +
        "4) BILGI: Hastaya yakin gorusde hafif rahatsizlik olabilecegini bildirin.";
    }

    notlar.push({
      id: "prentice",
      baslik: "Diferansiyel Prizmatik Etki",
      ikon: "warning",
      renk: prizmaRenk,
      gozDegerleri: "Sag: " + prizmaSag.toFixed(2) + "\u0394 | Sol: " + prizmaSol.toFixed(2) + "\u0394 | Fark: " + prizmaFark.toFixed(2) + "\u0394",
      icerik: [
        {
          soru: "Bu ne demek?",
          cevap: "Progresif camda okuma noktasina bakarken gozler asagi kayar. Prentice kurali (P = mesafe x guc) geregi, farkli numarali gozler farkli prizma etkisi yasар. " +
            "Bu hastanin gozleri arasinda " + prizmaFark.toFixed(2) + "Δ (prizma diyoptri) fark var. " +
            "1.00Δ uzerindeki farklar uyum sorununa, 1.50Δ uzerindekiler bas agrisi ve cift gormeye yol acabilir."
        },
        {
          soru: "Bu recetede hesap nasil?",
          cevap: "Formul: Prizma = Koridor (cm) x SPH (D). | " +
            "Sag goz: " + pKoridorCm.toFixed(1) + " cm x " + sphSag.toFixed(2) + " D = " + prizmaSag.toFixed(2) + "Δ | " +
            "Sol goz: " + pKoridorCm.toFixed(1) + " cm x " + sphSol.toFixed(2) + " D = " + prizmaSol.toFixed(2) + "Δ | " +
            "Fark: " + prizmaFark.toFixed(2) + "Δ — " + prizmaRiskYorum
        },
        {
          soru: "Koridoru kisaltarak cozulebilir mi?",
          cevap: koridorKarsilastirma
        },
        {
          soru: "Ne yapmaliyiz?",
          cevap: pratikOneri
        },
        {
          soru: "Slab-off nedir, ne zaman gerekir?",
          cevap: slabOffGerekli
            ? "Slab-off: Camin alt yarisina ters yonde prizma taslanarak iki goz arasindaki fark dengelenir. " +
              "Bu hastada fark " + prizmaFark.toFixed(2) + "Δ (>= 1.50Δ siniri). Slab-off DEGERLENDIRILMELI. " +
              "Not: Slab-off camda gorunur bir cizgi birakir — hastaya onceden bilgi verin. FreeForm prizma kompanzasyonu gorsel olarak daha temiz bir alternatiftir."
            : "Slab-off: Camin alt yarisina ters yonde prizma taslanarak iki goz arasindaki fark dengelenir. " +
              "Bu hastada fark " + prizmaFark.toFixed(2) + "Δ (< 1.50Δ siniri). Slab-off genellikle GEREKMEZ. " +
              "Ancak hasta yakin gorusde cift gorme veya bulanik gorme bildirirse yeniden degerlendirilmelidir."
        }
      ],
      svgTip: "prizma-grafik",
      prizmaSag: prizmaSag,
      prizmaSol: prizmaSol,
      prizmaFark: prizmaFark,
      altKoridor: altKoridor,
      altPrizmaFark: altPrizmaFark,
      slabOffGerekli: slabOffGerekli
    });
  }

  return notlar;
}

// ============================================================================
// FAZ 2 — MOTOR GENISLETME (CHUNK 1): Yardimci Fonksiyonlar
// Mevcut akis BOZULMAZ. Bu fonksiyonlar bagimsiz yardimci olarak eklendi.
// onerMarkalar / kontrolEt entegrasyonu Chunk 2'de yapilacak.
// ============================================================================

/**
 * Verteks Kompanzasyonu — |SPH| >= 4.00D durumunda zorunlu.
 * Formul: Fc = F / (1 - d * F), d metre cinsinden (yeniV - mevcutV) / 1000.
 * @param {number} sph - Olculen reçete SPH (diyoptri)
 * @param {number} mevcutVerteks - Olcum sirasinda verteks (mm, default 13)
 * @param {number} yeniVerteks - Cerçeveyle gerçek verteks (mm)
 * @returns {{efektifGuc: number, farkD: number, kompanzasyonGerekli: boolean, uyari: string|null}}
 */
function hesaplaVerteksKompanzasyon(sph, mevcutVerteks, yeniVerteks) {
  if (sph === null || sph === undefined || isNaN(sph)) {
    return { efektifGuc: null, farkD: 0, kompanzasyonGerekli: false, uyari: null };
  }
  var mv = (mevcutVerteks !== null && !isNaN(mevcutVerteks)) ? mevcutVerteks : 13;
  var yv = (yeniVerteks !== null && !isNaN(yeniVerteks)) ? yeniVerteks : 13;
  var d = (yv - mv) / 1000; // metre
  var F = sph;
  var denom = 1 - d * F;
  var efektif = (Math.abs(denom) < 1e-6) ? F : F / denom;
  var fark = efektif - F;
  var absSph = Math.abs(sph);
  var gerekli = absSph >= 4.0;
  var uyari = null;
  if (gerekli && Math.abs(fark) >= 0.12) {
    uyari = "Verteks kompanzasyonu: SPH " + F.toFixed(2) + "D icin " + yv + "mm verteksde efektif guc " +
            efektif.toFixed(2) + "D olur (fark " + (fark >= 0 ? "+" : "") + fark.toFixed(2) + "D). " +
            "Siparis iletiminde kompanze edilmis guc kullanilmali.";
  } else if (gerekli) {
    uyari = "Verteks " + yv + "mm (mevcut " + mv + "mm) — |SPH| >= 4D ama fark ihmal edilebilir.";
  }
  return { efektifGuc: efektif, farkD: fark, kompanzasyonGerekli: gerekli, uyari: uyari };
}

/**
 * Yasam tarzina gore ozel amac camini belirler (specialty routing).
 * Oncelik sirasi: drive (gece veya >=40% sürüs) > pilot (yakinYogunMeslek) > sport (bombeli çerçeve) >
 * ofis (>=4h ekran) > antifatigue (<45 yas + dijital + goz yorgunlugu) > null.
 * @param {object} yasam - { surusYoneri, geceSurus, ofisSaat, dijitalSaat, sporYogunluk, bombeliCerceve, yakinYogunMeslek, yas, gozYorgunlugu }
 * @returns {{ozelAmac: string|null, gerekce: string}}
 */
function secOzelAmac(yasam) {
  if (!yasam || typeof yasam !== "object") {
    return { ozelAmac: null, gerekce: "Yasam tarzi bilgisi yok." };
  }
  var surusYuzde = yasam.surusYuzdesi || 0;
  var geceSurus = !!yasam.geceSurus;
  var ofisSaat = yasam.ofisSaat || 0;
  var dijitalSaat = yasam.dijitalSaat || 0;
  var spor = yasam.sporYogunluk || 0; // 0-100
  var bombeli = !!yasam.bombeliCerceve;
  var pilot = !!yasam.yakinYogunMeslek; // pilot/tamirci/dis hekimi
  var yas = yasam.yas || 0;
  var gozYorgunlugu = !!yasam.gozYorgunlugu;

  if (geceSurus || surusYuzde >= 40) {
    return { ozelAmac: "drive", gerekce: geceSurus ? "Gece surusu yogun" : ("Surusun %" + surusYuzde + "'i") };
  }
  if (pilot) {
    return { ozelAmac: "pilot", gerekce: "Yukarida yakin gorme gerekli meslek (pilot/tamirci/dis hekimi)" };
  }
  if (spor >= 40 && bombeli) {
    return { ozelAmac: "sport", gerekce: "Bombeli spor cercevesi + yogun spor" };
  }
  if (ofisSaat >= 4) {
    return { ozelAmac: "ofis", gerekce: ofisSaat + "h ofis / ekran mesaisi" };
  }
  if (yas > 0 && yas < 45 && (dijitalSaat >= 6 || gozYorgunlugu)) {
    return { ozelAmac: "antifatigue", gerekce: "Genc presbiyop adayı + dijital yorgunluk" };
  }
  return { ozelAmac: null, gerekce: "Genel amac progresif yeterli" };
}

/**
 * Yasam tarzi + kullanim bilgilerine gore markanin kaplamalarindan en uygununu secer.
 * Kurallar:
 *  - Gece surus sik -> DRIVE/gece-surus kaplamasi
 *  - Dijital agir -> mavi-isik kaplamasi (BLUV/Blue Premium)
 *  - Mirror SADECE renklendirme >= 3 ile uyumlu
 *  - Default -> standart (ucretsiz) kaplama
 * @param {object} yasam
 * @param {object} kullanim - { renklendirmeKategori }
 * @param {Array} markaninKaplamalari - data.js markalar.{marka}.kaplamalar[]
 * @returns {{secilen: object|null, alternatifler: Array, gerekce: string, uyarilar: string[]}}
 */
function secKaplama(yasam, kullanim, markaninKaplamalari) {
  var bos = { secilen: null, alternatifler: [], gerekce: "Kaplama listesi yok.", uyarilar: [] };
  if (!Array.isArray(markaninKaplamalari) || markaninKaplamalari.length === 0) return bos;
  var y = yasam || {};
  var k = kullanim || {};
  var uyarilar = [];

  // Aday filtreleme: mirror/ayna sadece kategori >= 3 boyama ile
  var adaylar = markaninKaplamalari.filter(function (kap) {
    var tip = (kap.tip || "").toLowerCase();
    var gerek = (kap.gerektirir || "").toLowerCase();
    if (tip.indexOf("ayna") >= 0 || tip.indexOf("mirror") >= 0 || gerek.indexOf("renklendirme") >= 0) {
      var rk = k.renklendirmeKategori || 0;
      if (rk < 3) {
        uyarilar.push(kap.ad + ": renklendirme kategori 3+ gerektirir.");
        return false;
      }
    }
    return true;
  });

  function bul(kriter) {
    for (var i = 0; i < adaylar.length; i++) {
      if (kriter(adaylar[i])) return adaylar[i];
    }
    return null;
  }

  var secilen = null;
  var gerekce = "";

  if (y.geceSurus || (y.surusYuzdesi || 0) >= 40) {
    secilen = bul(function (kap) {
      var t = (kap.tip || "").toLowerCase();
      var o = kap.ozellikler || {};
      return t.indexOf("surus") >= 0 || o.geceSurus === true || o.parlamaAzaltmaFiltresi === true;
    });
    if (secilen) gerekce = "Gece surus yogun -> parlama azaltma";
  }

  if (!secilen && (y.dijitalSaat || 0) >= 4) {
    secilen = bul(function (kap) {
      var t = (kap.tip || "").toLowerCase();
      var o = kap.ozellikler || {};
      return t.indexOf("mavi") >= 0 || o.maviIsikFiltresi;
    });
    if (secilen) gerekce = "Dijital " + y.dijitalSaat + "h/gun -> mavi isik filtreli";
  }

  if (!secilen) {
    // Standart / ucretsiz kaplama
    secilen = bul(function (kap) { return kap.standart === true || kap.ucret === 0; });
    if (secilen) gerekce = "Varsayilan standart kaplama (ucretsiz)";
  }

  if (!secilen && adaylar.length > 0) {
    secilen = adaylar[0];
    gerekce = "Ilk uygun kaplama";
  }

  var alt = adaylar.filter(function (kap) { return kap !== secilen; }).slice(0, 3);
  return { secilen: secilen, alternatifler: alt, gerekce: gerekce, uyarilar: uyarilar };
}

/**
 * Yasam + recete + markanin materyallerine gore materyal secer.
 * Kurallar:
 *  - Surucu + fotokromik TEK COZUM -> REDDET, uyari
 *  - Surucu + polarize + modern LCD pano -> UYARI
 *  - Sicak iklim + fotokromik -> uyari "30C+ koyulasma yavaslar"
 *  - Balikçi/kayakci/gunduz yogun surus (LCD yok) -> NPolar
 *  - Cocuk/spor + yuksek darbe riski -> Q-vex / polikarbonat
 * @returns {{secilen: object|null, uyarilar: string[], gerekce: string}}
 */
function secMateryal(yasam, recete, markaninMateryalleri) {
  var bos = { secilen: null, uyarilar: [], gerekce: "Materyal listesi yok." };
  if (!Array.isArray(markaninMateryalleri) || markaninMateryalleri.length === 0) return bos;
  var y = yasam || {};
  var uyarilar = [];

  var isSurucu = !!y.geceSurus || (y.surusYuzdesi || 0) >= 20;
  var modernLCD = !!y.modernLCDPano;
  var sicakIklim = !!y.sicakIklim;
  var balikciKayakci = !!y.balikciKayakci;
  var cocukSpor = !!y.cocukSpor;

  function bulTip(aranan) {
    for (var i = 0; i < markaninMateryalleri.length; i++) {
      var m = markaninMateryalleri[i];
      var t = (m.tip || m.id || "").toLowerCase();
      var o = m.ozellik || m.ozellikler || {};
      if (t.indexOf(aranan) >= 0) return m;
      if (typeof o === "string" && o.indexOf(aranan) >= 0) return m;
      if (typeof o === "object" && o.tip && (o.tip + "").toLowerCase().indexOf(aranan) >= 0) return m;
    }
    return null;
  }

  // Uyari bloklari
  if (isSurucu) {
    var fotokromik = bulTip("fotokromik") || bulTip("transitions");
    if (fotokromik) {
      uyarilar.push("Fotokromik ARABADA calismaz (on cam UV bloke). Surucuye tek cozum olarak ONERILMEZ.");
    }
    if (modernLCD) {
      uyarilar.push("Polarize + modern LCD pano: gosterge paneli/HUD kararabilir. Hasta bilgilendirilmeli.");
    }
  }
  if (sicakIklim) {
    var fk = bulTip("fotokromik");
    if (fk) uyarilar.push("Sicak iklim: fotokromik 30C+ koyulasma yavaslar (Novax/Transitions verisi: 30C=%72.3).");
  }

  var secilen = null;
  var gerekce = "";

  if (balikciKayakci && !modernLCD) {
    secilen = bulTip("polarize") || bulTip("npolar");
    if (secilen) gerekce = "Balikci/kayakci -> polarize";
  }
  if (!secilen && cocukSpor) {
    secilen = bulTip("q-vex") || bulTip("polikarbonat") || bulTip("kirilmaya");
    if (secilen) gerekce = "Cocuk/spor -> kirilmaya dirençli";
  }
  if (!secilen) {
    // Varsayilan beyaz
    secilen = bulTip("beyaz") || markaninMateryalleri[0];
    gerekce = "Varsayilan beyaz materyal";
  }

  return { secilen: secilen, uyarilar: uyarilar, gerekce: gerekce };
}

/**
 * Urun bileşenleri toplam fiyati.
 * @param {object} model - { fiyatMatrisi?: {indeks: {materyal: fiyat}}, fiyatAraligi?: {min,max} }
 * @param {string} indeks - "1.50" | "1.60" | ...
 * @param {object|null} materyal - { id } — fiyatMatrisi icin
 * @param {object|null} kaplama - { ucret }
 * @param {Array} islemler - [{ucret}, ...]
 * @param {number} magazaIndirimi - 0-1 arasi
 * @returns {{toplam: number, detay: object}}
 */
function toplamFiyat(model, indeks, materyal, kaplama, islemler, magazaIndirimi) {
  var camFiyati = 0;
  if (model && model.fiyatMatrisi && indeks && model.fiyatMatrisi[indeks]) {
    var satir = model.fiyatMatrisi[indeks];
    var mid = materyal && materyal.id ? materyal.id : "beyaz";
    camFiyati = satir[mid] || satir.beyaz || satir[Object.keys(satir)[0]] || 0;
  } else if (model && model.fiyatAraligi) {
    camFiyati = model.fiyatAraligi.min || 0;
  }
  var kaplamaFiyati = kaplama && typeof kaplama.ucret === "number" ? kaplama.ucret : 0;
  var islemFiyati = 0;
  if (Array.isArray(islemler)) {
    for (var i = 0; i < islemler.length; i++) {
      if (islemler[i] && typeof islemler[i].ucret === "number") islemFiyati += islemler[i].ucret;
    }
  }
  var araToplam = camFiyati + kaplamaFiyati + islemFiyati;
  var indirim = magazaIndirimi && magazaIndirimi > 0 && magazaIndirimi < 1 ? araToplam * magazaIndirimi : 0;
  var toplam = araToplam - indirim;
  return {
    toplam: toplam,
    detay: { cam: camFiyati, kaplama: kaplamaFiyati, islemler: islemFiyati, araToplam: araToplam, indirim: indirim }
  };
}

/**
 * Uretilebilirlik filtresi — recete SPH/CYL model x indeks x cap sinirlarinda mi?
 * Model'de uretilebilirlik tablosu yoksa true doner (permissive).
 * @param {object} recete - { sagSph, solSph, sagCyl, solCyl }
 * @param {object} model - { uretilebilirlik?: {indeks: {cap: {sphMin, sphMax, cylMax}}} }
 * @param {string} indeks
 * @param {number|string} cap - 65 | 70 | 75 vb.
 * @returns {{uretilebilir: boolean, sebep: string}}
 */
function filtreleUretilebilir(recete, model, indeks, cap) {
  if (!model || !model.uretilebilirlik) {
    return { uretilebilir: true, sebep: "Uretilebilirlik tablosu tanimli degil (permissive)." };
  }
  var tablo = model.uretilebilirlik[indeks];
  if (!tablo) return { uretilebilir: true, sebep: "Bu indeks icin uretilebilirlik tanimi yok." };
  var capKey = cap + "";
  var sinir = tablo[capKey];
  if (!sinir) {
    var anahtarlar = Object.keys(tablo);
    if (anahtarlar.length > 0) sinir = tablo[anahtarlar[0]];
    else return { uretilebilir: true, sebep: "Cap sinirlari yok." };
  }
  var sphler = [recete.sagSph, recete.solSph].filter(function (v) { return v !== null && v !== undefined && !isNaN(v); });
  var cyller = [recete.sagCyl, recete.solCyl].filter(function (v) { return v !== null && v !== undefined && !isNaN(v); });
  for (var i = 0; i < sphler.length; i++) {
    if (sphler[i] < sinir.sphMin || sphler[i] > sinir.sphMax) {
      return { uretilebilir: false, sebep: "SPH " + sphler[i] + " sinir disi (" + sinir.sphMin + ".." + sinir.sphMax + ")." };
    }
  }
  for (var j = 0; j < cyller.length; j++) {
    if (Math.abs(cyller[j]) > Math.abs(sinir.cylMax)) {
      return { uretilebilir: false, sebep: "|CYL| " + Math.abs(cyller[j]) + " > " + Math.abs(sinir.cylMax) + "." };
    }
  }
  return { uretilebilir: true, sebep: "Sinirlarin icinde." };
}

// Global export (window ortamında)
if (typeof window !== "undefined") {
  window.hesaplaVerteksKompanzasyon = hesaplaVerteksKompanzasyon;
  window.secOzelAmac = secOzelAmac;
  window.secKaplama = secKaplama;
  window.secMateryal = secMateryal;
  window.toplamFiyat = toplamFiyat;
  window.filtreleUretilebilir = filtreleUretilebilir;
}

// ============================================================================
// FAZ 2 — MOTOR GENISLETME (CHUNK 2): 17 SIFIR HATA CHECKLIST
// Plan satir 158-178. Fitting/olcum geometri (T1) + kaplama uyumu (T3).
// Edge case T2 kurallari Chunk 3'te kontrolKenarDurumlari() olarak eklenecek.
//
// Her kural { seviye, mesaj, kural, duzelt } nesnesi doner:
//   seviye: "bilgi" | "uyari" | "zorunlu"
//   zorunlu -> siparis butonu PASIF (red card)
//   uyari   -> optisyen goruyor, onay gerekir
//   bilgi   -> bilgilendirme amacli
// ============================================================================

/**
 * Fitting / olcum geometri kurallari (T1 + T4).
 * @param {object} recete - { sagSph, solSph, sagCyl, solCyl, sagAdd, solAdd, monokPdSag, monokPdSol }
 * @param {object} cerceve - { b, koridorMm, fhSag, fhSol, pantoskopikAci, bombeAcisi, verteksMm, a, dbl }
 * @param {object} secim - { model, ilkKullanim, premiumFreeForm }
 * @returns {Array} ihlaller
 */
function kontrolFittingGeometri(recete, cerceve, secim) {
  var ihlaller = [];
  var r = recete || {};
  var c = cerceve || {};
  var s = secim || {};

  // Kural 1: B >= (koridor + 14mm)
  if (c.b !== undefined && c.b !== null && c.koridorMm !== undefined && c.koridorMm !== null) {
    var minB = c.koridorMm + 14;
    if (c.b < minB) {
      ihlaller.push({
        kural: "T1-1", seviye: "zorunlu",
        mesaj: "Cerceve B yuksekligi (" + c.b + "mm) koridor (" + c.koridorMm + "mm) icin yetersiz. Minimum " + minB + "mm olmali. Okuma zonu cerceve disinda kalir.",
        duzelt: "Ya daha derin cerceve sec, ya da daha kisa koridor (D=5/E=7/F=9) kullan."
      });
    }
  }

  // Kural 2: Monokuler PD sag ve sol AYRI girilmis
  if (r.monokPdSag === undefined || r.monokPdSag === null || r.monokPdSol === undefined || r.monokPdSol === null) {
    ihlaller.push({
      kural: "T1-2", seviye: "zorunlu",
      mesaj: "Monokuler PD degeri SAG ve SOL icin ayri ayri girilmelidir. Binokuler PD'yi 2'ye bolmek YASAK (yuz asimetrisi).",
      duzelt: "Monokuler PD olcumu yap (sag/sol AYRI), ANSI Z80.1 +/- 1mm tolerans."
    });
  } else if (r.monokPdSag > 0 && r.monokPdSol > 0) {
    var pdFark = Math.abs(r.monokPdSag - r.monokPdSol);
    if (pdFark > 3) {
      ihlaller.push({
        kural: "T1-2b", seviye: "uyari",
        mesaj: "Sag/Sol monokuler PD farki " + pdFark.toFixed(1) + "mm (> 3mm). Yuz asimetrisi buyuk - tekrar olc.",
        duzelt: "Olcumu tekrarla."
      });
    }
  }

  // Kural 3: Sag-sol fitting height farki <= 1mm
  if (c.fhSag !== undefined && c.fhSol !== undefined && c.fhSag !== null && c.fhSol !== null) {
    var fhFark = Math.abs(c.fhSag - c.fhSol);
    if (fhFark > 1) {
      ihlaller.push({
        kural: "T1-3", seviye: "uyari",
        mesaj: "Sag/sol fitting height farki " + fhFark.toFixed(1) + "mm (> 1mm). Kalici prizmatik etki, bas agrisi, sasilik riski.",
        duzelt: "Olcumu tekrarla veya hasta bilgilendir. Cerceve egik oturuyor olabilir."
      });
    }
  }

  // Kural 4: Fitting height koridor uzunluguna uygun (T1 tablosu: B >= koridor+14)
  // Bu kural 1 ile ortusuyor — burada ADD yuksekse ek kontrol
  if (c.b !== undefined && c.b !== null && r.sagAdd) {
    var maxAdd = Math.max(r.sagAdd || 0, r.solAdd || 0);
    if (maxAdd >= 1.75 && c.b < 28) {
      ihlaller.push({
        kural: "T1-4", seviye: "uyari",
        mesaj: "ADD " + maxAdd + " + cerceve B " + c.b + "mm: okuma zonu sigmayabilir. B >= 28mm onerilir.",
        duzelt: "Daha derin cerceve veya kisa koridor (F=9mm)."
      });
    }
  }

  // Kural 5: Pantoskopik aci 5-15°
  if (c.pantoskopikAci !== undefined && c.pantoskopikAci !== null) {
    if (c.pantoskopikAci < 5 || c.pantoskopikAci > 15) {
      ihlaller.push({
        kural: "T1-5", seviye: s.premiumFreeForm ? "zorunlu" : "uyari",
        mesaj: "Pantoskopik aci " + c.pantoskopikAci + "° (ideal 8-12°, kabul 5-15°). " +
               (s.premiumFreeForm ? "Premium FreeForm icin zorunlu ayar." : "Lens potansiyelinin %30-40'i kayip olabilir."),
        duzelt: "Cerceveyi ayarla veya farkli model."
      });
    }
  } else if (s.premiumFreeForm) {
    ihlaller.push({
      kural: "T1-5b", seviye: "zorunlu",
      mesaj: "Premium FreeForm cam secildi ama pantoskopik aci girilmedi.",
      duzelt: "Pantoskopik aci olc ve gir."
    });
  }

  // Kural 6: |SPH| >= 4D ise verteks mesafesi girilmis
  var maxSph = Math.max(Math.abs(r.sagSph || 0), Math.abs(r.solSph || 0));
  if (maxSph >= 4.0) {
    if (c.verteksMm === undefined || c.verteksMm === null) {
      ihlaller.push({
        kural: "T1-6", seviye: "zorunlu",
        mesaj: "|SPH| " + maxSph.toFixed(2) + "D (>= 4D). Verteks mesafesi GIRILMEDI - kompanzasyon yapilamaz. " +
               "2mm verteks degisimi -6D'de ~0.70D efektif guc farki yapar.",
        duzelt: "Verteks mesafesi olc (default 13mm) ve gir."
      });
    }
  }

  // Kural 7: Wrap >= 10° -> sport/wrap uyumlu model
  if (c.bombeAcisi !== undefined && c.bombeAcisi !== null && c.bombeAcisi >= 15) {
    var modelTasarim = s.model && (s.model.ozelAmac === "sport" || (s.model.teknolojiler || []).join(" ").toLowerCase().indexOf("sport") >= 0);
    if (!modelTasarim) {
      ihlaller.push({
        kural: "T1-7", seviye: "zorunlu",
        mesaj: "Cerceve bombe " + c.bombeAcisi + "° (>= 15°). Standart progresif KULLANILAMAZ - wrap uyumlu lens zorunlu.",
        duzelt: "Sportive / Nucleo Sport / Shamir Attitude veya wrap-uyumlu FreeForm."
      });
    }
  }

  // Kural 8: Ilk kullanici + koridor >= 11mm
  if (s.ilkKullanim && c.koridorMm !== undefined && c.koridorMm !== null && c.koridorMm < 11) {
    ihlaller.push({
      kural: "T1-8", seviye: "uyari",
      mesaj: "Ilk kez progresif kullanici + kisa koridor (" + c.koridorMm + "mm). Adaptasyon riski.",
      duzelt: "Koridor >= 11mm (A/G tipi) veya yumusak tasarim (Synthesis/Presio First) sec."
    });
  }

  // Kural 9: Anizometropi >= 1D -> monokuler PD +/-0.5mm hassasiyet
  var sphFark = Math.abs((r.sagSph || 0) - (r.solSph || 0));
  var cylFark = Math.abs((r.sagCyl || 0) - (r.solCyl || 0));
  if (sphFark >= 1.0 || cylFark >= 1.0) {
    ihlaller.push({
      kural: "T1-9", seviye: "bilgi",
      mesaj: "Anizometropi (SPH fark " + sphFark.toFixed(2) + "D, CYL fark " + cylFark.toFixed(2) + "D >= 1D). Monokuler PD +/-0.5mm hassasiyet gerekli.",
      duzelt: "PD olcumunde ekstra dikkat."
    });
  }

  // Kural 10: Premium FreeForm -> pantoskopik + wrap + verteks hepsi dolu
  if (s.premiumFreeForm) {
    var eksikler = [];
    if (c.pantoskopikAci === undefined || c.pantoskopikAci === null) eksikler.push("pantoskopik aci");
    if (c.bombeAcisi === undefined || c.bombeAcisi === null) eksikler.push("cerceve bombe");
    if (c.verteksMm === undefined || c.verteksMm === null) eksikler.push("verteks mesafesi");
    if (eksikler.length > 0) {
      ihlaller.push({
        kural: "T1-10", seviye: "zorunlu",
        mesaj: "Premium FreeForm cam icin EKSIK olcum: " + eksikler.join(", ") + ". Camin potansiyelinin %30-40'i kayip.",
        duzelt: "Tum olcumleri tamamla veya standart FreeForm modele dus."
      });
    }
  }

  return ihlaller;
}

/**
 * Kaplama ve materyal uyum kurallari (T3).
 * Kural 15: Surucu + sik gece surusu -> polarize degil, Drive/AR
 * Kural 17: Sicak iklim + surucu + fotokromik tek cozum olarak onerilmiyor
 * @param {object} yasam - { surusYuzdesi, geceSurus, sicakIklim, modernLCDPano }
 * @param {object|null} secilenMateryal - { ad, tip, ozellik|ozellikler }
 * @param {object|null} secilenKaplama - { ad, tip }
 * @returns {Array} ihlaller
 */
function kontrolKaplamaUyumu(yasam, secilenMateryal, secilenKaplama) {
  var ihlaller = [];
  var y = yasam || {};
  var m = secilenMateryal || {};
  var k = secilenKaplama || {};

  function icerir(obj, aranan) {
    if (!obj) return false;
    var tip = (obj.tip || "").toLowerCase();
    var ad = (obj.ad || "").toLowerCase();
    var oz = obj.ozellik || obj.ozellikler || {};
    var ozStr = typeof oz === "string" ? oz.toLowerCase() : JSON.stringify(oz).toLowerCase();
    return tip.indexOf(aranan) >= 0 || ad.indexOf(aranan) >= 0 || ozStr.indexOf(aranan) >= 0;
  }

  var isSurucu = !!y.geceSurus || (y.surusYuzdesi || 0) >= 20;
  var sikGeceSurus = !!y.geceSurus;

  // Kural 15: Surucu + sik gece surusu -> polarize/fotokromik YANLIS
  if (sikGeceSurus || (isSurucu && (y.surusYuzdesi || 0) >= 40)) {
    if (icerir(m, "polarize") || icerir(m, "npolar")) {
      ihlaller.push({
        kural: "T3-15a", seviye: "uyari",
        mesaj: "Surucu + sik gece/yogun surus + polarize materyal: gece farlari/sokak lambalari ile sorun yaratabilir. Modern LCD pano ile cakisir.",
        duzelt: "Polarize yerine SeeCoat Drive / PixAR DRIVE gibi parlama azaltan AR kaplama."
      });
    }
    if (icerir(m, "fotokromik") || icerir(m, "transitions") || icerir(m, "wizardeon")) {
      ihlaller.push({
        kural: "T3-15b", seviye: "uyari",
        mesaj: "Surucu + fotokromik: arac on cami UV'yi bloke ettigi icin fotokromik ARACTA KARARMAZ. Gundus arac kullaniminda etkisiz.",
        duzelt: "Fotokromik ek opsiyon olabilir ama TEK COZUM olarak onerme. Ayrica gunes cami oner."
      });
    }
  }

  // Kural 17: Sicak iklim + surucu + fotokromik
  if (y.sicakIklim && isSurucu && (icerir(m, "fotokromik") || icerir(m, "transitions"))) {
    ihlaller.push({
      kural: "T3-17", seviye: "uyari",
      mesaj: "Sicak iklim + surucu + fotokromik: 30C+ sicaklikta koyulasma yavaslar (%72.3'e duser). Yaz gun ortasinda yetersiz koruma.",
      duzelt: "Polarize gunes cami alternatifi veya Transitions Xtractive (sicaklik dirençli) oner."
    });
  }

  // Polarize + modern LCD pano
  if (y.modernLCDPano && icerir(m, "polarize")) {
    ihlaller.push({
      kural: "T3-P1", seviye: "uyari",
      mesaj: "Polarize + modern LCD pano/HUD: gosterge paneli kararabilir. Arac marka/modeline gore test etmeli.",
      duzelt: "Hasta bilgilendir veya polarize yerine AR kaplama dusun."
    });
  }

  return ihlaller;
}

if (typeof window !== "undefined") {
  window.kontrolFittingGeometri = kontrolFittingGeometri;
  window.kontrolKaplamaUyumu = kontrolKaplamaUyumu;
}

// ============================================================================
// FAZ 2 — MOTOR GENISLETME (CHUNK 3): 17 EDGE CASE (T2 - RECETE/MODEL)
// Plan satir 275-293. Recete-model eslestirme kurallari.
// Her uyari: { kural, seviye, mesaj, onerilenModeller, duzelt }
// ============================================================================

/**
 * Oblik eksen mi? 30-60 veya 120-150 derece arasinda.
 * @param {number} axis - derece
 */
function _oblikMi(axis) {
  if (axis === null || axis === undefined || isNaN(axis)) return false;
  var a = ((axis % 180) + 180) % 180;
  return (a >= 30 && a <= 60) || (a >= 120 && a <= 150);
}

/**
 * 17 edge case T2 kurallari. Recete + yasam + (opsiyonel) cerceve alir.
 * @param {object} recete - { sagSph, solSph, sagCyl, solCyl, sagAks, solAks, sagAdd, solAdd }
 * @param {object} cerceve - { b? }
 * @param {object} context - { yas, ilkKullanim }
 * @returns {Array<{kural, seviye, mesaj, onerilenModeller, duzelt}>}
 */
function kontrolKenarDurumlari(recete, cerceve, context) {
  var uyarilar = [];
  var r = recete || {};
  var c = cerceve || {};
  var ctx = context || {};
  var yas = ctx.yas || 0;
  var ilk = !!ctx.ilkKullanim;

  var sphler = [r.sagSph, r.solSph].filter(function (v) { return v !== null && v !== undefined && !isNaN(v); });
  var cyller = [r.sagCyl, r.solCyl].filter(function (v) { return v !== null && v !== undefined && !isNaN(v); });
  var addler = [r.sagAdd, r.solAdd].filter(function (v) { return v !== null && v !== undefined && !isNaN(v); });
  if (sphler.length === 0) return uyarilar;

  // ES (Spherical Equivalent) hesapla: SPH + CYL/2
  var esler = [];
  if (r.sagSph !== null && r.sagSph !== undefined) esler.push(r.sagSph + (r.sagCyl || 0) / 2);
  if (r.solSph !== null && r.solSph !== undefined) esler.push(r.solSph + (r.solCyl || 0) / 2);
  var maxAbsES = esler.length ? Math.max.apply(null, esler.map(function (e) { return Math.abs(e); })) : 0;
  var maxAbsSph = Math.max.apply(null, sphler.map(function (v) { return Math.abs(v); }));
  var minSph = Math.min.apply(null, sphler);
  var maxSph = Math.max.apply(null, sphler);
  var maxAbsCyl = cyller.length ? Math.max.apply(null, cyller.map(function (v) { return Math.abs(v); })) : 0;
  var maxAdd = addler.length ? Math.max.apply(null, addler) : 0;
  var sphFark = sphler.length === 2 ? Math.abs(sphler[0] - sphler[1]) : 0;
  var cylFark = cyller.length === 2 ? Math.abs(cyller[0] - cyller[1]) : 0;

  // Kural T2-1: |ES| >= 8 -> 1.74 zorunlu
  if (maxAbsES >= 8.0) {
    uyarilar.push({
      kural: "T2-1", seviye: "zorunlu",
      mesaj: "Cok yuksek recete (|ES| = " + maxAbsES.toFixed(2) + "D). 1.74 indeks zorunlu, kisisel FreeForm tasarim gerekli.",
      onerilenModeller: ["Nucleo 5D Double Asferik", "Matrix HD", "Seemax Ultimate Z"],
      duzelt: "1.74 + premium FreeForm sec."
    });
  } else if (maxAbsES >= 6.0) {
    // Kural T2-2
    uyarilar.push({
      kural: "T2-2", seviye: "uyari",
      mesaj: "Yuksek recete (|ES| = " + maxAbsES.toFixed(2) + "D). 1.67 indeks onerilir, kozmetik icin 1.74 dusunulebilir.",
      onerilenModeller: ["Nucleo 5D", "Matrix HD", "Presio Power Z"],
      duzelt: "1.67 veya 1.74 indeks."
    });
  }

  // Kural T2-3: SPH <= -10 -> yuksek miyopi
  if (minSph <= -10.0 && minSph > -15.0) {
    uyarilar.push({
      kural: "T2-3", seviye: "uyari",
      mesaj: "Yuksek miyopi (SPH " + minSph.toFixed(2) + "D). Kisa koridor + cift asferik + kucuk cerceve onerilir.",
      onerilenModeller: ["Nucleo 5D Double Asferik", "Nucleo 5D TekOdakliDoubleAsferik", "Seemax Ultimate Z"],
      duzelt: "1.74 + cift asferik teknoloji + cap <= 65mm."
    });
  }

  // Kural T2-4: SPH <= -15 -> lentikuler zorunlu
  if (minSph <= -15.0) {
    uyarilar.push({
      kural: "T2-4", seviye: "zorunlu",
      mesaj: "Asiri miyopi (SPH " + minSph.toFixed(2) + "D). Lentikuler (fried-egg) tasarim ZORUNLU.",
      onerilenModeller: ["Lentikuler (marka bagimsiz)"],
      duzelt: "Lentikuler tek odakli/progresif secilmeli - standart cam uretilemez."
    });
  }

  // Kural T2-5: SPH >= +4 -> asferik/atorik
  if (maxSph >= 4.0 && maxSph < 6.0) {
    uyarilar.push({
      kural: "T2-5", seviye: "uyari",
      mesaj: "Yuksek hipermetropi (SPH +" + maxSph.toFixed(2) + "D). Asferik/atorik tasarim ile merkez kalinligi ve 'buyuk goz' efekti azaltilir.",
      onerilenModeller: ["SlimEdge Asferik", "Nucleo 5D", "Seemax Ultimate Z"],
      duzelt: "1.67 asferik FreeForm + kucuk cerceve (50-52mm)."
    });
  } else if (maxSph >= 6.0) {
    // Kural T2-6
    uyarilar.push({
      kural: "T2-6", seviye: "zorunlu",
      mesaj: "Cok yuksek hipermetropi (SPH +" + maxSph.toFixed(2) + "D). Kucuk cerceve + atorik FreeForm ZORUNLU.",
      onerilenModeller: ["Atorik FreeForm (Nucleo/Seemax)"],
      duzelt: "1.67 veya 1.74 atorik + cap <= 50mm."
    });
  }

  // Kural T2-7: CYL 2-2.5 -> yumusak tasarim
  if (maxAbsCyl >= 2.0 && maxAbsCyl < 2.5) {
    uyarilar.push({
      kural: "T2-7", seviye: "uyari",
      mesaj: "Orta-yuksek astigmat (|CYL| " + maxAbsCyl.toFixed(2) + "D). Yumusak tasarim - adaptasyon 4 haftaya uzayabilir.",
      onerilenModeller: ["Synthesis (soft design)", "Varilux Comfort", "Presio Balance Z"],
      duzelt: "Yumusak progresif + uzun koridor."
    });
  }

  // Kural T2-8: CYL >= 2.5 -> kisisel/FreeForm zorunlu
  if (maxAbsCyl >= 2.5) {
    uyarilar.push({
      kural: "T2-8", seviye: "zorunlu",
      mesaj: "Yuksek astigmat (|CYL| " + maxAbsCyl.toFixed(2) + "D). Kisisel/FreeForm tasarim ZORUNLU - standart progresif kenarinda aberasyon kabul edilemez.",
      onerilenModeller: ["Synthesis", "Matrix HD", "Nucleo 5D", "Seemax Ultimate Z"],
      duzelt: "Premium FreeForm - pantoskopik + bombe + verteks olcum tam."
    });
  }

  // Kural T2-9: Oblik eksen + CYL >= 1.25 (veya >= 1.5 plana gore)
  var sagOblik = _oblikMi(r.sagAks);
  var solOblik = _oblikMi(r.solAks);
  var oblikVarMi = (sagOblik && Math.abs(r.sagCyl || 0) >= 1.25) || (solOblik && Math.abs(r.solCyl || 0) >= 1.25);
  if (oblikVarMi && maxAbsCyl >= 1.5 && maxAbsCyl < 2.5) {
    uyarilar.push({
      kural: "T2-9", seviye: "uyari",
      mesaj: "Oblik astigmat (aks 30-60 veya 120-150) + |CYL| " + maxAbsCyl.toFixed(2) + "D. Kisisel tasarim gerekli.",
      onerilenModeller: ["Synthesis", "Nucleo 5D", "Matrix HD"],
      duzelt: "Oblik aksta standart progresif yetersiz - FreeForm."
    });
  }

  // Kural T2-10: Anizometropi >= 2D -> binokuler dengeli
  if (sphFark >= 2.0 || cylFark >= 2.0) {
    uyarilar.push({
      kural: "T2-10", seviye: "zorunlu",
      mesaj: "Anizometropi (SPH fark " + sphFark.toFixed(2) + "D, CYL fark " + cylFark.toFixed(2) + "D). DuoBalance/binokuler dengeli tasarim ZORUNLU.",
      onerilenModeller: ["Nucleo 5D (DuoBalance)", "Varilux Physio 360 W.A.V.E", "Seemax Ultimate Z"],
      duzelt: "Binokuler dengeli FreeForm - dikey prizma kontrolu."
    });
  }

  // Kural T2-11: Ciddi anizometropi >= 3D
  if (sphFark >= 3.0) {
    uyarilar.push({
      kural: "T2-11", seviye: "uyari",
      mesaj: "Ciddi anizometropi (SPH fark " + sphFark.toFixed(2) + "D >= 3D). Slab-off prizma degerlendirilmeli.",
      onerilenModeller: ["Slab-off (DuoBalance Premium)", "Nucleo 5D"],
      duzelt: "Slab-off prizma + DuoBalance. Cift gorme / bas agrisi riski."
    });
  }

  // Kural T2-12: ADD >= 2.50 -> uzun koridor + B >= 30mm
  if (maxAdd >= 2.5 && maxAdd < 3.5) {
    var bYeterli = (c.b === undefined || c.b === null) ? null : (c.b >= 30);
    uyarilar.push({
      kural: "T2-12", seviye: (bYeterli === false ? "zorunlu" : "uyari"),
      mesaj: "Yuksek ADD (" + maxAdd.toFixed(2) + "D). Uzun koridor + B >= 30mm sart." + (bYeterli === false ? " Mevcut B " + c.b + "mm yetersiz." : ""),
      onerilenModeller: ["Uzun koridor FreeForm (koridor >= 11mm)"],
      duzelt: "A/G koridor (11-12mm) + B >= 30mm cerceve."
    });
  }

  // Kural T2-13: ADD >= 3.50 -> yalniz premium FreeForm
  if (maxAdd >= 3.5) {
    uyarilar.push({
      kural: "T2-13", seviye: "zorunlu",
      mesaj: "Maksimum ADD (" + maxAdd.toFixed(2) + "D). Yalniz premium custom FreeForm cam uretilebilir.",
      onerilenModeller: ["Seemax Ultimate Z", "Nucleo 5D Premium"],
      duzelt: "ADD 3.50'u standart progresif desteklemez - premium custom."
    });
  }

  // Kural T2-14: Genc + dusuk ADD + ilk kullanim -> anti-fatigue
  if (yas > 0 && yas < 45 && maxAdd > 0 && maxAdd <= 1.0 && ilk) {
    uyarilar.push({
      kural: "T2-14", seviye: "bilgi",
      mesaj: "Genc presbiyop (" + yas + " yas, ADD " + maxAdd.toFixed(2) + "D) + ilk kullanim. Tam progresif yerine anti-fatigue tek odakli daha uygun olabilir.",
      onerilenModeller: ["Serenity", "RelaxSee Neo", "Anti-fatigue Double Asferic", "EyeZen", "Hoya Sync III"],
      duzelt: "Anti-fatigue ile baslama, gercek presbiyopi gelince progresife gec."
    });
  }

  // Kural T2-15: Ilk kullanim + yuksek ADD veya yuksek CYL -> adaptasyon riski
  if (ilk && (maxAdd >= 2.25 || maxAbsCyl >= 2.0)) {
    uyarilar.push({
      kural: "T2-15", seviye: "uyari",
      mesaj: "Ilk kez progresif kullanici + yuksek recete (ADD " + maxAdd.toFixed(2) + "D, |CYL| " + maxAbsCyl.toFixed(2) + "D). %23 orta-siddetli sikayet riski (Nature 2017).",
      onerilenModeller: ["Synthesis Morphing", "Varilux Comfort", "Presio First", "Hoya Lifestyle"],
      duzelt: "Yumusak tasarim + uzun koridor + ADD <= 2.00 ile baslama dusunulebilir."
    });
  }

  // Kural T2-16: Ilk kullanim + oblik aks + CYL >= 1.25 -> %23 basarisizlik riski
  if (ilk && oblikVarMi && maxAbsCyl >= 1.25) {
    uyarilar.push({
      kural: "T2-16", seviye: "uyari",
      mesaj: "Ilk kullanim + oblik aks + |CYL| " + maxAbsCyl.toFixed(2) + "D. Basarisizlik riski yuksek - ozellikle dikkat.",
      onerilenModeller: ["Synthesis (soft)", "anti-fatigue ara gecis", "Presio First"],
      duzelt: "Anti-fatigue / soft progresif ile gecis yap."
    });
  }

  // Kural T2-17: Cerceve B < 28 + ADD >= 1.75 (plan 2-17 orijinal)
  if (c.b !== undefined && c.b !== null && c.b < 28 && maxAdd >= 1.75) {
    uyarilar.push({
      kural: "T2-17", seviye: "uyari",
      mesaj: "Cerceve B " + c.b + "mm < 28mm + ADD " + maxAdd.toFixed(2) + "D. Okuma zonu sigmaz.",
      onerilenModeller: ["Kisa koridor (D=5/E=7) modeller"],
      duzelt: "Daha derin cerceve veya kisa koridor - ya da ADD dusurulsun (klinik re-evaluation)."
    });
  }

  return uyarilar;
}

if (typeof window !== "undefined") {
  window.kontrolKenarDurumlari = kontrolKenarDurumlari;
  // FAZ 2 chunk 4: analizEt + hesaplaIndeksOnerisi'i de export (test ve embed icin)
  if (typeof analizEt === "function") window.analizEt = analizEt;
  if (typeof hesaplaIndeksOnerisi === "function") window.hesaplaIndeksOnerisi = hesaplaIndeksOnerisi;
  if (typeof indeksOneriAciklama === "function") window.indeksOneriAciklama = indeksOneriAciklama;
}
