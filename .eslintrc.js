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
    // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin
    // that would conflict with prettier
    "prettier/@typescript-eslint",
    // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors.
    // Make sure this is always the last configuration in the extends array.
    "plugin:prettier/recommended",
    "prettier/react",
    "prettier/standard",
    "prettier",
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

    // only allow the first letter to be uppercase in "describe" block descriptions,
    // "test" and "it" block descriptions must start with lowercase
    "jest/lowercase-name": [
      "error",
      {
        ignore: ["describe"],
      },
    ],

    // Ensure you"re actually asserting something when calling expect
    "jest/valid-expect": "error",

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
  },
  overrides: [
    {
      files: ["cypress/integration/*e2e.ts", "cypress/integration/*e2e.js"],
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
    "lighthouserc.js",
    "public",
    "node_modules",
    "spec/e2e",
    "spec/javascripts",
    "**/.eslintrc.js",
    "cypress.config.ts",
  ],
  settings: {
    react: {
      // Must be updated when package.json react version is bumped
      version: "17.0.2",
    },
    "import/resolver": {
      node: {
        moduleDirectory: ["node_modules", "app/javascript"],
        extensions: [".js", ".jsx", ".ts", ".tsx"],
      },
    },
  },
}
