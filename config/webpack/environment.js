const { environment } = require('@rails/webpacker')
const coffee =  require('./loaders/coffee')
const slim =  require('./loaders/slim')
const css =  require('./loaders/css')
const template =  require('./loaders/template')

environment.loaders.prepend('coffee', coffee)
environment.loaders.prepend('template', {
  test: /\.js$/,
  use: [ 'angular-template-url-loader' ]
})
environment.loaders.prepend('template', {
  test: /\.html$/,
  use: [ 'raw-loader' ]
})
environment.loaders.prepend('slim', slim)
environment.loaders.append('html', {
  test: /\.html$/,
  use: [{
    loader: 'html-loader',
    // options: {
    //   minimize: true,
    //   // removeAttributeQuotes: false,
    //   // caseSensitive: true,
    //   // customAttrSurround: [ [/#/, /(?:)/], [/\*/, /(?:)/], [/\[?\(?/, /(?:)/] ],
    //   // customAttrAssign: [ /\)?\]?=/ ]
    //   exportAsEs6Default: 'es6',
    //   collapseWhitespace: true,
    //   removeAttributeQuotes: false,
    //   caseSensitive: true,
    //   customAttrSurround: [ [/#/, /(?:)/], [/\*/, /(?:)/], [/\[?\(?/, /(?:)/] ],
    //   customAttrAssign: [ /\)?\]?=/ ]
    // }
  }]
})
module.exports = environment

