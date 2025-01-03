import React, { useContext } from "react"
import { act, render, screen, waitFor } from "@testing-library/react"
import UserProvider from "../../../authentication/context/UserProvider"
import UserContext, { ContextProps } from "../../../authentication/context/UserContext"
import { getProfile, signIn } from "../../../api/authApiService"
import { isTokenValid } from "../../../authentication/token"
import { renderAndLoadAsync } from "../../__util__/renderUtils"
import { mockProfileStub } from "../../__util__/accountUtils"

jest.mock("../../../api/authApiService", () => ({
  getProfile: jest.fn(),
  signIn: jest.fn(),
}))

jest.mock("../../../authentication/token", () => {
  const actualTokenModule = jest.requireActual("../../../authentication/token")
  return {
    ...actualTokenModule,
    isTokenValid: jest.fn(),
  }
})

const mockGetItem = jest.fn()
const mockSetItem = jest.fn()
const mockRemoveItem = jest.fn()
Object.defineProperty(window, "sessionStorage", {
  value: {
    getItem: (...args: string[]) => mockGetItem(...args),
    setItem: (...args: string[]) => mockSetItem(...args),
    removeItem: (...args: string[]) => mockRemoveItem(...args),
  },
})

const TestComponent = () => {
  const { signIn, signOut, profile, initialStateLoaded } = useContext(UserContext) as ContextProps

  return (
    <div>
      {initialStateLoaded && <p>Initial state loaded</p>}
      {profile ? (
        <div>
          <p>Signed in as {profile.uid}</p>
          <button onClick={signOut}>Sign Out</button>
        </div>
      ) : (
        <button
          onClick={() => {
            // The function will be mocked, but Typescript doesn't know that
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            signIn("test@example.com", "password")
          }}
        >
          Sign In
        </button>
      )}
    </div>
  )
}

describe("UserProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should load profile on mount if access token is available", async () => {
    ;(getProfile as jest.Mock).mockResolvedValue(mockProfileStub)
    ;(isTokenValid as jest.Mock).mockReturnValue(true)

    render(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    )

    await waitFor(() => expect(screen.getByText("Signed in as abc123")).not.toBeNull())
  })

  it("should sign in and sign out a user", async () => {
    ;(getProfile as jest.Mock).mockRejectedValue(undefined)
    ;(signIn as jest.Mock).mockResolvedValue(mockProfileStub)
    ;(isTokenValid as jest.Mock).mockReturnValueOnce(false).mockReturnValueOnce(true)

    await renderAndLoadAsync(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    )

    act(() => {
      screen.getByText("Sign In").click()
    })

    await waitFor(() => expect(screen.getByText("Signed in as abc123")).not.toBeNull())

    act(() => {
      screen.getByText("Sign Out").click()
    })

    await waitFor(() => expect(screen.getByText("Sign In")).not.toBeNull())
  })

  it("should handle token invalidation on initial load", async () => {
    ;(isTokenValid as jest.Mock).mockReturnValue(false)
    ;(getProfile as jest.Mock).mockResolvedValue(mockProfileStub)

    await renderAndLoadAsync(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    )

    expect(screen.getByText("Initial state loaded")).not.toBeNull()
  })

  it("should handle temporary auth params from URL", async () => {
    Object.defineProperty(window, "location", {
      writable: true,
      value: {
        href: "http://localhost:3000/reset-password?access-token=DDDDD&client=CCCCC&client_id=BBBBB&config=default&expiry=100&reset_password=true&token=AAAAAA&uid=test%40test.com",
      },
    })
    ;(isTokenValid as jest.Mock).mockReturnValue(true)
    ;(getProfile as jest.Mock).mockResolvedValue(mockProfileStub)

    await renderAndLoadAsync(
      <UserProvider>
        <TestComponent />
      </UserProvider>
    )

    await waitFor(() => expect(screen.getByText("Signed in as abc123")).not.toBeNull())
    expect(getProfile).toHaveBeenCalled()
  })
})
