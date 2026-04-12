import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

// ---------------------------
// Helpers
// ---------------------------
function getUrlParameter(name) {
  const url = new URL(window.location.href);
  const value = url.searchParams.get(name);
  return value ? decodeURIComponent(value) : "";
}

// ---------------------------
// Config (tweak these)
// ---------------------------
const DEFAULT_IMAGE = "images/IMG_20260317_104907_00_010.jpg";

// "Zoom out" defaults (bigger FOV = more zoomed out)
const FOV_START = 95;    // try 90..105
const FOV_MIN = 40;      // smaller = zoom in limit
const FOV_MAX = 110;     // larger = zoom out limit
const FOV_STEP = 2;      // wheel sensitivity

// Sphere settings
const SPHERE_RADIUS = 1000;
const SPHERE_WIDTH_SEGMENTS = 60;
const SPHERE_HEIGHT_SEGMENTS = 40;

// ---------------------------
// Scene / Camera / Renderer
// ---------------------------
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  FOV_START,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
);
// Inside the sphere, near origin
camera.position.set(0, 0, 0.1);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.style.margin = "0";
document.body.appendChild(renderer.domElement);

// ---------------------------
// Controls
// ---------------------------
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;

// For pano viewers: rotate only, we handle zoom via FOV
controls.enableZoom = false;
controls.enablePan = false;

// Optional: limit vertical rotation so you can’t flip upside down
controls.minPolarAngle = 0.05;
controls.maxPolarAngle = Math.PI - 0.05;

// ---------------------------
// Load texture and create sphere
// ---------------------------
const imageUrl = getUrlParameter("image") || DEFAULT_IMAGE;

const loader = new THREE.TextureLoader();
loader.crossOrigin = "anonymous"; // safe default for CDN images

loader.load(
  imageUrl,
  (texture) => {
    // Improve quality for pano textures
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

    // Create a sphere and flip it inside-out
    const geometry = new THREE.SphereGeometry(
      SPHERE_RADIUS,
      SPHERE_WIDTH_SEGMENTS,
      SPHERE_HEIGHT_SEGMENTS
    );
    geometry.scale(-1, 1, 1); // invert faces so we view from inside

    const material = new THREE.MeshBasicMaterial({ map: texture });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);
  },
  undefined,
  (err) => {
    console.error("Failed to load texture:", imageUrl, err);
  }
);

// ---------------------------
// FOV “zoom” with mouse wheel
// ---------------------------
window.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    const direction = Math.sign(e.deltaY);
    camera.fov = THREE.MathUtils.clamp(
      camera.fov + direction * FOV_STEP,
      FOV_MIN,
      FOV_MAX
    );
    camera.updateProjectionMatrix();
  },
  { passive: false }
);

// ---------------------------
// Resize handler
// ---------------------------
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ---------------------------
// Render loop
// ---------------------------
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
