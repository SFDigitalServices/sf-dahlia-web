chai = require('chai')
chaiAsPromised = require('chai-as-promised')

class World
  constructor: ->
    chai.use(chaiAsPromised)
    @expect = chai.expect
    return



module.exports.World = World
