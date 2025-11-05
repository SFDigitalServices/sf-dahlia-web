import React from "react"
import { screen } from "@testing-library/react"
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

    expect(screen.getByLabelText(t(LABEL))).not.toBeNull()
    expect(screen.getByText(t(NOTE))).not.toBeNull()
  })
})
