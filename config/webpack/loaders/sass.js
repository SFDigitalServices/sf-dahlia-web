const cssnano = require('cssnano')({ preset: 'default' })
const path = require('path');
// postcss options
let minimize = false
const plugins = [
  require('postcss-flexbugs-fixes'),
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

const isProduction = process.env.NODE_ENV === 'production'

if (isProduction) {
  plugins.push(cssnano)
  minimize = true
}

module.exports = {
  test: /\.(scss|sass)$/,
  use: [
    // 'file-loader',
    // Creates `style` nodes from JS strings
    // the singleton option reduces the number of style tags injected into the page
    // at one point we had more than 80 style tags, which could interfere with hyperlink previews
    {
      loader: 'style-loader',
      options: {
        // the singleton option crashes the browser in E2E tests
        injectType: isProduction ? 'singletonStyleTag' : 'styleTag',
      }
    },
    // Translates CSS into CommonJS
    // https://stackoverflow.com/questions/72970312/webpack-wont-compile-when-i-use-an-image-url-in-scss
    { loader: 'css-loader', options: { sourceMap: !isProduction } },
    // Various CSS pre and post-processors, including tailwind.
    // See postcss.config.js for specifics
    // This line must come after style/css loaders and before the sass loader
    {
      loader: 'postcss-loader',
      options: {
        postcssOptions: {
          plugins: plugins,
          minimize: minimize,
          sourceMap: !isProduction
        }
      }
    },
    {
      loader: 'resolve-url-loader',
      options: {
        attempts: 1,
        sourceMap: !isProduction,
        root: path.resolve(__dirname, "../../../app/assets")
      }
    },
    // Compiles Sass to CSS
    {
      loader: 'sass-loader',
      options: {
        additionalData: tailwindVars,
        sourceMap: true,
      }
    }
  ]
}
