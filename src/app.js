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

import uav from './assets/uav.glb'

import hdri from './assets/hdri_2k.exr'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'

const scene = new THREE.Scene()

const gltfLoader = new GLTFLoader()

const exrLoader = new EXRLoader()

const texture = exrLoader.load(
	hdri,
	() => {
		const rendertarget = new THREE.WebGLCubeRenderTarget(texture.image.height)
		rendertarget.fromEquirectangularTexture(renderer, texture)
		scene.background = rendertarget.texture
	})

const light = new THREE.AmbientLight( 0xdddddd )
scene.add( light )

const propgeo = new THREE.CircleGeometry( 1.5, 32 )
const propmat = new THREE.MeshBasicMaterial( { color: 0x000000 } )
propmat.side = THREE.DoubleSide
propmat.transparent = true
propmat.opacity = .35
const prop = new THREE.Mesh( propgeo, propmat )
prop.position.x = -6.25
prop.position.y = .4
prop.rotation.y = Math.PI / 2
const uprop = prop.clone()
uprop.position.x = -2.6
uprop.position.y = 0
uprop.position.z = -4.3
uprop.scale.x = .7
uprop.scale.y = .7
uprop.rotation.y = Math.PI / 2
scene.add( prop )
//scene.add( uprop )

gltfLoader.load( grandCaravan, function ( gC ) {

	gC.scene.position.set( 0, 0, 0 )

	scene.add( gC.scene )

}, undefined, function ( error ) {

	console.error( error )

} )

gltfLoader.load( uav, function ( u ) {

	u.scene.position.set( -2, 0, -2.1 )

	const uavg = new THREE.Group()
	uavg.add( u.scene )
	uavg.add( uprop )

	scene.add( uavg )

}, undefined, function ( error ) {

	console.error( error )

} )

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
composer.addPass( fxaaShader )
composer.addPass( bloomPass )

document.body.appendChild( renderer.domElement )

const controls = new OrbitControls( camera, renderer.domElement )

controls.enableZoom = false

camera.position.x = -15
camera.position.y = 10
camera.position.z = -20

function animate() {
	requestAnimationFrame( animate )
	controls.update()
	renderer.render( scene, camera )
	composer.render()
}

animate()
