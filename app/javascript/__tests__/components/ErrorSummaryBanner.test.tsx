import React from "react"
import { render, screen } from "@testing-library/react"
import { ErrorSummaryBanner } from "../../pages/account/components/ErrorSummaryBanner"

describe("ErrorSummaryBanner", () => {
  test("displays no errors when errors is empty", () => {
    render(<ErrorSummaryBanner errors={{}} />)
    const errorItems = screen.queryAllByRole("listitem")
    expect(errorItems).toHaveLength(0)
  })

  test("displays errors when present", () => {
    render(
      <ErrorSummaryBanner
        errors={{
          birthMonth: {
            message: "name:firstName",
            ref: { name: "input#firstName.input" },
            type: "required",
          },
          firstName: {
            message: "password:required",
            ref: { name: "input#password.input" },
            type: "required",
          },
        }}
      />
    )
    const errorItems = screen.getAllByRole("listitem")
    expect(errorItems).toHaveLength(2)
  })

  test("will call messageMap if provided", () => {
    const messageMap = jest.fn((message) => message)
    render(
      <ErrorSummaryBanner
        errors={{
          birthMonth: {
            message: "name:firstName",
            ref: { name: "input#firstName.input" },
            type: "required",
          },
        }}
        messageMap={messageMap}
      />
    )
    expect(messageMap).toHaveBeenCalledWith("name:firstName")
  })
})
