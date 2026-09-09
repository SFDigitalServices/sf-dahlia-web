import React from "react"
import { act, render, screen, waitFor } from "@testing-library/react"
import { useAuth } from "@clerk/react"

import {
  AuthSessionProvider,
  useAuthSession,
} from "../../../authentication/session/AuthSessionProvider"
import { useFeatureFlag } from "../../../hooks/useFeatureFlag"

jest.mock("@clerk/react", () => ({
  useAuth: jest.fn(),
  ClerkProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

jest.mock("../../../hooks/useFeatureFlag", () => ({
  useFeatureFlag: jest.fn(),
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

// The probe resolves credentials in an effect, so the render has to settle
// inside act() or React warns and jest-fail-on-console turns that into an error.
const renderProbe = async () => {
  let result: ReturnType<typeof render>
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
  })

  // withAppSetup rendered nothing until the flag resolved, and this provider
  // took that over. Rendering children here instead would expose every consumer
  // to a state where auth is not yet knowable.
  it("renders nothing until the flag resolves", async () => {
    mockFlag(false, false)
    mockClerk("token")

    const { container } = await renderProbe()

    expect(container).toBeEmptyDOMElement()
  })

  // TODO: CLERK MIGRATION - DEVISE TECH DEBT TO REMOVE
  it("renders children with no session when the flag is off", async () => {
    mockFlag(false)
    mockClerk("token")

    await renderProbe()

    // Children render, but nothing behind them claims a session.
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

  // A signed-in user Clerk will not issue a token for has no usable session.
  // Callers treat this as an error rather than sending an unauthenticated
  // request, so the distinction has to survive the adapter.
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
})
