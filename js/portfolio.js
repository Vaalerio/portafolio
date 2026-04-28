/**
 * portfolio.js
 * ─────────────────────────────────────────────────────
 * Renderiza la cuadrícula pública de las 16 semanas
 * en la página principal (homeSection).
 *
 * Lee datos desde Supabase (Api.getAllWeeks).
 * Si Supabase falla, cae a Data.getAllWeeks() local.
 * ─────────────────────────────────────────────────────
 */

var Portfolio = {
  async render() {
    var container = document.getElementById("weeksPublicGrid");
    if (!container) return;

    // Intentar leer de Supabase
    var weeks = null;

    if (typeof Api !== "undefined" && window._supabase) {
      try {
        var { data, error } = await Api.getAllWeeks();
        if (!error && data) {
          // Transformar al formato que espera _renderCard
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
        console.warn("[portfolio.js] Error consultando Supabase, usando datos locales:", e);
      }
    }

    // Fallback: datos locales
    if (!weeks && typeof Data !== "undefined") {
      weeks = Data.getAllWeeks();
    }

    // Último recurso: generar 16 semanas vacías
    if (!weeks) {
      weeks = [];
      for (var w = 1; w <= 16; w++) {
        weeks.push({ unit: Math.ceil(w / 4), week: w, title: "", summary: "", description: "", image: "" });
      }
    }

    container.innerHTML = weeks
      .map(function (item, i) { return Portfolio._renderCard(item, i); })
      .join("");

    if (typeof Theme !== "undefined" && Theme.syncThemedImages) {
      Theme.syncThemedImages();
    }
  },

  // Placeholder visual reutilizado en tarjetas vacías
  _getPlaceholder: function () {
    return '\
      <div class="pub-week-thumb-placeholder">\
        <img\
          src="assets/images/icono_logo_personal_1920x1080.png"\
          alt="Logo"\
          data-src-light="assets/images/icono_logo_personal_1920x1080.png"\
          data-src-dark="assets/images/icono_logo_personal_1920x1080_blanco.png"\
          style="max-width:100%; max-height:100%; object-fit:contain; display:block;"\
        >\
      </div>\
    ';
  },

  _renderCard: function (item, index) {
    var isEmpty = !item.title || !item.title.trim();
    var weekStr = String(item.week).padStart(2, "0");
    var delay = index * 50;

    // Caso: semana sin contenido
    if (isEmpty) {
      return '\
        <div class="pub-week-card pub-week-card--empty" style="--card-delay:' + delay + 'ms">\
          ' + this._getPlaceholder() + '\
          <div class="footer-accent"></div>\
          <div class="pub-week-body">\
            <span class="pub-week-label">Semana ' + weekStr + '</span>\
            <span class="pub-week-title" style="color:var(--color-faint); font-style:italic;">\
              Próximamente…\
            </span>\
          </div>\
        </div>\
      ';
    }

    // Caso: semana con contenido
    var thumbHTML = item.image
      ? '<div class="pub-week-thumb-wrap">\
           <img class="pub-week-thumb" src="' + item.image + '" alt="' + item.title + '" loading="lazy">\
         </div>'
      : this._getPlaceholder();

    var summary = this._truncateWords(item.summary || item.description, 15);

    return '\
      <a href="semanas/semana-' + item.week + '.html" class="pub-week-card" style="--card-delay:' + delay + 'ms">\
        ' + thumbHTML + '\
        <div class="pub-week-body">\
          <span class="pub-week-label">Semana ' + weekStr + '</span>\
          <span class="pub-week-title">' + item.title + '</span>\
          <span class="pub-week-summary">' + summary + '</span>\
          <span class="pub-week-arrow">Ver contenido →</span>\
        </div>\
      </a>\
    ';
  },

  /** Trunca a N palabras */
  _truncateWords: function (text, maxWords) {
    if (!text) return "";
    var words = text.trim().split(/\s+/);
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(" ") + "...";
  }
};
