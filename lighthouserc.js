const join = require('url-join')

const {
  LHCI_BUILD_TOKEN: token,
  LHCI_COLLECT_BASE_URL: baseUrl = 'http://localhost:3000',
} = process.env

const testListingId = 'a0W0P00000F8YG4UAN'

const urlsToTest = [
  join(baseUrl, '/'),
  join(baseUrl, '/listings/for-rent'),
  join(baseUrl, `/listings/${testListingId}`)
  // application pages are in Angular, we do not plan to improve Lighthouse scores until they are migrated to React
  // join(baseUrl, `/listings/${testListingId}/apply/name`)
]

module.exports = {
  ci: {
    collect: {
      url: urlsToTest,
      staticDistDir: false
    },
    assert: {
    },
    upload: {
      target: 'lhci',
      token,
      ignoreDuplicateBuildFailure: true,
      urlReplacementPatterns: [
        `s#^${baseUrl}##`
      ]
    }
  }
}
