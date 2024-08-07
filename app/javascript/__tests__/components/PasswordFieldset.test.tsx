import React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import PasswordFieldset from "../../pages/account/PasswordFieldset"

describe("Password Fieldset", () => {
  it("displays password instructions without validation", () => {
    render(<PasswordFieldset register={jest.fn()} errors={{}} />)
    expect(screen.getByText("Must include at least:")).not.toBeNull()
    expect(screen.getByText("8 characters")).not.toBeNull()
    expect(screen.getByText("1 letter")).not.toBeNull()
    expect(screen.getByText("1 number")).not.toBeNull()
    expect(screen.getAllByTestId("validation-none")).toHaveLength(3)
    expect(screen.queryByTestId("validation-check")).toBeNull()
    expect(screen.queryByTestId("validation-x")).toBeNull()
  })

  it("displays validation for password confirmation", () => {
    render(<PasswordFieldset register={jest.fn()} errors={{}} />)
    const input = screen.getByLabelText(/choose a new password/i)
    expect(screen.getAllByTestId("validation-none")).toHaveLength(3)

    fireEvent.change(input, { target: { value: "p" } })
    expect(screen.getAllByTestId("validation-x")).toHaveLength(2)
    expect(screen.getByTestId("validation-check")).not.toBeNull()

    fireEvent.change(input, { target: { value: "p1" } })
    expect(screen.getAllByTestId("validation-x")).toHaveLength(1)
    expect(screen.getAllByTestId("validation-check")).toHaveLength(2)

    fireEvent.change(input, { target: { value: "p1234567" } })
    expect(screen.queryByTestId("validation-x")).toBeNull()
    expect(screen.getAllByTestId("validation-check")).toHaveLength(3)
  })

  it("displays password validation", () => {
    render(<PasswordFieldset register={jest.fn()} errors={{}} />)
    const input = screen.getByLabelText(/current password/i)
    const button = screen.getAllByRole("button")[0]
    expect(input.getAttribute("type")).toBe("password")
    fireEvent.click(button)
    expect(input.getAttribute("type")).toBe("text")
    fireEvent.click(button)
    expect(input.getAttribute("type")).toBe("password")
  })
})
