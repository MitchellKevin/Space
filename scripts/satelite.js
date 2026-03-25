
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
  camera.position.set(3, 1.5, 3);

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
  controls.autoRotate      = true;
  controls.autoRotateSpeed = 0.6;
  controls.minDistance     = 1;
  controls.maxDistance     = 20;
  controls.enablePan       = false;

  // ── GLB laden ──────────────────────────────────────────────────────────────
  const loader = new THREE.GLTFLoader();

  // 👇 Verander dit pad naar jouw .glb bestand
  loader.load(
  `./models/sateliet/Satteliet_v8.glb`,


    (gltf) => {
      const model = gltf.scene;

      // Auto-centreer en schaal het model
      const box    = new THREE.Box3().setFromObject(model);
      const size   = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale  = 2.5 / maxDim;

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

  // ── Render loop ────────────────────────────────────────────────────────────
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

})();