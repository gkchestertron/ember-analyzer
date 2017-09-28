import Ember from 'ember';

const NUM_CUBES   = 32
const COLOR       = 0xcc0000
const OFFSET      = -5
const TOTAL_WIDTH = 10
const WIDTH       = TOTAL_WIDTH/NUM_CUBES
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 )

camera.position.z = 5

export default Ember.Component.extend({
  /**
   * load and play tracks on init
   */
  init() {
    window.AudioContext = window.AudioContext || window.webkitAudioContext
    this.audioCtx  = new AudioContext()
    this.pausedAt  = 0
    this.startedAt = 0
    this.set('playing', false)

    let bufferLoader = new BufferLoader(
      this.audioCtx,
      [
        './samples/guitar_1.mp3',
        './samples/guitar_2.mp3',
        './samples/vocal.mp3',
      ],
      (bufferList) => {
        this.set('bufferList', bufferList)
        let { analyserNode, merger } = buildAudioPath(bufferList.length, this.audioCtx)
        createVisualizer(analyserNode)
        this.merger = merger
      }
    )

    bufferLoader.load()
    this._super()
  },

  actions: {
    pause() {
      // stop them!
      this.tracks.forEach(track => track.stop(0))

      // track time
      this.pausedAt = this.audioCtx.currentTime - this.startedAt;

      // set playToggleLabel
      this.set('playing', false)
    },

    /**
     * plays all the tracks from the beginning
     */
    togglePlay() {
      if (!this.playing) {
        let offset = this.pausedAt

        // create the tracks
        this.tracks = createTracks(this.bufferList, this.audioCtx)

        // connect the tracks to the merger
        this.tracks.forEach(track => track.connect(this.merger))
        
        // start em up
        this.tracks.forEach(track => track.start(0, offset))

        // track time
        this.startedAt = this.audioCtx.currentTime - offset;
        this.pausedAt = 0;

        // set playToggleLabel
        this.set('playing', true)
      }
      else {
        // stop them!
        this.tracks.forEach(track => track.stop(0))

        // track time
        this.startedAt = 0;
        this.pausedAt = 0;

        // set playToggleLabel
        this.set('playing', false)
      }
    }
  },

  playing: false
});

/**
 * builds the audio path
 * @private
 * @param {Number} numChannels
 * @param {AudioContext} audioCtx
 * @return {}
 */
function buildAudioPath(numChannels, audioCtx) {
  // create the analyserNode
  let analyserNode = audioCtx.createAnalyser()
  analyserNode.fftSize = 2048
  analyserNode.smoothingTimeConstant = .8;

  // create the merger
  let merger = audioCtx.createChannelMerger(numChannels)

  // build the path
  merger.connect(analyserNode)
  analyserNode.connect(audioCtx.destination)

  return { merger, analyserNode }
}

/**
 * creates tracks to be played from a list of audio buffers
 * @private
 * @param {Buffer[]} bufferList
 * @returns {AudioBufferSourceNode[]}
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

function createVisualizer(analyserNode) {
  // crete the scene
  let scene = new THREE.Scene()

  // add some lighting
  var light = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 )
  scene.add(light)

  var renderer = new THREE.WebGLRenderer()
  renderer.setSize( window.innerWidth - 10, window.innerHeight -10 )
  document.body.appendChild( renderer.domElement )

  let cubes = addCubes(analyserNode, scene)

  var animate = function () {
    requestAnimationFrame( animate )
    updateCubes(analyserNode, cubes)
    renderer.render(scene, camera)
  }

  animate()
}

function addCubes(analyserNode, scene) {
  let cubes = []

  for (let i = 0; i < NUM_CUBES; i++) {
    let offset = OFFSET + (i * WIDTH)
    cubes.push(addCube(scene, offset, WIDTH/1.5, COLOR, i))
  }

  return cubes
}

function addCube(scene, offset, width, color, idx) {
  var geometry = new THREE.BoxGeometry( width, width, width )
  var material = new THREE.MeshPhongMaterial( { color: color + (idx * 5) } )
  var cube = new THREE.Mesh( geometry, material )
  cube.position.set(offset, 0, 0) 
  scene.add( cube )
  cube.rotation.x = 0.3
  cube.rotation.y = 0.3
  return cube
}

function updateCubes(analyserNode, cubes) {
  let freqByteData = new Uint8Array(analyserNode.frequencyBinCount)
  analyserNode.getByteFrequencyData(freqByteData) 
  let bucketSize = analyserNode.frequencyBinCount/NUM_CUBES

  for (let i = 0; i < NUM_CUBES; i++) {
    let freq = i * bucketSize
    let cube = cubes[i]
    let avg = freqByteData.slice(freq, (i + 1) * bucketSize)
      .reduce((a, b) => a + b)/bucketSize

    updateCube(cube, avg, freq + 20)
  }
}

function updateCube(cube, value, freq) {
  cube.scale.y = (value/255) * 20 + 0.5
  cube.rotation.y += 0.05
}
