const cssnano = require("cssnano")({preset: "default"})
let minimize = false

const plugins = [
  require("postcss-import"),
  require("tailwindcss")("./tailwind.config.js"),
  require("postcss-flexbugs-fixes"),
  require("postcss-preset-env")({
    autoprefixer: {
      flexbox: "no-2009"
    },
    stage: 3
  })
]

if (process.env.NODE_ENV === 'production') {
  plugins.push(cssnano)
  minimize = true
}

module.exports = {
  plugins: plugins,
  minimize: minimize
}
