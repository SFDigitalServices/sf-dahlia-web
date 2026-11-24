import React from "react"
import { act, renderHook, waitFor } from "@testing-library/react"
import { useOwnEmailLockedForHousingCounselor } from "../../hooks/useOwnEmailLockedForHousingCounselor"
import UserContext, { ContextProps } from "../../authentication/context/UserContext"
import { useAuthSession } from "../../authentication/session/AuthSessionProvider"
import { getHousingCounselorStatus } from "../../api/authApiService"
import { useFeatureFlag } from "../../hooks/useFeatureFlag"
import { mockProfileStub } from "../__util__/accountUtils"

jest.mock("../../hooks/useFeatureFlag", () => ({ useFeatureFlag: jest.fn() }))
jest.mock("../../authentication/session/AuthSessionProvider", () => ({
  useAuthSession: jest.fn(),
}))
jest.mock("../../api/authApiService", () => ({ getHousingCounselorStatus: jest.fn() }))

const UNKNOWN = { emailLocked: false, emailLockKnown: false }
const UNLOCKED = { emailLocked: false, emailLockKnown: true }
const LOCKED = { emailLocked: true, emailLockKnown: true }

const deferred = <T,>() => {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((done) => {
    resolve = done
  })
  return { promise, resolve }
}

const settle = async <T,>(
  lookup: { promise: Promise<T>; resolve: (value: T) => void },
  value: T
) => {
  lookup.resolve(value)
  await lookup.promise
}

const setFlag = ({ ready = true, enabled = true } = {}) => {
  ;(useFeatureFlag as jest.Mock).mockReturnValue({ flagsReady: ready, unleashFlag: enabled })
}

describe("useOwnEmailLockedForHousingCounselor", () => {
  let context: Partial<ContextProps>
  const getCredentials = jest.fn()

  const renderLockHook = () =>
    renderHook(() => useOwnEmailLockedForHousingCounselor(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <UserContext.Provider value={context}>{children}</UserContext.Provider>
      ),
    })

  beforeEach(() => {
    context = { profile: { ...mockProfileStub, isDelegated: false }, initialStateLoaded: true }
    getCredentials.mockResolvedValue({ kind: "bearerToken", token: "clerk-session-token" })
    ;(useAuthSession as jest.Mock).mockReturnValue({ getCredentials })
    ;(getHousingCounselorStatus as jest.Mock).mockResolvedValue(true)
    setFlag()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it("is unknown while feature flags load", () => {
    setFlag({ ready: false, enabled: false })

    expect(renderLockHook().result.current).toEqual(UNKNOWN)
    expect(getHousingCounselorStatus).not.toHaveBeenCalled()
  })

  it("is unlocked and known right away when the flag is off", () => {
    setFlag({ enabled: false })

    expect(renderLockHook().result.current).toEqual(UNLOCKED)
    expect(getHousingCounselorStatus).not.toHaveBeenCalled()
  })

  it("is unknown while the profile loads", () => {
    context = { profile: undefined, initialStateLoaded: false }

    expect(renderLockHook().result.current).toEqual(UNKNOWN)
  })

  it("is unlocked without a lookup for a counselor acting for an applicant", () => {
    context.profile = { ...mockProfileStub, isDelegated: true }

    expect(renderLockHook().result.current).toEqual(UNLOCKED)
    expect(getHousingCounselorStatus).not.toHaveBeenCalled()
  })

  it("is unknown until the counselor lookup answers, then locked", async () => {
    const lookup = deferred<boolean>()
    ;(getHousingCounselorStatus as jest.Mock).mockReturnValue(lookup.promise)

    const { result } = renderLockHook()
    expect(result.current).toEqual(UNKNOWN)

    await act(() => settle(lookup, true))
    expect(result.current).toEqual(LOCKED)
    expect(getHousingCounselorStatus).toHaveBeenCalledWith("clerk-session-token")
  })

  it("is unlocked and known when the lookup fails", async () => {
    ;(getHousingCounselorStatus as jest.Mock).mockRejectedValue(new Error("Network Error"))

    const { result } = renderLockHook()

    await waitFor(() => expect(result.current).toEqual(UNLOCKED))
  })

  // Review finding: the lock must not outlive the conditions that set it.
  it("unlocks when the flag turns off after locking", async () => {
    const { result, rerender } = renderLockHook()
    await waitFor(() => expect(result.current).toEqual(LOCKED))

    setFlag({ enabled: false })
    rerender()

    expect(result.current).toEqual(UNLOCKED)
  })

  it("unlocks when the profile becomes delegated after locking", async () => {
    const { result, rerender } = renderLockHook()
    await waitFor(() => expect(result.current).toEqual(LOCKED))

    context = { ...context, profile: { ...mockProfileStub, isDelegated: true } }
    rerender()

    expect(result.current).toEqual(UNLOCKED)
  })

  // Review finding: a lookup that is superseded must not apply its late answer.
  it("ignores a late answer from a lookup that was superseded", async () => {
    const firstLookup = deferred<boolean>()
    const secondLookup = deferred<boolean>()
    ;(getHousingCounselorStatus as jest.Mock)
      .mockReturnValueOnce(firstLookup.promise)
      .mockReturnValueOnce(secondLookup.promise)
    const { result, rerender } = renderLockHook()
    await waitFor(() => expect(getHousingCounselorStatus).toHaveBeenCalledTimes(1))

    // Conditions change and change back, so a second lookup starts
    context = { ...context, profile: { ...mockProfileStub, isDelegated: true } }
    rerender()
    context = { ...context, profile: { ...mockProfileStub, isDelegated: false } }
    rerender()
    await waitFor(() => expect(getHousingCounselorStatus).toHaveBeenCalledTimes(2))

    await act(() => settle(firstLookup, true))
    expect(result.current).toEqual(UNKNOWN)

    await act(() => settle(secondLookup, false))
    expect(result.current).toEqual(UNLOCKED)
  })
})
