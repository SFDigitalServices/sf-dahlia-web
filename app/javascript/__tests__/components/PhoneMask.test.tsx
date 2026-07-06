import React, { useState } from "react"
import { render, screen } from "@testing-library/react"
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
    const input = screen.getByRole("textbox")
    await user.type(input, "4155550199")
    expect(input).toHaveValue("415-555-0199")
  })

  it("displays an initial value", () => {
    render(<PhoneMaskWrapper initialValue="111-111-1111" />)
    expect(screen.getByDisplayValue("111-111-1111")).toBeInTheDocument()
  })
})
