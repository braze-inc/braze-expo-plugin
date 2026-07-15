const preset = require('expo-module-scripts/jest-preset-plugin');

module.exports = {
  ...preset,
  moduleNameMapper: {
    ...preset.moduleNameMapper,
    // Maps require.resolve('@braze/expo-plugin/ios/…') to a resolvable stub
    // so withBrazeDangerousMod tests work without the native iOS files present.
    '^@braze/expo-plugin/ios/.*$': '<rootDir>/src/__tests__/__mocks__/iosAssetStub.js',
  },
};
