// Import van Three.js en helpers (via CDN)
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/RGBELoader.js";

// Maak een nieuwe scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(
  75, // field of view (hoe "wijd" je kijkt)
  window.innerWidth / window.innerHeight, // aspect ratio
  0.1, // dichtbij clippen
  1000 // ver clippen
);

// Variabelen voor object en controls
let object;
let controls;


// Naam van de map waarin je model zit
let objToRender = 'sateliet';

// Loader voor .gltf en .glb bestanden
const loader = new GLTFLoader();

// Laad het 3D model (.glb bestand)
loader.load(
  `./models/${objToRender}/Satteliet_v8.glb`, // pad naar je model

  function (gltf) {
    // Wordt uitgevoerd als het model geladen is

    object = gltf.scene; // pak de scene uit het bestand
    scene.add(object);   // voeg het model toe aan je scene

    // Pas schaal aan (handig als model te groot/klein is)
    object.scale.set(5, 5, 5);

    // Eventueel positie aanpassen
    object.position.set(0, -5, 0);
  },

  function (error) {
    // Error handling
    console.error('Fout bij laden van model:', error);
  }
);

// Renderer (dit tekent alles op het scherm)
const renderer = new THREE.WebGLRenderer({ alpha: true });

// Stel grootte in (fullscreen)
renderer.setSize(window.innerWidth, window.innerHeight);

// Voeg canvas toe aan HTML (div met id "container3D")
document.getElementById("container3D").appendChild(renderer.domElement);

// Zet camera iets naar achter zodat je het model ziet
camera.position.z = 25;

// Licht van boven (Directional light)
const topLight = new THREE.DirectionalLight(0xffffff, 1);
topLight.position.set(0, 500, 500);
scene.add(topLight);

// Ambient light (algemene verlichting)
const ambientLight = new THREE.AmbientLight(0x333333, 20);
scene.add(ambientLight);

// Controls om met muis te roteren/zoomen
controls = new OrbitControls(camera, renderer.domElement);

// Animatie loop (wordt elke frame uitgevoerd)
function animate() {
  requestAnimationFrame(animate);

  // Render de scene vanuit de camera
  renderer.render(scene, camera);
}

// Zorg dat alles schaalt bij resize van het scherm
window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start de animatie
animate();