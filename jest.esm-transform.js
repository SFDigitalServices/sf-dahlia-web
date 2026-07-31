/**
 * Custom Jest transform for ESM-only packages (like react-router v8) that use
 * import.meta (e.g. import.meta.hot for Vite HMR).
 *
 * Replaces import.meta with a stub object and then uses babel-jest to convert
 * ESM syntax to CommonJS so Jest can require() the modules.
 */

const babelJest = require("babel-jest").default

const transformer = babelJest.createTransformer({
  babelrc: false,
  configFile: false,
  plugins: ["@babel/plugin-transform-modules-commonjs"],
  presets: [],
})

module.exports = {
  process(sourceCode, sourcePath, options) {
    const stubbed = sourceCode.replace(/import\.meta/g, '({"env":{},"hot":undefined,"url":""})')
    return transformer.process(stubbed, sourcePath, options)
  },
  getCacheKey(...args) {
    return transformer.getCacheKey(...args)
  },
}
