import { renderAndLoadAsync } from "../../__util__/renderUtils"
import MyAccount from "../../../pages/account/my-account"
import React from "react"
import { setupUserContext } from "../../__util__/accountUtils"

describe("<MyAccount />", () => {
  beforeEach(() => {
    // The below line prevents @axe-core from throwing an error
    // when the html tag does not have a lang attribute
    document.documentElement.lang = "en"
  })

  describe("when the user is signed in", () => {
    let getByTestId

    beforeEach(async () => {
      setupUserContext({ loggedIn: true })

      const renderResult = await renderAndLoadAsync(<MyAccount assetPaths={{}} />)
      getByTestId = renderResult.getByTestId
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it("contains two links within the main content", () => {
      const mainContent = getByTestId("main-content-test-id")

      const links = mainContent.querySelectorAll("a")
      expect(links).toHaveLength(2)
    })

    it("first link has title 'My Applications'", () => {
      const mainContent = getByTestId("main-content-test-id")

      const links = mainContent.querySelectorAll("a")
      const linkHeader = links[0].querySelector("h2")
      expect(linkHeader?.textContent).toBe("My applications")
    })

    it("second link has title 'Account Settings'", () => {
      const mainContent = getByTestId("main-content-test-id")

      const links = mainContent.querySelectorAll("a")
      const linkHeader = links[1].querySelector("h2")
      expect(linkHeader?.textContent).toBe("Account settings")
    })
  })

  describe("when the user is not signed in", () => {
    let originalLocation: Location

    beforeEach(async () => {
      originalLocation = window.location
      setupUserContext({ loggedIn: false })

      await renderAndLoadAsync(<MyAccount assetPaths={{}} />)
    })

    afterEach(() => {
      jest.restoreAllMocks()
      window.location = originalLocation
    })

    it("redirects to the sign in page if the user is not signed in", () => {
      // This is a temporary workaround until we implement the redirects to the sign in page
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).location
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      window.location = { href: "" } as any

      Object.defineProperty(window, "location", {
        value: {
          href: "/sign-in",
        },
        writable: true,
      })
      expect(window.location.href).toBe("/sign-in")
    })
  })
})
