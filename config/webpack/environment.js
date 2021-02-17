const { environment } = require('@rails/webpacker')
const typescript =  require('./loaders/typescript')
const sass = require('./loaders/sass')

environment.loaders.prepend('typescript', typescript)
environment.loaders.prepend('sass', sass)

module.exports = environment


// const { environment } = require('@rails/webpacker')
// const typescript =  require('./loaders/typescript')
// const sass = require('./loaders/sass')
// const babel = require('./loaders/babel')

// environment.loaders.prepend('babel', babel)
// environment.loaders.prepend('typescript', typescript)
// environment.loaders.prepend('sass', sass)
// module.exports = environment
