import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['track-control-wrapper'],

  sliderRange: { min: 0, max: 100 },
  
  /**
   * get the initial gain value for a track
   * @returns number
   */
  gainValue: Ember.computed(function () {
    return this.get('audioCtx.gains')[this.get('idx')].gain.value*50
  }),

  actions: {
    /**
     * turns off bypass for a pedal
     * @param {object} pedal - the tuna pedal object
     * @param {number} idx - index of the pedal in the chain
     */
    activatePedal(pedal, idx) {
      if (pedal.bypass)
        this.set(`fx.${idx}.bypass`, 0)
      else
        this.set(`fx.${idx}.bypass`, 1)
    },

    /**
     * sends the value and index of track up to parent component
     * @param {number} value
     */
    sliderChanged(value) {
      this.sendAction('sliderChanged', value, this.idx)
    }
  }
})
