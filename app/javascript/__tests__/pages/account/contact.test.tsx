/* eslint-disable @typescript-eslint/unbound-method */
import {
  renderAndLoadAsync,
  mockWindowLocation,
  restoreWindowLocation,
} from "../../__util__/renderUtils"
import Contact from "../../../pages/account/contact"
import React from "react"
import { type RenderResult } from "@testing-library/react"
import { setupUserContext } from "../../__util__/accountUtils"
import { withAuthentication } from "../../../authentication/withAuthentication"
import { RedirectType } from "../../../util/routeUtil"

jest.mock("react-gtm-module", () => ({
  initialize: jest.fn(),
  dataLayer: jest.fn(),
}))

describe("<Contact />", () => {
  beforeEach(() => {
    document.documentElement.lang = "en"
    jest.spyOn(console, "error").mockImplementation(() => {})
    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: true,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }))
  })

  describe("when the user is signed in", () => {
    let getByRole: RenderResult["getByRole"]
    let originalLocation: Location

    beforeEach(async () => {
      originalLocation = mockWindowLocation()
      setupUserContext({ loggedIn: true })
      const WrappedComponent = withAuthentication(Contact, { redirectType: RedirectType.Account })
      const renderResult = await renderAndLoadAsync(<WrappedComponent assetPaths={{}} />)
      getByRole = renderResult.getByRole
    })

    afterEach(() => {
      jest.restoreAllMocks()
      restoreWindowLocation(originalLocation)
    })

    it("contains the contact info page", () => {
      expect(getByRole("link", { name: "Back to account overview" })).toBeInTheDocument()
    })
  })

  describe("when the user is not signed in", () => {
    let originalLocation: Location

    beforeEach(async () => {
      originalLocation = mockWindowLocation()
      setupUserContext({ loggedIn: false })

      const WrappedComponent = withAuthentication(Contact, { redirectType: RedirectType.Account })
      await renderAndLoadAsync(<WrappedComponent assetPaths={{}} />)
    })

    afterEach(() => {
      jest.restoreAllMocks()
      restoreWindowLocation(originalLocation)
    })

    it("redirects to the sign in page if the user is not signed in", () => {
      expect(window.location.assign).toHaveBeenCalledWith("/sign-in?redirect=account")
    })
  })
})
