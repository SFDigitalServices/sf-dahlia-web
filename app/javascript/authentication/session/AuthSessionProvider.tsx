import React, { createContext, useContext } from "react"
import { ClerkProvider } from "@clerk/react"

import { useFeatureFlag } from "../../hooks/useFeatureFlag"
import { UNLEASH_FLAG } from "../../modules/constants"
import { AuthSession, INITIALIZING, NO_CREDENTIALS } from "./authStatus"
import { useClerkAuthSession } from "./adapters/clerk/useClerkAuthSession"
import { ClerkReverificationProvider } from "./adapters/clerk/ClerkReverificationProvider"

export type { AuthSession } from "./authStatus"

const noSession: AuthSession = {
  status: INITIALIZING,
  getCredentials: () => Promise.resolve(NO_CREDENTIALS),
  signOut: () => Promise.resolve(),
}

const AuthSessionContext = createContext<AuthSession | null>(null)

export const useAuthSession = (): AuthSession => {
  const session = useContext(AuthSessionContext)

  if (!session) {
    throw new Error(
      "useAuthSession must be used within an AuthSessionProvider (withAppSetup mounts one)."
    )
  }

  return session
}

const ClerkAuthSession = ({ children }: { children: React.ReactNode }) => {
  const value = useClerkAuthSession()
  return (
    <AuthSessionContext.Provider value={value}>
      <ClerkReverificationProvider>{children}</ClerkReverificationProvider>
    </AuthSessionContext.Provider>
  )
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

  // TODO(DAH-4366): CLERK MIGRATION - DEVISE TECH DEBT TO REMOVE
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
