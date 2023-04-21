module.exports = function (api) {
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

  return {
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
        "@babel/plugin-proposal-object-rest-spread",
        {
          useBuiltIns: true,
        },
      ],
      [
        "@babel/plugin-transform-runtime",
        {
          helpers: false,
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
}
