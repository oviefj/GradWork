import { OrbitControls } from './jsm/controls/OrbitControls.js';
import * as THREE from '../build/three.module.js';

let camera, scene, renderer;
let cameraControls;

function createScene() {
  const cylinder = createCylinder(8, 5, 10);
  scene.add(cylinder);
}

function createCylinder(n, rad, len) {
  // Arrays to hold the vertex positions and indices
  const topPositions = [];
  const bottomPositions = [];
  const topIndices = [];
  const bottomIndices = [];
  const sideIndices = [];

  // Create the top and bottom vertices of the cylinder
  for (let i = 0; i < n; i++) {
    const angle = (i / n) * Math.PI * 2;
    const x = rad * Math.cos(angle);
    const z = rad * Math.sin(angle);

    // Top face vertex (y = len / 2)
    topPositions.push(x, len / 2, z);

    // Bottom face vertex (y = -len / 2)
    bottomPositions.push(x, -len / 2, z);
  }

  // Create top circle (edges)
  for (let i = 0; i < n; i++) {
    topIndices.push(i, (i + 1) % n);
  }

  // Create bottom circle (edges)
  for (let i = 0; i < n; i++) {
    bottomIndices.push(i, (i + 1) % n); 
  }

  // Create side lines (vertical connections)
  for (let i = 0; i < n; i++) {
    sideIndices.push(i, n + i);
  }

  // Combine all positions into one array for the side geometry
  const positions = [...topPositions, ...bottomPositions];
  const sideGeometry = new THREE.BufferGeometry();
  sideGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  sideGeometry.setIndex(sideIndices);

  // Set up top and bottom circle positions
  const topGeometry = new THREE.BufferGeometry();
  topGeometry.setAttribute('position', new THREE.Float32BufferAttribute(topPositions, 3));
  topGeometry.setIndex(topIndices);

  const bottomGeometry = new THREE.BufferGeometry();
  bottomGeometry.setAttribute('position', new THREE.Float32BufferAttribute(bottomPositions, 3));
  bottomGeometry.setIndex(bottomIndices);
  
  // Create materials for different sections
  const topMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 }); // Red for the top
  const bottomMaterial = new THREE.LineBasicMaterial({ color: 0x0000ff }); // Blue for the bottom
  const sideMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 }); // Green for the sides

  // Create line segments for each part
  const topLine = new THREE.LineSegments(topGeometry, topMaterial);
  const bottomLine = new THREE.LineSegments(bottomGeometry, bottomMaterial);
  const sideLine = new THREE.LineSegments(sideGeometry, sideMaterial);

  // Group all the lines together
  const cylinderGroup = new THREE.Group();
  cylinderGroup.add(topLine, bottomLine, sideLine);

  return cylinderGroup;
}

function init() {
  // Create scene
  scene = new THREE.Scene();

  // Set up the camera
  let canvasRatio = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera(40, canvasRatio, 1, 1000);
  camera.position.set(0, 0, 30); // Adjust camera position to ensure visibility of the bottom
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  // Set up the renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Handle window resizing
  window.addEventListener('resize', onWindowResize, false);

  // Set up the camera controls (OrbitControls)
  cameraControls = new OrbitControls(camera, renderer.domElement);
  cameraControls.enableDamping = true;
  cameraControls.dampingFactor = 0.04;

  // Call the function to create the scene content (e.g., the cylinder)
  createScene();

  // Set up the animation loop
  renderer.setAnimationLoop(() => {
    cameraControls.update(); // Update the controls
    renderer.render(scene, camera); // Render the scene
  });
}

function onWindowResize() {
  // Update the camera aspect ratio when the window is resized
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  // Update the renderer size
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// Initialize the application
init();
