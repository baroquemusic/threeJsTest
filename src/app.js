import favicon from './assets/favicon.ico'

import * as THREE from 'three'

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js'

import grandCaravan from './assets/grandCaravan.glb'

import unmannedAerialVehicle from './assets/uav.glb'

import hdri from './assets/hdri_2k.exr'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { LoadingManager } from 'three'

import { TWEEN } from 'three/examples/jsm/libs/tween.module.min'


const manager = new LoadingManager()

const scene = new THREE.Scene()

const gltfLoader = new GLTFLoader(manager)

const exrLoader = new EXRLoader(manager)

manager.onLoad = function() { startShow() }

const texture = exrLoader.load(
	hdri,
	() => {
		const rendertarget = new THREE.WebGLCubeRenderTarget(texture.image.height)
		rendertarget.fromEquirectangularTexture(renderer, texture)
		scene.background = rendertarget.texture
	})

const light = new THREE.AmbientLight( 0xffffff, 1000 )
scene.add( light )

var matProp = new THREE.MeshLambertMaterial( { color: 0x000000, transparent: true, opacity: .3 } )

var gc

gltfLoader.load( grandCaravan, function ( g ) {

	gc = g.scene

	gc.children[36].material = matProp

	var glass = new THREE.MeshPhysicalMaterial( {
		color: 0x0088c2, // transparent: true, opacity: .5,
		roughness: 0, metalness: 1, reflectivity: 1,
		emissive: 0x555555
	} )

	gc.children[31].material = glass

	console.log(gc.children)

	scene.add( gc )

}, undefined, function ( error ) {

	console.error( error )

} )

var uav

gltfLoader.load( unmannedAerialVehicle, function ( u ) {

	uav = u.scene

	uav.children[4].material = matProp

	console.log(uav.children)

	scene.add( uav )

}, undefined, function ( error ) {

	console.error( error )

} )

function startShow() {

	var uavpos = { z: 0 }

	var uavtween = new TWEEN.Tween(uavpos)

	uavtween.to({ z: -10 }, 10000)

	uavtween.easing( TWEEN.Easing.Quadratic.InOut )

	uavtween.start()

	uavtween.onUpdate(function (obj) {
		uav.position.z = obj.z
	})

	animate()
}


const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 )

const renderer = new THREE.WebGLRenderer()

renderer.outputEncoding = THREE.sRGBEncoding

renderer.setSize( window.innerWidth, window.innerHeight )

scene.background = new THREE.Color( 0x72ceed )

//////////////// COMPOSER

const composer = new EffectComposer( renderer )

const renderPass = new RenderPass( scene, camera )

const fxaaShader = new ShaderPass( FXAAShader )
fxaaShader.uniforms.resolution.value.set( 1 / window.innerWidth, 1 / window.innerHeight )

const bloomPass = new UnrealBloomPass()
bloomPass.threshold = 0
bloomPass.strength = .25
bloomPass.radius = .25
bloomPass.renderToScreen = false

composer.addPass( renderPass )
// composer.addPass( fxaaShader )
// composer.addPass( bloomPass )

document.body.appendChild( renderer.domElement )

const controls = new OrbitControls( camera, renderer.domElement )

controls.enableZoom = false

camera.position.x = -15
camera.position.y = 10
camera.position.z = -20

function animate() {
	requestAnimationFrame( animate )
	TWEEN.update()
	controls.update()
	renderer.render( scene, camera )
	composer.render()
}


