/**
 * ============================================================================
 * ESLint v9 Flat Config
 * ============================================================================
 * 
 * This file uses ESLint's new "flat config" format (eslint.config.mjs),
 * which became the default in ESLint v9. Flat config replaces the legacy
 * .eslintrc.js format with a more explicit, JavaScript-based configuration.
 * 
 * KEY CONCEPTS:
 * 
 * 1. Configuration Array:
 *    - The default export is an array of configuration objects
 *    - Each object defines rules for specific file patterns
 *    - Objects are processed in order (later configs override earlier ones)
 * 
 * 2. Explicit Imports:
 *    - All plugins and configs must be explicitly imported
 *    - No more "magic" plugin resolution from node_modules
 *    - This makes dependencies clear and explicit
 * 
 * 3. Config Object Structure:
 *    Each config object can contain:
 *    - files: Glob patterns for which files this config applies to
 *    - ignores: Glob patterns for files to ignore
 *    - languageOptions: Parser, ecmaVersion, sourceType, globals
 *    - plugins: Object mapping plugin names to plugin objects
 *    - rules: Rule configurations
 *    - settings: Shared settings (e.g., React version)
 * 
 * 4. Config Precedence:
 *    - Configs are applied in array order
 *    - Later configs override earlier ones for matching files
 *    - More specific file patterns take precedence
 *    - Use this to create base configs and then override for specific cases
 * 
 * MIGRATION NOTES:
 * - Migrated from ESLint v8 with .eslintrc.js to ESLint v9 with flat config
 * - All plugins updated to flat config-compatible versions
 * - eslint-plugin-node replaced with eslint-plugin-n (maintained fork)
 * - eslint-plugin-sfgov removed (custom plugin, not flat config compatible)
 * - See .kiro/specs/eslint-v9-migration/ for detailed migration documentation
 */

// ============================================================================
// Plugin and Config Imports
// ============================================================================
// All plugins and shared configs must be explicitly imported.
// This replaces the old "extends" and "plugins" arrays from .eslintrc.js.

import js from '@eslint/js';                          // ESLint core recommended rules
import globals from 'globals';                        // Environment globals (browser, node, etc.)
import tseslint from '@typescript-eslint/eslint-plugin';  // TypeScript linting
import tsparser from '@typescript-eslint/parser';     // TypeScript parser
import prettier from 'eslint-plugin-prettier';        // Prettier integration
import prettierConfig from 'eslint-config-prettier';  // Disables ESLint rules that conflict with Prettier
import unicorn from 'eslint-plugin-unicorn';          // Additional best practices
import react from 'eslint-plugin-react';              // React-specific rules
import reactHooks from 'eslint-plugin-react-hooks';   // React Hooks rules
import jsxA11y from 'eslint-plugin-jsx-a11y';         // Accessibility rules for JSX
import jest from 'eslint-plugin-jest';                // Jest testing rules
import cypress from 'eslint-plugin-cypress';          // Cypress E2E testing rules
import importPlugin from 'eslint-plugin-import';      // ES6 import/export rules
import unusedImports from 'eslint-plugin-unused-imports';  // Auto-remove unused imports
import n from 'eslint-plugin-n';                      // Node.js rules (replaces deprecated eslint-plugin-node)
import promise from 'eslint-plugin-promise';          // Promise best practices

// ============================================================================
// Configuration Array
// ============================================================================
// The default export is an array of configuration objects.
// Configs are applied in order, with later configs overriding earlier ones.

