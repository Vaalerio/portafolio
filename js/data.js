/**
 * data.js
 * ─────────────────────────────────────────────────────
 * Estructura del curso y gestión de datos.
 * Para agregar contenido de una semana, edita el array
 * INITIAL_DATA o usa el panel de administrador.
 *
 * Cada entrada tiene la forma:
 * {
 *   unit:        número de unidad (1–4),
 *   week:        número de semana (1–16),
 *   title:       título del tema (ej: "Semana 01 - Resumen de Arquitectura de Software"),
 *   summary:     resumen corto de máximo 15 palabras,
 *   description: resumen extenso de la clase,
 *   image:       ruta relativa a la imagen (ej: "assets/images/semana1.jpg") o "",
 *   file:        nombre del archivo adjunto (ej: "semana1-apuntes.pdf") o "",
 *   link:        URL externa o ""
 * }
 * ─────────────────────────────────────────────────────
 */

const UNITS_CONFIG = [
  { num: 1, name: "Unidad 1 — Fundamentos", color: "var(--unit1)", weeks: [1, 2, 3, 4] },
  { num: 2, name: "Unidad 2 — Patrones", color: "var(--unit2)", weeks: [5, 6, 7, 8] },
  { num: 3, name: "Unidad 3 — Diseño", color: "var(--unit3)", weeks: [9, 10, 11, 12] },
  { num: 4, name: "Unidad 4 — Proyecto Final", color: "var(--unit4)", weeks: [13, 14, 15, 16] },
];

/**
 * INITIAL_DATA
 * ─────────────────────────────────────────────────────
 * Agrega aquí el contenido de cada semana.
 * El campo `summary` es lo que se muestra en la tarjeta
 * de la cuadrícula principal (máximo ~15 palabras).
 * ─────────────────────────────────────────────────────
 */
const INITIAL_DATA = [
  {
    unit: 1, week: 1,
    title: "Semana 01 - Resumen de Arquitectura de Software",
    summary: "Presentación del curso, concepto de arquitectura de software y su importancia en el desarrollo.",
    description: "Presentación del curso, objetivos y metodología. Concepto de arquitectura de software: qué es, por qué importa y cómo se diferencia del diseño.",
    image: "assets/images/Sem01_imagen_portada.png",
    file: "Sem01_Arquitectura_de_Software_Resumen.pdf",
    link: ""
  },
  {
    unit: 1, week: 2,
    title: "Semana 02 - Importancia de los estándares en la arquitectura de software",
    summary: "Normas internacionales, modelos de calidad y buenas prácticas aplicadas a arquitectura de software.",
    description: "Importancia de los estándares en arquitectura de software: normas internacionales, modelos de calidad, procesos y buenas prácticas en desarrollo.",
    image: "assets/images/Sem02_imagen_portada.png",
    file: "",
    link: ""
  },

  // ── Semanas vacías — edítalas conforme avance el curso ──
  {
    unit: 1, week: 3,
    title: "Semana 03 - Diseño del Sistema (SDD)",
    summary: "Documento de diseño del sistema, mapas conceptuales y diagramas de arquitectura de software.",
    description: "Elaboración del documento SDD (Software Design Document), mapas conceptuales y diagramas de arquitectura de software.",
    image: "assets/images/Sem03_mapa_1.jpg",
    file: "Sem03_1777402809247-SDD_dise_o_del_sistema.pdf",
    link: ""
  },
  { unit: 1, week: 4, title: "", summary: "", description: "", image: "", file: "", link: "" },
  { unit: 2, week: 5, title: "", summary: "", description: "", image: "", file: "", link: "" },
  { unit: 2, week: 6, title: "", summary: "", description: "", image: "", file: "", link: "" },
  { unit: 2, week: 7, title: "", summary: "", description: "", image: "", file: "", link: "" },
  { unit: 2, week: 8, title: "", summary: "", description: "", image: "", file: "", link: "" },
  { unit: 3, week: 9, title: "", summary: "", description: "", image: "", file: "", link: "" },
  { unit: 3, week: 10, title: "", summary: "", description: "", image: "", file: "", link: "" },
  { unit: 3, week: 11, title: "", summary: "", description: "", image: "", file: "", link: "" },
  { unit: 3, week: 12, title: "", summary: "", description: "", image: "", file: "", link: "" },
  { unit: 4, week: 13, title: "", summary: "", description: "", image: "", file: "", link: "" },
  { unit: 4, week: 14, title: "", summary: "", description: "", image: "", file: "", link: "" },
  { unit: 4, week: 15, title: "", summary: "", description: "", image: "", file: "", link: "" },
  { unit: 4, week: 16, title: "", summary: "", description: "", image: "", file: "", link: "" },
];

