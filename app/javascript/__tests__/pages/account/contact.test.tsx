/* eslint-disable @typescript-eslint/unbound-method */
import {
  renderAndLoadAsync,
  mockWindowLocation,
  restoreWindowLocation,
} from "../../__util__/renderUtils"
import Contact from "../../../pages/account/contact"
import React from "react"
import { fireEvent, waitFor, type RenderResult } from "@testing-library/react"
import { mockProfileStub, setupUserContext } from "../../__util__/accountUtils"
import { getMyAccountSettingsPath } from "../../../util/routeUtil"
import * as authApiService from "../../../api/authApiService"
import * as authSession from "../../../authentication/session/AuthSessionProvider"
import * as authStatus from "../../../authentication/session/authStatus"

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
      const renderResult = await renderAndLoadAsync(<Contact assetPaths={{}} />)
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

  describe("when submitting the phone form", () => {
    let getByRole: RenderResult["getByRole"]
    let originalLocation: Location
    let getCredentials: jest.Mock
    let updatePhoneSpy: jest.SpyInstance

    beforeEach(async () => {
      originalLocation = mockWindowLocation()
      setupUserContext({ loggedIn: true })
      getCredentials = jest.fn()
      const actualUseAuthSession = authSession.useAuthSession
      jest.spyOn(authSession, "useAuthSession").mockImplementation(() => {
        const session = actualUseAuthSession()
        getCredentials.mockImplementation(session.getCredentials)
        return { ...session, getCredentials }
      })

      jest.spyOn(authStatus, "bearerToken").mockReturnValue("test-token")
      updatePhoneSpy = jest
        .spyOn(authApiService, "updatePhone")
        .mockResolvedValue({ ...mockProfileStub })

      const renderResult = await renderAndLoadAsync(<Contact assetPaths={{}} />)
      getByRole = renderResult.getByRole
      getCredentials.mockClear()
    })

    afterEach(() => {
      jest.restoreAllMocks()
      restoreWindowLocation(originalLocation)
    })

    it("does not save the phone when getting credentials fails", async () => {
      getCredentials.mockRejectedValueOnce(new Error("session expired"))

      fireEvent.click(getByRole("button", { name: /save/i }))

      await waitFor(() => expect(getCredentials).toHaveBeenCalledTimes(1))
      expect(updatePhoneSpy).not.toHaveBeenCalled()
    })

    it("saves the phone with the session token when credentials resolve", async () => {
      const credentials = { token: "abc" }
      getCredentials.mockResolvedValueOnce(credentials)

      fireEvent.click(getByRole("button", { name: /save/i }))

      await waitFor(() => expect(updatePhoneSpy).toHaveBeenCalledTimes(1))
      expect(authStatus.bearerToken).toHaveBeenCalledWith(credentials)
      expect(updatePhoneSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          email: mockProfileStub.email,
          phone: mockProfileStub.phone,
        }),
        { clerkEnabled: true, sessionToken: "test-token" }
      )
    })

    it("does not save the phone when there is no session token", async () => {
      ;(authStatus.bearerToken as jest.Mock).mockReturnValue(undefined)
      getCredentials.mockResolvedValueOnce({})

      fireEvent.click(getByRole("button", { name: /save/i }))

      await waitFor(() => expect(authStatus.bearerToken).toHaveBeenCalled())
      expect(updatePhoneSpy).not.toHaveBeenCalled()
    })
  })
})
