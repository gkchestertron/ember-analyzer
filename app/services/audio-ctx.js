import Ember from 'ember'
import fxDefs from '../helpers/fx'

const SMOOTHING      = 0.8

let PAUSED_AT  = 0
let STARTED_AT = 0

export default Ember.Service.extend({
  init() {
    this._super(...arguments)

    // cross-browser audio context
    window.AudioContext = window.AudioContext || window.webkitAudioContext
    this.set('ctx', new AudioContext())
  },

  /**
   * adjusts playback offset by given diff in seconds
   * @param {number} diff - number of seconds to rewind
   */
  adjustTime(diff) {
    this.pause()

    // move pointer back
    PAUSED_AT += diff

    // make sure it's not before the start
    if (PAUSED_AT < 0)
      PAUSED_AT = 0

    this.play()
  },

  /**
   * fetches buffers by filename
   * @private
   * @param {string[]} files - an array of filenames
   * @returns {Promise}
   */
  fetchBuffers(files) {
    let self = this

    return new Promise((resolve, reject) => {
      let bufferLoader = new BufferLoader(this.get('ctx'), files, (bufferList) => resolve(bufferList))
      bufferLoader.load()
    })
    .then(bufferList => {
      // build the audio path
      let { fx, analyserNode, merger, gains } = buildAudioPath(bufferList.length, this.get('ctx'))

      // save the things
      this.setProperties({
        analyserNode : analyserNode,
        bufferList   : bufferList,
        fx           : fx,
        gains        : gains,
        merger       : merger
      })

      return bufferList
    })
  },

  /**
   * get the duration of the tracks
   * @returns {number}
   */
  getDuration() {
    return this.get('bufferList')[0].duration
  },

  /**
   * get current position of playback in seconds
   * @returns {number}
   */
  getPosition() {
    if (this.get('playing'))
      return this.get('ctx').currentTime - STARTED_AT
    else
      return PAUSED_AT
  },

  /**
   * pauses tracks
   */
  pause() {
    // block errantly setting pausedAt
    if (!this.get('playing'))
      return

    // stop them!
    this.tracks.forEach(track => track.stop(0))

    // track time
    PAUSED_AT = this.get('ctx').currentTime - STARTED_AT

    // set playToggleLabel
    this.set('playing', false)
  },

  /**
   * play tracks and init start/paused flags
   */
  play() {
    let offset = PAUSED_AT

    // create the tracks
    this.tracks = createTracks(this.bufferList, this.get('ctx'))

    // connect the tracks to the merger
    this.tracks.forEach((track, idx) => track.connect(this.fx[idx][0].input))

    // start em up
    this.tracks.forEach(track => track.start(0, offset))

    // track time
    STARTED_AT = this.get('ctx').currentTime - offset
    PAUSED_AT = 0

    // set playing flag
    this.set('playing', true)
  },

  /**
   * playing flag
   */
  playing: false,

  /**
   * stop the tracks and clears paused/started flags
   */
  stop() {
    // stop them!
    this.tracks.forEach(track => track.stop(0))

    // track time
    STARTED_AT = 0
    PAUSED_AT = 0

    // set playToggleLabel
    this.set('playing', false)
  }
})

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
  analyserNode.smoothingTimeConstant = SMOOTHING

  // create the merger
  let merger = audioCtx.createChannelMerger(numChannels)

  // create and connect the gain nodes
  let gains = Array(numChannels).fill().map((v,i) => {
    let gain = audioCtx.createGain()
    return gain
  })

  // create fx
  let fx = Array(numChannels).fill().map(() => {
    return Object.keys(fxDefs).map(name => {
      return new tuna[name](fxDefs[name])
    })
  })

  // main gain
  let mainGain = audioCtx.createGain()
  mainGain.gain.value = 1.5

  // build the path
  fx.forEach((chain, idx) => {
    // connect pedals together
    chain.forEach((pedal, jdx) => {
      if (jdx > 0)
        chain[jdx - 1].connect(pedal.input)
    })

    // connect to proper gain
    chain[chain.length - 1].connect(gains[idx])

    // connect gain to merger
    gains[idx].connect(merger)
  })

  // connect merger -> mainGain -> analyserNode
  merger.connect(mainGain)
  mainGain.connect(analyserNode)
  analyserNode.connect(audioCtx.destination)

  return { fx, gains, merger, analyserNode }
}

/**
 * creates an individual audio track
 * @private
 * @param {Buffer} buffer
 * @param {AudioContext} audioCtx
 * @returns {AudioBufferSourceNode}
 */
function createTrack(buffer, audioCtx) {
  let source = audioCtx.createBufferSource()
  source.buffer = buffer
  return source
}

/**
 * creates tracks to be played from a list of audio buffers
 * @private
 * @param {Buffer[]} bufferList - a list of buffers
 * @param {AudioContext} audioCtx
 * @returns {AudioBufferSourceNode}[]} - an array of source nodes
 */
function createTracks(bufferList, audioCtx) {
  return bufferList.map(buffer => {
    return createTrack(buffer, audioCtx)
  })
}
