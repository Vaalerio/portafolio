/**
 * experience.js
 * ─────────────────────────────────────────────────────
 * Product experience layer.
 * Features:
 *   1. Reading progress bar (detail pages)
 *   2. Week navigation (prev/next + keyboard arrows)
 *   3. Command palette (Ctrl+K / Cmd+K)
 *   4. Back to top (floating button on scroll)
 * ─────────────────────────────────────────────────────
 */
(function () {
  "use strict";

  var isDetailPage = /semana-\d+/.test(window.location.pathname);

  /* ═══════════════════════════════════════════════════
     1. READING PROGRESS BAR
     ═══════════════════════════════════════════════════ */

  function initProgressBar() {
    if (!isDetailPage) return;
    var bar = document.createElement("div");
    bar.className = "reading-progress";
    bar.innerHTML = '<div class="reading-progress__fill"></div>';
    document.body.appendChild(bar);
    var fill = bar.querySelector(".reading-progress__fill");

    var ticking = false;
    window.addEventListener("scroll", function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          var h = document.documentElement.scrollHeight - window.innerHeight;
          var pct = h > 0 ? (window.scrollY / h) * 100 : 0;
          fill.style.width = pct + "%";
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ═══════════════════════════════════════════════════
     2. WEEK NAVIGATION (prev/next)
     ═══════════════════════════════════════════════════ */

  function initWeekNav() {
    if (!isDetailPage) return;
    var m = window.location.pathname.match(/semana-(\d+)/);
    if (!m) return;
    var num = parseInt(m[1]);

    // Wait for content to load, then append nav
    var observer = new MutationObserver(function () {
      var main = document.getElementById("weekContent");
      if (!main || main.querySelector(".week-nav")) return;
      // Check if content is loaded (has title or msg)
      if (!main.querySelector(".week-header") && !main.querySelector(".week-msg")) return;

      observer.disconnect();
      var nav = document.createElement("nav");
      nav.className = "week-nav anim-fade";
      nav.style.setProperty("--s", "20");

      var prevHtml = num > 1
        ? '<a href="semana-' + (num - 1) + '.html" class="week-nav__link week-nav__prev">' +
          '<span class="week-nav__label">← Anterior</span>' +
          '<span class="week-nav__week">Semana ' + String(num - 1).padStart(2, "0") + '</span></a>'
        : '<span class="week-nav__link week-nav__link--disabled"></span>';

      var nextHtml = num < 16
        ? '<a href="semana-' + (num + 1) + '.html" class="week-nav__link week-nav__next">' +
          '<span class="week-nav__label">Siguiente →</span>' +
          '<span class="week-nav__week">Semana ' + String(num + 1).padStart(2, "0") + '</span></a>'
        : '<span class="week-nav__link week-nav__link--disabled"></span>';

      nav.innerHTML = prevHtml + nextHtml;
      main.appendChild(nav);
    });

    observer.observe(document.getElementById("weekContent") || document.body, {
      childList: true, subtree: true
    });

    // Keyboard navigation
    document.addEventListener("keydown", function (e) {
      // Don't navigate if lightbox open, typing in input, or palette open
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.tagName === "SELECT") return;
      if (document.querySelector(".lb-open") || document.querySelector(".cmd-open")) return;

      if (e.key === "ArrowLeft" && num > 1) {
        window.location.href = "semana-" + (num - 1) + ".html";
      } else if (e.key === "ArrowRight" && num < 16) {
        window.location.href = "semana-" + (num + 1) + ".html";
      }
    });
  }

  /* ═══════════════════════════════════════════════════
     3. COMMAND PALETTE (Ctrl+K / Cmd+K)
     ═══════════════════════════════════════════════════ */

  var cmdOverlay = null;

  function initCommandPalette() {
    document.addEventListener("keydown", function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        togglePalette();
      }
      if (e.key === "Escape" && cmdOverlay && cmdOverlay.classList.contains("cmd-open")) {
        closePalette();
      }
    });
  }

  function buildPalette() {
    cmdOverlay = document.createElement("div");
    cmdOverlay.className = "cmd-overlay";
    cmdOverlay.innerHTML =
      '<div class="cmd-dialog">' +
        '<div class="cmd-input-wrap">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' +
          '<input type="text" class="cmd-input" placeholder="Buscar semana…" autocomplete="off" />' +
          '<kbd class="cmd-kbd">ESC</kbd>' +
        '</div>' +
        '<div class="cmd-list"></div>' +
        '<div class="cmd-footer">' +
          '<span><kbd>↑↓</kbd> Navegar</span>' +
          '<span><kbd>↵</kbd> Abrir</span>' +
          '<span><kbd>ESC</kbd> Cerrar</span>' +
        '</div>' +
      '</div>';
    document.body.appendChild(cmdOverlay);

    cmdOverlay.addEventListener("click", function (e) {
      if (e.target === cmdOverlay) closePalette();
    });

    var input = cmdOverlay.querySelector(".cmd-input");
    input.addEventListener("input", function () {
      filterResults(input.value.trim().toLowerCase());
    });

    input.addEventListener("keydown", function (e) {
      var items = cmdOverlay.querySelectorAll(".cmd-item");
      var active = cmdOverlay.querySelector(".cmd-item--active");
      var idx = Array.from(items).indexOf(active);

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (active) active.classList.remove("cmd-item--active");
        idx = (idx + 1) % items.length;
        items[idx].classList.add("cmd-item--active");
        items[idx].scrollIntoView({ block: "nearest" });
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (active) active.classList.remove("cmd-item--active");
        idx = idx <= 0 ? items.length - 1 : idx - 1;
        items[idx].classList.add("cmd-item--active");
        items[idx].scrollIntoView({ block: "nearest" });
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (active) {
          window.location.href = active.dataset.href;
        }
      }
    });
  }

  var _weeks = null;

  async function loadWeeksForPalette() {
    if (_weeks) return _weeks;
    if (typeof Api !== "undefined" && Api.getAllWeeks) {
      var r = await Api.getAllWeeks();
      _weeks = (r.data || []).map(function (w) {
        return { number: w.week_number, title: w.title || "", unit: w.units ? w.units.name : "" };
      });
    } else {
      // Fallback: generate 16 weeks
      _weeks = [];
      for (var i = 1; i <= 16; i++) {
        _weeks.push({ number: i, title: "", unit: "" });
      }
    }
    return _weeks;
  }

  function renderResults(weeks) {
    var list = cmdOverlay.querySelector(".cmd-list");
    if (!weeks.length) {
      list.innerHTML = '<div class="cmd-empty">Sin resultados</div>';
      return;
    }
    var basePath = isDetailPage ? "" : "semanas/";
    list.innerHTML = weeks.map(function (w, i) {
      var ws = String(w.number).padStart(2, "0");
      var label = w.title || "Semana " + ws;
      var meta = w.unit || "Semana " + ws;
      return '<a class="cmd-item' + (i === 0 ? ' cmd-item--active' : '') +
        '" data-href="' + basePath + 'semana-' + w.number + '.html">' +
        '<span class="cmd-item__icon">📄</span>' +
        '<div class="cmd-item__text">' +
          '<span class="cmd-item__title">' + label + '</span>' +
          '<span class="cmd-item__meta">' + meta + '</span>' +
        '</div>' +
        '<span class="cmd-item__week">S' + ws + '</span>' +
      '</a>';
    }).join("");
  }

  function filterResults(query) {
    if (!_weeks) return;
    var filtered = _weeks.filter(function (w) {
      var ws = String(w.number).padStart(2, "0");
      var searchable = ("semana " + ws + " " + w.title + " " + w.unit).toLowerCase();
      return searchable.indexOf(query) !== -1;
    });
    renderResults(filtered);
  }

  async function togglePalette() {
    if (!cmdOverlay) buildPalette();
    if (cmdOverlay.classList.contains("cmd-open")) {
      closePalette();
      return;
    }
    cmdOverlay.classList.add("cmd-open");
    document.body.style.overflow = "hidden";

    await loadWeeksForPalette();
    renderResults(_weeks);

    setTimeout(function () {
      cmdOverlay.querySelector(".cmd-input").value = "";
      cmdOverlay.querySelector(".cmd-input").focus();
    }, 50);
  }

  function closePalette() {
    if (!cmdOverlay) return;
    cmdOverlay.classList.remove("cmd-open");
    document.body.style.overflow = "";
  }

  /* ═══════════════════════════════════════════════════
     4. BACK TO TOP
     ═══════════════════════════════════════════════════ */

  function initBackToTop() {
    var btn = document.createElement("button");
    btn.className = "btt";
    btn.setAttribute("aria-label", "Volver arriba");
    btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>';
    document.body.appendChild(btn);

    var visible = false;
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          var show = window.scrollY > 400;
          if (show !== visible) {
            visible = show;
            btn.classList.toggle("btt--show", show);
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ═══════════════════════════════════════════════════
     BOOT
     ═══════════════════════════════════════════════════ */

  function init() {
    initProgressBar();
    initWeekNav();
    initCommandPalette();
    initBackToTop();

    // Search button click
    var searchBtn = document.getElementById("btnSearch");
    if (searchBtn) {
      searchBtn.addEventListener("click", function () {
        togglePalette();
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
