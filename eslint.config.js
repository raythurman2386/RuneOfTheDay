// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require("eslint/config");
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    // jest.setup.js uses jest globals — tell ESLint to use the jest env there
    files: ["jest.setup.js", "**/__tests__/**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      globals: {
        jest: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        jasmine: "readonly",
      },
    },
  },
]);
