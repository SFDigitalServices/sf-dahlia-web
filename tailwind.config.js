const cloneDeep = require("clone-deep")
const bloomTheme = cloneDeep(require("@bloom-housing/ui-components/tailwind.config.js"))
const sfdsTheme = cloneDeep(require("sfgov-design-system/tailwind.preset"))

// Modify bloomTheme to override any Tailwind vars
// For example:
// bloomTheme.theme.colors.white = "#f0f0e9"

// tailwind will automatically purge unused styles when `NODE_ENV` is set to `production`
// Provided paths are scanned for tailwind classes that will be included in the final bundle
bloomTheme.purge = [
  "app/javascript/**/*.tsx",
  "node_modules/@bloom-housing/ui-components/src/**/*.tsx",
]
bloomTheme.theme.fontSize["4xl"] = ['2rem', {
  lineHeight: '1.25',
}]
bloomTheme.theme.fontSize["5xl"] = ['2.5rem', {
  lineHeight: '1.25',
}]

const config = Object.assign({}, sfdsTheme, bloomTheme)
Object.assign(config.theme.colors, sfdsTheme.theme.colors)

config.theme.colors.green['700'] = bloomTheme.theme.colors.green['700']
config.theme.colors.blue['700'] = bloomTheme.theme.colors.blue['700']
config.theme.colors.red['700'] = bloomTheme.theme.colors.red['700']
config.theme.colors.yellow['700'] = bloomTheme.theme.colors.yellow['700']

module.exports = bloomTheme
