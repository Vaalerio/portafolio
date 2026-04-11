# Portafolio · Arquitectura de Software
**Autor:** Valerio

---

## Estructura del proyecto

```
portafolio/
│
├── index.html              ← Página principal (abre esto en el navegador)
│
├── css/
│   ├── reset.css           ← Normalización de estilos
│   ├── variables.css       ← Tokens de diseño (colores, fuentes, espaciados)
│   ├── layout.css          ← Header, footer, main, estructura general
│   ├── components.css      ← Botones, campos, cards, toast
│   ├── portfolio.css       ← Home y vista pública del portafolio
│   ├── admin.css           ← Panel de administrador
│   └── responsive.css      ← Media queries
│
├── js/
│   ├── data.js             ← Estructura del curso y manejo de datos
│   ├── ui.js               ← Helpers de interfaz (navegación, toast)
│   ├── admin.js            ← Lógica del panel admin
│   ├── portfolio.js        ← Renderizado de la vista pública
│   └── app.js              ← Punto de entrada, autenticación, routing
│
├── assets/
│   └── images/             ← Pon aquí las imágenes de cada semana
│       └── (semana1.jpg, semana2.jpg, ...)
│
└── README.md               ← Este archivo
```

---

## Cómo usar

### 1. Abrir el proyecto
Abre `index.html` directamente en tu navegador.  
No necesitas servidor ni instalación.

### 2. Acceso administrador
- **Usuario:** `admin`
- **Contraseña:** `1234`

### 3. Agregar contenido de una semana
Opción A — **Desde el panel admin** (recomendado para pruebas):
1. Inicia sesión como administrador.
2. Selecciona unidad y semana.
3. Rellena el formulario y guarda.

Opción B — **Directamente en el código** (persistente, recomendado):
1. Abre `js/data.js`.
2. Edita el array `INITIAL_DATA`.
3. Rellena `title`, `description`, `image`, `file` y `link` de la semana.

> **Importante:** los datos guardados desde el panel admin se almacenan en
> `localStorage` del navegador. Para que sean permanentes en el código,
> copia los datos al array `INITIAL_DATA` en `data.js`.

### 4. Agregar imágenes
1. Guarda la imagen en `assets/images/`, por ejemplo `semana3.jpg`.
2. En el campo "Imagen" del admin (o en `data.js`) escribe: `assets/images/semana3.jpg`.

### 5. Agregar archivos adjuntos
1. Guarda el archivo en `assets/`, por ejemplo `semana3-apuntes.pdf`.
2. En el campo "Archivo adjunto" escribe: `semana3-apuntes.pdf`.

---

## Actualizar el curso semana a semana con Claude

Cada semana puedes pedirle a Claude que te ayude a redactar el contenido:

> "Ayúdame a escribir el resumen de la semana 5 de Arquitectura de Software.
> El tema fue Patrones de Diseño: Singleton, Factory y Observer.
> Dame título y descripción lista para pegar en data.js."

Claude te devolverá el bloque listo para copiar en `INITIAL_DATA`.

---

## Personalización

### Cambiar nombre de las unidades
Edita el array `UNITS_CONFIG` en `js/data.js`:
```javascript
{ num: 1, name: "Unidad 1 — Fundamentos", ... }
```

### Cambiar colores de las unidades
Edita las variables en `css/variables.css`:
```css
--unit1: #d97757;
--unit2: #6a9bcc;
```

### Cambiar credenciales de admin
Edita en `js/app.js`:
```javascript
const AUTH_ADMIN = { user: "admin", pass: "1234" };
```

---

## Fuentes utilizadas
- **Cormorant Garamond** — títulos (display)
- **DM Sans** — cuerpo de texto

Cargadas desde Google Fonts, requieren conexión a internet la primera vez.
