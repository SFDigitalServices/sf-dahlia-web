import React from "react"
import { screen } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { t } from "@bloom-housing/ui-components"
import { renderWithFormContextWrapper } from "../../../../__tests__/__util__/renderUtils"
import Radio from "../../../../pages/form/components/Radio"

const LABEL = "label.income"
const ERROR_MESSAGE = "error.pleaseSelectAnOption"
const OPTION_1_ID = "incomePerMonth"
const OPTION_1_LABEL = "label.perMonth"
const OPTION_1_VALUE = "12"
const OPTION_2_ID = "incomePerYear"
const OPTION_2_LABEL = "label.perYear"
const OPTION_2_VALUE = "1"

const renderRadioComponent = (hideLabe?: boolean) => {
  const fieldNames = { answer: "testAnswer" }
  const options = [
    {
      id: OPTION_1_ID,
      label: OPTION_1_LABEL,
      value: OPTION_1_VALUE,
    },
    {
      id: OPTION_2_ID,
      label: OPTION_2_LABEL,
      value: OPTION_2_VALUE,
    },
  ]
  renderWithFormContextWrapper(
    <Radio
      label={LABEL}
      hideLabel={hideLabe}
      errorMessage={ERROR_MESSAGE}
      fieldNames={fieldNames}
      options={options}
    />
  )
}

describe("Radio", () => {
  it("renders", () => {
    renderRadioComponent()

    expect(screen.queryByText(t(LABEL))).not.toBeNull()
    expect(screen.queryByText(t(OPTION_1_LABEL))).not.toBeNull()
    expect(screen.queryByText(t(OPTION_2_LABEL))).not.toBeNull()
  })

  it("hides the legend", () => {
    renderRadioComponent(true)

    expect(screen.queryByLabelText(t(LABEL))).toBeNull()
  })

  it("displays an error message", async () => {
    const user = userEvent.setup()
    renderRadioComponent(true)

    await user.click(screen.getByRole("button", { name: "next" }))
    expect(screen.queryByText(t(ERROR_MESSAGE))).not.toBeNull()
  })
})
