/**
 * portfolio.js
 * ─────────────────────────────────────────────────────
 * Renderiza la cuadrícula pública de las 16 semanas
 * en la página principal (homeSection).
 *
 * Lee datos desde Supabase (Api.getAllWeeks).
 * ─────────────────────────────────────────────────────
 */

var Portfolio = {
  async render() {
    var container = document.getElementById("weeksPublicGrid");
    if (!container) return;

    var weeks = null;

    if (typeof Api !== "undefined" && window._supabase) {
      try {
        var { data, error } = await Api.getAllWeeks();
        if (!error && data) {
          weeks = data.map(function (row) {
            return {
              unit:        row.units ? row.units.number : Math.ceil(row.week_number / 4),
              week:        row.week_number,
              title:       row.title || "",
              summary:     row.summary || "",
              description: row.description || "",
              image:       row.cover_image || "",
            };
          });
        }
      } catch (e) {
        console.warn("[portfolio] Error consultando Supabase:", e);
      }
    }

    if (!weeks) {
      weeks = [];
      for (var w = 1; w <= 16; w++) {
        weeks.push({ unit: Math.ceil(w / 4), week: w, title: "", summary: "", description: "", image: "" });
      }
    }

    var html = "";
    var currentUnit = 0;
    var roman = ["", "I", "II", "III", "IV"];
    var unitNames = ["", "Fundamentos", "Patrones", "Diseño", "Proyecto"];
    var unitColors = ["", "var(--unit1)", "var(--unit2)", "var(--unit3)", "var(--unit4)"];

    weeks.forEach(function (item, index) {
      if (item.unit !== currentUnit) {
        if (currentUnit !== 0) {
          html += '</div></section>'; // Close pub-grid and unit-section
        }
        currentUnit = item.unit;
        
        var uNum = roman[currentUnit] || currentUnit;
        var uName = unitNames[currentUnit] || "";
        var uColor = unitColors[currentUnit] || "var(--color-border)";
        
        html += '<section class="unit-section reveal">';
        html += '<div class="unit-header">';
        html += '<div class="unit-header-content" style="display:flex; align-items:baseline; gap:12px;">';
        html += '<h2 class="unit-label">Unidad ' + uNum + '</h2>';
        if (uName) {
          html += '<span class="unit-subtitle" style="font-size:0.9rem; color:var(--color-muted); font-weight:500;"><span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:' + uColor + '; margin-right:6px; transform:translateY(-1px);"></span>' + uName + '</span>';
        }
        html += '</div>';
        html += '<div class="unit-divider"></div>';
        html += '</div>';
        html += '<div class="pub-grid">';
      }
      
      html += Portfolio._renderCard(item, index);
    });

    if (weeks.length > 0) {
      html += '</div></section>';
    }

    container.innerHTML = html;

    if (typeof Theme !== "undefined" && Theme.syncThemedImages) {
      Theme.syncThemedImages();
    }
  },

  _getPlaceholder: function () {
    return '<div class="pub-week-thumb-placeholder">' +
      '<img src="assets/images/icono_logo_personal_1920x1080.png" alt="Logo"' +
      ' data-src-light="assets/images/icono_logo_personal_1920x1080.png"' +
      ' data-src-dark="assets/images/icono_logo_personal_1920x1080_blanco.png"' +
      ' style="max-width:100%;max-height:100%;object-fit:contain;display:block;">' +
      '</div>';
  },

  _renderCard: function (item, index) {
    var isEmpty = !item.title || !item.title.trim();
    var weekStr = String(item.week).padStart(2, "0");
    var delay = index * 60;

    var readWeeks = [];
    try { readWeeks = JSON.parse(localStorage.getItem('arquitectura_read_weeks') || '[]'); } catch(e){}
    var isRead = readWeeks.indexOf(item.week) !== -1;
    var readBadge = isRead && !isEmpty ? '<span class="read-badge" title="Leído"><i class="fa-solid fa-circle-check"></i></span>' : '';

    // Caso: semana sin contenido
    if (isEmpty) {
      return '<div class="pub-week-card pub-week-card--empty" style="--card-delay:' + delay + 'ms">' +
        this._getPlaceholder() +
        '<div class="footer-accent"></div>' +
        '<div class="pub-week-body">' +
        '<span class="pub-week-label">Semana ' + weekStr + '</span>' +
        '<span class="pub-week-title" style="color:var(--color-faint);font-style:italic;">Próximamente…</span>' +
        '</div></div>';
    }

    // Caso: semana con contenido
    var thumbHTML;
    if (item.image) {
      thumbHTML = '<div class="pub-week-thumb-wrap pub-week-thumb-wrap--cover">' +
        '<img class="pub-week-thumb" src="' + item.image + '" alt="' + item.title + '" loading="lazy" onload="this.classList.add(\'loaded\')">' +
        '<div class="pub-week-thumb-overlay"></div>' +
        '</div>';
    } else {
      thumbHTML = this._getPlaceholder();
    }

    var summary = this._truncateWords(item.summary || item.description, 18);

    return '<a href="semanas/semana-' + item.week + '.html" class="pub-week-card pub-week-card--active" style="--card-delay:' + delay + 'ms">' +
      thumbHTML +
      '<div class="pub-week-body">' +
      '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-xs);">' +
      '<span class="pub-week-label" style="margin-bottom:0;">Semana ' + weekStr + '</span>' +
      readBadge +
      '</div>' +
      '<span class="pub-week-title">' + item.title + '</span>' +
      '<span class="pub-week-summary">' + summary + '</span>' +
      '<span class="pub-week-arrow">Ver contenido →</span>' +
      '</div></a>';
  },

  _truncateWords: function (text, maxWords) {
    if (!text) return "";
    var words = text.trim().split(/\s+/);
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(" ") + "…";
  }
};
