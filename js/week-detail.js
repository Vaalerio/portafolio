/**
 * week-detail.js
 * ─────────────────────────────────────────────────────
 * Renderiza dinámicamente el contenido de una semana.
 * Jerarquía: Título → Resumen → Actividades → Documentos
 *            → Material Visual → Videos → Enlaces
 * ─────────────────────────────────────────────────────
 */
(function () {
  function getWeekNumber() {
    var m = window.location.pathname.match(/semana-(\d+)/);
    return m ? parseInt(m[1]) : null;
  }

  function resolveUrl(path) {
    if (!path) return "";
    if (path.startsWith("week-")) return Api.getAssetUrl(path);
    return path;
  }

  function ytId(url) {
    var m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/);
    return m ? m[1] : null;
  }

  async function loadWeek() {
    var weekNum = getWeekNumber();
    var main = document.getElementById("weekContent");
    if (!main || !weekNum) return;
    if (!window._supabase || typeof Api === "undefined") {
      main.innerHTML = '<a href="../index.html" class="btn-back">← Volver</a><p class="week-msg">Error de carga.</p>';
      return;
    }

    main.innerHTML = '<div class="week-loading"><div class="week-spinner"></div>Cargando contenido…</div>';

    try {
      var r = await Api.getWeek(weekNum);
      if (r.error || !r.data) {
        main.innerHTML = '<a href="../index.html" class="btn-back">← Volver</a><p class="week-msg">Semana no encontrada.</p>';
        return;
      }
      renderWeek(r.data, weekNum);
      if (r.data.title) document.title = r.data.title + " · Arquitectura de Software";
    } catch (e) {
      main.innerHTML = '<a href="../index.html" class="btn-back">← Volver</a><p class="week-msg">Error de conexión.</p>';
    }
  }

  /* ═══════════════════════════════════════════════════
     RENDER PRINCIPAL
     ═══════════════════════════════════════════════════ */

  function renderWeek(w, weekNum) {
    var main = document.getElementById("weekContent");
    var ws = String(weekNum).padStart(2, "0");
    var h = '';
    var sIdx = 0; // section index for stagger animation

    // ── Botón volver ──
    h += '<a href="../index.html" class="btn-back">← Volver al portafolio</a>';

    // ── 1. TÍTULO ──
    h += '<div class="week-header anim-fade" style="--s:' + (sIdx++) + '">';
    h += '<div class="week-eyebrow">Semana ' + ws + '</div>';
    h += '<h1 class="week-detail-title">' + (w.title || 'Semana ' + ws) + '</h1>';
    h += '</div>';

    // ── 2. RESUMEN (opcional) ──
    if (w.description && w.description.trim()) {
      h += '<section class="content-section anim-fade" style="--s:' + (sIdx++) + '">';
      h += '<h2 class="section-heading">Resumen de la clase</h2>';
      h += '<p>' + w.description + '</p></section>';
    }

    // ── 3. ACTIVIDADES ──
    if (w.activities && w.activities.length) {
      h += '<section class="content-section anim-fade" style="--s:' + (sIdx++) + '">';
      h += '<h2 class="section-heading">Actividades y Trabajos</h2>';
      w.activities.forEach(function (a) {
        h += '<div class="activity-card">';
        if (a.title) h += '<h3 class="activity-title">' + a.title + '</h3>';
        if (a.description) h += '<p class="activity-desc">' + a.description + '</p>';
        h += '</div>';
      });
      h += '</section>';
    }

    // ── 4. DOCUMENTOS (agrupados) ──
    var assets = w.assets || [];
    var docGroups = buildDocumentGroups(assets);
    var ungroupedFiles = assets.filter(function (a) {
      return !a.document_group && a.file_type !== 'image';
    });

    docGroups.forEach(function (doc) {
      h += '<section class="content-section anim-fade" style="--s:' + (sIdx++) + '">';
      h += '<h2 class="section-heading">' + doc.title + '</h2>';

      // Descripción del documento
      if (doc.description) {
        h += '<p class="doc-description">' + doc.description + '</p>';
      }

      // Visor PDF (primer PDF del grupo)
      var pdf = doc.files.find(function (f) { return f.file_type === 'pdf'; });
      if (pdf) {
        h += '<div class="pdf-viewer-wrap">';
        h += '<iframe src="' + resolveUrl(pdf.storage_path) + '" class="document-viewer" title="' + doc.title + '"></iframe>';
        h += '</div>';
      }

      // Botones de descarga
      if (doc.files.length) {
        h += '<div class="download-grid">';
        doc.files.forEach(function (f) {
          h += renderDownloadCard(f);
        });
        h += '</div>';
      }

      h += '</section>';
    });

    // Archivos sin grupo (legacy)
    if (ungroupedFiles.length) {
      h += '<section class="content-section anim-fade" style="--s:' + (sIdx++) + '">';
      h += '<h2 class="section-heading">Archivos y Entregables</h2>';

      var ungroupedPdf = ungroupedFiles.find(function (f) { return f.file_type === 'pdf'; });
      if (ungroupedPdf) {
        h += '<div class="pdf-viewer-wrap">';
        h += '<iframe src="' + resolveUrl(ungroupedPdf.storage_path) + '" class="document-viewer" title="Documento"></iframe>';
        h += '</div>';
      }

      h += '<div class="download-grid">';
      ungroupedFiles.forEach(function (f) { h += renderDownloadCard(f); });
      h += '</div></section>';
    }

    // ── 5. MATERIAL VISUAL ──
    var images = assets.filter(function (a) { return a.file_type === 'image'; });
    if (images.length) {
      h += '<section class="content-section anim-fade" style="--s:' + (sIdx++) + '">';
      h += '<h2 class="section-heading">Material Visual</h2>';
      h += '<div class="image-gallery">';
      images.forEach(function (img) {
        h += '<figure class="gallery-figure">';
        h += '<img src="' + resolveUrl(img.storage_path) + '" alt="' + (img.display_name || img.file_name) + '" loading="lazy">';
        if (img.description) {
          h += '<figcaption class="gallery-caption">' + img.description + '</figcaption>';
        }
        h += '</figure>';
      });
      h += '</div></section>';
    }

    // ── 6. VIDEOS ──
    if (w.videos && w.videos.length) {
      h += '<section class="content-section anim-fade" style="--s:' + (sIdx++) + '">';
      h += '<h2 class="section-heading">Videos</h2>';
      w.videos.forEach(function (v) {
        var vid = ytId(v.url);
        if (vid) {
          if (v.title) h += '<p class="video-title">' + v.title + '</p>';
          h += '<div class="video-embed">';
          h += '<iframe src="https://www.youtube.com/embed/' + vid + '" allowfullscreen></iframe>';
          h += '</div>';
        }
      });
      h += '</section>';
    }

    // ── 7. ENLACES EXTERNOS ──
    if (w.links && w.links.length) {
      h += '<section class="content-section anim-fade" style="--s:' + (sIdx++) + '">';
      h += '<h2 class="section-heading">Enlaces de Referencia</h2>';
      h += '<div class="links-grid">';
      w.links.forEach(function (l) {
        h += '<a href="' + l.url + '" target="_blank" rel="noopener" class="link-card">';
        h += '<div class="link-icon"><i class="fa-solid fa-arrow-up-right-from-square"></i></div>';
        h += '<div class="link-info">';
        h += '<span class="link-label">' + (l.label || l.url) + '</span>';
        h += '<span class="link-url">' + l.url.replace(/^https?:\/\//, '').substring(0, 40) + '</span>';
        h += '</div></a>';
      });
      h += '</div></section>';
    }

    // Si no hay contenido
    var hasContent = w.title || w.description || (assets.length) ||
      (w.activities && w.activities.length) || (w.videos && w.videos.length) ||
      (w.links && w.links.length);
    if (!hasContent) {
      h += '<section class="content-section"><p class="week-msg" style="font-style:italic">Esta semana aún no tiene contenido disponible.</p></section>';
    }

    main.innerHTML = h;
  }

  /* ═══════════════════════════════════════════════════
     HELPERS
     ═══════════════════════════════════════════════════ */

  function buildDocumentGroups(assets) {
    var groups = {};
    assets.forEach(function (a) {
      if (!a.document_group || a.file_type === 'image') return;
      if (!groups[a.document_group]) {
        groups[a.document_group] = {
          title: a.document_group,
          description: a.description || '',
          files: []
        };
      }
      groups[a.document_group].files.push(a);
    });
    return Object.keys(groups).map(function (k) { return groups[k]; });
  }

  function renderDownloadCard(f) {
    var url = resolveUrl(f.storage_path);
    var icon = 'fa-file', color = 'var(--color-muted)';
    if (f.file_type === 'pdf')  { icon = 'fa-file-pdf';    color = '#e74c3c'; }
    if (f.file_type === 'word') { icon = 'fa-file-word';   color = '#2b579a'; }
    if (f.file_type === 'zip')  { icon = 'fa-file-zipper'; color = '#f39c12'; }

    return '<a href="' + url + '" download class="download-card">' +
      '<i class="fa-solid ' + icon + '" style="font-size:1.8rem;color:' + color + '"></i>' +
      '<div class="download-info">' +
      '<span class="download-name">' + (f.display_name || f.file_name) + '</span>' +
      '<span class="download-meta">' + f.file_type.toUpperCase() + ' · Descargar</span>' +
      '</div></a>';
  }

  // Boot
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadWeek);
  } else {
    loadWeek();
  }
})();
