import React, { createContext, useContext, useEffect } from "react"
import { ClerkProvider } from "@clerk/react"

import { useFeatureFlag } from "../../hooks/useFeatureFlag"
import { UNLEASH_FLAG } from "../../modules/constants"
import { AuthSession, INITIALIZING, NO_CREDENTIALS } from "./authStatus"
import { useClerkAuthSession } from "./adapters/clerk/useClerkAuthSession"

export type { AuthSession } from "./authStatus"

/**
 * The session for a tree with the flag off. Stays in `initializing`, so a
 * consumer that lands here waits rather than acting on an answer nothing gave it.
 */
const noSession: AuthSession = {
  status: INITIALIZING,
  getCredentials: () => Promise.resolve(NO_CREDENTIALS),
}

// `null` rather than `noSession` so "no provider above me" is distinguishable
// from "a provider chose not to supply a session". Both hand back noSession, but
// only the first is a bug worth saying out loud.
const AuthSessionContext = createContext<AuthSession | null>(null)

export const useAuthSession = (): AuthSession => {
  const session = useContext(AuthSessionContext)

  // Without this the component sits in `initializing` forever and the page
  // spins with nothing in the console. useAuth() used to throw here.
  useEffect(() => {
    if (session || process.env.NODE_ENV === "production") return
    console.error(
      "useAuthSession called with no AuthSessionProvider above it. The session will stay in `initializing` and never resolve. Mount AuthSessionProvider (withAppSetup does) or render this component under one."
    )
  }, [session])

  return session ?? noSession
}

const ClerkAuthSession = ({ children }: { children: React.ReactNode }) => {
  const value = useClerkAuthSession()
  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>
}

/**
 * Chooses the auth provider for the tree, once.
 *
 * Clerk is deliberately the only implementation. Components not yet on it keep
 * the code path they have always had, so nothing is re-expressed here and
 * nothing can drift.
 */
export const AuthSessionProvider = ({ children }: { children: React.ReactNode }) => {
  const { unleashFlag: clerkEnabled, flagsReady } = useFeatureFlag(UNLEASH_FLAG.CLERK_AUTH, false)
  const parentSession = useContext(AuthSessionContext)

  // Nesting is a no-op rather than a second provider: mounting ClerkProvider
  // twice gives the tree two Clerk instances with separate token caches. Test
  // helpers wrap trees that already carry their own provider from withAppSetup,
  // and this keeps that from silently building the wrong shape.
  if (parentSession) {
    return <>{children}</>
  }

  // Nothing renders until the flag resolves, so the whole page waits on an
  // Unleash call. Providing an "initializing" session instead would let the tree
  // mount immediately, at the cost of every consumer handling that state.
  if (!flagsReady) {
    return null
  }

  // TODO: CLERK MIGRATION - DEVISE TECH DEBT TO REMOVE
  // The flag read above and this branch go once the flag does. noSession is
  // provided explicitly rather than left unset, so that an absent context keeps
  // meaning "no provider above me" and nothing else.
  if (!clerkEnabled) {
    return <AuthSessionContext.Provider value={noSession}>{children}</AuthSessionContext.Provider>
  }

  return (
    <ClerkProvider publishableKey={process.env.CLERK_PUBLISHABLE_KEY}>
      <ClerkAuthSession>{children}</ClerkAuthSession>
    </ClerkProvider>
  )
}

export default AuthSessionContext
