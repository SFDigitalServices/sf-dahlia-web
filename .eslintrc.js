module.exports = {
  env: {
    browser: true,
    amd: true,
    node: true,
    es6: true
  },
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly"
  },
  parser: "@typescript-eslint/parser", // Specifies the ESLint parser
  parserOptions: {
    project: ["./tsconfig.json"],
    ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
    sourceType: "module", // Allows for the use of imports
    tsconfigRootDir: "."
  },
  plugins: ["react", "@typescript-eslint", "prettier"],
  extends: [
    "standard",
    "plugin:jest/recommended",
    "plugin:jest/style",
    "eslint:recommended", // the set of rules which are recommended for all projects by the ESLint Team
    "plugin:@typescript-eslint/eslint-recommended", // conflict resolution between above and below rulesets.
    "plugin:@typescript-eslint/recommended", // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    "plugin:@typescript-eslint/recommended-requiring-type-checking", // additional rules that take a little longer to run
    "plugin:import/errors", // check for imports not resolving correctly
    "plugin:import/warnings",
    "plugin:import/typescript",
    "plugin:react-hooks/recommended", // Make sure we follow https://reactjs.org/docs/hooks-rules.html
    "prettier/@typescript-eslint", // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
    "plugin:prettier/recommended", // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
    "prettier/react",
    "prettier/standard",
    "prettier"
  ],
  rules: {
    // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
    "@typescript-eslint/camelcase": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-unused-vars": "warn",
    "@typescript-eslint/no-var-requires": "off",
    "no-use-before-define": "off",
    "@typescript-eslint/no-use-before-define": ["error"],
    "react/jsx-uses-vars": "warn",
    "react/jsx-uses-react": "warn",
    "@typescript-eslint/restrict-template-expressions": [
      "error",
      {
        allowNumber: true,
        allowAny: true
      }
    ],
    // These rules catches various usecases of variables typed as "any", since they won"t be flagged by the TS
    // compiler and thus are potential sources of issues. The current codebase has too many uses of `any` to make
    // these effective rules though, so disabling them for now.
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unsafe-call": "off",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-unsafe-return": "off",

    "prettier/prettier": ["error"],
    "jest/no-disabled-tests": "error",
    "jest/no-focused-tests": "error",
    "jest/no-identical-title": "error",

    // only allow the first letter to be uppercase in "describe" block descriptions,
    // "test" and "it" block descriptions must start with lowercase
    "jest/lowercase-name": [
      "error",
      {
        ignore: ["describe"]
      }
    ],

    // Ensure you"re actually asserting something when calling expect
    "jest/valid-expect": "error",

    // Ensure we don"t cause infinite state update loops with useEffect hooks.
    "react-hooks/exhaustive-deps": "error",

    // Don"t always require expects, some of our frontend integration tests
    // should pass as long as they don"t timeout
    "jest/expect-expect": "off",
    "import/extensions": "error",
    "react/prop-types": "off",
    "react/display-name": "off",
    "react/state-in-constructor": 0,
    "react/self-closing-comp": "error",

    // eventually I"d like to turn the camelcase rule on for properties,
    // but for now there is enough snake case in our app that this will be a pain.
    camelcase: "off"
  },
  ignorePatterns: [
    "app/assets",
    "lib",
    "*.config.js",
    "lighthouserc.js",
    "public",
    "node_modules",
    "spec/e2e",
    "spec/javascripts",
    "**/.eslintrc.js"
  ],
  settings: {
    react: {
      // Must be updated when package.json react version is bumped
      version: "16.9.0"
    },
    "import/resolver": {
      node: {
        moduleDirectory: ["node_modules", "app/javascript"]
      }
    }
  }
}
