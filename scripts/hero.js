// ── Scene ──────────────────────────────────────────────────────────────
    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 1000);
    camera.position.z = 2.5;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(innerWidth, innerHeight);
    document.body.appendChild(renderer.domElement);

    // ── Controls ───────────────────────────────────────────────────────────
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping  = true;
    controls.dampingFactor  = 0.05;
    controls.minDistance    = 1.3;
    controls.maxDistance    = 6;
    controls.autoRotate     = true;
    controls.autoRotateSpeed = 0.1;

    // ── Sterrenachtergrond ─────────────────────────────────────────────────
    const starGeo = new THREE.BufferGeometry();
    const starCount = 6000;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) {
      starPos[i] = (Math.random() - 0.5) * 400;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.15, sizeAttenuation: true });
    scene.add(new THREE.Points(starGeo, starMat));

    // ── Aardbol ────────────────────────────────────────────────────────────
    const earthGeo = new THREE.SphereGeometry(1, 64, 64);

    // Texturen via publieke NASA/NASA-style CDN
    const loader = new THREE.TextureLoader();

    const earthMat = new THREE.MeshPhongMaterial({
      map:          loader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg'),
      specularMap:  loader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_specular_2048.jpg'),
      normalMap:    loader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_normal_2048.jpg'),
      specular:     new THREE.Color(0x333333),
      shininess:    15,
    });

    const earth = new THREE.Mesh(earthGeo, earthMat);
    scene.add(earth);

    // ── Wolken ─────────────────────────────────────────────────────────────
    const cloudGeo = new THREE.SphereGeometry(1.01, 64, 64);
    const cloudMat = new THREE.MeshPhongMaterial({
      map:         loader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_1024.png'),
      transparent: true,
      opacity:     0.35,
      depthWrite:  false,
    });
    const clouds = new THREE.Mesh(cloudGeo, cloudMat);
    scene.add(clouds);

    // ── Atmosfeer gloed ────────────────────────────────────────────────────
    const atmGeo = new THREE.SphereGeometry(1.05, 64, 64);
    const atmMat = new THREE.MeshPhongMaterial({
      color:       0x4488ff,
      transparent: true,
      opacity:     0.08,
      side:        THREE.FrontSide,
      depthWrite:  false,
    });
    scene.add(new THREE.Mesh(atmGeo, atmMat));

    // ── Verlichting ────────────────────────────────────────────────────────
    // Zon-licht (zon staat rechts-voor)
    const sunLight = new THREE.DirectionalLight(0xfff5e0, 1.8);
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);

    // Zwak ambient voor de donkere kant
    scene.add(new THREE.AmbientLight(0x112244, 0.6));

    // ── Resize ─────────────────────────────────────────────────────────────
    window.addEventListener('resize', () => {
      camera.aspect = innerWidth / innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(innerWidth, innerHeight);
    });

    // ── Animatie ───────────────────────────────────────────────────────────
    (function animate() {
      requestAnimationFrame(animate);
      clouds.rotation.y += 0.00015;   // wolken draaien iets sneller
      controls.update();
      renderer.render(scene, camera);
    })();