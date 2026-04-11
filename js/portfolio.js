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
    container.innerHTML = weeks.map((item, i) => this._renderCard(item, i)).join("");
  },

  _renderCard(item, index) {
    const isEmpty = !item.title || !item.title.trim();
    const weekStr = String(item.week).padStart(2, "0");
    // Stagger animation: cada tarjeta entra con un pequeño delay
    const delay = index * 50;

    if (isEmpty) {
      return `
        <div class="pub-week-card pub-week-card--empty" style="--card-delay:${delay}ms">
          <img src="assets/images/icono_logo_personal_1920x1080.png" alt="Logo">
          <div class="footer-accent"></div>
          <div class="pub-week-body">
            <span class="pub-week-label">Semana ${weekStr}</span>
            <span class="pub-week-title" style="color:var(--color-faint); font-style:italic;">Próximamente…</span>
          </div>
        </div>
      `;
    }

    // Imagen con wrapper para zoom on hover
    const thumbHTML = item.image
      ? `<div class="pub-week-thumb-wrap"><img class="pub-week-thumb" src="${item.image}" alt="${item.title}" loading="lazy" onerror="this.parentElement.outerHTML='<div class=\\'pub-week-thumb-placeholder\\'>📘</div>'"></div>`
      : `<div class="pub-week-thumb-placeholder">📘</div>`;

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
