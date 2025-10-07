 
/* istanbul ignore file */
const DefaultSequencer = require("@jest/test-sequencer").default

class CustomTestSequencer extends DefaultSequencer {
  sort(tests) {
    if (process.env.INSPECT_MODE === "true") {
      return tests.sort((a, b) => a.path.localeCompare(b.path))
    }
    return tests
  }
}

module.exports = CustomTestSequencer
