import React from "react"
import renderer from "react-test-renderer"
import { MailingListSignup } from "../../components/MailingListSignup"

describe("MailingListSignup", () => {
  it("displays mailing list sign up", () => {
    const tree = renderer.create(<MailingListSignup />).toJSON()

    expect(tree).toMatchSnapshot()
  })
})
