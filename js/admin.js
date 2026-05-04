/**
 * admin.js
 * ─────────────────────────────────────────────────────
 * Panel de administrador con CRUD real sobre Supabase.
 * Gestiona: semanas, portada, documentos, actividades,
 *           videos, enlaces y archivos con descripciones.
 *
 * Depende de: Api (api.js), UI (ui.js)
 * ─────────────────────────────────────────────────────
 */

var UNITS_CONFIG = [
  { num: 1, name: "Unidad 1 — Fundamentos", weeks: [1, 2, 3, 4] },
  { num: 2, name: "Unidad 2 — Patrones", weeks: [5, 6, 7, 8] },
  { num: 3, name: "Unidad 3 — Diseño", weeks: [9, 10, 11, 12] },
  { num: 4, name: "Unidad 4 — Proyecto Final", weeks: [13, 14, 15, 16] },
];

var Admin = {
  _currentWeek: null,
  _bound: false,

  async init() {
    this._populateWeeks();
    if (!this._bound) { this._bindEvents(); this._bound = true; }
    this.renderLoadedList();
  },

  /* ═══════ SELECCIÓN ═══════ */

  _populateWeeks() {
    var unitNum = parseInt(document.getElementById("aUnit").value);
    var unit = UNITS_CONFIG.find(function (u) { return u.num === unitNum; });
    var sel = document.getElementById("aWeek");
    sel.innerHTML = unit.weeks.map(function (w) {
      return '<option value="' + w + '">Semana ' + w + '</option>';
    }).join("");
    this._loadWeekIntoForm();
  },

  async _loadWeekIntoForm() {
    var weekNum = parseInt(document.getElementById("aWeek").value);

    document.getElementById("aTitle").value = "";
    document.getElementById("aSummary").value = "";
    document.getElementById("aDesc").value = "";
    document.getElementById("activitiesList").innerHTML = "";
    document.getElementById("videosList").innerHTML = "";
    document.getElementById("linksList").innerHTML = "";
    document.getElementById("assetsList").innerHTML = "";
    document.getElementById("coverPreview").innerHTML = '<span class="loaded-empty">Sin portada</span>';

    try {
      var { data, error } = await Api.getWeek(weekNum);
      if (error || !data) { this._currentWeek = null; return; }

      this._currentWeek = data;
      document.getElementById("aTitle").value = data.title || "";
      document.getElementById("aSummary").value = data.summary || "";
      document.getElementById("aDesc").value = data.description || "";

      if (data.cover_image) {
        document.getElementById("coverPreview").innerHTML =
          '<img src="' + data.cover_image + '" class="cover-preview-img" alt="Portada">';
      }

      this._renderActivities(data.activities || []);
      this._renderVideos(data.videos || []);
      this._renderLinks(data.links || []);
      this._renderAssets(data.assets || []);
    } catch (e) {
      console.error("[admin]", e);
    }
  },

  /* ═══════ GUARDAR ═══════ */

  async _save() {
    if (!this._currentWeek) return;
    var btn = document.getElementById("saveBtn");
    btn.textContent = "Guardando…"; btn.disabled = true;

    await Api.updateWeek(this._currentWeek.id, {
      title: document.getElementById("aTitle").value.trim(),
      summary: document.getElementById("aSummary").value.trim(),
      description: document.getElementById("aDesc").value.trim()
    });

    btn.textContent = "Guardar semana"; btn.disabled = false;
    this.renderLoadedList();
    Portfolio.render(); // Refrescar cuadrícula del home
    UI.toast("✓ Semana guardada");
  },

  /* ═══════ PORTADA ═══════ */

  async _uploadCover() {
    if (!this._currentWeek) return;
    var input = document.getElementById("coverUploadInput");
    if (!input.files.length) { alert("Selecciona una imagen."); return; }

    var { error } = await Api.uploadCoverImage(
      this._currentWeek.id, input.files[0], this._currentWeek.week_number
    );
    input.value = "";
    if (error) { alert("Error: " + error.message); return; }

    await this._loadWeekIntoForm();
    UI.toast("✓ Portada actualizada");
  },

  /* ═══════ ACTIVIDADES ═══════ */

  _renderActivities(list) {
    var el = document.getElementById("activitiesList");
    if (!list.length) { el.innerHTML = '<p class="loaded-empty">Sin actividades.</p>'; return; }
    el.innerHTML = list.map(function (a) {
      return '<div class="loaded-item">' +
        '<div class="loaded-info"><div class="loaded-title">' + (a.title || '(sin título)') + '</div>' +
        '<div class="loaded-meta">' + (a.description || '').substring(0, 60) + '</div></div>' +
        '<button class="loaded-del" onclick="Admin._deleteActivity(' + a.id + ')">✕</button></div>';
    }).join("");
  },

  async _addActivity() {
    if (!this._currentWeek) return;
    var title = prompt("Título de la actividad:");
    if (!title) return;
    var desc = prompt("Descripción (opcional):");
    await Api.createActivity(this._currentWeek.id, title, desc || "", 0);
    await this._loadWeekIntoForm();
    UI.toast("✓ Actividad agregada");
  },

  async _deleteActivity(id) {
    if (!confirm("¿Eliminar?")) return;
    await Api.deleteActivity(id);
    await this._loadWeekIntoForm();
  },

  /* ═══════ VIDEOS ═══════ */

  _renderVideos(list) {
    var el = document.getElementById("videosList");
    if (!list.length) { el.innerHTML = '<p class="loaded-empty">Sin videos.</p>'; return; }
    el.innerHTML = list.map(function (v) {
      return '<div class="loaded-item">' +
        '<div class="loaded-info"><div class="loaded-title">' + (v.title || v.url) + '</div></div>' +
        '<button class="loaded-del" onclick="Admin._deleteVideo(' + v.id + ')">✕</button></div>';
    }).join("");
  },

  async _addVideo() {
    if (!this._currentWeek) return;
    var url = prompt("URL del video de YouTube:");
    if (!url) return;
    var title = prompt("Título (opcional):");
    await Api.addVideo(this._currentWeek.id, url, title || "", 0);
    await this._loadWeekIntoForm();
    UI.toast("✓ Video agregado");
  },

  async _deleteVideo(id) {
    if (!confirm("¿Eliminar?")) return;
    await Api.deleteVideo(id);
    await this._loadWeekIntoForm();
  },

  /* ═══════ ENLACES ═══════ */

  _renderLinks(list) {
    var el = document.getElementById("linksList");
    if (!list.length) { el.innerHTML = '<p class="loaded-empty">Sin enlaces.</p>'; return; }
    el.innerHTML = list.map(function (l) {
      return '<div class="loaded-item">' +
        '<div class="loaded-info"><div class="loaded-title">' + (l.label || l.url) + '</div>' +
        '<div class="loaded-meta">' + l.url.substring(0, 50) + '</div></div>' +
        '<button class="loaded-del" onclick="Admin._deleteLink(' + l.id + ')">✕</button></div>';
    }).join("");
  },

  async _addLink() {
    if (!this._currentWeek) return;
    var url = prompt("URL del enlace:");
    if (!url) return;
    var label = prompt("Título del enlace:");
    await Api.addLink(this._currentWeek.id, url, label || "", 0);
    await this._loadWeekIntoForm();
    UI.toast("✓ Enlace agregado");
  },

  async _deleteLink(id) {
    if (!confirm("¿Eliminar?")) return;
    await Api.deleteLink(id);
    await this._loadWeekIntoForm();
  },

  /* ═══════ ARCHIVOS (con document_group y description) ═══════ */

  _renderAssets(list) {
    var el = document.getElementById("assetsList");
    if (!list.length) { el.innerHTML = '<p class="loaded-empty">Sin archivos.</p>'; return; }
    el.innerHTML = list.map(function (a) {
      var label = a.file_type.toUpperCase();
      if (a.document_group) label += ' · ' + a.document_group;
      return '<div class="loaded-item">' +
        '<div class="loaded-info"><div class="loaded-title">' + (a.display_name || a.file_name) + '</div>' +
        '<div class="loaded-meta">' + label + '</div></div>' +
        '<button class="loaded-del" onclick="Admin._deleteAsset(' + a.id + ',\'' + (a.storage_path || '').replace(/'/g, "\\'") + '\')">✕</button></div>';
    }).join("");
  },

  _detectFileType: function (fileName) {
    var ext = fileName.split('.').pop().toLowerCase();
    if (ext === 'pdf') return 'pdf';
    if (ext === 'doc' || ext === 'docx') return 'word';
    if (ext === 'zip' || ext === 'rar') return 'zip';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].indexOf(ext) !== -1) return 'image';
    return 'other';
  },

  async _uploadAsset() {
    if (!this._currentWeek) return;
    var input = document.getElementById("fileUploadInput");
    if (!input.files.length) { alert("Selecciona un archivo."); return; }

    var file = input.files[0];
    var fileType = this._detectFileType(file.name);
    var displayName = prompt("Nombre visible:", file.name);
    if (displayName === null) return;

    // Preguntar si es parte de un documento
    var docGroup = null;
    var desc = "";
    if (fileType !== 'image') {
      docGroup = prompt("¿Pertenece a un documento? Escribe el título del documento (o deja vacío):");
      if (docGroup) {
        desc = prompt("Descripción del documento (opcional):") || "";
      }
    } else {
      desc = prompt("Descripción de la imagen (opcional):") || "";
    }

    var btn = document.getElementById("uploadBtn");
    btn.textContent = "Subiendo…"; btn.disabled = true;

    var { error } = await Api.uploadAsset({
      weekId: this._currentWeek.id,
      file: file,
      fileType: fileType,
      displayName: displayName || file.name,
      weekNumber: this._currentWeek.week_number,
      documentGroup: docGroup || null,
      description: desc
    });

    btn.textContent = "Subir archivo"; btn.disabled = false;
    input.value = "";
    if (error) { alert("Error: " + error.message); return; }

    await this._loadWeekIntoForm();
    UI.toast("✓ Archivo subido");
  },

  async _deleteAsset(id, storagePath) {
    if (!confirm("¿Eliminar este archivo?")) return;
    await Api.deleteAsset(id, storagePath);
    await this._loadWeekIntoForm();
  },

  /* ═══════ LISTA DE SEMANAS ═══════ */

  async renderLoadedList() {
    var list = document.getElementById("loadedList");
    list.innerHTML = '<p class="loaded-empty">Cargando…</p>';
    try {
      var { data } = await Api.getAllWeeks();
      var filled = (data || []).filter(function (w) { return w.title && w.title.trim(); });
      if (!filled.length) { list.innerHTML = '<p class="loaded-empty">Sin contenido aún.</p>'; return; }
      list.innerHTML = filled.map(function (w) {
        return '<div class="loaded-item"><div class="loaded-info">' +
          '<div class="loaded-meta">U' + (w.units ? w.units.number : '?') + ' · Sem ' + w.week_number + '</div>' +
          '<div class="loaded-title">' + w.title + '</div></div></div>';
      }).join("");
    } catch (e) {
      list.innerHTML = '<p class="loaded-empty">Error.</p>';
    }
  },

  /* ═══════ BIND ═══════ */

  _bindEvents() {
    var s = this;
    document.getElementById("aUnit").addEventListener("change", function () { s._populateWeeks(); });
    document.getElementById("aWeek").addEventListener("change", function () { s._loadWeekIntoForm(); });
    document.getElementById("saveBtn").addEventListener("click", function () { s._save(); });
    document.getElementById("addActivityBtn").addEventListener("click", function () { s._addActivity(); });
    document.getElementById("addVideoBtn").addEventListener("click", function () { s._addVideo(); });
    document.getElementById("addLinkBtn").addEventListener("click", function () { s._addLink(); });
    document.getElementById("uploadBtn").addEventListener("click", function () { s._uploadAsset(); });
    document.getElementById("coverUploadBtn").addEventListener("click", function () { s._uploadCover(); });
  }
};
