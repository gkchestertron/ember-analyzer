import Ember from 'ember';
import fxDefs from '../helpers/fx'

// constants for visualizer options
const COLOR          = 0xcc0000
const OFFSET         = -5
const INITIAL_HEIGHT = 0.5
const NUM_CUBES      = 48
const SCALE          = 50
const ROTATION_RATE  = 0.02
const SMOOTHING      = 0.8
const TOTAL_WIDTH    = 10
const TRACKING_COLOR = 0xdd00ee
const WIDTH          = TOTAL_WIDTH/NUM_CUBES

export default Ember.Component.extend({

  /**
   * load tracks and setup visualizer
   */
  init() {
    // cross-browser audio context
    window.AudioContext = window.AudioContext || window.webkitAudioContext
    this.audioCtx = new AudioContext()

    // flags
    this.pointers = {
      pausedAt: 0,
      startedAt: 0
    }
    this.set('pointers.playing', false) // using set makes it reactive

    // create the camera
    let camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000)
    camera.position.z = 5

    // fetch the buffers
    fetchBuffers(this.audioCtx, [
      './samples/guitar_1.mp3',
      './samples/guitar_2.mp3',
      './samples/vocal.mp3',
    ])

    // setup the visualizer
    .then(bufferList => {
      // save bufferList
      this.set('bufferList', bufferList)

      // build the audio path
      let { fx, analyserNode, merger, gains } = buildAudioPath(bufferList.length, this.audioCtx)
      this.merger = merger
      this.gains  = gains
      this.set('fx', fx)

      // create the visualizer and append it to the body
      let visualizer = createVisualizer(this.audioCtx, analyserNode, camera, bufferList[0], this.pointers)
      document.body.appendChild(visualizer)
    })

    this._super(...arguments)
  },

  actions: {

    /**
     * plays all the tracks from the beginning
     */
    togglePlay() {
      if (!this.pointers.playing) {
        this.play()
      }
      else {
        this.stop()
      }
    },

    /**
     * pause playback if it's playing
     */
    pause() {
      // block errantly setting pausedAt
      if (!this.pointers.playing)
        return

      // stop them!
      this.tracks.forEach(track => track.stop(0))

      // track time
      this.pointers.pausedAt = this.audioCtx.currentTime - this.pointers.startedAt;

      // set playToggleLabel
      this.set('pointers.playing', false)
    },

    /**
     * update gain node for track when slider changes
     */
    sliderChanged(value, idx) {
      this.gains[idx].gain.value = value/50
    }
  },

  /**
   * play tracks and init start/paused flags
   */
  play() {
    let offset = this.pointers.pausedAt

    // create the tracks
    this.tracks = createTracks(this.bufferList, this.audioCtx)

    // connect the tracks to the merger
    this.tracks.forEach((track, idx) => track.connect(this.fx[idx][0].input))

    // start em up
    this.tracks.forEach(track => track.start(0, offset))

    // track time
    this.pointers.startedAt = this.audioCtx.currentTime - offset;
    this.pointers.pausedAt = 0;

    // set playToggleLabel
    this.set('pointers.playing', true)
  },

  /**
   * stop the tracks and clears paused/started flags
   */
  stop() {
    // stop them!
    this.tracks.forEach(track => track.stop(0))

    // track time
    this.pointers.startedAt = 0;
    this.pointers.pausedAt = 0;

    // set playToggleLabel
    this.set('pointers.playing', false)
  }
});

/**
 * builds the audio path
 * @private
 * @param {number} numChannels - number of channels
 * @param {AudioContext} audioCtx - the component's audio context
 * @return {}
 */
