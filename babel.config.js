module.exports = function (api) {
  const defaultConfigFunc = require('shakapacker/package/babel/preset.js')
  const resultConfig = defaultConfigFunc(api)
  var validEnv = ["development", "test", "production"]
  var currentEnv = api.env()
  var isDevelopmentEnv = api.env("development")
  var isProductionEnv = api.env("production")
  var isTestEnv = api.env("test")

  if (!validEnv.includes(currentEnv)) {
    throw new Error(
      "Please specify a valid `NODE_ENV` or " +
        '`BABEL_ENV` environment variables. Valid values are "development", ' +
        '"test", and "production". Instead, received: ' +
        JSON.stringify(currentEnv) +
        "."
    )
  }

  const changesOnDefault = {
    presets: [
      isTestEnv && [
        "@babel/preset-env",
        {
          loose: true,
          modules: "commonjs",
        },
      ],
      (isProductionEnv || isDevelopmentEnv) && [
        "@babel/preset-env",
        {
          forceAllTransforms: true,
          useBuiltIns: "entry",
          corejs: 3,
          modules: "commonjs",
          exclude: ["transform-typeof-symbol"],
        },
      ],
      [
        "@babel/preset-react",
        {
          development: isDevelopmentEnv || isTestEnv,
          useBuiltIns: true,
        },
      ],
      "@babel/preset-typescript",
    ].filter(Boolean),
    plugins: [
      "babel-plugin-macros",
      "@babel/plugin-syntax-dynamic-import",
      "@babel/plugin-transform-react-jsx",
      isTestEnv && "babel-plugin-dynamic-import-node",
      "@babel/plugin-transform-destructuring",
      [
        "@babel/plugin-proposal-class-properties",
        {
          loose: true,
        },
      ],
      [
        "@babel/plugin-proposal-private-methods",
        {
          loose: true,
        },
      ],
      [
        "@babel/plugin-proposal-private-property-in-object", 
        { 
          loose: true 
        }
      ],
      [
        "@babel/plugin-proposal-object-rest-spread",
        {
          useBuiltIns: true,
        },
      ],
      [
        "@babel/plugin-transform-regenerator",
        {
          async: false,
        },
      ],
      "@babel/plugin-transform-modules-commonjs",
    ].filter(Boolean),
  }

  resultConfig.presets = [...changesOnDefault.presets]
  resultConfig.plugins = [...resultConfig.plugins, ...changesOnDefault.plugins ]

  return resultConfig
}

// module.exports = function (api) {
//   const defaultConfigFunc = require('shakapacker/package/babel/preset.js')
//   const resultConfig = defaultConfigFunc(api)
//   const isDevelopmentEnv = api.env('development')
//   const isProductionEnv = api.env('production')
//   const isTestEnv = api.env('test')

//   const changesOnDefault = {
//     presets: [
//       [
//         '@babel/preset-react',
//         {
//           development: isDevelopmentEnv || isTestEnv,
//           useBuiltIns: true
//         } 
//       ]
//     ].filter(Boolean),
//     plugins: [
//       isProductionEnv && ['babel-plugin-transform-react-remove-prop-types', 
//         { 
//           removeImport: true 
//         }
//       ],
//       process.env.WEBPACK_SERVE && 'react-refresh/babel'
//     ].filter(Boolean),
//   }

//   resultConfig.presets = [...resultConfig.presets, ...changesOnDefault.presets]
//   resultConfig.plugins = [...resultConfig.plugins, ...changesOnDefault.plugins ]

//   return resultConfig
// }
