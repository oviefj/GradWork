/*
THIS CODE IS BASED ON torusOfStarburst.js
I added animation to the torus.
Can adjust the amount of burst/size by moving the status bar
The speed of the movement of starburst increases/decreases with the amount of starburst in the ring
*/


import * as THREE from '../build/three.module.js';
import { OrbitControls } from './jsm/controls/OrbitControls.js';
import { MyUtils } from '../lib/utilities.js';
import * as dat from '../lib/dat.gui.module.js';

let root;
let camera, scene, renderer;
let cameraControls;

function createScene() {
    update();
}

function getRandomPointOnTorus(majorRad, minorRad) {
    majorRad = majorRad || 2.0;
    minorRad = minorRad || 0.5;
    let u = Math.random() * 2 * Math.PI;
    let v = Math.random() * 2 * Math.PI;
    let x = (majorRad + minorRad * Math.cos(v)) * Math.cos(u);
    let y = (majorRad + minorRad * Math.cos(v)) * Math.sin(u);
    let z = minorRad * Math.sin(v);
    return new THREE.Vector3(x, y, z);
}

function starburstsOnTorus(nbrBursts, majorRad, minorRad, maxRays, burstRadius) {
    let root = new THREE.Object3D();
    
    for (let i = 0; i < nbrBursts; i++) {
        let p = getRandomPointOnTorus(majorRad, minorRad);
        
        // Create the starburst mesh at this position
        let mesh = starburst(maxRays, burstRadius);
        
        // Move the starburst mesh to the torus surface point
        mesh.position.set(p.x, p.y, p.z);

        // Store original position for movement and random angle for initial position
        mesh.originalPosition = mesh.position.clone();
        mesh.angle = Math.random() * Math.PI * 2; 
      
        root.add(mesh);
    }
    
    return root;
}

function starburst(maxRays, burstRadius) {
    let origin = new THREE.Vector3(0, 0, 0); 
    let innerColor = MyUtils.getRandomColor(0.8, 0.1, 0.8);
    let black = new THREE.Color(0x000000);
    let geom = new THREE.Geometry();
    
    let nbrRays = MyUtils.getRandomInt(1, maxRays);
    
    for (let i = 0; i < nbrRays; i++) {
        let angle = Math.random() * 2 * Math.PI;
        let rayLength = burstRadius * MyUtils.getRandomFloat(0.5, 1.0); 
        
        let x = Math.cos(angle) * rayLength;
        let y = Math.sin(angle) * rayLength;
        let z = Math.random() * rayLength - rayLength / 2; 

        let dest = new THREE.Vector3(x, y, z);
        
        geom.vertices.push(origin, dest);
        geom.colors.push(innerColor, black);  
    }
    
    let args = { vertexColors: true, linewidth: 2 };
    let mat = new THREE.LineBasicMaterial(args);
    
    return new THREE.Line(geom, mat, THREE.LineSegments);
}

let controls = new function() {
    this.majRad = 4.0;
    this.minRad = 1.0;
    this.nbrBursts = 400;
    this.burstRadius = 1.0;
    this.maxRays = 100;
    this.Go = update;
}

function initGui() {
    let gui = new dat.GUI();
    gui.add(controls, 'majRad', 2, 5).step(0.1).name('Major radius');
    gui.add(controls, 'minRad', 0.5, 1.5).step(0.1).name('Minor radius');
    gui.add(controls, 'nbrBursts', 5, 2000).step(5).name('Nbr of bursts');
    gui.add(controls, 'burstRadius', 0.1, 5.0).name('Burst radius');
    gui.add(controls, 'maxRays', 5, 200).name('Max nbr of rays');
    gui.add(controls, 'Go');
}

function update() {
    let majRadius = controls.majRad;
    let minRadius = controls.minRad;
    let nbrBursts = controls.nbrBursts;
    let burstRadius = controls.burstRadius;
    let maxRays = controls.maxRays;

    if (root) scene.remove(root);

    // This creates new starbursts on the torus
    root = starburstsOnTorus(nbrBursts, majRadius, minRadius, maxRays, burstRadius);
    scene.add(root);

    // Animate the movement of starbursts in a circular motion like Saturn's rings
    root.children.forEach((starburstMesh) => {

        let angleSpeed = 0.01; 
        starburstMesh.angle += angleSpeed;

        let x = starburstMesh.originalPosition.x * Math.cos(starburstMesh.angle) - starburstMesh.originalPosition.y * Math.sin(starburstMesh.angle);
        let y = starburstMesh.originalPosition.x * Math.sin(starburstMesh.angle) + starburstMesh.originalPosition.y * Math.cos(starburstMesh.angle);

        starburstMesh.position.set(x, y, starburstMesh.originalPosition.z);
    });
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
        update();
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
initGui();
createScene();
