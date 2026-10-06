import React, { useContext } from "react"
import { render, screen, waitFor } from "@testing-library/react"
import UserProvider from "../../../authentication/context/UserProvider"
import UserContext, { ContextProps } from "../../../authentication/context/UserContext"
import { getProfile } from "../../../api/authApiService"
import { useAuthSession } from "../../../authentication/session/AuthSessionProvider"
import {
  AuthSession,
  AuthStatus,
  SIGNED_IN,
  SIGNED_OUT,
} from "../../../authentication/session/authStatus"
import { mockProfileStub } from "../../__util__/accountUtils"

jest.mock("../../../api/authApiService", () => ({
  getProfile: jest.fn(),
  signIn: jest.fn(),
}))

jest.mock("../../../hooks/useFeatureFlag", () => ({
  useFeatureFlag: () => ({ flagsReady: true, unleashFlag: true }),
}))

jest.mock("../../../authentication/session/AuthSessionProvider", () => ({
  useAuthSession: jest.fn(),
}))

const sessionWith = (status: AuthStatus): AuthSession => ({
  status,
  getCredentials: () => Promise.resolve({ kind: "bearerToken", token: "clerk-token" }),
  signOut: () => Promise.resolve(),
  isSigningOut: () => false,
})

const ProfileName = () => {
  const { profile } = useContext(UserContext) as ContextProps
  return <p>{profile ? `Signed in as ${profile.uid}` : "No profile"}</p>
}

const renderWithStatus = (status: AuthStatus) => {
  ;(useAuthSession as jest.Mock).mockReturnValue(sessionWith(status))
  return render(
    <UserProvider>
      <ProfileName />
    </UserProvider>
  )
}

describe("UserProvider with Clerk", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("Given a signed-in user whose profile is loaded", () => {
    describe("When the Clerk session signs out", () => {
      it("then the cached profile is cleared", async () => {
        ;(getProfile as jest.Mock).mockResolvedValue(mockProfileStub)
        const { rerender } = renderWithStatus(SIGNED_IN)
        await screen.findByText("Signed in as abc123")
        ;(useAuthSession as jest.Mock).mockReturnValue(sessionWith(SIGNED_OUT))
        rerender(
          <UserProvider>
            <ProfileName />
          </UserProvider>
        )

        await screen.findByText("No profile")
      })
    })

    describe("When a different user signs in after signing out", () => {
      it("then the new user's profile is fetched instead of reusing the previous one", async () => {
        ;(getProfile as jest.Mock)
          .mockResolvedValueOnce(mockProfileStub)
          .mockResolvedValueOnce({ ...mockProfileStub, uid: "next-user" })
        const { rerender } = renderWithStatus(SIGNED_IN)
        await screen.findByText("Signed in as abc123")

        for (const status of [SIGNED_OUT, SIGNED_IN]) {
          ;(useAuthSession as jest.Mock).mockReturnValue(sessionWith(status))
          rerender(
            <UserProvider>
              <ProfileName />
            </UserProvider>
          )
          await waitFor(() => expect(screen.queryByText("Signed in as abc123")).toBeNull())
        }

        await screen.findByText("Signed in as next-user")
        expect(getProfile).toHaveBeenCalledTimes(2)
      })
    })
  })
})
