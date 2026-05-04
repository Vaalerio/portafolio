/**
 * api.js
 * ─────────────────────────────────────────────────────
 * Capa de acceso a datos sobre Supabase.
 * Usa `window._supabase` (creado por supabase.js).
 *
 * Expone el objeto global `Api` con funciones de
 * lectura pública y escritura protegida (admin).
 * ─────────────────────────────────────────────────────
 */
var Api = (function () {
  function _sb() {
    return window._supabase;
  }

  var BUCKET = "course-assets";

  return {
    /* ═══════════════════════════════════════════════════
       LECTURA PÚBLICA
       ═══════════════════════════════════════════════════ */

    /**
     * Obtiene las 4 unidades.
     * @returns {{ data: Array, error }}
     */
    async getUnits() {
      return await _sb().from("units").select("*").order("number");
    },

    /**
     * Obtiene las 16 semanas con su unidad asociada.
     * @returns {{ data: Array, error }}
     */
    async getAllWeeks() {
      return await _sb()
        .from("weeks")
        .select("*, units(number, name, color_var)")
        .order("week_number");
    },

    /**
     * Obtiene una semana con TODOS sus datos relacionados.
     * @param {number} weekNumber
     * @returns {{ data: object|null, error }}
     */
    async getWeek(weekNumber) {
      var { data, error } = await _sb()
        .from("weeks")
        .select("*, units(number, name, color_var)")
        .eq("week_number", weekNumber)
        .single();

      if (error || !data) return { data: null, error };

      // Cargar relaciones en paralelo
      var [activities, assets, videos, links] = await Promise.all([
        _sb().from("week_activities").select("*").eq("week_id", data.id).order("sort_order"),
        _sb().from("week_assets").select("*").eq("week_id", data.id).order("sort_order"),
        _sb().from("week_videos").select("*").eq("week_id", data.id).order("sort_order"),
        _sb().from("week_links").select("*").eq("week_id", data.id).order("sort_order"),
      ]);

      data.activities = activities.data || [];
      data.assets     = assets.data     || [];
      data.videos     = videos.data     || [];
      data.links      = links.data      || [];

      return { data, error: null };
    },

    /* ═══════════════════════════════════════════════════
       ESCRITURA (requiere auth admin + RLS)
       ═══════════════════════════════════════════════════ */

    /**
     * Actualiza campos de una semana (título, summary, description, cover_image).
     */
    async updateWeek(weekId, fields) {
      return await _sb()
        .from("weeks")
        .update(fields)
        .eq("id", weekId)
        .select()
        .single();
    },

    /* ── Actividades ── */

    async createActivity(weekId, title, description, sortOrder) {
      return await _sb()
        .from("week_activities")
        .insert({ week_id: weekId, title, description, sort_order: sortOrder || 0 })
        .select()
        .single();
    },

    async updateActivity(activityId, fields) {
      return await _sb()
        .from("week_activities")
        .update(fields)
        .eq("id", activityId)
        .select()
        .single();
    },

    async deleteActivity(activityId) {
      return await _sb()
        .from("week_activities")
        .delete()
        .eq("id", activityId);
    },

    /* ── Videos ── */

    async addVideo(weekId, url, title, sortOrder) {
      return await _sb()
        .from("week_videos")
        .insert({ week_id: weekId, url, title, sort_order: sortOrder || 0 })
        .select()
        .single();
    },

    async deleteVideo(videoId) {
      return await _sb()
        .from("week_videos")
        .delete()
        .eq("id", videoId);
    },

    /* ── Enlaces ── */

    async addLink(weekId, url, label, sortOrder) {
      return await _sb()
        .from("week_links")
        .insert({ week_id: weekId, url, label, sort_order: sortOrder || 0 })
        .select()
        .single();
    },

    async deleteLink(linkId) {
      return await _sb()
        .from("week_links")
        .delete()
        .eq("id", linkId);
    },

    /* ── Assets (archivos) ── */

    /**
     * Sube un archivo al bucket y crea un registro en week_assets.
     * @param {object} opts
     * @param {number} opts.weekId
     * @param {File}   opts.file
     * @param {string} opts.fileType
     * @param {string} opts.displayName
     * @param {number} opts.weekNumber
     * @param {string} [opts.documentGroup] - título del documento (agrupar archivos)
     * @param {string} [opts.description]   - descripción del asset o del grupo
     */
    async uploadAsset(opts) {
      var sb = _sb();
      var storagePath = "week-" + opts.weekNumber + "/" + Date.now() + "_" + opts.file.name;

      var { error: uploadError } = await sb.storage
        .from(BUCKET)
        .upload(storagePath, opts.file, { cacheControl: "3600", upsert: false });

      if (uploadError) return { data: null, error: uploadError };

      var row = {
        week_id: opts.weekId,
        file_name: opts.file.name,
        storage_path: storagePath,
        file_type: opts.fileType,
        file_size: opts.file.size,
        display_name: opts.displayName || opts.file.name,
      };
      if (opts.documentGroup) row.document_group = opts.documentGroup;
      if (opts.description)  row.description = opts.description;

      var { data, error } = await sb
        .from("week_assets")
        .insert(row)
        .select()
        .single();

      return { data, error };
    },

    /**
     * Sube una imagen de portada y actualiza weeks.cover_image.
     */
    async uploadCoverImage(weekId, file, weekNumber) {
      var sb = _sb();
      var storagePath = "week-" + weekNumber + "/cover_" + Date.now() + "_" + file.name;

      var { error: upErr } = await sb.storage
        .from(BUCKET)
        .upload(storagePath, file, { cacheControl: "3600", upsert: false });
      if (upErr) return { data: null, error: upErr };

      var publicUrl = this.getAssetUrl(storagePath);
      var { data, error } = await sb
        .from("weeks")
        .update({ cover_image: publicUrl })
        .eq("id", weekId)
        .select()
        .single();

      return { data, error };
    },

    /**
     * Elimina un archivo del bucket y su registro de la tabla.
     */
    async deleteAsset(assetId, storagePath) {
      var sb = _sb();

      // 1. Eliminar del bucket
      await sb.storage.from(BUCKET).remove([storagePath]);

      // 2. Eliminar registro
      return await sb
        .from("week_assets")
        .delete()
        .eq("id", assetId);
    },

    /**
     * Obtiene la URL pública de un archivo en Storage.
     */
    getAssetUrl(storagePath) {
      var sb = _sb();
      var { data } = sb.storage.from(BUCKET).getPublicUrl(storagePath);
      return data?.publicUrl || "";
    },
  };
})();
