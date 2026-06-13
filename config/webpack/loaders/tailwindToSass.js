/* eslint-env node */

/*
 * Vendored from @bloom-housing/ui-components/tailwind.tosass.js.
 *
 * Converts the Tailwind theme's colors and screens into the legacy SCSS
 * variables ($tailwind-<name> maps/values and $screen-<name>) that the sass
 * loader prepends to every .scss file via `additionalData`. base.scss and the
 * vendored global SCSS still reference these (e.g. $screen-md, $tailwind-white).
 */
const tailwindToSassVars = (bloomTheme) => {
  // TODO: we should remove this in favor of just using the new CSS variables
  const bloomColorVars = Object.keys(bloomTheme.theme.colors).map((colorKey) => {
    if (typeof bloomTheme.theme.colors[colorKey] == "object") {
      // create a map variable that can be used by the map-get SCSS function
      let colorMap = "$tailwind-" + colorKey + ": ("
      colorMap += Object.keys(bloomTheme.theme.colors[colorKey])
        .map((colorMapKey) => {
          return `${colorMapKey}: ${bloomTheme.theme.colors[colorKey][colorMapKey]}`
        })
        .join(", ")
      return colorMap + ");"
    } else {
      // return a simple variable
      return `$tailwind-${colorKey}: ${bloomTheme.theme.colors[colorKey]};`
    }
  })
  const bloomScreenVars = Object.keys(bloomTheme.theme.screens).map((screenKey) => {
    return `$screen-${screenKey}: ${bloomTheme.theme.screens[screenKey]};`
  })

  return bloomColorVars.concat(bloomScreenVars).join("\n")
}

module.exports = tailwindToSassVars
