/*
THIS PROGRAM IS A MODIFICATION OF MANDELBROT3D_EN.JS
I replaced the 'binary' option with 'neon' less straining on the eyes
Added animateZoom function to have the image come to the screen in a 3D effect
Added 'in/out' for the motion of the camera
Enhanced the zscale to 1.0 instead of 0.5
Added a wave efect in the 3D fractal, if you turn the image to its side, you can
see the back panel pulse and mesh the fractals
*/

import * as THREE from '../build/three.module.js';
import { OrbitControls } from './jsm/controls/OrbitControls.js';
import * as dat from '../lib/dat.gui.module.js';

 
let camera, scene, renderer;
let cameraControls;
let evolutionSpeed = 1;
let rotationSpeed = 0.01;
let waveSpeed = 0.1;
let zoomSpeed = 0.02;
let clock = new THREE.Clock();
let landscape;
let frameSquare = makeFrameSquare();
let upperMesh;  
let resolution = 300;  
let frame = [-2.1, -1.5, 3.1, 3.001];


function createScene() {
    let limit = 16;
    landscape = makeMandelbrotLandscape(limit, resolution, 0.01);
    scene.add(landscape);

    scene.add(frameSquare);
    let light = new THREE.PointLight(0xFFFFFF, 1.0, 1000);
    light.position.set(1, 1, -3);
    let light2 = new THREE.PointLight(0xAAAAAA, 1.0, 1000);
    light2.position.set(-1, -1, 3);
    let ambientLight = new THREE.AmbientLight(0x111111);
    scene.add(light);
    scene.add(light2);
    scene.add(ambientLight);
}

function makeFrameSquare(r=1) {
    let geom = new THREE.PlaneGeometry(2, 2);
    let matArgs = {transparent: true, opacity: 0.5, side: THREE.DoubleSide}
    let mat = new THREE.MeshLambertMaterial(matArgs);
    let square = new THREE.Mesh(geom, mat);
    square.scale.set(r, r, 1);
    square.position.z = 0.01;
    return square;
}

// Generates the Mandelbrot fractal landscape (3D version)
function makeMandelbrotLandscape(limit, res) {
    let root = new THREE.Object3D();
    let colors = updateColors();
    let lowerPlane = new THREE.PlaneGeometry(2, 2, 1, 1);
    let lowerMat = new THREE.ShaderMaterial(makeShaderMaterialArgs(frame, colors, limit));
    let lowerMesh = new THREE.Mesh(lowerPlane, lowerMat);
    upperMesh = make3DLandscape(frame, 2, res, colors, limit);
    if (controls.invert)
        invertMandelbrotLandscape();
    upperMesh.position.z = -0.001;
    upperMesh.rotateZ(Math.PI / 2);
    upperMesh.scale.set(1.0, 1.0, controls.zscale);
    root.add(lowerMesh, upperMesh);
    return root;
}

// Generates a 3D landscape mesh for the fractal
function make3DLandscape(frame, size, res, colors, limit) {
    let plane = mandelbrotLandscapeGeom(frame, size, res, colors, limit);
    let matArgs = {side: THREE.DoubleSide, shininess: 30, vertexColors: true};
    let mat = new THREE.MeshPhongMaterial(matArgs);
    let mesh = new THREE.Mesh(plane, mat);
    return mesh;
}

let heightOf3DLandscape = 1.0;

// Generates the geometry of the 3D Mandelbrot fractal
function mandelbrotLandscapeGeom(frame, size, res, colors, limit) {
    let [minr, mini, width, height] = frame;
    let plane = new THREE.PlaneBufferGeometry(size, size, res, res);
    let res1 = res + 1;
    let pos = plane.getAttribute('position');
    let colorsArray = new Float32Array(res1 * res1 * 3);
    plane.setAttribute('color', new THREE.BufferAttribute(colorsArray, 3, true));
    let pa = pos.array;
    for (let i = 0; i < res1; i++) { 
        for (let j = 0; j < res1; j++) { 
            let posr = width * (i / res1) + minr;
            let posi = height * (j / res1) + mini;
            let z = mandelbrotFrac(posr, posi, limit);
            let base = 3 * (i * res1 + j);
            pa[base + 2] = -(z / limit) * heightOf3DLandscape;
          
            let zs = Math.trunc(z);
            let zf = z - zs;
            let c = new THREE.Color(colors[zs]);
            c.lerp(colors[zs+1], zf);
            colorsArray[base] = c.r;
            colorsArray[base + 1] = c.g;
            colorsArray[base + 2] = c.b;
        }
    }
    pos.needsUpdate = true;
    return plane;
}

