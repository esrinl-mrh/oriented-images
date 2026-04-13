// main.js
// Requires an importmap in index.html mapping:
//   "three" -> https://cdn.jsdelivr.net/npm/three@0.183.2/build/three.module.js
//   "three/addons/" -> https://cdn.jsdelivr.net/npm/three@0.183.2/examples/jsm/
// See: import map guidance for resolving "three" specifiers in the browser. [1](https://sbcode.net/threejs/importmap/)[2](https://discourse.threejs.org/t/how-to-use-addons-in-threejs/57514)

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// ---------------------------
// Settings (tuned defaults)
// ---------------------------
const DEFAULT_IMAGE = "images/IMG_20260317_104907_00_010.jpg";

// Sphere settings
const SPHERE_RADIUS = 500;
const SPHERE_WIDTH_SEGMENTS = 64;
const SPHERE_HEIGHT_SEGMENTS = 32;

// Camera settings
const FOV_START = 95;
const NEAR = 0.1;
const FAR = 2000;

// FOV zoom settings (wheel)
const FOV_MIN = 45;
const FOV_MAX = 110;
const FOV_STEP = 2;

// Controls settings
const DAMPING_FACTOR = 0.08;
const POLAR_EPS = 0.05;

// ---------------------------
// Helpers
// ---------------------------
function getParam(name) {
  const url = new URL(window.location.href);
  const v = url.searchParams.get(name);
  return v ? decodeURIComponent(v) : "";
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

// ---------------------------
// Scene / Camera / Renderer
// ---------------------------
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  FOV_START,
  window.innerWidth / window.innerHeight,
  NEAR,
  FAR
);
camera.position.set(0, 0, 0.1);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

// Ensure full-bleed canvas
document.body.style.margin = "0";
document.body.style.overflow = "hidden";
document.body.appendChild(renderer.domElement);

// ---------------------------
// Controls
// ---------------------------
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = DAMPING_FACTOR;

// Pano-friendly controls: rotate only
controls.enablePan = false;
controls.enableZoom = false; // we zoom via camera.fov

// Prevent flipping over the poles
controls.minPolarAngle = POLAR_EPS;
controls.maxPolarAngle = Math.PI - POLAR_EPS;

// ---------------------------
// Panorama mesh
// ---------------------------
const loader = new THREE.TextureLoader();

const imageUrl = getParam("img") || DEFAULT_IMAGE;
loader.load(
  imageUrl,
  (texture) => {
    texture.colorSpace = THREE.SRGBColorSpace;

    const geometry = new THREE.SphereGeometry(
      SPHERE_RADIUS,
      SPHERE_WIDTH_SEGMENTS,
      SPHERE_HEIGHT_SEGMENTS
    );
    geometry.scale(-1, 1, 1); // view from inside

    const material = new THREE.MeshBasicMaterial({ map: texture });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);
  },
  undefined,
  (err) => console.error("Failed to load texture:", imageUrl, err)
);

// ---------------------------
// Resize handling
// ---------------------------
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ---------------------------
// Wheel zoom (camera.fov)
// ---------------------------
window.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    camera.fov = clamp(camera.fov + Math.sign(e.deltaY) * FOV_STEP, FOV_MIN, FOV_MAX);
    camera.updateProjectionMatrix();
  },
  { passive: false }
);

// ---------------------------
// Render loop
// ---------------------------
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

