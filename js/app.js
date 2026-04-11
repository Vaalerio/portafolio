/**
 * app.js
 * ─────────────────────────────────────────────────────
 * Punto de entrada principal.
 * Maneja autenticación, navegación y estado de sesión.
 *
 * ── Credenciales ────────────────────────────────────
 *    Admin:    admin / 12345
 *    Usuarios: raul / raul123
 *              valerio / valerio123
 *              ivan / ivan123
 *              luis / luis123
 *
 * Los usuarios normales ven la misma vista pública.
 * Solo el admin puede acceder al panel de contenido.
 * ─────────────────────────────────────────────────────
 */

const USERS = [
  { user: "admin",    pass: "12345",      role: "admin" },
  { user: "raul",     pass: "raul123",    role: "user"  },
  { user: "valerio",  pass: "valerio123", role: "user"  },
  { user: "ivan",     pass: "ivan123",    role: "user"  },
  { user: "luis",     pass: "luis123",     role: "user"  },
];

const SESSION_KEY = "arqsw_session_v2";

/* ─── Estado de sesión ──────────────────────────────── */
let currentRole = null;

function getSession() {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)); } catch(e) { return null; }
}
function setSession(data) { sessionStorage.setItem(SESSION_KEY, JSON.stringify(data)); }
function clearSession()   { sessionStorage.removeItem(SESSION_KEY); }

/* ─── Login ─────────────────────────────────────────── */
function doLogin() {
  const user = document.getElementById("inputUser").value.trim().toLowerCase();
  const pass = document.getElementById("inputPass").value.trim();

  if (!user) { alert("Ingresa un nombre de usuario."); return; }
  if (!pass) { alert("Ingresa una contraseña."); return; }

  const found = USERS.find(u => u.user === user && u.pass === pass);

  if (!found) {
    alert("Credenciales incorrectas.\nVerifica tu usuario y contraseña.");
    return;
  }

  _enterAs(found.role, found.user);
}

function _enterAs(role, displayName) {
  currentRole = role;
  setSession({ role, name: displayName });
  UI.setNav(role);

  if (role === "admin") {
    Admin.init();
    Admin.renderLoadedList();
    UI.show("adminSection");
  } else {
    // Usuarios normales → vuelven al home público
    Portfolio.render();
    UI.show("homeSection");
    UI.toast("Bienvenido, " + displayName);
  }
}

function doLogout() {
  currentRole = null;
  clearSession();
  UI.setNav(null);
  document.getElementById("inputUser").value = "";
  document.getElementById("inputPass").value = "";
  Portfolio.render();
  UI.show("homeSection");
}

/* ─── Navegación ─────────────────────────────────────── */
document.getElementById("logoHome").addEventListener("click", (e) => {
  e.preventDefault();
  Portfolio.render();
  UI.show("homeSection");
});

document.getElementById("btnAdmin").addEventListener("click", () => {
  UI.show("adminSection");
});

document.getElementById("btnLogin").addEventListener("click", () => {
  UI.show("loginSection");
});

document.getElementById("btnLogout").addEventListener("click", doLogout);

document.getElementById("loginBtn").addEventListener("click", doLogin);

// Enter en los campos de login
["inputUser", "inputPass"].forEach(id => {
  document.getElementById(id).addEventListener("keydown", e => {
    if (e.key === "Enter") doLogin();
  });
});

/* ─── Header scroll shadow ──────────────────────────── */
window.addEventListener("scroll", () => {
  document.getElementById("siteHeader")
    .classList.toggle("scrolled", window.scrollY > 10);
}, { passive: true });

/* ─── Inicio ────────────────────────────────────────── */
(function init() {
  // Siempre renderizar la cuadrícula pública
  Portfolio.render();

  // Restaurar sesión si existe
  const session = getSession();
  if (session) {
    _enterAs(session.role, session.name);
  } else {
    UI.show("homeSection");
  }
})();
