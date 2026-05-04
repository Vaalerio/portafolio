/**
 * supabase.js
 * ─────────────────────────────────────────────────────
 * Cliente Supabase — carga vía CDN como script clásico.
 * Expone `window._supabase` para que todos los demás
 * scripts puedan usarlo sin imports ESM.
 * ─────────────────────────────────────────────────────
 */
(function () {
  var SUPABASE_URL  = "https://ykzsdyhaeckiseqsouhs.supabase.co";
  var SUPABASE_ANON = "sb_publishable_fuSjAY7xMG6bScTBE0iEmw_YgHxVNe9";

  if (typeof window.supabase === "undefined" || !window.supabase.createClient) {
    console.error("[supabase] La librería supabase-js no está cargada.");
    return;
  }

  window._supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
})();