export default [
  // ============================================================================
  // 1. Global Ignores
  // ============================================================================
  // Files and directories to ignore across ALL configurations.
  // This config object ONLY contains "ignores" - no other properties.
  // When a config object contains ONLY "ignores", it applies globally.
  // 
  // NOTE: In flat config, directory patterns should include "/**" suffix
  // to ignore all files within that directory.
  {
    ignores: [
      "app/assets/**",                    // Legacy Rails assets
      "lib/**",                           // Ruby library code
      "*.config.js",                      // Config files (webpack, etc.)
      "config/webpack/**/*",              // Webpack configuration
      "lighthouserc.js",                  // Lighthouse CI config
      "public/**",                        // Static public assets
      "node_modules/**",                  // Dependencies
      "spec/e2e/**",                      // Legacy E2E tests
      "spec/javascripts/**",              // Legacy Jasmine tests
      "**/.eslintrc.js",                  // Old ESLint config files
      "cypress.config.ts",                // Cypress config
      "Gruntfile.js",                     // Grunt config
      ".storybook/**",                    // Storybook config
      "stories/**",                       // Storybook stories
      "app/javascript/test-coverage/**",  // Test coverage reports
    ],
  },

  // ============================================================================
  // 2. Shared Configs (Spread into Array)
  // ============================================================================
  // These are pre-configured rule sets from ESLint and plugins.
  // They are spread directly into the config array.
  // 
  // IMPORTANT: Order matters! Later configs override earlier ones.
  // Place more general configs first, then more specific ones.

  // ESLint's recommended rules (replaces "extends: ['eslint:recommended']")
  js.configs.recommended,

  // Prettier config - disables ESLint rules that conflict with Prettier
  // This should come AFTER other configs to ensure it properly disables conflicts
  prettierConfig,

  // ============================================================================
  // 3. Base Configuration for All JS/TS Files
  // ============================================================================
  // This is the main configuration object that applies to all JavaScript
  // and TypeScript files in the project.
  // 
  // HOW TO ADD A NEW PLUGIN:
  // 1. Install the plugin: yarn add -D eslint-plugin-example
  // 2. Import it at the top: import example from 'eslint-plugin-example';
  // 3. Add to plugins object: 'example': example,
  // 4. Configure rules: 'example/rule-name': 'error',
  // 
  // HOW TO ADD A NEW RULE:
  // 1. Find the rule in the plugin documentation
  // 2. Add to the rules object below
  // 3. Format: 'plugin-name/rule-name': 'off' | 'warn' | 'error'
  // 4. Or with options: 'plugin-name/rule-name': ['error', { option: value }]
  // 
  // HOW TO OVERRIDE A RULE FOR SPECIFIC FILES:
  // 1. Create a new config object after this one
  // 2. Set files: ['path/to/files/**/*.ts']
  // 3. Set rules: { 'rule-name': 'off' }
  // 4. The new config will override this base config for matching files
  {
    // File patterns this config applies to
    files: ["**/*.{js,jsx,ts,tsx}"],

    // Language configuration (replaces old "env", "parser", "parserOptions")
    languageOptions: {
      ecmaVersion: 2020,                  // ECMAScript version to parse
      sourceType: "module",               // Use ES modules (import/export)
      parser: tsparser,                   // Use TypeScript parser for all files
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,  // Root directory for tsconfig
        project: ["tsconfig.lint.json"],       // TypeScript project config
      },
      // Global variables (replaces old "env" property)
      // Spread in environment-specific globals from the "globals" package
      globals: {
        ...globals.browser,               // window, document, etc.
        ...globals.node,                  // process, __dirname, etc.
        ...globals.es2015,                // Promise, Map, Set, etc.
        ...globals.amd,                   // AMD module globals
        Atomics: "readonly",              // Custom global
        SharedArrayBuffer: "readonly",    // Custom global
      },
    },

    // Plugins (replaces old "plugins" array)
    // Each plugin must be explicitly imported and mapped to a name.
    // The name (key) is used in rule names: 'plugin-name/rule-name'
    plugins: {
      '@typescript-eslint': tseslint,     // TypeScript-specific rules
      'react': react,                     // React-specific rules
      'react-hooks': reactHooks,          // React Hooks rules
      'jsx-a11y': jsxA11y,                // Accessibility rules for JSX
      'prettier': prettier,               // Prettier integration
      'unicorn': unicorn,                 // Additional best practices
      'import': importPlugin,             // ES6 import/export rules
      'unused-imports': unusedImports,    // Auto-remove unused imports
      'jest': jest,                       // Jest testing rules
      'promise': promise,                 // Promise best practices
      'n': n,                             // Node.js rules
    },

    // Rule configurations
    // Format: 'rule-name': 'off' | 'warn' | 'error'
    // Or with options: 'rule-name': ['error', { option: value }]
    rules: {
      // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs

      // Semi rule from eslint-plugin-sfgov/recommended
      // We generally don't need or want semicolons, but we should require them
      // before so-called continuation characters like "(" and "[", because
      // automatic semicolon insertion doesn't "fix" cases like this.
      // This prevents difficult-to-decipher errors like: Uncaught TypeError: "bar" is not a function
      "semi": ["error", "never", {
        beforeStatementContinuationChars: "always"
      }],

      "@typescript-eslint/camelcase": "off",
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "variable",
          format: ["camelCase", "PascalCase", "UPPER_CASE"],
        },
      ],

      // This is already covered (and more) with naming-convention
      camelcase: "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",

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
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-var-requires": "off",
      "no-use-before-define": "off",
      "no-void": [
        "error",
        {
          allowAsStatement: true,
        },
      ],
      "@typescript-eslint/no-use-before-define": ["error"],
      "react/jsx-uses-vars": "error",
      "react/jsx-uses-react": "error",
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        {
          allowNumber: true,
          allowAny: true,
        },
      ],
      // These rules catches various usecases of variables typed as "any", since they won't be flagged by the TS
      // compiler and thus are potential sources of issues. The current codebase has too many uses of `any` to make
      // these effective rules though, so disabling them for now.
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-return": "off",

      // "prettier/prettier": ["error"],
      "jest/no-disabled-tests": "error",
      "jest/no-focused-tests": "error",
      "jest/no-identical-title": "error",
      "jest/no-done-callback": "off",

      // ESLint v8 Migration: jest/lowercase-name deprecated, replaced with jest/prefer-lowercase-title
      // Enforces lowercase test and describe block titles for consistency
      "jest/prefer-lowercase-title": [
        "error",
        {
          ignore: ["describe"],
        },
      ],

      // Ensure you're actually asserting something when calling expect
      "jest/valid-expect": "error",

      // ESLint v8 Migration: jest/no-try-expect deprecated, replaced with jest/no-conditional-expect
      // Prevents expect calls inside conditional logic (try/catch, if statements) to ensure assertions always execute
      // Note: 2 existing violations in apiService.test.ts have eslint-disable comments
      "jest/no-conditional-expect": "error",

      // Promises sometimes have side effects rather than resolving with a value,
      // especially in hooks-heavy React code
      "promise/always-return": "off",
      "promise/catch-or-return": "off",

      // Ensure we don't cause infinite state update loops with useEffect hooks.
      "react-hooks/exhaustive-deps": "error",

      // Don't always require expects, some of our frontend integration tests
      // should pass as long as they don't timeout
      "jest/expect-expect": "off",
      "import/extensions": "error",
      "react/prop-types": "error",
      "react/display-name": "off",
      "react/state-in-constructor": "off",
      "react/self-closing-comp": "error",
      // this rule auto-corrects regex to make it simpler. Unfortunately, we
      // can't depend on all regex parsers to work the same, so we're turning
      // it off.
      "unicorn/better-regex": "off",
      "unicorn/no-null": "off",
      "unicorn/no-useless-undefined": "off",
      "unicorn/no-array-for-each": "off",
      "unicorn/filename-case": "off",
      "unicorn/prevent-abbreviations": "off",
      "import/order": "off",
      "@typescript-eslint/no-empty-function": "off",
      "unicorn/no-array-reduce": "off",
      "jest/require-top-level-describe": "error",

      // Enforce using "it" for test cases
      "jest/consistent-test-it": ["error", { fn: "it", withinDescribe: "it" }],

      // ============================================================================
      // ESLint v8 Migration: Disabled Rules from Updated Plugins
      // ============================================================================
      // The following rules are disabled to avoid 582 violations from updated
      // eslint-plugin-unicorn and eslint-plugin-jest. These can be enabled and
      // fixed incrementally in future work.

      // unicorn/numeric-separators-style: Enforces numeric separators for readability (e.g., 1_000_000)
      // 234 violations - primarily in test data files with 4-digit numbers
      "unicorn/numeric-separators-style": "off",

      // unicorn/switch-case-braces: Requires braces around case clauses for block scoping
      // 54 violations - auto-fixable but changes code structure
      "unicorn/switch-case-braces": "off",

      // unicorn/prefer-module: Prefers ES modules over CommonJS (import/export vs require/module.exports)
      // 24 violations - requires major refactoring and may not be compatible with all tooling
      "unicorn/prefer-module": "off",

      // jest/prefer-to-be: Suggests using toBe() instead of toEqual() for primitive values
      // 18 violations - auto-fixable, best practice for Jest tests
      "jest/prefer-to-be": "off",

      // unicorn/no-negated-condition: Disallows negated conditions for better readability
      // 13 violations - stylistic preference that may not always improve readability
      "unicorn/no-negated-condition": "off",

      // unicorn/prefer-at: Prefers .at() over bracket notation for array access (e.g., array.at(-1))
      // 5 violations - requires ES2022 support, auto-fixable
      "unicorn/prefer-at": "off",

      // unicorn/prefer-string-replace-all: Prefers String.replaceAll() over String.replace() with global regex
      // 5 violations - requires ES2021 support, auto-fixable
      "unicorn/prefer-string-replace-all": "off",

      // unicorn/prefer-node-protocol: Enforces node: protocol for Node.js built-in modules (e.g., node:crypto)
      // 4 violations - requires Node.js 16+, auto-fixable
      "unicorn/prefer-node-protocol": "off",

      // unicorn/no-await-expression-member: Disallows member access from await expressions
      // 1 violation - auto-fixable, improves readability
      "unicorn/no-await-expression-member": "off",

      // unicorn/prefer-logical-operator-over-ternary: Prefers logical operators over ternary when appropriate
      // 1 violation - auto-fixable, cleaner code
      "unicorn/prefer-logical-operator-over-ternary": "off",

      // unicorn/no-typeof-undefined: Enforces comparing with undefined directly instead of using typeof
      // 1 violation - auto-fixable, best practice
      "unicorn/no-typeof-undefined": "off",

      // unicorn/no-useless-switch-case: Disallows useless case clauses in switch statements
      // 1 violation - requires manual fix
      "unicorn/no-useless-switch-case": "off",

      // unicorn/prefer-top-level-await: Prefers top-level await over promise chains
      // 1 violation - requires specific module configuration
      "unicorn/prefer-top-level-await": "off",

      // ============================================================================
      // ESLint v9 Migration: Configuration Updates
      // ============================================================================
      // The following rules are configured to address ESLint v9 compatibility.
      // Unlike the v8 migration, no new rules needed to be disabled for v9.
      // All new v9 rules (no-constant-binary-expression, no-empty-static-block,
      // no-new-native-nonconstructor, no-unused-private-class-members) show 0 violations.

      // no-redeclare: Disable base rule in favor of TypeScript-specific version
      // The base rule incorrectly flags TypeScript type/value pairs with the same name.
      // TypeScript allows both a type and a value with the same name (e.g., React components).
      // 9 violations - fixed by using @typescript-eslint/no-redeclare instead
      "no-redeclare": "off",
      "@typescript-eslint/no-redeclare": "error",

      // ESLint v9 Rule Behavior Changes:
      // - no-unused-vars: caughtErrors now defaults to "all" (was "none" in v8)
      //   Our custom unused-imports/no-unused-vars configuration handles this appropriately.
      // - no-inner-declarations: New blockScopeFunctions option - no violations
      // - no-useless-computed-key: enforceForClassMembers now defaults to true - no violations
      // - Other behavior changes: no violations detected
      // Decision: Keep current configuration, no changes needed for v9 behavior changes.
    },

    // Shared settings (available to all rules)
    // These are plugin-specific settings that don't fit into other categories
    settings: {
      react: {
        // React version for react plugin rules
        // Must be updated when package.json react version is bumped
        version: "18.2.0",
      },
      "import/resolver": {
        // Configure how the import plugin resolves module paths
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
  // This config applies ONLY to Jest test files.
  // It spreads the Jest plugin's recommended flat config, which includes:
  // - Jest-specific globals (describe, it, expect, etc.)
  // - Recommended Jest rules
  // 
  // This config OVERRIDES the base config for matching files.
  // Rules from the base config still apply unless explicitly overridden here.
  {
    files: [
      '**/__tests__/**/*.{ts,tsx,js,jsx}',  // Test files in __tests__ directories
      '**/*.test.{ts,tsx,js,jsx}',          // Files ending in .test.*
      '**/*.spec.{ts,tsx,js,jsx}'           // Files ending in .spec.*
    ],
    // Spread the Jest plugin's flat config (includes globals and rules)
    ...jest.configs['flat/recommended'],
  },

  // ============================================================================
  // 5. Cypress E2E Test Files Configuration
  // ============================================================================
  // This config applies ONLY to Cypress test files.
  // It adds Cypress-specific globals and disables conflicting Jest rules.
  // 
  // This demonstrates how to create file-specific overrides:
  // 1. Specify file patterns with "files"
  // 2. Add plugins specific to these files
  // 3. Add globals specific to these files
  // 4. Override rules from the base config
  {
    files: ['cypress/**/*.{ts,js}'],      // All Cypress test files

    // Add Cypress plugin for these files only
    plugins: {
      cypress,
    },

    // Add Cypress-specific globals (cy, Cypress, etc.)
    languageOptions: {
      globals: cypress.environments.globals.globals,
    },

    // Override rules for Cypress files
    rules: {
      // Cypress uses Chai's expect(), not Jest's expect()
      // Disable Jest's expect validation to avoid false positives
      "jest/valid-expect": "off",
    },
  },
];

// ============================================================================
// CONFIGURATION PRECEDENCE EXAMPLE
// ============================================================================
// 
// Given these configs in order:
// 1. js.configs.recommended
// 2. Base config with files: ["**/*.{js,jsx,ts,tsx}"]
// 3. Jest config with files: ["**/*.test.ts"]
// 4. Cypress config with files: ["cypress/**/*.ts"]
// 
// For a file "app/component.ts":
// - Applies: js.configs.recommended + Base config
// 
// For a file "app/component.test.ts":
// - Applies: js.configs.recommended + Base config + Jest config
// - Jest config rules override Base config rules for this file
// 
// For a file "cypress/e2e/test.ts":
// - Applies: js.configs.recommended + Base config + Cypress config
// - Cypress config rules override Base config rules for this file
// 
// ============================================================================
// ADDING A NEW FILE-SPECIFIC CONFIGURATION
// ============================================================================
// 
// To add a new config for specific files (e.g., Storybook stories):
// 
// {
//   files: ['**/*.stories.{ts,tsx}'],
//   rules: {
//     'import/no-anonymous-default-export': 'off',
//   },
// },
// 
// This would disable the rule only for Storybook story files.
// 
// ============================================================================
