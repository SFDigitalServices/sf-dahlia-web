import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { useReverification, useSession } from "@clerk/react"

import {
  ReverificationMethod,
  ReverificationOutcome,
  ReverificationPrompt,
} from "../../reverificationSession"

// Local shapes for the parts of Clerk's session verification we read. @clerk/react v6's types
// don't resolve under moduleResolution:"node", so these keep the calls below honest.
type VerificationLevel = "first_factor" | "second_factor" | "multi_factor"
type FirstFactor = { strategy: string; emailAddressId?: string; safeIdentifier?: string }
type SessionVerification = {
  status: "needs_first_factor" | "needs_second_factor" | "complete"
  supportedFirstFactors: FirstFactor[] | null
}
type NeedsReverification = {
  level: VerificationLevel | undefined
  complete: () => void
  cancel: () => void
}

type ReverificationContextValue = {
  pending: NeedsReverification | null
  request: (needs: NeedsReverification) => void
  clear: () => void
}

const ReverificationContext = createContext<ReverificationContextValue | null>(null)

const NOT_READY: ReverificationOutcome = {
  notReady: true,
  error: new Error("Reverification is not ready"),
}

/** Holds the one sensitive action waiting on reverification, if any. */
export const ClerkReverificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [pending, setPending] = useState<NeedsReverification | null>(null)
  const pendingRef = useRef<NeedsReverification | null>(null)

  const request = useCallback((needs: NeedsReverification) => {
    // A second sensitive action supersedes the first rather than leaving it hanging forever.
    pendingRef.current?.cancel()
    pendingRef.current = needs
    setPending(needs)
  }, [])

  const clear = useCallback(() => {
    pendingRef.current = null
    setPending(null)
  }, [])

  const value = useMemo(() => ({ pending, request, clear }), [pending, request, clear])

  return <ReverificationContext.Provider value={value}>{children}</ReverificationContext.Provider>
}

/**
 * Wraps a Clerk call that may need reverification. Instead of Clerk's modal, the pending action
 * is handed to the provider, and the call resolves once the prompt completes and the retry does.
 */
export const useClerkReverifiedAction = <Args extends unknown[], Result>(
  action: (...args: Args) => Promise<Result>
): ((...args: Args) => Promise<Result>) => {
  const context = useContext(ReverificationContext)

  return useReverification(action, {
    // Without a provider there is nowhere to render the prompt, so fail the action instead of
    // silently falling back to Clerk's modal.
    onNeedsReverification: (needs: NeedsReverification) =>
      context ? context.request(needs) : needs.cancel(),
  }) as (...args: Args) => Promise<Result>
}

export const isReverificationCancelled = (error: unknown): boolean =>
  (error as { code?: string } | undefined)?.code === "reverification_cancelled"

const methodsFor = (factors: FirstFactor[]): ReverificationMethod[] => {
  // An emailed code comes first: every DAHLIA account has one, not every account has a password.
  const methods: ReverificationMethod[] = []
  if (factors.some(({ strategy }) => strategy === "email_code")) methods.push("emailCode")
  if (factors.some(({ strategy }) => strategy === "password")) methods.push("password")
  return methods
}

export const useClerkReverificationPrompt = (): ReverificationPrompt | null => {
  const context = useContext(ReverificationContext)
  const { session } = useSession()
  const [factors, setFactors] = useState<FirstFactor[] | null>(null)
  const [isBusy, setIsBusy] = useState(false)

  // The session object is replaced as verification progresses; starting over on every
  // replacement would restart the verification the user is partway through.
  const sessionRef = useRef(session)
  sessionRef.current = session

  const pending = context?.pending ?? null

  useEffect(() => {
    setFactors(null)
    if (!pending) return

    let active = true
    sessionRef.current
      ?.startVerification({ level: pending.level ?? "first_factor" })
      .then((verification: SessionVerification) => {
        if (active) setFactors(verification.supportedFirstFactors ?? [])
      })
      .catch((error: unknown) => {
        console.error("Start reverification error:", error)
        if (active) setFactors([])
      })

    return () => {
      active = false
    }
  }, [pending])

  const run = useCallback(
    async (
      attempt: () => Promise<SessionVerification | undefined>
    ): Promise<ReverificationOutcome> => {
      if (!pending || !sessionRef.current) return NOT_READY

      setIsBusy(true)
      try {
        const verification = await attempt()
        if (verification && verification.status !== "complete") {
          return { error: new Error(`Reverification not complete: ${verification.status}`) }
        }
        return {}
      } catch (error) {
        console.error("Reverification error:", error)
        return { error }
      } finally {
        setIsBusy(false)
      }
    },
    [pending]
  )

  const finishIfComplete = useCallback(
    (outcome: ReverificationOutcome): ReverificationOutcome => {
      if (!outcome.error && pending) {
        context?.clear()
        pending.complete()
      }
      return outcome
    },
    [context, pending]
  )

  const emailFactor = factors?.find(({ strategy }) => strategy === "email_code")

  const sendEmailCode = useCallback(async (): Promise<ReverificationOutcome> => {
    if (!emailFactor?.emailAddressId) return NOT_READY
    // Sending a code prepares the verification but doesn't complete it.
    return run(async () => {
      await sessionRef.current?.prepareFirstFactorVerification({
        strategy: "email_code",
        emailAddressId: emailFactor.emailAddressId,
      })
      return undefined
    })
  }, [emailFactor?.emailAddressId, run])

  const verifyEmailCode = useCallback(
    async (verificationCode: string): Promise<ReverificationOutcome> =>
      finishIfComplete(
        await run(() =>
          sessionRef.current?.attemptFirstFactorVerification({
            strategy: "email_code",
            code: verificationCode,
          })
        )
      ),
    [run, finishIfComplete]
  )

  const verifyPassword = useCallback(
    async (password: string): Promise<ReverificationOutcome> =>
      finishIfComplete(
        await run(() =>
          sessionRef.current?.attemptFirstFactorVerification({ strategy: "password", password })
        )
      ),
    [run, finishIfComplete]
  )

  const cancel = useCallback(() => {
    if (!pending) return
    context?.clear()
    pending.cancel()
  }, [context, pending])

  return useMemo((): ReverificationPrompt | null => {
    if (!pending || !factors) return null
    return {
      methods: methodsFor(factors),
      emailAddress: emailFactor?.safeIdentifier,
      isBusy,
      sendEmailCode,
      verifyEmailCode,
      verifyPassword,
      cancel,
    }
  }, [
    pending,
    factors,
    emailFactor?.safeIdentifier,
    isBusy,
    sendEmailCode,
    verifyEmailCode,
    verifyPassword,
    cancel,
  ])
}
