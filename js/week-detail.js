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

    main.innerHTML = '<div class="week-loading">' +
      '<div class="skeleton skel-title"></div>' +
      '<div class="skeleton skel-text"></div>' +
      '<div class="skeleton skel-text"></div>' +
      '<div class="skeleton skel-text short"></div>' +
      '<br>' +
      '<div style="display:grid; gap:var(--space-md); grid-template-columns:repeat(auto-fit, minmax(200px, 1fr))">' +
      '<div class="skeleton skel-card"></div>' +
      '<div class="skeleton skel-card"></div>' +
      '</div></div>';

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

  async function renderWeek(w, weekNum) {
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
      h += '<section class="content-section reveal" style="--s:' + (sIdx++) + '">';
      h += '<h2 class="section-heading">Resumen de la clase</h2>';
      h += '<p>' + w.description + '</p></section>';
    }

    // ── 3. ACTIVIDADES ──
    if (w.activities && w.activities.length) {
      h += '<section class="content-section reveal" style="--s:' + (sIdx++) + '">';
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
      h += '<section class="content-section reveal" style="--s:' + (sIdx++) + '">';
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
      h += '<section class="content-section reveal" style="--s:' + (sIdx++) + '">';
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
      h += '<section class="content-section reveal" style="--s:' + (sIdx++) + '">';
      h += '<h2 class="section-heading">Material Visual</h2>';
      h += '<div class="image-gallery">';
      images.forEach(function (img, idx) {
        h += '<figure class="gallery-figure">';
        h += '<img src="' + resolveUrl(img.storage_path) + '" alt="' + (img.display_name || img.file_name) + '" loading="lazy" data-gallery-index="' + idx + '" style="cursor:pointer">';
        if (img.description) {
          h += '<figcaption class="gallery-caption">' + img.description + '</figcaption>';
        }
        h += '</figure>';
      });
      h += '</div></section>';
    }

    // ── 6. VIDEOS ──
    if (w.videos && w.videos.length) {
      h += '<section class="content-section reveal" style="--s:' + (sIdx++) + '">';
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
      h += '<section class="content-section reveal" style="--s:' + (sIdx++) + '">';
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
      h += '<section class="content-section reveal" style="--s:' + (sIdx++) + '">';
      h += '<div class="empty-state-card">';
      h += '<i class="fa-solid fa-folder-open"></i>';
      h += '<p>Esta semana aún no tiene contenido publicado.</p>';
      h += '</div></section>';
    }


    main.innerHTML = h;
    initLightbox();
    trackProgress(weekNum);
  }

  function trackProgress(weekNum) {
    if (!weekNum) return;
    var marked = false;
    var progressKey = 'arquitectura_read_weeks';
    
    // Mark immediately if page is short
    setTimeout(function() {
      var docHeight = document.body.scrollHeight;
      if (docHeight <= window.innerHeight * 1.2) {
        markAsRead(weekNum, progressKey);
        marked = true;
      }
    }, 1000);

    window.addEventListener('scroll', function() {
      if (marked) return;
      var scrollPos = window.scrollY + window.innerHeight;
      var docHeight = document.body.scrollHeight;
      
      if (scrollPos > docHeight * 0.65) {
        markAsRead(weekNum, progressKey);
        marked = true;
      }
    }, { passive: true });
  }

  function markAsRead(weekNum, key) {
    try {
      var readWeeks = JSON.parse(localStorage.getItem(key) || '[]');
      if (readWeeks.indexOf(weekNum) === -1) {
        readWeeks.push(weekNum);
        localStorage.setItem(key, JSON.stringify(readWeeks));
      }
    } catch(e) {}
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

  /* ═══════════════════════════════════════════════════
     LIGHTBOX
     ═══════════════════════════════════════════════════ */

  var _lbOverlay, _lbImg, _lbCounter, _lbImages = [], _lbIdx = 0;

  function initLightbox() {
    // Collect all gallery images
    _lbImages = Array.from(document.querySelectorAll('[data-gallery-index]'));
    if (!_lbImages.length) return;

    // Create overlay only once
    if (!_lbOverlay) {
      _lbOverlay = document.createElement('div');
      _lbOverlay.className = 'lb-overlay';
      _lbOverlay.innerHTML =
        '<button class="lb-btn lb-close" aria-label="Cerrar">&times;</button>' +
        '<button class="lb-btn lb-prev" aria-label="Anterior">&#8249;</button>' +
        '<button class="lb-btn lb-next" aria-label="Siguiente">&#8250;</button>' +
        '<img class="lb-img" />' +
        '<span class="lb-counter"></span>';
      document.body.appendChild(_lbOverlay);

      _lbImg = _lbOverlay.querySelector('.lb-img');
      _lbCounter = _lbOverlay.querySelector('.lb-counter');

      // Events
      _lbOverlay.querySelector('.lb-close').addEventListener('click', lbClose);
      _lbOverlay.querySelector('.lb-prev').addEventListener('click', function () { lbGo(-1); });
      _lbOverlay.querySelector('.lb-next').addEventListener('click', function () { lbGo(1); });
      _lbOverlay.addEventListener('click', function (e) {
        if (e.target === _lbOverlay) lbClose();
      });
      document.addEventListener('keydown', function (e) {
        if (!_lbOverlay.classList.contains('lb-open')) return;
        if (e.key === 'Escape') lbClose();
        if (e.key === 'ArrowLeft')  lbGo(-1);
        if (e.key === 'ArrowRight') lbGo(1);
      });

      // Swipe support
      var touchStartX = 0;
      _lbOverlay.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });
      
      _lbOverlay.addEventListener('touchend', function(e) {
        if (!_lbOverlay.classList.contains('lb-open') || _lbImages.length <= 1) return;
        var touchEndX = e.changedTouches[0].screenX;
        var diff = touchEndX - touchStartX;
        if (diff > 50) lbGo(-1); // swipe right -> prev
        else if (diff < -50) lbGo(1); // swipe left -> next
      }, { passive: true });
    }

    // Bind click on each image
    _lbImages.forEach(function (img, i) {
      img.addEventListener('click', function () { lbOpen(i); });
    });
  }

  function lbOpen(idx) {
    _lbIdx = idx;
    lbUpdate();
    _lbOverlay.classList.add('lb-open');
    document.body.style.overflow = 'hidden';
  }

  function lbClose() {
    _lbOverlay.classList.remove('lb-open');
    document.body.style.overflow = '';
  }

  function lbGo(dir) {
    _lbIdx = (_lbIdx + dir + _lbImages.length) % _lbImages.length;
    lbUpdate();
  }

  function lbUpdate() {
    _lbImg.src = _lbImages[_lbIdx].src;
    _lbImg.alt = _lbImages[_lbIdx].alt;
    _lbCounter.textContent = (_lbIdx + 1) + ' / ' + _lbImages.length;
    // Hide arrows if only 1 image
    var multi = _lbImages.length > 1;
    _lbOverlay.querySelector('.lb-prev').style.display = multi ? '' : 'none';
    _lbOverlay.querySelector('.lb-next').style.display = multi ? '' : 'none';
    _lbCounter.style.display = multi ? '' : 'none';
  }

  // Boot
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadWeek);
  } else {
    loadWeek();
  }
})();
