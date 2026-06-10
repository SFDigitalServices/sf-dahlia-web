import React from "react"
import { render } from "@testing-library/react"
import { MailingListSignup } from "../../components/MailingListSignup"
import { ConfigProvider } from "../../lib/ConfigContext"

describe("MailingListSignup", () => {
  it("displays mailing list sign up", () => {
    const { asFragment } = render(
      <ConfigProvider assetPaths={{}}>
        <MailingListSignup />
      </ConfigProvider>
    )

    expect(asFragment()).toMatchSnapshot()
  })
})
