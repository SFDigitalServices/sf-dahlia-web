module.exports = {
  env: {
    browser: true,
    amd: true,
    node: true,
    es6: true,
  },
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
    cy: "readonly",
    Cypress: "readonly",
  },
  // Specifies the ESLint parser
  parser: "@typescript-eslint/parser",
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ["tsconfig.lint.json"],
    // Allows for the parsing of modern ECMAScript features
    ecmaVersion: 2020,
    // Allows for the use of imports
    sourceType: "module",
  },
  plugins: [
    "sfgov",
    "react",
    "@typescript-eslint",
    "prettier",
    "unicorn",
    "unused-imports",
    "jsx-a11y",
  ],
  extends: [
    "plugin:sfgov/recommended",
    "plugin:sfgov/jest",
    "plugin:jest/style",
    // conflict resolution between above and below rulesets.
    "plugin:@typescript-eslint/eslint-recommended",
    // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    "plugin:@typescript-eslint/recommended",
    // additional rules that take a little longer to run
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:unicorn/recommended",
    // check for imports not resolving correctly
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    // Make sure we follow https://reactjs.org/docs/hooks-rules.html
    "plugin:react-hooks/recommended",
    // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors.
    // Uses eslint-config-prettier to disable ESLint rules that would conflict with prettier.
    // Make sure this is always the last configuration in the extends array.
    "plugin:prettier/recommended",
    "plugin:jsx-a11y/recommended",
  ],
  rules: {
    // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
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
    // These rules catches various usecases of variables typed as "any", since they won"t be flagged by the TS
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

    // Ensure you"re actually asserting something when calling expect
    "jest/valid-expect": "error",

    // ESLint v8 Migration: jest/no-try-expect deprecated, replaced with jest/no-conditional-expect
    // Prevents expect calls inside conditional logic (try/catch, if statements) to ensure assertions always execute
    // Note: 2 existing violations in apiService.test.ts have eslint-disable comments
    "jest/no-conditional-expect": "error",

    // Promises sometimes have side effects rather than resolving with a value,
    // especially in hooks-heavy React code
    "promise/always-return": 0,
    "promise/catch-or-return": 0,

    // Ensure we don"t cause infinite state update loops with useEffect hooks.
    "react-hooks/exhaustive-deps": "error",

    // Don"t always require expects, some of our frontend integration tests
    // should pass as long as they don"t timeout
    "jest/expect-expect": "off",
    "import/extensions": "error",
    "react/prop-types": "error",
    "react/display-name": "off",
    "react/state-in-constructor": 0,
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
  },
  overrides: [
    {
      files: ["cypress/integration/*e2e.ts", "cypress/integration/*e2e.js", "cypress/support/*.ts"],
      rules: {
        // e2e files use chai-expect, not jest-expect, linter gets confused so we
        // turn off jest linting for these files.
        "jest/valid-expect": 0,
      },
    },
  ],
  ignorePatterns: [
    "app/assets",
    "lib",
    "*.config.js",
    "config/webpack/**/*",
    "lighthouserc.js",
    "public",
    "node_modules",
    "spec/e2e",
    "spec/javascripts",
    "**/.eslintrc.js",
    "cypress.config.ts",
    "Gruntfile.js",
    ".storybook",
    "stories",
    "app/javascript/test-coverage",
  ],
  settings: {
    react: {
      // Must be updated when package.json react version is bumped
      version: "18.2.0",
    },
    "import/resolver": {
      node: {
        moduleDirectory: ["node_modules", "app/javascript"],
        extensions: [".js", ".jsx", ".ts", ".tsx", ".d.ts"],
      },
    },
  },
}
