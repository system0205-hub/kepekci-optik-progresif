// Kepekci Optik - FAZ 4: Yorum Motoru
// Her onerilen cam icin "bu cami alirsaniz..." Turkce satis-hazir anlati uretir.
// uretYorum(model, recete, yasam, context) -> obje doner
// Obje alanlari: { baslik, etiket, nedenUygun, buCamiAlirsaniz, altFarki, adaptasyon, uyari, fiyat }

(function () {
  "use strict";

  // ============================================================
  // Yardimci: Yasam tarzi ve recete profili cumleleri
  // ============================================================

  function _yasamCumlesi(yasam) {
    if (!yasam) return "Genel kullanim profilinize uygun.";
    var parcalar = [];
    if (yasam.geceSurus) parcalar.push("sik gece surusu yapiyorsunuz");
    else if ((yasam.surusYuzdesi || 0) >= 40) parcalar.push("gununuzun onemli bir bolumunu direksiyonda geciriyorsunuz");
    else if ((yasam.surusYuzdesi || 0) >= 20) parcalar.push("zaman zaman arac kullaniyorsunuz");
    if ((yasam.ofisSaat || 0) >= 8) parcalar.push("gunde " + yasam.ofisSaat + " saati ekran basinda geciriyorsunuz");
    else if ((yasam.ofisSaat || 0) >= 4) parcalar.push("ofis/ekran basinda duzenli vakit geciriyorsunuz");
    if ((yasam.dijitalSaat || 0) >= 6) parcalar.push("telefon/tablet kullaniminiz yogun");
    if ((yasam.sporYogunluk || 0) >= 40 && yasam.bombeliCerceve) parcalar.push("bombeli spor cercevesi kullaniyorsunuz");
    if (yasam.yakinYogunMeslek) parcalar.push("mesleginizde yukari yakin gorme gerekiyor");
    if (yasam.gozYorgunlugu) parcalar.push("goz yorgunlugu sikayetiniz var");
    if (parcalar.length === 0) return "Genel gunluk kullanim profilinize uygun.";
    return parcalar.join(", ").charAt(0).toUpperCase() + parcalar.join(", ").slice(1) + ".";
  }

  function _receteCumlesi(recete) {
    if (!recete) return "";
    var sph = Math.max(Math.abs(parseFloat(recete.sag && recete.sag.sph) || 0), Math.abs(parseFloat(recete.sol && recete.sol.sph) || 0));
    var cyl = Math.max(Math.abs(parseFloat(recete.sag && recete.sag.cyl) || 0), Math.abs(parseFloat(recete.sol && recete.sol.cyl) || 0));
    var add = Math.max(parseFloat(recete.sag && recete.sag.add) || 0, parseFloat(recete.sol && recete.sol.add) || 0);
    var esSag = (parseFloat(recete.sag && recete.sag.sph) || 0) + (parseFloat(recete.sag && recete.sag.cyl) || 0) / 2;
    var esSol = (parseFloat(recete.sol && recete.sol.sph) || 0) + (parseFloat(recete.sol && recete.sol.cyl) || 0) / 2;
    var maxES = Math.max(Math.abs(esSag), Math.abs(esSol));

    if (maxES >= 8) return "Receteniz cok yuksek (ES " + maxES.toFixed(2) + "D) ve kisisel tasarim gerektiriyor.";
    if (maxES >= 6) return "Receteniz yuksek (ES " + maxES.toFixed(2) + "D), inceltilmis kisisel cam sart.";
    if (maxES >= 4) return "Receteniz orta-yuksek (ES " + maxES.toFixed(2) + "D), 1.67 indeks onerilir.";
    if (cyl >= 2) return "Astigmatiniz " + cyl.toFixed(2) + "D - yumusak kisisel tasarim rahatligi artirir.";
    if (add >= 2.5) return "Yakin gucunuz yuksek (ADD " + add.toFixed(2) + "D), uzun koridor gerekiyor.";
    return "Receteniz standart/orta seviyede.";
  }

  // ============================================================
  // Etiket belirleyici: Mukemmel / Uygun / Butce dostu / Alternatif
  // ============================================================

  function _etiket(model, skor, siralama) {
    if (siralama === 0 && (skor >= 85 || model.seviye === "premium")) return "Mukemmel";
    if (siralama === 0) return "Uygun";
    if (model.seviye === "baslangic") return "Butce dostu";
    return "Alternatif";
  }

  // ============================================================
  // Adaptasyon suresi tahmini
  // ============================================================

  function _adaptasyon(model, recete, yasam, ilkKullanim) {
    var cyl = Math.max(Math.abs(parseFloat(recete && recete.sag && recete.sag.cyl) || 0), Math.abs(parseFloat(recete && recete.sol && recete.sol.cyl) || 0));
    var add = Math.max(parseFloat(recete && recete.sag && recete.sag.add) || 0, parseFloat(recete && recete.sol && recete.sol.add) || 0);
    var tasarim = model.tasarim || "";
    var seviye = model.seviye || "";

    // Premium FreeForm + normal recete -> kisa
    if (seviye === "premium" && tasarim === "freeform" && cyl < 2 && add < 2.5 && !ilkKullanim) return "kisa (2-3 gun)";
    // Ilk kullanim + yuksek recete -> uzun
    if (ilkKullanim && (cyl >= 2 || add >= 2.25)) return "uzun (1-2 hafta)";
    // Ilk kullanim + normal -> orta
    if (ilkKullanim) return "orta (3-7 gun)";
    // Yuksek CYL -> orta-uzun
    if (cyl >= 2.5) return "orta (4-10 gun)";
    if (cyl >= 2) return "orta (3-7 gun)";
    return "kisa (2-4 gun)";
  }

  // ============================================================
  // "Neden uygun" sablonu
  // ============================================================

  function _nedenUygun(model, recete, yasam, ilkKullanim) {
    var tekno = "";
    var teknolojiler = model.teknolojiler || [];
    var tekList = teknolojiler.slice(0, 2).join(" + ");

    var yasamC = _yasamCumlesi(yasam);
    var receteC = _receteCumlesi(recete);

    // Ozel amac eslesmesi
    if (model.ozelAmac === "drive" && yasam && (yasam.geceSurus || (yasam.surusYuzdesi || 0) >= 40)) {
      tekno = "Bu cam ozellikle surucu icin tasarlandi - gosterge paneli-yol arasi gecis yumusak, gece kamasmasi kontrol altinda" + (tekList ? " (" + tekList + ")" : "") + ".";
    } else if (model.ozelAmac === "ofis" && yasam && (yasam.ofisSaat || 0) >= 4) {
      tekno = "Ofis progresifi olarak yakin-orta bolge onceliklendirildi" + (tekList ? " (" + tekList + ")" : "") + ".";
    } else if (model.ozelAmac === "sport" && yasam && yasam.bombeliCerceve) {
      tekno = "Sport/bombeli cerceve uyumlu tasarim - yanal periferik gorusu optimize eder" + (tekList ? " (" + tekList + ")" : "") + ".";
    } else if (model.ozelAmac === "pilot" && yasam && yasam.yakinYogunMeslek) {
      tekno = "Yukari yakin (pilot/tamirci/dis hekimi) bolgesi genisletilmis" + (tekList ? " (" + tekList + ")" : "") + ".";
    } else if (model.ozelAmac === "antifatigue" && yasam && (yasam.gozYorgunlugu || (yasam.dijitalSaat || 0) >= 6)) {
      tekno = "Anti-fatigue tasarim - uzun sureli yakin calismada goz yorgunlugunu azaltir" + (tekList ? " (" + tekList + ")" : "") + ".";
    } else if (model.seviye === "premium" && model.tasarim === "freeform") {
      tekno = "Premium FreeForm kisisel tasarim - pantoskopik aci, verteks ve bombe olcumlerinize gore camin optik yuzeyi size ozel hesaplanir" + (tekList ? " (" + tekList + ")" : "") + ".";
    } else if (model.seviye === "baslangic") {
      tekno = "Giris seviyesi progresif - temel ihtiyaclari ekonomik fiyatla karsilar" + (tekList ? " (" + tekList + ")" : "") + ".";
    } else {
      tekno = "Dengeli orta seviye progresif - gunluk kullanima hitap eder" + (tekList ? " (" + tekList + ")" : "") + ".";
    }
    return yasamC + " " + receteC + " " + tekno;
  }

  // ============================================================
  // "Bu cami alirsaniz" sablonu (dogru beklenti olusturur)
  // ============================================================

  function _buCamiAlirsaniz(model, recete, yasam, ilkKullanim, adaptasyon) {
    var baslangic;
    if (adaptasyon.indexOf("uzun") === 0) {
      baslangic = "Ilk 3-5 gun koridor kenarinda hafif 'yuzme' hissi olasi, sonra beyin alisir. ";
    } else if (adaptasyon.indexOf("orta") === 0) {
      baslangic = "Ilk 2-3 gun yakin ve uzak bolgeler arasinda gecerken baginin konumuna dikkat etmeniz gerekebilir. ";
    } else {
      baslangic = "Alisma surecinde onemli bir zorluk beklenmiyor. ";
    }

    var fayda = "";
    if (model.ozelAmac === "drive") fayda = "Kisa surede sofor koltugunda rahatlik + gece surusunde daha az kamasma hissedersiniz.";
    else if (model.ozelAmac === "ofis") fayda = "Masasinda saatlerce calismada boynunuzu eskisi gibi uzatmaniza gerek kalmaz.";
    else if (model.ozelAmac === "sport" && yasam && yasam.bombeliCerceve) fayda = "Spor cercevenizin bombesi ile cam uyumu sayesinde kenar bozulmasi yok.";
    else if (model.ozelAmac === "antifatigue") fayda = "Gun sonu goz yorgunlugu ve bas agrisi sikayetiniz azalir.";
    else if (model.seviye === "premium") fayda = "Standart progresife gore okuma alaniniz %25-40 daha genis, kenarlardaki bulanik bolgeler minimumda.";
    else if (ilkKullanim) fayda = "Ilk progresif deneyiminizi zorlukla atmadan geciris yaparsiniz.";
    else fayda = "Gunluk kullanimda rahatlik - uzaktan yakina gecisiniz daha akisti olur.";

    return baslangic + fayda;
  }

  // ============================================================
  // "Alternatiften farki" - siralamaya gore bir alttakiyle kiyas
  // ============================================================

  function _altFarki(model, altModel) {
    if (!altModel) return null;
    var farklar = [];

    // Seviye karsilastirma
    var seviyeSira = { "premium": 3, "orta": 2, "baslangic": 1 };
    var bu = seviyeSira[model.seviye] || 2;
    var alt = seviyeSira[altModel.seviye] || 2;
    if (bu > alt) farklar.push("bir ust seviye tasarim");

    // Tasarim farki
    if (model.tasarim === "freeform" && altModel.tasarim !== "freeform") farklar.push("kisisel FreeForm (digerinde standart)");

    // Teknoloji farki
    var buTek = (model.teknolojiler || []).length;
    var altTek = (altModel.teknolojiler || []).length;
    if (buTek > altTek + 1) farklar.push("daha gelismis teknoloji paketi");

    // Koridor farki
    if ((model.koridorlar || []).length > (altModel.koridorlar || []).length) farklar.push("daha genis koridor secenekleri");

    if (farklar.length === 0) return "Teknolojik fark az, secim butce ve marka tercihinizle netlesir.";
    return altModel.ad + " ile kiyasla " + model.ad + " size " + farklar.join(", ") + " sunar.";
  }

  // ============================================================
  // Uyari uretimi (yuksek ADD, ilk kullanim, dar koridor vs)
  // ============================================================

  function _uyari(model, recete, yasam, ilkKullanim, context) {
    var uyarilar = [];
    var add = Math.max(parseFloat(recete && recete.sag && recete.sag.add) || 0, parseFloat(recete && recete.sol && recete.sol.add) || 0);
    var cyl = Math.max(Math.abs(parseFloat(recete && recete.sag && recete.sag.cyl) || 0), Math.abs(parseFloat(recete && recete.sol && recete.sol.cyl) || 0));

    if (add >= 2.5) uyarilar.push("ADD " + add.toFixed(2) + "D - uzun koridor ve derin cerceve sart");
    if (ilkKullanim && cyl >= 2) uyarilar.push("Ilk kez progresif + yuksek CYL - adaptasyon 1-2 hafta surebilir");
    if (context && context.siparisEdilebilir === false) uyarilar.push("Sistem zorunlu uyari verdi - siparis onayindan once cozulmesi gerekir");
    if (model.ozelAmac === "drive" && yasam && yasam.sicakIklim) uyarilar.push("Sicak iklimde fotokromik yavaslar - ek gunes cami dusun");

    if (uyarilar.length === 0) return null;
    return uyarilar.join(" | ");
  }

  // ============================================================
  // Fiyat ozeti (toplam cam + kaplama + islem)
  // ============================================================

  function _fiyat(model, secim) {
    if (!secim) return null;
    if (typeof toplamFiyat === "function") {
      var tf = toplamFiyat(model, secim.indeks, secim.materyal || null, secim.kaplama || null, secim.islemler || [], secim.indirim || 0);
      return tf;
    }
    // Fallback
    if (model.fiyatAraligi) {
      return { toplam: model.fiyatAraligi.min, detay: { cam: model.fiyatAraligi.min } };
    }
    return null;
  }

  // ============================================================
  // ANA FONKSIYON: uretYorum
  // ============================================================

  function uretYorum(model, recete, yasam, context) {
    if (!model) return null;
    var ctx = context || {};
    var siralama = ctx.siralama || 0;
    var skor = ctx.skor || 0;
    var ilkKullanim = !!ctx.ilkKullanim;
    var altModel = ctx.altModel || null;
    var secim = ctx.secim || null;

    var etiket = _etiket(model, skor, siralama);
    var adaptasyon = _adaptasyon(model, recete, yasam, ilkKullanim);
    var nedenUygun = _nedenUygun(model, recete, yasam, ilkKullanim);
    var buCamiAlirsaniz = _buCamiAlirsaniz(model, recete, yasam, ilkKullanim, adaptasyon);
    var altFarki = _altFarki(model, altModel);
    var uyari = _uyari(model, recete, yasam, ilkKullanim, ctx);
    var fiyat = _fiyat(model, secim);

    return {
      baslik: model.ad,
      etiket: etiket,
      nedenUygun: nedenUygun,
      buCamiAlirsaniz: buCamiAlirsaniz,
      altFarki: altFarki,
      adaptasyon: adaptasyon,
      uyari: uyari,
      fiyat: fiyat
    };
  }

  /**
   * Yorum objesini HTML'e render eder.
   * escapeHtml global'de olmali (utils.js).
   */
  function renderYorumHTML(yorum) {
    if (!yorum) return "";
    var esc = typeof escapeHtml === "function" ? escapeHtml : function (s) { return String(s || ""); };
    var etiketSinif = "yorum-etiket-" + (yorum.etiket || "alternatif").toLowerCase().replace(/\s+/g, "-");
    var h = '<div class="yorum-karti">';
    h += '<div class="yorum-baslik">' + esc(yorum.baslik) + ' <span class="yorum-etiket ' + etiketSinif + '">' + esc(yorum.etiket) + '</span></div>';
    h += '<div class="yorum-bolum"><strong>Neden uygun:</strong> ' + esc(yorum.nedenUygun) + '</div>';
    h += '<div class="yorum-bolum"><strong>Bu cami alirsaniz:</strong> ' + esc(yorum.buCamiAlirsaniz) + '</div>';
    if (yorum.altFarki) h += '<div class="yorum-bolum"><strong>Bir altindan farki:</strong> ' + esc(yorum.altFarki) + '</div>';
    h += '<div class="yorum-bolum"><strong>Adaptasyon suresi:</strong> ' + esc(yorum.adaptasyon) + '</div>';
    if (yorum.uyari) h += '<div class="yorum-bolum yorum-uyari"><strong>Dikkat:</strong> ' + esc(yorum.uyari) + '</div>';
    if (yorum.fiyat && yorum.fiyat.toplam) {
      var d = yorum.fiyat.detay || {};
      h += '<div class="yorum-bolum yorum-fiyat">';
      h += '<strong>Toplam fiyat:</strong> ' + (yorum.fiyat.toplam).toLocaleString("tr-TR") + ' TL';
      if (d.cam) h += ' <span style="color:#6b7280;font-size:12px;">(cam ' + d.cam.toLocaleString("tr-TR") + ' + kaplama ' + (d.kaplama || 0).toLocaleString("tr-TR") + ' + islem ' + (d.islemler || 0).toLocaleString("tr-TR") + ')</span>';
      h += '</div>';
    }
    h += '</div>';
    return h;
  }

  // Export
  if (typeof window !== "undefined") {
    window.uretYorum = uretYorum;
    window.renderYorumHTML = renderYorumHTML;
  }
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { uretYorum: uretYorum, renderYorumHTML: renderYorumHTML };
  }
})();
