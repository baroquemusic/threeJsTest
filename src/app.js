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
import { LoadingManager, Vector3 } from 'three'

import { TWEEN } from 'three/examples/jsm/libs/tween.module.min'

import sprite from './assets/dot.png'
import skyPrint from './assets/skycrayon-skyprint-xs.png'

const manager = new LoadingManager()

const scene = new THREE.Scene()

const gltfLoader = new GLTFLoader(manager)

const exrLoader = new EXRLoader(manager)

manager.onLoad = () => { startShow() }

const texture = exrLoader.load(
	hdri,
	() => {
		const rendertarget = new THREE.WebGLCubeRenderTarget(texture.image.height)
		rendertarget.fromEquirectangularTexture(renderer, texture)

		scene.background = rendertarget.texture
} )

// const lightD = new THREE.DirectionalLight( 0xffba00, 0 )
// lightD.position.set( 50, 50, 50 )
// const lightP = new THREE.PointLight( 0x00d9ff, 0 )
// lightP.position.set( -50, 50, -50 )
// scene.add( lightD )
// scene.add( lightP )

///////////////////// PARTICLE SYSTEM

var shaderAttributes
var particles = []
var particleSystem

var imageWidth = 500
var imageHeight = 119
var imageData = null

function createPixelData() {

	var image = document.createElement('img')
	var canvas = document.createElement('canvas')
	var context = canvas.getContext('2d')

	image.onload = () => {
		image.width = canvas.width = imageWidth
		image.height = canvas.height = imageHeight
		context.drawImage( image, 0, 0, imageWidth, imageHeight )
		imageData = context.getImageData( 0, 0, imageWidth, imageHeight ).data
		createParticles()
	}

	image.src = skyPrint

}

function createParticles() {

	var c = 0
	var geometry, x, y, z

	geometry = new THREE.BufferGeometry()
	var vertices = new Float64Array( imageWidth * imageHeight * 3 )
	vertices = [ { x: null, y: null, z: null } ]

	x = imageWidth * -.5
	y = imageHeight * .5
	z = 0

		var vertexShader = `
	attribute vec3 vertexColor;
	varying vec4 varColor;
	void main() {
		varColor = vec4(vertexColor, 1.0);
		vec4 pos = vec4(position, 1.0);
		vec4 mvPosition = modelViewMatrix * pos;
		gl_PointSize = 1.0;
		gl_Position = projectionMatrix * mvPosition;
	}
	`

	var fragmentShader = `
	varying vec4 varColor;
	void main()
	{
		gl_FragColor = varColor;
	}
	`

	shaderAttributes = {
		vertexColor: {
			type: 'c',
			value: []
		}
	}

	var shaderMaterial  = new THREE.ShaderMaterial( {
		attributes: shaderAttributes,
		vertexShader: vertexShader,
		fragmentShader: fragmentShader
	} )

	var expandPixels = 2

	for ( var i = 0; i < imageHeight; i++ ) {
		for ( var j = 0; j < imageWidth; j++ ) {

			var color = new THREE.Color()

			if ( imageData[ c + 3 ] != 1 ) {
				
				color.setRGB( imageData[ c ] / 255, imageData[ c + 1 ] / 255, imageData[ c + 2 ] / 255 )
				
				shaderAttributes.vertexColor.value.push(color)

				var vertex = new THREE.Vector3()

				vertex.x = x * expandPixels
				vertex.y = y * expandPixels
				vertex.z = z

				vertices.push( vertex.x, vertex.y, vertex.z )
			}

			c += 4
			x++
		}

		x = imageWidth * -.5
		y--
	}

	console.log( vertices.length )
	particleSystem = new THREE.ParticleSystem( geometry, shaderMaterial )

	scene.add( particleSystem )
}

createPixelData()

///////////////////////// SOLIDS

var matProp = new THREE.MeshLambertMaterial( { color: 0x000000, transparent: true, opacity: .5 } )
var matTire = new THREE.MeshLambertMaterial( { color: 0x0e0e0a } )

var gc
var glass
var hullPink
var hullPurple
var hullYellow

