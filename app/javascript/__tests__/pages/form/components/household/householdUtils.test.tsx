import { liveInTheNeighborhoodHouseholdMembers } from "../../../../../pages/form/components/household/householdUtils"

const buildFormData = (overrides: Record<string, unknown> = {}) => ({
  primaryApplicantFirstName: "Alice",
  primaryApplicantMiddleName: "M",
  primaryApplicantLastName: "Walker",
  primaryApplicantAddressStreet: "123 Main St",
  primaryApplicantAddressAptOrUnit: "Unit 4",
  primaryApplicantAddressCity: "San Francisco",
  primaryApplicantAddressState: "CA",
  primaryApplicantAddressZip: "94103",
  primaryApplicantNeighborhoodPreferenceAddressMatch: true,
  householdMembers: [],
  ...overrides,
})

describe("householdUtils", () => {
  describe("liveInTheNeighborhoodHouseholdMembers", () => {
    it("includes the primary applicant with their address fields", () => {
      expect(liveInTheNeighborhoodHouseholdMembers(buildFormData())).toEqual([
        {
          id: "primary",
          firstName: "Alice",
          middleName: "M",
          lastName: "Walker",
          hasSameAddressAsApplicant: "true",
          householdMemberAddressStreet: "123 Main St",
          householdMemberAddressAptOrUnit: "Unit 4",
          householdMemberAddressCity: "San Francisco",
          householdMemberAddressState: "CA",
          householdMemberAddressZipcode: "94103",
          neighborhoodPreferenceAddressMatch: true,
        },
      ])
    })

    it("includes members who directly live in San Francisco, case-insensitively", () => {
      const householdMembers = [
        {
          id: "member-in-sf",
          firstName: "Jordan",
          lastName: "Lee",
          hasSameAddressAsApplicant: false,
          householdMemberAddressCity: "SAN FRANCISCO",
          neighborhoodPreferenceAddressMatch: true,
        },
        {
          id: "member-no-match",
          firstName: "Kai",
          lastName: "Ng",
          hasSameAddressAsApplicant: false,
          householdMemberAddressCity: "San Francisco",
          neighborhoodPreferenceAddressMatch: false,
        },
      ]

      expect(
        liveInTheNeighborhoodHouseholdMembers(
          buildFormData({
            primaryApplicantNeighborhoodPreferenceAddressMatch: false,
            primaryApplicantAddressCity: "Oakland",
            householdMembers,
          })
        )
      ).toEqual([householdMembers[0]])
    })

    it("includes members with a shared applicant address when the primary applicant lives in SF", () => {
      const sharedAddressMember = {
        id: "same-address",
        firstName: "Noah",
        lastName: "Patel",
        hasSameAddressAsApplicant: "true",
        neighborhoodPreferenceAddressMatch: true,
      }

      expect(
        liveInTheNeighborhoodHouseholdMembers(
          buildFormData({
            householdMembers: [sharedAddressMember],
          })
        )
      ).toEqual([expect.objectContaining({ id: "primary" }), sharedAddressMember])
    })

    it("excludes members marked as not sharing the applicant address", () => {
      const notSameAddressMember = {
        id: "different-address",
        firstName: "Mina",
        lastName: "Chen",
        hasSameAddressAsApplicant: "false",
        neighborhoodPreferenceAddressMatch: true,
      }

      expect(
        liveInTheNeighborhoodHouseholdMembers(
          buildFormData({
            householdMembers: [notSameAddressMember],
          })
        )
      ).toEqual([expect.objectContaining({ id: "primary" })])
    })
  })
})
