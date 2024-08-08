/* eslint-disable @typescript-eslint/unbound-method */
import React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import PasswordFieldset from "../../pages/account/PasswordFieldset"
import { useForm } from "react-hook-form"

const WrappedPasswordFieldset = () => {
  const {
    register,
    formState: { errors },
    watch,
  } = useForm({ mode: "all" })

  return <PasswordFieldset register={register} errors={errors} watch={watch} />
}

describe("Password Fieldset", () => {
  it("displays password instructions without validation", () => {
    render(<WrappedPasswordFieldset />)
    expect(screen.getByText("Must include at least:")).not.toBeNull()
    expect(screen.getByText("8 characters")).not.toBeNull()
    expect(screen.getByText("1 letter")).not.toBeNull()
    expect(screen.getByText("1 number")).not.toBeNull()
    expect(screen.getAllByTestId("validation-none")).toHaveLength(3)
    expect(screen.queryByTestId("validation-check")).toBeNull()
    expect(screen.queryByTestId("validation-x")).toBeNull()
  })

  it("displays validation for password confirmation", async () => {
    render(<WrappedPasswordFieldset />)

    const user = userEvent.setup()
    const input = screen.getByLabelText(/choose a new password/i)
    expect(screen.getAllByTestId("validation-none")).toHaveLength(3)

    await user.type(input, "p")
    expect(screen.getAllByTestId("validation-x")).toHaveLength(2)
    expect(screen.getByTestId("validation-check")).not.toBeNull()

    await user.type(input, "p1")
    expect(screen.getAllByTestId("validation-x")).toHaveLength(1)
    expect(screen.getAllByTestId("validation-check")).toHaveLength(2)

    await user.type(input, "p1234567")
    expect(screen.queryByTestId("validation-x")).toBeNull()
    expect(screen.getAllByTestId("validation-check")).toHaveLength(3)
  })

  it("displays password validation", async () => {
    render(<WrappedPasswordFieldset />)
    const user = userEvent.setup()

    const input = screen.getByLabelText(/current password/i)
    const button = screen.getAllByRole("button")[0]
    expect(input.getAttribute("type")).toBe("password")
    await user.click(button)
    expect(input.getAttribute("type")).toBe("text")
    await user.click(button)
    expect(input.getAttribute("type")).toBe("password")
  })
})
