import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.min.js';

let scene, camera, renderer;
let numLayers = 15;  
let baseMajorRadius = 15;  
let pyramidGroup; 
let isAnimating = false; 
let expandDirection = 1; 
let scaleFactor = 1; 

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    // Lighting setup
    const light = new THREE.AmbientLight(0x404040);  
    scene.add(light);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(0, 10, 30);
    scene.add(pointLight);

    pyramidGroup = new THREE.Group(); 
    generateTorusPyramid(numLayers, baseMajorRadius);

    createCherry();

    scene.add(pyramidGroup); 

    animate();
    
    window.addEventListener('resize', onWindowResize, false);
    renderer.domElement.addEventListener('click', onPyramidClick, false); 
}

function createTorusLayer(majorRadius, minorRadius, yOffset) {
    const geometry = new THREE.TorusGeometry(majorRadius, minorRadius, 16, 100);
    const material = new THREE.MeshLambertMaterial({ color: new THREE.Color(Math.random(), Math.random(), Math.random()) });
    const torus = new THREE.Mesh(geometry, material);

    torus.position.set(0, yOffset, 0);  

    torus.rotation.x = Math.PI / 2; 
    
    pyramidGroup.add(torus); 

    return minorRadius * 2 * 0.8; 
}

function generateTorusPyramid(numLayers, baseMajorRadius) {
    const radiusDecrementFactor = 0.8;
    let currentMajorRadius = baseMajorRadius;
    let currentYOffset = 0;
    let totalHeight = 0;  

    for (let layer = 0; layer < numLayers; layer++) {
        const minorRadius = currentMajorRadius * 0.2;  
        totalHeight += createTorusLayer(currentMajorRadius, minorRadius, currentYOffset);

        currentYOffset += minorRadius * 2 * 0.8; 

        currentMajorRadius *= radiusDecrementFactor;
    }

    return totalHeight;
}

// Creating the "cherry on top"
function createCherry() {
    const cherryGeometry = new THREE.SphereGeometry(1, 32, 32);
    const cherryMaterial = new THREE.MeshLambertMaterial({ color: 0xFF0000 });
    const cherry = new THREE.Mesh(cherryGeometry, cherryMaterial);

    const totalHeight = generateTorusPyramid(numLayers, baseMajorRadius);  
    cherry.position.set(0, totalHeight, 0);  

    pyramidGroup.add(cherry); // Add cherry to the pyramid group, so it moves with the pyramid
}

// Animate the pyramid expansion and contraction
function animateExpansion() {
    if (!isAnimating) return; 
    
    scaleFactor += expandDirection * 0.015; // Increase or decrease scale factor
    if (scaleFactor >= 2.0) { // Max scale, start contracting
        expandDirection = -1;
    }
    if (scaleFactor <= 1) { // Min scale, stop animating
        expandDirection = 1;
        isAnimating = false; // Stop the animation once it's back to normal size
    }
    
    pyramidGroup.scale.set(scaleFactor, scaleFactor, scaleFactor); // Apply scale to the pyramid
    
    requestAnimationFrame(animateExpansion); // Continue the animation
}

// Handle click event to start the animation
function onPyramidClick() {
    if (isAnimating) return; // Prevent multiple clicks while animating
    
    isAnimating = true; 
    expandDirection = 1; 
    animateExpansion(); 
}

// Animation loop to render the scene
function animate() {
    requestAnimationFrame(animate);

    camera.position.set(45, 45, 45);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    renderer.render(scene, camera);
}

function onWindowResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}

init();
