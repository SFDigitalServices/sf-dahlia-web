import React from "react"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { ClerkProvider, useAuth } from "@clerk/react"

import {
  AuthSessionProvider,
  useAuthSession,
} from "../../../authentication/session/AuthSessionProvider"
import { clearHeaders } from "../../../authentication/token"
import { useFeatureFlag } from "../../../hooks/useFeatureFlag"

jest.mock("@clerk/react", () => ({
  useAuth: jest.fn(),
  ClerkProvider: jest.fn(({ children }: { children: React.ReactNode }) => <>{children}</>),
}))

jest.mock("../../../hooks/useFeatureFlag", () => ({
  useFeatureFlag: jest.fn(),
}))

jest.mock("../../../authentication/token", () => ({
  ...jest.requireActual("../../../authentication/token"),
  clearHeaders: jest.fn(),
}))

const mockFlag = (unleashFlag: boolean, flagsReady = true) =>
  (useFeatureFlag as jest.Mock).mockReturnValue({ unleashFlag, flagsReady })

const mockClerk = (token: string | null, isSignedIn = true) =>
  (useAuth as jest.Mock).mockReturnValue({
    isLoaded: true,
    isSignedIn,
    getToken: jest.fn().mockResolvedValue(token),
  })

const Probe = () => {
  const { status, getCredentials } = useAuthSession()
  const [credentials, setCredentials] = React.useState<string>("")

  React.useEffect(() => {
    void getCredentials().then((c) => setCredentials(JSON.stringify(c)))
  }, [getCredentials])

  return (
    <div>
      <p data-testid="status">{status.kind}</p>
      <p data-testid="credentials">{credentials}</p>
    </div>
  )
}

// Settle the credentials effect inside act() to avoid act() warnings.
const renderProbe = async () => {
  let result!: ReturnType<typeof render>
  // eslint-disable-next-line @typescript-eslint/require-await
  await act(async () => {
    result = render(
      <AuthSessionProvider>
        <Probe />
      </AuthSessionProvider>
    )
  })
  return result
}

describe("AuthSessionProvider", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // setupTests resets mocks, which strips this passthrough.
    ;(ClerkProvider as unknown as jest.Mock).mockImplementation(
      ({ children }: { children: React.ReactNode }) => <>{children}</>
    )
  })

  it("renders nothing until the flag resolves", async () => {
    mockFlag(false, false)
    mockClerk("token")

    const { container } = await renderProbe()

    expect(container).toBeEmptyDOMElement()
  })

  // TODO(DAH-4366): CLERK MIGRATION - DEVISE TECH DEBT TO REMOVE
  it("renders children with no session when the flag is off", async () => {
    mockFlag(false)
    mockClerk("token")

    await renderProbe()

    expect(screen.getByTestId("status").textContent).toBe("initializing")
    await waitFor(() =>
      expect(screen.getByTestId("credentials").textContent).toBe(`{"kind":"none"}`)
    )
  })

  it("provides Clerk's session when the flag is on", async () => {
    mockFlag(true)
    mockClerk("clerk-session-token")

    await renderProbe()

    expect(screen.getByTestId("status").textContent).toBe("signedIn")
    await waitFor(() =>
      expect(screen.getByTestId("credentials").textContent).toBe(
        `{"kind":"bearerToken","token":"clerk-session-token"}`
      )
    )
  })

  it("reports no credentials when Clerk issues no token", async () => {
    mockFlag(true)
    mockClerk(null)

    await renderProbe()

    expect(screen.getByTestId("status").textContent).toBe("signedIn")
    await waitFor(() =>
      expect(screen.getByTestId("credentials").textContent).toBe(`{"kind":"none"}`)
    )
  })

  it("reports signed out when Clerk has no session", async () => {
    mockFlag(true)
    mockClerk(null, false)

    await renderProbe()

    expect(screen.getByTestId("status").textContent).toBe("signedOut")
  })

  it("reports no credentials when Clerk fails to issue a token", async () => {
    mockFlag(true)
    ;(useAuth as jest.Mock).mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      getToken: jest.fn().mockRejectedValue(new Error("network")),
    })

    await renderProbe()

    await waitFor(() =>
      expect(screen.getByTestId("credentials").textContent).toBe(`{"kind":"none"}`)
    )
  })

  it("clears Devise headers, then ends the Clerk session, on sign out", async () => {
    mockFlag(true)
    const calls: string[] = []
    ;(clearHeaders as jest.Mock).mockImplementation(() => calls.push("clearHeaders"))
    ;(useAuth as jest.Mock).mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      getToken: jest.fn().mockResolvedValue("token"),
      signOut: jest.fn(() => {
        calls.push("clerkSignOut")
        return Promise.resolve()
      }),
    })

    const SignOutButton = () => {
      const { signOut } = useAuthSession()
      return (
        <button
          onClick={() => {
            void signOut()
          }}
        >
          Sign out
        </button>
      )
    }
    // eslint-disable-next-line @typescript-eslint/require-await
    await act(async () => {
      render(
        <AuthSessionProvider>
          <SignOutButton />
        </AuthSessionProvider>
      )
    })
    fireEvent.click(screen.getByRole("button", { name: "Sign out" }))

    await waitFor(() => expect(calls).toEqual(["clearHeaders", "clerkSignOut"]))
  })

  it("throws when a consumer has no provider above it", () => {
    // React logs the caught error to console.error; silence it so the run stays readable.
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {})

    expect(() => render(<Probe />)).toThrow(/must be used within an AuthSessionProvider/)

    consoleError.mockRestore()
  })
})
