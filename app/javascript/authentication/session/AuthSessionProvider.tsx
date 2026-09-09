import React, { createContext, useContext } from "react"
import { ClerkProvider } from "@clerk/react"

import { useFeatureFlag } from "../../hooks/useFeatureFlag"
import { UNLEASH_FLAG } from "../../modules/constants"
import { AuthSession, INITIALIZING, NO_CREDENTIALS } from "./authStatus"
import { useClerkAuthSession } from "./adapters/clerk/useClerkAuthSession"

export type { AuthSession } from "./authStatus"

/**
 * The session for a tree with no auth provider: rendered outside
 * AuthSessionProvider, or under it with the flag off. Stays in `initializing`,
 * so a consumer that lands here waits forever rather than acting on an answer
 * nothing gave it.
 */
const noSession: AuthSession = {
  status: INITIALIZING,
  getCredentials: () => Promise.resolve(NO_CREDENTIALS),
}

const AuthSessionContext = createContext<AuthSession>(noSession)

export const useAuthSession = (): AuthSession => useContext(AuthSessionContext)

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

  // Nothing renders until the flag resolves, so the whole page waits on an
  // Unleash call. Providing an "initializing" session instead would let the tree
  // mount immediately, at the cost of every consumer handling that state.
  if (!flagsReady) {
    return null
  }

  // TODO: CLERK MIGRATION - DEVISE TECH DEBT TO REMOVE
  // The flag read above and this branch go once the flag does.
  if (!clerkEnabled) {
    return <>{children}</>
  }

  return (
    <ClerkProvider publishableKey={process.env.CLERK_PUBLISHABLE_KEY}>
      <ClerkAuthSession>{children}</ClerkAuthSession>
    </ClerkProvider>
  )
}

export default AuthSessionContext
