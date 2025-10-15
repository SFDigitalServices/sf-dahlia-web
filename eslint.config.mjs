import { defineConfig } from "eslint/config"
import js from "@eslint/js"
import globals from "globals"
import tsEslint from "typescript-eslint"
import tsParser from "@typescript-eslint/parser"
import unicorn from "eslint-plugin-unicorn"
import react from "eslint-plugin-react"
import reactHooks from "eslint-plugin-react-hooks"
import jsxA11y from "eslint-plugin-jsx-a11y"
import jest from "eslint-plugin-jest"
import cypress from "eslint-plugin-cypress"
import importPlugin from "eslint-plugin-import"
import unusedImports from "eslint-plugin-unused-imports"

export default defineConfig(
  // ==========================================================================
  // Global Ignores
  // ==========================================================================

  {
    ignores: [
      "app/assets/**", // Legacy Rails assets
      "lib/**", // Ruby library code
      "*.config.js",
      "config/webpack/**/*",
      "lighthouserc.js",
      "public/**",
      "node_modules/**",
      "spec/e2e/**", // Legacy E2E tests
      "spec/javascripts/**", // Legacy Jasmine tests
      "**/.eslintrc.js", // Old ESLint config files
      "cypress.config.ts",
      "Gruntfile.js",
      ".storybook/**",
      "jest-test-coverage/**",
    ],
  },

  // ==========================================================================
  // Language Options
  // ==========================================================================

  {
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      parser: tsParser,
      parserOptions: {
        tsconfigRootDir: import.meta.dirname, // Root directory for tsconfig
        project: ["tsconfig.lint.json"], // TypeScript project config
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2015,
        ...globals.amd,
        Atomics: "readonly",
        SharedArrayBuffer: "readonly",
      },
    },
  },

  // ==========================================================================
  // Shared Configs (Spread into Array)
  // ==========================================================================

  js.configs.recommended,
  tsEslint.configs.recommendedTypeChecked,
  // tsEslint.configs.stylisticTypeChecked,
  unicorn.configs.recommended,
  react.configs.flat.recommended,
  reactHooks.configs.flat.recommended,
  jsxA11y.flatConfigs.recommended,

  // ==========================================================================
  // Base Configuration for All JS/TS Files
  // ==========================================================================

  {
    files: ["**/*.{js,jsx,ts,tsx}"],

    plugins: {
      react: react,
      "react-hooks": reactHooks,
      "unused-imports": unusedImports,
    },

    // https://eslint.org/blog/2025/03/flat-config-extends-define-config-global-ignores/#bringing-back-extends
    extends: [importPlugin.flatConfigs.recommended, importPlugin.flatConfigs.typescript],

    rules: {
      "no-use-before-define": "off", // disabled to allow usage of typescript/no-use-before-define
      "no-void": [
        "error",
        {
          allowAsStatement: true,
        },
      ],

      // Semicolon rule from eslint-plugin-sfgov/recommended
      // We generally don't need or want semicolons, but we should require them
      // before so-called continuation characters like "(" and "[", because
      // automatic semicolon insertion doesn't "fix" cases like this.
      // This prevents difficult-to-decipher errors like: Uncaught TypeError: "bar" is not a function
      semi: [
        "error",
        "never",
        {
          beforeStatementContinuationChars: "always",
        },
      ],

      // ======================================================================
      // https://github.com/typescript-eslint/typescript-eslint
      // ======================================================================

      "@typescript-eslint/no-use-before-define": "error",
      // These rules catches various usecases of variables typed as "any", since they won"t be flagged by the TS
      // compiler and thus are potential sources of issues. The current codebase has too many uses of `any` to make
      // these effective rules though, so disabling them for now.
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-return": "off",

      // 26 violations
      "@typescript-eslint/no-require-imports": "off",
      // 12 violations
      "@typescript-eslint/no-unused-vars": "off",
      // 9 violations
      "@typescript-eslint/no-unused-expressions": "off",

      // ======================================================================
      // https://github.com/sweepline/eslint-plugin-unused-imports
      // ======================================================================

      // Unused imports is the same as no-unused-vars except it splits imports
      // and vars into two separate rules, and has autofix, so here we turn on
      // both of the unused-imports rules and turn off the no-unused-vars rule.
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "error",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],

      // ======================================================================
      // https://github.com/jsx-eslint/eslint-plugin-react
      // ======================================================================

      "react/display-name": "off",
      "react/jsx-uses-vars": "error",
      "react/jsx-uses-react": "error",
      "react/prop-types": "error",
      "react/self-closing-comp": "error",

      // 11 violations
      "react/jsx-no-target-blank": "off",
      // 2 violations
      "react/no-unescaped-entities": "off",

      // ======================================================================
      // https://github.com/facebook/react/tree/main/packages/eslint-plugin-react-hooks
      // ======================================================================

      "react-hooks/exhaustive-deps": "error",

      // 4 violations
      "react-hooks/set-state-in-effect": "off",

      // ======================================================================
      // https://github.com/sindresorhus/eslint-plugin-unicorn
      // ======================================================================

      // this rule auto-corrects regex to make it simpler. Unfortunately, we
      // can't depend on all regex parsers to work the same, so we're turning
      // it off.
      "unicorn/better-regex": "off",
      "unicorn/filename-case": "off",
      "unicorn/no-array-for-each": "off",
      "unicorn/no-array-reduce": "off",
      "unicorn/no-negated-condition": "off",
      "unicorn/no-array-reverse": "off",
      "unicorn/no-null": "off",
      "unicorn/no-unnecessary-polyfills": "off",
      "unicorn/no-useless-undefined": "off",
      "unicorn/numeric-separators-style": "off",
      "unicorn/prefer-at": "off",
      "unicorn/prefer-global-this": "off",
      "unicorn/prefer-module": "off",
      "unicorn/prevent-abbreviations": "off",
      "unicorn/switch-case-braces": "off",

      // 10 violations
      "unicorn/prefer-string-raw": "off",
      // 5 violations
      "unicorn/no-named-default": "off",
      // 5 violations
      "unicorn/prefer-string-replace-all": "off",
      // 4 violations
      "unicorn/no-array-sort": "off",
      // 4 violations
      "unicorn/prefer-node-protocol": "off",
      // 2 violations
      "unicorn/prefer-structured-clone": "off",
      // 1 violation
      "unicorn/no-await-expression-member": "off",
    },

    // Shared settings (available to all rules)
    // These are plugin-specific settings that don't fit into other categories
    settings: {
      react: {
        version: "detect",
      },
      "import/resolver": {
        typescript: true,
        node: {
          moduleDirectory: ["node_modules", "app/javascript"],
          extensions: [".js", ".jsx", ".ts", ".tsx", ".d.ts"],
        },
      },
    },
  },

  // ============================================================================
  // 4. Jest Test Files Configuration
  // ============================================================================

  {
    files: ["**/__tests__/**/*.{ts,tsx,js,jsx}"],
    plugins: {
      jest: jest,
    },
    extends: [jest.configs["flat/recommended"]],
    rules: {
      ...jest.configs["flat/recommended"].rules,
      "jest/no-disabled-tests": "warn",
      "jest/no-focused-tests": "error",
      "jest/no-identical-title": "error",
      "jest/no-done-callback": "off",
      "jest/valid-expect": "error",
      // Don't always require expects, some of our frontend integration tests
      // should pass as long as they don't timeout
      "jest/expect-expect": "off",
      "jest/require-top-level-describe": "error",
      "jest/no-conditional-expect": "error",
      "jest/consistent-test-it": ["error", { fn: "it", withinDescribe: "it" }],
      "jest/prefer-lowercase-title": [
        "error",
        {
          ignore: ["describe"],
        },
      ],

      // 18 violations
      "jest/prefer-to-be": "off",
    },
  },

  // ============================================================================
  // 5. Cypress E2E Test Files
  // ============================================================================

  {
    files: ["cypress/**/*.{ts,js}"],
    extends: [cypress.configs.recommended],
    rules: {
      // Cypress uses Chai's expect(), not Jest's expect()
      // Disable Jest's expect validation to avoid false positives
      "jest/valid-expect": "off",

      // 3 violations
      "cypress/no-unnecessary-waiting": "off",
      // 37 violations
      "cypress/unsafe-to-chain-command": "off",
    },
  }
)
