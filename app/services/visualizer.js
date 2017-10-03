import Ember from 'ember';

/**
 * constants for visualizer options
 * @todo make these dynamic options that can be passed to init
 */
const COLOR          = 0xcc0000
const OFFSET         = -5
const INITIAL_HEIGHT = 0.5
const NUM_CUBES      = 48
const SCALE          = 50
const ROTATION_RATE  = 0.02
const TOTAL_WIDTH    = 10
const TRACKING_COLOR = 0xdd00ee
const WIDTH          = TOTAL_WIDTH/NUM_CUBES

export default Ember.Service.extend({
  /**
   * create the scene/camera
   * make all the cubes
   * setup the animation
   */
  init() {
    // get the audio context
    let audioCtx = this.get('audioCtx')

    // crete the scene
    let scene = new THREE.Scene()

    // create the camera
    let camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000)
    camera.position.z = 5

    // add some lighting
    var light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 )
    scene.add(light)

    // create renderer
    var renderer = new THREE.WebGLRenderer()
    renderer.setSize(window.innerWidth - 10, window.innerHeight -10)

    // add cubes for frequency visualization
    let cubes = addCubes(scene, NUM_CUBES, OFFSET, WIDTH, COLOR)

    // add cube for tracking position in song
    let trackingCube = createCube(OFFSET, WIDTH/2, TRACKING_COLOR)
    trackingCube.position.y = -0.5
    scene.add(trackingCube)

    // animate update of cubes
    let animate = function () {
      // get the animation frame
      requestAnimationFrame(animate)
      
      let position = audioCtx.getPosition()
      let duration = audioCtx.getDuration()

      // update analyser cubes
      updateCubes(audioCtx.get('analyserNode'), cubes)

      // update the tracking cube
      updateTrackingCube(trackingCube, duration, position)

      // draw the scene
      renderer.render(scene, camera)
    }
    animate()

    // return the dom element for appending
    this.set('el', renderer.domElement)
  },

  audioCtx: Ember.inject.service('audio-ctx'),
});


/**
 * updates tracking cube
 * @private
 * @param {THREE.Mesh} trackingCube
 * @param {number} duration
 * @param {number} position
 */
function updateTrackingCube(trackingCube, duration, position) {
  trackingCube.rotation.y += ROTATION_RATE * 2
  trackingCube.rotation.x += ROTATION_RATE

  // fail fast if not playing
  if (position > duration || position < 0)
    return

  // set the position
  let secWidth = TOTAL_WIDTH/duration
  trackingCube.position.x = (secWidth * position) + OFFSET
}

/**
 * adds all the cubes to the scene
 * @private
 * @param {THREE.Scene} scene
 * @param {number} num
 * @param {number} offset
 * @param {number} width
 * @param {number} color
 * @returns {THREE.Mesh[]}
 */
function addCubes(scene, num, offset, width, color) {
  let cubes = []

  for (let i = 0; i < NUM_CUBES; i++) {
    let offset = OFFSET + (i * WIDTH)
    let cube = createCube(offset, WIDTH/2,  color + (i * 5))
    scene.add(cube)
    cubes.push(cube)
  }

  return cubes
}

/**
 * creates a cube
 * @private
 * @param {number} offset - offset from the left edge of the analyzer
 * @param {number} width - width of space for cube
 * @param {number} color - hexidecimal number for cube
 * @returns {THREE.Mesh}
 */
function createCube(offset, width, color) {
  var geometry = new THREE.BoxGeometry( width, width, width )
  var material = new THREE.MeshPhongMaterial( { color: color} )
  var cube = new THREE.Mesh( geometry, material )
  cube.position.set(offset, 0, 0) 
  cube.rotation.x = 0.3
  cube.rotation.y = 0.3
  return cube
}

/**
 * updates the properties of a cube
 * @private
 * @param {THREE.Mesh} cube - cube mesh to update
 * @param {number} value - value to use for update
 * @param {boolean} clockwise - direction for rotation
 */
function updateCube(cube, value, clockwise) {
  cube.scale.y = (value/255) * SCALE + INITIAL_HEIGHT

  if (clockwise)
    cube.rotation.y += ROTATION_RATE
  else
    cube.rotation.y -= ROTATION_RATE
}

/**
 * updates a list of cubes, given an analyserNode
 * @private
 * @param {AnalyserNode} analyserNode
 * @param {THREE.Mesh[]} cubes
 */
function updateCubes(analyserNode, cubes) {
  let freqByteData = new Uint8Array(analyserNode.frequencyBinCount)
  analyserNode.getByteFrequencyData(freqByteData) 
  let bucketSize = analyserNode.frequencyBinCount/NUM_CUBES

  for (let i = 0; i < NUM_CUBES; i++) {
    let freq = i * bucketSize
    let cube = cubes[i]
    let avg = freqByteData.slice(freq, (i + 1) * bucketSize)
      .reduce((a, b) => a + b)/bucketSize

    updateCube(cube, avg, i % 2 === 0)
  }
}
