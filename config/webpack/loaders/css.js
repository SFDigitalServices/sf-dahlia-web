/*
 * CSS loader chain (Tailwind v4, no sass).
 *
 * Replaces the former sass.js. Sass was removed in the Tailwind v4 migration:
 * all stylesheets are now plain CSS processed by @tailwindcss/postcss, which
 * also handles @import inlining, nesting, and vendor prefixing (via Lightning
 * CSS), so postcss-import / autoprefixer / preset-env / sass-loader /
 * resolve-url-loader are all unnecessary.
 */
const isProduction = process.env.NODE_ENV === "production"

module.exports = {
  test: /\.css$/,
  use: [
    {
      // singleton reduces the number of injected <style> tags; it crashes the
      // browser in E2E tests, so only use it in production builds.
      loader: "style-loader",
      options: {
        injectType: isProduction ? "singletonStyleTag" : "styleTag",
      },
    },
    {
      loader: "css-loader",
      options: {
        sourceMap: !isProduction,
        importLoaders: 1,
        // modules.auto (css-loader default) scopes *.module.css automatically.
        // Leave root-relative url()s (e.g. /images/foo.svg) untouched — Rails
        // serves those from the public root; don't try to bundle them.
        url: { filter: (url) => !url.startsWith("/") },
      },
    },
    {
      loader: "postcss-loader",
      options: {
        postcssOptions: {
          plugins: [require("@tailwindcss/postcss")],
        },
        sourceMap: !isProduction,
      },
    },
  ],
}
