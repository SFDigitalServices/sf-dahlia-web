import React from "react"
import { render } from "@testing-library/react"
import { MailingListSignup } from "../../components/MailingListSignup"

describe("MailingListSignup", () => {
  it("displays mailing list sign up", () => {
    const { asFragment } = render(<MailingListSignup />)

    expect(asFragment()).toMatchSnapshot()
  })
})
