import React from "react"
import { act, renderHook } from "@testing-library/react"
import { useNavigate } from "react-router"
import { useSignOutToSignIn } from "../../../authentication/session/useSignOutToSignIn"
import { useAuthSession } from "../../../authentication/session/AuthSessionProvider"
import UserContext, { ContextProps } from "../../../authentication/context/UserContext"
import { getSignInPath } from "../../../util/routeUtil"
import { mockProfileStub } from "../../__util__/accountUtils"

jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useNavigate: jest.fn(),
}))

jest.mock("../../../authentication/session/AuthSessionProvider", () => ({
  useAuthSession: jest.fn(),
}))

const navigate = jest.fn()
const signOut = jest.fn()

const renderSignOut = (profile: ContextProps["profile"]) =>
  renderHook(() => useSignOutToSignIn(), {
    wrapper: ({ children }) => (
      <UserContext.Provider value={{ profile } as ContextProps}>{children}</UserContext.Provider>
    ),
  })

describe("useSignOutToSignIn", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useNavigate as jest.Mock).mockReturnValue(navigate)
    ;(useAuthSession as jest.Mock).mockReturnValue({ signOut })
  })

  describe("Given a housing counselor in a delegated account", () => {
    const delegatedProfile = {
      ...mockProfileStub,
      firstName: "Rosa",
      lastName: "Flores",
      isDelegated: true,
    }

    describe("When sign-out succeeds", () => {
      it("then they go to sign-in carrying whose account they left", async () => {
        signOut.mockResolvedValue(undefined)
        const { result } = renderSignOut(delegatedProfile)

        await act(() => result.current())

        expect(navigate).toHaveBeenCalledWith(getSignInPath(), {
          state: { housingCounselorSignedOut: "Rosa Flores" },
        })
      })
    })

    describe("When sign-out fails", () => {
      it("then they stay on the page and the failure is not re-thrown", async () => {
        signOut.mockRejectedValue(new Error("network error"))
        const { result } = renderSignOut(delegatedProfile)

        await expect(result.current()).resolves.toBeUndefined()

        expect(navigate).not.toHaveBeenCalled()
      })
    })
  })
})
