/**
 * app.js
 * ─────────────────────────────────────────────────────
 * Punto de entrada principal.
 * Maneja autenticación (Supabase Auth), navegación
 * y estado de sesión.
 *
 * Depende de: Auth (auth.js), UI (ui.js),
 *             Portfolio (portfolio.js), Admin (admin.js)
 * ─────────────────────────────────────────────────────
 */

/* ─── Estado de sesión ──────────────────────────────── */
var currentRole = null;

/* ─── Login (Supabase Auth) ─────────────────────────── */
async function doLogin() {
  var email = document.getElementById("inputUser").value.trim();
  var pass  = document.getElementById("inputPass").value.trim();

  if (!email) { alert("Ingresa tu correo electrónico."); return; }
  if (!pass)  { alert("Ingresa tu contraseña."); return; }

  var btn = document.getElementById("loginBtn");
  var originalText = btn.textContent;
  btn.textContent = "Ingresando…";
  btn.disabled = true;

  var { user, error } = await Auth.login(email, pass);

  btn.textContent = originalText;
  btn.disabled = false;

  if (error) {
    alert("Error de autenticación:\n" + (error.message || "Credenciales incorrectas."));
    return;
  }

  // Login exitoso → obtener rol y mostrar admin
  await _restoreSession(true);
}

/**
 * Restaurar sesión.
 * @param {boolean} isLogin - true si viene de un login fresco (mostrar admin),
 *                            false si es recarga de página (mostrar home).
 */
async function _restoreSession(isLogin) {
  var user = await Auth.getUser();
  if (!user) {
    currentRole = null;
    UI.setNav(null);
    UI.show("homeSection");
    return;
  }

  var role = await Auth.getRole();
  var name = await Auth.getDisplayName();

  currentRole = role;
  UI.setNav(role);

  if (role === "admin" && isLogin) {
    // Solo mostrar admin panel al hacer login fresco
    Admin.init();
    UI.show("adminSection");
    UI.toast("Bienvenido, " + name);
  } else {
    // Recarga de página o usuario normal → siempre home
    Portfolio.render();
    UI.show("homeSection");
    if (isLogin) UI.toast("Bienvenido, " + name);
  }
}

/* ─── Logout ────────────────────────────────────────── */
async function doLogout() {
  await Auth.logout();
  currentRole = null;
  UI.setNav(null);
  document.getElementById("inputUser").value = "";
  document.getElementById("inputPass").value = "";
  Portfolio.render();
  UI.show("homeSection");
}

/* ─── Navegación ─────────────────────────────────────── */
document.getElementById("logoHome").addEventListener("click", function (e) {
  e.preventDefault();
  Portfolio.render();
  UI.show("homeSection");
});

document.getElementById("btnAdmin").addEventListener("click", function () {
  Admin.init();
  UI.show("adminSection");
});

document.getElementById("btnLogin").addEventListener("click", function () {
  UI.show("loginSection");
});

document.getElementById("btnLogout").addEventListener("click", doLogout);

document.getElementById("loginBtn").addEventListener("click", doLogin);

// Enter en los campos de login
["inputUser", "inputPass"].forEach(function (id) {
  document.getElementById(id).addEventListener("keydown", function (e) {
    if (e.key === "Enter") doLogin();
  });
});

/* ─── Header scroll shadow ──────────────────────────── */
window.addEventListener("scroll", function () {
  document.getElementById("siteHeader")
    .classList.toggle("scrolled", window.scrollY > 10);
}, { passive: true });

/* ─── Inicio ────────────────────────────────────────── */
(async function init() {
  Portfolio.render();
  // Restaurar sesión sin redirigir a admin (false = page reload)
  await _restoreSession(false);
})();
