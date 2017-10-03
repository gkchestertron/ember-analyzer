import { moduleForComponent, test } from 'ember-qunit'
import hbs from 'htmlbars-inline-precompile'
import Ember from 'ember'

// stub the audio ctx
const audioCtxStub = Ember.Service.extend({
  fetchBuffers() {
    return Promise.resolve()
  },

  gains: [
    { gain: { value: 1 } },
    { gain: { value: 1 } },
    { gain: { value: 1 } }
  ],

  play() {
    this.set('playing', true)
  },

  pause() {
    this.set('playing', false)
  },

  stop() {
    this.set('playing', false)
  },

  playing: false
})

// stub the visualizer
const visualizerStub = Ember.Service.extend({
  el: document.createElement('canvas')
})

moduleForComponent('audio-visualizer', 'Integration | Component | audio visualizer', {
  integration: true,

	beforeEach: function () {
    // inject service stubs
    this.register('service:audio-ctx', audioCtxStub)
    this.inject.service('audio-ctx', { as: 'audioCtx' })
    this.register('service:visualizer', visualizerStub)
    this.inject.service('visualizer', { as: 'visualizer' })
  }
})

test('it renders', function (assert) {
  assert.expect(2)

  this.render(hbs`{{audio-visualizer}}`)

  assert.equal(this.$('div.loader').length, 1, 'Initially loads with loading bar')

  return new Promise(resolve => {
    setTimeout(() => {
        resolve(assert.equal(document.getElementsByTagName('canvas').length, 1, 'Contains canvas after load'))
    }, 200)
  })
})

test('main controls change playing state', function (assert) {
  assert.expect(4)

  this.render(hbs`{{audio-visualizer}}`)

  return new Promise(resolve => {
    setTimeout(() => { resolve() }, 200)
  })
  .then(() => {
    this.$('button.play').click()
    assert.equal(this.$('button.pause').length, 1,
      'clicking play changes play button to pause button')

    this.$('button.pause').click()
    assert.equal(this.$('button.play').length, 1,
      'clicking pause changes pause button to play button')

    this.$('button.play').click()
    assert.equal(this.$('button.pause').length, 1,
      'clicking play changes play button to pause button again')

    this.$('button.stop').click()
    assert.equal(this.$('button.play').length, 1,
      'clicking stop changes pause button to play')

    return null
  })
})
