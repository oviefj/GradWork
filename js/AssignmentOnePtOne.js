import * as THREE from '../build/three.module.js';
import { OrbitControls } from './jsm/controls/OrbitControls.js';

let camera, scene, renderer;
let cameraControls;

function createScene() {
  const polygon = regularPolygonMesh(8, 5, new THREE.Color(0x0000ff), new THREE.Color(0xff0000)); 
  scene.add(polygon);
}

function regularPolygonMesh(n, rad, innerColor, outerColor) {
  const geometry = new THREE.BufferGeometry();

  // Arrays to hold the vertices, colors, and indices
  const positions = [];
  const colors = [];
  const indices = [];

  // Add the center vertex (the origin)
  positions.push(0, 0, 0);
  colors.push(innerColor.r, innerColor.g, innerColor.b); 
  
  // Calculate the other vertices
  for (let i = 0; i < n; i++) {
    const angle = (i / n) * Math.PI * 2;
    const x = rad * Math.cos(angle);
    const y = rad * Math.sin(angle);

    // Add vertex positions 
    positions.push(x, y, 0);

    const distance = Math.sqrt(x * x + y * y);
    const normalizedDistance = distance / rad;

    // Interpolate color between inner and outer color based on the distance
    const color = innerColor.clone().lerp(outerColor, 1.75 - normalizedDistance);
    
    // Add color data for the vertex
    colors.push(color.r, color.g, color.b);
  }

  // Create faces (connect the center vertex to the perimeter vertices)
  for (let i = 1; i < n; i++) {
    indices.push(0, i, i + 1); 
  }
  indices.push(0, n, 1); 

  // Set the geometry attributes
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);

  const material = new THREE.MeshBasicMaterial({
    vertexColors: THREE.VertexColors, 
    side: THREE.DoubleSide
  });

  return new THREE.Mesh(geometry, material);
}

function init() {
  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  window.addEventListener('resize', onWindowResize, false);
  renderer.setAnimationLoop(function () {
    cameraControls.update();
    renderer.render(scene, camera);
  });

  let canvasRatio = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera(40, canvasRatio, 1, 1000);
  camera.position.set(0, 0, 30);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  cameraControls = new OrbitControls(camera, renderer.domElement);
  cameraControls.enableDamping = true;
  cameraControls.dampingFactor = 0.04;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

init();
createScene();
