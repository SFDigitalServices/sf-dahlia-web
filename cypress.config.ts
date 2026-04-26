import { existsSync } from "fs"
import dotenv from "dotenv"
import { defineConfig } from "cypress"

if (existsSync(".env")) {
  dotenv.config({ path: ".env" })
}

export default defineConfig({
  defaultCommandTimeout: 10000, // 10s — individual commands can override with { timeout: ... }
  projectId: "dahlia-housing-portal",
  pageLoadTimeout: 60000, // 60s
  reporterOptions: {
    mochaFile: "cypress/results/tests-[hash].xml",
    toConsole: true,
  },
  video: false,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require("./cypress/plugins/index.js")(on, config)
    },
    env: {
      salesforceInstanceUrl: process.env.SALESFORCE_INSTANCE_URL,
    },
    baseUrl: "http://localhost:3000",
    specPattern: "cypress/e2e/**/*.{js,jsx,ts,tsx}",
    retries: {
      runMode: 1, // CI only
      openMode: 0,
    },
  },
  // workaround see https://github.com/dequelabs/axe-core/issues/3057
  modifyObstructiveCode: false,
})
