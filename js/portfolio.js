/**
 * portfolio.js
 * ─────────────────────────────────────────────────────
 * Renderiza la cuadrícula pública de las 16 semanas
 * en la página principal (homeSection).
 * Cada tarjeta tiene: imagen, título, resumen (15 palabras max).
 * Al hacer clic lleva a semanas/semana-X.html
 */

const Portfolio = {
  render() {
    const container = document.getElementById("weeksPublicGrid");
    const weeks = Data.getAllWeeks();
    container.innerHTML = weeks
      .map((item, i) => this._renderCard(item, i))
      .join("");
    if (typeof Theme !== "undefined" && Theme.syncThemedImages) {
      Theme.syncThemedImages();
    }
  },


  // Genera el placeholder visual reutilizado en tarjetas vacías y con fallback.
  // En este proyecto, siempre muestra la marca personal.
  _getPlaceholder() {
    return `
      <div class="pub-week-thumb-placeholder">
        <img
          src="assets/images/icono_logo_personal_1920x1080.png"
          alt="Logo"
          data-src-light="assets/images/icono_logo_personal_1920x1080.png"
          data-src-dark="assets/images/icono_logo_personal_1920x1080_blanco.png"
          style="max-width:100%; max-height:100%; object-fit:contain; display:block;"
        >
      </div>
    `;
  },

  _renderCard(item, index) {
    const isEmpty = !item.title || !item.title.trim();
    const weekStr = String(item.week).padStart(2, "0");
    // Aplicamos el delay para stagger las tarjetas
    // Stagger animation: cada tarjeta entra con un pequeño delay
    const delay = index * 50;

    // Caso: semana sin contenido
    if (isEmpty) {
      return `
        <div class="pub-week-card pub-week-card--empty" style="--card-delay:${delay}ms">
          ${this._getPlaceholder()}
          <div class="footer-accent"></div>
          <div class="pub-week-body">
            <span class="pub-week-label">Semana ${weekStr}</span>
            <span class="pub-week-title" style="color:var(--color-faint); font-style:italic;">
              Próximamente…
            </span>
          </div>
        </div>
      `;
    }

    // Caso: semana con contenido
    // Si no existe imagen, se reutiliza el placeholder de marca.
    const thumbHTML = item.image
      ? `
        <div class="pub-week-thumb-wrap">
          <img
            class="pub-week-thumb"
            src="${item.image}"
            alt="${item.title}"
            loading="lazy"
          >
        </div>
      `
      : this._getPlaceholder();

    // Resumen truncado a ~15 palabras
    const summary = this._truncateWords(item.summary || item.description, 15);

    return `
      <a href="semanas/semana-${item.week}.html" class="pub-week-card" style="--card-delay:${delay}ms">
        ${thumbHTML}
        <div class="pub-week-body">
          <span class="pub-week-label">Semana ${weekStr}</span>
          <span class="pub-week-title">${item.title}</span>
          <span class="pub-week-summary">${summary}</span>
          <span class="pub-week-arrow">Ver contenido →</span>
        </div>
      </a>
    `;
  },

  /** Trunca a N palabras, agrega "..." si excede */
  _truncateWords(text, maxWords) {
    if (!text) return "";
    const words = text.trim().split(/\s+/);
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(" ") + "...";
  }
};
