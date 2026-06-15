import React from "react"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import SiteHeader, { SiteHeaderProps } from "../../components/SiteHeader/SiteHeader"
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
      <MemoryRouter>
        <SiteHeader homeURL="/" logoSrc="/logo.svg" menuLinks={menuLinks} {...siteHeaderProps} />
      </MemoryRouter>
    )

  it("renders account avatar with initials of user", () => {
    setupUserContext({ loggedIn: true })
    renderSiteHeader()
    expect(screen.getByText("FL")).not.toBeNull()
  })
})
