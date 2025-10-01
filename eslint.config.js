const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const eslintConfigGoogle = require('eslint-config-google');
const jsdoc = require('eslint-plugin-jsdoc')


module.exports = tseslint.config(
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    plugins: {
      jsdoc: jsdoc
    },
    rules: {
      "jsdoc/require-description": "warn",
      "jsdoc/valid-types": "error",
      "@typescript-eslint/no-explicit-any": "off"
    },
  },
);