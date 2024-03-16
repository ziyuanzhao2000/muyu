import * as THREE from 'three';
import { ObjectControls } from '../ObjectControls.js';
import { GLTFLoader } from 'gltf_loader';


// initialize some other variables
let enableOrbitUpdate = true;
const audio = new Audio('/Muyu_Demopage.wav');
const this_js = document.getElementById("loader");

// setup the scene
const scene = new THREE.Scene();
// scene.fog = new THREE.Fog( 0xcccccc, 0, 10);
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const paths = ['/skybox/py.png',
            '/skybox/ny.png',
            '/skybox/pz.png',
            '/skybox/nz.png',
            '/skybox/px.png',
            '/skybox/nx.png'];

const skyboxMaterial = paths.map(p => new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load(p), 
        side: THREE.DoubleSide
    })
);
const skybox = new THREE.Mesh(new THREE.BoxGeometry(100,100,100), skyboxMaterial);
scene.add(skybox);


// add rendering engine
const renderer = new THREE.WebGLRenderer({ antialias: true });
const windowHeight = window.innerHeight - document.getElementById('navbar').clientHeight;
renderer.setSize( window.innerWidth, windowHeight);
document.body.appendChild( renderer.domElement );
window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / windowHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, windowHeight);
})


// define or load models
let loader = new GLTFLoader();
var obj;
var controls;
const scale_factor = 20;
const model_filepath = ['/', this_js.getAttribute('model-name'), '.gltf'].join('');
loader.load(model_filepath, function ( gltf ) {
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
    controls.enableVerticalRotation(); 
    // controls.disableZoom();
    controls.setDistance(3, 5);
}, undefined, function ( error ) {
	console.error( error );
} );

var stick;
const stickDistance = 2;
loader.load('/hammer.gltf', function (gltf) {
    scene.add(gltf.scene);
    stick = gltf.scene;
    stick.scale.x = scale_factor/2;
    stick.scale.y = scale_factor/2;
    stick.scale.z = scale_factor/2;
    stick.position.set(0, 0, stickDistance);
    stick.rotation.z = Math.PI/180 * -50;
})

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

// const axesHelper = new THREE.AxesHelper( 5 );
// scene.add( axesHelper );

// modify locations and rotations before draw
camera.position.z = 5;

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
    audio.currentTime = 0; // allows making sounds from repeated impacts
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