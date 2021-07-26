const cloneDeep = require("clone-deep")
const bloomTheme = cloneDeep(require("@bloom-housing/ui-components/tailwind.config.js"))

// Modify bloomTheme to override any Tailwind vars
// For example:
// bloomTheme.theme.colors.white = "#f0f0e9"

// tailwind will automatically purge unused styles when `NODE_ENV` is set to `production`
// Provided paths are scanned for tailwind classes that will be included in the final bundle
bloomTheme.purge = [
  "app/javascript/**/*.tsx",
  "node_modules/@bloom-housing/ui-components/src/**/*.tsx",
]

module.exports = bloomTheme
