import Ember from 'ember'

export default Ember.Component.extend({
  /**
   * load tracks and setup visualizer
   */
  init() {
    this._super(...arguments)

    // fetch the buffers
    this.get('audioCtx').fetchBuffers([
      './samples/guitar_1.mp3',
      './samples/guitar_2.mp3',
      './samples/vocal.mp3',
    ])

    // setup the visualizer
    .then(bufferList => {
      // hack to set initial gains
      this.set('audioCtx.gains.0.gain.value', 0.25) // rhythm guitar
      this.set('audioCtx.gains.1.gain.value', 0.3) // lead guitar
      this.set('audioCtx.gains.2.gain.value', 2) // vocal

      // create the visualizer and append it to the body
      this.set('visualizer', Ember.inject.service('visualizer'))
      document.body.appendChild(this.get('visualizer.el'))
    })
  },

  actions: {
    /**
     * fast forwards the tracks
     */
    fastForward() {
      this.get('audioCtx').adjustTime(10)
    },

    /**
     * play or pause track depending on state
     */
    togglePlay() {
      if (!this.get('audioCtx.playing')) {
        this.get('audioCtx').play()
      }
      else {
        this.get('audioCtx').pause()
      }
    },

    /**
     * stop playback
     */
    stop() {
      this.get('audioCtx').stop()
    },

    /**
     * rewinds the tracks
     */
    rewind() {
      this.get('audioCtx').adjustTime(-10)
    },

    /**
     * update gain node for track when slider changes
     * @param {number} value
     * @param {number} idx
     * @todo move this to the audioCtx - this is really ugly
     */
    sliderChanged(value, idx) {
      this.get('audioCtx.gains')[idx].gain.value = value/50
    },
  },

  /**
   * audio service
   */
  audioCtx: Ember.inject.service('audio-ctx'),

  /**
   * visualizer service
   */
  visualizer: Ember.inject.service('visualizer')
})
