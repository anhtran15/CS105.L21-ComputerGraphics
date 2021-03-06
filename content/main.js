import * as THREE from '../build/three.module.js';
import { OrbitControls } from './jsm/controls/OrbitControls.js';
import { Water } from './jsm/objects/Water.js';
import { Sky } from './jsm/objects/Sky.js';
import { GLTFLoader } from './jsm/loaders/GLTFLoader.js';

let container;
let camera, scene, renderer;
let loader, islandModel, sharkModel, sealModel, treeModel;
let controls, water, sun, sphereMesh, coneMesh;
var angle = 0;
var angle2 = 0;

init();
animate();

function init() {

    container = document.getElementById('container');

    //

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    container.appendChild(renderer.domElement);

    //

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 20000);
    camera.position.set(30, 30, 100);

    //

    sun = new THREE.Vector3();

    // Water

    const waterGeometry = new THREE.PlaneGeometry(10000, 10000);

    water = new Water(
        waterGeometry,
        {
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: new THREE.TextureLoader().load('textures/waternormals.jpg', function (texture) {
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            }),
            sunDirection: new THREE.Vector3(),
            sunColor: 0xffffff,
            waterColor: 0x001e0f,
            distortionScale: 3.7,
            fog: scene.fog !== undefined
        }
    );

    water.rotation.x = - Math.PI / 2;

    scene.add(water);

    // Skybox

    const sky = new Sky();
    sky.scale.setScalar(10000);
    scene.add(sky);

    const skyUniforms = sky.material.uniforms;

    skyUniforms['turbidity'].value = 10;
    skyUniforms['rayleigh'].value = 2;
    skyUniforms['mieCoefficient'].value = 0.005;
    skyUniforms['mieDirectionalG'].value = 0.8;

    const parameters = {
        elevation: 2,
        azimuth: 180
    };

    const pmremGenerator = new THREE.PMREMGenerator(renderer);

    function updateSun() {

        const phi = THREE.MathUtils.degToRad(90 - parameters.elevation);
        const theta = THREE.MathUtils.degToRad(parameters.azimuth);

        sun.setFromSphericalCoords(1, phi, theta);

        sky.material.uniforms['sunPosition'].value.copy(sun);
        water.material.uniforms['sunDirection'].value.copy(sun).normalize();

        scene.environment = pmremGenerator.fromScene(sky).texture;

    }

    updateSun();

    // Island model
    loader = new GLTFLoader();
    loader.load(
        './models/island/scene.gltf',
        (gltf) => {
            islandModel = gltf.scene;
            islandModel.position.y = 20;
            islandModel.scale.set(20, 20, 20);
            scene.add(islandModel);
        }
    );

    // Shark model
    loader.load(
        './models/shark/scene.gltf',
        (gltf) => {
            sharkModel = gltf.scene;
            sharkModel.position.set(80, -25, 80);
            sharkModel.scale.set(0.2, 0.2, 0.2);
            sharkModel.rotation.set(sharkModel.rotation.x, Math.PI / 2, sharkModel.rotation.z);
            console.log(sharkModel.rotation)
            scene.add(sharkModel);
        }
    );

    // Seal model
    loader.load(
        './models/seal/scene.gltf',
        (gltf) => {
            sealModel = gltf.scene;
            sealModel.position.set(0, 22, -10);
            sealModel.rotation.y = 90;
            sealModel.scale.set(10, 10, 10);
            scene.add(sealModel);
        }
    );

    // Tree model
    loader.load(
        './models/coconut_tree/scene.gltf',
        (gltf) => {
            treeModel = gltf.scene;
            treeModel.position.set(0, 15, 15);
            treeModel.scale.set(10, 10, 10);
            scene.add(treeModel);
        }
    );


    // Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.maxPolarAngle = Math.PI * 0.495;
    controls.target.set(0, 10, 0);
    controls.minDistance = 40.0;
    controls.maxDistance = 200.0;
    controls.update();
    window.addEventListener('resize', onWindowResize);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    // Move shark around island
    angle += 0.02;
    angle2 = 0.02;
    sharkModel.position.x = 80 * Math.cos(angle) + 0;
    sharkModel.position.z = 80 * Math.sin(angle) + 0;
    sharkModel.rotation.y -= angle2;
    render();
}

function render() {
    const time = performance.now() * 0.001;
    water.material.uniforms['time'].value += 1.0 / 60.0;
    renderer.render(scene, camera);
}