import { translationFromDataSchema, showStep } from "../../util/formEngineUtil"
import { openRentalListing } from "../data/RailsRentalListing/listing-rental-open"

describe("formEngineUtil", () => {
  describe("translationFromDataSchema", () => {
    it("supports translations with variables from a formSchema", () => {
      const translationKey = "label.forUser"
      const translationVars = { user: { dataSource: "form", dataKey: "userName" } }
      const dataSources = {
        form: { userName: "Jane" },
        listing: openRentalListing,
        preferences: {},
      }
      expect(translationFromDataSchema(translationKey, translationVars, dataSources)).toBe(
        "for Jane"
      )
    })
  })

  describe("showStep", () => {
    const dataSources = {
      form: {},
      listing: openRentalListing,
      preferences: {
        testKey1: "test key 1",
        testKey2: "test key 2",
      },
    }
    const conditions = [
      {
        dataSource: "preferences",
        dataKey: "testKey1",
      },
      {
        dataSource: "preferences",
        dataKey: "testKey2",
        negate: true,
      },
    ]

    it("returns false for operation 'showStepIfAllPresent'", () => {
      const operation = "showStepIfAllPresent"
      expect(showStep(operation, conditions, dataSources)).toBe(false)
    })

    it("returns true for operation 'showStepIfAnyPresent'", () => {
      const operation = "showStepIfAnyPresent"
      expect(showStep(operation, conditions, dataSources)).toBe(true)
    })

    it("returns true for operation 'hideStepIfAllPresent'", () => {
      const operation = "hideStepIfAllPresent"
      expect(showStep(operation, conditions, dataSources)).toBe(true)
    })

    it("returns false for operation 'hideStepIfAnyPresent'", () => {
      const operation = "hideStepIfAnyPresent"
      expect(showStep(operation, conditions, dataSources)).toBe(false)
    })
  })

  // describe("calculateNextStep", () => {
  //   it("", () => {

  //   })
  // })

  // describe("calculatePrevStep", () => {
  //   it("", () => {

  //   })
  // })
})
