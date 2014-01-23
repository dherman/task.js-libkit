module.exports = {
  // Task
  options: {
    includeRuntime: true
  },
  dist: {
    expand: true,
    src: 'test/**/*_test.js',
    dest: 'tmp/regenerator/'
  }
};
