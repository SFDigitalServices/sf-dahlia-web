import React from "react"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import { MenuLink, SiteHeader, SiteHeaderProps } from "../../components/SiteHeader/SiteHeader"
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
    menuLinks: MenuLink[] = accountMenuLinks,
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

  it("does not render the account avatar when there is no profile", () => {
    setupUserContext({ loggedIn: true, hasProfile: false })
    const { container } = renderSiteHeader()
    expect(container.querySelector("[class*='account-avatar']")).toBeNull()
    expect(screen.getByTestId("My Account-0")).not.toBeNull()
  })

  describe("on a mobile-width screen", () => {
    const signedOutMenuLinks: MenuLink[] = [
      { title: "Rent", href: "/listings/for-rent" },
      { title: "Sign in", href: "/sign-in", showInMobileHeader: true },
    ]
    const desktopWidth = window.innerWidth

    beforeEach(() => {
      window.innerWidth = 375
    })

    afterEach(() => {
      window.innerWidth = desktopWidth
    })

    describe("when signed out", () => {
      beforeEach(() => {
        setupUserContext({ loggedIn: false })
      })

      it("shows a Sign in link in the header", () => {
        renderSiteHeader(signedOutMenuLinks)
        expect(screen.getByTestId("Sign in-mobile")).toHaveAttribute(
          "href",
          expect.stringContaining("/sign-in")
        )
      })
    })

    describe("when signed in", () => {
      beforeEach(() => {
        setupUserContext({ loggedIn: true })
      })

      it("shows the account button instead of a Sign in link", () => {
        renderSiteHeader()
        expect(screen.getByTestId("My Account-mobile")).not.toBeNull()
        expect(screen.queryByTestId("Sign in-mobile")).toBeNull()
      })
    })
  })
})
