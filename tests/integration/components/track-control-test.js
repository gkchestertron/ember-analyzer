import { moduleForComponent, test } from 'ember-qunit'
import hbs from 'htmlbars-inline-precompile'
import Ember from 'ember'

// stub the audio ctx
const audioCtxStub =  Ember.Service.extend({
  fx: [[
    { bypass: 1, name: 'Chorus' },
    { bypass: 1, name: 'Phaser' },
    { bypass: 1, name: 'Overdrive' },
    { bypass: 1, name: 'Compressor' }
  ]],

  gains: [
    { gain: { value: 1 } }
  ]
})

moduleForComponent('track-control', 'Integration | Component | track control', {
  integration: true,

	beforeEach: function () {
    this.register('service:audio-ctx', audioCtxStub)
    this.inject.service('audio-ctx', { as: 'audioCtx' })
  }
})

test('it renders', function(assert) {
  // Handle any actions with this.on('myAction', function(val) { ... })
  this.set('fx', this.get('audioCtx.fx.0'))

  this.render(hbs`{{track-control idx=0 fx=fx audioCtx=audioCtx}}`)

  assert.equal(this.$('button').length, 5, 'renders all the buttons')
})
