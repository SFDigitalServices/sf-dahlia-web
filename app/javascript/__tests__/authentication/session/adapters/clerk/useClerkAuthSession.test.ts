import { act, renderHook } from "@testing-library/react"
import { useAuth } from "@clerk/react"
import { useClerkAuthSession } from "../../../../../authentication/session/adapters/clerk/useClerkAuthSession"
import { clearHousingCounselorSession } from "../../../../../api/authApiService"

jest.mock("../../../../../api/authApiService", () => ({
  clearHousingCounselorSession: jest.fn(),
}))

jest.mock("../../../../../authentication/token", () => ({
  clearHeaders: jest.fn(),
}))

const getToken = jest.fn()
const clerkSignOut = jest.fn()

const mockClerkSignedIn = (isSignedIn: boolean) => {
  ;(useAuth as jest.Mock).mockReturnValue({
    isLoaded: true,
    isSignedIn,
    getToken,
    signOut: clerkSignOut,
  })
}

const renderSignedInSession = () => {
  mockClerkSignedIn(true)
  return renderHook(() => useClerkAuthSession())
}

describe("useClerkAuthSession", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(clearHousingCounselorSession as jest.Mock).mockResolvedValue(undefined)
    clerkSignOut.mockResolvedValue(undefined)
  })

  describe("Given a signed-in user who signs out", () => {
    describe("When Clerk reports the session has ended", () => {
      it("then the sign-out is still in progress", async () => {
        const { result, rerender } = renderSignedInSession()
        await act(() => result.current.signOut())

        mockClerkSignedIn(false)
        rerender()

        expect(result.current.isSigningOut()).toBe(true)
      })
    })

    describe("When they sign back in and that later session ends", () => {
      it("then the later session ending is not treated as a sign-out in progress", async () => {
        const { result, rerender } = renderSignedInSession()
        await act(() => result.current.signOut())

        for (const isSignedIn of [false, true, false]) {
          mockClerkSignedIn(isSignedIn)
          rerender()
        }

        expect(result.current.isSigningOut()).toBe(false)
      })
    })
  })

  describe("Given clearing the housing counselor session fails", () => {
    describe("When the user signs out", () => {
      it("then the Clerk session still ends", async () => {
        ;(clearHousingCounselorSession as jest.Mock).mockRejectedValue(new Error("network error"))
        const { result } = renderSignedInSession()

        await act(() => result.current.signOut())

        expect(clerkSignOut).toHaveBeenCalled()
      })
    })
  })

  describe("Given Clerk's sign-out fails", () => {
    describe("When the user signs out", () => {
      it("then the error propagates and the sign-out is no longer in progress", async () => {
        clerkSignOut.mockRejectedValue(new Error("network error"))
        const { result } = renderSignedInSession()

        await expect(result.current.signOut()).rejects.toThrow("network error")

        expect(result.current.isSigningOut()).toBe(false)
      })
    })
  })
})
