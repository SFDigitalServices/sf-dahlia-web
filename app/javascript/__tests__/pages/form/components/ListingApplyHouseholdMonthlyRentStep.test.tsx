import React from "react"
import { screen } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { t } from "@bloom-housing/ui-components"
import { renderWithFormContextWrapper } from "../../../__util__/renderUtils"
import ListingApplyHouseholdMonthlyRentStep from "../../../../pages/form/components/household/ListingApplyHouseholdMonthlyRentStep"

const primaryApplicantData = {
  primaryApplicantFirstName: "Bob",
  primaryApplicantLastName: "Smith",
  primaryApplicantAddressStreet: "123 Main St",
  primaryApplicantAddressCity: "San Francisco",
  primaryApplicantAddressState: "CA",
  primaryApplicantAddressZipcode: "94102",
  primaryApplicantAddressAptOrUnit: "",
}

const renderListingApplyHousingMonthlyRent = (formData: Record<string, unknown> = {}) =>
  renderWithFormContextWrapper(
    <ListingApplyHouseholdMonthlyRentStep
      title="c5HouseholdMonthlyRent.titleHousehold"
      description="c5HouseholdMonthlyRent.description"
    />,
    {
      formData: { ...primaryApplicantData, ...formData },
      renderForm: false,
      stepInfoMap: [
        {
          slug: "householdMonthlyRent",
          fieldNames: ["householdMonthlyRent", "householdDoesNotPayRent"],
        },
      ],
    }
  )

const memberAtSecondaryAddress = {
  hasSameAddressAsApplicant: "false",
  householdMemberAddressStreet: "456 Oak Ave",
  householdMemberAddressCity: "Oakland",
  householdMemberAddressState: "CA",
  householdMemberAddressZipcode: "94601",
  householdMemberAddressAptOrUnit: "",
}

const secondaryAddress = "456 Oak Ave, Oakland, CA, 94601"

describe("ListingApplyHouseholdMonthlyRentStep", () => {
  it("renders one rent group for a single-person household", () => {
    renderListingApplyHousingMonthlyRent()
    expect(screen.getAllByLabelText(t("label.noRentPaid"))).toHaveLength(1)
  })

  it("renders one group when a household member shares the primary address", () => {
    renderListingApplyHousingMonthlyRent({
      householdMembers: [
        { id: "1", firstName: "Bob", lastName: "Doe", hasSameAddressAsApplicant: "true" },
      ],
    })
    expect(screen.getAllByLabelText(t("label.noRentPaid"))).toHaveLength(1)
  })

  it("renders two groups when a household member has a different address", () => {
    renderListingApplyHousingMonthlyRent({
      householdMembers: [
        { id: "1", firstName: "Bob", lastName: "Doe", ...memberAtSecondaryAddress },
      ],
    })
    expect(screen.getAllByLabelText(t("label.noRentPaid"))).toHaveLength(2)
  })

  it("groups two members who share the same non-primary address into one group", () => {
    renderListingApplyHousingMonthlyRent({
      householdMembers: [
        { id: "1", firstName: "Bob", lastName: "Doe", ...memberAtSecondaryAddress },
        { id: "1", firstName: "Carol", lastName: "Doe", ...memberAtSecondaryAddress },
      ],
    })
    expect(screen.getAllByLabelText(t("label.noRentPaid"))).toHaveLength(2)
  })
})

describe("ListingApplyHouseholdMonthlyRent", () => {
  it("displays one name when the member does not share primary housing", () => {
    renderListingApplyHousingMonthlyRent({
      householdMembers: [
        { id: "1", firstName: "Chris", lastName: "Smith", ...memberAtSecondaryAddress },
      ],
    })
    expect(
      screen.getByText(
        t("c5HouseholdMonthlyRent.howMuchDoesMemberPay", {
          address: secondaryAddress,
          member: "Chris",
        })
      )
    ).toBeInTheDocument()
  })

  it("concatenates two members that share a non-primary address", () => {
    renderListingApplyHousingMonthlyRent({
      householdMembers: [
        { id: "1", firstName: "Joe", lastName: "Smith", ...memberAtSecondaryAddress },
        { id: "2", firstName: "Chris", lastName: "Smith", ...memberAtSecondaryAddress },
      ],
    })
    expect(
      screen.getByText(
        t("c5HouseholdMonthlyRent.howMuchDoMembersPay", {
          address: secondaryAddress,
          members: "Joe and Chris",
        })
      )
    ).toBeInTheDocument()
  })

  it("renders the does not pay rent checkbox", () => {
    renderListingApplyHousingMonthlyRent()
    expect(screen.getByLabelText(t("label.noRentPaid"))).toBeInTheDocument()
  })

  it("disables the rent input when checked", async () => {
    renderListingApplyHousingMonthlyRent()
    await userEvent.click(screen.getByLabelText(t("label.noRentPaid")))
    expect(screen.getByRole("textbox")).toBeDisabled()
  })

  it("re-enables the rent input when unchecked", async () => {
    renderListingApplyHousingMonthlyRent()
    const checkbox = screen.getByLabelText(t("label.noRentPaid"))
    await userEvent.click(checkbox)
    await userEvent.click(checkbox)
    expect(screen.getByRole("textbox")).not.toBeDisabled()
  })

  it("clears the rent value when checked", async () => {
    renderListingApplyHousingMonthlyRent()
    await userEvent.type(screen.getByRole("textbox"), "1500")
    await userEvent.click(screen.getByLabelText(t("label.noRentPaid")))
    expect(screen.getByRole("textbox")).toHaveValue("")
  })
})
