/* Notübernachtung · Prototyp ohne Nextcloud. Daten liegen nur in diesem Browser. */
(function(){
"use strict";
document.body.classList.add("nu");
var $ = function(s, r){ return (r || document).querySelector(s); };
var $$ = function(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
var esc = Nu.esc, svg = Nu.svg;
var KEY = "nu-prototyp-v3";

// ---------- Datum ----------
function heute(){ var d = new Date(); if(d.getHours() < 12) d.setDate(d.getDate() - 1); d.setHours(0,0,0,0); return d; }
function pd(s){ var p = String(s).split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
function plus(d, n){ var x = new Date(d); x.setDate(x.getDate() + n); return x; }
function iso(d){ return d.getFullYear() + "-" + String(d.getMonth()+1).padStart(2,"0") + "-" + String(d.getDate()).padStart(2,"0"); }
function kurz(d){ return String(d.getDate()).padStart(2,"0") + "." + String(d.getMonth()+1).padStart(2,"0") + "."; }
function lang(d){ return d.toLocaleDateString("de-DE", {weekday:"long", day:"numeric", month:"long"}); }
function uhr(){ return new Date().toLocaleTimeString("de-DE", {hour:"2-digit", minute:"2-digit"}); }
var H = heute();

// ---------- Haus ----------
// St. Pius: Zimmer als Rahmen (für schmale Bildschirme); ein Teil ist eine Reihe; ein Paar in eckigen Klammern ist ein Stockbett.
var HAUS = [
  {id:"D", name:"Zimmer D", teile:[["D1",["D2","D3"]],[["D4","D5"],"D6"]]},
  {id:"T", name:"T-Zimmer", teile:[[["T1","T2"],"T3"]]},
  {id:"B", name:"Zimmer B", teile:[["B1","B2",["B3","B4"]]]},
  {id:"F", name:"Zimmer F", teile:[["F1","F2",["F3","F4"]]]},
  {id:"L", name:"Loggien", teile:[["L1","L2","L3","L4","L5"]]},
  {id:"E", name:"Esszimmer", teile:[["E1"]]},
  {id:"TH", name:"Tiny House", teile:[["TH1"]]},
  {id:"X", name:"Weitere Plätze", teile:[[]]}
];
var NIKO = [{id:"N", name:"Saal", teile:[["N1","N2","N3","N4"],["N5","N6","N7","N8"]]}, {id:"NX", name:"Weitere Plätze", teile:[[]]}];
// Grundriss St. Pius in den Einheiten des Bettenplans (viewBox -10 -10 971 800); Betten [x, y, Breite, Höhe]
var GR = {
  boeden:{D:[13,13,314,309], B:[13,328,314,402], T:[746,13,202,274], F:[670,293,278,437]},
  labels:{D:[19,264], B:[22,356], T:[756,40], F:[752,326]},
  einzel:{D1:[16,16,150,62], D6:[176,16,150,62], B1:[16,662,150,64], B2:[16,412,150,64], T3:[876,16,70,150], F1:[674,448,150,64], F2:[674,662,150,64]},
  stock:[["D2","D3",86,86,80,160],["D4","D5",176,86,80,160],["B3","B4",244,352,80,170],["T1","T2",750,110,80,170],["F3","F4",864,460,80,170]]
};
var GR_NIKO = {einzel:{}};
[30,110,190,270].forEach(function(x, i){ GR_NIKO.einzel["N" + (i + 1)] = [x,16,64,130]; GR_NIKO.einzel["N" + (i + 5)] = [x,274,64,130]; });
var GR_FEST = '<rect class="privat" x="333" y="13" width="188" height="309"/><path class="privat" d="M527 13 H740 V287 H664 V322 H527 Z"/><rect class="privat" x="578" y="451" width="86" height="279"/>' +
  '<text class="notiz" x="427" y="172" text-anchor="middle">PRIVAT</text><text class="notiz" x="633" y="172" text-anchor="middle">PRIVAT</text><text class="notiz" x="621" y="594" text-anchor="middle">PRIVAT</text>' +
  '<g class="wandlinien"><path class="wand" d="M336 733 H10 V10 H951 V733 H428"/><path class="wand" d="M170 10 V248 M170 316 V325"/><path class="wand" d="M330 10 V640 M330 712 V733"/><path class="wand" d="M524 10 V325"/><path class="wand" d="M743 10 V290"/><path class="wand" d="M10 325 H210 M282 325 H667"/><path class="wand" d="M667 290 H840 M912 290 H951"/><path class="wand" d="M667 290 V338 M667 410 V733"/><path class="wand" d="M330 448 H355 M427 448 H667"/><path class="wand" d="M458 448 V590 M458 662 V733"/><path class="wand" d="M575 448 V733"/></g>' +
  '<g><path class="tuer" d="M170 248 A68 68 0 0 0 102 316 M170 316 H102"/><path class="tuer" d="M210 325 A72 72 0 0 1 282 253 M282 325 V253"/><path class="tuer" d="M840 290 A72 72 0 0 1 912 218 M912 290 V218"/><path class="tuer" d="M667 410 A72 72 0 0 0 739 338 M667 338 H739"/><path class="tuer" d="M427 448 A72 72 0 0 1 355 520 M355 448 V520"/><path class="tuer" d="M330 712 A72 72 0 0 1 258 640 M330 640 H258"/><path class="tuer" d="M458 590 A72 72 0 0 0 386 662 M458 662 H386"/></g>' +
  '<text class="notiz flur-offen" x="498" y="392" text-anchor="middle">FLUR</text><text class="notiz flur-zu" x="498" y="392" text-anchor="middle">FLUR GESPERRT</text><text class="notiz" x="394" y="566" text-anchor="middle">FLUR</text><text class="notiz" x="516" y="594" text-anchor="middle">BAD</text>' +
  '<path d="M382 747 l-7 10 h14 z" fill="var(--tinte-3)"/><text class="notiz" x="382" y="775" text-anchor="middle">TREPPE</text>';
var SCHRAFFUR = '<defs><pattern id="nu-schraffur" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect class="schraffur-grund" width="8" height="8"/><line class="schraffur-strich" x1="0" y1="0" x2="0" y2="8"/></pattern></defs>';
var ORT = {L1:"Loggia",L2:"Loggia",L3:"Loggia",L4:"Loggia",L5:"Loggia",E1:"Esszimmer",TH1:"Tiny House"};
function alleBetten(plan){ var out = []; plan.forEach(function(z){ z.teile.forEach(function(t){ t.forEach(function(x){ if(Array.isArray(x)) x.forEach(function(y){ out.push({nr:y, zimmer:z.id}); }); else out.push({nr:x, zimmer:z.id}); }); }); }); return out; }
var BETTEN_HAUS, BETTEN_NIKO = alleBetten(NIKO), ZIMMER_VON = {};
function betteNeuBerechnen(){
  var ex = (S && S.extra) || [];
  ex.forEach(function(x){ ORT[x.id] = x.name; });
  HAUS[HAUS.length - 1].teile = [ex.filter(function(x){ return x.ort !== "niko"; }).map(function(x){ return x.id; })];
  NIKO[NIKO.length - 1].teile = [ex.filter(function(x){ return x.ort === "niko"; }).map(function(x){ return x.id; })];
  BETTEN_HAUS = alleBetten(HAUS); BETTEN_NIKO = alleBetten(NIKO); ZIMMER_VON = {};
  BETTEN_HAUS.concat(BETTEN_NIKO).forEach(function(b){ ZIMMER_VON[b.nr] = b.zimmer; });
}
// Nummerntausch: S.lage[nr] = Platz (ursprüngliche Nummer), an dem die Nummer jetzt im Plan steht. Belegung bleibt bei der Nummer.
function posOf(nr){ return (S.lage && S.lage[nr]) || nr; }
function anPlatz(platz){ var k = Object.keys(S.lage || {}).find(function(n){ return S.lage[n] === platz; }); return k || platz; }
function lageVon(nr){ return STOCK[posOf(nr)]; }
var STOCK = {}; HAUS.concat(NIKO).forEach(function(z){ z.teile.forEach(function(t){ t.forEach(function(x){ if(Array.isArray(x)){ STOCK[x[0]] = "oben"; STOCK[x[1]] = "unten"; } }); }); });
var SPRACHEN = [["de","Deutsch","Deutsch"],["en","English","Englisch"],["fr","Français","Französisch"],["es","Español","Spanisch"],["ar","العربية","Arabisch"],["fa","فارسی","Farsi"],["pl","Polski","Polnisch"],["ro","Română","Rumänisch"],["bg","Български","Bulgarisch"],["ru","Русский","Russisch"]];
var SPRACHE = {}; SPRACHEN.forEach(function(s){ SPRACHE[s[0]] = s; });

// ---------- Beispieldaten ----------
function beispiel(){
  var G = {}, n = 0;
  function gast(vor, o){ var id = "g" + (++n); G[id] = Object.assign({id:id, vorname:vor, nachname:"", spitz:"", sprache:"de", nr:"2026-27-" + String(n).padStart(4,"0"), erste:iso(plus(H,-20)), naechte:12, laus:"liegt", lausSeit:null, lausFrist:null, unterschrieben:true, uebersetzung:null, dokumente:[], sanktionen:[], notizen:[], extern:false, standort:"haus"}, o || {}); if(G[id].unterschrieben && G[id].sprache !== "de" && G[id].uebersetzung === null) G[id].uebersetzung = G[id].sprache; return id; }
  var b = {};
  function bett(nr, g, s, o){ b[nr] = Object.assign({g:g, s:s}, o || {}); }
  bett("D1", gast("Paul", {naechte:21}), "anwesend");
  bett("D2", gast("Tom", {sprache:"pl", naechte:44, notizen:[{datum:iso(plus(H,-1)), text:"Fragt nach Arbeitsschuhen in Größe 44.", von:"Sam", quelle:"aus Bericht vom " + kurz(plus(H,-1))}]}), "anwesend");
  bett("D3", null, "frei");
  bett("D4", gast("Max", {spitz:"Professor", sprache:"ar", naechte:12}), "erwartet");
  bett("D5", gast("Felix", {sprache:"bg", naechte:9, sanktionen:[{stufe:"Gelbe Karte", datum:iso(plus(H,-3)), grund:"Laute Musik nach 23 Uhr nach zwei Hinweisen", von:"Sam"}]}), "anwesend");
  bett("D6", gast("Anna", {naechte:30}), "gehalten", {bis:iso(plus(H,4)), grund:"Krankenhaus"});
  bett("T1", gast("Jan", {sprache:"fa", naechte:3, laus:"fehlt", lausSeit:iso(plus(H,-3))}), "erwartet");
  bett("T2", gast("Leon", {sprache:"ar", naechte:17}), "freibis", {bis:iso(plus(H,6))});
  bett("T3", gast("Laura", {sprache:"ro", naechte:30}), "anwesend");
  bett("B1", gast("Tim", {sprache:"ro", naechte:1, laus:"fehlt", lausSeit:iso(plus(H,-1))}), "erwartet");
  bett("B2", null, "frei");
  bett("B3", gast("Lukas", {sprache:"ro", naechte:4}), "erwartet", {vorher:1});
  bett("B4", gast("Erik", {sprache:"ru", naechte:15}), "anwesend");
  bett("F1", gast("Moritz", {naechte:20}), "anwesend");
  bett("F2", gast("Simon", {naechte:8}), "fehlt2", {n:2});
  bett("F3", gast("Lisa", {naechte:11, notizen:[{datum:iso(plus(H,-2)), text:"Arzttermin Donnerstag, kommt eventuell später.", von:"Leitung", quelle:"Hinweis"}]}), "anwesend");
  bett("F4", null, "frei");
  bett("L1", gast("Noah", {naechte:6}), "anwesend");
  bett("L2", gast("Julia", {sprache:"pl", naechte:2}), "fehlt", {n:1});
  bett("L3", null, "frei"); bett("L4", gast("Nina", {naechte:5}), "anwesend"); bett("L5", gast("Max", {sprache:"fa", naechte:5, laus:"liegt", unterschrieben:false, dokumente:[]}), "anwesend");
  bett("E1", gast("Otto", {naechte:1, laus:"nicht", notizen:[{datum:iso(H), text:"Mit dem Kältebus gekommen.", von:"Kim", quelle:"Aufnahme"}]}), "anwesend"); bett("TH1", gast("Kai", {naechte:9}), "anwesend");
  // St. Nikolaus: lange bekannte Gäste, fortgeschrieben
  ["Karl","Sophie","Alexander","Peter","Hans","Eva","Frank"].forEach(function(v, i){
    var nr = ["N1","N2","N3","N5","N6","N7","N8"][i];
    bett(nr, gast(v, {standort:"nikolaus", naechte:30 + i, unterschrieben:false}), "anwesend", {fort:true});
  });
  bett("N4", null, "frei"); bett("N9", null, "frei");
  // weitere Personen in der Gästedatenbank
  gast("Maximilian", {nachname:"S.", naechte:0, sanktionen:[{stufe:"Hausverbot", datum:iso(plus(H,-10)), grund:"Gewalt gegen einen anderen Gast", von:"Leitung", bis:iso(plus(H,170))}]});
  gast("Stefan", {nachname:"Schmidt", sprache:"ro", naechte:3});
  gast("Sarah", {sprache:"fr", naechte:2});
  gast("Max", {nachname:"Mustermann", sprache:"ar", naechte:14, erste:iso(plus(H,-60))});
  gast("Markus", {sprache:"pl", naechte:7});
  var dusche = {}; dusche[iso(H)] = {"19:00":{g:"g1", s:"erledigt"}, "20:00":{g:"g12", s:"geplant"}, "20:30":{g:"g14", s:"geplant"}};
  var hinweise = [
    {id:"h1", von:"Leitung", text:"Heizung im T-Zimmer ist defekt. Der Handwerker kommt Donnerstag, bis dahin den Heizlüfter nutzen.", bis:iso(plus(H,3)), wichtig:true, quelle:"Nextcloud"},
    {id:"h2", von:"Sam", text:"Neue Decken liegen im Keller, Regal links.", bis:iso(plus(H,2)), wichtig:false, quelle:"App"}
  ];
  var termine = [
    {datum:iso(H), art:"Bettwäsche", titel:"Bettwäschewechsel Zimmer B", sym:"wiederholen"},
    {datum:iso(plus(H,1)), art:"Sondertermin", titel:"Lieferung Decken", sym:"kalender"},
    {datum:iso(plus(H,5)), art:"Feiertag", titel:"Morgen Feiertag, heute einkaufen", sym:"einkauf"},
    {datum:iso(plus(H,7)), art:"Bettwäsche", titel:"Bettwäschewechsel Zimmer D", sym:"wiederholen"},
    {datum:iso(plus(H,10)), art:"Sondertermin", titel:"Handwerker Heizung", sym:"kalender"}
  ];
  var dienstplan = {}, kueche = {}, m0 = new Date(H.getFullYear(), H.getMonth() - 1, 1), m2 = new Date(H.getFullYear(), H.getMonth() + 2, 0);
  for(var d = new Date(m0); d <= m2; d = plus(d, 1)){ var i = Math.round((d - H) / 864e5), r = ((i % 3) + 3) % 3, dd = iso(d);
    dienstplan[dd] = r === 0 ? ["Sam","Robin"] : r === 1 ? ["Kim","Sam"] : ["Chris", ""]; kueche[dd] = d.getDate() % 2 ? "Mika" : "Jule"; }
  dienstplan[iso(H)] = ["Kim","Sam"];
  // Sam: heute ist der letzte geplante Dienst in diesem Monat
  Object.keys(dienstplan).forEach(function(dd){ var x = pd(dd); if(x > H && x.getMonth() === H.getMonth()) dienstplan[dd] = dienstplan[dd].map(function(n){ return n === "Sam" ? "Jule" : n; }); });
  // Originalplan (Stand vor Monatsanfang) für Vormonat und laufenden Monat
  var plan0 = {}, einsaetze = {}, mEnde = new Date(H.getFullYear(), H.getMonth() + 1, 0);
  for(var d2 = new Date(m0); d2 <= mEnde; d2 = plus(d2, 1)){ var k2 = iso(d2); plan0[k2] = {nacht:dienstplan[k2].slice(), kueche:kueche[k2]}; }
  // Tatsächliche Einsätze bis gestern, aus unterschriebenen Dienstberichten; zwei Abweichungen im Vormonat
  var krankTag = null, tauschTag = null;
  for(var d3 = new Date(m0); d3 < H; d3 = plus(d3, 1)){ var k3 = iso(d3), p3 = plan0[k3];
    var e3 = p3.nacht.map(function(n, j){ return n ? {name:n, rolle:"Betreuung " + (j + 1), geplant:n, grund:""} : null; }).filter(Boolean).concat([{name:p3.kueche, rolle:"Küche", geplant:p3.kueche, grund:""}]);
    if(d3.getMonth() === m0.getMonth() && d3.getDate() > 8){
      if(!krankTag && p3.nacht.indexOf("Robin") >= 0){ krankTag = k3; e3.forEach(function(e){ if(e.name === "Robin"){ e.name = "Chris"; e.grund = "Krankheit"; } }); }
      else if(krankTag && !tauschTag && d3.getDate() > 15 && p3.nacht.indexOf("Kim") >= 0 && p3.nacht.indexOf("Jule") < 0){ tauschTag = k3; e3.forEach(function(e){ if(e.name === "Kim"){ e.name = "Jule"; e.grund = "Tausch"; } }); }
    }
    einsaetze[k3] = e3; }
  var archiv = [
    {datum:iso(plus(H,-1)), vorfall:false, personen:"Sam, Chris", text:"Ruhige Nacht. Toilettenpapier fehlt."},
    {datum:iso(plus(H,-3)), vorfall:true, personen:"Sam, Robin", text:"Gelbe Karte für @Felix: laute Musik nach 23 Uhr nach zwei Hinweisen."},
    {datum:iso(plus(H,-2)), vorfall:false, personen:"Kim, Chris", text:"Lukas (B3) ist nicht gekommen, fehlt unentschuldigt."},
    {datum:iso(plus(H,-4)), vorfall:false, personen:"Kim, Sam", text:"Schlüssel 7 fehlt."}
  ];
  return {v:3, theme:"auto", G:G, betten:b, offRooms:{}, offBeds:{N4:true}, notbett:{L3:true, E1:true}, extra:[{id:"N9", name:"Matratze Flur", ort:"niko"}], lage:{}, dusche:dusche, hinweise:hinweise, termine:termine, dienstplan:dienstplan, kueche:kueche, plan0:plan0, einsaetze:einsaetze, nachweise:{}, planLog:[], nachweisBeispiel:true, archiv:archiv,
    berichte:{}, aktiv:0, sync:{offline:false, ausstehend:0, zuletzt:"21:00"}, naechsteNr:n + 1, ampel:{gruen:3}, kht:{gemeldet:false, zahl:null, um:null}};
}
var S;
function laden(){ try{ var r = localStorage.getItem(KEY); if(r){ var s = JSON.parse(r); if(s && s.v === 3) return s; } }catch(e){} return beispiel(); }
function speichern(){ try{ localStorage.setItem(KEY, JSON.stringify(S)); }catch(e){} }
S = laden();
var nachweisBeispielOffen = !!S.nachweisBeispiel;
betteNeuBerechnen();

// ---------- Zustand der Oberfläche ----------
var U = {bereich:"plan", tag:0, reiter:"haus", offen:null, schnell:null, detail:null, modal:null, wizard:null, glocke:false, auswahl:null, einst:"darstellung", pinOk:false, pin:"", dienstReiter:"bericht", kalTag:iso(H), kalAnsicht:"woche", schreiben:false, gSuche:"", gFilter:"alle", akte:null, duschTag:0};
function tagDatum(){ return plus(H, U.tag); }
function vergangen(){ return U.tag < 0; }

// ---------- Ableitungen ----------
function gastVon(nr){ var b = S.betten[nr]; return b && b.g ? S.G[b.g] : null; }
function istAus(nr){ return !!(S.offBeds[nr] || S.offRooms[ZIMMER_VON[nr]]); }
function status(nr){
  if(istAus(nr)) return "aus";
  var b = S.betten[nr], s = b ? b.s : "frei";
  if(U.tag < 0 && b && b.g && ["erwartet","anwesend","fehlt","fehlt2"].indexOf(s) >= 0){
    // Vergangene Nächte: wer heute erwartet wird, war da; wer schon gestern fehlte, fehlte
    return U.tag === -1 && (s === "fehlt2" || b.vorher) ? "fehlt" : "anwesend";
  }
  return s;
}
// frei im Sinne der Zählung: frei, frei bis Rückkehr, ab der 2. Nacht unentschuldigt
function zaehlt(nr){ var s = status(nr); return s === "frei" || s === "freibis" || s === "fehlt2"; }
function belegtKht(nr){ var s = status(nr); return s === "anwesend" || s === "erwartet" || s === "fehlt" || s === "gehalten"; }
function bettVon(gid){ return Object.keys(S.betten).find(function(n){ return S.betten[n].g === gid && !istAus(n) && status(n) !== "fehlt2"; }) || null; }
function gleicherVorname(g){ var v = g.vorname.toLowerCase(); return Object.keys(S.G).some(function(k){ return k !== g.id && S.G[k].vorname.toLowerCase() === v; }); }
// Anzeigename: bei gleichen Vornamen mit Bettnummer, sonst mit Nachname, Spitzname oder Aufnahmenummer
function zusatz(g){ var b = bettVon(g.id); return b ? b : g.nachname ? g.nachname : g.spitz ? "„" + g.spitz + "“" : g.nr ? "Nr. " + g.nr.slice(-4) : "ohne Bett"; }
function anzeige(g){ return g.vorname + (gleicherVorname(g) ? " (" + zusatz(g) + ")" : ""); }
function naechteText(n){ return n === 1 ? "1 Nacht" : n + " Nächte"; }
function pdfName(g){ return (g.nr ? g.nr.slice(-4) : "0000") + "_" + g.vorname + (g.nachname ? "_" + g.nachname : "") + "_" + (g.unterschriebenAm || g.erste) + ".pdf"; }
function khtZahlen(){
  // Notbetten werden nur über den Kältebus belegt: sie zählen mit, wenn sie belegt sind, freie Notbetten nicht
  var alle = BETTEN_HAUS.concat(BETTEN_NIKO).filter(function(b){ return !istAus(b.nr) && (!S.notbett[b.nr] || belegtKht(b.nr)); });
  var belegt = alle.filter(function(b){ return belegtKht(b.nr); });
  return {gesamt:alle.length, belegt:belegt.length, frei:alle.length - belegt.length, alle:alle};
}
function kennzahlen(){
  var k = khtZahlen();
  var haus = BETTEN_HAUS.filter(function(b){ return !istAus(b.nr); });
  var niko = BETTEN_NIKO.filter(function(b){ return !istAus(b.nr); });
  var zahl = function(liste, s){ return liste.filter(function(b){ return status(b.nr) === s; }).length; };
  var ampel = k.frei >= S.ampel.gruen ? "gruen" : k.frei >= 1 ? "gelb" : "rot";
  return {frei:k.frei, belegt:k.belegt, gesamt:k.gesamt, ampel:ampel, haus:haus.length, anwesendHaus:zahl(haus, "anwesend"), erwartet:zahl(haus, "erwartet"),
    freiHaus:haus.filter(function(b){ return zaehlt(b.nr); }).length, niko:niko.length, nikoBelegt:niko.filter(function(b){ return !zaehlt(b.nr); }).length};
}
function lausTage(g){ if(g.laus !== "fehlt" || !g.lausSeit) return 0; return Math.round((H - pd(g.lausSeit)) / 864e5); }
function aktivSank(g){ return g.sanktionen.filter(function(s){ return !s.aufgehoben && (!s.bis || s.bis >= iso(H)); }); }
function hausverbot(g){ return aktivSank(g).find(function(s){ return s.stufe === "Hausverbot"; }); }
function duschSlot(gid){ var d = S.dusche[iso(tagDatum())] || {}; for(var k in d){ if(d[k].g === gid && d[k].s === "geplant") return k; } return null; }
function ortText(nr){ return (ORT[nr] || "") + (S.notbett[nr] ? (ORT[nr] ? " · " : "") + "Notbett" : ""); }
function bettKarte(nr, kompakt){
  var b = S.betten[nr] || {s:"frei"}, s = status(nr), g = gastVon(nr), sym = [], warn = false;
  if(g && s !== "aus" && s !== "fehlt2"){
    var lt = lausTage(g);
    if(g.laus === "fehlt") sym.push(lt >= 3 ? "warnung" : "laeuseschein-fehlt");
    if(lt >= 3 && !(g.lausFrist && g.lausFrist >= iso(H))) warn = true;
    var a = aktivSank(g);
    if(a.some(function(x){ return x.stufe === "Hausverbot"; })) sym.push("karte-rot");
    else if(a.some(function(x){ return x.stufe === "Gelbe Karte"; })) sym.push("karte-gelb");
    if(g.notizen.length && !kompakt) sym.push("notiz");
  }
  var data = {nr:nr, s:s, name:g ? g.vorname : "", naechte:g ? g.naechte : null, symbole:sym.slice(0, kompakt ? 2 : 4), dusche:g && s !== "fehlt2" && duschSlot(g.id), warn:warn, bis:b.bis ? kurz(pd(b.bis)) : "", fehltN:b.n || 2, kompakt:kompakt, lage:lageVon(nr) || ""};
  var html = Nu.bett(data);
  if(b.fort && s === "anwesend" && !kompakt) html = html.replace('class="naechte">', 'class="naechte">fortgeschrieben · ');
  if(ortText(nr) && s === "frei" && !kompakt) html = html.replace("<span>Gast aufnehmen</span>", "<span>" + esc(ortText(nr)) + "</span>");
  var cls = (U.offen === nr ? " is-offen" : "") + (U.neu === nr ? " is-neu" : "") + (U.gesetzt && U.gesetzt.indexOf(nr) >= 0 ? " is-gesetzt" : "") + (U.auswahl && (s === "aus" || nr === U.auswahl) ? " is-ausgegraut" : "");
  return html.replace('class="nu-bett', 'class="nu-bett' + cls);
}
function abgleichMerken(){ if(S.sync.offline) S.sync.ausstehend++; else { S.sync.zuletzt = uhr(); } }
function commit(){ abgleichMerken(); speichern(); render(); }

// ---------- Theme ----------
function themeSetzen(){
  var t = S.theme, h = new Date().getHours();
  var nacht = t === "nacht" || (t === "auto" && (h >= 20 || h < 7)) || (t === "system" && window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.setAttribute("data-theme", nacht ? "nacht" : "tag");
}

// ---------- Gerüst ----------
var NAV = [["plan","bett","Betten&shy;plan"],["gaeste","personen","Gäste"],["dienst","bericht","Dienst &amp; Bericht"],["kalender","kalender","Kalender"],["einstellungen","regler","Einstel&shy;lungen"]];
function leiste(){
  var offen = !bericht() || bericht().status !== "abgeschlossen";
  return '<nav class="nu-leiste" aria-label="Bereiche"><div class="nu-leiste-marke" title="Notübernachtung">' + svg("bett") + '</div>' +
    NAV.map(function(n){ var dot = n[0] === "dienst" && offen && U.tag === 0 ? '<span style="position:absolute;top:2px;right:12px;width:10px;height:10px;border-radius:50%;background:var(--warnung)"></span>' : '';
      return '<button class="nu-nav" data-act="bereich" data-arg="' + n[0] + '"' + (U.bereich === n[0] ? ' aria-current="page"' : '') + '><span class="nu-nav-ind" style="position:relative">' + svg(n[1]) + dot + '</span>' + n[2] + '</button>'; }).join("") +
    '<button class="nu-nav p-nacht-knopf" data-act="themaWechseln" aria-label="Tag- oder Nachtmodus"><span class="nu-nav-ind">' + svg(document.documentElement.getAttribute("data-theme") === "nacht" ? "sonne" : "mond") + '</span>' + (document.documentElement.getAttribute("data-theme") === "nacht" ? "Tag" : "Nacht") + '</button></nav>';
}
function kopf(){
  var d = tagDatum(), sy = S.sync, syncHtml;
  if(sy.offline) syncHtml = '<button class="nu-sync" data-s="offline" data-act="abgleichBlatt">' + svg("wolke-aus") + 'Offline' + (sy.ausstehend ? ' – ' + sy.ausstehend + ' Änderungen ausstehend' : '') + '</button>';
  else syncHtml = '<button class="nu-sync" data-s="ok" data-act="abgleichBlatt">' + svg("wolke-ok") + 'Synchronisiert ' + esc(sy.zuletzt) + '</button>';
  var anz = erinnerungen().length;
  var dp = S.dienstplan[iso(d)] || ["",""];
  var pers = dp.filter(Boolean).map(function(n, i){ return '<button class="nu-person" data-act="aktiv" data-arg="' + i + '" aria-pressed="' + (S.aktiv === i) + '"><span class="nu-kuerzel">' + esc(n.slice(0,2).toUpperCase()) + '</span>' + esc(n) + '</button>'; }).join("");
  return '<header class="nu-kopf"><div class="nu-datum"><button class="nu-iconbtn" data-act="tag" data-arg="-1" aria-label="Vortag">' + svg("zurueck") + '</button><button class="nu-datum-text" data-act="tag" data-arg="0" style="border:0;background:transparent;cursor:pointer;color:inherit">' + esc(lang(d)) + '<small>' + (U.tag === 0 ? "Dienst 18:45 – 08:00" : "vergangen · zurück zu heute") + '</small></button><button class="nu-iconbtn" data-act="tag" data-arg="1" aria-label="Folgetag"' + (U.tag === 0 ? ' disabled' : '') + '>' + svg("weiter") + '</button></div>' +
    (vergangen() ? '<span class="nu-nurlesen">' + svg("schloss","klein") + 'Nur lesen</span>' : '') +
    '<span class="nu-kopf-raum"></span><span class="p-proto">' + svg("info","klein") + 'Prototyp · Beispieldaten</span>' + syncHtml +
    '<button class="nu-iconbtn nu-iconbtn--fl" data-act="glocke" aria-label="' + anz + ' offene Erinnerungen">' + svg("glocke") + (anz ? '<span class="nu-zaehler' + (U.pop ? ' pop' : '') + '">' + anz + '</span>' : '') + '</button>' +
    '<div class="nu-dienst">' + pers + '</div></header>';
}
// Team (Personalliste) und Leitung; im Beispiel anonymisiert
var TEAM = ["Kim","Sam","Robin","Chris","Jule","Mika"], LEITUNG = "Leitung";
function aktivePerson(){ var dp = S.dienstplan[iso(H)] || ["Kim"]; return dp[S.aktiv] || dp[0] || "Betreuung"; }
function erinnerungen(){
  var out = [];
  BETTEN_HAUS.forEach(function(b){ var g = gastVon(b.nr); if(g && g.laus === "fehlt" && status(b.nr) !== "aus" && status(b.nr) !== "frei" && status(b.nr) !== "freibis"){ var t = lausTage(g); if(t >= 1) out.push({sym: t >= 3 ? "warnung" : "laeuseschein-fehlt", warn:true, text:"Läuseschein · " + g.vorname + ", " + b.nr, klein: t >= 3 ? "fehlt seit " + t + " Tagen" : "Tag " + (t + 1), nr:b.nr}); } });
  BETTEN_HAUS.concat(BETTEN_NIKO).forEach(function(b){ if(status(b.nr) === "fehlt2"){ var g = gastVon(b.nr); out.push({sym:"abwesend", warn:true, text:g.vorname + ", " + b.nr + " fehlt " + (S.betten[b.nr].n || 2) + ". Nacht", klein:"unentschuldigt · Bett zählt als frei", nr:b.nr}); } });
  S.hinweise.filter(function(h){ return h.neu; }).forEach(function(h){ out.push({sym:"bericht", text:"Neuer Hinweis von " + h.von, klein:h.text.slice(0, 48) + "…", dienst:true}); });
  var d = S.dusche[iso(H)] || {};
  Object.keys(d).sort().forEach(function(k){ if(d[k].s === "geplant"){ var g = S.G[d[k].g]; out.push({sym:"dusche", text:"Dusche " + k + " · " + (g ? g.vorname : ""), klein:"Duschplan", dusche:true}); } });
  return out;
}
function render(){
  themeSetzen();
  var inhalt = U.bereich === "plan" ? planAnsicht() : U.bereich === "gaeste" ? gaesteAnsicht() : U.bereich === "dienst" ? dienstAnsicht() : U.bereich === "kalender" ? kalenderAnsicht() : einstellungenAnsicht();
  var app = $("#app");
  var scrollTop = $(".nu-inhalt") ? $(".nu-inhalt").scrollTop : 0;
  app.innerHTML = '<div class="nu-app">' + leiste() + kopf() + '<main class="nu-inhalt" id="inhalt">' + inhalt + '</main><div class="p-ueber" id="ueber">' + ueberlagerungen() + '</div><div class="p-toasts" id="toasts"></div></div>';
  if($(".nu-inhalt")) $(".nu-inhalt").scrollTop = U.oben ? 0 : scrollTop;
  U.oben = false;
  nachRender();
  U.neu = null; U.gesetzt = null; U.pop = false; U.rein = false; U.wizardRein = false; U.schnellRein = false;
}
function ueberlagerungen(){
  var h = "";
  if(U.detail) h += '<div class="p-detail-wrap">' + detailBereich() + '</div>';
  if(U.schnell) h += schnellauswahl();
  if(U.glocke) h += glockenListe();
  if(U.wizard) h += assistent();
  if(U.modal) h += '<div class="p-modal" role="presentation"><div class="nu-scrim' + (U.rein ? ' is-rein' : '') + '" data-act="modalZu"></div>' + (U.rein ? U.modal.replace(/^<div class="(nu-dialog|p-blatt)/, '<div class="$1 is-rein') : U.modal) + '</div>';
  return h;
}
function nachRender(){
  if(U.schnell){ positioniereSchnell(); }
  if(U.wizard) wizardNachRender();
  if(U.modalNach){ var f = U.modalNach; f(); }
  $$(".nu-unterschrift[data-pad]").forEach(function(r){ padAnbinden(r); });
  var detail = $(".nu-detail"); if(detail && U.detailRein){ detail.classList.add("rein"); U.detailRein = false; }
  if(U.bereich === "dienst") dienstNachRender();
  if(U.bereich === "gaeste") gaesteNachRender();
}
function toast(sym, titel, text, dauer){
  var t = document.createElement("div");
  t.className = "nu-einblendung";
  t.innerHTML = svg(sym) + '<div><b>' + esc(titel) + '</b><span>' + esc(text || "") + '</span></div><button class="nu-iconbtn" aria-label="Schließen">' + svg("schliessen") + '</button><i class="lauf" style="animation-duration:' + (dauer || 6000) + 'ms"></i>';
  t.querySelector("button").onclick = function(){ t.remove(); };
  $("#toasts").appendChild(t);
  setTimeout(function(){ t.style.transition = "opacity 150ms"; t.style.opacity = "0"; setTimeout(function(){ t.remove(); }, 160); }, dauer || 6000);
}

// ---------- Bettenplan ----------
function schmal(){ return window.matchMedia && window.matchMedia("(max-width: 900px)").matches; }
function zimmerHtml(z){
  var aus = !!S.offRooms[z.id];
  var betten = []; z.teile.forEach(function(t){ t.forEach(function(x){ (Array.isArray(x) ? x : [x]).forEach(function(n){ betten.push(n); }); }); });
  if(!betten.length) return "";
  var aktiv = betten.filter(function(n){ return !istAus(n); });
  var frei = aktiv.filter(zaehlt).length;
  var teilHtml = function(t){ return t.map(function(x){
    if(Array.isArray(x)) return '<div class="nu-stockbett"><div class="nu-stockbett-teil"><span>oben</span>' + bettKarte(anPlatz(x[0])) + '</div><div class="nu-stockbett-teil"><span>unten</span>' + bettKarte(anPlatz(x[1])) + '</div></div>';
    return bettKarte(anPlatz(x)); }).join(""); };
  var inner = z.teile.length > 1 ? '<div class="nu-zimmer-betten">' + z.teile.map(function(t){ return '<div class="nu-zimmer-teil">' + teilHtml(t) + '</div>'; }).join("") + '</div>'
    : '<div class="nu-zimmer-betten">' + teilHtml(z.teile[0]) + '</div>';
  if(z.id === "N") inner = z.teile.map(function(t){ return '<div class="nu-zimmer-betten">' + teilHtml(t) + '</div>'; }).join("");
  return '<section class="nu-zimmer' + (aus ? ' is-aus' : '') + '" aria-label="' + esc(z.name) + '"><div class="nu-zimmer-kopf"><span class="nu-zimmer-name">' + esc(z.name) + '</span><span class="nu-zimmer-frei">' + (aus ? "gesperrt" : frei + " von " + aktiv.length + " frei") + '</span></div>' + inner + '</section>';
}
function pct(a, b){ return (a / b * 100).toFixed(3) + "%"; }
function platz(r, inner, fw, fh){ return '<div class="nu-grundriss-platz" style="left:' + pct(r[0] + 10, fw) + ';top:' + pct(r[1] + 10, fh) + ';width:' + pct(r[2], fw) + ';height:' + pct(r[3], fh) + '">' + inner + '</div>'; }
function raumZahl(id){ var bs = BETTEN_HAUS.concat(BETTEN_NIKO).filter(function(b){ return b.zimmer === id; }), akt = bs.filter(function(b){ return !istAus(b.nr); }); return S.offRooms[id] ? "gesperrt" : akt.filter(function(b){ return zaehlt(b.nr); }).length + " von " + akt.length + " frei"; }
function grundrissPius(){
  var fw = 971, fh = 800, flurZu = S.offRooms.T && S.offRooms.F;
  var boeden = Object.keys(GR.boeden).map(function(id){ var r = GR.boeden[id]; return '<rect class="boden' + (S.offRooms[id] ? ' is-aus' : '') + '" x="' + r[0] + '" y="' + r[1] + '" width="' + r[2] + '" height="' + r[3] + '"/>'; }).join("") +
    '<rect class="boden' + (flurZu ? ' is-aus' : '') + '" x="333" y="328" width="331" height="117"/>';
  var stock = GR.stock.map(function(k){ return '<rect class="stockrahmen" x="' + k[2] + '" y="' + k[3] + '" width="' + k[4] + '" height="' + k[5] + '" rx="9"/>'; }).join("");
  var namen = {D:"ZIMMER D", B:"ZIMMER B", T:"T-ZIMMER", F:"ZIMMER F"};
  var labels = Object.keys(GR.labels).map(function(id){ var p = GR.labels[id]; return '<text class="raumname" x="' + p[0] + '" y="' + p[1] + '">' + namen[id] + '</text><text class="raumfrei" x="' + p[0] + '" y="' + (p[1] + 19) + '">' + raumZahl(id) + '</text>'; }).join("");
  var plaetze = Object.keys(GR.einzel).map(function(p){ return platz(GR.einzel[p], bettKarte(anPlatz(p), true), fw, fh); }).join("") +
    GR.stock.map(function(k){ var sh = (k[5] - 9) / 2; return platz([k[2] + 3, k[3] + 3, k[4] - 6, sh], bettKarte(anPlatz(k[0]), true), fw, fh) + platz([k[2] + 3, k[3] + 6 + sh, k[4] - 6, sh], bettKarte(anPlatz(k[1]), true), fw, fh); }).join("");
  return '<div class="nu-grundriss' + (flurZu ? ' is-flur-zu' : '') + '" role="group" aria-label="Grundriss St. Pius"><svg viewBox="-10 -10 971 800" aria-hidden="true">' + SCHRAFFUR + boeden + GR_FEST + stock + labels + '</svg>' + plaetze + '</div>';
}
function grundrissNiko(){
  var fw = 380, fh = 440;
  var plaetze = Object.keys(GR_NIKO.einzel).map(function(p){ return platz(GR_NIKO.einzel[p], bettKarte(anPlatz(p), true), fw, fh); }).join("");
  return '<div class="nu-grundriss" style="--grundriss-format:380 / 440;max-width:460px" role="group" aria-label="St. Nikolaus, Saal"><svg viewBox="-10 -10 380 440" aria-hidden="true">' + SCHRAFFUR +
    '<rect class="boden' + (S.offRooms.N ? ' is-aus' : '') + '" x="13" y="13" width="334" height="394"/><rect class="wand" x="10" y="10" width="340" height="400"/>' +
    '<text class="raumname" x="180" y="204" text-anchor="middle">ST. NIKOLAUS · SAAL</text><text class="raumfrei" x="180" y="224" text-anchor="middle">' + raumZahl("N") + '</text></svg>' + plaetze + '</div>';
}
function plaetzeSpalte(plan){
  var gruppen = plan === NIKO ? [["NX","Weitere Plätze"]] : [["L","Loggien"],["E","Esszimmer"],["TH","Tiny House"],["X","Weitere Plätze"]];
  return '<div class="nu-plaetze">' + gruppen.map(function(gr){ var z = plan.filter(function(x){ return x.id === gr[0]; })[0], nrs = z.teile[0];
    if(!nrs.length) return "";
    return '<div class="nu-plaetze-titel">' + gr[1] + '<span>' + raumZahl(gr[0]) + '</span></div>' + nrs.map(function(p){ return bettKarte(anPlatz(p)); }).join(""); }).join("") + '</div>';
}
function planAnsicht(){
  var k = kennzahlen();
  var wort = k.frei === 0 ? "Kein Bett frei" : k.frei === 1 ? "1 Bett frei" : k.frei + " Betten frei";
  var kopfzeile = '<div class="nu-kennzahlen"><span class="nu-ampel" data-s="' + k.ampel + '"><span class="nu-ampel-licht">' + k.frei + '</span><span class="nu-ampel-wort">' + wort + '<small>Ampel ' + {gruen:"grün",gelb:"gelb",rot:"rot"}[k.ampel] + '</small></span></span>' +
    '<button class="nu-kennzahl nu-kht-nummer" data-act="khtBlatt">KHT-Nummer<b>' + k.belegt + '</b></button>' +
    '<span class="nu-kennzahl">St. Pius<b>' + k.anwesendHaus + ' da · ' + k.erwartet + ' erwartet</b></span><span class="nu-kennzahl">St. Nikolaus<b>' + k.nikoBelegt + ' von ' + k.niko + '</b></span></div>';
  var reiter = '<div class="p-plan-zeile"><div class="nu-reiter" role="tablist"><button role="tab" data-act="reiter" data-arg="haus" aria-selected="' + (U.reiter === "haus") + '">' + svg("haus","klein") + 'St. Pius <span class="n">' + k.freiHaus + ' frei</span></button><button role="tab" data-act="reiter" data-arg="niko" aria-selected="' + (U.reiter === "niko") + '">' + svg("standort-2","klein") + 'St. Nikolaus <span class="n">' + k.nikoBelegt + '/' + k.niko + '</span></button></div><span style="flex:1"></span>' +
    (U.tag === 0 ? '<button class="nu-btn nu-btn--primaer" data-act="aufnahme">' + svg("person-plus") + 'Gast aufnehmen</button>' : '') + '</div>';
  var auswahl = U.auswahl ? '<div class="p-hinweisbalken">' + svg("tauschen") + 'Neues Bett für ' + esc(gastVon(U.auswahl).vorname) + ' antippen<button class="nu-btn nu-btn--klein nu-btn--rahmen" data-act="auswahlAbbrechen">Abbrechen</button></div>' : '';
  var plan;
  if(U.reiter === "haus") plan = schmal() ? '<div class="p-raster">' + HAUS.map(zimmerHtml).join("") + '</div>' : '<div class="nu-plan-raster"><div class="nu-plan-karte">' + grundrissPius() + '</div>' + plaetzeSpalte(HAUS) + '</div>';
  else plan = schmal() ? '<div class="p-raster">' + NIKO.map(zimmerHtml).join("") + '</div>' : '<div class="nu-plan-raster" style="grid-template-columns:minmax(0,520px) 176px;justify-content:center"><div class="nu-plan-karte">' + grundrissNiko() + '</div>' + plaetzeSpalte(NIKO) + '</div>';
  return '<div class="p-plan-kopf">' + kopfzeile + reiter + auswahl + '</div><div id="plan"' + (U.auswahl ? ' class="p-auswahlmodus"' : '') + '>' + plan + '</div>' +
    (U.reiter === "niko" ? '<p class="nu-beschr" style="margin-top:12px">St. Nikolaus: Wer eingetragen ist, wird jede Nacht fortgeschrieben, bis jemand die Belegung ändert. Aufnahme ohne Hausordnung, Läuseschein und Unterschrift.</p>' : '');
}

// ---------- Schnellauswahl ----------
function schnellauswahl(){
  var nr = U.schnell.nr, s = status(nr), g = gastVon(nr), phase = U.schnell.phase, b = S.betten[nr] || {};
  var h = '<div class="nu-schnell' + (U.schnellRein ? ' is-rein' : '') + '" id="schnell" role="dialog" aria-label="Schnellauswahl ' + nr + '">';
  if(s === "frei" || s === "freibis" || s === "fehlt2"){
    h += '<div class="nu-schnell-kopf"><b>Bett ' + nr + '</b><span>' + (s === "freibis" ? "frei bis " + kurz(pd(b.bis)) : "frei") + (ortText(nr) ? " · " + esc(ortText(nr)) : "") + '</span></div>';
    if(s === "freibis") h += '<div class="nu-zeile">' + svg("rueckkehr") + '<div>' + esc(g.vorname) + ' kommt am ' + kurz(pd(b.bis)) + ' zurück.<small>Bis dahin darf das Bett vergeben werden.</small></div></div>';
    if(s === "frei" && S.notbett[nr]) h += '<div class="nu-zeile">' + svg("info") + '<div>Notbett<small>Nur über den Kältebus belegen.</small></div></div>';
    if(s === "fehlt2") h += '<div class="nu-zeile nu-zeile--warnung">' + svg("abwesend") + '<div><b>' + esc(g.vorname) + ' fehlt die ' + (b.n || 2) + '. Nacht in Folge</b><small>Unentschuldigt. Das Bett zählt als frei und darf vergeben werden.</small></div></div>';
    h += '<button class="nu-btn nu-btn--primaer" data-act="aufnahme" data-arg="' + nr + '">' + svg("person-plus") + 'Gast aufnehmen</button>';
    if(s === "fehlt2") h += '<button class="nu-btn" data-act="istDa" data-arg="' + nr + '">' + svg("anwesend") + esc(g.vorname) + ' ist doch da</button>';
    if(s === "freibis" || s === "fehlt2") h += '<button class="nu-btn" data-act="details" data-arg="' + nr + '">' + svg("person") + 'Details ' + esc(g.vorname) + '</button>';
  } else if(phase === "da"){
    var dauerhaft = b.dauerhaft !== false;
    h += '<div class="nu-schnell-kopf"><b>' + esc(g.vorname) + '</b><span>' + nr + ' · ist da</span></div>' +
      '<div style="display:flex;align-items:center;gap:12px"><button class="nu-schalter" role="switch" aria-checked="' + dauerhaft + '" data-act="dauerhaft" data-arg="' + nr + '" aria-label="Bett dauerhaft behalten"></button><span style="font-size:15px;line-height:20px">Bett dauerhaft behalten</span></div>' +
      '<button class="nu-btn" data-act="duschBlatt" data-arg="' + nr + '">' + svg("dusche") + (duschSlot(g.id) ? 'Dusche ' + duschSlot(g.id) : 'Duschslot wählen') + '</button>' +
      '<button class="nu-btn" data-act="abwesenheitBlatt" data-arg="' + nr + '">' + svg("abwesend") + 'Abwesenheit</button>' +
      '<button class="nu-btn nu-btn--primaer" data-act="schnellZu">' + svg("check") + 'Fertig</button>';
  } else if(s === "fehlt"){
    h += '<div class="nu-schnell-kopf"><b>' + esc(g.vorname) + '</b><span>' + nr + ' · fehlt</span></div>' +
      '<div class="nu-zeile nu-zeile--warnung">' + svg("abwesend") + '<div><b>Fehlt unentschuldigt, 1. Nacht</b><small>Das Bett zählt für das Kältehilfetelefon weiter als belegt. Fehlt ' + esc(g.vorname) + ' morgen wieder, zählt es als frei.</small></div></div>' +
      '<button class="nu-btn nu-btn--primaer" data-act="istDa" data-arg="' + nr + '">' + svg("anwesend") + 'Ist doch da</button>' +
      '<button class="nu-btn" data-act="details" data-arg="' + nr + '">' + svg("person") + 'Details</button>';
  } else {
    h += '<div class="nu-schnell-kopf"><b>' + esc(g.vorname) + '</b><span>' + nr + ' · erwartet</span></div>';
    var lt = lausTage(g);
    if(b.vorher) h += '<div class="nu-zeile nu-zeile--warnung">' + svg("abwesend") + '<div><b>Fehlte gestern unentschuldigt</b><small>Fehlt ' + esc(g.vorname) + ' heute wieder, zählt das Bett ab heute als frei.</small></div></div>';
    if(g.laus === "fehlt") h += '<div class="nu-zeile nu-zeile--warnung">' + svg(lt >= 3 ? "warnung" : "laeuseschein-fehlt") + '<div><b>Läuseschein fehlt' + (lt >= 1 ? ' seit ' + lt + (lt === 1 ? ' Tag' : ' Tagen') : '') + '</b><small>' + (lt >= 3 ? 'Beim Check-in wird nach dem Verbleib gefragt.' : 'Bitte beim Check-in danach fragen.') + '</small></div></div>';
    h += '<button class="nu-btn nu-btn--primaer" data-act="istDa" data-arg="' + nr + '">' + svg("anwesend") + 'Ist da</button>' +
      '<button class="nu-btn" data-act="nichtDa" data-arg="' + nr + '">' + svg("abwesend") + 'Nicht da</button>' +
      '<button class="nu-btn" data-act="details" data-arg="' + nr + '">' + svg("person") + 'Details</button>';
  }
  return h + '</div>';
}
function positioniereSchnell(){
  var el = $("#schnell"), karte = $('.nu-bett[data-nr="' + U.schnell.nr + '"]'), ueber = $("#ueber");
  if(!el || !karte){ return; }
  var r = karte.getBoundingClientRect(), o = ueber.getBoundingClientRect(), w = el.offsetWidth, h = el.offsetHeight;
  var x = Math.min(Math.max(8, r.left - o.left), o.width - w - 8), y = r.bottom - o.top + 8;
  var oben = false;
  if(y + h > o.height - 8){ y = r.top - o.top - h - 8; oben = true; }
  if(y < 8) y = 8;
  el.style.left = x + "px"; el.style.top = y + "px";
  el.style.setProperty("--ursprung", (r.left - o.left - x + r.width / 2) + "px " + (oben ? "100%" : "0"));
}

// ---------- Detailbereich ----------
function detailBereich(){
  var nr = U.detail, g = gastVon(nr), b = S.betten[nr] || {}, s = status(nr);
  if(!g) return '';
  var ro = U.tag !== 0;
  var stock = lageVon(nr) ? " · Stockbett " + lageVon(nr) : "";
  var sStatus = {anwesend:"anwesend", erwartet:"erwartet", fehlt:"fehlt unentschuldigt, 1. Nacht", fehlt2:"fehlt " + (b.n || 2) + " Nächte in Folge, Bett zählt als frei", gehalten:"freigehalten bis " + (b.bis ? kurz(pd(b.bis)) : ""), freibis:"abwesend, Bett frei bis " + (b.bis ? kurz(pd(b.bis)) : "")}[s] || s;
  var warn = "";
  var lt = lausTage(g);
  if(g.laus === "fehlt" && g.standort !== "nikolaus"){
    if(lt >= 3 && !(g.lausFrist && g.lausFrist >= iso(H))) warn += '<div class="nu-zeile nu-zeile--warnung">' + svg("warnung") + '<div><b>Läuseschein fehlt seit ' + lt + ' Tagen</b><small>Darf ' + esc(g.vorname) + ' trotzdem bleiben? Höchstens 3 weitere Tage.</small></div></div><div style="display:flex;gap:8px;justify-content:flex-end"><button class="nu-btn nu-btn--klein" data-act="lausNein" data-arg="' + nr + '">Nein</button><button class="nu-btn nu-btn--klein nu-btn--primaer" data-act="lausJa" data-arg="' + nr + '">Ja, bis ' + kurz(plus(H,3)) + '</button></div>';
    else warn += '<div class="nu-zeile nu-zeile--warnung">' + svg("laeuseschein-fehlt") + '<div><b>Läuseschein fehlt' + (lt ? ' seit ' + lt + (lt === 1 ? ' Tag' : ' Tagen') : '') + '</b><small>' + (g.lausFrist ? 'Verbleib bis ' + kurz(pd(g.lausFrist)) + ' entschieden von ' + esc(g.lausVon || "") : 'Erinnerung an Tag 2 und 3') + '</small></div>' + (ro ? '' : '<button class="nu-btn nu-btn--klein nu-btn--rahmen" data-act="lausScan" data-arg="' + nr + '">' + svg("scannen") + 'Scannen</button>') + '</div>';
  }
  var hv = hausverbot(g);
  if(hv) warn += '<div class="nu-zeile nu-zeile--vorfall">' + svg("karte-rot") + '<div><b>Hausverbot ' + (hv.bis ? 'bis ' + kurz(pd(hv.bis)) : 'unbefristet') + '</b><small>' + esc(hv.grund) + '</small></div></div>';
  if(s === "fehlt" || s === "fehlt2") warn += '<div class="nu-zeile nu-zeile--warnung">' + svg("abwesend") + '<div><b>' + (s === "fehlt" ? 'Fehlt unentschuldigt, 1. Nacht' : 'Fehlt die ' + (b.n || 2) + '. Nacht in Folge') + '</b><small>' + (s === "fehlt" ? 'Bett zählt für das Kältehilfetelefon weiter als belegt.' : 'Bett zählt als frei und darf neu vergeben werden.') + '</small></div></div>';
  if(s === "freibis" || s === "gehalten") warn += '<div class="nu-zeile">' + svg(s === "gehalten" ? "schloss" : "rueckkehr") + '<div>' + (s === "gehalten" ? 'Bett freigehalten bis ' : 'Kommt zurück am ') + kurz(pd(b.bis)) + '<small>' + (b.grund ? esc(b.grund) : (s === "gehalten" ? "zählt nicht als frei" : "Bett zählt bis dahin als frei")) + '</small></div></div>';
  var sank = g.sanktionen.length ? g.sanktionen.map(function(x){ var sym = x.stufe === "Hausverbot" ? "karte-rot" : x.stufe === "Gelbe Karte" ? "karte-gelb" : "verwarnung"; return '<div class="nu-zeile">' + svg(sym) + '<div>' + esc(x.stufe) + ' · ' + kurz(pd(x.datum)) + (x.bis ? ' · bis ' + kurz(pd(x.bis)) : '') + '<small>' + esc(x.grund) + ', eingetragen von ' + esc(x.von) + '</small></div></div>'; }).join("") : '<p class="nu-beschr">Keine Einträge.</p>';
  var notizen = g.notizen.slice().reverse().map(function(n){ return '<div class="nu-notiz">' + esc(n.text) + '<small>' + kurz(pd(n.datum)) + ' · ' + esc(n.von) + (n.quelle ? ' · ' + esc(n.quelle) : '') + '</small></div>'; }).join("") || '<p class="nu-beschr">Noch keine Notizen.</p>';
  var laus = g.standort === "nikolaus" ? '<p class="nu-beschr">In St. Nikolaus nicht erfasst.</p>' : g.laus === "liegt" ? '<div class="nu-zeile">' + svg("laeuseschein") + '<div>Liegt vor<small>' + (g.lausVon ? 'Geprüft von ' + esc(g.lausVon) + ' · ' : '') + 'gilt die ganze Saison</small></div></div>' : g.laus === "nicht" ? '<p class="nu-beschr">Nicht nötig (eine Nacht).</p>' : '<p class="nu-beschr">Fehlt.</p>';
  var dok = (g.unterschrieben ? '<div class="nu-zeile">' + svg("pdf") + '<div>' + esc(pdfName(g)) + '<small>Hausordnung (Deutsch' + (g.uebersetzung ? ', Übersetzung ' + esc(SPRACHE[g.uebersetzung][2]) : '') + ') und Datenschutz</small></div></div>' :
    '<div class="nu-zeile nu-zeile--warnung">' + svg("unterschrift") + '<div><b>' + (g.standort === "nikolaus" ? "Unterschreibt außerhalb der App" : "Hausordnung noch nicht unterschrieben") + '</b><small>Kann jederzeit nachgeholt werden.</small></div>' + (ro || g.standort === "nikolaus" ? '' : '<button class="nu-btn nu-btn--klein nu-btn--rahmen" data-act="nachholen" data-arg="' + g.id + '">' + svg("stift") + 'Jetzt</button>') + '</div>') +
    '<button class="nu-btn nu-btn--rahmen nu-btn--klein" style="justify-self:start" data-act="akte" data-arg="' + g.id + '">' + svg("personen") + 'In der Gästedatenbank öffnen</button>';
  var aktionen = ro ? '<button class="nu-btn nu-btn--rahmen" data-act="notizBlatt" data-arg="' + nr + '" style="grid-column:1/-1">' + svg("stift") + 'Nachtrag hinzufügen</button>' :
    (s === "erwartet" ? '<button class="nu-btn nu-btn--primaer" data-act="istDa" data-arg="' + nr + '">' + svg("anwesend") + 'Einchecken</button>' : s === "fehlt" || s === "fehlt2" ? '<button class="nu-btn nu-btn--primaer" data-act="istDa" data-arg="' + nr + '">' + svg("anwesend") + 'Ist doch da</button>' : s === "gehalten" || s === "freibis" ? '<button class="nu-btn nu-btn--primaer" data-act="zurueck" data-arg="' + nr + '">' + svg("rueckkehr") + 'Ist zurück</button>' : '<button class="nu-btn" data-act="notizBlatt" data-arg="' + nr + '">' + svg("notiz") + 'Notiz</button>') +
    '<button class="nu-btn" data-act="abwesenheitBlatt" data-arg="' + nr + '">' + svg("abwesend") + 'Abwesenheit</button>' +
    '<button class="nu-btn" data-act="bettWechseln" data-arg="' + nr + '">' + svg("tauschen") + 'Bett wechseln</button>' +
    '<button class="nu-btn" data-act="duschBlatt" data-arg="' + nr + '">' + svg("dusche") + (duschSlot(g.id) ? 'Dusche ' + duschSlot(g.id) : 'Duschslot') + '</button>' +
    '<button class="nu-btn" data-act="bettFreiBlatt" data-arg="' + nr + '">' + svg("auszug") + 'Bett frei</button>' +
    '<button class="nu-btn nu-btn--gefahr" data-act="sanktionBlatt" data-arg="' + nr + '">' + svg("karte-gelb") + 'Sanktion</button>';
  return '<aside class="nu-detail" aria-label="Gastdetails ' + esc(g.vorname) + '"><div class="nu-detail-kopf"><div style="flex:1;min-width:0"><span class="nr">' + nr + '</span><h2>' + esc(anzeige(g)) + (g.spitz ? ' <span style="font-weight:400;color:var(--tinte-2)">„' + esc(g.spitz) + '“</span>' : '') + '</h2><p>Aufnahme ' + esc(g.nr) + ' · ' + esc(sStatus) + ' · ' + naechteText(g.naechte) + '</p></div><button class="nu-iconbtn nu-iconbtn--fl" data-act="detailZu" aria-label="Schließen">' + svg("schliessen") + '</button></div>' +
    '<div class="nu-detail-inhalt">' + warn +
    '<section class="nu-abschnitt"><h3>Stammdaten</h3><dl class="nu-daten"><dt>Vorname</dt><dd>' + esc(g.vorname) + '</dd><dt>Nachname</dt><dd>' + (esc(g.nachname) || "–") + '</dd><dt>Spitzname</dt><dd>' + (esc(g.spitz) || "–") + '</dd><dt>Sprache</dt><dd>' + esc(SPRACHE[g.sprache][2]) + '</dd><dt>Erste Aufnahme</dt><dd>' + kurz(pd(g.erste)) + '</dd><dt>Nächte Saison</dt><dd>' + g.naechte + '</dd></dl></section>' +
    '<section class="nu-abschnitt"><h3>Aufenthalt</h3><dl class="nu-daten"><dt>Bett</dt><dd>' + nr + stock + (ORT[nr] ? ' · ' + esc(ORT[nr]) : '') + '</dd><dt>Status</dt><dd>' + esc(sStatus) + '</dd><dt>Dauer</dt><dd>' + (b.dauerhaft === false ? "1 Nacht" : b.ende ? "bis " + kurz(pd(b.ende)) : "mehrere Nächte, ohne Enddatum") + '</dd><dt>Dusche heute</dt><dd>' + (duschSlot(g.id) || "–") + '</dd></dl></section>' +
    '<section class="nu-abschnitt"><h3>Läuseschein</h3>' + laus + '</section>' +
    '<section class="nu-abschnitt"><h3>Dokumente</h3>' + dok + '</section>' +
    '<section class="nu-abschnitt"><h3>Sanktionen</h3>' + sank + '</section>' +
    '<section class="nu-abschnitt"><h3>Notizen</h3>' + notizen + (ro ? '' : '<button class="nu-btn nu-btn--rahmen nu-btn--klein" style="justify-self:start" data-act="notizBlatt" data-arg="' + nr + '">' + svg("plus") + 'Notiz hinzufügen</button>') + '</section>' +
    '</div><div class="nu-detail-aktionen">' + aktionen + '</div></aside>';
}

// ---------- Blätter ----------
function blatt(titel, text, inhalt, knoepfe){
  return '<div class="p-blatt" role="dialog" aria-modal="true" aria-label="' + esc(titel) + '"><div class="p-blatt-kopf"><div><h2>' + esc(titel) + '</h2>' + (text ? '<p>' + text + '</p>' : '') + '</div><button class="nu-iconbtn nu-iconbtn--fl" data-act="modalZu" aria-label="Schließen">' + svg("schliessen") + '</button></div>' + inhalt + '<div class="p-blatt-fuss">' + knoepfe + '</div></div>';
}
function dialog(titel, text, knoepfe){ return '<div class="nu-dialog" role="alertdialog" aria-modal="true"><h2>' + esc(titel) + '</h2><p>' + text + '</p><div class="nu-dialog-knoepfe">' + knoepfe + '</div></div>'; }
function modal(html, nach){ U.rein = !U.modal; U.modal = html; U.modalNach = nach || null; render(); var f = $(".p-modal input, .p-modal textarea, .p-modal [data-fokus]"); if(f) f.focus({preventScroll:true}); }
function modalZu(){ U.modal = null; U.modalNach = null; render(); }
function datumsFeld(id, wert){ return '<input class="nu-eingabe" type="date" id="' + id + '" value="' + wert + '" min="' + iso(H) + '">'; }

// ---------- Ziehen ----------
var zug = null;
function zugStart(e){
  var karte = e.target.closest(".nu-bett"); if(!karte || U.tag !== 0 || U.auswahl) return;
  var nr = karte.dataset.nr, s = status(nr);
  if(s === "aus" || s === "frei" || !gastVon(nr)) return;
  zug = {nr:nr, karte:karte, x:e.clientX, y:e.clientY, id:e.pointerId, aktiv:false};
  zug.timer = setTimeout(function(){ if(!zug) return; zug.aktiv = true; karte.classList.add("is-gezogen"); try{ karte.setPointerCapture(zug.id); }catch(_){} if(navigator.vibrate) try{ navigator.vibrate(15); }catch(_){} U.schnell = null; var sc = $("#schnell"); if(sc) sc.remove(); }, 400);
}
function zugZiel(e){ var t = document.elementsFromPoint(e.clientX, e.clientY).find(function(x){ return x.classList && x.classList.contains("nu-bett") && x !== zug.karte; }); return t && ["frei","erwartet","anwesend"].indexOf(status(t.dataset.nr)) >= 0 ? t : null; }
function zugBewegen(e){
  if(!zug) return;
  if(!zug.aktiv){ if(Math.hypot(e.clientX - zug.x, e.clientY - zug.y) > 10){ clearTimeout(zug.timer); zug = null; } return; }
  e.preventDefault();
  zug.karte.style.transform = "translate(" + (e.clientX - zug.x) + "px," + (e.clientY - zug.y) + "px) scale(1.05) rotate(-1deg)";
  $$(".nu-bett.is-ziel,.nu-bett.is-ziel-tausch").forEach(function(b){ b.classList.remove("is-ziel","is-ziel-tausch"); });
  var t = zugZiel(e); if(t) t.classList.add(zaehlt(t.dataset.nr) && !gastVon(t.dataset.nr) ? "is-ziel" : "is-ziel-tausch");
}
function zugEnde(e){
  if(!zug) return;
  clearTimeout(zug.timer);
  var z = zug; zug = null;
  if(!z.aktiv) return;
  z.karte.dataset.gezogen = "1"; setTimeout(function(){ delete z.karte.dataset.gezogen; }, 350);
  var t = zugZiel(e);
  z.karte.classList.remove("is-gezogen"); z.karte.style.transform = "";
  $$(".nu-bett.is-ziel,.nu-bett.is-ziel-tausch").forEach(function(b){ b.classList.remove("is-ziel","is-ziel-tausch"); });
  if(t) wechselFragen(z.nr, t.dataset.nr);
}
function wechselFragen(von, nach){
  var a = gastVon(von), b = gastVon(nach), frei = zaehlt(nach) && status(nach) === "frei";
  var titel = b && !frei ? a.vorname + " (" + von + ") und " + b.vorname + " (" + nach + ") tauschen?" : a.vorname + " von " + von + " nach " + nach + " umziehen?";
  modal(dialog(titel, "Gilt ab heute. Bereits unterschriebene PDFs bleiben unverändert.", '<button class="nu-btn nu-btn--klein" data-act="modalZu">Abbrechen</button><button class="nu-btn nu-btn--primaer nu-btn--klein" data-act="wechseln" data-arg="' + von + ',' + nach + '" data-fokus>' + svg(b && !frei ? "tauschen" : "umziehen") + (b && !frei ? "Tauschen" : "Umziehen") + '</button>'));
}

// ---------- Aufnahme ----------
var TEXTE = {
  hausordnung:{
    de:["Hausordnung","Willkommen, {GAST}. Dein Bett ist {BETT} ab {DATUM}. Einlass ist ab 19:00 Uhr, Ruhe ab 22:00 Uhr. Rauchen, Alkohol und Drogen sind im Haus nicht erlaubt. Gewalt führt zum Hausverbot. Aufgenommen von {BETREUER}."],
    en:["House rules","Welcome, {GAST}. Your bed is {BETT} from {DATUM}. Entry from 7 pm, quiet from 10 pm. Smoking, alcohol and drugs are not allowed in the house. Violence leads to a ban. Admitted by {BETREUER}."],
    ar:["قواعد البيت","مرحبًا {GAST}. سريرك هو {BETT} ابتداءً من {DATUM}. الدخول من الساعة 19:00، والهدوء من الساعة 22:00. التدخين والكحول والمخدرات ممنوعة داخل البيت. العنف يؤدي إلى منع الدخول. تم الاستقبال بواسطة {BETREUER}."]
  },
  datenschutz:{
    de:["Datenschutzerklärung","Wir speichern deinen Vornamen, auf Wunsch Nachnamen und Spitznamen, deine Sprache, dein Bett und deine Nächte, um die Notübernachtung zu organisieren. Ein Läuseschein wird als Bild gespeichert. Alle Angaben werden am 01.05. nach der Saison gelöscht, ein Hausverbot nach drei Jahren. Du kannst jederzeit Auskunft verlangen. Kontakt: Träger der Notübernachtung. (Beispieltext, der endgültige Text kommt vom Träger.)"],
    en:["Privacy notice","We store your first name, optionally your last name and nickname, your language, your bed and your nights to run the shelter. A lice certificate is stored as an image. Everything is deleted on 1 May after the season, a ban after three years. You can ask for information at any time. (Sample text, the final text comes from the provider.)"],
    ar:["بيان حماية البيانات","نحفظ اسمك الأول، واسم العائلة والاسم المستعار إن رغبت، ولغتك وسريرك ولياليك لتنظيم المبيت. تُحفظ شهادة خلو القمل كصورة. تُحذف جميع البيانات في 1 مايو بعد الموسم، ومنع الدخول بعد ثلاث سنوات. (نص تجريبي، النص النهائي من الجهة المسؤولة.)"]
  }
};
var SCHRITTE = ["Person","Dauer","Sprache","Hausordnung","Datenschutz","Abschluss"];
// Unterschrift nachholen (aus Bettdetails oder Gästedatenbank): nur Sprache, Hausordnung, Datenschutz, Abschluss
function nachholenStart(gid){ var g = S.G[gid]; U.wizard = {nachholen:true, schritt:2, g:gid, nr:bettVon(gid) || "", suche:"", neu:{}, dauer:"mehr", sprache:g.sprache, sig:{}, richtung:"vor", verbotOk:true, grund:""}; U.modal = null; U.wizardRein = true; render(); }
function aufnahmeStart(nr){
  var freieBetten = BETTEN_HAUS.filter(function(b){ return !istAus(b.nr) && status(b.nr) === "frei"; });
  U.wizard = {niko:!!nr && (ZIMMER_VON[nr] === "N" || ZIMMER_VON[nr] === "NX"), schritt:0, nr:nr || (freieBetten[0] && freieBetten[0].nr), suche:"", g:null, neu:{vorname:"", nachname:"", spitz:""}, dauer:null, mitEnde:false, bis:iso(plus(H,7)), sprache:null, sig:{}, richtung:"vor", verbotOk:false, grund:""};
  U.schnell = null; U.wizardRein = true; render();
}
function wz(){ return U.wizard; }
function brauchtUnterschrift(){ var w = wz(); return !(w.g && S.G[w.g].unterschrieben); }
function schrittListe(){ return wz().nachholen ? [2,3,4,5] : wz().niko ? [0,5] : brauchtUnterschrift() ? [0,1,2,3,4,5] : [0,1,5]; }
function schrittFertig(i){
  var w = wz();
  if(i === 0) return (w.g && (!hausverbot(S.G[w.g]) || (w.verbotOk && w.grund.trim()))) || (!w.g && (w.neu.vorname.trim() || w.neu.spitz.trim()));
  if(i === 1) return !!w.dauer;
  if(i === 2) return !!w.sprache;
  if(i === 3) return w.sig.hg && w.sig.hb;
  if(i === 4) return !!w.sig.dg;
  return true;
}
function gastName(){ var w = wz(); return w.g ? S.G[w.g].vorname : (w.neu.vorname || w.neu.spitz || "Gast"); }
function einsetzen(t){ var w = wz(); return esc(t).replace("{GAST}", '<mark>' + esc(gastName()) + '</mark>').replace("{BETT}", '<mark>' + w.nr + '</mark>').replace("{DATUM}", '<mark>' + kurz(H) + H.getFullYear() + '</mark>').replace("{BETREUER}", '<mark>' + esc(aktivePerson()) + '</mark>'); }
function dokText(art, sp){ var t = TEXTE[art][sp]; return '<h3>' + esc(t[0]) + '</h3><p style="margin:0">' + einsetzen(t[1]) + '</p>'; }
function dokumentPaar(){
  var w = wz(), sp = w.sprache || "de";
  var de = '<div class="nu-dokument" lang="de"><span class="nu-dokument-marke">' + svg("unterschrift","klein") + 'Deutsch · wird unterschrieben</span>' + dokText("hausordnung", "de") + '</div>';
  if(sp === "de") return de;
  var rtl = sp === "ar" || sp === "fa", da = !!TEXTE.hausordnung[sp];
  var ue = '<div class="nu-dokument nu-dokument--uebersetzung"' + (da ? ' dir="' + (rtl ? "rtl" : "ltr") + '" lang="' + sp + '"' : '') + '><span class="nu-dokument-marke" dir="ltr" lang="de">' + svg("sprache","klein") + 'Übersetzung ' + esc(SPRACHE[sp][2]) + ' · zum Verständnis</span>' +
    (da ? dokText("hausordnung", sp) : '<p style="margin:0">Die Übersetzung ins ' + esc(SPRACHE[sp][2]) + 'e folgt. Im Prototyp gibt es Englisch und Arabisch.</p>') + '</div>';
  return '<div class="nu-dokument-paar">' + de + ue + '</div>';
}
function pad(key, wer, wofuer){
  var fertig = wz().sig[key];
  return '<div class="nu-unterschrift' + (fertig ? ' is-gezeichnet is-bestaetigt' : '') + '" data-pad="' + key + '"><div class="nu-unterschrift-kopf"><b>' + esc(wer) + '</b><small>' + (fertig ? "bestätigt" : esc(wofuer)) + '</small></div><div class="nu-unterschrift-feld">' + (fertig ? '<img src="' + fertig + '" alt="Unterschrift ' + esc(wer) + '" style="position:absolute;inset:0;width:100%;height:100%;z-index:1">' : '') + '<span class="nu-unterschrift-marke">' + svg("check","klein") + 'Bestätigt</span><span class="nu-unterschrift-hilfe">Mit Finger oder Stift unterschreiben</span></div>' +
    (fertig ? '' : '<div class="nu-unterschrift-knoepfe"><button class="nu-btn nu-btn--klein" data-pad-act="leeren">' + svg("rueckgaengig") + 'Löschen</button><button class="nu-btn nu-btn--primaer nu-btn--klein" data-pad-act="ok" disabled>Bestätigen</button></div>') + '</div>';
}
var PADS = {};
function padAnbinden(r){
  if(r.classList.contains("is-bestaetigt") || r.dataset.bound) return;
  r.dataset.bound = "1";
  var key = r.dataset.pad, ok = r.querySelector('[data-pad-act="ok"]');
  var u = Nu.unterschrift(r, {onChange:function(v){ ok.disabled = !v; }});
  PADS[key] = u;
  r.querySelector('[data-pad-act="leeren"]').onclick = function(){ u.leeren(); };
  ok.onclick = function(){ if(!u.bestaetigen()) return; var bild = u.bild(); padFertig(key, bild); };
}
function padFertig(key, bild){
  if(U.wizard && /^(hg|hb|dg|db)$/.test(key)){ U.wizard.sig[key] = bild; render(); return; }
  if(key === "mon"){ nachweisUnterschreiben(bild); return; }
  if(key.indexOf("bes") === 0){ var i = +key.slice(3); var b = bericht(); b.besetzung[i].sig = bild; b.besetzung[i].um = uhr(); U.modal = null; commit(); }
}
function schrittInhalt(){
  var w = wz(), i = w.schritt;
  if(i === 0){
    var q = w.suche.trim().toLowerCase();
    var treffer = q ? Object.keys(S.G).map(function(k){ return S.G[k]; }).filter(function(g){ return !g.extern && [g.vorname, g.nachname, g.spitz].join(" ").toLowerCase().indexOf(q) >= 0 || aehnlich(q, g.vorname.toLowerCase()); }) : [];
    treffer.sort(function(a, b){ return (hausverbot(b) ? 1 : 0) - (hausverbot(a) ? 1 : 0); });
    var gewaehlt = w.g ? S.G[w.g] : null;
    var liste = treffer.slice(0, 6).map(function(g){ var hv = hausverbot(g), bett = Object.keys(S.betten).find(function(n){ return S.betten[n].g === g.id; });
      bett = bettVon(g.id);
      return '<button class="nu-treffer' + (hv ? ' is-verbot' : '') + '" data-act="gastWaehlen" data-arg="' + g.id + '"' + (w.g === g.id ? ' style="box-shadow:inset 0 0 0 3px var(--tinte)"' : '') + '><span class="nu-treffer-bett' + (bett ? '' : ' is-leer') + '" aria-label="' + (bett ? 'Bett ' + bett : 'kein Bett') + '">' + (bett || (hv ? svg("karte-rot") : "–")) + '</span><div><b>' + esc(g.vorname + (g.nachname ? " " + g.nachname : "")) + (g.spitz ? ' <span style="font-weight:400">„' + esc(g.spitz) + '“</span>' : '') + '</b><small>' + (hv ? 'Hausverbot ' + (hv.bis ? 'bis ' + kurz(pd(hv.bis)) : 'unbefristet') + ' · ' + esc(hv.grund) : (bett ? 'Bett ' + bett + ' · ' + statusWort(bett) : 'kein Bett · ' + naechteText(g.naechte) + '') + ' · ' + esc(SPRACHE[g.sprache][2])) + '</small></div></button>'; }).join("");
    var warn = gewaehlt && hausverbot(gewaehlt) ? '<div class="nu-zeile nu-zeile--vorfall">' + svg("karte-rot") + '<div><b>' + esc(gewaehlt.vorname) + ' hat Hausverbot</b><small>Aufnehmen nur mit Bestätigung und Begründung.</small></div></div><div class="nu-feld"><label for="w-grund">Begründung</label><input class="nu-eingabe" id="w-grund" value="' + esc(w.grund) + '" placeholder="Warum wird trotzdem aufgenommen?"></div><div style="display:flex;align-items:center;gap:12px"><button class="nu-schalter" role="switch" aria-checked="' + w.verbotOk + '" data-act="verbotOk" aria-label="Trotzdem aufnehmen"></button><span>Trotzdem aufnehmen</span></div>' : '';
    var neu = !w.g ? '<div id="w-gleich">' + gleichHinweis(w.neu.vorname) + '</div><div class="p-drei"><div class="nu-feld"><label for="w-vor">Vorname</label><input class="nu-eingabe" id="w-vor" autocapitalize="words" value="' + esc(w.neu.vorname) + '"></div><div class="nu-feld"><label for="w-nach">Nachname (freiwillig)</label><input class="nu-eingabe" id="w-nach" autocapitalize="words" value="' + esc(w.neu.nachname) + '"></div><div class="nu-feld"><label for="w-spitz">Spitzname</label><input class="nu-eingabe" id="w-spitz" value="' + esc(w.neu.spitz) + '"></div></div><p class="nu-beschr">Vorname empfohlen, mindestens ein Name oder Spitzname. Bekannte Personen werden nie doppelt angelegt. Gleiche Vornamen unterscheidet die Bettnummer.</p>' : '<button class="nu-btn nu-btn--rahmen" data-act="gastNeu" style="justify-self:start">' + svg("person-plus") + 'Doch eine neue Person anlegen</button>';
    return '<h2 class="titel" style="margin:0">Person suchen oder anlegen</h2><div class="nu-feld"><label for="w-suche">Vorname, Nachname oder Spitzname</label><div style="position:relative"><input class="nu-eingabe" id="w-suche" value="' + esc(w.suche) + '" placeholder="z. B. Max" style="padding-left:48px" autocomplete="off"><span style="position:absolute;left:14px;top:16px;color:var(--tinte-2)">' + svg("suche") + '</span></div></div>' +
      '<div class="p-liste" id="w-treffer">' + liste + (q && !treffer.length ? '<p class="nu-beschr">Keine Person gefunden. Unten neu anlegen.</p>' : '') + '</div>' + warn + (w.g ? '' : '<h3 class="abschnitt" style="margin:8px 0 0">Neue Person</h3>') + neu;
  }
  if(i === 1){
    var t = function(k, titel, txt){ return '<button class="nu-wahl" role="radio" aria-checked="' + (w.dauer === k) + '" data-act="dauer" data-arg="' + k + '"><b>' + titel + '</b><span>' + txt + '</span></button>'; };
    var ende = w.dauer === "mehr" ? '<div class="nu-einstellung" style="background:var(--flaeche-2)">' + svg("kalender") + '<div><b>Enddatum festlegen</b><small>' + (w.mitEnde ? 'Das Bett ist bis zum Abreisetag vergeben.' : 'Aus: bleibt bis auf Weiteres, ohne festes Enddatum.') + '</small></div><button class="nu-schalter" role="switch" aria-checked="' + !!w.mitEnde + '" data-act="mitEnde" aria-label="Enddatum festlegen"></button></div>' +
      (w.mitEnde ? '<div style="display:flex;gap:16px;align-items:flex-end;flex-wrap:wrap"><div class="nu-feld" style="width:260px"><label for="w-bis">Abreise am</label>' + datumsFeld("w-bis", w.bis) + '</div><div class="nu-checkliste" style="padding-bottom:4px">' + [3,7,14].map(function(n){ return '<button class="nu-chip" data-act="bisPlus" data-arg="' + n + '" aria-pressed="' + (w.bis === iso(plus(H,n))) + '">+' + n + ' Nächte</button>'; }).join("") + '</div></div>' : '') : '';
    return '<h2 class="titel" style="margin:0">Geplante Dauer</h2><div class="p-zwei">' + t("1", "1 Nacht", "Kein Läuseschein nötig") + t("mehr", "Mehrere Nächte", "Ohne festes Enddatum, Bett wird blockiert, Läuseschein-Pflicht beginnt") + '</div>' + ende +
      '<p class="nu-beschr">Bett ' + w.nr + (ortText(w.nr) ? ' · ' + esc(ortText(w.nr)) : '') + '. <button class="nu-btn nu-btn--klein nu-btn--rahmen" data-act="anderesBett">Anderes Bett</button></p>';
  }
  if(i === 2){
    return '<h2 class="titel" style="margin:0">Sprache der Übersetzung</h2><p class="nu-beschr" style="font-size:15px;line-height:22px">Unterschrieben wird die deutsche Hausordnung. Die Übersetzung liegt direkt daneben. Die Datenschutzerklärung bleibt auf Deutsch.</p><div class="p-fuenf">' + SPRACHEN.map(function(s){ return '<button class="nu-wahl" role="radio" style="min-height:76px;padding:10px 14px" aria-checked="' + (w.sprache === s[0]) + '" data-act="sprache" data-arg="' + s[0] + '"><b style="font-family:' + (s[0] === "ar" || s[0] === "fa" ? "var(--font-rtl)" : "var(--font-dokument)") + '">' + s[1] + '</b><span>' + s[2] + '</span></button>'; }).join("") + '</div><p class="nu-beschr">Im Prototyp gibt es Übersetzungen auf Englisch und Arabisch; die übrigen folgen.</p>';
  }
  if(i === 3){
    return '<h2 class="titel" style="margin:0">Hausordnung</h2>' + dokumentPaar() + '<div class="p-zwei">' + pad("hg", "Gast: " + gastName(), "Hausordnung, deutsche Fassung") + pad("hb", "Betreuung: " + aktivePerson(), "Hausordnung") + '</div>';
  }
  if(i === 4){
    return '<h2 class="titel" style="margin:0">Datenschutzerklärung</h2><div class="nu-dokument" lang="de"><span class="nu-dokument-marke">' + svg("unterschrift","klein") + 'Nur auf Deutsch · unterschreibt nur der Gast</span>' + dokText("datenschutz", "de") + '</div>' +
      (w.sprache && w.sprache !== "de" ? '<div class="nu-zeile">' + svg("info") + '<div>Die Datenschutzerklärung gibt es nur auf Deutsch.<small>Bei Bedarf mündlich erklären, zum Beispiel mit der Übersetzungs-App.</small></div></div>' : '') +
      '<div class="p-zwei">' + pad("dg", "Gast: " + gastName(), "Datenschutz") + '</div>';
  }
  var nrNeu = "2026-27-" + String(S.naechsteNr).padStart(4, "0");
  var gl = w.g ? gleicherVorname(S.G[w.g]) : vornameDoppelt(w.neu.vorname).length > 0;
  if(w.niko) return '<h2 class="titel" style="margin:0">Abschluss</h2><dl class="nu-daten" style="font-size:17px;line-height:26px"><dt>Gast</dt><dd>' + esc(gastName()) + '</dd><dt>Bett</dt><dd>' + w.nr + ' · St. Nikolaus</dd></dl><div class="nu-zeile">' + svg("info") + '<div>St. Nikolaus<small>Ohne Hausordnung, Läuseschein und Unterschrift. Wird jede Nacht fortgeschrieben.</small></div></div>';
  if(w.nachholen){ var gn = S.G[w.g];
    return '<h2 class="titel" style="margin:0">Abschluss</h2><dl class="nu-daten" style="font-size:17px;line-height:26px"><dt>Gast</dt><dd>' + esc(anzeige(gn)) + '</dd><dt>Übersetzung</dt><dd>' + (w.sprache && w.sprache !== "de" ? SPRACHE[w.sprache][2] : "keine") + '</dd><dt>Aufnahmenummer</dt><dd>' + (gn.nr || nrNeu) + '</dd></dl>' +
      '<div class="nu-zeile">' + svg("pdf") + '<div>PDF wird in der Gästedatenbank abgelegt<small>Hausordnung (Deutsch, unterschrieben' + (w.sprache && w.sprache !== "de" ? ', Übersetzung als Anlage' : '') + ') und Datenschutzerklärung</small></div></div>';
  }
  return '<h2 class="titel" style="margin:0">Abschluss</h2><dl class="nu-daten" style="font-size:17px;line-height:26px"><dt>Gast</dt><dd>' + esc(gastName()) + '</dd><dt>Bett</dt><dd>' + w.nr + (lageVon(w.nr) ? ' · Stockbett ' + lageVon(w.nr) : '') + '</dd><dt>Dauer</dt><dd>' + (w.dauer === "1" ? "1 Nacht" : w.dauer === "mehr" ? (w.mitEnde ? "mehrere Nächte, Abreise am " + kurz(pd(w.bis)) : "mehrere Nächte, ohne Enddatum") : "–") + '</dd>' + (gl ? '<dt>Angezeigt als</dt><dd>' + esc(gastName()) + ' (' + w.nr + ')</dd>' : '') + '<dt>Übersetzung</dt><dd>' + (w.sprache ? (w.sprache === "de" ? "keine (Deutsch)" : SPRACHE[w.sprache][2]) : (w.g ? SPRACHE[S.G[w.g].sprache][2] : "–")) + '</dd><dt>Aufnahmenummer</dt><dd>' + (brauchtUnterschrift() ? nrNeu : S.G[w.g].nr + ' (bereits unterschrieben)') + '</dd></dl>' +
    (brauchtUnterschrift() ? '<div class="nu-zeile">' + svg("pdf") + '<div>PDF wird erstellt<small>' + nrNeu.slice(-4) + '_' + esc(gastName()) + '_' + iso(H) + '.pdf · Hausordnung auf Deutsch mit Unterschrift von Gast und Betreuung' + (w.sprache && w.sprache !== "de" ? ', Übersetzung als Anlage' : '') + ' · Datenschutz mit Unterschrift Gast</small></div></div>' : '') +
    (w.dauer !== "1" ? '<div class="nu-zeile nu-zeile--warnung">' + svg("laeuseschein-fehlt") + '<div><b>Läuseschein-Pflicht beginnt</b><small>Erinnerung an Tag 2 und 3</small></div></div>' : '');
}
function statusWort(nr){ return {anwesend:"da", erwartet:"erwartet", fehlt:"fehlt", gehalten:"freigehalten", freibis:"abwesend"}[status(nr)] || status(nr); }
function vornameDoppelt(v){ v = (v || "").trim().toLowerCase(); return v ? Object.keys(S.G).map(function(k){ return S.G[k]; }).filter(function(g){ return g.vorname.toLowerCase() === v; }) : []; }
function gleichHinweis(v){ var d = vornameDoppelt(v); if(!d.length) return "";
  return '<div class="nu-zeile">' + svg("personen") + '<div><b>Es gibt schon ' + (d.length === 1 ? 'eine Person' : d.length + ' Personen') + ' mit dem Vornamen ' + esc(d[0].vorname) + '</b><small>' + d.map(function(g){ return esc(g.vorname) + " (" + esc(zusatz(g)) + ")"; }).join(", ") + '. Ist es dieselbe Person, oben auswählen. Sonst wird die neue Person mit ihrer Bettnummer angezeigt: ' + esc(d[0].vorname) + ' (' + wz().nr + ').</small></div></div>'; }
function aehnlich(a, b){ if(a.length < 3) return false; var d = 0; for(var i = 0; i < Math.min(a.length, b.length); i++) if(a[i] !== b[i]) d++; return d <= 1 && Math.abs(a.length - b.length) <= 1; }
function assistent(){
  var w = wz(), liste = schrittListe(), pos = liste.indexOf(w.schritt), fertig = schrittFertig(w.schritt);
  var fehlt = !fertig ? ({0:"Bitte eine Person wählen oder einen Namen eintragen.", 1:"Bitte die Dauer wählen.", 2:"Bitte eine Sprache wählen.", 3:"Es fehlen Unterschriften.", 4:"Es fehlt die Unterschrift des Gasts."}[w.schritt]) : "Zwischenstand gespeichert " + uhr();
  return '<div class="p-wizard' + (U.wizardRein ? ' is-rein' : '') + '" role="dialog" aria-modal="true" aria-label="Gast aufnehmen"><div class="p-wizard-kopf">' + svg(w.nachholen ? "unterschrift" : "person-plus") + '<h2>' + (w.nachholen ? 'Hausordnung nachholen · ' + esc(anzeige(S.G[w.g])) : 'Gast aufnehmen · Bett ' + w.nr) + '</h2><span class="p-schritt-nr">Schritt ' + (pos + 1) + ' von ' + liste.length + '</span><button class="nu-iconbtn nu-iconbtn--fl" data-act="aufnahmeAbbrechen" aria-label="Aufnahme abbrechen">' + svg("schliessen") + '</button></div>' +
    '<div class="nu-assistent"><ol class="nu-schritte">' + liste.map(function(s, k){ var dn = k < pos; return '<li class="nu-schritt' + (dn ? ' is-fertig' : '') + '"' + (s === w.schritt ? ' aria-current="step"' : '') + '><i>' + (dn ? '✓' : (k + 1)) + '</i>' + SCHRITTE[s] + '</li>'; }).join("") + '</ol>' +
    '<div class="nu-assistent-seite ' + w.richtung + '" style="display:grid;gap:18px;align-content:start" id="w-seite">' + schrittInhalt() + '</div>' +
    '<div class="nu-assistent-fuss"><button class="nu-btn" data-act="wZurueck"' + (pos === 0 ? ' disabled' : '') + '>' + svg("zurueck") + 'Zurück</button><span class="nu-beschr" style="align-self:center;text-align:center">' + esc(fehlt) + '</span><button class="nu-btn nu-btn--primaer" data-act="wWeiter"' + (fertig ? '' : ' disabled') + '>' + (w.schritt === 5 ? svg("check") + 'Fertig' : 'Weiter' + svg("weiter")) + '</button></div></div></div>';
}
function wizardNachRender(){
  var w = wz();
  var su = $("#w-suche"); if(su){ su.oninput = function(){ w.suche = su.value; w.g = null; var pos = su.selectionStart; render(); var n = $("#w-suche"); n.focus(); n.setSelectionRange(pos, pos); }; }
  [["w-vor","vorname"],["w-nach","nachname"],["w-spitz","spitz"]].forEach(function(x){ var el = $("#" + x[0]); if(el) el.oninput = function(){ w.neu[x[1]] = el.value; var b = $('[data-act="wWeiter"]'); b.disabled = !schrittFertig(0); if(x[1] === "vorname") $("#w-gleich").innerHTML = gleichHinweis(el.value); }; });
  var gr = $("#w-grund"); if(gr) gr.oninput = function(){ w.grund = gr.value; $('[data-act="wWeiter"]').disabled = !schrittFertig(0); };
  var bis = $("#w-bis"); if(bis) bis.onchange = function(){ w.bis = bis.value; };
  w.richtung = "";
}
function dokumenteSpeichern(g, w){
  if(!g.nr) g.nr = "2026-27-" + String(S.naechsteNr++).padStart(4, "0");
  g.unterschrieben = true; g.unterschriebenAm = iso(H); g.uebersetzung = w.sprache && w.sprache !== "de" ? w.sprache : null; if(w.sprache) g.sprache = w.sprache;
  g.dokumente.push({art:"Hausordnung und Datenschutz", datei:pdfName(g), datum:iso(H), von:aktivePerson()});
}
function aufnahmeAbschliessen(){
  var w = wz(), gid = w.g;
  if(w.nachholen){ var gn = S.G[gid]; dokumenteSpeichern(gn, w); gn.notizen.push({datum:iso(H), text:"Hausordnung und Datenschutz nachträglich unterschrieben.", von:aktivePerson(), quelle:"Gästedatenbank"}); U.wizard = null; commit(); toast("pdf", "Unterschrift nachgeholt", pdfName(gn), 4000); return; }
  if(!gid){ gid = "g" + Date.now(); S.G[gid] = {id:gid, vorname:w.neu.vorname.trim() || w.neu.spitz.trim(), nachname:w.neu.nachname.trim(), spitz:w.neu.spitz.trim(), sprache:w.sprache || "de", nr:"", erste:iso(H), naechte:0, laus:"nicht", lausSeit:null, lausFrist:null, unterschrieben:false, uebersetzung:null, dokumente:[], sanktionen:[], notizen:[], extern:false, standort:"haus"}; }
  var g = S.G[gid];
  if(w.niko){ g.standort = "nikolaus"; g.naechte++; S.betten[w.nr] = {g:gid, s:"anwesend", fort:true}; U.wizard = null; U.neu = w.nr; U.reiter = "niko"; commit(); toast("anwesend", anzeige(g) + " ist aufgenommen", "Bett " + w.nr + " · St. Nikolaus", 4000); return; }
  if(brauchtUnterschrift()) dokumenteSpeichern(g, w);
  if(w.dauer !== "1" && g.laus !== "liegt"){ g.laus = "fehlt"; g.lausSeit = iso(H); }
  if(hausverbot(g)) g.notizen.push({datum:iso(H), text:"Trotz Hausverbot aufgenommen: " + w.grund, von:aktivePerson(), quelle:"Aufnahme"});
  var vorher = S.betten[w.nr];
  if(vorher && vorher.g && vorher.g !== gid && vorher.s === "fehlt2"){ var alt = S.G[vorher.g]; alt.notizen.push({datum:iso(H), text:"Bett " + w.nr + " neu vergeben, nachdem " + alt.vorname + " " + (vorher.n || 2) + " Nächte in Folge unentschuldigt gefehlt hat.", von:aktivePerson(), quelle:"Bettenplan"}); }
  Object.keys(S.betten).forEach(function(n){ if(S.betten[n].g === gid && n !== w.nr) S.betten[n] = {g:null, s:"frei"}; });
  g.naechte++;
  S.betten[w.nr] = {g:gid, s:"anwesend", dauerhaft:w.dauer !== "1", ende:w.dauer === "mehr" && w.mitEnde ? w.bis : null};
  U.wizard = null; U.neu = w.nr; U.reiter = "haus";
  commit();
  toast("anwesend", anzeige(g) + " ist aufgenommen", "Bett " + w.nr + (g.nr ? " · Aufnahme " + g.nr : ""), 4000);
}

// ---------- Dienst & Bericht ----------
var FEHLT = ["Tüten","Putzmittel","Toilettenpapier","Decken","Kaffee","Seife"];
function bericht(d){ return S.berichte[d || iso(tagDatum())]; }
function dienstBeginnen(){
  var dp = S.dienstplan[iso(H)] || ["",""];
  S.berichte[iso(H)] = {status:"offen", besetzung:[{rolle:"Betreuung 1", name:dp[0] || "offen", sig:null},{rolle:"Betreuung 2", name:dp[1] || "offen", sig:null},{rolle:"Küche", name:(S.kueche && S.kueche[iso(H)]) || "offen", sig:null}],
    f:{hinweise:"", kht:null, vorfall:null, fehlt:[], fehltText:"", fragen:"", schluessel:null, schluesselNr:"", extern:[], sonstiges:"", ziele:{}}, nachtraege:[], begonnen:uhr()};
  commit();
}
// @Vorname oder @Vorname (Bett) erkennen; ein Absatz mit Stufenwort am Anfang legt genau EINE Sanktion an.
var STUFE_RE = /^\s*(Verwarnung|Gelbe Karte|Hausverbot|Rote Karte)\b/i;
function passt(g, z){ return z === bettVon(g.id) || (S.betten[z] && S.betten[z].g === g.id) || z === g.nachname || z === g.spitz || z === "„" + g.spitz + "“" || (g.nr && z === "Nr. " + g.nr.slice(-4)); }
function erkennen(text, ziele){
  var out = {erw:[], mehrdeutig:[], absaetze:[]}, alle = Object.keys(S.G).map(function(k){ return S.G[k]; });
  (text || "").split(/\n/).forEach(function(abs, idx){
    var genannt = [];
    abs.replace(/@([A-Za-zÄÖÜäöüß\-]+)(?:\s?\(([^)\n]{1,24})\))?/g, function(_, n, z){
      var k = alle.filter(function(x){ return x.vorname.toLowerCase() === n.toLowerCase(); }), g = null;
      if(z) g = k.find(function(x){ return passt(x, z); }) || null;
      if(!g && k.length === 1) g = k[0];
      if(!g && k.length > 1){ if(!out.mehrdeutig.some(function(m){ return m.name.toLowerCase() === n.toLowerCase(); })) out.mehrdeutig.push({name:n, kandidaten:k}); return; }
      if(g && genannt.indexOf(g) < 0) genannt.push(g);
      if(g && out.erw.indexOf(g) < 0) out.erw.push(g);
    });
    var m = STUFE_RE.exec(abs);
    if(m && genannt.length){
      var st = /rote|haus/i.test(m[1]) ? "Hausverbot" : /gelb/i.test(m[1]) ? "Gelbe Karte" : "Verwarnung";
      var wahl = ziele && ziele[idx], ziel = wahl === "keiner" ? null : (genannt.find(function(g){ return g.id === wahl; }) || genannt[0]);
      out.absaetze.push({idx:idx, stufe:st, text:abs.trim(), genannt:genannt, ziel:ziel, rest:genannt.filter(function(g){ return g !== ziel; })});
    } else if(genannt.length) out.absaetze.push({idx:idx, stufe:null, text:abs.trim(), genannt:genannt, ziel:null, rest:genannt});
  });
  return out;
}
function stufeSym(st){ return st === "Hausverbot" ? "karte-rot" : st === "Gelbe Karte" ? "karte-gelb" : "verwarnung"; }
function erkanntHtml(text){
  var b = bericht(), e = erkennen(text, b && b.f.ziele); if(!e.erw.length && !e.mehrdeutig.length) return "";
  var sank = e.absaetze.filter(function(a){ return a.stufe; }), nurNotiz = [];
  e.absaetze.filter(function(a){ return !a.stufe; }).forEach(function(a){ a.genannt.forEach(function(g){ if(nurNotiz.indexOf(g) < 0) nurNotiz.push(g); }); });
  return '<div class="p-erkannt">' + sank.map(function(a){
      return '<div class="nu-zuordnung"><div class="nu-zuordnung-kopf">' + svg(stufeSym(a.stufe)) + a.stufe + ' für' +
        '<button class="nu-zuordnung-ziel" data-act="zielWaehlen" data-arg="' + a.idx + '"' + (zuBericht() ? ' disabled' : '') + '>' + (a.ziel ? esc(a.ziel.vorname) + (bettVon(a.ziel.id) ? ' <span class="bett">' + bettVon(a.ziel.id) + '</span>' : '') : 'niemand') + (a.genannt.length > 1 ? svg("ab","klein") : '') + '</button></div>' +
        (a.rest.length ? '<div class="nu-zuordnung-rest">Nur Notiz, keine Sanktion: ' + a.rest.map(function(g){ return '<span class="nu-pille">' + svg("notiz","klein") + esc(anzeige(g)) + '</span>'; }).join("") + '</div>' : '') + '</div>'; }).join("") +
    (nurNotiz.length ? '<div style="display:flex;flex-wrap:wrap;gap:6px">' + nurNotiz.map(function(g){ return '<span class="nu-pille nu-pille--blau">' + svg("notiz","klein") + 'Notiz für ' + esc(anzeige(g)) + '</span>'; }).join("") + '</div>' : '') +
    e.mehrdeutig.map(function(m){ return '<span class="nu-pille nu-pille--warnung">' + svg("warnung","klein") + '@' + esc(m.name) + ' gibt es ' + m.kandidaten.length + '-mal: Bettnummer ergänzen, z. B. @' + esc(m.name) + ' (' + esc(zusatz(m.kandidaten[0])) + ')</span>'; }).join("") + '</div>';
}
function zuBericht(){ var b = bericht(); return b && b.status === "abgeschlossen"; }
function jaNein(feld, wert, gesperrt){
  return '<div class="nu-seg" role="radiogroup">' + [["ja","Ja"],["nein","Nein"]].map(function(x){ return '<button role="radio" aria-checked="' + (wert === x[0]) + '" data-act="feldJaNein" data-arg="' + feld + ',' + x[0] + '"' + (gesperrt ? ' disabled' : '') + '>' + x[1] + '</button>'; }).join("") + '</div>';
}
function dienstAnsicht(){
  var reiter = '<div class="p-plan-zeile" style="margin-bottom:12px"><h1 class="titel-gross" style="margin:0;flex:1">Dienst &amp; Bericht</h1><div class="nu-reiter" role="tablist">' + [["bericht","Bericht"],["dusche","Duschplan"],["monat","Monatsabschluss"],["archiv","Archiv"]].map(function(r){ return '<button role="tab" aria-selected="' + (U.dienstReiter === r[0]) + '" data-act="dienstReiter" data-arg="' + r[0] + '">' + r[1] + '</button>'; }).join("") + '</div></div>';
  if(U.dienstReiter === "dusche") return reiter + duschplan();
  if(U.dienstReiter === "archiv") return reiter + archivListe();
  if(U.dienstReiter === "monat") return reiter + monatAnsicht();
  var b = bericht();
  if(!b){
    if(U.tag !== 0) return reiter + '<div class="p-leer">' + svg("bericht") + '<b>Kein Bericht für diesen Tag</b><span>Im Prototyp gibt es Berichte nur für den laufenden Dienst und im Archiv.</span></div>';
    return reiter + '<div class="p-leer">' + svg("bericht") + '<b>Noch kein Bericht für heute</b><span>Der Dienst beginnt mit den Hinweisen fürs Team. Besetzung und Termine sind schon eingetragen.</span><button class="nu-btn nu-btn--primaer" data-act="dienstBeginnen">' + svg("personen") + 'Neuen Dienst beginnen</button></div>';
  }
  var zu = b.status === "abgeschlossen", f = b.f;
  var kopf = letzterDienstHinweis() + '<div class="nu-bericht" style="gap:16px">' +
    (zu ? '<div class="nu-gesperrt">' + svg("schloss", U.geradeZu ? "zu" : "") + '<div style="flex:1">Bericht abgeschlossen<small>' + esc(b.zuUm) + ' · ' + b.besetzung.map(function(x){ return x.name; }).join(", ") + ' · PDF gespeichert' + (S.sync.offline ? ', wartet auf Abgleich' : ' und abgeglichen') + '</small></div><button class="nu-btn nu-btn--klein nu-btn--rahmen" data-act="pdfZeigen">' + svg("pdf") + 'PDF ansehen</button><button class="nu-btn nu-btn--klein nu-btn--rahmen" data-act="teilen">' + svg("teilen") + 'Teilen</button></div>' : '') +
    '<div style="display:flex;align-items:baseline;gap:12px;flex-wrap:wrap"><h2 class="titel" style="margin:0;flex:1">' + esc(lang(tagDatum())) + '</h2><span class="nu-beschr">begonnen ' + esc(b.begonnen) + '</span></div>' +
    b.besetzung.map(function(x, i){ return '<div class="nu-besetzung"><span class="rolle">' + esc(x.rolle) + '</span><button class="nu-person" data-act="personTauschen" data-arg="' + i + '"' + (zu ? ' disabled' : '') + ' aria-pressed="false" style="' + (x.name === "offen" ? 'box-shadow:inset 0 0 0 1.5px var(--linie-stark)' : '') + '"><span class="nu-kuerzel">' + esc(x.name === "offen" ? "?" : x.name.slice(0,2).toUpperCase()) + '</span>' + esc(x.name) + (zu ? '' : svg("tauschen","klein")) + '</button>' +
      (x.sig ? '<div class="nu-mini-unterschrift is-fertig" style="justify-content:space-between;padding:0 12px"><img class="p-mini-sig" src="' + x.sig + '" alt="Unterschrift ' + esc(x.name) + '" style="width:60%">' + svg("check","klein") + esc(x.um) + '</div>' : '<button class="nu-mini-unterschrift" data-act="besetzungUnterschrift" data-arg="' + i + '"' + (x.name === "offen" || zu ? ' disabled' : '') + '>' + svg("unterschrift","klein") + (x.name === "offen" ? "Erst Person wählen" : "Tippen zum Unterschreiben") + '</button>') + '</div>'; }).join("") + '</div>';
  var abw = BETTEN_HAUS.concat(BETTEN_NIKO).filter(function(x){ var s = status(x.nr); return s === "gehalten" || s === "freibis" || s === "fehlt" || s === "fehlt2"; }).map(function(x){ var g = gastVon(x.nr), s = status(x.nr), bb = S.betten[x.nr];
    var text = s === "gehalten" ? "freigehalten bis " + kurz(pd(bb.bis)) : s === "freibis" ? "frei bis " + kurz(pd(bb.bis)) : s === "fehlt" ? "fehlt unentschuldigt, 1. Nacht" : "fehlt " + (bb.n || 2) + ". Nacht in Folge, Bett zählt als frei";
    return '<div class="nu-zeile' + (s === "fehlt" || s === "fehlt2" ? ' nu-zeile--warnung' : '') + '">' + svg(s === "gehalten" ? "schloss" : s === "freibis" ? "rueckkehr" : "abwesend") + '<div>' + esc(g.vorname) + ' · ' + x.nr + ' · ' + text + '<small>aus dem Bettenplan</small></div></div>'; }).join("") || '<p class="nu-beschr">Keine Abwesenheiten.</p>';
  var k = kennzahlen();
  var t = function(feld, label, ph){ return '<div class="nu-bericht-zeile"><label class="nu-feldname" for="f-' + feld + '">' + label + '</label><div><textarea class="nu-eingabe p-text" id="f-' + feld + '" data-feld="' + feld + '" placeholder="' + esc(ph) + '"' + (zu ? ' readonly' : '') + '>' + esc(f[feld]) + '</textarea>' + (feld === "hinweise" ? '<div id="erkannt">' + erkanntHtml(f.hinweise) + '</div><div class="nu-vorschlaege" id="vorschlaege" role="listbox" hidden style="margin-top:6px"></div>' : '') + '</div></div>'; };
  var pflicht = function(w){ return !zu && U.pruefen && w == null ? '<span class="nu-pille nu-pille--warnung">' + svg("warnung","klein") + 'Pflichtfeld</span>' : ''; };
  var felder = '<div class="nu-bericht' + (f.vorfall === "ja" ? ' is-vorfall' : '') + '" id="bericht">' +
    (f.vorfall === "ja" ? '<div style="display:flex;align-items:center;gap:8px;color:var(--vorfall);font-weight:700">' + svg("vorfall") + 'Bericht mit Vorfall</div>' : '') +
    t("hinweise", "Wichtige Hinweise", "Was sollen die nächsten wissen? @ erwähnt einen Gast. Ein Absatz mit „Verwarnung“, „Gelbe Karte“ oder „Hausverbot“ am Anfang legt eine Sanktion für genau eine Person an, die anderen bekommen nur eine Notiz.") +
    '<div class="nu-bericht-zeile"><span class="nu-feldname">Hat KHT angerufen?</span><div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">' + jaNein("kht", f.kht, zu) + '<button class="nu-pille" data-act="khtBlatt" style="border:0;cursor:pointer">' + svg("telefon","klein") + 'KHT-Nummer ' + k.belegt + '</button>' + pflicht(f.kht) + '</div></div>' +
    '<div class="nu-bericht-zeile"><span class="nu-feldname">Vorfälle</span><div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">' + jaNein("vorfall", f.vorfall, zu) + pflicht(f.vorfall) + (f.vorfall === "ja" ? '<span class="nu-beschr">Einzelheiten unter „Wichtige Hinweise“.</span>' : '') + '</div></div>' +
    '<div class="nu-bericht-zeile"><span class="nu-feldname">Fehlt etwas</span><div class="nu-checkliste">' + FEHLT.map(function(x){ var an = f.fehlt.indexOf(x) >= 0; return '<button class="nu-chip" aria-pressed="' + an + '" data-act="fehlt" data-arg="' + x + '"' + (zu ? ' disabled' : '') + '>' + (an ? svg("check","klein") : '') + x + '</button>'; }).join("") + '<input class="nu-eingabe" data-feld="fehltText" id="f-fehltText" style="flex:1 1 260px" placeholder="Was genau? z. B. Müllbeutel 120 l, Duschgel" value="' + esc(f.fehltText) + '"' + (zu ? ' readonly' : '') + '></div></div>' +
    t("fragen", "Fragen von Gästen", "z. B. Max fragt nach einer zweiten Decke") +
    '<div class="nu-bericht-zeile"><span class="nu-feldname">Abwesenheit von Gästen</span><div class="p-liste">' + abw + '</div></div>' +
    '<div class="nu-bericht-zeile"><span class="nu-feldname">Schlüssel fehlt</span><div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">' + jaNein("schluessel", f.schluessel, zu) + (f.schluessel === "ja" ? '<input class="nu-eingabe" data-feld="schluesselNr" id="f-schluesselNr" style="max-width:200px" inputmode="numeric" placeholder="Nummer(n)" value="' + esc(f.schluesselNr) + '"' + (zu ? ' readonly' : '') + '>' : '') + '</div></div>' +
    '<div class="nu-bericht-zeile"><span class="nu-feldname">Externe Gäste</span><div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">' + f.extern.map(function(n){ return '<span class="nu-pille">' + svg("person","klein") + esc(n) + '</span>'; }).join("") + (zu ? '' : '<button class="nu-chip" data-act="externBlatt">' + svg("plus","klein") + 'Gast hinzufügen</button>') + '</div></div>' +
    t("sonstiges", "Sonstiges", "") + '</div>';
  var nachtraege = b.nachtraege.map(function(n){ return '<div class="nu-nachtrag"><b>Nachtrag</b>' + esc(n.text) + '<small>' + esc(n.um) + ' · ' + esc(n.von) + '</small></div>'; }).join("");
  var fuss = zu ? nachtraege + '<button class="nu-btn nu-btn--rahmen" data-act="nachtragBlatt" style="justify-self:start">' + svg("stift") + 'Nachtrag hinzufügen</button>' :
    '<div style="display:flex;justify-content:flex-end;align-items:center;gap:12px;flex-wrap:wrap"><span class="nu-beschr" id="pflicht-text">' + pflichtText() + '</span><button class="nu-btn nu-btn--primaer" data-act="abschliessen">' + svg("schloss") + 'Bericht abschließen</button></div>';
  var seite = '<aside class="p-seite"><b class="abschnitt">Hinweise</b>' + S.hinweise.filter(function(h){ return h.bis >= iso(H); }).map(function(h){ return '<div class="nu-hinweis' + (h.wichtig ? ' is-wichtig' : '') + '"><div class="nu-hinweis-kopf">' + svg(h.wichtig ? "warnung" : "person","klein") + '<b>' + esc(h.von) + '</b>· ' + (h.wichtig ? "wichtig · " : "") + 'bis ' + kurz(pd(h.bis)) + '</div><div>' + esc(h.text) + '</div></div>'; }).join("") +
    (U.tag === 0 && !zu ? '<button class="nu-btn nu-btn--rahmen nu-btn--klein" data-act="hinweisBlatt" style="justify-self:start">' + svg("plus") + 'Hinweis für die nächsten Tage</button>' : '') +
    '<b class="abschnitt" style="margin-top:12px">Seit deinem letzten Dienst</b>' + S.archiv.slice().sort(function(a, b){ return (b.vorfall ? 1 : 0) - (a.vorfall ? 1 : 0); }).map(function(a){ return '<div class="nu-hinweis"' + (a.vorfall ? ' style="box-shadow:inset 0 0 0 3px var(--vorfall)"' : '') + '><div class="nu-hinweis-kopf">' + svg(a.vorfall ? "vorfall" : "bericht","klein") + '<b>Bericht ' + kurz(pd(a.datum)) + '</b>' + (a.vorfall ? '· Vorfall' : '') + '</div><div>' + esc(a.text) + '</div></div>'; }).join("") +
    '<b class="abschnitt" style="margin-top:12px">Heute</b>' + (S.termine.filter(function(x){ return x.datum === iso(tagDatum()); }).map(function(x){ return '<div class="nu-hinweis"><div class="nu-hinweis-kopf">' + svg(x.sym,"klein") + '<b>Kalender</b>· ' + esc(x.art) + '</div><div>' + esc(x.titel) + '</div></div>'; }).join("") || '<p class="nu-beschr">Keine Termine.</p>') + '</aside>';
  return reiter + '<div class="p-bericht-raster' + (U.schreiben ? ' is-schreiben' : '') + '"><div style="display:grid;gap:16px">' + kopf + felder + fuss + '</div>' + seite + '</div>' +
    (U.schreiben && !zu ? '<div class="p-tastenleiste nu-tastenleiste" id="tastenleiste"><button class="nu-chip" data-act="einfuegen" data-arg="@"><b>@</b> Gast</button><button class="nu-chip" data-act="einfuegen" data-arg="Verwarnung ">' + svg("verwarnung","klein") + 'Verwarnung</button><button class="nu-chip" data-act="einfuegen" data-arg="Gelbe Karte ">' + svg("karte-gelb","klein") + 'Gelbe Karte</button><button class="nu-chip" data-act="einfuegen" data-arg="Hausverbot ">' + svg("karte-rot","klein") + 'Hausverbot</button><button class="nu-btn nu-btn--primaer nu-btn--klein" data-act="schreibenFertig">' + svg("check") + 'Fertig</button></div>' : '');
}
function pflichtText(){
  var b = bericht(); if(!b) return "";
  var fehlt = [];
  b.besetzung.forEach(function(x){ if(x.name !== "offen" && !x.sig) fehlt.push("Unterschrift " + x.name); });
  if(b.f.kht == null) fehlt.push("KHT-Anruf");
  erkennen(b.f.hinweise, b.f.ziele).mehrdeutig.forEach(function(m){ fehlt.push("@" + m.name + " eindeutig machen"); });
  if(b.f.vorfall == null) fehlt.push("Vorfälle");
  return fehlt.length ? "Es fehlt: " + fehlt.join(", ") : "Alles ausgefüllt.";
}
var aktivesFeld = null;
function dienstNachRender(){
  U.geradeZu = false;
  $$(".p-text, [data-feld]").forEach(function(el){
    el.oninput = function(){ var b = bericht(); b.f[el.dataset.feld] = el.value; speichern(); if(el.dataset.feld === "hinweise"){ $("#erkannt").innerHTML = erkanntHtml(el.value); vorschlagen(el); } };
    el.onfocus = function(){ aktivesFeld = el.id; if(el.tagName === "TEXTAREA" && !el.readOnly && !U.schreiben){ U.schreiben = true; var pos = el.selectionStart; render(); var n = $("#" + aktivesFeld); if(n){ n.focus({preventScroll:true}); n.setSelectionRange(pos, pos); n.scrollIntoView({block:"center"}); } } };
  });
  var tl = $("#tastenleiste");
  if(tl && window.visualViewport){ var vv = window.visualViewport; var lage = function(){ tl.style.bottom = Math.max(0, window.innerHeight - vv.height - vv.offsetTop) + "px"; }; lage(); vv.onresize = lage; vv.onscroll = lage; }
}
function vorschlagen(el){
  var box = $("#vorschlaege"), vor = el.value.slice(0, el.selectionStart), m = /@([A-Za-zÄÖÜäöüß\-]*)$/.exec(vor);
  if(!m){ box.hidden = true; return; }
  var q = m[1].toLowerCase();
  var gaeste = Object.keys(S.G).map(function(k){ return S.G[k]; }).filter(function(g){ return g.vorname.toLowerCase().indexOf(q) === 0; });
  gaeste.sort(function(a, b){ return (bettVon(b.id) ? 1 : 0) - (bettVon(a.id) ? 1 : 0) || a.vorname.localeCompare(b.vorname); });
  box.innerHTML = gaeste.slice(0, 6).map(function(g, i){ var bett = bettVon(g.id); return '<button role="option" aria-selected="' + (i === 0) + '" data-act="erwaehnen" data-arg="' + g.id + '"><span class="nu-treffer-bett' + (bett ? '' : ' is-leer') + '" style="min-width:44px;height:32px;font-size:14px">' + (bett || "–") + '</span>' + esc(g.vorname) + (g.nachname ? ' ' + esc(g.nachname) : '') + '<small>' + (bett ? (g.standort === "nikolaus" ? "St. Nikolaus · " : "") + statusWort(bett) : "Gästedatenbank") + '</small></button>'; }).join("") || '<button role="option" disabled>' + svg("person-plus") + 'Niemand gefunden</button>';
  box.hidden = false;
}
function einfuegenText(txt){
  var el = $("#" + (aktivesFeld || "f-hinweise")) || $("#f-hinweise"); if(!el) return;
  var a = el.selectionStart, b = el.selectionEnd, v = el.value;
  if(/^(Verwarnung|Gelbe Karte|Hausverbot) $/.test(txt)){ var start = v.lastIndexOf("\n", a - 1) + 1; el.value = v.slice(0, start) + txt + v.slice(start); a = b = start + txt.length + (a - start); }
  else { el.value = v.slice(0, a) + txt + v.slice(b); a = b = a + txt.length; }
  el.focus(); el.setSelectionRange(a, b); el.dispatchEvent(new Event("input"));
}
function abschliessen(){
  var b = bericht(); U.pruefen = true;
  var offen = b.besetzung.some(function(x){ return x.name !== "offen" && !x.sig; }) || b.f.kht == null || b.f.vorfall == null || erkennen(b.f.hinweise, b.f.ziele).mehrdeutig.length > 0;
  if(offen){ render(); var p = $(".nu-pille--warnung, .nu-mini-unterschrift:not(.is-fertig):not([disabled])"); if(p) p.scrollIntoView({block:"center", behavior:"smooth"}); toast("warnung", "Bericht noch nicht vollständig", pflichtText(), 5000); return; }
  var e = erkennen(b.f.hinweise, b.f.ziele), anzahl = 0, quelle = "aus Bericht vom " + kurz(H);
  e.absaetze.forEach(function(a){
    if(a.stufe && a.ziel){ anzahl++; a.ziel.sanktionen.push({stufe:a.stufe, datum:iso(H), grund:a.text.replace(STUFE_RE, "").replace(/^\s*(für)?\s*/i, ""), von:aktivePerson(), bis:a.stufe === "Hausverbot" ? null : undefined}); a.ziel.notizen.push({datum:iso(H), text:a.text, von:aktivePerson(), quelle:quelle + " · " + a.stufe}); }
    a.rest.forEach(function(g){ g.notizen.push({datum:iso(H), text:a.text, von:aktivePerson(), quelle:quelle + (a.stufe ? " · erwähnt, keine Sanktion" : "")}); });
  });
  b.status = "abgeschlossen"; b.zuUm = kurz(H) + " · " + uhr(); U.schreiben = false; U.pruefen = false; U.geradeZu = true;
  commit();
  toast("pdf", "Bericht abgeschlossen", iso(H) + "_Dienstbericht.pdf gespeichert" + (anzahl ? " · " + anzahl + (anzahl === 1 ? " Sanktion" : " Sanktionen") + " angelegt" : ""), 5000);
}
var SLOTS = ["19:00","19:30","20:00","20:30","21:00","21:30"];
function duschDatum(){ return U.tag < 0 ? tagDatum() : plus(H, U.duschTag || 0); }
function duschplan(){
  var d = S.dusche[iso(duschDatum())] || {};
  var tage = U.tag < 0 ? '' : '<div class="nu-seg" role="radiogroup" aria-label="Tag">' + ["Heute","Morgen","Übermorgen","In 3 Tagen"].map(function(t, i){ return '<button role="radio" aria-checked="' + ((U.duschTag || 0) === i) + '" data-act="duschTag" data-arg="' + i + '">' + t + '</button>'; }).join("") + '</div>';
  return '<div class="nu-bericht" style="gap:16px"><div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap"><b class="abschnitt" style="flex:1">Duschplan · ' + esc(lang(duschDatum())) + '</b>' + tage + '<span class="nu-beschr" style="flex-basis:100%">19:00 – 22:00 · 30 Minuten · höchstens 3 Tage im Voraus</span><button class="nu-btn nu-btn--klein nu-btn--rahmen" data-act="duschTest">' + svg("glocke") + 'Erinnerung zeigen</button></div><div class="nu-dusche">' +
    SLOTS.map(function(z){ var x = d[z], g = x && S.G[x.g]; var bett = g && Object.keys(S.betten).find(function(n){ return S.betten[n].g === g.id; });
      return '<button class="nu-slot" data-s="' + (x ? x.s : "frei") + '" data-act="slot" data-arg="' + z + '"' + (U.tag < 0 ? ' disabled' : '') + '><span class="zeit">' + z + (x && x.s === "erledigt" ? " ✓" : "") + '</span><b>' + (g ? esc(g.vorname) : "frei") + '</b><span class="nu-beschr">' + (g ? (bett || "") + (x.s === "verpasst" ? " · verpasst" : x.s === "erledigt" ? " · erledigt" : "") : "antippen") + '</span></button>'; }).join("") + '</div></div>';
}
function archivListe(){
  return '<div class="p-liste">' + S.archiv.map(function(a){ return '<div class="nu-bericht" style="gap:8px;padding:18px' + (a.vorfall ? ';box-shadow:inset 0 0 0 3px var(--vorfall)' : '') + '"><div style="display:flex;align-items:center;gap:8px">' + svg(a.vorfall ? "vorfall" : "bericht") + '<b style="flex:1">' + esc(lang(pd(a.datum))) + '</b><span class="nu-beschr">' + esc(a.personen) + '</span><span class="nu-nurlesen">' + svg("schloss","klein") + 'abgeschlossen</span></div><div style="color:var(--tinte-2)">' + esc(a.text) + '</div></div>'; }).join("") + '<p class="nu-beschr">Im Prototyp stehen hier Beispielberichte. Filter, Volltextsuche und „Verlauf exportieren“ sind <span class="nu-bald">' + svg("uhr","klein") + 'noch nicht verfügbar</span></p></div>';
}

// ---------- Monatsabschluss ----------
// Geplant = Originalplan vor Monatsanfang (korrigierbar mit Warnung). Gemacht = Dienste mit Unterschrift im Dienstbericht bis zur Unterschrift unter den Nachweis.
function mKey(d){ return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0"); }
function monatName(k){ var p = k.split("-"); return new Date(+p[0], +p[1] - 1, 1).toLocaleDateString("de-DE", {month:"long", year:"numeric"}); }
function tageVon(k){ var p = k.split("-"), out = [], d = new Date(+p[0], +p[1] - 1, 1); while(d.getMonth() === +p[1] - 1){ out.push(iso(d)); d = plus(d, 1); } return out; }
function planAm(di){ return S.plan0[di] || {nacht:S.dienstplan[di] || [], kueche:S.kueche[di] || ""}; }
function rollenGeplant(di, name){ var p = planAm(di), r = []; p.nacht.forEach(function(n, i){ if(n === name) r.push("Betreuung " + (i + 1)); }); if(p.kueche === name) r.push("Küche"); return r; }
function einsaetzeAm(di){
  if(di === iso(H)){ var b = bericht(di); return b ? b.besetzung.filter(function(x){ return x.sig && x.name !== "offen"; }).map(function(x){ return {name:x.name, rolle:x.rolle, geplant:x.geplant || x.name, grund:x.grund || ""}; }) : []; }
  return S.einsaetze[di] || [];
}
function nachweisDaten(k, name){
  var zeilen = [], sum = {geplant:0, gemacht:0, krank:0, vertretung:0, abgegeben:0}, h = iso(H);
  tageVon(k).forEach(function(di){
    var gp = rollenGeplant(di, name), es = einsaetzeAm(di), selbst = es.filter(function(e){ return e.name === name; }), fuer = es.filter(function(e){ return e.geplant === name && e.name !== name; });
    if(!gp.length && !selbst.length) return;
    var z = {datum:di, geplant:gp.length > 0, gemacht:selbst.length > 0, rolle:(selbst[0] || {}).rolle || gp[0], text:""};
    if(z.geplant) sum.geplant++;
    if(z.gemacht){ sum.gemacht++; var v = selbst.filter(function(e){ return e.geplant !== name; })[0]; if(v){ sum.vertretung++; z.text = "Vertretung für " + v.geplant + (v.grund ? " · " + v.grund : ""); } }
    else if(di < h){ var e = fuer[0]; z.text = e ? (e.grund === "Krankheit" ? "krank · vertreten durch " : "vertreten durch ") + e.name + (e.grund && e.grund !== "Krankheit" ? " · " + e.grund : "") : "ohne Unterschrift im Bericht"; if(e && e.grund === "Krankheit") sum.krank++; else if(e) sum.abgegeben++; z.abw = true; }
    else if(di === h) z.text = "heute · zählt, sobald im Bericht unterschrieben";
    else z.text = "geplant";
    if(z.text.indexOf("Vertretung") === 0) z.abw = true;
    zeilen.push(z);
  });
  return {zeilen:zeilen, sum:sum};
}
function personenIm(k){ var n = {}; tageVon(k).forEach(function(di){ var p = planAm(di); p.nacht.concat([p.kueche]).forEach(function(x){ if(x) n[x] = 1; }); einsaetzeAm(di).forEach(function(e){ n[e.name] = 1; }); });
  return Object.keys(n).sort(function(a, b){ return (TEAM.indexOf(a) + 99) % 99 - (TEAM.indexOf(b) + 99) % 99 || a.localeCompare(b); }); }
function letzterGeplanter(k, name){ var t = tageVon(k).filter(function(di){ return rollenGeplant(di, name).length; }); return t[t.length - 1] || null; }
function nachweisVon(k, name){ return (S.nachweise[k] || {})[name] || null; }
function nachweisPdf(k, name){ return k + "_Dienstnachweis_" + name + ".pdf"; }
function sigBild(seed){ var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 100"><path d="M20 70c' + (10 + seed % 7) + '-30 25-45 35-20s-5 30 12 12 28-38 38-8 18 6 34-12 22-4 40 2" fill="none" stroke="#1B3A8C" stroke-width="3" stroke-linecap="round"/></svg>'; return "data:image/svg+xml;utf8," + encodeURIComponent(s); }
function nachweisSpeichern(k, name, bild, um){ var d = nachweisDaten(k, name); S.nachweise[k] = S.nachweise[k] || {};
  S.nachweise[k][name] = {um:um, sig:bild, zeilen:d.zeilen, geplant:d.sum.geplant, gemacht:d.sum.gemacht, krank:d.sum.krank, vertretung:d.sum.vertretung, abgegeben:d.sum.abgegeben, pdf:nachweisPdf(k, name)}; }
if(nachweisBeispielOffen){ var kv = mKey(new Date(H.getFullYear(), H.getMonth() - 1, 1)); ["Kim","Sam","Mika"].forEach(function(n, i){ nachweisSpeichern(kv, n, sigBild(i * 3 + 1), "01." + String(H.getMonth() + 1).padStart(2, "0") + ". 0" + (7 + i) + ":1" + i); }); delete S.nachweisBeispiel; speichern(); }
function letzterDienstHinweis(){
  if(U.tag !== 0) return "";
  var k = mKey(H), heute = iso(H), wer = (S.dienstplan[heute] || []).concat([S.kueche[heute]]).filter(Boolean);
  return wer.filter(function(n){ return letzterGeplanter(k, n) === heute && !nachweisVon(k, n) && !(U.spaeter || {})[n]; }).map(function(n){
    return '<div class="nu-banner" style="background:var(--erwartet-flaeche);color:var(--blau)">' + svg("unterschrift") + '<div>' + esc(n) + ': Heute ist dein letzter geplanter Dienst im ' + esc(monatName(k).split(" ")[0]) + '.<small>Dienstnachweis jetzt ansehen und unterschreiben? Freiwillig, geht auch später im Monatsabschluss.</small></div><button class="nu-btn nu-btn--klein" data-act="nachweisSpaeter" data-arg="' + esc(n) + '">Später</button><button class="nu-btn nu-btn--klein nu-btn--primaer" data-act="nachweis" data-arg="' + k + ',' + esc(n) + '">Ansehen</button></div>'; }).join("");
}
function monatAnsicht(){
  var k = U.monat || mKey(H), kv = mKey(new Date(H.getFullYear(), H.getMonth() - 1, 1)), kh = mKey(H);
  var wahl = '<div class="nu-seg" role="radiogroup" aria-label="Monat">' + [kv, kh].map(function(x){ return '<button role="radio" aria-checked="' + (x === k) + '" data-act="monatWahl" data-arg="' + x + '">' + esc(monatName(x)) + '</button>'; }).join("") + '</div>';
  var leute = personenIm(k), unterschrieben = leute.filter(function(n){ return nachweisVon(k, n); });
  var zeilen = leute.map(function(n){ var nw = nachweisVon(k, n), d = nw ? {sum:nw} : nachweisDaten(k, n), s = d.sum, abw = [s.krank ? s.krank + " krank" : "", s.abgegeben ? s.abgegeben + " abgegeben" : "", s.vertretung ? s.vertretung + " Vertretung" : ""].filter(Boolean).join(" · ");
    return '<tr><td><b>' + esc(n) + '</b></td><td class="zahl">' + s.geplant + '</td><td class="zahl">' + s.gemacht + '</td><td>' + (abw || '–') + '</td><td>' + (nw ? '<span class="nu-pille nu-pille--frei">' + svg("check","klein") + 'unterschrieben ' + esc(nw.um) + '</span>' : '<span class="nu-pille nu-pille--warnung">offen</span>') + '</td><td style="text-align:right"><button class="nu-btn nu-btn--klein nu-btn--rahmen" data-act="nachweis" data-arg="' + k + ',' + esc(n) + '">' + (nw ? 'Ansehen' : 'Öffnen') + '</button></td></tr>'; }).join("");
  var lohn = unterschrieben.map(function(n){ var nw = nachweisVon(k, n); return '<tr><td><b>' + esc(n) + '</b></td><td class="zahl">' + nw.geplant + '</td><td class="zahl">' + nw.gemacht + '</td><td class="zahl">' + nw.krank + '</td><td class="zahl">' + (nw.abgegeben || 0) + '</td><td class="zahl">' + nw.vertretung + '</td><td>' + esc(nw.um) + '</td><td>' + svg("pdf","klein") + ' ' + esc(nw.pdf) + '</td></tr>'; }).join("");
  return '<div class="nu-bericht" style="gap:16px"><div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap"><b class="abschnitt" style="flex:1">Monatsabschluss · ' + esc(monatName(k)) + '</b>' + wahl + '</div>' +
    '<p class="nu-beschr" style="font-size:15px;line-height:22px">Jede Person unterschreibt einmal im Monat: geplante Dienste laut Originalplan, gemachte Dienste mit Unterschrift im Bericht. ' + unterschrieben.length + ' von ' + leute.length + ' unterschrieben.</p>' +
    '<div style="overflow:auto"><table class="nu-tabelle"><thead><tr><th>Person</th><th class="zahl">Geplant</th><th class="zahl">Gemacht</th><th>Abweichung</th><th>Status</th><th></th></tr></thead><tbody>' + zeilen + '</tbody></table></div></div>' +
    '<div class="nu-bericht" style="gap:12px;margin-top:16px"><div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap"><b class="abschnitt" style="flex:1">Für die Lohnabrechnung</b><span class="nu-bald">' + svg("uhr","klein") + 'Export als Datei noch nicht verfügbar</span></div>' +
    (lohn ? '<div style="overflow:auto"><table class="nu-tabelle"><thead><tr><th>Person</th><th class="zahl">Geplant</th><th class="zahl">Gemacht</th><th class="zahl">Krank</th><th class="zahl">Abgegeben</th><th class="zahl">Vertretung</th><th>Unterschrieben</th><th>PDF</th></tr></thead><tbody>' + lohn + '</tbody></table></div>' : '<p class="nu-beschr">Noch niemand hat unterschrieben.</p>') +
    '<p class="nu-beschr">Nur unterschriebene Nachweise kommen in die Tabelle; sie liegt mit den PDFs in Nextcloud unter Lohnabrechnung_' + k + '.</p></div>';
}
function nachweisBlatt(k, name){
  var nw = nachweisVon(k, name), d = nw ? {zeilen:nw.zeilen, sum:nw} : nachweisDaten(k, name), s = d.sum;
  var tab = '<div style="overflow:auto;max-height:300px"><table class="nu-tabelle"><thead><tr><th>Datum</th><th>Geplant</th><th>Gemacht</th><th>Bemerkung</th></tr></thead><tbody>' + d.zeilen.map(function(z){
    return '<tr' + (z.abw ? ' class="is-abweichung"' : '') + '><td class="zahl" style="text-align:left">' + esc(pd(z.datum).toLocaleDateString("de-DE", {weekday:"short"}).replace(".", "") + " " + kurz(pd(z.datum))) + '</td><td>' + (z.geplant ? svg("check","klein") : '–') + '</td><td>' + (z.gemacht ? svg("check","klein") + ' ' + esc(z.rolle || "") : '–') + '</td><td>' + esc(z.text) + '</td></tr>'; }).join("") + '</tbody></table></div>';
  var kz = '<div class="nu-kennzahlen" style="background:var(--flaeche-2)"><span class="nu-kennzahl">Geplant<b>' + s.geplant + '</b></span><span class="nu-kennzahl">Gemacht<b>' + s.gemacht + '</b></span><span class="nu-kennzahl">Krank<b>' + s.krank + '</b></span><span class="nu-kennzahl">Abgegeben<b>' + (s.abgegeben || 0) + '</b></span><span class="nu-kennzahl">Vertretung<b>' + s.vertretung + '</b></span></div>' +
    S.planLog.filter(function(l){ return l.monat === k && l.name === name; }).map(function(l){ return '<div class="nu-zeile nu-zeile--warnung">' + svg("stift") + '<div><b>Plan korrigiert: ' + esc(l.aenderungen.join(", ")) + '</b><small>' + esc(l.grund) + ' · ' + esc(l.von) + ' · ' + esc(l.um) + '</small></div></div>'; }).join("");
  var unten = nw ? '<div class="nu-gesperrt">' + svg("schloss") + '<div style="flex:1">Unterschrieben ' + esc(nw.um) + '<small>' + esc(nw.pdf) + ' · in der Lohntabelle · nicht mehr änderbar</small></div><img src="' + nw.sig + '" alt="Unterschrift ' + esc(name) + '" style="height:48px;background:var(--papier);border-radius:8px;padding:2px 8px"></div>'
    : '<button class="nu-btn nu-btn--rahmen nu-btn--klein" style="justify-self:start" data-act="planKorrektur" data-arg="' + k + ',' + esc(name) + '">' + svg("stift") + 'Geplante Dienste korrigieren</button>' +
      '<div class="nu-unterschrift" data-pad="mon"><div class="nu-unterschrift-kopf"><b>' + esc(name) + '</b><small>Die Angaben stimmen</small></div><div class="nu-unterschrift-feld" style="height:150px"><span class="nu-unterschrift-marke">' + svg("check","klein") + 'Bestätigt</span><span class="nu-unterschrift-hilfe">Mit Finger oder Stift unterschreiben</span></div><div class="nu-unterschrift-knoepfe"><button class="nu-btn nu-btn--klein" data-pad-act="leeren">' + svg("rueckgaengig") + 'Löschen</button><button class="nu-btn nu-btn--primaer nu-btn--klein" data-pad-act="ok" disabled>Unterschreiben</button></div></div>';
  return blatt("Dienstnachweis " + monatName(k) + " · " + name, nw ? "" : "Gemacht zählt jeder Dienst mit Unterschrift im Bericht bis jetzt. Nach der Unterschrift ist der Nachweis gesperrt.", kz + tab + unten, '<button class="nu-btn nu-btn--klein" data-act="modalZu">Schließen</button>').replace('class="p-blatt"', 'class="p-blatt p-blatt--breit"');
}
function nachweisUnterschreiben(bild){ var n = U.nachweis; if(!n || nachweisVon(n.k, n.name)) return;
  nachweisSpeichern(n.k, n.name, bild, kurz(H) + " " + uhr()); U.modal = null; commit(); ACT.nachweis(n.k + "," + n.name);
  toast("pdf", "Dienstnachweis unterschrieben", nachweisPdf(n.k, n.name) + " · in die Lohntabelle übernommen", 5000); }

// ---------- Kalender ----------
function kw(d){ var t = new Date(d.getFullYear(), d.getMonth(), d.getDate()); t.setDate(t.getDate() + 3 - (t.getDay() + 6) % 7); var w1 = new Date(t.getFullYear(), 0, 4); return 1 + Math.round(((t - w1) / 864e5 - 3 + (w1.getDay() + 6) % 7) / 7); }
function terminChip(t, gross){ return '<span class="nu-termin' + (t.art === "Feiertag" ? ' nu-termin--feiertag' : '') + '">' + svg(t.sym) + (gross ? '<span>' + esc(t.titel) + '<small>' + esc(t.art) + '</small></span>' : esc(t.titel)) + '</span>'; }
function wocheAnsicht(){
  var basis = pd(U.kalTag), start = plus(basis, -((basis.getDay() + 6) % 7)), ende = plus(start, 6);
  var tage = [0,1,2,3,4,5,6].map(function(i){ var d = plus(start, i), di = iso(d), dp = S.dienstplan[di];
    return '<div class="nu-woche-tag' + (di === iso(H) ? ' is-heute' : d < H ? ' is-vorbei' : '') + '"><div class="nu-woche-kopf"><b>' + d.getDate() + '</b><span>' + d.toLocaleDateString("de-DE", {weekday:"short"}).replace(".", "") + '</span></div>' +
      '<span class="nu-termin nu-termin--dienst">' + svg("personen") + '<span>Nachtdienst<small>' + esc(dp ? (dp.filter(Boolean).join(", ") || "offen") : "offen") + '</small></span></span>' +
      '<span class="nu-termin">' + svg("kueche") + '<span>Küche<small>' + esc(S.kueche[di] || "offen") + '</small></span></span>' +
      S.termine.filter(function(t){ return t.datum === di; }).map(function(t){ return terminChip(t, true); }).join("") +
      '<button class="nu-woche-plus" data-act="terminNeu" data-arg="' + di + '">' + svg("plus","klein") + 'Termin</button></div>'; }).join("");
  return {titel:"KW " + kw(start) + " · " + kurz(start) + " – " + kurz(ende) + ende.getFullYear(), html:'<div class="nu-woche">' + tage + '</div>'};
}
function kalenderAnsicht(){
  var umschalter = '<div class="nu-seg" role="radiogroup" aria-label="Ansicht"><button role="radio" aria-checked="' + (U.kalAnsicht === "woche") + '" data-act="kalAnsicht" data-arg="woche">7 Tage</button><button role="radio" aria-checked="' + (U.kalAnsicht === "monat") + '" data-act="kalAnsicht" data-arg="monat">Monat</button></div>';
  if(U.kalAnsicht === "woche"){ var w = wocheAnsicht();
    return '<div class="p-plan-zeile" style="margin-bottom:12px"><h1 class="titel-gross" style="margin:0;flex:1">' + esc(w.titel) + '</h1>' + umschalter + '<button class="nu-iconbtn nu-iconbtn--fl" data-act="woche" data-arg="-7" aria-label="Vorige Woche">' + svg("zurueck") + '</button><button class="nu-btn nu-btn--rahmen nu-btn--klein" data-act="woche" data-arg="0">Heute</button><button class="nu-iconbtn nu-iconbtn--fl" data-act="woche" data-arg="7" aria-label="Nächste Woche">' + svg("weiter") + '</button><button class="nu-btn nu-btn--rahmen nu-btn--klein" data-act="importBlatt">' + svg("scannen") + 'Dienstplan einlesen</button></div>' + w.html;
  }
  var basis = pd(U.kalTag), jahr = basis.getFullYear(), monat = basis.getMonth();
  var erster = new Date(jahr, monat, 1), versatz = (erster.getDay() + 6) % 7, start = plus(erster, -versatz);
  var titel = erster.toLocaleDateString("de-DE", {month:"long", year:"numeric"});
  var zellen = ["Mo","Di","Mi","Do","Fr","Sa","So"].map(function(d){ return '<div class="nu-monat-kopf">' + d + '</div>'; }).join("");
  for(var i = 0; i < 42; i++){
    var d = plus(start, i), di = iso(d), anders = d.getMonth() !== monat;
    var dp = S.dienstplan[di], ev = S.termine.filter(function(t){ return t.datum === di; });
    var chips = (dp && !anders ? '<span class="nu-termin nu-termin--dienst">' + svg("personen") + esc(dp.filter(Boolean).join(" + ") || "offen") + '</span>' : '') + ev.map(function(t){ return '<span class="nu-termin' + (t.art === "Feiertag" ? ' nu-termin--feiertag' : '') + '">' + svg(t.sym) + esc(t.titel) + '</span>'; }).join("");
    zellen += '<button class="nu-tag' + (anders ? ' is-anders' : '') + (di === iso(H) ? ' is-heute' : '') + '" data-act="kalTag" data-arg="' + di + '"' + (di === U.kalTag ? ' style="box-shadow:inset 0 0 0 2px var(--tinte)"' : '') + '><span class="d">' + d.getDate() + '</span>' + chips + '</button>';
  }
  var sel = pd(U.kalTag), dpSel = S.dienstplan[U.kalTag] || ["",""], evSel = S.termine.filter(function(t){ return t.datum === U.kalTag; });
  var seite = '<aside class="p-tag-detail"><b class="titel" style="font-size:20px">' + esc(lang(sel)) + '</b>' +
    '<div class="nu-zeile">' + svg("personen") + '<div>Nachtdienst 18:45–08:00<small>' + esc(dpSel.filter(Boolean).join(", ") || "offen") + '</small></div></div><div class="nu-zeile">' + svg("kueche") + '<div>Küche 17:00–21:00<small>' + esc(S.kueche[U.kalTag] || "offen") + '</small></div></div>' +
    evSel.map(function(t){ return '<div class="nu-zeile' + (t.art === "Feiertag" ? ' nu-zeile--warnung' : '') + '">' + svg(t.sym) + '<div>' + esc(t.titel) + '<small>' + esc(t.art) + '</small></div></div>'; }).join("") +
    '<button class="nu-btn nu-btn--rahmen nu-btn--klein" data-act="terminBlatt" style="justify-self:start">' + svg("plus") + 'Termin</button></aside>';
  return '<div class="p-plan-zeile" style="margin-bottom:12px"><h1 class="titel-gross" style="margin:0;flex:1">' + esc(titel) + '</h1>' + umschalter + '<button class="nu-iconbtn nu-iconbtn--fl" data-act="monat" data-arg="-1" aria-label="Voriger Monat">' + svg("zurueck") + '</button><button class="nu-iconbtn nu-iconbtn--fl" data-act="monat" data-arg="1" aria-label="Nächster Monat">' + svg("weiter") + '</button><button class="nu-btn nu-btn--rahmen nu-btn--klein" data-act="importBlatt">' + svg("scannen") + 'Dienstplan einlesen</button></div>' +
    '<div class="p-kal-raster"><div class="nu-monat">' + zellen + '</div>' + seite + '</div>';
}

// ---------- Einstellungen ----------
var EINST = [["darstellung","mond","Darstellung"],["betten","bett","Betten und Zimmer"],["ampel","ampel","Ampel und KHT"],["abgleich","abgleich","Abgleich"],["daten","loeschen","Beispieldaten"]];
function einstellungenAnsicht(){
  if(!U.pinOk){
    return '<div class="p-leer" style="padding-top:24px"><div class="nu-pin">' + svg("schloss") + '<b class="titel">Admin-PIN eingeben</b><div class="nu-pin-punkte' + (U.pinFalsch ? ' is-falsch' : '') + '">' + [0,1,2,3].map(function(i){ return '<i class="' + (i < U.pin.length ? 'is-voll' : '') + '"></i>'; }).join("") + '</div>' +
      '<div class="nu-pin-tasten">' + ["1","2","3","4","5","6","7","8","9","","0","⌫"].map(function(x){ return x ? '<button data-act="pinTaste" data-arg="' + x + '" aria-label="' + (x === "⌫" ? "Löschen" : x) + '">' + x + '</button>' : '<span></span>'; }).join("") + '</div><p class="nu-beschr">' + (U.pinFalsch ? 'PIN stimmt nicht. ' : '') + 'Im Prototyp lautet die PIN 1234.</p></div></div>';
  }
  U.pinFalsch = false;
  var nav = '<nav class="p-einst-nav">' + EINST.map(function(e){ return '<button data-act="einst" data-arg="' + e[0] + '" aria-current="' + (U.einst === e[0]) + '">' + svg(e[1]) + e[2] + '</button>'; }).join("") + '</nav>';
  var z = function(sym, t, s, rechts){ return '<div class="nu-einstellung">' + svg(sym) + '<div><b>' + t + '</b><small>' + s + '</small></div>' + rechts + '</div>'; };
  var bald = '<span class="nu-bald">' + svg("uhr","klein") + 'noch nicht verfügbar</span>';
  var inhalt = "";
  if(U.einst === "darstellung") inhalt = z("mond", "Tag- und Nachtmodus", "Automatisch: Nacht von 20:00 bis 07:00", '<div class="nu-seg" role="radiogroup">' + [["auto","Auto"],["tag","Tag"],["nacht","Nacht"]].map(function(x){ return '<button role="radio" aria-checked="' + (S.theme === x[0]) + '" data-act="thema" data-arg="' + x[0] + '">' + x[1] + '</button>'; }).join("") + '</div>') +
    z("sperren", "App-Sperre", "Nach 5 Minuten ohne Eingabe, App-PIN", bald) + z("tastatur", "Kioskmodus", "App anheften, Lösen nur mit PIN", bald);
  if(U.einst === "betten") inhalt = '<p class="nu-beschr" style="font-size:15px;line-height:22px">Zimmer oder einzelne Betten sperren, Nummern innerhalb eines Zimmers tauschen, weitere Plätze anlegen. Notbetten zählen nur, wenn sie belegt sind.</p>' +
    HAUS.concat(NIKO).map(einstZimmer).join("");
  if(U.einst === "ampel") inhalt = z("telefon", "KHT-Nummer", "Belegte Betten beider Standorte. Notbetten nur, wenn belegt.", '<button class="nu-btn nu-btn--rahmen nu-btn--klein" data-act="khtBlatt">Ansehen</button>') +
    z("bett", "Notbetten", (BETTEN_HAUS.filter(function(b){ return S.notbett[b.nr]; }).map(function(b){ return b.nr; }).join(", ") || "keine") + " · nur über den Kältebus belegt", '') +
    z("ampel", "Ampel grün ab", "freie Betten, gelb darunter, rot bei 0", '<div class="p-stepper"><button class="nu-iconbtn" data-act="ampelSchwelle" data-arg="-1" aria-label="Weniger">' + svg("minus") + '</button><b>' + S.ampel.gruen + '</b><button class="nu-iconbtn" data-act="ampelSchwelle" data-arg="1" aria-label="Mehr">' + svg("plus") + '</button></div>') +
    z("wolke-ok", "Meldung an die Ampel", "Freie Betten, nie Namen", bald);
  if(U.einst === "abgleich") inhalt = z("abgleich", "Zeitplan", "17:00–09:00 stündlich, tagsüber Pause, nach „Bericht abschließen“ sofort", bald) +
    z("wolke-aus", "Offline ausprobieren", "Zeigt, wie ausstehende Änderungen angezeigt werden", '<button class="nu-schalter" role="switch" aria-checked="' + S.sync.offline + '" data-act="offline" aria-label="Offline ausprobieren"></button>');
  if(U.einst === "daten") inhalt = z("loeschen", "Beispieldaten zurücksetzen", "Alle Änderungen in diesem Browser verwerfen", '<button class="nu-btn nu-btn--gefahr nu-btn--klein" data-act="reset">Zurücksetzen</button>') +
    '<p class="nu-beschr">Alles, was du im Prototyp änderst, bleibt nur in diesem Browser. Es gibt keine Verbindung zu Nextcloud.</p>';
  return '<div class="p-plan-zeile" style="margin-bottom:12px"><h1 class="titel-gross" style="margin:0;flex:1">Einstellungen</h1><button class="nu-btn nu-btn--rahmen nu-btn--klein" data-act="pinSperren">' + svg("schloss") + 'Sperren</button></div><div class="p-einst-raster">' + nav + '<div class="p-liste">' + inhalt + '</div></div>';
}

// ---------- Einstellungen: Zimmerkarte ----------
function einstZimmer(r){
  var an = !S.offRooms[r.id], extra = r.id === "X" || r.id === "NX", niko = r.id === "N" || r.id === "NX";
  var plaetze = BETTEN_HAUS.concat(BETTEN_NIKO).filter(function(b){ return b.zimmer === r.id; }).map(function(b){ return b.nr; });
  if(!plaetze.length && !extra) return "";
  var nrs = plaetze.map(anPlatz), tausch = U.tausch && U.tausch.zimmer === r.id, verschoben = nrs.some(function(n){ return posOf(n) !== n; });
  var inBetrieb = nrs.filter(function(n){ return !istAus(n); }).length, mitNotbett = ["L","E","TH","X","NX"].indexOf(r.id) >= 0;
  var titel = r.id === "N" ? "St. Nikolaus · Saal" : r.id === "NX" ? "St. Nikolaus · Weitere Plätze" : r.id === "X" ? "St. Pius · Weitere Plätze" : esc(r.name);
  var rechts = (nrs.length > 1 && !tausch ? '<button class="nu-btn nu-btn--klein nu-btn--rahmen" data-act="tauschStart" data-arg="' + r.id + '">' + svg("tauschen") + 'Nummern tauschen</button>' : '') +
    (nrs.length ? '<button class="nu-schalter" role="switch" aria-checked="' + an + '" data-act="zimmerAus" data-arg="' + r.id + '" aria-label="' + esc(titel) + ' in Betrieb"></button>' : '');
  var kachel = function(nr){
    var aus = istAus(nr), belegt = gastVon(nr) && !zaehlt(nr), wo = lageVon(nr) ? "Stockbett " + lageVon(nr) : "";
    var info = S.offRooms[r.id] ? "Zimmer gesperrt" : S.offBeds[nr] ? "gesperrt" : belegt ? "belegt · " + esc(gastVon(nr).vorname) : (extra && ORT[nr] ? esc(ORT[nr]) : wo || "in Betrieb");
    if(tausch) return '<button class="nu-bettschalter" style="border:0;font:inherit;text-align:left;cursor:pointer;width:100%' + (U.tausch.a === nr ? ';box-shadow:inset 0 0 0 3px var(--tinte);background:var(--flaeche)' : '') + '" data-act="nummerWahl" data-arg="' + nr + '" aria-pressed="' + (U.tausch.a === nr) + '"><div style="flex:1;min-width:0"><b>' + nr + '</b><small>' + (posOf(nr) !== nr ? "Platz von " + posOf(nr) : (wo || "Einzelbett")) + '</small></div>' + svg("tauschen") + '</button>';
    return '<div class="nu-bettschalter' + (aus ? ' is-aus' : '') + '" style="flex-wrap:wrap"><div style="flex:1;min-width:0"><b>' + nr + '</b><small>' + info + '</small></div>' +
      '<button class="nu-schalter" role="switch" aria-checked="' + !S.offBeds[nr] + '" data-act="bettAus" data-arg="' + nr + '"' + (S.offRooms[r.id] ? ' disabled' : '') + ' aria-label="Bett ' + nr + ' in Betrieb"></button>' +
      (mitNotbett ? '<button class="nu-chip" style="flex-basis:100%;justify-content:center" aria-pressed="' + !!S.notbett[nr] + '" data-act="notbett" data-arg="' + nr + '">' + (S.notbett[nr] ? svg("check","klein") : '') + 'Notbett</button>' : '') +
      (extra ? '<div style="display:flex;gap:6px;flex-basis:100%"><button class="nu-btn nu-btn--klein nu-btn--rahmen" style="flex:1" data-act="extraUmbenennen" data-arg="' + nr + '">' + svg("stift") + 'Umbenennen</button>' + (belegt ? '' : '<button class="nu-iconbtn nu-iconbtn--fl" data-act="extraWeg" data-arg="' + nr + '" aria-label="Platz ' + nr + ' entfernen">' + svg("loeschen") + '</button>') + '</div>' : '') + '</div>';
  };
  return '<div class="nu-zimmer-einst">' + '<div class="nu-einstellung">' + svg(niko ? "standort-2" : r.id === "TH" ? "haus" : "bett") + '<div><b>' + titel + '</b><small>' + (!nrs.length ? "Noch keine weiteren Plätze" : an ? inBetrieb + " von " + nrs.length + " Betten in Betrieb" : "Zimmer gesperrt") + '</small></div>' + rechts + '</div>' +
    (tausch ? '<div class="nu-zeile" style="margin:0 8px 6px">' + svg("tauschen") + '<div>' + (U.tausch.a ? 'Jetzt das zweite Bett antippen.' : 'Zwei Betten antippen, deren Nummern den Platz tauschen.') + '<small>Belegung, Sperre und Notbett bleiben bei der Nummer.</small></div>' + (verschoben ? '<button class="nu-btn nu-btn--klein" data-act="tauschZurueck" data-arg="' + r.id + '">Ursprünglich</button>' : '') + '<button class="nu-btn nu-btn--klein nu-btn--primaer" data-act="tauschEnde">Fertig</button></div>' : '') +
    (nrs.length ? '<div class="nu-bettschalter-liste"' + (extra ? ' style="grid-template-columns:repeat(auto-fill,minmax(240px,1fr))"' : '') + '>' + nrs.map(kachel).join("") + '</div>' : '') +
    (extra ? '<div style="display:flex;gap:8px;padding:0 8px 8px;flex-wrap:wrap;align-items:flex-end"><div class="nu-feld" style="width:120px"><label for="nr-' + r.id + '">Nummer</label><input class="nu-eingabe" id="nr-' + r.id + '" value="' + naechsteNummer(r.id === "NX" ? "N" : "Z") + '" maxlength="6" autocapitalize="characters"></div><div class="nu-feld" style="flex:1 1 220px"><label for="name-' + r.id + '">Bezeichnung</label><input class="nu-eingabe" id="name-' + r.id + '" placeholder="z. B. ' + (r.id === "NX" ? 'Matratze Flur' : 'Sofa Wohnzimmer') + '"></div><button class="nu-btn nu-btn--rahmen" data-act="extraDazu" data-arg="' + (r.id === "NX" ? "niko" : "pius") + '">' + svg("bett-plus") + 'Platz hinzufügen</button></div>' : '') + '</div>';
}
function naechsteNummer(p){ var n = p === "N" ? 9 : 1; while(ZIMMER_VON[p + n]) n++; return p + n; }
function nummerPruefen(neu, alt){ if(!/^[A-Za-zÄÖÜäöü0-9\-]{1,6}$/.test(neu)) return "Nummer: 1–6 Zeichen, Buchstaben und Ziffern."; if(neu !== alt && (ZIMMER_VON[neu] || S.betten[neu])) return "Die Nummer " + neu + " gibt es schon."; return ""; }
function nummerAendern(alt, neu){
  ["betten","offBeds","notbett"].forEach(function(k){ if(S[k][alt] !== undefined){ S[k][neu] = S[k][alt]; delete S[k][alt]; } });
  S.extra.forEach(function(x){ if(x.id === alt) x.id = neu; }); delete ORT[alt];
}

// ---------- Gästedatenbank ----------
function gastAus(arg){ return S.G[arg] || gastVon(arg); }
function gaesteListe(){
  var q = U.gSuche.trim().toLowerCase();
  return Object.keys(S.G).map(function(k){ return S.G[k]; }).filter(function(g){
    if(q && [g.vorname, g.nachname, g.spitz, g.nr, bettVon(g.id)].join(" ").toLowerCase().indexOf(q) < 0) return false;
    if(U.gFilter === "bett") return !!bettVon(g.id);
    if(U.gFilter === "offen") return g.standort !== "nikolaus" && (!g.unterschrieben || g.laus === "fehlt");
    if(U.gFilter === "verbot") return !!hausverbot(g);
    return true; }).sort(function(a, b){ return a.vorname.localeCompare(b.vorname) || (bettVon(a.id) || "zz").localeCompare(bettVon(b.id) || "zz"); });
}
function gastZeile(g){ var bett = bettVon(g.id), hv = hausverbot(g), offen = g.standort !== "nikolaus" && !g.unterschrieben;
  return '<button class="nu-treffer' + (hv ? ' is-verbot' : '') + '" data-act="akteZeigen" data-arg="' + g.id + '" aria-current="' + (U.akte === g.id) + '"><span class="nu-treffer-bett' + (bett ? '' : ' is-leer') + '">' + (bett || "–") + '</span><div style="flex:1;min-width:0"><b>' + esc(g.vorname + (g.nachname ? " " + g.nachname : "")) + (g.spitz ? ' <span style="font-weight:400">„' + esc(g.spitz) + '“</span>' : '') + '</b><small>' + (hv ? 'Hausverbot · ' : '') + (g.standort === "nikolaus" ? "St. Nikolaus · " : "") + esc(SPRACHE[g.sprache][2]) + ' · ' + naechteText(g.naechte) + '</small></div>' + (offen ? svg("unterschrift") : '') + (g.laus === "fehlt" ? svg("laeuseschein-fehlt") : '') + '</button>'; }
function akteHtml(g){
  var bett = bettVon(g.id), hv = hausverbot(g), nik = g.standort === "nikolaus";
  var dz = function(sym, titel, text, rechts, fehlt){ return '<div class="nu-dokzeile' + (fehlt ? ' is-fehlt' : '') + '">' + svg(sym) + '<div><b>' + titel + '</b><small>' + text + '</small></div>' + (rechts || '') + '</div>'; };
  var ho = g.unterschrieben ? dz("pdf", "Hausordnung", (g.papier ? "auf Papier unterschrieben, Foto hinterlegt" : "unterschrieben " + (g.unterschriebenAm ? "am " + kurz(pd(g.unterschriebenAm)) : "bei der Aufnahme") + " · deutsche Fassung" + (g.uebersetzung ? ", Übersetzung " + esc(SPRACHE[g.uebersetzung][2]) : "")), '<button class="nu-btn nu-btn--klein nu-btn--rahmen" data-act="pdfZeigen">' + svg("pdf") + 'Ansehen</button>')
    : dz("unterschrift", "Hausordnung", nik ? "St. Nikolaus: unterschreibt außerhalb der App. Foto kann hinterlegt werden." : "Noch nicht unterschrieben. Kann jederzeit nachgeholt werden.", nik ? '' : '<button class="nu-btn nu-btn--klein nu-btn--primaer" data-act="nachholen" data-arg="' + g.id + '">' + svg("stift") + 'Jetzt unterschreiben</button>', !nik);
  var ds = g.unterschrieben ? dz("pdf", "Datenschutzerklärung", "auf Deutsch, unterschrieben vom Gast", '') : dz("unterschrift", "Datenschutzerklärung", "wird zusammen mit der Hausordnung unterschrieben", '', !nik);
  var la = nik ? dz("laeuseschein", "Läuseschein", "in St. Nikolaus nicht erfasst", '') : g.laus === "liegt" ? dz("laeuseschein", "Läuseschein", "liegt vor" + (g.lausVon ? " · geprüft von " + esc(g.lausVon) : "") + " · gilt die ganze Saison", '') : g.laus === "fehlt" ? dz("laeuseschein-fehlt", "Läuseschein", "fehlt seit " + lausTage(g) + " Tagen", '<button class="nu-btn nu-btn--klein nu-btn--rahmen" data-act="lausScan" data-arg="' + g.id + '">' + svg("scannen") + 'Scannen</button>', true) : dz("laeuseschein", "Läuseschein", "nicht nötig (eine Nacht)", '');
  var weitere = g.dokumente.filter(function(d){ return d.art !== "Hausordnung und Datenschutz"; }).map(function(d){ return dz(d.foto ? "kamera" : "pdf", esc(d.art), esc(d.datei) + " · " + kurz(pd(d.datum)) + " · " + esc(d.von), ''); }).join("");
  var sank = g.sanktionen.length ? g.sanktionen.map(function(x){ return '<div class="nu-zeile">' + svg(stufeSym(x.stufe)) + '<div>' + esc(x.stufe) + ' · ' + kurz(pd(x.datum)) + (x.bis ? ' · bis ' + kurz(pd(x.bis)) : '') + '<small>' + esc(x.grund) + ', eingetragen von ' + esc(x.von) + '</small></div></div>'; }).join("") : '<p class="nu-beschr">Keine Einträge.</p>';
  var notizen = g.notizen.slice().reverse().map(function(n){ return '<div class="nu-notiz">' + esc(n.text) + '<small>' + kurz(pd(n.datum)) + ' · ' + esc(n.von) + (n.quelle ? ' · ' + esc(n.quelle) : '') + '</small></div>'; }).join("") || '<p class="nu-beschr">Noch keine Notizen.</p>';
  return '<article class="p-akte" aria-label="Gastakte ' + esc(anzeige(g)) + '"><div style="display:flex;gap:14px;align-items:flex-start"><span class="nu-treffer-bett' + (bett ? '' : ' is-leer') + '" style="min-width:64px;height:52px;font-size:20px">' + (bett || "–") + '</span><div style="flex:1;min-width:0"><h2 style="margin:0;font:700 24px/30px var(--font-ui)">' + esc(g.vorname + (g.nachname ? " " + g.nachname : "")) + (g.spitz ? ' <span style="font-weight:400;color:var(--tinte-2)">„' + esc(g.spitz) + '“</span>' : '') + '</h2><p class="nu-beschr" style="font-size:15px;line-height:22px">' + (g.nr ? 'Aufnahme ' + esc(g.nr) + ' · ' : '') + esc(SPRACHE[g.sprache][2]) + ' · ' + naechteText(g.naechte) + ' · erste Aufnahme ' + kurz(pd(g.erste)) + (gleicherVorname(g) ? ' · angezeigt als ' + esc(anzeige(g)) : '') + '</p></div>' + (bett ? '<button class="nu-btn nu-btn--klein nu-btn--rahmen" data-act="imPlan" data-arg="' + bett + '">' + svg("bett") + 'Im Plan</button>' : '') + (U.akte && schmal() ? '<button class="nu-iconbtn nu-iconbtn--fl" data-act="akteZu" aria-label="Schließen">' + svg("schliessen") + '</button>' : '') + '</div>' +
    (hv ? '<div class="nu-zeile nu-zeile--vorfall">' + svg("karte-rot") + '<div><b>Hausverbot ' + (hv.bis ? 'bis ' + kurz(pd(hv.bis)) : 'unbefristet') + '</b><small>' + esc(hv.grund) + '</small></div></div>' : '') +
    '<section class="nu-abschnitt"><h3>Dokumente</h3>' + ho + ds + la + weitere + '<button class="nu-btn nu-btn--rahmen" style="justify-self:start" data-act="dokBlatt" data-arg="' + g.id + '">' + svg("dokument-plus") + 'Dokument hinterlegen</button></section>' +
    '<section class="nu-abschnitt"><h3>Sanktionen</h3>' + sank + '</section>' +
    '<section class="nu-abschnitt"><h3>Notizen und Erwähnungen</h3>' + notizen + '</section></article>';
}
function gaesteAnsicht(){
  var liste = gaesteListe();
  if(U.akte && !S.G[U.akte]) U.akte = null;
  var akte = U.akte ? akteHtml(S.G[U.akte]) : '<div class="p-akte p-leer" style="padding:48px 24px">' + svg("personen") + '<b>Gast auswählen</b><span>Hier liegen Hausordnung, Datenschutz, Läuseschein und weitere Dokumente. Fehlendes lässt sich jederzeit nachholen oder als Foto hinterlegen.</span></div>';
  var filter = '<div class="nu-seg" role="radiogroup" aria-label="Filter">' + [["alle","Alle"],["bett","Mit Bett"],["offen","Fehlt etwas"],["verbot","Hausverbot"]].map(function(f){ return '<button role="radio" aria-checked="' + (U.gFilter === f[0]) + '" data-act="gFilter" data-arg="' + f[0] + '">' + f[1] + '</button>'; }).join("") + '</div>';
  return '<div class="p-plan-zeile" style="margin-bottom:12px"><h1 class="titel-gross" style="margin:0;flex:1">Gästedatenbank</h1>' + filter + '</div>' +
    '<div class="p-gaeste' + (U.akte ? ' is-akte' : '') + '"><div class="p-gliste"><div style="position:relative"><input class="nu-eingabe" id="g-suche" value="' + esc(U.gSuche) + '" placeholder="Name, Spitzname oder Bettnummer" style="padding-left:48px" autocomplete="off" aria-label="Suchen"><span style="position:absolute;left:14px;top:16px;color:var(--tinte-2)">' + svg("suche") + '</span></div>' +
    '<p class="nu-beschr">' + liste.length + (liste.length === 1 ? ' Person' : ' Personen') + ' · gleiche Vornamen unterscheidet die Bettnummer</p>' + liste.map(gastZeile).join("") + '</div>' + akte + '</div>';
}
function gaesteNachRender(){
  var su = $("#g-suche"); if(su) su.oninput = function(){ U.gSuche = su.value; var pos = su.selectionStart; render(); var n = $("#g-suche"); n.focus(); n.setSelectionRange(pos, pos); };
}

// ---------- Glocke, Abgleich ----------
function glockenListe(){
  var e = erinnerungen();
  return '<div class="p-glocke"><div class="nu-glocke-liste" role="dialog" aria-label="Erinnerungen"><div style="display:flex;align-items:center;padding:6px 6px 6px 10px"><b style="flex:1">' + (e.length ? e.length + " offene Erinnerungen" : "Keine offenen Erinnerungen") + '</b><button class="nu-iconbtn" data-act="glocke" aria-label="Schließen">' + svg("schliessen") + '</button></div>' +
    e.map(function(x){ return '<button class="nu-zeile' + (x.warn ? ' nu-zeile--warnung' : '') + '" style="border:0;text-align:left;cursor:pointer;width:100%;font:inherit" data-act="erinnerung" data-arg="' + (x.nr || (x.dusche ? "dusche" : "dienst")) + '">' + svg(x.sym) + '<div>' + esc(x.text) + '<small>' + esc(x.klein) + '</small></div></button>'; }).join("") + '</div></div>';
}

// ---------- Handlungen ----------
var ACT = {
  akte:function(gid){ U.bereich = "gaeste"; U.akte = gid; U.detail = null; U.offen = null; U.schnell = null; U.oben = true; render(); },
  akteZeigen:function(gid){ U.akte = gid; render(); if(schmal()) $("#inhalt").scrollTop = 0; },
  akteZu:function(){ U.akte = null; render(); },
  gFilter:function(a){ U.gFilter = a; render(); },
  imPlan:function(nr){ U.bereich = "plan"; U.reiter = ZIMMER_VON[nr] === "N" ? "niko" : "haus"; U.detail = nr; U.offen = nr; U.detailRein = true; render(); },
  dokBlatt:function(gid){ var g = S.G[gid]; modal(blatt("Dokument hinterlegen · " + anzeige(g), "Foto oder Datei. Wird in der Gästedatenbank abgelegt und mit Nextcloud abgeglichen.",
    '<div class="nu-feld"><span class="nu-feldname">Art</span><div class="nu-checkliste">' + ["Hausordnung auf Papier","Läuseschein","Bescheinigung","Sonstiges"].map(function(x, i){ return '<button class="nu-chip" aria-pressed="' + (i === 0 && !g.unterschrieben || i === 3 && g.unterschrieben) + '" data-act="dokArt" data-arg="' + x + '">' + x + '</button>'; }).join("") + '</div></div>' +
    '<label class="nu-btn nu-btn--rahmen" style="justify-self:start">' + svg("kamera") + 'Foto oder Datei wählen<input type="file" accept="image/*,application/pdf" id="dok-datei" hidden></label><div id="dok-vorschau" class="nu-beschr">Noch nichts ausgewählt.</div>' +
    '<div class="nu-feld"><label for="dok-notiz">Notiz (freiwillig)</label><input class="nu-eingabe" id="dok-notiz" placeholder="z. B. am 01.10. auf Papier unterschrieben"></div>',
    '<button class="nu-btn nu-btn--klein" data-act="modalZu">Abbrechen</button><button class="nu-btn nu-btn--primaer nu-btn--klein" data-act="dokSpeichern" data-arg="' + gid + '">Hinterlegen</button>'), function(){ var i = $("#dok-datei"); if(i) i.onchange = function(){ var f = i.files[0]; if(f) $("#dok-vorschau").textContent = f.name; }; }); },
  dokArt:function(a, el){ $$('[data-act="dokArt"]').forEach(function(b){ b.setAttribute("aria-pressed", String(b === el)); }); },
  dokSpeichern:function(gid){ var g = S.G[gid], art = ($('[data-act="dokArt"][aria-pressed="true"]') || {dataset:{arg:"Sonstiges"}}).dataset.arg, f = $("#dok-datei").files[0], notiz = $("#dok-notiz").value.trim();
    var datei = f ? f.name : "Foto_" + iso(H) + ".jpg";
    g.dokumente.push({art:art, datei:datei, datum:iso(H), von:aktivePerson(), foto:!f || /^image/.test(f.type)});
    if(art === "Hausordnung auf Papier"){ g.unterschrieben = true; g.papier = true; g.unterschriebenAm = iso(H); if(!g.nr) g.nr = "2026-27-" + String(S.naechsteNr++).padStart(4, "0"); }
    if(art === "Läuseschein"){ g.laus = "liegt"; g.lausVon = aktivePerson(); g.lausFrist = null; }
    if(notiz) g.notizen.push({datum:iso(H), text:notiz, von:aktivePerson(), quelle:"Gästedatenbank · " + art});
    U.modal = null; commit(); toast("dokument-plus", art + " hinterlegt", anzeige(g) + " · " + datei, 4000); },
  notbett:function(nr){ if(S.notbett[nr]) delete S.notbett[nr]; else S.notbett[nr] = true; commit(); },
  extraDazu:function(ort){ var id = ort === "niko" ? "NX" : "X", nrEl = $("#nr-" + id), nameEl = $("#name-" + id), nr = nrEl.value.trim(), name = nameEl.value.trim(), f = nummerPruefen(nr);
    if(f){ toast("warnung", "Platz nicht angelegt", f, 4000); nrEl.focus(); return; }
    S.extra.push({id:nr, name:name || "Weiterer Platz", ort:ort}); S.betten[nr] = {g:null, s:"frei"}; betteNeuBerechnen(); commit();
    toast("bett-plus", "Platz " + nr + " hinzugefügt", (name || "Weiterer Platz") + " · " + (ort === "niko" ? "rechts neben dem Saal" : "unter „Weitere Plätze“"), 4000); },
  extraUmbenennen:function(nr){ var x = S.extra.find(function(e){ return e.id === nr; });
    modal(blatt("Platz " + nr + " umbenennen", "", '<div class="p-zwei"><div class="nu-feld"><label for="um-nr">Nummer</label><input class="nu-eingabe" id="um-nr" value="' + esc(nr) + '" maxlength="6"></div><div class="nu-feld"><label for="um-name">Bezeichnung</label><input class="nu-eingabe" id="um-name" value="' + esc(x ? x.name : "") + '"></div></div>',
      '<button class="nu-btn nu-btn--klein" data-act="modalZu">Abbrechen</button><button class="nu-btn nu-btn--primaer nu-btn--klein" data-act="extraUmbenennenOk" data-arg="' + esc(nr) + '">Speichern</button>')); },
  extraUmbenennenOk:function(alt){ var neu = $("#um-nr").value.trim(), name = $("#um-name").value.trim(), f = nummerPruefen(neu, alt); if(f){ toast("warnung", "Nicht gespeichert", f, 4000); return; }
    if(neu !== alt) nummerAendern(alt, neu); var x = S.extra.find(function(e){ return e.id === neu; }); if(x && name) x.name = name; U.modal = null; betteNeuBerechnen(); commit(); },
  tauschStart:function(id){ U.tausch = {zimmer:id, a:null}; render(); },
  tauschEnde:function(){ U.tausch = null; render(); },
  tauschZurueck:function(id){ BETTEN_HAUS.concat(BETTEN_NIKO).forEach(function(b){ if(b.zimmer === id) delete S.lage[b.nr]; }); commit(); },
  nummerWahl:function(nr){ var t = U.tausch; if(!t.a || t.a === nr){ t.a = t.a === nr ? null : nr; render(); return; }
    modal(dialog(t.a + " und " + nr + " tauschen?", "Im Plan wechseln die beiden Nummern den Platz. Belegung, Sperre und Notbett bleiben bei der Nummer.", '<button class="nu-btn nu-btn--klein" data-act="modalZu">Abbrechen</button><button class="nu-btn nu-btn--primaer nu-btn--klein" data-act="nummernTauschen" data-arg="' + t.a + ',' + nr + '" data-fokus>' + svg("tauschen") + 'Tauschen</button>')); },
  nummernTauschen:function(arg){ var p = arg.split(","), a = p[0], b = p[1], pa = posOf(a), pb = posOf(b); S.lage[a] = pb; S.lage[b] = pa; if(S.lage[a] === a) delete S.lage[a]; if(S.lage[b] === b) delete S.lage[b];
    U.tausch.a = null; U.modal = null; commit(); toast("tauschen", a + " und " + b + " getauscht", "Der Plan zeigt die Nummern an den neuen Plätzen.", 4000); },
  extraWeg:function(id){ S.extra = S.extra.filter(function(x){ return x.id !== id; }); delete S.lage[id]; delete S.betten[id]; delete S.offBeds[id]; delete S.notbett[id]; betteNeuBerechnen(); commit(); },
  bereich:function(a){ U.oben = U.bereich !== a; U.bereich = a; U.detail = null; U.schnell = null; U.glocke = false; U.schreiben = false; render(); },
  themaWechseln:function(){ S.theme = document.documentElement.getAttribute("data-theme") === "nacht" ? "tag" : "nacht"; speichern(); render(); },
  thema:function(a){ S.theme = a; speichern(); render(); },
  tag:function(a){ var n = +a; U.tag = n === 0 ? 0 : Math.min(0, U.tag + n); U.detail = null; U.schnell = null; render(); var i = $("#inhalt"); if(i){ i.animate([{opacity:0, transform:"translateX(" + (n > 0 ? 16 : n < 0 ? -16 : 0) + "px)"},{opacity:1, transform:"none"}], {duration:250, easing:"cubic-bezier(0.2,0,0,1)"}); } },
  aktiv:function(a){ S.aktiv = +a; speichern(); render(); },
  reiter:function(a){ U.reiter = a; U.detail = null; U.schnell = null; render(); },
  glocke:function(){ U.glocke = !U.glocke; render(); },
  erinnerung:function(a){ U.glocke = false; if(a === "dusche"){ U.bereich = "dienst"; U.dienstReiter = "dusche"; } else if(a === "dienst"){ U.bereich = "dienst"; U.dienstReiter = "bericht"; } else { U.bereich = "plan"; U.reiter = "haus"; U.detail = a; U.offen = a; U.detailRein = true; } render(); },
  abgleichBlatt:function(){ var sy = S.sync; modal(blatt("Abgleich mit Nextcloud", "Im Prototyp gibt es keine Verbindung. Die Anzeige zeigt, wie der Abgleich in der App erscheint.",
    '<div class="nu-zeile">' + svg(sy.offline ? "wolke-aus" : "wolke-ok") + '<div>' + (sy.offline ? "Offline" : "Zuletzt synchronisiert " + esc(sy.zuletzt)) + '<small>' + (sy.ausstehend ? sy.ausstehend + " Änderungen warten auf den Abgleich" : "Keine ausstehenden Änderungen") + '</small></div></div><div class="nu-einstellung" style="background:var(--flaeche-2)">' + svg("wolke-aus") + '<div><b>Offline ausprobieren</b><small>Änderungen sammeln sich, bis wieder Netz da ist</small></div><button class="nu-schalter" role="switch" aria-checked="' + sy.offline + '" data-act="offline" aria-label="Offline ausprobieren"></button></div>',
    '<button class="nu-btn nu-btn--primaer nu-btn--klein" data-act="jetztSync"' + (sy.offline ? ' disabled' : '') + '>' + svg("abgleich") + 'Jetzt synchronisieren</button>')); },
  offline:function(){ S.sync.offline = !S.sync.offline; if(!S.sync.offline){ S.sync.ausstehend = 0; S.sync.zuletzt = uhr(); } speichern(); if(U.modal) ACT.abgleichBlatt(); else render(); },
  jetztSync:function(){ U.modal = null; render(); var p = $(".nu-sync"); p.dataset.s = "laeuft"; p.innerHTML = svg("abgleich") + "Abgleich läuft …"; setTimeout(function(){ S.sync.zuletzt = uhr(); S.sync.ausstehend = 0; speichern(); render(); }, 1600); },
  khtBlatt:function(){
    var k = khtZahlen(), nicht = BETTEN_HAUS.concat(BETTEN_NIKO).filter(function(b){ return !istAus(b.nr) && S.notbett[b.nr] && !belegtKht(b.nr); }).map(function(b){ return b.nr; });
    modal(blatt("KHT-Nummer", "Belegte Betten in St. Pius und St. Nikolaus.",
      '<div class="nu-kennzahlen" style="background:var(--flaeche-2)"><span class="nu-kennzahl">Belegt<b>' + k.belegt + '</b></span><span class="nu-kennzahl">Frei<b>' + k.frei + '</b></span></div>' +
      '<p class="nu-beschr" style="font-size:15px;line-height:22px">Notbetten zählen nur, wenn sie belegt sind (Kältebus)' + (nicht.length ? ': ' + esc(nicht.join(", ")) + ' frei, zählt nicht' : '') + '. Wer zwei Nächte in Folge unentschuldigt fehlt, zählt nicht mehr.</p>',
      '<button class="nu-btn nu-btn--primaer nu-btn--klein" data-act="modalZu">Fertig</button>')); },
  bett:function(nr, el){
    if(el && el.dataset.gezogen){ delete el.dataset.gezogen; return; }
    if(U.auswahl){ if(nr !== U.auswahl && ["frei","erwartet","anwesend"].indexOf(status(nr)) >= 0){ var von = U.auswahl; U.auswahl = null; wechselFragen(von, nr); } return; }
    var s = status(nr); if(s === "aus") return;
    U.glocke = false; U.offen = nr;
    if(U.tag !== 0){ if(gastVon(nr)){ U.detail = nr; U.detailRein = true; } render(); return; }
    if(s === "erwartet" || s === "frei" || s === "freibis" || s === "fehlt" || s === "fehlt2"){ U.schnellRein = true; U.schnell = {nr:nr}; U.detail = U.detail && gastVon(nr) ? nr : null; render(); return; }
    U.schnell = null; if(U.detail !== nr) U.detailRein = !U.detail; U.detail = nr; render();
  },
  schnellZu:function(){ U.schnell = null; U.offen = U.detail; render(); },
  details:function(nr){ U.schnell = null; U.detailRein = !U.detail; U.detail = nr; U.offen = nr; render(); },
  detailZu:function(){ U.detail = null; U.offen = null; render(); },
  istDa:function(nr){
    var g = gastVon(nr);
    if(g.laus === "fehlt" && lausTage(g) >= 3 && !(g.lausFrist && g.lausFrist >= iso(H))){ U.schnell = null; U.detail = nr; U.offen = nr; render(); toast("warnung", "Erst den Verbleib klären", "Läuseschein fehlt seit " + lausTage(g) + " Tagen.", 5000); return; }
    var bb = S.betten[nr]; bb.s = "anwesend"; delete bb.n; delete bb.vorher; g.naechte++; U.neu = nr;
    if(U.schnell && U.schnell.nr === nr) U.schnell = {nr:nr, phase:"da"};
    commit();
    var k = $('.nu-bett[data-nr="' + nr + '"]'); if(k && U.letzterTipp){ var r = k.getBoundingClientRect(); k.style.setProperty("--x", (U.letzterTipp.x - r.left) + "px"); k.style.setProperty("--y", (U.letzterTipp.y - r.top) + "px"); }
  },
  nichtDa:function(nr){ var g = gastVon(nr), b = S.betten[nr], zweite = !!b.vorher; U.schnell = null;
    modal(dialog(g.vorname + " ist nicht gekommen?", zweite ? esc(g.vorname) + " fehlte schon gestern unentschuldigt. Ab heute zählt Bett " + nr + " als frei und darf vergeben werden." : "Bett " + nr + " bleibt " + esc(g.vorname) + " zugeordnet und zählt für das Kältehilfetelefon weiter als belegt. Erst ab der 2. Nacht in Folge zählt es als frei.",
      '<button class="nu-btn nu-btn--klein" data-act="modalZu">Weiter warten</button><button class="nu-btn nu-btn--klein" data-act="abwesenheitBlatt" data-arg="' + nr + '">Hat sich abgemeldet</button><button class="nu-btn nu-btn--primaer nu-btn--klein" data-act="fehltEintragen" data-arg="' + nr + '" data-fokus>' + svg("abwesend") + 'Fehlt unentschuldigt</button>')); },
  fehltEintragen:function(nr){ var b = S.betten[nr], g = gastVon(nr); b.n = (b.vorher || 0) + 1; delete b.vorher; b.s = b.n >= 2 ? "fehlt2" : "fehlt"; U.modal = null; U.gesetzt = [nr]; commit();
    toast("abwesend", g.vorname + " fehlt (" + b.n + ". Nacht)", b.n >= 2 ? "Bett " + nr + " zählt ab jetzt als frei." : "Bett " + nr + " zählt weiter als belegt.", 5000); },
  heuteFrei:function(nr){ S.betten[nr].s = "freibis"; S.betten[nr].bis = iso(plus(H,1)); U.modal = null; U.gesetzt = [nr]; commit(); },
  dauerhaft:function(nr){ S.betten[nr].dauerhaft = S.betten[nr].dauerhaft === false; speichern(); render(); },
  zurueck:function(nr){ S.betten[nr].s = "anwesend"; delete S.betten[nr].bis; gastVon(nr).naechte++; U.neu = nr; commit(); },
  abwesenheitBlatt:function(nr){ var g = gastVon(nr); U.schnell = null; modal(blatt("Abwesenheit von " + g.vorname, "Erscheint automatisch im Dienstbericht.", '<div class="p-zwei"><div class="nu-feld"><label for="ab-bis">Zurück am</label>' + datumsFeld("ab-bis", iso(plus(H,3))) + '</div><div class="nu-feld"><label for="ab-grund">Grund (freiwillig)</label><input class="nu-eingabe" id="ab-grund" placeholder="z. B. Krankenhaus"></div></div><div class="nu-feld"><span class="nu-feldname">Bett bis dahin freihalten?</span><div class="p-zwei"><button class="nu-wahl" role="radio" aria-checked="true" data-act="abWahl" data-arg="gehalten"><b>Ja, freihalten</b><span>Zählt nicht als frei. Nur für einige Tage und wenn angekündigt.</span></button><button class="nu-wahl" role="radio" aria-checked="false" data-act="abWahl" data-arg="freibis"><b>Nein, frei bis zur Rückkehr</b><span>Bett darf bis dahin vergeben werden.</span></button></div></div>',
    '<button class="nu-btn nu-btn--klein" data-act="modalZu">Abbrechen</button><button class="nu-btn nu-btn--primaer nu-btn--klein" data-act="abSpeichern" data-arg="' + nr + '">Eintragen</button>')); },
  abWahl:function(a, el){ $$('[data-act="abWahl"]').forEach(function(b){ b.setAttribute("aria-checked", String(b === el)); }); },
  abSpeichern:function(nr){ var art = $('[data-act="abWahl"][aria-checked="true"]').dataset.arg; S.betten[nr].s = art; S.betten[nr].bis = $("#ab-bis").value; S.betten[nr].grund = $("#ab-grund").value; U.modal = null; U.gesetzt = [nr]; commit(); },
  bettFreiBlatt:function(nr){ var g = gastVon(nr); modal(dialog("Bett " + nr + " freigeben?", esc(g.vorname) + " zieht aus. Das Bett ist ab heute frei, " + esc(g.vorname) + " bleibt in der Gästedatenbank.", '<button class="nu-btn nu-btn--klein" data-act="modalZu">Abbrechen</button><button class="nu-btn nu-btn--primaer nu-btn--klein" data-act="bettFrei" data-arg="' + nr + '" data-fokus>' + svg("auszug") + 'Bett frei</button>')); },
  bettFrei:function(nr){ var g = gastVon(nr); if(g) g.notizen.push({datum:iso(H), text:"Ausgezogen, Bett " + nr + " freigegeben.", von:aktivePerson(), quelle:"Bettenplan"}); S.betten[nr] = {g:null, s:"frei"}; U.modal = null; U.detail = null; U.offen = null; U.gesetzt = [nr]; commit(); },
  bettWechseln:function(nr){ U.auswahl = nr; U.detail = null; U.schnell = null; render(); },
  auswahlAbbrechen:function(){ U.auswahl = null; render(); },
  wechseln:function(a){ var p = a.split(","), von = p[0], nach = p[1], A = S.betten[von], B = S.betten[nach] || {g:null, s:"frei"};
    var freiZiel = status(nach) === "frei";
    S.betten[nach] = Object.assign({}, A); S.betten[von] = freiZiel ? {g:null, s:"frei"} : Object.assign({}, B);
    U.modal = null; U.gesetzt = [von, nach]; U.detail = gastVon(nach) ? nach : null; U.offen = U.detail; commit(); },
  duschBlatt:function(nr){ var g = gastVon(nr), d = S.dusche[iso(H)] || {}; U.schnell = null;
    modal(blatt("Duschslot für " + g.vorname, "Heute, 30 Minuten. Zu Slotbeginn erscheint eine Erinnerung.", '<div class="nu-dusche">' + SLOTS.map(function(z){ var x = d[z], eigen = x && x.g === g.id; return '<button class="nu-slot" data-s="' + (eigen ? "geplant" : x ? "verpasst" : "frei") + '" data-act="duschWahl" data-arg="' + nr + ',' + z + '"' + (x && !eigen ? ' disabled' : '') + '><span class="zeit">' + z + '</span><b>' + (eigen ? esc(g.vorname) : x ? esc(S.G[x.g].vorname) : "frei") + '</b></button>'; }).join("") + '</div>', '<button class="nu-btn nu-btn--klein" data-act="modalZu">Fertig</button>')); },
  duschWahl:function(a){ var p = a.split(","), g = gastVon(p[0]), d = S.dusche[iso(H)] = S.dusche[iso(H)] || {};
    Object.keys(d).forEach(function(k){ if(d[k].g === g.id && d[k].s === "geplant") delete d[k]; }); d[p[1]] = {g:g.id, s:"geplant"}; U.modal = null; commit(); toast("dusche", "Dusche " + p[1], g.vorname + ", Bett " + p[0], 4000); },
  duschTag:function(a){ U.duschTag = +a; render(); },
  slot:function(z){ var key = iso(duschDatum()), d = S.dusche[key] = S.dusche[key] || {}, x = d[z];
    if(!x){ var kandidaten = BETTEN_HAUS.filter(function(b){ var s = status(b.nr); return gastVon(b.nr) && ((U.duschTag || 0) === 0 ? s === "anwesend" : s === "anwesend" || s === "erwartet"); });
      modal(blatt("Dusche " + z + " · " + kurz(duschDatum()), (U.duschTag || 0) === 0 ? "Aus den anwesenden Gästen" : "Aus den Gästen mit Bett", '<div class="p-liste">' + kandidaten.map(function(b){ var g = gastVon(b.nr); return '<button class="nu-treffer" data-act="slotSetzen" data-arg="' + z + ',' + g.id + '">' + svg("person") + '<div><b>' + esc(anzeige(g)) + '</b><small>' + b.nr + '</small></div></button>'; }).join("") + '</div>', '<button class="nu-btn nu-btn--klein" data-act="modalZu">Abbrechen</button>')); return; }
    var g = S.G[x.g]; modal(blatt("Dusche " + z + " · " + g.vorname, "", '<div class="p-drei"><button class="nu-wahl" data-act="slotStatus" data-arg="' + z + ',erledigt"><b>Erledigt</b></button><button class="nu-wahl" data-act="slotStatus" data-arg="' + z + ',verpasst"><b>Verpasst</b></button><button class="nu-wahl" data-act="slotStatus" data-arg="' + z + ',frei"><b>Freigeben</b></button></div>', '<button class="nu-btn nu-btn--klein" data-act="modalZu">Abbrechen</button>')); },
  slotSetzen:function(a){ var p = a.split(","); S.dusche[iso(duschDatum())][p[0]] = {g:p[1], s:"geplant"}; U.modal = null; commit(); },
  slotStatus:function(a){ var p = a.split(","), d = S.dusche[iso(duschDatum())]; if(p[1] === "frei") delete d[p[0]]; else d[p[0]].s = p[1]; U.modal = null; commit(); },
  duschTest:function(){ var d = S.dusche[iso(H)] || {}, k = Object.keys(d).find(function(z){ return d[z].s === "geplant"; }); var g = k && S.G[d[k].g]; var bett = g && Object.keys(S.betten).find(function(n){ return S.betten[n].g === g.id; }); toast("dusche", "Dusche " + (k || "20:30"), g ? g.vorname + ", Bett " + bett : "Beispiel"); },
  sanktionBlatt:function(nr){ var g = gastVon(nr); modal(blatt("Sanktion für " + g.vorname, "Die Stufen steigen von oben nach unten. Grund ist Pflicht.", '<div class="p-liste">' + [["Verwarnung","verwarnung","Schon mehrmals hingewiesen, soll es nicht wiederholen"],["Gelbe Karte","karte-gelb","Noch einmal, dann Hausverbot"],["Hausverbot","karte-rot","Aufnahme gesperrt, 3 Jahre aufbewahrt"]].map(function(x, i){ return '<button class="nu-wahl" role="radio" aria-checked="' + (i === 0) + '" data-act="stufeWahl" data-arg="' + x[0] + '" style="grid-template-columns:auto 1fr;align-items:center;column-gap:14px;min-height:72px">' + svg(x[1]) + '<span style="display:grid"><b>' + x[0] + '</b><span>' + x[2] + '</span></span></button>'; }).join("") + '</div><div class="nu-feld"><label for="sk-grund">Grund</label><input class="nu-eingabe" id="sk-grund" placeholder="Was ist passiert?"></div><div class="nu-feld" id="sk-bis-feld" hidden><label for="sk-bis">Gültig bis (leer = unbefristet)</label><input class="nu-eingabe" type="date" id="sk-bis"></div>',
    '<button class="nu-btn nu-btn--klein" data-act="modalZu">Abbrechen</button><button class="nu-btn nu-btn--gefahr-voll nu-btn--klein" data-act="sanktionSpeichern" data-arg="' + nr + '">Eintragen</button>')); },
  stufeWahl:function(a, el){ $$('[data-act="stufeWahl"]').forEach(function(b){ b.setAttribute("aria-checked", String(b === el)); }); $("#sk-bis-feld").hidden = a !== "Hausverbot"; },
  sanktionSpeichern:function(nr){ var grund = $("#sk-grund").value.trim(); if(!grund){ $("#sk-grund").focus(); $("#sk-grund").style.borderColor = "var(--warnung)"; return; } var st = $('[data-act="stufeWahl"][aria-checked="true"]').dataset.arg; gastVon(nr).sanktionen.push({stufe:st, datum:iso(H), grund:grund, von:aktivePerson(), bis:st === "Hausverbot" ? ($("#sk-bis").value || null) : undefined}); U.modal = null; commit(); },
  notizBlatt:function(nr){ var g = gastVon(nr); modal(blatt((U.tag ? "Nachtrag zu " : "Notiz zu ") + g.vorname, "Wird mit Datum und deinem Namen gespeichert.", '<div class="nu-feld"><label for="no-text">Notiz</label><textarea class="nu-eingabe" id="no-text"></textarea></div>', '<button class="nu-btn nu-btn--klein" data-act="modalZu">Abbrechen</button><button class="nu-btn nu-btn--primaer nu-btn--klein" data-act="notizSpeichern" data-arg="' + nr + '">Speichern</button>')); },
  notizSpeichern:function(nr){ var t = $("#no-text").value.trim(); if(!t) return; gastVon(nr).notizen.push({datum:iso(tagDatum()), text:t, von:aktivePerson(), quelle:U.tag ? "Nachtrag " + uhr() : ""}); U.modal = null; commit(); },
  lausScan:function(nr){ var g = gastAus(nr); modal(blatt("Läuseschein scannen", "In der App öffnet sich die Kamera mit Dokumenterkennung. Im Prototyp kannst du ein Bild auswählen oder direkt bestätigen.", '<label class="nu-btn nu-btn--rahmen" style="justify-self:start">' + svg("kamera") + 'Bild auswählen<input type="file" accept="image/*" id="laus-bild" hidden></label><div id="laus-vorschau"></div>', '<button class="nu-btn nu-btn--klein" data-act="modalZu">Abbrechen</button><button class="nu-btn nu-btn--primaer nu-btn--klein" data-act="lausGeprueft" data-arg="' + nr + '">' + svg("check") + 'Geprüft</button>'), function(){ var i = $("#laus-bild"); if(i) i.onchange = function(){ var f = i.files[0]; if(!f) return; var u = URL.createObjectURL(f); $("#laus-vorschau").innerHTML = '<img src="' + u + '" alt="Läuseschein" style="max-height:200px;border-radius:12px">'; }; }); },
  lausGeprueft:function(nr){ var g = gastAus(nr); g.laus = "liegt"; g.lausVon = aktivePerson(); g.lausFrist = null; U.modal = null; commit(); toast("laeuseschein", "Läuseschein liegt vor", g.vorname + " · gilt die ganze Saison", 4000); },
  lausJa:function(nr){ var g = gastVon(nr); g.lausFrist = iso(plus(H,3)); g.lausVon = aktivePerson(); commit(); },
  lausNein:function(nr){ var g = gastVon(nr); modal(dialog(g.vorname + " darf heute nicht bleiben", "Bett " + nr + " wird für heute frei. Die Entscheidung wird mit deinem Namen gespeichert.", '<button class="nu-btn nu-btn--klein" data-act="modalZu">Abbrechen</button><button class="nu-btn nu-btn--gefahr-voll nu-btn--klein" data-act="heuteFrei" data-arg="' + nr + '">Bett freigeben</button>')); },
  aufnahme:function(nr){ aufnahmeStart(nr); },
  aufnahmeAbbrechen:function(){ modal(dialog("Aufnahme verwerfen?", "Die Eingaben dieser Aufnahme gehen verloren.", '<button class="nu-btn nu-btn--klein" data-act="modalZu">Weiter aufnehmen</button><button class="nu-btn nu-btn--gefahr-voll nu-btn--klein" data-act="aufnahmeVerwerfen">Verwerfen</button>')); },
  aufnahmeVerwerfen:function(){ U.modal = null; U.wizard = null; render(); },
  gastWaehlen:function(id){ var w = wz(); w.g = id; w.verbotOk = false; w.grund = ""; var g = S.G[id]; w.sprache = g.sprache; render(); },
  gastNeu:function(){ var w = wz(); w.g = null; render(); },
  verbotOk:function(){ var w = wz(); w.verbotOk = !w.verbotOk; render(); },
  dauer:function(a){ wz().dauer = a; render(); },
  mitEnde:function(){ var w = wz(); w.mitEnde = !w.mitEnde; render(); },
  bisPlus:function(a){ wz().bis = iso(plus(H, +a)); render(); },
  nachholen:function(gid){ nachholenStart(gid); },
  sprache:function(a){ wz().sprache = a; render(); },
  anderesBett:function(){ var w = wz(); var frei = BETTEN_HAUS.filter(function(b){ return !istAus(b.nr) && (status(b.nr) === "frei" || status(b.nr) === "fehlt2"); }); modal(blatt("Bett wählen", "Freie Betten in St. Pius", '<div class="nu-checkliste">' + frei.map(function(b){ return '<button class="nu-chip" aria-pressed="' + (w.nr === b.nr) + '" data-act="bettWahl" data-arg="' + b.nr + '">' + b.nr + (ortText(b.nr) ? " · " + esc(ortText(b.nr)) : "") + (status(b.nr) === "fehlt2" ? " · " + esc(gastVon(b.nr).vorname) + " fehlt" : "") + '</button>'; }).join("") + '</div>', '<button class="nu-btn nu-btn--klein" data-act="modalZu">Fertig</button>')); },
  bettWahl:function(a){ wz().nr = a; U.modal = null; render(); },
  wWeiter:function(){ var w = wz(), l = schrittListe(), p = l.indexOf(w.schritt); if(!schrittFertig(w.schritt)) return; if(w.schritt === 5){ aufnahmeAbschliessen(); return; } w.schritt = l[p + 1]; w.richtung = "vor"; render(); var s = $("#w-seite"); if(s) s.scrollTop = 0; },
  wZurueck:function(){ var w = wz(), l = schrittListe(), p = l.indexOf(w.schritt); if(p > 0){ w.schritt = l[p - 1]; w.richtung = "zurueck"; render(); } },
  dienstBeginnen:function(){ dienstBeginnen(); },
  monatWahl:function(k){ U.monat = k; render(); },
  nachweis:function(a){ var p = a.split(","); U.nachweis = {k:p[0], name:p[1]}; modal(nachweisBlatt(p[0], p[1])); },
  nachweisSpaeter:function(n){ U.spaeter = U.spaeter || {}; U.spaeter[n] = true; render(); },
  planKorrektur:function(a){ var p = a.split(","), k = p[0], name = p[1]; if(nachweisVon(k, name)) return;
    modal(blatt("Geplante Dienste korrigieren · " + name, "", '<div class="nu-banner">' + svg("warnung") + '<div>Der Originalplan ist Grundlage der Lohnabrechnung.<small>Nur korrigieren, wenn er falsch übernommen wurde. Die Änderung wird mit Name und Uhrzeit gespeichert.</small></div></div>' +
      '<div class="nu-feld"><span class="nu-feldname">Geplante Tage im ' + esc(monatName(k)) + '</span><div class="nu-checkliste">' + tageVon(k).map(function(di){ var an = rollenGeplant(di, name).length > 0; return '<button class="nu-chip" style="min-width:64px;justify-content:center" aria-pressed="' + an + '" data-act="planTag" data-arg="' + di + '">' + kurz(pd(di)) + '</button>'; }).join("") + '</div></div>' +
      '<div class="nu-feld"><label for="pk-grund">Grund (Pflicht)</label><input class="nu-eingabe" id="pk-grund" placeholder="z. B. Dienstplan falsch abgeschrieben"></div>',
      '<button class="nu-btn nu-btn--klein" data-act="nachweis" data-arg="' + k + ',' + esc(name) + '">Abbrechen</button><button class="nu-btn nu-btn--gefahr-voll nu-btn--klein" data-act="planSpeichern" data-arg="' + k + ',' + esc(name) + '">Korrektur speichern</button>').replace('class="p-blatt"', 'class="p-blatt p-blatt--breit"')); },
  planTag:function(a, el){ el.setAttribute("aria-pressed", String(el.getAttribute("aria-pressed") !== "true")); },
  planSpeichern:function(a){ var p = a.split(","), k = p[0], name = p[1], grund = $("#pk-grund").value.trim(); if(!grund){ $("#pk-grund").focus(); $("#pk-grund").style.borderColor = "var(--warnung)"; return; }
    var aenderungen = [];
    $$('[data-act="planTag"]').forEach(function(b){ var di = b.dataset.arg, soll = b.getAttribute("aria-pressed") === "true", ist = rollenGeplant(di, name).length > 0; if(soll === ist) return;
      var pl = S.plan0[di] = S.plan0[di] || {nacht:(S.dienstplan[di] || []).slice(), kueche:S.kueche[di] || ""};
      if(soll){ var frei = pl.nacht.indexOf(""); if(frei >= 0) pl.nacht[frei] = name; else pl.nacht.push(name); } else { pl.nacht = pl.nacht.map(function(n){ return n === name ? "" : n; }); if(pl.kueche === name) pl.kueche = ""; }
      aenderungen.push((soll ? "+" : "−") + kurz(pd(di))); });
    if(aenderungen.length) S.planLog.push({monat:k, name:name, aenderungen:aenderungen, grund:grund, von:aktivePerson(), um:kurz(H) + " " + uhr()});
    commit(); ACT.nachweis(k + "," + name); if(aenderungen.length) toast("warnung", "Plan korrigiert", name + ": " + aenderungen.join(", "), 5000); },
  dienstReiter:function(a){ U.oben = true; U.dienstReiter = a; U.schreiben = false; render(); },
  feldJaNein:function(a){ var p = a.split(","), b = bericht(); b.f[p[0]] = b.f[p[0]] === p[1] ? null : p[1]; commit(); },
  fehlt:function(a){ var f = bericht().f.fehlt, i = f.indexOf(a); if(i >= 0) f.splice(i, 1); else f.push(a); commit(); },
  besetzungUnterschrift:function(i){ var x = bericht().besetzung[+i]; modal(blatt("Unterschrift " + x.name, x.rolle + " · Dienst " + kurz(H), '<div class="nu-unterschrift" data-pad="bes' + i + '"><div class="nu-unterschrift-kopf"><b>' + esc(x.name) + '</b><small>' + esc(x.rolle) + '</small></div><div class="nu-unterschrift-feld"><span class="nu-unterschrift-marke">' + svg("check","klein") + 'Bestätigt</span><span class="nu-unterschrift-hilfe">Mit Finger oder Stift unterschreiben</span></div><div class="nu-unterschrift-knoepfe"><button class="nu-btn nu-btn--klein" data-pad-act="leeren">' + svg("rueckgaengig") + 'Löschen</button><button class="nu-btn nu-btn--primaer nu-btn--klein" data-pad-act="ok" disabled>Bestätigen</button></div></div>', '')); },
  personTauschen:function(i){ modal(blatt("Person tauschen", "Geplante und tatsächliche Person werden beide gespeichert und zählen im Monatsabschluss.",
    '<div class="nu-feld"><span class="nu-feldname">Grund</span><div class="nu-seg" role="radiogroup">' + ["Krankheit","Tausch","Sonstiges"].map(function(g, k){ return '<button role="radio" aria-checked="' + (k === 0) + '" data-act="grundWahl" data-arg="' + g + '">' + g + '</button>'; }).join("") + '</div></div>' +
    '<div class="nu-feld"><span class="nu-feldname">Wer macht den Dienst?</span><div class="nu-checkliste">' + TEAM.map(function(n){ return '<button class="nu-chip" data-act="personSetzen" data-arg="' + i + ',' + n + '">' + esc(n) + '</button>'; }).join("") + '</div></div>', '<button class="nu-btn nu-btn--klein" data-act="modalZu">Abbrechen</button>')); },
  grundWahl:function(a, el){ $$('[data-act="grundWahl"]').forEach(function(b){ b.setAttribute("aria-checked", String(b === el)); }); },
  personSetzen:function(a){ var p = a.split(","), x = bericht().besetzung[+p[0]], gr = $('[data-act="grundWahl"][aria-checked="true"]'); x.geplant = x.geplant || x.name; x.name = p[1]; x.grund = x.name === x.geplant ? "" : (gr ? gr.dataset.arg : ""); x.sig = null; U.modal = null; commit(); },
  einfuegen:function(a){ einfuegenText(a); },
  erwaehnen:function(gid){ var g = S.G[gid], name = g.vorname + (gleicherVorname(g) ? " (" + zusatz(g) + ")" : ""); var el = $("#f-hinweise"), a = el.selectionStart, v = el.value, start = v.lastIndexOf("@", a - 1); el.value = v.slice(0, start) + "@" + name + " " + v.slice(a); var pos = start + name.length + 2; el.focus(); el.setSelectionRange(pos, pos); el.dispatchEvent(new Event("input")); $("#vorschlaege").hidden = true; },
  schreibenFertig:function(){ U.schreiben = false; if(document.activeElement) document.activeElement.blur(); render(); },
  externBlatt:function(){ var namen = Object.keys(S.G).map(function(k){ return S.G[k]; }).filter(function(g){ return !Object.keys(S.betten).some(function(n){ return S.betten[n].g === g.id && g.standort === "haus"; }); }); modal(blatt("Externe Gäste", "Personen, die nur zum Essen kommen, auch aus St. Nikolaus.", '<div class="nu-checkliste">' + namen.map(function(g){ return '<button class="nu-chip" data-act="externDazu" data-arg="' + esc(g.vorname) + '">' + esc(g.vorname) + (g.standort === "nikolaus" ? " · St. Nikolaus" : "") + '</button>'; }).join("") + '</div>', '<button class="nu-btn nu-btn--klein" data-act="modalZu">Fertig</button>')); },
  externDazu:function(n){ var e = bericht().f.extern; if(e.indexOf(n) < 0) e.push(n); U.modal = null; commit(); },
  hinweisBlatt:function(){ var dienst = (S.dienstplan[iso(H)] || []).filter(Boolean), wer = aktivePerson();
    var namen = dienst.concat([LEITUNG]).concat(TEAM.filter(function(n){ return dienst.indexOf(n) < 0; }));
    modal(blatt("Hinweis für die nächsten Tage", "Erscheint bei den nächsten Diensten oben im Bericht.",
      '<div class="nu-feld"><span class="nu-feldname">Von</span><div class="nu-checkliste">' + namen.map(function(n){ return '<button class="nu-chip" aria-pressed="' + (n === wer) + '" data-act="vonWahl" data-arg="' + esc(n) + '">' + (n === wer ? svg("check","klein") : '') + esc(n) + (n === LEITUNG ? ' (Schwester)' : '') + '</button>'; }).join("") + '</div></div>' +
      '<div class="nu-feld"><label for="hw-text">Hinweis</label><textarea class="nu-eingabe" id="hw-text"></textarea></div><div class="p-zwei"><div class="nu-feld"><label for="hw-bis">Gültig bis</label>' + datumsFeld("hw-bis", iso(plus(H,3))) + '</div><div class="nu-feld"><span class="nu-feldname">Priorität</span><div style="display:flex;align-items:center;gap:12px"><button class="nu-schalter" role="switch" aria-checked="false" id="hw-wichtig" data-act="schalter" aria-label="Wichtig"></button>wichtig</div></div></div>',
      '<button class="nu-btn nu-btn--klein" data-act="modalZu">Abbrechen</button><button class="nu-btn nu-btn--primaer nu-btn--klein" data-act="hinweisSpeichern">Speichern</button>')); },
  vonWahl:function(a, el){ $$('[data-act="vonWahl"]').forEach(function(b){ var an = b === el; b.setAttribute("aria-pressed", String(an)); b.innerHTML = (an ? svg("check","klein") : '') + esc(b.dataset.arg) + (b.dataset.arg === LEITUNG ? ' (Schwester)' : ''); }); },
  schalter:function(a, el){ el.setAttribute("aria-checked", String(el.getAttribute("aria-checked") !== "true")); },
  hinweisSpeichern:function(){ var t = $("#hw-text").value.trim(); if(!t) return; var von = $('[data-act="vonWahl"][aria-pressed="true"]'); S.hinweise.unshift({id:"h" + Date.now(), von:von ? von.dataset.arg : aktivePerson(), text:t, bis:$("#hw-bis").value, wichtig:$("#hw-wichtig").getAttribute("aria-checked") === "true", quelle:"App"}); U.modal = null; commit(); },
  abschliessen:function(){ abschliessen(); },
  nachtragBlatt:function(){ modal(blatt("Nachtrag", "Der Bericht bleibt unverändert; der Nachtrag steht mit Zeit und Namen darunter.", '<div class="nu-feld"><label for="na-text">Nachtrag</label><textarea class="nu-eingabe" id="na-text"></textarea></div>', '<button class="nu-btn nu-btn--klein" data-act="modalZu">Abbrechen</button><button class="nu-btn nu-btn--primaer nu-btn--klein" data-act="nachtragSpeichern">Speichern</button>')); },
  nachtragSpeichern:function(){ var t = $("#na-text").value.trim(); if(!t) return; bericht().nachtraege.push({text:t, um:kurz(pd()) + " · " + uhr(), von:aktivePerson()}); U.modal = null; commit(); },
  pdfZeigen:function(){ modal(blatt("PDF", "In der App öffnet sich das gespeicherte PDF.", '<span class="nu-bald">' + svg("uhr","klein") + 'im Prototyp noch nicht verfügbar</span>', '<button class="nu-btn nu-btn--klein" data-act="modalZu">Schließen</button>')); },
  teilen:function(){ toast("teilen", "Teilen", "In der App öffnet sich der Android-Teilen-Dialog mit dem PDF. Den Empfänger wählst du dort selbst.", 4000); },
  zielWaehlen:function(idx){ var b = bericht(), a = erkennen(b.f.hinweise, b.f.ziele).absaetze.filter(function(x){ return x.idx === +idx; })[0]; if(!a) return;
    modal(blatt("Wer bekommt die " + a.stufe + "?", "Nur eine Person bekommt die Sanktion. Alle anderen Genannten bekommen den Absatz als Notiz, ohne Verwarnung, Karte oder Hausverbot.",
      '<div class="p-liste">' + a.genannt.map(function(g){ var bett = bettVon(g.id); return '<button class="nu-wahl" role="radio" aria-checked="' + (a.ziel === g) + '" data-act="zielSetzen" data-arg="' + idx + ',' + g.id + '" style="grid-template-columns:auto 1fr;align-items:center;column-gap:14px;min-height:72px"><span class="nu-treffer-bett' + (bett ? '' : ' is-leer') + '">' + (bett || "–") + '</span><span style="display:grid"><b>' + esc(g.vorname + (g.nachname ? " " + g.nachname : "")) + '</b><span>' + esc(SPRACHE[g.sprache][2]) + (aktivSank(g).length ? ' · bisher: ' + esc(aktivSank(g).map(function(x){ return x.stufe; }).join(", ")) : '') + '</span></span></button>'; }).join("") +
      '<button class="nu-wahl" role="radio" aria-checked="' + (!a.ziel) + '" data-act="zielSetzen" data-arg="' + idx + ',keiner" style="min-height:64px"><b>Niemand</b><span>Nur Notizen, keine Sanktion</span></button></div>',
      '<button class="nu-btn nu-btn--klein" data-act="modalZu">Abbrechen</button>')); },
  zielSetzen:function(a){ var p = a.split(","), b = bericht(); b.f.ziele = b.f.ziele || {}; b.f.ziele[p[0]] = p[1]; U.modal = null; commit(); },
  kalTag:function(a){ U.kalTag = a; render(); },
  kalAnsicht:function(a){ U.kalAnsicht = a; render(); },
  woche:function(a){ U.kalTag = +a === 0 ? iso(H) : iso(plus(pd(U.kalTag), +a)); render(); },
  terminNeu:function(a){ U.kalTag = a; ACT.terminBlatt(); },
  monat:function(a){ var d = pd(U.kalTag); d.setDate(1); d.setMonth(d.getMonth() + +a); U.kalTag = iso(d); render(); },
  terminBlatt:function(){ modal(blatt("Termin am " + kurz(pd(U.kalTag)), "Erscheint am Tag unter „Heute“ im Dienstbericht.", '<div class="nu-feld"><label for="te-titel">Titel</label><input class="nu-eingabe" id="te-titel" placeholder="z. B. Lieferung Decken"></div><div class="nu-feld"><span class="nu-feldname">Art</span><div class="nu-checkliste">' + [["Aufgabe","bericht"],["Bettwäsche","wiederholen"],["Sondertermin","kalender"],["Feiertag","einkauf"]].map(function(x, i){ return '<button class="nu-chip" aria-pressed="' + (i === 2) + '" data-act="artWahl" data-arg="' + x[0] + ',' + x[1] + '">' + svg(x[1],"klein") + x[0] + '</button>'; }).join("") + '</div></div>', '<button class="nu-btn nu-btn--klein" data-act="modalZu">Abbrechen</button><button class="nu-btn nu-btn--primaer nu-btn--klein" data-act="terminSpeichern">Speichern</button>')); },
  artWahl:function(a, el){ $$('[data-act="artWahl"]').forEach(function(b){ b.setAttribute("aria-pressed", String(b === el)); }); },
  terminSpeichern:function(){ var t = $("#te-titel").value.trim(); if(!t) return; var p = $('[data-act="artWahl"][aria-pressed="true"]').dataset.arg.split(","); S.termine.push({datum:U.kalTag, art:p[0], titel:t, sym:p[1]}); U.modal = null; commit(); },
  importBlatt:function(){ modal(blatt("Dienstplan einlesen", "Quelle wählen: Datei aus Nextcloud oder Foto. Danach zeigt die App eine Prüftabelle.", '<div class="p-zwei"><div class="nu-wahl">' + svg("wolke-ok") + '<b>Nextcloud-Datei</b><span>PDF oder ICS</span></div><div class="nu-wahl">' + svg("kamera") + '<b>Foto</b><span>Ausdruck abfotografieren</span></div></div><span class="nu-bald">' + svg("uhr","klein") + 'im Prototyp noch nicht verfügbar</span>', '<button class="nu-btn nu-btn--klein" data-act="modalZu">Schließen</button>')); },
  pinTaste:function(a){ if(a === "⌫") U.pin = U.pin.slice(0, -1); else if(U.pin.length < 4) U.pin += a; if(U.pin.length === 4){ if(U.pin === "1234"){ U.pinOk = true; U.pin = ""; } else { U.pinFalsch = true; U.pin = ""; } } render(); },
  pinSperren:function(){ U.pinOk = false; render(); },
  einst:function(a){ U.einst = a; render(); },
  zimmerAus:function(id){ if(S.offRooms[id]) delete S.offRooms[id]; else S.offRooms[id] = true; commit(); },
  bettAus:function(nr){ if(S.offBeds[nr]) delete S.offBeds[nr]; else S.offBeds[nr] = true; commit(); },
  ampelSchwelle:function(a){ S.ampel.gruen = Math.max(1, Math.min(10, S.ampel.gruen + +a)); commit(); },
  reset:function(){ modal(dialog("Beispieldaten zurücksetzen?", "Alle Änderungen in diesem Browser gehen verloren.", '<button class="nu-btn nu-btn--klein" data-act="modalZu">Abbrechen</button><button class="nu-btn nu-btn--gefahr-voll nu-btn--klein" data-act="resetJa">Zurücksetzen</button>')); },
  resetJa:function(){ S = beispiel(); speichern(); U.modal = null; U.pinOk = false; U.bereich = "plan"; render(); },
  modalZu:function(){ modalZu(); }
};

// ---------- Start ----------
document.addEventListener("click", function(e){
  var el = e.target.closest("[data-act]");
  if(!el){
    var karte = e.target.closest(".nu-bett");
    if(karte && !karte.disabled){ U.letzterTipp = {x:e.clientX, y:e.clientY}; ACT.bett(karte.dataset.nr, karte); return; }
    if(U.schnell && !e.target.closest("#schnell")){ U.schnell = null; render(); }
    else if(U.glocke && !e.target.closest(".p-glocke")){ U.glocke = false; render(); }
    return;
  }
  if(el.disabled) return;
  var f = ACT[el.dataset.act]; if(f){ e.preventDefault(); f(el.dataset.arg, el); }
});
document.addEventListener("pointerdown", function(e){ if(e.target.closest(".nu-bett")) zugStart(e); }, {passive:true});
document.addEventListener("pointermove", zugBewegen);
document.addEventListener("touchmove", function(e){ if(zug && zug.aktiv) e.preventDefault(); }, {passive:false});
document.addEventListener("pointerup", zugEnde);
document.addEventListener("pointercancel", function(){ if(zug){ clearTimeout(zug.timer); zug.karte.classList.remove("is-gezogen"); zug.karte.style.transform = ""; zug = null; } });
document.addEventListener("keydown", function(e){
  if(e.key === "Escape"){ if(U.modal) modalZu(); else if(U.schnell){ U.schnell = null; render(); } else if(U.detail){ U.detail = null; U.offen = null; render(); } else if(U.glocke){ U.glocke = false; render(); } else if(U.auswahl){ U.auswahl = null; render(); } }
  if(e.altKey && /^[1-5]$/.test(e.key)){ ACT.bereich(["plan","gaeste","dienst","kalender","einstellungen"][+e.key - 1]); }
});
var warSchmal = schmal();
window.addEventListener("resize", function(){ if(schmal() !== warSchmal){ warSchmal = schmal(); render(); } else if(U.schnell) positioniereSchnell(); });
setInterval(function(){ var alt = document.documentElement.getAttribute("data-theme"); themeSetzen(); if(alt !== document.documentElement.getAttribute("data-theme")) render(); }, 60000);
render();
})();
