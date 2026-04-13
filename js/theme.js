/**
 * theme.js
 * ─────────────────────────────────────────────────────
 * Tema claro / oscuro: clase "dark" en <body>, localStorage.
 * Logos: img con data-src-light / data-src-dark (syncThemedImages).
 */

const THEME_KEY = "arqsw_theme";

const Theme = {
  init() {
    const stored = this._getStored();
    if (stored === "dark" || stored === "light") {
      document.documentElement.classList.toggle("dark", stored === "dark");
    }
    this._syncButton();
    this.syncThemedImages();
    this._notifyThreeBg();
    const btn = document.getElementById("themeToggle");
    if (btn) {
      btn.addEventListener("click", () => this.toggle());
    }

    // Retrasar levemente la habilitación de transiciones para que el render inicial sea sin transición
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.documentElement.classList.add("theme-ready");
      });
    });
  },

  toggle() {
    const next = document.documentElement.classList.contains("dark") ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch (e) {
      /* ignore */
    }
    this._syncButton();
    this.syncThemedImages();
    this._notifyThreeBg();
  },

  _notifyThreeBg() {
    if (
      window.__threeBgApi &&
      typeof window.__threeBgApi.updateTheme === "function"
    ) {
      window.__threeBgApi.updateTheme();
    }
  },

  /** Imágenes con data-src-light / data-src-dark (logos según tema) */
  syncThemedImages() {
    const dark = document.documentElement.classList.contains("dark");
    document.querySelectorAll("img[data-src-light][data-src-dark]").forEach((el) => {
      const next = dark ? el.dataset.srcDark : el.dataset.srcLight;
      if (next) el.src = next;
    });
  },

  _getStored() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch (e) {
      return null;
    }
  },

  _syncButton() {
    const btn = document.getElementById("themeToggle");
    if (!btn) return;
    const dark = document.documentElement.classList.contains("dark");
    const moon = btn.querySelector(".theme-toggle__icon--moon");
    const sun = btn.querySelector(".theme-toggle__icon--sun");
    if (moon) moon.classList.toggle("hidden", dark);
    if (sun) sun.classList.toggle("hidden", !dark);
    btn.setAttribute(
      "aria-label",
      dark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"
    );
    btn.setAttribute("title", dark ? "Tema claro" : "Tema oscuro");
  }
};

document.addEventListener("DOMContentLoaded", () => Theme.init());
