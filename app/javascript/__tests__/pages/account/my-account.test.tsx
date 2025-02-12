import { renderAndLoadAsync } from "../../__util__/renderUtils"
import MyAccount from "../../../pages/account/my-account"
import React from "react"
import {
  mockProfileStub,
  setupLocationAndRouteMock,
  setupUserContext,
} from "../../__util__/accountUtils"
import { withAuthentication } from "../../../authentication/withAuthentication"
import TagManager from "react-gtm-module"

jest.mock("react-gtm-module", () => ({
  initialize: jest.fn(),
  dataLayer: jest.fn(),
}))

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
      const WrappedComponent = withAuthentication(MyAccount, { redirectPath: "account" })

      setupLocationAndRouteMock(
        "?access-token=true&accountConfirmed=true&account_confirmation_success=true"
      )

      const renderResult = await renderAndLoadAsync(<WrappedComponent assetPaths={{}} />)
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

  describe("when a user confirms their account", () => {
    it("sends an analytics event", async () => {
      setupUserContext({ loggedIn: true })

      setupLocationAndRouteMock(
        "?access-token=test&accountConfirmed=true&account_confirmation_success=true"
      )

      await renderAndLoadAsync(<MyAccount assetPaths={{}} />)

      expect(TagManager.dataLayer).toHaveBeenCalledWith({
        dataLayer: {
          event: "account_create_completed",
          user_id: mockProfileStub.id,
        },
      })
    })
  })

  describe("when the user is not signed in", () => {
    let originalLocation: Location

    beforeEach(async () => {
      originalLocation = window.location
      setupUserContext({ loggedIn: false })
      setupLocationAndRouteMock()

      const WrappedComponent = withAuthentication(MyAccount, { redirectPath: "account" })
      await renderAndLoadAsync(<WrappedComponent assetPaths={{}} />)
    })

    afterEach(() => {
      jest.restoreAllMocks()
      window.location = originalLocation
    })

    it("redirects to the sign in page if the user is not signed in", () => {
      expect(window.location.href).toBe("http://dahlia.com/sign-in?redirect=account")
    })
  })
})
