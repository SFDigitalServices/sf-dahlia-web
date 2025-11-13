import React from "react"
import { screen } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { t } from "@bloom-housing/ui-components"
import { renderWithFormContextWrapper } from "../../../../__tests__/__util__/renderUtils"
import Currency from "../../../../pages/form/components/Currency"

const LABEL = "label.applicantIncomeTotal"
const NOTE = "label.incomePlaceholder"
const ERROR_MESSAGE = "error.income"

const renderCurrencyComponent = () => {
  const fieldNames = { amount: "testAmount" }
  renderWithFormContextWrapper(
    <Currency label={LABEL} note={NOTE} errorMessage={ERROR_MESSAGE} fieldNames={fieldNames} />
  )
}

describe("Currency", () => {
  it("renders", () => {
    renderCurrencyComponent()

    expect(screen.queryByLabelText(t(LABEL))).not.toBeNull()
    expect(screen.queryByText(t(NOTE))).not.toBeNull()
  })

  it("displays an error message", async () => {
    const user = userEvent.setup()
    renderCurrencyComponent()

    await user.click(screen.getByRole("button", { name: "next" }))
    expect(screen.queryByText(t(ERROR_MESSAGE))).not.toBeNull()
  })
})
