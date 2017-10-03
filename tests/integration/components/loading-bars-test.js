import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('loading-bars', 'Integration | Component | loading bars', {
  integration: true
});

test('it renders', function(assert) {
  this.render(hbs`{{loading-bars}}`);
  assert.equal(this.$().text().trim(), 'Loading Audio...');
});
