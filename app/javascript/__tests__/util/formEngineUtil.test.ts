import dayjs from "dayjs"
import MockDate from "mockdate"
import {
  translationFromDataSchema,
  showStep,
  calculateNextStep,
  calculatePrevStep,
  validDayRange,
  validMonthRange,
  validYearRange,
  validDate,
  validAge,
  parseDate,
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

  describe("validDayRange", () => {
    it("returns true for in-range day", () => {
      expect(validDayRange("01")).toBe(true)
    })
    it("returns false for out-of-range day", () => {
      expect(validDayRange("0")).toBe(false)
      expect(validDayRange("32")).toBe(false)
    })
  })

  describe("validMonthRange", () => {
    it("returns true for in-range month", () => {
      expect(validMonthRange("01")).toBe(true)
    })
    it("returns false for out-of-range month", () => {
      expect(validMonthRange("0")).toBe(false)
      expect(validMonthRange("13")).toBe(false)
    })
  })

  describe("validYearRange", () => {
    it("returns true for in-range year", () => {
      expect(validYearRange("1900")).toBe(true)
    })
    it("returns false for out-of-range year", () => {
      expect(validYearRange("1899")).toBe(false)
      expect(validYearRange("3000")).toBe(false) // will fail in the year 3000
    })
  })

  describe("parseDate", () => {
    it("returns a dayjs object", () => {
      expect(parseDate("2000", "1", "01") instanceof dayjs).toBe(true)
    })
  })

  describe("validDate", () => {
    it("returns true if an paramter is blank", () => {
      expect(validDate("2000", "", "29")).toBe(true)
    })
    it("returns true for a valid date", () => {
      expect(validDate("2000", "2", "29")).toBe(true)
    })
    it("returns false for a valid date", () => {
      expect(validDate("2001", "2", "29")).toBe(false)
    })
  })

  describe("validAge", () => {
    MockDate.set("2020-01-01")
    it("returns true for birth dates greater than minimum age", () => {
      const birthDate = dayjs("2000-01-01")
      const minimumAge = 18
      expect(validAge(birthDate, minimumAge, undefined)).toBe(true)
    })
    it("returns false for birth dates less than minimum age", () => {
      const birthDate = dayjs("2010-01-01")
      const minimumAge = 18
      expect(validAge(birthDate, minimumAge, undefined)).toBe(false)
    })
    it("returns true for birth dates that are less than 10 months in the futue", () => {
      const birthDate = dayjs("2020-09-01")
      expect(validAge(birthDate, null, undefined)).toBe(true)
    })
    it("overrides minimum age with senior building age requirements", () => {
      const birthDate = dayjs("2000-01-01")
      const minimumAge = 18
      const seniorBuildingAgeRequirement = {
        entireHousehold: true,
        minimumAge: 65,
      }
      expect(validAge(birthDate, minimumAge, seniorBuildingAgeRequirement)).toBe(false)
    })
  })
})
