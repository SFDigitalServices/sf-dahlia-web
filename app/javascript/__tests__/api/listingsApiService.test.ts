import {
  EligibilityFilters,
  formatQueryString,
  getEligibilityQueryString,
} from "../../api/listingsApiService"

describe("listingsApiService", () => {
  describe("formatQueryString", () => {
    it("formats an individual param as expected", () => {
      expect(formatQueryString({ type: "rental" })).toEqual("type=rental")
    })
    it("formats an multiple params as expected", () => {
      expect(formatQueryString({ type: "rental", subset: "browse", something: "else" })).toEqual(
        "type=rental&subset=browse&something=else"
      )
    })
  })
  describe("getEligibilityQueryString", () => {
    it("formats all params as expected", () => {
      const filters: EligibilityFilters = {
        household_size: "4",
        income_timeframe: "per_year",
        income_total: 70000,
        include_children_under_6: true,
        children_under_6: "2",
        type: "",
      }
      expect(getEligibilityQueryString(filters, "rental")).toEqual(
        "householdsize=4&incomelevel=70000&includeChildrenUnder6=true&childrenUnder6=2&listingsType=rental"
      )
    })
    it("does not include children under 6 if not present", () => {
      const filters: EligibilityFilters = {
        household_size: "4",
        income_timeframe: "per_year",
        income_total: 70000,
        include_children_under_6: false,
        children_under_6: "",
        type: "",
      }
      expect(getEligibilityQueryString(filters, "rental")).toEqual(
        "householdsize=4&incomelevel=70000&includeChildrenUnder6=false&childrenUnder6=&listingsType=rental"
      )
    })
    it("multiplies income as expected for per_month filters", () => {
      const filters: EligibilityFilters = {
        household_size: "4",
        income_timeframe: "per_month",
        income_total: 5000,
        include_children_under_6: true,
        children_under_6: "4",
        type: "",
      }
      expect(getEligibilityQueryString(filters, "rental")).toContain("60000")
    })
    it("works for sales listings", () => {
      const filters: EligibilityFilters = {
        household_size: "4",
        income_timeframe: "per_month",
        income_total: 5000,
        include_children_under_6: true,
        children_under_6: "4",
        type: "",
      }
      expect(getEligibilityQueryString(filters, "ownership")).toContain("&listingsType=ownership")
    })
  })
})
