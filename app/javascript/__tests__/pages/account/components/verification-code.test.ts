import React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import VerificationCodeField from "../../../../pages/account/components/VerificationCodeField"

describe("VerificationCodeField", () => {
  it("submits parent form when Enter is pressed", () => {
    const requestSubmitSpy = jest
      .spyOn(HTMLFormElement.prototype, "requestSubmit")
      .mockImplementation(() => {})

    render(
      React.createElement(
        "form",
        null,
        React.createElement(VerificationCodeField, { value: "", onChange: jest.fn() })
      )
    )

    fireEvent.keyDown(screen.getAllByRole("textbox")[0], { key: "Enter" })

    expect(requestSubmitSpy).toHaveBeenCalledTimes(1)
    requestSubmitSpy.mockRestore()
  })
})
