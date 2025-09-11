import {
  translationFromDataSchema,
  showStep,
  calculateNextStep,
  calculatePrevStep,
} from "../../util/formEngineUtil"
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

  describe("calculate next and previous steps", () => {
    const dataSources = {
      form: {},
      listing: openRentalListing,
      preferences: {
        testKey1: "test key 1",
      },
    }

    const step0 = {
      slug: "step-0",
      sectionName: "testSection",
      fieldNames: [],
    }
    const step1 = {
      slug: "step-1",
      sectionName: "testSection",
      fieldNames: [],
    }
    const step2 = {
      slug: "step-2",
      sectionName: "testSection",
      fieldNames: [],
    }

    const step1NavigationArrivalSkip = {
      slug: "step-1",
      sectionName: "testSection",
      navigationArrival: {
        hideStepIfAnyPresent: [
          {
            dataSource: "preferences",
            dataKey: "testKey1",
          },
        ],
      },
      fieldNames: [],
    }
    const step0NavigationDeparture = {
      slug: "step-0",
      sectionName: "testSection",
      navigationDeparture: {
        nextStep: "step-2",
      },
      fieldNames: [],
    }
    const step2NavigationDeparture = {
      slug: "step-2",
      sectionName: "testSection",
      navigationDeparture: {
        prevStep: "step-0",
      },
      fieldNames: [],
    }

    describe("calculateNextStep", () => {
      const currentStepIndex = 0
      it("goes to the next step by default", () => {
        const stepInfoMap = [step0, step1, step2]
        expect(calculateNextStep(currentStepIndex, stepInfoMap, dataSources)).toBe(
          currentStepIndex + 1
        )
      })
      it("skips the next step if the next step has 'navigationArrival' that evaluates to false", () => {
        const stepInfoMap = [step0, step1NavigationArrivalSkip, step2]
        expect(calculateNextStep(currentStepIndex, stepInfoMap, dataSources)).toBe(
          currentStepIndex + 2
        )
      })
      it("skips to the step specified in 'navigationDeparture.nextStep'", () => {
        const stepInfoMap = [step0NavigationDeparture, step1, step2]
        expect(calculateNextStep(currentStepIndex, stepInfoMap, dataSources)).toBe(2)
      })
    })

    describe("calculatePrevStep", () => {
      const currentStepIndex = 2
      it("goes to the previous step by default", () => {
        const stepInfoMap = [step0, step1, step2]
        expect(calculatePrevStep(currentStepIndex, stepInfoMap, dataSources)).toBe(
          currentStepIndex - 1
        )
      })
      it("skips the previous step if the previous step has 'navigationArrival' that evaluates to false", () => {
        const stepInfoMap = [step0, step1NavigationArrivalSkip, step2]
        expect(calculatePrevStep(currentStepIndex, stepInfoMap, dataSources)).toBe(
          currentStepIndex - 2
        )
      })
      it("skips to the step specified in 'navigationDeparture.prevStep'", () => {
        const stepInfoMap = [step0, step1, step2NavigationDeparture]
        expect(calculatePrevStep(currentStepIndex, stepInfoMap, dataSources)).toBe(0)
      })
    })
  })
})
