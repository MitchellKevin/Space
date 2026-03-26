
// satelite3D.js — gebruikt globale THREE, OrbitControls en GLTFLoader van CDN
fetch('./models/sateliet/satelite_v8.glb')
  .then(r => console.log('Status:', r.status, r.url))
  .catch(e => console.error('Fetch error:', e));

(function () {
  const canvas   = document.getElementById('sat-canvas');
  const viewer   = document.getElementById('sat-viewer');
  const loading  = document.getElementById('sat-loading');
  const fill     = document.getElementById('sat-fill');
  const loadText = document.getElementById('sat-loading-text');

  if (!canvas || !viewer) return;

  // ── Renderer ───────────────────────────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(viewer.clientWidth, viewer.clientHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = true;

  // ── Scene & Camera ─────────────────────────────────────────────────────────
  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    45,
    viewer.clientWidth / viewer.clientHeight,
    0.01,
    1000
  );
camera.position.set(-2, -1.5, 3);
  // ── Lights ─────────────────────────────────────────────────────────────────
  const sunLight = new THREE.DirectionalLight(0xffe8c0, 2.5);
  sunLight.position.set(5, 8, 5);
  sunLight.castShadow = true;
  scene.add(sunLight);

  const fillLight = new THREE.DirectionalLight(0xa8d8ff, 0.4);
  fillLight.position.set(-5, -2, -5);
  scene.add(fillLight);

  scene.add(new THREE.AmbientLight(0x0a1428, 2));

  const rimLight = new THREE.DirectionalLight(0x7ecfff, 0.6);
  rimLight.position.set(0, -5, -8);
  scene.add(rimLight);

  // ── OrbitControls ──────────────────────────────────────────────────────────
  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping   = true;
  controls.dampingFactor   = 0.06;
  controls.enableZoom = false;
  controls.minDistance     = 4;
  controls.maxDistance     = 4;
  controls.enablePan       = false;

  // ── GLB laden ──────────────────────────────────────────────────────────────
  const loader = new THREE.GLTFLoader();

  loader.load(
  `./models/sateliet/Satteliet_v8.glb`,


    (gltf) => {
      const model = gltf.scene;

      // Auto-centreer en schaal het model
      const box    = new THREE.Box3().setFromObject(model);
      const size   = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale  = 2.6 / maxDim;

      model.scale.setScalar(scale);
      model.position.sub(center.multiplyScalar(scale));

      scene.add(model);

      // Loader verbergen
      if (loading) {
        loading.classList.add('hidden');
        setTimeout(() => { loading.style.display = 'none'; }, 700);
      }
    },

    (xhr) => {
      if (xhr.lengthComputable) {
        const pct = Math.round((xhr.loaded / xhr.total) * 100);
        if (fill)     fill.style.width = pct + '%';
        if (loadText) loadText.textContent = `Loading model — ${pct}%`;
      }
    },

    (err) => {
      console.error('GLB laad fout:', err);
      if (loadText) loadText.textContent = 'Model niet beschikbaar';
    }
  );


  
  // ── Resize ─────────────────────────────────────────────────────────────────
  window.addEventListener('resize', () => {
    camera.aspect = viewer.clientWidth / viewer.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(viewer.clientWidth, viewer.clientHeight);
  });

// Definieer ankerpunten op het model (pas x,y,z aan op jouw model)
const hotspots = [
  { id: 'xray',    label: 'X-ray Instrument',  pos: new THREE.Vector3(0,  0.8,  -.2) },
  { id: 'solar',   label: 'Solar Arrays',       pos: new THREE.Vector3(1, 0,   .5)   },
  { id: 'prop',    label: 'Propulsion',         pos: new THREE.Vector3(0, -0.8,  0)   },
  { id: 'comm',    label: 'Communications',     pos: new THREE.Vector3(0,  0.3, -0.6) },
  { id: 'aocs',    label: 'AOCS',               pos: new THREE.Vector3(-.1, 0.8, .6)  },
];

// Maak HTML knoppen aan
const overlay = document.createElement('div');
overlay.style.cssText = 'position:absolute;inset:0;pointer-events:none;';
viewer.appendChild(overlay);

hotspots.forEach(h => {
  const btn = document.createElement('div');
  btn.id = 'hs-' + h.id;
  btn.innerHTML = `<button>+</button><div class="hs-label">${h.label}</div>`;
  btn.style.cssText = 'position:absolute;pointer-events:auto;transform:translate(-50%,-50%);';
  btn.querySelector('button').addEventListener('click', () => {
    document.getElementById('detail-' + h.id)?.toggleAttribute('open');
  });
  overlay.appendChild(btn);
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);

  // Project elke hotspot naar schermcoördinaten
  hotspots.forEach(h => {
    const btn = document.getElementById('hs-' + h.id);
    if (!btn) return;

    const vec = h.pos.clone().project(camera);
    const x = (vec.x *  0.5 + 0.5) * viewer.clientWidth;
    const y = (vec.y * -0.5 + 0.5) * viewer.clientHeight;

    // Verberg als achter het model (z > 1)
    btn.style.display = vec.z > 1 ? 'none' : 'block';
    btn.style.left = x + 'px';
    btn.style.top  = y + 'px';
  });
}
animate();

})();