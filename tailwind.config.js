const cloneDeep = require("clone-deep")
const bloomTheme = cloneDeep(require("@sf-digital-services/ui-components/tailwind.config.js"))

// Modify bloomTheme to override any Tailwind vars
// For example:
// bloomTheme.theme.colors.white = "#f0f0e9"

// tailwind will automatically purge unused styles when `NODE_ENV` is set to `production`
bloomTheme.purge = [
  './src/**/*.tsx',
  __dirname + '/app/assets/javascripts/**/*.html.slim',
  __dirname + '/app/javascript/**/*.tsx'
]

module.exports = bloomTheme
