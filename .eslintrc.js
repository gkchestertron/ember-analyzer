module.exports = {
  globals: {
    Tuna: true, 
    BufferLoader: true, 
    Promise: true,
    Uint8Array: true,
    THREE: true
  },
  root: true,
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module'
  },
  extends: 'eslint:recommended',
  env: {
    browser: true
  },
  rules: {
  }
};
