import React, { createContext, useContext, useEffect } from "react"
import { ClerkProvider } from "@clerk/react"

import { useFeatureFlag } from "../../hooks/useFeatureFlag"
import { UNLEASH_FLAG } from "../../modules/constants"
import { AuthSession, INITIALIZING, NO_CREDENTIALS } from "./authStatus"
import { useClerkAuthSession } from "./adapters/clerk/useClerkAuthSession"

const noSession: AuthSession = {
  status: INITIALIZING,
  getCredentials: () => Promise.resolve(NO_CREDENTIALS),
  signOut: () => Promise.resolve(),
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
 * Clerk is deliberately the only implementation. Components not yet on it keep
 * the code path they have always had, so nothing is re-expressed here and
 * nothing can drift.
 */
export const AuthSessionProvider = ({ children }: { children: React.ReactNode }) => {
  const { unleashFlag: clerkEnabled, flagsReady } = useFeatureFlag(UNLEASH_FLAG.CLERK_AUTH, false)

  // Providing an initializing session instead would let the tree
  // mount immediately, at the cost of every consumer handling that state.
  // Probably a good TODO, but an improvement out of scope of creating this provider.
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
