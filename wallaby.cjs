/* eslint-disable */
module.exports = function (wallaby) {
  return {
    env: {
      type: 'node',
    },
    symlinkNodeModules: true,
    workers: { restart: true },
    files: ['package.json', 'src/**/*',
    ],
    tests: ['test/**/*', '!test/brute-force.test.*'],
    testFramework: 'mocha',
  };
};
