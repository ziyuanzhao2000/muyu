import * as THREE from 'three';
import { ObjectControls } from '../ObjectControls.js';
import { GLTFLoader } from 'gltf_loader';


// initialize some other variables
let enableOrbitUpdate = true;
const audio = new Audio('./wood_hit.wav');


// setup the scene
const scene = new THREE.Scene();
// scene.fog = new THREE.Fog( 0xcccccc, 0, 10);
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

// add skybox
// scene.background = new THREE.CubeTextureLoader()
//     .setPath('skybox/')
//     .load([
//         'px.png',
//         'nx.png',
//         'py.png',
//         'ny.png',
//         'pz.png',
//         'nz.png'
// ]);
const skyboxTexture = new THREE.CubeTextureLoader()
    .setPath('skybox/')
    .load([
        'px.png',
        'nx.png',
        'py.png',
        'ny.png',
        'pz.png',
        'nz.png'
]);
const paths = ['skybox/py.png',
            'skybox/ny.png',
            'skybox/pz.png',
            'skybox/nz.png',
            'skybox/px.png',
            'skybox/nx.png'];

const skyboxMaterial = paths.map(p => new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load(p), 
        side: THREE.DoubleSide
    })
);
const skybox = new THREE.Mesh(new THREE.BoxGeometry(100,100,100), skyboxMaterial);
scene.add(skybox);


// add rendering engine and orbit control
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// define or load models
let loader = new GLTFLoader();
var obj;
var controls;
const scale_factor = 20;
loader.load( 'model_1.gltf', function ( gltf ) {
	scene.add( gltf.scene );
    obj = gltf.scene;
    obj.scale.x = scale_factor;
    obj.scale.y = scale_factor;
    obj.scale.z = scale_factor;
    let mesh_list = obj.children[0].children;
    mesh_list.forEach(mesh => mesh.name='object');
    mesh_list.push(skybox);
    controls = new ObjectControls(camera, renderer.domElement, mesh_list)
    controls.setRotationSpeed(0.1);
    controls.setMaxVerticalRotationAngle(Math.PI / 4, Math.PI / 4);
    controls.setMaxHorizontalRotationAngle(Math.PI, Math.PI);
    controls.enableVerticalRotation(); // enables the vertical rotation
    controls.disableZoom();
}, undefined, function ( error ) {
	console.error( error );
} );

const stick_geometry = new THREE.CylinderGeometry( 0.05, 0.05, 0.5, 32 ); 
const stick = new THREE.Mesh (stick_geometry, 
    new THREE.MeshBasicMaterial( { 
        color: 0xffff00,
        fog: true
    } )); 
scene.add( stick );
const stickDistance = 2;
stick.position.set(0, 0, stickDistance);

// add lighting and misc elmts
const ambientLight = new THREE.AmbientLight(0xFFFFFF);
ambientLight.intensity = 1;
scene.add( ambientLight );
const pointLight = new THREE.PointLight( 0xFFFFFF, 1, 100 );
pointLight.position.set( 0, 0, 0 );
scene.add( pointLight );
const dirLight1 = new THREE.DirectionalLight( 0xffddcc, 5);
dirLight1.position.set( 1, 0.75, 0.5 );
scene.add( dirLight1 );

const axesHelper = new THREE.AxesHelper( 5 );
scene.add( axesHelper );

// modify locations and rotations before draw
camera.position.z = 5;
stick.rotation.z = Math.PI/180 * 30;

// inject event listeners
const pointer = new THREE.Vector2();
function projectMousePosition(x, y) {
    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    const Zplane = new THREE.Vector3(0,0,stickDistance).project(camera).z;
    return new THREE.Vector3(pointer.x, 
                            pointer.y, 
                            Zplane).unproject( camera );
}


function toggleControlMode(mode) {
    if (mode) {
        controls.enableHorizontalRotation();
        controls.enableVerticalRotation();
        $(document).off("mousemove");
    } else {
        controls.disableHorizontalRotation();
        controls.disableVerticalRotation();
        $(document).on("mousemove", function( event ) {
            let projected = projectMousePosition(event.pageX, event.pageY)
            stick.position.x = projected.x;
            stick.position.y = projected.y;
            } );
    }
}

$(document).on('keydown', function(event) {
    if (event.code == "Space") {
        enableOrbitUpdate = !enableOrbitUpdate;
        toggleControlMode(enableOrbitUpdate);
    }
  })

// raycasting to detect stick over displayed object
const raycaster = new THREE.Raycaster();
let prevPointerOnObj = false;

function hitObject() {
    audio.play()
}

function animate() {
    // skybox.rotation.x += 0.001;
    raycaster.setFromCamera( pointer, camera );
	const intersects = raycaster.intersectObjects( scene.children );
    const currPointerOnObj = intersects.some(x => x.object.name=="object")
    if (currPointerOnObj && !prevPointerOnObj && !enableOrbitUpdate) {
        hitObject();
    } 
    prevPointerOnObj = currPointerOnObj;

	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}
animate();