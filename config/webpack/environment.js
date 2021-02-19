const { environment } = require('@rails/webpacker')
const typescript =  require('./loaders/typescript')
const sass = require('./loaders/sass')
environment.loaders.prepend('sass', sass)
environment.loaders.prepend('typescript', typescript)

environment.loaders.keys().forEach(loaderName => {
  let loader = environment.loaders.get(loaderName);
  loader.use.forEach(loaderConfig => {
    if (loaderConfig.options && loaderConfig.options.config) {
      loaderConfig.options.postcssOptions = loaderConfig.options.config;
      delete loaderConfig.options.config;
    }
  });
});


module.exports = environment