/* Brikka — i18n engine (ES default, EN/FR via dictionaries) + dropdown language switcher */
(function () {
  "use strict";
  var KEY = "brikka_lang";
  var SUPPORTED = ["es", "en", "fr"];
  var dict = window.I18N || { en: {}, fr: {} };

  var textNodes = [].slice.call(document.querySelectorAll("[data-i18n]"));
  var attrNodes = [].slice.call(document.querySelectorAll("[data-i18n-attr]"));

  var origHTML = {};
  textNodes.forEach(function (n) { origHTML[n.getAttribute("data-i18n")] = n.innerHTML; });

  var origAttr = [];
  attrNodes.forEach(function (n) {
    var map = {};
    n.getAttribute("data-i18n-attr").split(";").forEach(function (pair) {
      var p = pair.split(":");
      if (p.length === 2) map[p[0].trim()] = n.getAttribute(p[0].trim());
    });
    origAttr.push(map);
  });

  function apply(lang) {
    if (SUPPORTED.indexOf(lang) === -1) lang = "es";
    document.documentElement.setAttribute("lang", lang);

    textNodes.forEach(function (n) {
      var k = n.getAttribute("data-i18n");
      var v = lang === "es" ? origHTML[k] : (dict[lang] && dict[lang][k]);
      if (v != null) n.innerHTML = v;
    });

    attrNodes.forEach(function (n, i) {
      n.getAttribute("data-i18n-attr").split(";").forEach(function (pair) {
        var p = pair.split(":");
        if (p.length !== 2) return;
        var attr = p[0].trim(), key = p[1].trim();
        var v = lang === "es" ? origAttr[i][attr] : (dict[lang] && dict[lang][key]);
        if (v != null) n.setAttribute(attr, v);
      });
    });

    try { localStorage.setItem(KEY, lang); } catch (e) {}

    document.querySelectorAll(".lang-switch__current").forEach(function (el) {
      el.textContent = lang.toUpperCase();
    });
    document.querySelectorAll(".lang-switch [data-lang]").forEach(function (b) {
      var on = b.getAttribute("data-lang") === lang;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
  }

  function closeAll() {
    document.querySelectorAll(".lang-switch").forEach(function (ls) {
      ls.setAttribute("data-open", "false");
      var t = ls.querySelector(".lang-switch__trigger");
      if (t) t.setAttribute("aria-expanded", "false");
    });
  }

  document.addEventListener("click", function (e) {
    var trg = e.target.closest(".lang-switch__trigger");
    if (trg) {
      e.preventDefault();
      var ls = trg.closest(".lang-switch");
      var open = ls.getAttribute("data-open") === "true";
      closeAll();
      if (!open) { ls.setAttribute("data-open", "true"); trg.setAttribute("aria-expanded", "true"); }
      return;
    }
    var opt = e.target.closest(".lang-switch [data-lang]");
    if (opt) { e.preventDefault(); apply(opt.getAttribute("data-lang")); closeAll(); return; }
    closeAll();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeAll();
  });

  var saved = null;
  try { saved = localStorage.getItem(KEY); } catch (e) {}
  if (!saved) {
    var nav = (navigator.language || "es").slice(0, 2).toLowerCase();
    saved = SUPPORTED.indexOf(nav) !== -1 ? nav : "es";
  }

  apply(saved);
})();
