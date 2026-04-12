import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.183.2/build/three.module.js";
//import Orbit Controls - Orbit controls allow the camera to orbit around a target.
import { OrbitControls } from 'https://unpkg.com/three@0.112/examples/jsm/controls/OrbitControls.js';

// Function to get URL parameters
function getUrlParameter(name) {
    name = name.replace(/[[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Initialize Three.js scene
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Get the image URL from the URL parameter, this allows you to reuse the same HTML file e.g http://yourwebsite.com/your_viewer.html?image=https://your-s3-bucket.s3.amazonaws.com/360image.jpg
//var imageUrl = getUrlParameter('image');
var imageUrl = getUrlParameter('image') || 'images/IMG_20260317_104907_00_010.jpg';
// Load 360 image texture
var texture = new THREE.TextureLoader().load(imageUrl);

// Create a sphere geometry to map the 360 image onto
var geometry = new THREE.SphereGeometry(500, 60, 40);
var material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
var sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

// Set camera position
camera.position.set(0, 0, 0.1);

// Add OrbitControls from the module
var controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = false; // Disable zooming, you can enable it if needed

// Render loop
function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Update controls
    renderer.render(scene, camera);
}

animate();
