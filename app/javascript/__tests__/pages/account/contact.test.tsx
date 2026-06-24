/* eslint-disable @typescript-eslint/unbound-method */
import {
  renderAndLoadAsync,
  mockWindowLocation,
  restoreWindowLocation,
} from "../../__util__/renderUtils"
import Contact from "../../../pages/account/contact"
import React from "react"
import { type RenderResult } from "@testing-library/react"
import { mockProfileStub, setupUserContext } from "../../__util__/accountUtils"
import { withAuthentication } from "../../../authentication/withAuthentication"
import { getMyAccountSettingsPath, RedirectType } from "../../../util/routeUtil"

jest.mock("react-gtm-module", () => ({
  initialize: jest.fn(),
  dataLayer: jest.fn(),
}))

jest.mock("../../../hooks/useFeatureFlag", () => ({
  useFeatureFlag: () => ({ flagsReady: true, unleashFlag: true }),
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
    let getByText: RenderResult["getByText"]
    let getByDisplayValue: RenderResult["getByDisplayValue"]
    let originalLocation: Location

    beforeEach(async () => {
      originalLocation = mockWindowLocation()
      setupUserContext({ loggedIn: true })
      const WrappedComponent = withAuthentication(Contact, { redirectType: RedirectType.Account })
      const renderResult = await renderAndLoadAsync(<WrappedComponent assetPaths={{}} />)
      getByRole = renderResult.getByRole
      getByText = renderResult.getByText
      getByDisplayValue = renderResult.getByDisplayValue
    })

    afterEach(() => {
      jest.restoreAllMocks()
      restoreWindowLocation(originalLocation)
    })

    it("contains the contact info page", () => {
      expect(getByRole("link", { name: "Back to account overview" })).toBeInTheDocument()
    })

    it("displays the current email from the user profile", () => {
      expect(getByText(mockProfileStub.email)).toBeInTheDocument()
    })

    it("displays the link to change the email", () => {
      expect(getByRole("link", { name: "account settings" })).toHaveAttribute(
        "href",
        getMyAccountSettingsPath()
      )
    })

    it("displays the current phone from the user profile", () => {
      expect(getByDisplayValue(mockProfileStub.phone)).toBeInTheDocument()
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
