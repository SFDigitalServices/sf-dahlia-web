/*
 * Minimal sass loader — ONLY for third-party @bloom-housing/ui-seeds, which is
 * consumed from source (/src) and ships sass component styles (Card.scss, etc.)
 * that import its own tokens. All first-party styles were converted to plain CSS
 * in the Tailwind v4 migration; this rule exists solely so the external sass
 * package keeps compiling. ui-seeds' scss uses no @apply/@tailwind, so it needs
 * no Tailwind processing — just sass -> css, then a single postcss pass to drop
 * it into `@layer seeds` so first-party CSS (in `@layer components`) can override
 * ui-seeds component internals. See ./wrapLayer.js for the layer ordering.
 */
const isProduction = process.env.NODE_ENV === "production"

module.exports = {
  test: /\.scss$/,
  use: [
    {
      loader: "style-loader",
      options: {
        injectType: isProduction ? "singletonStyleTag" : "styleTag",
      },
    },
    { loader: "css-loader", options: { sourceMap: !isProduction, importLoaders: 1 } },
    {
      loader: "postcss-loader",
      options: {
        postcssOptions: {
          plugins: [require("./wrapLayer")({ layer: "seeds" })],
        },
        sourceMap: !isProduction,
      },
    },
    { loader: "sass-loader", options: { sourceMap: !isProduction } },
  ],
}
