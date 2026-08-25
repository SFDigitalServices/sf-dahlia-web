/* eslint-disable @typescript-eslint/unbound-method */
import React from "react"

import {
  renderAndLoadAsync,
  mockWindowLocation,
  restoreWindowLocation,
} from "../__util__/renderUtils"
import ResetPassword from "../../pages/reset-password"
import { setupUserContext } from "../__util__/accountUtils"
import { screen } from "@testing-library/react"
import { authenticatedPut } from "../../api/apiService"
import userEvent from "@testing-library/user-event"
import { useFeatureFlag } from "../../hooks/useFeatureFlag"
import { useSignIn, useUser } from "@clerk/clerk-react"

jest.mock("react-helmet-async", () => {
  return {
    HelmetProvider: ({ children }: { children: React.ReactNode }) => children, // Mock HelmetProvider
    Helmet: ({ children }: { children: React.ReactNode }) => children, // Mock Helmet component
  }
})

jest.mock("../../api/apiService", () => ({
  authenticatedPut: jest.fn(),
}))

jest.mock("../../hooks/useFeatureFlag", () => ({
  useFeatureFlag: jest.fn(() => ({ flagsReady: true, unleashFlag: true })),
}))

jest.mock("@clerk/clerk-react", () => {
  const Clerk = jest.requireActual("@clerk/clerk-react")
  return {
    ...Clerk,
    ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
    useAuth: jest.fn(() => ({ isLoaded: true, isSignedIn: false })),
    useSignIn: jest.fn(),
    useUser: jest.fn(),
  }
})

describe("<ResetPassword />", () => {
  beforeEach(() => {
    ;(useFeatureFlag as jest.Mock).mockReturnValue({ flagsReady: true, unleashFlag: false })
    ;(useSignIn as jest.Mock).mockReturnValue({
      isLoaded: true,
      signIn: null,
      setActive: jest.fn(),
    })
    ;(useUser as jest.Mock).mockReturnValue({ isLoaded: true, user: null })
  })
  describe("when the user is not signed in", () => {
    let originalLocation: Location

    beforeEach(() => {
      originalLocation = mockWindowLocation()

      setupUserContext({
        loggedIn: false,
      })
    })

    afterEach(() => {
      restoreWindowLocation(originalLocation)
      jest.restoreAllMocks()
    })

    it("redirects to the sign in page", async () => {
      await renderAndLoadAsync(<ResetPassword assetPaths={{}} />)
      expect(window.location.assign).toHaveBeenCalledWith("/sign-in")
    })
  })
  describe("when the user is signed in", () => {
    let originalLocation: Location

    beforeEach(() => {
      originalLocation = mockWindowLocation()

      setupUserContext({
        loggedIn: true,
      })
    })

    afterEach(() => {
      jest.restoreAllMocks()
      restoreWindowLocation(originalLocation)
    })

    it("shows the correct form text", async () => {
      await renderAndLoadAsync(<ResetPassword assetPaths={{}} />)
      expect(screen.getAllByText("Reset password")).not.toBeNull()
    })

    it("correctly resets the users password", async () => {
      ;(authenticatedPut as jest.Mock).mockResolvedValue({
        data: {
          status: "success",
        },
      })
      await renderAndLoadAsync(<ResetPassword assetPaths={{}} />)
      expect(screen.getAllByText("Reset password")).not.toBeNull()

      const passwordField = screen.getAllByLabelText(/password/i)[0]
      const updateButton = screen.getByRole("button", { name: /update password/i })

      await userEvent.type(passwordField, "password")
      await userEvent.click(updateButton)

      expect(
        screen.getByText(
          /choose a strong password with at least 8 characters, 1 letter, and 1 number/i
        )
      ).not.toBeNull()

      await userEvent.type(passwordField, "1")
      await userEvent.click(updateButton)
      expect(authenticatedPut).toHaveBeenCalledWith(
        "/api/v1/auth/password",
        expect.objectContaining({
          password: "password1",
          password_confirmation: "password1",
        })
      )
      expect(window.location.assign).toHaveBeenCalledWith("/account/applications")
    })

    it("shows an error message when the server responds with an error", async () => {
      ;(authenticatedPut as jest.Mock).mockRejectedValueOnce({
        response: {
          status: 500,
        },
      })

      await renderAndLoadAsync(<ResetPassword assetPaths={{}} />)
      expect(screen.getAllByText("Reset password")).not.toBeNull()

      const passwordField = screen.getAllByLabelText(/password/i)[0]
      const updateButton = screen.getByRole("button", { name: /update password/i })

      await userEvent.type(passwordField, "password1")
      await userEvent.click(updateButton)

      expect(
        screen.getByText(/something went wrong\. try again or check back later/i)
      ).not.toBeNull()
    })
    it("renders the add password page when clerk is enabled", async () => {
      ;(useFeatureFlag as jest.Mock).mockReturnValue({ flagsReady: true, unleashFlag: true })
      ;(useSignIn as jest.Mock).mockReturnValue({
        isLoaded: true,
        signIn: { status: "needs_new_password" },
        setActive: jest.fn(),
      })
      ;(useUser as jest.Mock).mockReturnValue({ isLoaded: true, user: null })

      await renderAndLoadAsync(<ResetPassword assetPaths={{}} />)

      expect(screen.getByRole("button", { name: /save password/i })).not.toBeNull()
    })
  })
})
