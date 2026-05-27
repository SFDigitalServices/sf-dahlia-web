import React from "react"
import { render, screen } from "@testing-library/react"
import SiteHeader, { SiteHeaderProps } from "../../components/SiteHeader/SiteHeader"
import NavigationProvider from "../../navigation/NavigationProvider"
import { setupUserContext } from "../__util__/accountUtils"

const accountMenuLinks = [
  {
    title: "My Account",
    subMenuLinks: [{ title: "My Dashboard", href: "/account" }],
  },
]

describe("SiteHeader", () => {
  beforeEach(() => {
    document.body.innerHTML = ""
    jest.restoreAllMocks()
  })
  const renderSiteHeader = (
    menuLinks = accountMenuLinks,
    siteHeaderProps: Partial<SiteHeaderProps> = {}
  ) =>
    render(
      <NavigationProvider>
        <SiteHeader homeURL="/" logoSrc="/logo.svg" menuLinks={menuLinks} {...siteHeaderProps} />
      </NavigationProvider>
    )

  it("renders account avatar with initials of user", () => {
    setupUserContext({ loggedIn: true })
    renderSiteHeader()
    expect(screen.getByText("FL")).not.toBeNull()
  })
})