/* ─── Storage helpers ──────────────────────────────── */
const STORAGE_KEY = "arqsw_portfolio_v2";

/** Normaliza rutas guardadas con typo o espacios (p. ej. desde el panel admin). */
function _coalesceWeekImage(weekNum, storedImage, seedImage) {
  const raw = (storedImage || "").trim().replace(/\\/g, "/");
  if (!raw) return (seedImage || "").trim();
  const lower = raw.toLowerCase();
  const isWeek2 = Number(weekNum) === 2;
  const looksLikeSem02Cover =
    isWeek2 &&
    lower.includes("sem02") &&
    lower.includes("portada") &&
    (/\s/.test(raw) || lower.includes("imagen portada") || !lower.includes("sem02_imagen"));
  if (looksLikeSem02Cover && seedImage) return seedImage.trim();
  return raw;
}

function _mergeWeekItem(seed, stored) {
  if (!seed && !stored) return null;
  if (!stored) return { ...seed };
  if (!seed) return { ...stored };
  const merged = { ...seed, ...stored };
  merged.week = seed.week;
  merged.unit = stored.unit || seed.unit;
  merged.image = _coalesceWeekImage(merged.week, merged.image, seed.image);
  return merged;
}

const Data = {
  /** Devuelve el mapa de datos (week → item) */
  load() {
    const seedMap = {};
    INITIAL_DATA.forEach(item => { seedMap[item.week] = item; });

    let storedMap = {};
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) storedMap = JSON.parse(stored);
    } catch (e) { }

    if (!Object.keys(storedMap).length) return { ...seedMap };

    const out = {};
    for (let w = 1; w <= 16; w++) {
      const stored = storedMap[w] ?? storedMap[String(w)];
      out[w] = _mergeWeekItem(seedMap[w], stored);
    }
    return out;
  },

  /** Guarda el mapa completo */
  save(map) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  },

  /** Devuelve un item por número de semana */
  getWeek(weekNum) {
    const map = this.load();
    return map[weekNum] || null;
  },

  /** Guarda o actualiza una semana */
  setWeek(item) {
    const map = this.load();
    map[item.week] = item;
    this.save(map);
  },

  /** Elimina el contenido de una semana (deja vacía) */
  clearWeek(weekNum) {
    const map = this.load();
    if (map[weekNum]) {
      map[weekNum] = { ...map[weekNum], title: "", summary: "", description: "", image: "", file: "", link: "" };
      this.save(map);
    }
  },

  /** Devuelve array ordenado de semanas con contenido */
  getFilledWeeks() {
    const map = this.load();
    return Object.values(map)
      .filter(i => i.title && i.title.trim())
      .sort((a, b) => a.week - b.week);
  },

  /** Devuelve array de todas las semanas (1–16) */
  getAllWeeks() {
    const map = this.load();
    const all = [];
    for (let w = 1; w <= 16; w++) {
      all.push(map[w] || { unit: Math.ceil(w / 4), week: w, title: "", summary: "", description: "", image: "", file: "", link: "" });
    }
    return all;
  },

  /** Devuelve array de todas las semanas de una unidad */
  getUnitWeeks(unitNum) {
    const unit = UNITS_CONFIG.find(u => u.num === unitNum);
    if (!unit) return [];
    const map = this.load();
    return unit.weeks.map(w => map[w] || { unit: unitNum, week: w, title: "", summary: "", description: "", image: "", file: "", link: "" });
  }
};
