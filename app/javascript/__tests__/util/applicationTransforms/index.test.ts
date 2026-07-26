import {
  applicationToFormData,
  formDataToApplication,
  getAlternateContactData,
  getHouseholdMembersData,
  getPrimaryApplicantData,
} from "../../../util/applicationTransforms"

const formData = {
  primaryApplicantFirstName: "Alice",
  primaryApplicantMiddleName: "B",
  primaryApplicantLastName: "Cooper",
  primaryApplicantBirthYear: "1985",
  primaryApplicantBirthMonth: "06",
  primaryApplicantBirthDate: "05",
  primaryApplicantAddressStreet: "1 Main St",
  primaryApplicantAddressAptOrUnit: "",
  primaryApplicantAddressCity: "San Francisco",
  primaryApplicantAddressState: "CA",
  primaryApplicantAddressZipcode: "94103",
  primaryApplicantPhone: "4155551234",
  primaryApplicantPhoneType: "Cell",
  primaryApplicantEmail: "alice@example.com",
  primaryApplicantWorkInSf: "Yes",
  householdVouchersSubsidies: "No",
  householdIncome: "1250",
  householdIncomeMultiplier: "per_month",
  adaPrioritiesSelected: ["Adaptable"],
  hasHomeAndCommunityBasedServices: "No",
  alternateContactType: "Friend",
  alternateContactFirstName: "Bob",
  alternateContactLastName: "Jones",
  householdMembers: [
    {
      firstName: "Carol",
      middleName: "",
      lastName: "Cooper",
      birthYear: "1990",
      birthMonth: "01",
      birthDate: "15",
      relationship: "Sibling",
      hasSameAddressAsApplicant: "Yes",
    },
  ],
}

describe("applicationTransforms", () => {
  describe("getPrimaryApplicantData", () => {
    it("maps the applicant's name, date of birth and address", () => {
      const applicant = getPrimaryApplicantData(formData)
      expect(applicant).toMatchObject({
        firstName: "Alice",
        middleName: "B",
        lastName: "Cooper",
        dob: "1985-06-05",
        address: "1 Main St",
        city: "San Francisco",
        state: "CA",
        zip: "94103",
        workInSf: "true",
      })
    })

    it("maps the applicant's contact info", () => {
      expect(getPrimaryApplicantData(formData)).toMatchObject({
        phone: "4155551234",
        phoneType: "Cell",
        email: "alice@example.com",
      })
    })

    it("joins the street and unit into the Salesforce address field", () => {
      const applicant = getPrimaryApplicantData({
        ...formData,
        primaryApplicantAddressAptOrUnit: "Apt 4",
      })
      expect(applicant.address).toBe("1 Main St Apt 4")
    })
  })

  describe("getHouseholdMembersData", () => {
    it("maps each member with the shared member fields", () => {
      expect(getHouseholdMembersData(formData)).toEqual([
        {
          firstName: "Carol",
          lastName: "Cooper",
          dob: "1990-01-15",
          relationship: "Sibling",
          hasSameAddressAsApplicant: true,
        },
      ])
    })

    it("returns an empty list when the applicant lives alone", () => {
      expect(getHouseholdMembersData({})).toEqual([])
    })
  })

  describe("getAlternateContactData", () => {
    it("maps the contact's address into the mailing fields", () => {
      const contact = getAlternateContactData({
        ...formData,
        alternateContactAddressStreet: "2 Oak St",
        alternateContactAddressCity: "Oakland",
        alternateContactAddressState: "CA",
        alternateContactAddressZipcode: "94601",
      })
      expect(contact).toMatchObject({
        mailingAddress: "2 Oak St",
        mailingCity: "Oakland",
        mailingState: "CA",
        mailingZip: "94601",
      })
    })
  })

  describe("formDataToApplication", () => {
    it("assembles the nested Salesforce payload", () => {
      const application = formDataToApplication(formData)
      expect(application.primaryApplicant).toMatchObject({ firstName: "Alice" })
      expect(application.householdMembers).toHaveLength(1)
      expect(application.alternateContact).toMatchObject({ firstName: "Bob", lastName: "Jones" })
    })

    it("applies the cross-field transforms", () => {
      const application = formDataToApplication(formData)
      expect(application.monthlyIncome).toBe(1250)
      expect(application.adaPrioritiesSelected).toBe("Adaptable;")
      expect(application.householdVouchersSubsidies).toBe("false")
      expect(typeof application.formMetadata).toBe("string")
    })

    it("omits the alternate contact when the applicant declined to name one", () => {
      const application = formDataToApplication({
        ...formData,
        alternateContactType: "None",
        alternateContactFirstName: "",
        alternateContactLastName: "",
      })
      expect(application.alternateContact).toBeUndefined()
    })

    it("omits the alternate contact when the name is incomplete", () => {
      const application = formDataToApplication({
        ...formData,
        alternateContactLastName: "",
      })
      expect(application.alternateContact).toBeUndefined()
    })
  })

  describe("applicationToFormData", () => {
    it("round-trips the fields the form collects", () => {
      const restored = applicationToFormData(formDataToApplication(formData))

      // scalar fields, including those needing cross-field logic
      expect(restored).toMatchObject({
        primaryApplicantFirstName: "Alice",
        primaryApplicantMiddleName: "B",
        primaryApplicantLastName: "Cooper",
        primaryApplicantBirthYear: "1985",
        primaryApplicantBirthMonth: "06",
        primaryApplicantBirthDate: "05",
        primaryApplicantAddressStreet: "1 Main St",
        primaryApplicantAddressCity: "San Francisco",
        primaryApplicantAddressState: "CA",
        primaryApplicantAddressZipcode: "94103",
        primaryApplicantWorkInSf: "Yes",
        householdVouchersSubsidies: "No",
        householdIncome: "1250",
        householdIncomeMultiplier: "per_month",
        adaPrioritiesSelected: ["Adaptable"],
        hasHomeAndCommunityBasedServices: "No",
        alternateContactFirstName: "Bob",
      })
    })

    it("uses form field names, not Salesforce ones", () => {
      const restored = applicationToFormData(formDataToApplication(formData))
      expect(restored).not.toHaveProperty("city")
      expect(restored).not.toHaveProperty("primaryApplicantCity")
      expect(restored).not.toHaveProperty("dob")
    })

    it("round-trips household members", () => {
      const restored = applicationToFormData(formDataToApplication(formData))
      expect(restored.householdMembers).toMatchObject([
        {
          firstName: "Carol",
          lastName: "Cooper",
          birthYear: "1990",
          birthMonth: "01",
          birthDate: "15",
          relationship: "Sibling",
          hasSameAddressAsApplicant: "Yes",
        },
      ])
    })

    it("marks the alternate contact as None when the application has none", () => {
      expect(applicationToFormData({}).alternateContactType).toBe("None")
    })

    it("survives an empty application", () => {
      expect(() => applicationToFormData({})).not.toThrow()
      expect(applicationToFormData({}).householdMembers).toEqual([])
    })
  })
})
