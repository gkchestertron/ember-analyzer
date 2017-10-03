import Ember from 'ember'

/**
 * helper for getting sum of two numbers
 */
export function sum(params) {
  return params.reduce((a, b) => {
    return a + b
  })
}

export default Ember.Helper.helper(sum)
