import dayjs from "dayjs"
import MockDate from "mockdate"
import { validAge } from "../../util/listingApplyUtil"

describe("formEngineUtil", () => {
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
