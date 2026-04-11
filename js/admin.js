/**
 * admin.js
 * ─────────────────────────────────────────────────────
 * Lógica del panel de administrador:
 * - Poblar el select de semanas según unidad
 * - Vista previa en tiempo real
 * - Guardar / eliminar semanas
 * - Renderizar la lista de semanas cargadas
 */

const Admin = {
  init() {
    this._populateWeeks();
    this._bindEvents();
  },

  /** Rellena el <select> de semanas según la unidad elegida */
  _populateWeeks() {
    const unitNum = parseInt(document.getElementById("aUnit").value);
    const unit = UNITS_CONFIG.find(u => u.num === unitNum);
    const sel  = document.getElementById("aWeek");

    sel.innerHTML = unit.weeks
      .map(w => `<option value="${w}">Semana ${w}</option>`)
      .join("");

    this._loadWeekIntoForm();
  },

  /** Carga los datos existentes de la semana seleccionada */
  _loadWeekIntoForm() {
    const week = parseInt(document.getElementById("aWeek").value);
    const item = Data.getWeek(week);
    if (item && item.title) {
      document.getElementById("aTitle").value = item.title       || "";
      document.getElementById("aDesc").value  = item.description || "";
      document.getElementById("aImage").value = item.image       || "";
      document.getElementById("aFile").value  = item.file        || "";
      document.getElementById("aLink").value  = item.link        || "";
    } else {
      document.getElementById("aTitle").value = "";
      document.getElementById("aDesc").value  = "";
      document.getElementById("aImage").value = "";
      document.getElementById("aFile").value  = "";
      document.getElementById("aLink").value  = "";
    }
    this._updatePreview();
  },

  _bindEvents() {
    document.getElementById("aUnit").addEventListener("change", () => this._populateWeeks());
    document.getElementById("aWeek").addEventListener("change", () => this._loadWeekIntoForm());

    ["aTitle", "aDesc", "aImage", "aFile", "aLink"].forEach(id => {
      document.getElementById(id).addEventListener("input", () => this._updatePreview());
    });

    document.getElementById("saveBtn").addEventListener("click", () => this._save());
  },

  _updatePreview() {
    const title = document.getElementById("aTitle").value.trim();
    const desc  = document.getElementById("aDesc").value.trim();
    const unit  = document.getElementById("aUnit").value;
    const week  = document.getElementById("aWeek").value;
    const img   = document.getElementById("aImage").value.trim();
    const file  = document.getElementById("aFile").value.trim();
    const link  = document.getElementById("aLink").value.trim();

    const box = document.getElementById("previewBox");
    if (!title && !desc) {
      box.innerHTML = `<span class="preview-empty">Completa el formulario para ver la vista previa…</span>`;
      return;
    }

    box.innerHTML = `
      <div class="preview-meta">Unidad ${unit} · Semana ${week}</div>
      ${img ? `<img src="${img}" alt="" style="width:100%;height:80px;object-fit:cover;border-radius:6px;margin-bottom:8px">` : ""}
      <strong>${title || "(sin título)"}</strong>
      <p style="font-size:.82rem;color:var(--color-muted);line-height:1.6">${desc || "(sin descripción)"}</p>
      ${file ? `<div style="margin-top:6px;font-size:.72rem;color:var(--color-accent)">📎 ${file}</div>` : ""}
      ${link ? `<div style="margin-top:4px;font-size:.72rem;color:var(--color-blue)">🔗 ${link}</div>` : ""}
    `;
  },

  _save() {
    const unit  = parseInt(document.getElementById("aUnit").value);
    const week  = parseInt(document.getElementById("aWeek").value);
    const title = document.getElementById("aTitle").value.trim();
    const desc  = document.getElementById("aDesc").value.trim();
    const image = document.getElementById("aImage").value.trim();
    const file  = document.getElementById("aFile").value.trim();
    const link  = document.getElementById("aLink").value.trim();

    if (!title || !desc) {
      alert("El título y la descripción son obligatorios.");
      return;
    }

    Data.setWeek({ unit, week, title, description: desc, image, file, link });
    this.renderLoadedList();
    UI.toast("✓ Semana " + week + " guardada");
  },

  renderLoadedList() {
    const list  = document.getElementById("loadedList");
    const items = Data.getFilledWeeks();

    if (!items.length) {
      list.innerHTML = `<p class="loaded-empty">Aún no hay semanas con contenido.</p>`;
      return;
    }

    list.innerHTML = items.map(item => `
      <div class="loaded-item">
        <div class="loaded-info">
          <div class="loaded-meta">U${item.unit} · Semana ${item.week}</div>
          <div class="loaded-title">${item.title}</div>
        </div>
        <button class="loaded-del" onclick="Admin._deleteWeek(${item.week})" title="Borrar semana ${item.week}">✕</button>
      </div>
    `).join("");
  },

  _deleteWeek(weekNum) {
    if (!confirm(`¿Borrar el contenido de la semana ${weekNum}?`)) return;
    Data.clearWeek(weekNum);
    this.renderLoadedList();
    this._loadWeekIntoForm();
    UI.toast("Semana " + weekNum + " vaciada");
  }
};
