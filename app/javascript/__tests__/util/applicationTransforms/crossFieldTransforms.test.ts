import {
  adaPriorities,
  formMetadata,
  geocodingDataToFormData,
  income,
  totalMonthlyRent,
} from "../../../util/applicationTransforms/crossFieldTransforms"
import { HCBS_PRIORITY_NAME } from "../../../util/applicationTransforms/constants"

describe("cross-field application transforms", () => {
  describe("income", () => {
    it("sends a monthly amount to monthlyIncome", () => {
      expect(
        income.toSf({ householdIncome: "1250", householdIncomeMultiplier: "per_month" })
      ).toEqual({ monthlyIncome: 1250 })
    })

    it("sends a yearly amount to annualIncome", () => {
      expect(
        income.toSf({ householdIncome: "15000", householdIncomeMultiplier: "per_year" })
      ).toEqual({ annualIncome: 15000 })
    })

    it("strips currency formatting", () => {
      expect(
        income.toSf({ householdIncome: "$1,250", householdIncomeMultiplier: "per_month" })
      ).toEqual({ monthlyIncome: 1250 })
    })

    it("sends nothing when no income was entered", () => {
      expect(income.toSf({})).toEqual({})
      expect(income.toSf({ householdIncome: "" })).toEqual({})
    })

    it("recovers the amount and the timeframe", () => {
      expect(income.fromSf({ monthlyIncome: 1250 })).toEqual({
        householdIncome: "1250",
        householdIncomeMultiplier: "per_month",
      })
      expect(income.fromSf({ annualIncome: 15000 })).toEqual({
        householdIncome: "15000",
        householdIncomeMultiplier: "per_year",
      })
      expect(income.fromSf({})).toEqual({})
    })

    it("round-trips both timeframes", () => {
      for (const multiplier of ["per_month", "per_year"]) {
        const formData = { householdIncome: "1250", householdIncomeMultiplier: multiplier }
        expect(income.fromSf(income.toSf(formData))).toEqual(formData)
      }
    })
  })

  describe("adaPriorities", () => {
    it("builds a semicolon-terminated picklist", () => {
      expect(adaPriorities.toSf({ adaPrioritiesSelected: ["Adaptable", "Vision impairments"] })).toEqual(
        { adaPrioritiesSelected: "Adaptable;Vision impairments;" }
      )
    })

    it("sends None when nothing is selected", () => {
      expect(adaPriorities.toSf({})).toEqual({ adaPrioritiesSelected: "None;" })
      expect(adaPriorities.toSf({ adaPrioritiesSelected: [] })).toEqual({
        adaPrioritiesSelected: "None;",
      })
    })

    it("folds the HCBS answer into the picklist", () => {
      expect(
        adaPriorities.toSf({
          adaPrioritiesSelected: ["Adaptable"],
          hasHomeAndCommunityBasedServices: "Yes",
        })
      ).toEqual({ adaPrioritiesSelected: `Adaptable;${HCBS_PRIORITY_NAME};` })
    })

    it("sends HCBS alone rather than alongside None", () => {
      expect(
        adaPriorities.toSf({
          adaPrioritiesSelected: [],
          hasHomeAndCommunityBasedServices: "Yes",
        })
      ).toEqual({ adaPrioritiesSelected: `${HCBS_PRIORITY_NAME};` })
    })

    it("separates the HCBS answer back out of the picklist", () => {
      expect(
        adaPriorities.fromSf({ adaPrioritiesSelected: `Adaptable;${HCBS_PRIORITY_NAME};` })
      ).toEqual({
        adaPrioritiesSelected: ["Adaptable"],
        hasHomeAndCommunityBasedServices: "Yes",
      })
    })

    it("reads None as no priorities", () => {
      expect(adaPriorities.fromSf({ adaPrioritiesSelected: "None;" })).toEqual({
        adaPrioritiesSelected: [],
        hasHomeAndCommunityBasedServices: "No",
      })
    })

    it("round-trips priorities with and without HCBS", () => {
      for (const hcbs of ["Yes", "No"]) {
        const formData = {
          adaPrioritiesSelected: ["Adaptable", "Mobility impairments"],
          hasHomeAndCommunityBasedServices: hcbs,
        }
        expect(adaPriorities.fromSf(adaPriorities.toSf(formData))).toEqual(formData)
      }
    })
  })

  describe("totalMonthlyRent", () => {
    it("sums the per-address rents", () => {
      expect(
        totalMonthlyRent.toSf({
          groupedHouseholdAddresses: [{ monthlyRent: 1000 }, { monthlyRent: 500 }],
        })
      ).toEqual({ totalMonthlyRent: 1500 })
    })

    it("counts missing rents as zero", () => {
      expect(
        totalMonthlyRent.toSf({
          groupedHouseholdAddresses: [{ monthlyRent: 1000 }, {}],
        })
      ).toEqual({ totalMonthlyRent: 1000 })
    })

    it("sends nothing when there are no addresses", () => {
      expect(totalMonthlyRent.toSf({})).toEqual({})
    })

    // not invertible; the grouped addresses come back via formMetadata
    it("recovers nothing on the way in", () => {
      expect(totalMonthlyRent.fromSf({ totalMonthlyRent: 1500 })).toEqual({})
    })
  })

  describe("formMetadata", () => {
    it("stashes the metadata fields as JSON", () => {
      const result = formMetadata.toSf({
        lastPage: "household-overview",
        completedSections: { you: true },
        primaryApplicantFirstName: "Alice",
      })
      expect(JSON.parse(result.formMetadata as string)).toEqual({
        lastPage: "household-overview",
        completedSections: { you: true },
      })
    })

    it("round-trips the metadata fields", () => {
      const formData = {
        lastPage: "household-overview",
        completedSections: { you: true },
        session_uid: "abc-123",
        groupedHouseholdAddresses: [{ address: "1 Main St", monthlyRent: 1000 }],
      }
      expect(formMetadata.fromSf(formMetadata.toSf(formData))).toEqual(formData)
    })

    it("recovers nothing when there is no metadata", () => {
      expect(formMetadata.fromSf({})).toEqual({})
    })

    it("survives unparseable metadata", () => {
      jest.spyOn(console, "error").mockImplementation(() => undefined)
      expect(formMetadata.fromSf({ formMetadata: "not json" })).toEqual({})
      jest.restoreAllMocks()
    })
  })

  describe("geocodingDataToFormData", () => {
    it("flattens the geocoding response", () => {
      expect(
        geocodingDataToFormData({
          location: { x: -122.4, y: 37.7 },
          attributes: { Loc_name: "SF_Address" },
          score: 100,
        })
      ).toEqual({
        xCoordinate: -122.4,
        yCoordinate: 37.7,
        whichComponentOfLocatorWasUsed: "SF_Address",
        candidateScore: 100,
      })
    })

    it("prefixes the field names when asked", () => {
      const result = geocodingDataToFormData({ location: { x: -122.4 } }, "primaryApplicant")
      expect(result.primaryApplicantXCoordinate).toBe(-122.4)
    })

    it("returns nothing when there is no geocoding data", () => {
      expect(geocodingDataToFormData(undefined)).toEqual({})
    })
  })
})
