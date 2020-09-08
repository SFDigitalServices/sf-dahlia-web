try {
  require('dotenv').config()
} catch (error) {
  // this can fail in CI, where there is no .env
}

const {
  LHCI_BUILD_TOKEN: token,
  LHCI_COLLECT_BASE_URL: baseUrl = 'http://localhost:3000',
  LHCI_SERVER_BASE_URL: serverBaseUrl
} = process.env

module.exports = {
  ci: {
    collect: {
      url: `${baseUrl}/`,
      staticDistDir: false
    },
    assert: {
      assertions: {
        'categories:accessibility': [
          'error', { minScore: 0.90 }
        ]
      }
    },
    upload: {
      target: 'lhci',
      serverBaseUrl,
      token,
      ignoreDuplicateBuildFailure: true,
      urlReplacementPatterns: [
        `s#^${baseUrl}##`
      ]
    }
  }
}