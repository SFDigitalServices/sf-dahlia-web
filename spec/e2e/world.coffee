chai = require('chai')
chaiAsPromised = require('chai-as-promised')
Chance = require('chance')

class World
  constructor: ->
    chai.use(chaiAsPromised)
    @expect = chai.expect
    @chance = new Chance()
    return



module.exports.World = World
