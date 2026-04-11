/**
 * ui.js
 * ─────────────────────────────────────────────
 * Helpers de interfaz: navegación, secciones, toast.
 */

const SECTIONS = ["homeSection", "loginSection", "adminSection"];

const UI = {
  /** Muestra una sección y oculta el resto */
  show(id) {
    SECTIONS.forEach(s => {
      document.getElementById(s).classList.add("hidden");
    });
    document.getElementById(id).classList.remove("hidden");
  },

  /** Muestra u oculta un elemento por id */
  toggle(id, visible) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle("hidden", !visible);
  },

  /** Muestra el toast de confirmación */
  toast(msg = "✓ Guardado correctamente") {
    const el = document.getElementById("toast");
    el.textContent = msg;
    el.classList.add("show");
    setTimeout(() => el.classList.remove("show"), 2800);
  },

  /** Actualiza la nav según rol */
  setNav(role) {
    const isAdmin  = role === "admin";
    const loggedIn = isAdmin || role === "user";

    this.toggle("btnAdmin",     isAdmin);
    this.toggle("btnLogout",    loggedIn);
    this.toggle("btnLogin",     !loggedIn);
  }
};
