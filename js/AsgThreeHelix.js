/*
The helix will rotate slowly automatically.
The user can move the helix by click-n-drag.
Also, the user can zoom in/out of the helix, all while it slowly rotates on its own.
*/
import * as THREE from '../build/three.module.js';
import { OrbitControls } from './jsm/controls/OrbitControls.js'; 


let scene, camera, renderer, controls;

function init() {
  
  scene = new THREE.Scene();

  
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 10; 

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);

  document.body.appendChild(renderer.domElement);


  const ambientLight = new THREE.AmbientLight(0x404040); 
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(5, 5, 5).normalize();
  scene.add(dirLight);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; 
  controls.dampingFactor = 0.25; 
  controls.screenSpacePanning = false;

  window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}


function createHelix(object, n, radius, angle, dist) {
  const group = new THREE.Group(); 

  for (let i = 0; i < n; i++) {
    const clone = object.clone(); 
    

    const x = radius * Math.cos(i * angle); 
    const y = radius * Math.sin(i * angle); 
    const z = i * dist; 
    clone.position.set(x, y, z);

    group.add(clone);
  }

  return group; 
}


function animate() {
  requestAnimationFrame(animate); 

  controls.update();

  scene.rotation.y += 0.001; 

  renderer.render(scene, camera); 
}

function start() {

  init();

  const mat = new THREE.MeshLambertMaterial({ color: 'blue' });
  const geom = new THREE.SphereGeometry(1, 12, 12); 
  const mesh = new THREE.Mesh(geom, mat); 
  const helix = createHelix(mesh, 49, 2, Math.PI / 4, 0.5);

  scene.add(helix);

  animate();
}

start();
