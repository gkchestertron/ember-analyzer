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
      this.set('audioCtx.gains.1.gain.value', 0.3) // rhythm guitar
      this.set('audioCtx.gains.2.gain.value', 2) // vocal

      // create the visualizer and append it to the body
      // let visualizer = createVisualizer(this.get('audioCtx'))
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
     * plays all the tracks from the beginning
     */
    togglePlay() {
      if (!this.get('audioCtx.playing')) {
        this.get('audioCtx').play()
      }
      else {
        this.get('audioCtx').stop()
      }
    },

    /**
     * pause playback if it's playing
     */
    pause() {
      this.get('audioCtx').pause()
    },

    /**
     * rewinds the tracks
     */
    rewind() {
      this.get('audioCtx').adjustTime(-10)
    },

    /**
     * update gain node for track when slider changes
     * @todo move this to the audioCtx - this is really ugly
     */
    sliderChanged(value, idx) {
      this.get('audioCtx.gains')[idx].gain.value = value/50
    },
  },

  audioCtx: Ember.inject.service('audio-ctx'),

  visualizer: Ember.inject.service('visualizer')
})
