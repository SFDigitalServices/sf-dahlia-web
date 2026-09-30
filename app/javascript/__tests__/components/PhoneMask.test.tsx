import React, { useState } from "react"
import { act, render, screen } from "@testing-library/react"
import { userEvent } from "@testing-library/user-event"
import { PhoneMask } from "../../pages/account/components/PhoneMask"

const PhoneMaskWrapper = ({ initialValue = "" }: { initialValue?: string }) => {
  const [value, setValue] = useState(initialValue)

  return (
    <PhoneMask
      name="phone"
      value={value}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => setValue(event.target.value)}
    />
  )
}

describe("PhoneMask", () => {
  it("renders a phone input", () => {
    render(<PhoneMaskWrapper />)
    expect(screen.getByRole("textbox")).toHaveAttribute("type", "tel")
  })

  it("masks input in 111-111-1111 format", async () => {
    const user = userEvent.setup()
    render(<PhoneMaskWrapper />)
    const input = screen.getByRole<HTMLInputElement>("textbox")
    await user.type(input, "4155550199")
    expect(input).toHaveValue("415-555-0199")
  })

  it("drops the separator along with the last digit before it on backspace", async () => {
    const user = userEvent.setup()
    render(<PhoneMaskWrapper />)
    const input = screen.getByRole<HTMLInputElement>("textbox")
    await user.type(input, "4155{Backspace}")
    expect(input).toHaveValue("415")
    await user.keyboard("{Backspace}")
    expect(input).toHaveValue("41")
  })

  it("deletes the digit before a separator when backspacing over it", async () => {
    const user = userEvent.setup()
    render(<PhoneMaskWrapper initialValue="111-222-3333" />)
    const input = screen.getByRole<HTMLInputElement>("textbox")
    await user.click(input)
    // Caret just after the first "-"
    input.setSelectionRange(4, 4)
    await user.keyboard("{Backspace}")
    expect(input).toHaveValue("112-223-333")
    expect(input.selectionStart).toBe(2)
  })

  it("deletes the digit after a separator when pressing Delete before it", async () => {
    const user = userEvent.setup()
    render(<PhoneMaskWrapper initialValue="111-222-3333" />)
    const input = screen.getByRole<HTMLInputElement>("textbox")
    await user.click(input)
    // Caret just before the first "-"
    input.setSelectionRange(3, 3)
    await user.keyboard("{Delete}")
    expect(input).toHaveValue("111-223-333")
    expect(input.selectionStart).toBe(3)
  })

  it("deletes the digit before a separator when the keyboard sends no Backspace keydown", async () => {
    // Android on-screen keyboards report key "Unidentified", so only the input event arrives
    const user = userEvent.setup()
    render(<PhoneMaskWrapper initialValue="111-222-3333" />)
    const input = screen.getByRole<HTMLInputElement>("textbox")
    await user.click(input)
    act(() => {
      // Use the prototype setter so React's value tracker sees a change
      Reflect.set(HTMLInputElement.prototype, "value", "111222-3333", input)
      input.setSelectionRange(3, 3)
      input.dispatchEvent(
        new InputEvent("input", { bubbles: true, inputType: "deleteContentBackward" })
      )
    })
    expect(input).toHaveValue("112-223-333")
    expect(input.selectionStart).toBe(2)
  })

  it("keeps only the first 10 digits of a pasted number", async () => {
    const user = userEvent.setup()
    render(<PhoneMaskWrapper />)
    await user.click(screen.getByRole("textbox"))
    await user.paste("(415) 555-0199 ext 5")
    expect(screen.getByRole("textbox")).toHaveValue("415-555-0199")
  })

  it("displays an initial value", () => {
    render(<PhoneMaskWrapper initialValue="111-111-1111" />)
    expect(screen.getByDisplayValue("111-111-1111")).toBeInTheDocument()
  })
})