gltfLoader.load( grandCaravan, ( g ) => {

		gc = g.scene

		gc.children[36].material = matProp

		glass = new THREE.MeshPhysicalMaterial({
			color: 0xffffff, transparent: true, opacity: .7,
			roughness: 0, metalness: 1,
			clearcoat: 1, clearcoatRoughness: .4,
			transmission: 1,
		})

		hullPink = new THREE.MeshStandardMaterial({
			color: 0xDD00E7,
			roughness: .25, metalness: .75
		})

		hullPurple = new THREE.MeshStandardMaterial({
			color: 0x140021,
			roughness: .5, metalness: .5
		})

		hullYellow = new THREE.MeshStandardMaterial({
			color: 0xff6400,
			roughness: 0, metalness: 1
		})

		gc.children[31].material =
			gc.children[32].material =
			gc.children[33].material =
			gc.children[37].material =
			glass

		gc.children[16].material =
			gc.children[3].material =
			gc.children[4].material =
			gc.children[5].material =
			gc.children[11].material =
			gc.children[19].material =
			uav.children[1].material =
			hullPink

		gc.children[0].material =
			gc.children[1].material =
			gc.children[2].material =
			gc.children[6].material =
			gc.children[7].material =
			gc.children[8].material =
			gc.children[9].material =
			gc.children[10].material =
			gc.children[13].material =
			gc.children[14].material =
			gc.children[15].material =
			gc.children[20].material =
			gc.children[21].material =
			gc.children[22].material =
			gc.children[23].material =
			gc.children[24].material =
			gc.children[28].material =
			gc.children[29].material =
			gc.children[30].material =
			gc.children[34].material =
			gc.children[35].material =
			uav.children[0].material =
			uav.children[2].material =
			hullPurple

		gc.children[12].material =
			uav.children[3].material =
			hullYellow

		gc.children[25].material =
			gc.children[26].material =
			gc.children[27].material =
			matTire

		scene.add(gc)

	}, undefined, ( error ) => {

		console.error(error)

	} )

var uav

gltfLoader.load( unmannedAerialVehicle, ( u ) => {

		uav = u.scene

		uav.children[4].material = matProp

		scene.add(uav)

	}, undefined, ( error ) => {

		console.error(error)

	} )

var uavPos = { z: 0 }
var cameraPos = ( { x: -15, y: 10, z: -20 } )
var uavTweening = true
var cameraTweening = true

function startShow() {

	const pmremGenerator = new THREE.PMREMGenerator( renderer )
	glass.envMap =
	hullPink.envMap =
	hullPurple.envMap =
	hullYellow.envMap =
	cableMat.envMap =
	pmremGenerator.fromCubemap( texture ).texture

	//renderer.physicallyCorrectLights = true
	
	var uavTween = new TWEEN.Tween( uavPos )
	var uavDist = -100
	uavTween.to( { z: uavDist }, 10000 )
	uavTween.easing( TWEEN.Easing.Quadratic.InOut )

	var cameraTween = new TWEEN.Tween( cameraPos )
	cameraTween.to( { x: 100, y: -50, z: -150 }, 10000 )
	cameraTween.easing( TWEEN.Easing.Quadratic.InOut )

	uavTween.start()
	cameraTween.start()

	uavTween.onUpdate(() => {
		uav.position.z = uavPos.z
	})

	uavTween.onComplete(() => {
		uavTweening = false
	})

	cameraTween.onComplete(() => {
		cameraTweening = false
		controls.minPolarAngle = THREE.Math.degToRad( 100 )
		controls.maxPolarAngle = THREE.Math.degToRad( 180 )
	})

	animate()
}

window.addEventListener('resize', onWindowResize, false)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
    animate()
}

//scene.add( new THREE.AxesHelper( 100 ) )

const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 )

camera.position.set( -15, 10, -20 )

const renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } )

renderer.outputEncoding = THREE.sRGBEncoding

renderer.setSize( window.innerWidth, window.innerHeight )

scene.background = new THREE.Color( 0x72ceed )

/////////////////// CABLE

var cablePoints = []
cablePoints.push( new THREE.Vector3( -.8, -.7, -.4 ), new THREE.Vector3( -.8, -.5, -.8 ), new THREE.Vector3( .5, 0, -2) )

var cablePath = new THREE.CatmullRomCurve3( cablePoints )

const cableShape = new THREE.Shape()
cableShape.moveTo( 0, 0 )
cableShape.absarc( 0, 0, .1, 0, Math.PI * 2, false )

var cableGeo = new THREE.ExtrudeGeometry( cableShape, { bevelEnabled: false, extrudePath: cablePath } )

var cableMat = new THREE.MeshStandardMaterial( { color: 0x140021, roughness: .5, metalness: .5 } )

var cable = new THREE.Mesh( cableGeo, cableMat )

scene.add( cable )

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

//controls.enableZoom = false
controls.enableDamping = true
controls.dampingFactor = .2
controls.minDistance = 5
controls.maxDistance = 200

function animate() {
	requestAnimationFrame( animate )
	TWEEN.update()
	if ( uavTweening ) {
		controls.target.z = uavPos.z * .5
		controls.target.x = -uavPos.z * .2
		controls.target.y = 0

		scene.remove( cable )
		cablePoints[2].z = uavPos.z - 2
		cablePoints[1].x = uavPos.z * -.1
		cablePoints[1].z = uavPos.z * .5

	 	cableGeo = new THREE.ExtrudeBufferGeometry( cableShape, { steps: 200, bevelEnabled: false, extrudePath: cablePath } )
 	 	cable = new THREE.Mesh( cableGeo, cableMat )
		
	 	scene.add( cable )
	}
	if ( cameraTweening ) {
		camera.position.set( cameraPos.x, cameraPos.y, cameraPos.z )
	}
	controls.update()
	renderer.render( scene, camera )
	composer.render()
}
