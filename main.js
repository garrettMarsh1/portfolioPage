import './style.css'
import * as THREE from 'three';
import gsap from 'gsap';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import { DoubleSide } from 'three';
import { BackSide } from 'three';
import { FlatShading } from 'three';
import * as dat from 'dat.gui';




const gui = new dat.GUI();
const world = {
  torus: {
    width: 50,
    height: 3,
    widthSegments: 16,
    heightSegments: 72
  }
}

gui.add(world.torus, 'width', 1, 400).
onChange(generateTorus);
gui.add(world.torus, 'widthSegments', 1, 100).
onChange(generateTorus);
gui.add(world.torus, 'height', 1, 400).
onChange(generateTorus);
gui.add(world.torus, 'heightSegments', 1, 100).
onChange(generateTorus);



function generateTorus() {
  torusMesh.geometry.dispose()
  torusMesh.geometry = new THREE.TorusGeometry(
    world.torus.width,
    world.torus.height,
    world.torus.widthSegments,
    world.torus.heightSegments,
    
  )

  
  // vertice position randomization
  const { array } = torusMesh.geometry.attributes.position
  const randomValues = []
  for (let i = 0; i < array.length; i++) {
    if (i % 3 === 0) {
      const x = array[i]
      const y = array[i + 1]
      const z = array[i + 2]

      array[i] = x + (Math.random() - 0.5) * 5.5
      array[i + 1] = y + (Math.random() - 0.5) * 5.67
      array[i + 2] = z + (Math.random() - 0.5) * 6
    }

    randomValues.push(Math.random() * Math.PI * 2)
  }

  torusMesh.geometry.attributes.position.randomValues = randomValues
  torusMesh.geometry.attributes.position.originalPosition =
    torusMesh.geometry.attributes.position.array

  const colors = []
  for (let i = 0; i < torusMesh.geometry.attributes.position.count; i++) {
    colors.push(0, 0.3, 0)
  }

  torusMesh.geometry.setAttribute(
    'color',
    new THREE.BufferAttribute(new Float32Array(colors), 3)
  )
}

const raycaster = new THREE.Raycaster()
const scene = new THREE.Scene()



const camera = new THREE.PerspectiveCamera(
  75,
  innerWidth / innerHeight,
  0.1,
  1000
)




const renderer = new THREE.WebGLRenderer()
renderer.setSize(innerWidth, innerHeight)
renderer.setPixelRatio(devicePixelRatio)
document.body.appendChild(renderer.domElement)

new OrbitControls(camera, renderer.domElement)
camera.position.z = 110
camera.position.y = -5

const torusGeometry = new THREE.TorusGeometry(
  world.torus.width,
  world.torus.height,
  world.torus.widthSegments,
  world.torus.heightSegments
)
const torusMaterial = new THREE.MeshPhongMaterial({
  side: THREE.DoubleSide,
  flatShading: THREE.FlatShading,
  vertexColors: true
})
const torusMesh = new THREE.Mesh(torusGeometry, torusMaterial).
rotateX(-Math.PI * 0.32).rotateZ(-Math.PI * 0.25)
scene.add(torusMesh)
generateTorus()

const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(0, -1, 1)
scene.add(light)

const backLight = new THREE.DirectionalLight(0xffffff, 1)
backLight.position.set(0, 0, -1)
scene.add(backLight)

const mouse = {
  x: undefined,
  y: undefined
}



let frame = 0
function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
  raycaster.setFromCamera(mouse, camera)
  frame += 0.01

  torusMesh.rotation.z += 0.001
  console.log(torusMesh)
  const {
    array,
    originalPosition,
    randomValues
  } = torusMesh.geometry.attributes.position
  for (let i = 0; i < array.length; i += 3) {
    // x
    array[i] = originalPosition[i] + Math.cos(frame + randomValues[i]) * 0.01

    // y
    array[i + 1] =
      originalPosition[i + 1] + Math.sin(frame + randomValues[i + 1]) * 0.01
  }

  torusMesh.geometry.attributes.position.needsUpdate = true

  const intersects = raycaster.intersectObject(torusMesh)
  if (intersects.length > 0) {
    const { color } = intersects[0].object.geometry.attributes

    // vertice 1
    color.setX(intersects[0].face.a, 0.1)
    color.setY(intersects[0].face.a, 0.5)
    color.setZ(intersects[0].face.a, 1)

    // vertice 2
    color.setX(intersects[0].face.b, 0.1)
    color.setY(intersects[0].face.b, 0.5)
    color.setZ(intersects[0].face.b, 1)

    // vertice 3
    color.setX(intersects[0].face.c, 0.1)
    color.setY(intersects[0].face.c, 0.5)
    color.setZ(intersects[0].face.c, 1)

    intersects[0].object.geometry.attributes.color.needsUpdate = true

    const initialColor = {
      r: 0,
      g: 0.3,
      b: 0
    }

    const hoverColor = {
      r: 0.5,
      g: 0.5,
      b: 0
    }

    gsap.to(hoverColor, {
      r: initialColor.r,
      g: initialColor.g,
      b: initialColor.b,
      duration: 1,
      onUpdate: () => {
        // vertice 1
        color.setX(intersects[0].face.a, hoverColor.r)
        color.setY(intersects[0].face.a, hoverColor.g)
        color.setZ(intersects[0].face.a, hoverColor.b)

        // vertice 2
        color.setX(intersects[0].face.b, hoverColor.r)
        color.setY(intersects[0].face.b, hoverColor.g)
        color.setZ(intersects[0].face.b, hoverColor.b)

        // vertice 3
        color.setX(intersects[0].face.c, hoverColor.r)
        color.setY(intersects[0].face.c, hoverColor.g)
        color.setZ(intersects[0].face.c, hoverColor.b)
        color.needsUpdate = true
      }
    })
  }
}

animate()

addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / innerWidth) * 2 - 1
  mouse.y = -(event.clientY / innerHeight) * 2 + 1
})

