const cssnano = require('cssnano')({ preset: 'default' })
// postcss options
let minimize = false
const plugins = [
  require('postcss-flexbugs-fixes'),
  require('postcss-import'),
  require('postcss-preset-env')({
    autoprefixer: {
      flexbox: 'no-2009'
    },
    stage: 3
  }),
  require('tailwindcss')('./tailwind.config.js')
]

const bloomTheme = require('../../../tailwind.config.js')

// eslint-disable-next-line import/order
const tailwindVars = require('@bloom-housing/ui-components/tailwind.tosass.js')(
  bloomTheme
)

// console.log(tailwindVars)

if (process.env.NODE_ENV === 'production') {
  plugins.push(cssnano)
  minimize = true
}

module.exports = {
  test: /\.(scss|sass)$/,
  use: [
    // 'file-loader',
    // Creates `style` nodes from JS strings
    'style-loader',
    // Translates CSS into CommonJS
    // https://stackoverflow.com/questions/72970312/webpack-wont-compile-when-i-use-an-image-url-in-scss
    { loader: 'css-loader', options: { url: false } },
    // Various CSS pre and post-processors, including tailwind.
    // See postcss.config.js for specifics
    // This line must come after style/css loaders and before the sass loader
    {
      loader: 'postcss-loader',
      options: {
        postcssOptions: {
          plugins: plugins,
          minimize: minimize
        }
      }
    },
    // Compiles Sass to CSS
    {
      loader: 'sass-loader',
      options: {
        additionalData: tailwindVars
      }
    }
  ]
}
