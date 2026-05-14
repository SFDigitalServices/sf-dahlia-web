import React from "react"
import { screen } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { t } from "@bloom-housing/ui-components"
import HouseholdIncome from "../../../../pages/form/components/HouseholdIncome"
import { renderWithFormContextWrapper } from "../../../__util__/renderUtils"
import { checkHouseholdEligibility } from "../../../../api/formApiService"

jest.mock("../../../../api/formApiService", () => ({
  checkHouseholdEligibility: jest.fn(),
}))

const mockCheckHouseholdEligibility = checkHouseholdEligibility as jest.Mock

const renderHouseholdIncomeComponent = () => {
  const fieldNames = {
    amount: "primaryApplicantHouseholdIncomeAmount",
    answer: "primaryApplicantHouseholdIncomeAnswer",
  }

  renderWithFormContextWrapper(
    <HouseholdIncome
      fieldNames={fieldNames}
      title="d2Income.title"
      headerComponentName="ListingApplyHouseholdIncomeHeader"
      currencyLabel="label.applicantIncomeTotal"
      currencyErrorMessage="error.income"
      radioLabel="label.income"
      radioErrorMessage="error.pleaseSelectAnOption"
      hideLabel={true}
      options={[
        {
          id: "incomePerMonth",
          label: "label.perMonth",
          value: "12",
        },
        {
          id: "incomePerYear",
          label: "label.perYear",
          value: "1",
        },
      ]}
    />,
    { renderForm: false }
  )
}
describe("HouseholdIncome", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it("renders the component", () => {
    renderHouseholdIncomeComponent()
    expect(screen.queryByText(t("d2Income.title"))).not.toBeNull()
    expect(screen.queryByText(t("d2Income.p1"))).not.toBeNull()
    expect(screen.queryByText(t("d2Income.p2"))).not.toBeNull()
  })

  it("displays an error message", async () => {
    const user = userEvent.setup()
    renderHouseholdIncomeComponent()
    await user.click(screen.getByRole("button", { name: /next/i }))
    expect(screen.queryByText(t("error.income"))).not.toBeNull()
  })

  it("calls the eligiblity check endpoint", async () => {
    mockCheckHouseholdEligibility.mockResolvedValue({ eligibility: "true" })
    const user = userEvent.setup()
    renderHouseholdIncomeComponent()
    await user.type(screen.getByLabelText(t("label.applicantIncomeTotal")), "50000")
    await user.click(screen.getByLabelText(t("label.perYear")))
    await user.click(screen.getByRole("button", { name: /next/i }))
    expect(mockCheckHouseholdEligibility).toHaveBeenCalled()
  })
})
