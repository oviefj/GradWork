/*
This program is similar to the tori pyramid with some modifications.
Flatten the tori and added some animations.
Created a stardust environment and have the option to disable it.
If the user clicks the sphere, the tori will expand and contract.
Add a ripple speed of the expansion of the tori when it is activated.
Also a camera zoom to mimic a panoramic view from afar.
*/


import * as THREE from '../build/three.module.js';
import { OrbitControls } from './jsm/controls/OrbitControls.js';
import * as dat from '../lib/dat.gui.module.js';  

let scene, camera, renderer, controls;
let numLayers = 15;
let baseMajorRadius = 15;
let torusGroup;
let sphere;
let rippleActive = false;
let rippleTime = 0;
let originalRadii = [];
let cameraZoom = 100;
let targetZoom = 100;

let params = {
    rippleSpeed: 0.05,
    enableStars: true,
    cameraZoom: 100
};

let gui = new dat.GUI();

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    const light = new THREE.AmbientLight(0x404040);
    scene.add(light);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(0, 10, 30);
    scene.add(pointLight);

    torusGroup = new THREE.Group();
    generateTorusRing(numLayers, baseMajorRadius);

    createCenterSphere();

    scene.add(torusGroup);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2;

    camera.position.set(0, 50, 100);
    camera.lookAt(0, 0, 0);

    for (let i = 0; i < numLayers; i++) {
        originalRadii.push(baseMajorRadius * Math.pow(0.8, i));
    }

    createStarField(); 

  
    setupGUI();

    animate();
    window.addEventListener('click', onClick, false);
    window.addEventListener('resize', onWindowResize, false);
}

function setupGUI() {
    gui.add(params, 'rippleSpeed', 0.01, 0.1);
    gui.add(params, 'cameraZoom', 50, 200).onChange(() => {
        targetZoom = params.cameraZoom;
    });
    gui.add(params, 'enableStars').onChange(() => {
        if (params.enableStars) {
            createStarField();
        } else {
           
            scene.children = scene.children.filter(child => !(child instanceof THREE.Points));
        }
    });
}

function onClick(event) {

    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;


    const raycaster = new THREE.Raycaster();
    

    raycaster.setFromCamera(mouse, camera);


    const intersects = raycaster.intersectObject(sphere);


    if (intersects.length > 0) {
        rippleActive = true;
        rippleTime = 0;
    }
}

function createTorus(majorRadius, minorRadius) {
    const geometry = new THREE.TorusGeometry(majorRadius, minorRadius, 16, 100);
    const material = new THREE.MeshLambertMaterial({ color: new THREE.Color(Math.random(), Math.random(), Math.random()) });
    const torus = new THREE.Mesh(geometry, material);
    torus.rotation.x = Math.PI / 2;
    return torus;
}

let torusArray = []; 

function generateTorusRing(numLayers, baseMajorRadius) {

    torusArray.forEach(torus => {
        torusGroup.remove(torus);  
    });

    torusArray = []; 

    const tori = [];
    let currentMajorRadius = baseMajorRadius;


    for (let i = 0; i < numLayers; i++) {
        const minorRadius = currentMajorRadius * 0.3;
        const torus = createTorus(currentMajorRadius, minorRadius);
        tori.push(torus);
        currentMajorRadius *= 0.8; 
    }

  
    const angleIncrement = (2 * Math.PI) / numLayers;
    for (let i = 0; i < tori.length; i++) {
        const torus = tori[i];
        const angle = i * angleIncrement;

     
        const x = currentMajorRadius * Math.cos(angle);  
        const z = currentMajorRadius * Math.sin(angle);

        const y = 0; 
        torus.position.set(x, y, z);
        torusGroup.add(torus);  

        torusArray.push(torus);  

        currentMajorRadius *= 0.8; 
    }

 
    scene.add(torusGroup);
}

function createStarField() {
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 5000;
    const positions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 2000;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 2000; 
        positions[i * 3 + 2] = (Math.random() - 0.5) * 2000; 
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const starMaterial = new THREE.PointsMaterial({ color: 0x888888, size: 0.5 });
    const starField = new THREE.Points(starGeometry, starMaterial);

    scene.add(starField);
}

function createCenterSphere() {
    const sphereGeometry = new THREE.SphereGeometry(baseMajorRadius * 0.15, 32, 32);
    const sphereMaterial = new THREE.MeshLambertMaterial({ color: new THREE.Color(Math.random(), Math.random(), Math.random()) }); 
    sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(0, 0, 0);
    torusGroup.add(sphere);
}

function onWindowResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}

function animate() {
    requestAnimationFrame(animate);

   
    cameraZoom += (targetZoom - cameraZoom) * 0.05;
    camera.position.z = cameraZoom;

    if (rippleActive) {
        rippleTime += params.rippleSpeed; 
        const rippleFactor = Math.sin(rippleTime) * 0.3 + 1.0;  

    
        torusGroup.children.forEach((torus, index) => {
            if (torus !== sphere) {
                const originalRadius = originalRadii[index];
                torus.scale.set(rippleFactor * originalRadius / baseMajorRadius, 1, rippleFactor * originalRadius / baseMajorRadius);
            }
        });

       
        const sphereOriginalRadius = baseMajorRadius * 0.15;
        sphere.scale.set(rippleFactor * sphereOriginalRadius / baseMajorRadius, rippleFactor * sphereOriginalRadius / baseMajorRadius, rippleFactor * sphereOriginalRadius / baseMajorRadius);

       
        if (rippleTime > Math.PI * 2) {
            rippleActive = false;
            torusGroup.children.forEach(torus => {
                if (torus !== sphere) torus.scale.set(1, 1, 1);
            });
            sphere.scale.set(1, 1, 1);
        }
    }

    controls.update();
    renderer.render(scene, camera);
}

init();
