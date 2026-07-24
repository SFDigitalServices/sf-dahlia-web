import dayjs from "dayjs"
import MockDate from "mockdate"
import {
  validAge,
  validVeteranAge,
  getPrimaryApplicantData,
  allHouseholdMembers,
  getProofOptions,
} from "../../util/listingApplyUtil"
import { PROOF_OPTIONS } from "../../modules/constants"

describe("listingApplyUtil", () => {
  describe("validAge", () => {
    beforeAll(() => {
      MockDate.set("2020-01-01")
    })
    afterAll(() => {
      MockDate.reset()
    })
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
    it("returns true for birth dates that are less than 10 months in the future", () => {
      const birthDate = dayjs("2020-09-01")
      expect(validAge(birthDate, null, undefined)).toBe(true)
    })
    it("returns false for birth dates more than 10 months in the future", () => {
      const birthDate = dayjs("2020-12-01")
      expect(validAge(birthDate, null, undefined)).toBe(false)
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
    it("does not apply senior age requirement when entireHousehold is false", () => {
      const birthDate = dayjs("2000-01-01")
      const minimumAge = 18
      const seniorBuildingAgeRequirement = {
        entireHousehold: false,
        minimumAge: 65,
      }
      expect(validAge(birthDate, minimumAge, seniorBuildingAgeRequirement)).toBe(true)
    })
  })

  describe("validVeteranAge", () => {
    beforeAll(() => {
      MockDate.set("2020-01-01")
    })
    afterAll(() => {
      MockDate.reset()
    })
    it("returns true when person is 17 or older", () => {
      expect(validVeteranAge(dayjs("2003-01-01"))).toBe(true)
      expect(validVeteranAge(dayjs("2002-12-01"))).toBe(true)
    })
    it("returns false when person is younger than 17", () => {
      expect(validVeteranAge(dayjs("2003-01-02"))).toBe(false)
    })
  })

  describe("getPrimaryApplicantData", () => {
    it("extracts primary applicant name fields from form data", () => {
      const formData = {
        primaryApplicantFirstName: "Alice",
        primaryApplicantMiddleName: "B",
        primaryApplicantLastName: "Cooper",
        primaryApplicantBirthMonth: "06",
        primaryApplicantBirthDate: "15",
        primaryApplicantBirthYear: "1985",
      }
      expect(getPrimaryApplicantData(formData)).toEqual({
        firstName: "Alice",
        middleName: "B",
        lastName: "Cooper",
        dob: "1985-06-15",
      })
    })

    it("defaults dob when primaryApplicantDob is not present", () => {
      const formData = {
        primaryApplicantFirstName: "Alice",
        primaryApplicantMiddleName: "",
        primaryApplicantLastName: "Cooper",
      }
      expect(getPrimaryApplicantData(formData).dob).toBe("1990-01-01")
    })
  })

  describe("allHouseholdMembers", () => {
    it("returns household members plus the primary applicant", () => {
      const householdMember = {
        id: "Bob--Jones-1995-7-20",
        firstName: "Bob",
        middleName: "",
        lastName: "Jones",
        birthYear: "1995",
        birthMonth: "7",
        birthDay: "20",
      }
      const formData = {
        primaryApplicantFirstName: "Alice",
        primaryApplicantMiddleName: "M",
        primaryApplicantLastName: "Smith",
        primaryApplicantBirthYear: "1990",
        primaryApplicantBirthMonth: "1",
        primaryApplicantBirthDate: "15",
        householdMembers: [householdMember],
      }

      const result = allHouseholdMembers(formData)

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual(householdMember)
      expect(result[1]).toEqual({
        id: "primaryApplicant",
        firstName: "Alice",
        middleName: "M",
        lastName: "Smith",
        birthYear: "1990",
        birthMonth: "1",
        birthDay: "15",
      })
    })

    it("returns only the primary applicant when there are no household members", () => {
      const formData = {
        primaryApplicantFirstName: "Alice",
        primaryApplicantMiddleName: "",
        primaryApplicantLastName: "Smith",
        primaryApplicantBirthYear: "1990",
        primaryApplicantBirthMonth: "1",
        primaryApplicantBirthDate: "15",
      }

      const result = allHouseholdMembers(formData)

      expect(result).toHaveLength(1)
      expect(result[0].id).toBe("primaryApplicant")
      expect(result[0].firstName).toBe("Alice")
    })
  })

  describe("getProofOptions", () => {
    it.each(["liveInSf", "neighborhoodResidence"])(
      "returns liveInSfAndNeighborhoodResidence options for %s",
      (preferenceName) => {
        expect(getProofOptions(preferenceName)).toBe(PROOF_OPTIONS.liveInSfAndNeighborhoodResidence)
      }
    )

    it.each(["rightToReturnSunnydale", "rightToReturnHuntersView", "rightToReturnPotrero"])(
      "returns rightToReturn options for %s",
      (preferenceName) => {
        expect(getProofOptions(preferenceName)).toBe(PROOF_OPTIONS.rightToReturn)
      }
    )

    it("returns the matching options when the preference name is a direct key in PROOF_OPTIONS", () => {
      expect(getProofOptions("workInSf")).toBe(PROOF_OPTIONS.workInSf)
      expect(getProofOptions("rentBurden")).toBe(PROOF_OPTIONS.rentBurden)
      expect(getProofOptions("aliceGriffith")).toBe(PROOF_OPTIONS.aliceGriffith)
    })

    it("returns default options for an unknown preference name", () => {
      expect(getProofOptions("someUnknownPreference")).toBe(PROOF_OPTIONS.default)
    })

    it("returns default options for an empty preference name", () => {
      expect(getProofOptions("")).toBe(PROOF_OPTIONS.default)
    })
  })
})
