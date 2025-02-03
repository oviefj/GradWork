/*
THIS CODE IS BASED ON sierpinskiTetrahedron.js
Main changes I did was remove the selection of other shapes.
Toggle button to enable rotation.
Toggle button for random colors.
Scaling for rotation speed
*/


import * as THREE from '../build/three.module.js';
import { OrbitControls } from './jsm/controls/OrbitControls.js'; 
import * as dat from '../lib/dat.gui.module.js';

let scene, camera, renderer, cameraControls;
let snowflake; 
let materials; 

function init() {
    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement); 

    window.addEventListener('resize', onWindowResize, false);
    renderer.setAnimationLoop(function () {
        render();
    });

    let canvasRatio = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(40, canvasRatio, 1, 1000); 
    camera.position.set(0, 1, 4); 
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    cameraControls = new OrbitControls(camera, renderer.domElement); 
    cameraControls.enableDamping = true;
    cameraControls.dampingFactor = 0.04;

 
    let light = new THREE.PointLight(0xFFFFFF, 1.0, 1000);
    light.position.set(10, 20, 20);
    let light2 = new THREE.PointLight(0xFFFFFF, 1.0, 1000);
    light2.position.set(-20, -20, -20);
    let light3 = new THREE.PointLight(0xFFFFFF, 1.0, 1000);
    light3.position.set(0, 40, 0);
    let ambientLight = new THREE.AmbientLight(0x222222);
    scene.add(light);
    scene.add(light2);
    scene.add(light3);
    scene.add(ambientLight);

    materials = [];
    for (let i = 0; i <= 5 + 1; i++) { 
        materials.push(new THREE.MeshPhongMaterial({
            color: new THREE.Color(0xffa500), 
            shininess: 80,
            transparent: true,
            opacity: 1.0, 
            side: THREE.FrontSide
        }));
    }

    initGui();
    update();   
}

function makeSnowflake(level, scale, geom) {
    if (level === 0) {
        return new THREE.Mesh(geom, materials[0]);
    } else {
        let root = new THREE.Object3D();
        root.scale.set(scale, scale, scale);
        let tf = (1 - scale) / scale;
        for (let v of geom.vertices) {
            let root2 = new THREE.Object3D();
            let v2 = v.clone().multiplyScalar(tf);
            root2.position.set(v2.x, v2.y, v2.z);
            root2.add(makeSnowflake(level - 1, scale, geom));
            root.add(root2);
        }
        return root;
    }
}

// Tetrahedron Geometry only, eliminated the other shapes
const tetrahedronGeom = new THREE.TetrahedronGeometry(1); 

var controls = new function () {
    this.nbrLevels = 1;
    this.Scale = 0.5;
    this.Opacity = 1.0;
    this.color = '#4830ff';
    this.randomColors = false; 
    this.rotationEnabled = false;
    this.rotationSpeed = 0.01;

};

function initGui() {
    var gui = new dat.GUI();
    gui.add(controls, 'nbrLevels', 0, 5).name('Level').step(1).onChange(update);
    gui.add(controls, 'Scale', 0.1, 0.9).step(0.01).onChange(update);

    let f1 = gui.addFolder('Appearance');
    f1.open();
    f1.addColor(controls, 'color').onChange(update); 
    f1.add(controls, 'randomColors').name('Random Colors').onChange(update);
    f1.add(controls, 'Opacity', 0.1, 1.0).step(0.1).onChange(update);
    gui.add(controls, 'rotationEnabled').name('Enable Rotation');
    gui.add(controls, 'rotationSpeed', 0, 0.1, 0.001).name('Rotation Speed');

}

function update() {
    if (snowflake) scene.remove(snowflake);

  
    let color = controls.randomColors ? new THREE.Color(`hsl(${Math.random() * 360}, 100%, 50%)`) : new THREE.Color(controls.color);
    for (let mat of materials) {
        mat.color = color;
        mat.opacity = controls.Opacity;
    }

    snowflake = makeSnowflake(controls.nbrLevels, controls.Scale, tetrahedronGeom);
    scene.add(snowflake);
}


function render() {
    var delta = new THREE.Clock().getDelta(); 
    cameraControls.update(delta);

    if (controls.rotationEnabled) {
        snowflake.rotation.y += controls.rotationSpeed; 
    }

    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

init();