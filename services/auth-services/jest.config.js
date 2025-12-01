module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'ts', 'json', 'node'],
  testPathIgnorePatterns: ['/node_modules/', '/build/', '/dist'],
  verbose: true,
  forceExit: false,
};