// Inverts the Mandelbrot fractal landscape (flips the 3D model)
function invertMandelbrotLandscape() {
    let pos = upperMesh.geometry.getAttribute('position');
    let pa = pos.array;
    for (let i = 2; i < pa.length; i += 3) {
        pa[i] = -(1 + pa[i]);       
    }
    pos.needsUpdate = true;
}

let R = 16;
let R2 = R * R;
let Rp = Math.log2(Math.log2(R));

// Calculates a single point of the Mandelbrot set
function mandelbrotFrac(cr, ci, limit) {
    let zr = 0.0;
    let zi = 0.0;
    let zr2, zi2;
    let i;
    for (i = 0; i < limit; i++) {
        zr2 = zr * zr;
        zi2 = zi * zi;
        zi = 2.0 * zr * zi + ci;
        zr = zr2 - zi2 + cr;
        if (zr2 + zi2 > R2)
            break;
    }
    if (i < limit) {
        let modulus = Math.sqrt(zr2 + zi2);
        return i + Rp - Math.log2(Math.log2(modulus));
    } else {
        return limit;
    }
}

// Updates the color palette based on user settings
function updateColors() {
    let levels = controls.levels;
    let colors = [];
    if (controls.colorModel == 'rainbow') {
        for (let i = 0; i <= levels; i++) {
            let c = new THREE.Color();
            c.setHSL(i/levels, 1.0, 0.5);
            colors.push(c);
        }
    } else if (controls.colorModel == 'neon') {
        
        let color1 = new THREE.Color(controls.color1);
        let color2 = new THREE.Color(controls.color2);
        
        for (let i = 0; i <= levels; i++) {
            let f = i / levels*3; 
            let color = new THREE.Color(color1);
            color.lerp(color2, f); 
            colors.push(color);
        }
    } else {  
        let color1 = new THREE.Color(controls.color1);
        let color2 = new THREE.Color(controls.color2);
        let inc = 1.0 / levels;
        for (let i = 0, f = 0.0; i <= levels; i++, f += inc) {
            let color = new THREE.Color(color1);
            color.lerp(color2, f*f);
            colors.push(color);
        }
    }
    
    colors.push(colors[levels]);
    return colors;
}


// Sets up the shader material for the Mandelbrot fractal
function makeShaderMaterialArgs(frame, colors, limit) {
    
    let [minr, mini, width, height] = frame;
    return {
      uniforms: {
        colors: {
            value: colors
        }
      },
      vertexShader: `
        varying vec2 vUv;

        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        }
      `,
      fragmentShader: `
      precision highp float;
        uniform vec3 colors[${limit+1}];
        varying vec2 vUv;

        vec4 mandelbrot(vec2 c) {
            float cr = c.x;
            float ci = c.y;
            float zr = 0.0;
            float zi = 0.0;
            for (int i = 0; i < ${limit}; i++) {
                // (zr,zi) = (zr,zi)**2 + c
                float zr2 = zr * zr;
                float zi2 = zi * zi;
                zi = 2.0 * zr * zi + ci;
                zr = zr2 - zi2 + cr;
                // has (zr,zi) escaped?
                if (zr2 + zi2 > 4.0)
                    return vec4(colors[i], 1.0);
            }
            return vec4(colors[${limit}], 1.0);
        }
        
        void main() {
            float posr = ${width} * vUv.x + ${minr};
            float posi = ${height} * vUv.y + ${mini};
            vec2 pos = vec2(posr, posi);
            gl_FragColor = mandelbrot(pos);
        }
      `,
      side: THREE.DoubleSide
    }
};

