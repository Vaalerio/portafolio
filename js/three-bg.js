/**
 * three-bg.js
 * ─────────────────────────────────────────────────────
 * Fondo WebGL (Three.js): torus knot + estrellas.
 * Tema: updateTheme() según body.dark vía getIsDark().
 * Transición suave entre paletas (lerp en animate).
 */
(function () {
  var THEME_LERP = 0.12;

  function initThreeBackground(container, getIsDark) {
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const geometry = new THREE.TorusKnotGeometry(10, 3, 64, 8);

    const material = new THREE.MeshBasicMaterial({
      color: 0x8e8d88,
      wireframe: true,
      transparent: true,
      opacity: 0.1
    });

    const torusKnot = new THREE.Mesh(geometry, material);
    scene.add(torusKnot);

    const starGeometry = new THREE.BufferGeometry();

    const starMaterial = new THREE.PointsMaterial({
      color: 0x555555,
      size: 1.8,
      transparent: true,
      opacity: 1
    });

    const starVertices = [];

    for (let i = 0; i < 3000; i++) {
      starVertices.push(
        (Math.random() - 0.5) * 2000,
        (Math.random() - 0.5) * 2000,
        (Math.random() - 0.5) * 2000
      );
    }

    starGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(starVertices, 3)
    );

    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    const targetTorus = new THREE.Color();
    const targetStars = new THREE.Color();
    const targetClear = new THREE.Color();
    var targetClearAlpha = 0;

    const curClear = new THREE.Color();
    var curClearAlpha = 0;

    function refreshTargets() {
      const dark = getIsDark();

      if (dark) {
        targetClear.setHex(0x1c1b18);
        targetClearAlpha = 1;
        targetTorus.setHex(0xe6e6e6);
        targetStars.setHex(0xf5f5f5);
      } else {
        targetClear.setHex(0x000000);
        targetClearAlpha = 0;
        targetTorus.setHex(0x8e8d88);
        targetStars.setHex(0x555555);
      }
    }

    function snapToTargets() {
      material.color.copy(targetTorus);
      starMaterial.color.copy(targetStars);
      curClear.copy(targetClear);
      curClearAlpha = targetClearAlpha;
      renderer.setClearColor(curClear, curClearAlpha);
    }

    function updateTheme() {
      refreshTargets();
    }

    function animate() {
      requestAnimationFrame(animate);

      material.color.lerp(targetTorus, THEME_LERP);
      starMaterial.color.lerp(targetStars, THEME_LERP);
      curClear.lerp(targetClear, THEME_LERP);
      curClearAlpha += (targetClearAlpha - curClearAlpha) * THEME_LERP;
      renderer.setClearColor(curClear, curClearAlpha);

      torusKnot.rotation.x += 0.005;
      torusKnot.rotation.y += 0.005;
      stars.rotation.y += 0.0005;

      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener("resize", function onResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    refreshTargets();
    snapToTargets();

    return {
      updateTheme
    };
  }

  function boot() {
    var el = document.getElementById("three-bg");
    if (!el || typeof THREE === "undefined") return;

    window.__threeBgApi = initThreeBackground(el, function getIsDark() {
      return document.body.classList.contains("dark");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
