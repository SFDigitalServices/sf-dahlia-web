/*
 * PostCSS plugin factory: wrap a stylesheet's rules in a named cascade layer.
 *
 * Used to give the app a deterministic cascade under Tailwind v4 (see the layer
 * order declared in app/javascript/styles/theme.css):
 *
 *     @layer theme, base, seeds, components, utilities;
 *
 *   - `seeds`      — @bloom-housing/ui-seeds CSS (compiled by sass-loader).
 *   - `components` — all first-party app CSS (processed by @tailwindcss/postcss).
 *   - `utilities`  — Tailwind utilities (emitted !important via the `important`
 *                    flag on the Tailwind import).
 *
 * Why this ordering matters:
 *   - Normal declarations: later layer wins, so first-party `components` beats
 *     `seeds` (lets us override ui-seeds component internals), and `utilities`
 *     beats `components` (the v2 `important: true` behavior the app relies on).
 *   - `!important` declarations: precedence is *reversed* — earlier layer wins —
 *     so a first-party `!important` in `components` beats a Tailwind utility
 *     `!important` in `utilities`. That's the escape hatch hand-written overrides
 *     depend on (e.g. `padding-bottom: 0 !important` beating `.pb-3`). An
 *     unlayered `!important` would instead LOSE to the layered utility, which was
 *     a whole class of subtle override bugs before this plugin existed.
 *
 * Left at the top level (never wrapped):
 *  - @import / @charset — illegal inside a layer block.
 *  - @layer / @property — Tailwind's own constructs. @tailwindcss/postcss inlines
 *    the `@import "tailwindcss"` (and theme.css's other @imports) into the entry
 *    file BEFORE this plugin runs, so its emitted `@layer theme/base/utilities`
 *    blocks, layer-order statements, and @property rules end up in the same root
 *    we're wrapping. Wrapping them would nest `utilities` as a sublayer of
 *    `components` and scramble the cascade — so we leave every @layer/@property
 *    at the top level and wrap only the bare (unlayered) first-party rules.
 */
const path = require("path")

const PASSTHROUGH_ATRULES = new Set(["import", "charset", "layer", "property"])

module.exports = ({ layer, skip } = {}) => ({
  postcssPlugin: `wrap-layer-${layer}`,
  // OnceExit runs after other plugins (e.g. @tailwindcss/postcss) have expanded
  // @apply/@reference, so we wrap fully-resolved CSS.
  OnceExit(root, { AtRule }) {
    const file = root.source && root.source.input && root.source.input.file
    if (file && skip && skip(path.normalize(file))) return

    const toWrap = root.nodes.filter(
      (node) => !(node.type === "atrule" && PASSTHROUGH_ATRULES.has(node.name))
    )
    if (toWrap.length === 0) return

    const layerRule = new AtRule({ name: "layer", params: layer })
    root.append(layerRule)
    // Moving the nodes into the layer preserves their relative source order.
    toWrap.forEach((node) => layerRule.append(node))
  },
})

module.exports.postcss = true