const maxLevels = 64;
let controls = new function() {
    this.levels = 32;
    this.colorModel = 'gradient';
    this.color1 = '#4b0fe1';
    this.color2 = '#28b6e2';
    this.frame = 1;
    this.zoom = 'in';
    this.zscale = 0.2;
    this.invert = false;
    this.fractalType = 'Mandelbrot';  
}

 
function initGui() {
    let gui = new dat.GUI();
    gui.add(controls, 'levels', 2, maxLevels).step(1).onChange(updateShader);
    let colorModels = ['rainbow', 'neon', 'gradient'];
    gui.add(controls, 'colorModel', colorModels).onChange(updateShader);
    gui.addColor(controls, 'color1').onChange(updateShader);
    gui.addColor(controls, 'color2').onChange(updateShader);
    gui.add(controls, 'zoom', ['in', 'out']);
    gui.add(controls, 'zscale', 0.05, 1.0).step(0.01).onChange(function(val) {
        upperMesh.scale.set(1.0, 1.0, val);
    });
    gui.add(controls, 'invert').onChange(function () { invertMandelbrotLandscape(); });
}

// Updates the fractal display when controls change
function updateShader() {
    scene.remove(landscape);

    landscape = makeFractalLandscape(controls.levels, resolution, controls.fractalType);

    scene.add(landscape);
}

// Creates the fractal landscape based on the updated settings
function makeFractalLandscape(limit, res, fractalType) {
    let root = new THREE.Object3D();
    let colors = updateColors();
    let lowerPlane = new THREE.PlaneGeometry(2, 2, 1, 1);
    let lowerMat = new THREE.ShaderMaterial(makeShaderMaterialArgs(frame, colors, limit, fractalType));
    let lowerMesh = new THREE.Mesh(lowerPlane, lowerMat);
    upperMesh = make3DLandscape(frame, 2, res, colors, limit, fractalType);  
    if (controls.invert) invertMandelbrotLandscape();
    upperMesh.position.z = -0.001;
    upperMesh.rotateZ(Math.PI / 2);
    upperMesh.scale.set(1.0, 1.0, controls.zscale);
    root.add(lowerMesh, upperMesh);
    return root;
}

// Controls the evolution of the fractal's detail level over time
function updateFractalEvolution() {
    controls.levels += evolutionSpeed;
    if (controls.levels >= maxLevels || controls.levels <= 2) {
        evolutionSpeed = -evolutionSpeed; 
    }
    updateShader();
}

// Updates the 3D fractal rotation and wave effect
function update3DEnhancements() {
    // Rotate the fractal landscape over time
    upperMesh.rotation.y += rotationSpeed;

    // Get the geometry's position array
    let positions = upperMesh.geometry.attributes.position.array;

    // Calculate a factor based on the number of levels
    let waveAmplitude = Math.sin(controls.levels / maxLevels * Math.PI) * 0.5 + 0.1; // Adjusts wave strength with levels

    // Apply wave effect with dynamic amplitude based on levels
    for (let i = 2; i < positions.length; i += 3) {
        positions[i] += Math.sin(positions[i] * waveSpeed + clock.elapsedTime) * waveAmplitude;
    }

    // Update the geometry to reflect the changes
    upperMesh.geometry.attributes.position.needsUpdate = true;
}


//Parameters for the auto zoom limit
let minZoom = 1.8;  
let maxZoom = 2.2;  

function animateZoom() {
    if (controls.zoom === 'in') {
        if (camera.position.z > minZoom) {
            camera.position.z -= zoomSpeed;
        }
    } else if (controls.zoom === 'out') {
        if (camera.position.z < maxZoom) {
            camera.position.z += zoomSpeed;
        }
    }
}

// Handles the rendering of the scene with updates
function render() {
    let delta = clock.getDelta();
    cameraControls.update(delta);
    updateFractalEvolution();
    update3DEnhancements();
    animateZoom();
    renderer.render(scene, camera);
}

function init() {
    scene = new THREE.Scene();

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    renderer.setAnimationLoop(function () {
        render();
    });


    let canvasRatio = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(40, canvasRatio, 1, 1000);
    camera.position.set(0, 0, 3);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    camera.near = 0.001;

 
    cameraControls = new OrbitControls(camera, renderer.domElement);
    cameraControls.enableDamping = true;
    cameraControls.dampingFactor = 0.02;

   
    window.addEventListener('resize', onWindowResize, false);

    renderer.setAnimationLoop(function () {
        render();
    });
    
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}


init();
createScene();
initGui();
