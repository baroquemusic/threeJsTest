import favicon from './assets/favicon.ico';

import * as THREE from 'three';

import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';

import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import grandCaravan from './assets/grandCaravan.fbx';

import hdri from './assets/hdri_1k.exr';

const scene = new THREE.Scene();

const fbxLoader = new FBXLoader();

const exrLoader = new EXRLoader();

fbxLoader.load( grandCaravan, function ( grandCaravan ) {

	grandCaravan.scale.multiplyScalar(0.35);

	scene.add( grandCaravan );

}, undefined, function ( error ) {

	console.error( error );

} );

const texture = exrLoader.load(
	hdri,
	() => {
		const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
		rt.fromEquirectangularTexture(renderer, texture);
		scene.background = rt.texture;
	});


const light = new THREE.AmbientLight( 0xdddddd );
scene.add( light );

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );

const renderer = new THREE.WebGLRenderer();

renderer.setSize( window.innerWidth, window.innerHeight );

scene.background = new THREE.Color( 0x72ceed );

document.body.appendChild( renderer.domElement );

const controls = new OrbitControls( camera, renderer.domElement )

camera.position.z = 500;

function animate() {
	requestAnimationFrame( animate );
	controls.update();
	renderer.render( scene, camera );
}

animate();

console.log('>>>>>>> app.js <<<<<<<');