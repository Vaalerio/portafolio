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
     0. CINEMATIC CORE (Ambient Glow, Scroll Reveal, Parallax)
     ═══════════════════════════════════════════════════ */

  function initCinematicLayers() {
    // 1. Ambient Glow
    var glow = document.createElement("div");
    glow.className = "ambient-glow";
    document.body.appendChild(glow);

    var cx = window.innerWidth / 2;
    var cy = window.innerHeight / 2;
    glow.style.setProperty("--mouse-x", cx + "px");
    glow.style.setProperty("--mouse-y", cy + "px");

    document.addEventListener("mousemove", function(e) {
      glow.classList.add("active");
      glow.style.setProperty("--mouse-x", e.clientX + "px");
      glow.style.setProperty("--mouse-y", e.clientY + "px");
    }, { passive: true });

    // 2. Scroll Reveal Observer
    var revealObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0 });

    document.querySelectorAll(".reveal").forEach(function(el) {
      revealObserver.observe(el);
    });

    // Handle dynamically added reveal/parallax elements
    var domObserver = new MutationObserver(function(mutations) {
      mutations.forEach(function(m) {
        m.addedNodes.forEach(function(node) {
          if (node.nodeType === 1) {
            if (node.classList.contains("reveal")) revealObserver.observe(node);
            node.querySelectorAll(".reveal").forEach(function(el) {
              revealObserver.observe(el);
            });
            if (node.classList.contains("week-header")) initParallax(node);
            var wh = node.querySelector(".week-header");
            if (wh) initParallax(wh);
          }
        });
      });
    });
    domObserver.observe(document.body, { childList: true, subtree: true });

    // 3. Hero Parallax
    function initParallax(hero) {
      if (hero._hasParallax) return;
      hero._hasParallax = true;
      hero.classList.add("hero-parallax");
      var pticking = false;
      window.addEventListener("scroll", function() {
        if (!pticking) {
          requestAnimationFrame(function() {
            var scroll = window.scrollY;
            if (scroll < window.innerHeight) {
              var y = scroll * 0.35;
              var o = Math.max(0, 1 - (scroll / 400));
              hero.style.transform = "translateY(" + y + "px)";
              hero.style.opacity = o;
            }
            pticking = false;
          });
          pticking = true;
        }
      }, { passive: true });
    }

    var staticHero = document.querySelector(".home-hero");
    if (staticHero) initParallax(staticHero);
  }

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
    var observer = new MutationObserver(async function () {
      var main = document.getElementById("weekContent");
      if (!main || main.querySelector(".week-nav")) return;
      if (!main.querySelector(".week-header") && !main.querySelector(".week-msg")) return;

      observer.disconnect();
      var nav = document.createElement("nav");
      nav.className = "week-nav anim-fade premium-nav-block";
      nav.style.setProperty("--s", "20");

      var wks = await loadWeeksForPalette();
      
      var prevWk = wks.find(function(w) { return w.number === num - 1; });
      var nextWk = wks.find(function(w) { return w.number === num + 1; });

      var prevHtml = "";
      if (prevWk) {
        var pNum = String(prevWk.number).padStart(2, "0");
        var pTitle = prevWk.title || "Capítulo Anterior";
        prevHtml = '<a href="semana-' + prevWk.number + '.html" class="p-nav-card p-nav-prev">' +
          '<div class="p-nav-arrow"><i class="fa-solid fa-arrow-left"></i></div>' +
          '<div class="p-nav-info">' +
            '<span class="p-nav-label">Anterior <span class="p-nav-week-badge">S' + pNum + '</span></span>' +
            '<span class="p-nav-title">' + pTitle + '</span>' +
          '</div></a>';
      }

      var nextHtml = "";
      if (nextWk) {
        var nNum = String(nextWk.number).padStart(2, "0");
        var nTitle = nextWk.title || "Siguiente Capítulo";
        nextHtml = '<a href="semana-' + nextWk.number + '.html" class="p-nav-card p-nav-next">' +
          '<div class="p-nav-info">' +
            '<span class="p-nav-label">Siguiente <span class="p-nav-week-badge">S' + nNum + '</span></span>' +
            '<span class="p-nav-title">' + nTitle + '</span>' +
          '</div>' +
          '<div class="p-nav-arrow"><i class="fa-solid fa-arrow-right"></i></div>' +
          '</a>';
      }

      nav.innerHTML = '<div class="p-nav-wrapper">' + 
        (prevHtml ? prevHtml : '') + 
        (prevHtml && nextHtml ? '<div class="p-nav-divider"></div>' : '') +
        (nextHtml ? nextHtml : '') + 
        '</div>' +
        '<div class="p-nav-hint"><kbd>←</kbd> <kbd>→</kbd> para navegar</div>';

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
    var currentWeekNum = null;
    if (isDetailPage) {
      var m = window.location.pathname.match(/semana-(\d+)/);
      if (m) currentWeekNum = parseInt(m[1]);
    }

    var activeIdx = 0;
    if (currentWeekNum) {
      var found = weeks.findIndex(function(w) { return w.number === currentWeekNum; });
      if (found !== -1) activeIdx = found;
    }

    var basePath = isDetailPage ? "" : "semanas/";
    list.innerHTML = weeks.map(function (w, i) {
      var ws = String(w.number).padStart(2, "0");
      var label = w.title || "Semana " + ws;
      var meta = w.unit || "Semana " + ws;
      var isCurrent = currentWeekNum === w.number ? ' <span style="color:var(--color-accent);font-size:0.7rem;margin-left:8px;">(Actual)</span>' : '';
      return '<a class="cmd-item' + (i === activeIdx ? ' cmd-item--active' : '') +
        '" data-href="' + basePath + 'semana-' + w.number + '.html">' +
        '<span class="cmd-item__icon">📄</span>' +
        '<div class="cmd-item__text">' +
          '<span class="cmd-item__title">' + label + isCurrent + '</span>' +
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
      
      var active = cmdOverlay.querySelector(".cmd-item--active");
      if (active) active.scrollIntoView({ block: "center" });
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
     5. FOCUS MODE
     ═══════════════════════════════════════════════════ */
  function initFocusMode() {
    var isFocus = localStorage.getItem('arquitectura_focus_mode') === 'true';
    if (isFocus) document.body.classList.add('focus-mode');

    // Add button to header-right
    var headerRight = document.querySelector(".header-right");
    if (headerRight) {
      var focusBtn = document.createElement("button");
      focusBtn.className = "theme-toggle focus-mode-btn";
      focusBtn.setAttribute("aria-label", "Toggle Focus Mode");
      focusBtn.innerHTML = isFocus ? '⊙' : '◐';
      focusBtn.title = "Focus Mode (Shift + F)";
      focusBtn.addEventListener("click", toggleFocusMode);
      headerRight.insertBefore(focusBtn, headerRight.firstChild);
    }

    function toggleFocusMode() {
      isFocus = !isFocus;
      document.body.classList.toggle('focus-mode', isFocus);
      localStorage.setItem('arquitectura_focus_mode', isFocus);
      var btn = document.querySelector(".focus-mode-btn");
      if (btn) btn.innerHTML = isFocus ? '⊙' : '◐';
    }

    document.addEventListener('keydown', function(e) {
      if (e.shiftKey && e.key.toLowerCase() === 'f') {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.isComposing) return;
        e.preventDefault();
        toggleFocusMode();
      }
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
    initCinematicLayers();
    initFocusMode();

    // Search button click
    var searchBtn = document.getElementById("btnSearch");
    if (searchBtn) {
      searchBtn.addEventListener("click", function () {
        togglePalette();
      });
    }

    // Dynamic mobile search icon in header
    var headerRight = document.querySelector(".header-right");
    if (headerRight && !document.getElementById("btnSearch")) {
      var mBtn = document.createElement("button");
      mBtn.className = "theme-toggle mobile-only-search";
      mBtn.setAttribute("aria-label", "Buscar semana");
      mBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
      mBtn.addEventListener("click", togglePalette);
      headerRight.insertBefore(mBtn, headerRight.firstChild);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
