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
  var SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlrenNkeWhhZWNraXNlcXNvdWhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3MzM0MjMsImV4cCI6MjA5MjMwOTQyM30.4LC7KSwY0NxOXIrqmV1WnY5WFKPni2DPoe1jJ34Lxkg";

  if (typeof window.supabase === "undefined" || !window.supabase.createClient) {
    console.error("[supabase] La librería supabase-js no está cargada.");
    return;
  }

  window._supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
})();