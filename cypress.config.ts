import "dotenv/config"
import { defineConfig } from "cypress"

export default defineConfig({
  defaultCommandTimeout: 180000, // 3 mins
  projectId: "dahlia-housing-portal",
  pageLoadTimeout: 180000, // 3 mins
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
      E2E_LOTTERY_NUMBER: process.env.E2E_LOTTERY_NUMBER
    },
    baseUrl: "http://localhost:3000",
    specPattern: "cypress/e2e/**/*.{js,jsx,ts,tsx}",
    retries: 2,
  },
  // workaround see https://github.com/dequelabs/axe-core/issues/3057
  modifyObstructiveCode: false,
})