function buildAudioPath(numChannels, audioCtx) {
  let tuna = new Tuna(audioCtx)

  // create the analyserNode
  let analyserNode = audioCtx.createAnalyser()
  analyserNode.fftSize = 2048
  analyserNode.smoothingTimeConstant = SMOOTHING;

  // create the merger
  let merger = audioCtx.createChannelMerger(numChannels)

  // create and connect the gain nodes
  let gains = Array(numChannels).fill().map((v,i) => {
    let gain = audioCtx.createGain()

    if (i === 2)
      gain.gain.value = 2 // ugly hack for bad vocal track volume
    else
      gain.gain.value = 0.5
    return gain
  })

  // create fx
  let fx = Array(numChannels).fill().map(() => {
    return Object.keys(fxDefs).map(name => {
      return new tuna[name](fxDefs[name])
    })
  })

  // build the path
  fx.forEach((chain, idx) => {
    // connect pedals together
    chain.forEach((pedal, jdx) => {
      if (jdx > 0)
        chain[jdx - 1].connect(pedal.input)
    })

    chain[chain.length - 1].connect(gains[idx])
    gains[idx].connect(merger)
  })
  merger.connect(analyserNode)
  analyserNode.connect(audioCtx.destination)

  return { fx, gains, merger, analyserNode }
}


/**
 * creates tracks to be played from a list of audio buffers
 * @private
 * @param {Buffer[]} bufferList - a list of buffers
 * @returns {AudioBufferSourceNode}[]} - an array of source nodes
 */
function createTracks(bufferList, audioCtx) {
  return bufferList.map(buffer => {
    return createTrack(buffer, audioCtx)
  })
}

/**
 * creates an individual audio track
 * @private
 * @param {Buffer} buffer
 * @returns {AudioBufferSourceNode}
 */
function createTrack(buffer, audioCtx) {
  let source = audioCtx.createBufferSource()
  source.buffer = buffer;
  return source
}

/**
 * creates the 3d visualizer for the audio
 * @private
 * @param {AudioBufferSourceNode} audioCtx
 * @param {AnalyserNode} analyserNode
 * @param {THREE.PerspectiveCamera} camera
 * @param {AudioBuffer} buffer
 * @param {object} pointers
 * @returns {Element}
 */
function createVisualizer(audioCtx, analyserNode, camera, buffer, pointers) {
  // crete the scene
  let scene = new THREE.Scene()

  // add some lighting
  var light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 )
  scene.add(light)

  // create renderer
  var renderer = new THREE.WebGLRenderer()
  renderer.setSize(window.innerWidth - 10, window.innerHeight -10)

  // add cubes for frequency visualization
  let cubes = addCubes(analyserNode, scene)

  // add cube for tracking position in song
  let trackingCube = createCube(OFFSET, WIDTH/2, TRACKING_COLOR)
  trackingCube.position.y = -0.5
  scene.add(trackingCube)

  // animate update of cubes
  let animate = function (force) {
    // get the animation frame
    requestAnimationFrame(animate)
    
    // update analyser cubes
    updateCubes(analyserNode, cubes)

    // update the tracking cube
    updateTrackingCube(audioCtx.currentTime, buffer.duration, pointers, trackingCube)

    // draw the scene
    renderer.render(scene, camera)
  }
  animate()

  // return the dom element for appending
  return renderer.domElement
}

/**
 * updates tracking cube
 * @private
 * @param {number} currentTime
 * @param {number} duration
 * @param {object} pointers
 * @param {THREE.Mesh} trackingCube
 */
function updateTrackingCube(currentTime, duration, pointers, trackingCube) {
  trackingCube.rotation.y += ROTATION_RATE * 2
  trackingCube.rotation.x += ROTATION_RATE

  let position = (currentTime - pointers.startedAt)

  // fail fast if not playing
  if (!pointers.playing || position > duration)
    return

  // set the position
  let secWidth = TOTAL_WIDTH/duration
  trackingCube.position.x = (secWidth * position) + OFFSET
}

/**
 * adds all the cubes to the scene
 * @private
 * @param {AnalyserNode} analyserNode
 * @param {THREE.Scene} scene
 * @returns {THREE.Mesh[]}
 */
function addCubes(analyserNode, scene) {
  let cubes = []

  for (let i = 0; i < NUM_CUBES; i++) {
    let offset = OFFSET + (i * WIDTH)
    let cube = createCube(offset, WIDTH/2,  COLOR + (i * 5))
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
 * fetches buffers by filename
 * @private
 * @param {AudioContext} audioCtx - an audio context
 * @param {string[]} files - an array of filenames
 * @returns {Promise}
 */
function fetchBuffers(audioCtx, files) {
  return new Promise((resolve, reject) => {
    let bufferLoader = new BufferLoader(audioCtx, files, (bufferList) => resolve(bufferList))
    bufferLoader.load()
  })
}
