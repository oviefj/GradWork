/*
This program showcases a sequence of boxes of random colors and sizes.
The user can modify the number of boxes, height, and size.
By clicking individual boxes, the colors change randomly as well.
*/


import * as THREE from '../build/three.module.js';
import { OrbitControls } from './jsm/controls/OrbitControls.js';
import * as dat from '../lib/dat.gui.module.js';

let scene, camera, renderer, controls;
let floor;
let boxes = [];

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);

  createScene();

  camera.position.set(0, 150, 250);
  camera.lookAt(0, 0, 0);

  window.addEventListener('resize', onWindowResize, false);
  document.addEventListener('click', onMouseClick, false);

  initGUI();

  animate();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
}

function render() {
  renderer.render(scene, camera);
}

function createScene() {
    
    const floorGeometry = new THREE.PlaneGeometry(200, 200);
    const floorMaterial = new THREE.MeshBasicMaterial({ color: 0x888888 }); 
    floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);
  
  
    const ambientLight = new THREE.AmbientLight(0xf4fdff);
    scene.add(ambientLight);
  
    const directionalLight = new THREE.DirectionalLight(0xf4fdff, 0.5);
    directionalLight.position.set(50, 100, 50); 
    scene.add(directionalLight);
  
    randomBoxes(100, 5, 20, 5, 60);
  }

  function randomBoxes(nbrBoxes, minSide, maxSide, minHeight, maxHeight) {
    boxes = [];
  
    function randomFloat(min, max) {
      return Math.random() * (max - min) + min;
    }
  
    function randomHSLColor() {
      const h = Math.random();
      const s = randomFloat(0.8, 0.95);
      const l = randomFloat(0.3, 0.7);
      return new THREE.Color().setHSL(h, s, l);
    }
  
    for (let i = 0; i < nbrBoxes; i++) {
      const width = randomFloat(minSide, maxSide);
      const depth = randomFloat(minSide, maxSide);
      const height = randomFloat(minHeight, maxHeight);
  
      const geometry = new THREE.BoxGeometry(width, height, depth);
      const color = randomHSLColor();
      const material = new THREE.MeshBasicMaterial({ color: color, opacity: 0.8, transparent: true }); 
      const box = new THREE.Mesh(geometry, material);
  
      const x = randomFloat(-100 + width / 2, 100 - width / 2);
      const z = randomFloat(-100 + depth / 2, 100 - depth / 2);
      const y = height / 2;
  
      box.position.set(x, y, z);
      scene.add(box);
      boxes.push(box);
    }
  }

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  render();
}

function initGUI() {
  const gui = new dat.GUI();
  const params = {
    nbrBoxes: 100,
    minSide: 5,
    maxSide: 20,
    minHeight: 5,
    maxHeight: 60,
    redraw: function() {
      scene.children.filter(obj => obj.type === "Mesh" && obj !== floor).forEach(obj => scene.remove(obj));
      randomBoxes(params.nbrBoxes, params.minSide, params.maxSide, params.minHeight, params.maxHeight);
    }
  };

  gui.add(params, 'nbrBoxes', 1, 200, 1).onChange(params.redraw);
  gui.add(params, 'minSide', 1, 50, 1).onChange(params.redraw);
  gui.add(params, 'maxSide', 1, 50, 1).onChange(params.redraw);
  gui.add(params, 'minHeight', 1, 100, 1).onChange(params.redraw);
  gui.add(params, 'maxHeight', 1, 100, 1).onChange(params.redraw);
}

function onMouseClick(event) {
  const mouse = new THREE.Vector2();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(boxes);

  if (intersects.length > 0) {
    const clickedBox = intersects[0].object;
    clickedBox.material.color.set(Math.random() * 0xffffff);
  }
}

init();