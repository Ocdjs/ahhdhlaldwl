(function(){
  "use strict";
  var I = window.NU_ICONS, CARD = window.NU_CARD;
  var esc = function(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); };
  function svg(name, cls){
    if(name === "karte-gelb" || name === "karte-rot"){
      var f = name === "karte-gelb" ? "var(--karte-gelb)" : "var(--karte-rot)";
      var s = name === "karte-gelb" ? "var(--karte-gelb-rand)" : "var(--karte-rot)";
      return '<svg class="nu-svg ' + (cls || "") + '" viewBox="0 0 24 24" aria-hidden="true"><path d="' + CARD + '" fill="' + f + '" stroke="' + s + '" stroke-width="1.5" stroke-linejoin="round"/></svg>';
    }
    var d = I[name] || I.info;
    return '<svg class="nu-svg ' + (cls || "") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + d + '"/></svg>';
  }
  function mountIcons(root){
    (root || document).querySelectorAll("i[data-icon]").forEach(function(el){
      var t = document.createElement("span");
      t.innerHTML = svg(el.getAttribute("data-icon"), el.className);
      el.replaceWith(t.firstChild);
    });
  }
  // Bettkarte: {nr, s: frei|erwartet|anwesend|fehlt|fehlt2|gehalten|freibis|aus, name, naechte, bis, fehltN, symbole:[...], dusche:"20:30", kompakt:true}
  // fehlt = unentschuldigt, 1. Nacht (zählt als belegt); fehlt2 = ab der 2. Nacht in Folge (zählt als frei)
  var STATUS = {frei:["","plus"], erwartet:["erwartet","erwartet"], anwesend:["","anwesend"], fehlt:["fehlt","abwesend"], fehlt2:["fehlt","abwesend"], gehalten:["bis ","schloss"], freibis:["bis ","rueckkehr"], aus:["","deaktiviert"]};
  var FREI = {frei:1, freibis:1, fehlt2:1};
  function bett(b){
    var st = STATUS[b.s] || STATUS.frei, kopfText = st[0], k = !!b.kompakt;
    if(b.s === "gehalten" || b.s === "freibis") kopfText = st[0] + (b.bis || "");
    if(b.s === "fehlt2") kopfText = "fehlt " + (b.fehltN || 2) + " N.";
    var name = FREI[b.s] ? "frei" : b.s === "aus" ? "aus" : (b.name || "");
    var fuss = "";
    if(b.s === "frei") fuss = k ? "" : '<span>Gast aufnehmen</span>';
    else if(b.s === "freibis") fuss = '<span>' + (k ? '<span class="wort">bis </span>' + esc(b.bis || "") : esc(b.name || "") + ' kommt zurück') + '</span>';
    else if(b.s === "fehlt2") fuss = '<span>' + (k ? esc(kopfText) : esc(b.name || "") + ' fehlt') + '</span>';
    else if(b.s === "fehlt") fuss = '<span>' + (k ? "fehlt" : "unentschuldigt") + '</span>';
    else if(b.s === "gehalten") fuss = '<span>' + (k ? '<span class="wort">bis </span>' + esc(b.bis || "") : "freigehalten") + '</span>';
    else if(b.s !== "aus" && !k) fuss = '<span class="naechte">' + (b.naechte != null ? b.naechte + (b.naechte === 1 ? " Nacht" : " N.") : "") + '</span>';
    var sym = (b.symbole || []).map(function(n){ return svg(n, "klein"); }).join("");
    if(b.dusche) sym += svg("dusche", "klein");
    var wort = {frei:"frei", erwartet:"erwartet", anwesend:"anwesend", fehlt:"fehlt unentschuldigt, zählt als belegt", fehlt2:"fehlt " + (b.fehltN || 2) + " Nächte in Folge, zählt als frei", gehalten:"freigehalten bis " + (b.bis || ""), freibis:"frei bis " + (b.bis || ""), aus:"gesperrt"}[b.s];
    var label = "Bett " + b.nr + (b.lage ? " " + b.lage : "") + ", " + wort + (b.name && b.s !== "frei" ? ", " + b.name : "");
    return '<button type="button" class="nu-bett' + (k ? " nu-bett--kompakt" : "") + (b.warn ? " is-warn" : "") + '" data-s="' + b.s + '" data-nr="' + esc(b.nr) + '" aria-label="' + esc(label) + '"' + (b.s === "aus" ? " disabled" : "") + '>' +
      '<span class="nu-bett-kopf"><span class="nu-bett-nr">' + esc(b.nr) + '</span><span class="nu-bett-status">' + (k ? "" : esc(kopfText)) + svg(st[1], "klein") + '</span></span>' +
      '<span class="nu-bett-name">' + esc(name) + '</span>' +
      '<span class="nu-bett-fuss">' + fuss + '<span class="nu-bett-symbole">' + sym + '</span></span></button>';
  }
  // Unterschriftsfeld: Finger und Stift; sobald ein Stift erkannt ist, zählen Fingerberührungen nicht (Handballen).
  function unterschrift(root, opts){
    opts = opts || {};
    var feld = root.querySelector(".nu-unterschrift-feld"), cv = document.createElement("canvas");
    feld.appendChild(cv);
    var ctx = cv.getContext("2d"), stiftGesehen = false, aktiv = null, letzte = null, striche = 0, fest = false;
    var farbe = getComputedStyle(root).getPropertyValue("--stift-tinte").trim() || "#1B3A8C";
    function groesse(){ var r = feld.getBoundingClientRect(), d = window.devicePixelRatio || 1; cv.width = r.width * d; cv.height = r.height * d; ctx.setTransform(d,0,0,d,0,0); ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.strokeStyle = farbe; }
    groesse();
    function pos(e){ var r = cv.getBoundingClientRect(); return {x:e.clientX - r.left, y:e.clientY - r.top, p:e.pressure || 0.5}; }
    cv.addEventListener("pointerdown", function(e){
      if(fest) return;
      if(e.pointerType === "pen") stiftGesehen = true;
      if(stiftGesehen && e.pointerType === "touch") return;
      aktiv = e.pointerId; letzte = pos(e); cv.setPointerCapture(e.pointerId); e.preventDefault();
    });
    cv.addEventListener("pointermove", function(e){
      if(e.pointerId !== aktiv) return;
      var evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
      evs.forEach(function(ev){
        var p = pos(ev);
        ctx.lineWidth = ev.pointerType === "pen" ? 1.4 + p.p * 2.6 : 2.6;
        ctx.beginPath(); ctx.moveTo(letzte.x, letzte.y); ctx.lineTo(p.x, p.y); ctx.stroke(); letzte = p;
      });
      if(!root.classList.contains("is-gezeichnet")){ root.classList.add("is-gezeichnet"); if(opts.onChange) opts.onChange(true); }
    });
    function ende(e){ if(e.pointerId === aktiv){ aktiv = null; striche++; } }
    cv.addEventListener("pointerup", ende); cv.addEventListener("pointercancel", ende);
    return {
      leeren: function(){ if(fest) return; ctx.clearRect(0,0,cv.width,cv.height); root.classList.remove("is-gezeichnet"); striche = 0; if(opts.onChange) opts.onChange(false); },
      bestaetigen: function(){ if(!root.classList.contains("is-gezeichnet")) return false; fest = true; root.classList.add("is-bestaetigt"); return true; },
      istLeer: function(){ return !root.classList.contains("is-gezeichnet"); },
      bild: function(){ return cv.toDataURL("image/png"); },
      groesse: groesse
    };
  }
  window.Nu = {icons: I, svg: svg, mountIcons: mountIcons, bett: bett, unterschrift: unterschrift, esc: esc};
})();
