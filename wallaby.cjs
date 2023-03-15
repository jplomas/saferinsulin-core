/* eslint-disable */
module.exports = function (wallaby) {
  return {
    env: {
      type: 'node',
      runner: 'node',
    },
    files: ['src/*.js', 'package.json',],
    tests: ['test/*.js'],
    testFramework: 'mocha',
  };
};
