import * as THREE from 'three';
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {ObjectControls} from '../ObjectControls.js';


// initialize some other variables
let enableOrbitUpdate = true;
const audio = new Audio('./wood_hit.wav');


// setup the scene
const scene = new THREE.Scene();
scene.fog = new THREE.Fog( 0xcccccc, 0, 10);
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );


// add rendering engine and orbit control
const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// define or load models
const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const stick_geometry = new THREE.CylinderGeometry( 0.05, 0.05, 0.5, 32 ); 

const edges = new THREE.EdgesGeometry( geometry ); 
const material = new THREE.MeshBasicMaterial( { 
        color: 0x0000ff,
        fog: true
    } );
const cube = new THREE.Mesh( geometry, material );
cube.name = 'object';
scene.add( cube );

const controls = new ObjectControls( camera, renderer.domElement, cube);
controls.enableVerticalRotation(); // enables the vertical rotation
controls.disableZoom();

const stick = new THREE.Mesh (stick_geometry, 
    new THREE.MeshBasicMaterial( { 
        color: 0xffff00,
        fog: true
    } )); 
scene.add( stick );
stick.position.set(0, 0, 1);

// const axesHelper = new THREE.AxesHelper( 5 );
// scene.add( axesHelper );

// modify locations and rotations before draw
camera.position.z = 5;
// controls.update();
stick.rotation.z = Math.PI/180 * 30;

// inject event listeners
const pointer = new THREE.Vector2();
function projectMousePosition(x, y) {
    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    const Zplane = new THREE.Vector3(0,0,1).project(camera).z;
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

    raycaster.setFromCamera( pointer, camera );
	const intersects = raycaster.intersectObjects( scene.children );
    const currPointerOnObj = intersects.some(x => x.object.name=="object")
    if (currPointerOnObj && !prevPointerOnObj) {
        hitObject();
    } 
    prevPointerOnObj = currPointerOnObj;

	requestAnimationFrame( animate );
    // controls.update();
	renderer.render( scene, camera );
}
animate();