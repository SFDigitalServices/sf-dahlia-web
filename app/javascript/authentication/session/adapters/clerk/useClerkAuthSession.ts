import { useCallback, useMemo, useRef } from "react"
import { useAuth } from "@clerk/react"

import { clearHeaders } from "../../../token"
import { clearHousingCounselorSession } from "../../../../api/authApiService"
import { AuthCredentials, AuthSession, deriveClerkStatus, NO_CREDENTIALS } from "../../authStatus"

/** Clerk's session, behind the neutral interface. No effects, no state. */
export const useClerkAuthSession = (): AuthSession => {
  const { isLoaded, isSignedIn, getToken, signOut: clerkSignOut } = useAuth()

  const getCredentials = useCallback(async (): Promise<AuthCredentials> => {
    try {
      const token = await getToken()
      return token ? { kind: "bearerToken", token } : NO_CREDENTIALS
    } catch {
      // getToken() returns null when there is no session, but rejects when a
      // refresh fails. Both mean the same thing to a caller, and the signature
      // promises a credential rather than a throw.
      return NO_CREDENTIALS
    }
  }, [getToken])

  // A ref, not state: it must read true synchronously once Clerk publishes the
  // signed-out status mid-signOut, before any re-render could carry state.
  // TODO: never reset, so after a sign-out and re-sign-in in the same tab,
  // withAuthentication skips its redirect when that later session ends. Reset it
  // once Clerk reports signedIn again.
  const signingOutRef = useRef(false)
  const isSigningOut = useCallback(() => signingOutRef.current, [])

  const signOut = useCallback(async (): Promise<void> => {
    signingOutRef.current = true
    // TODO(DAH-4366): CLERK MIGRATION - DEVISE TECH DEBT TO REMOVE
    // apiService attaches stored Devise headers to every request, so a user who
    // last signed in with Devise would keep sending them.
    clearHeaders()
    // A delegated hc_session should never outlive the sign-out that ends it.
    await clearHousingCounselorSession()
    // Without a callback Clerk does a full page load to its afterSignOutUrl ("/"),
    // overriding the caller's own redirect to sign-in.
    await clerkSignOut(() => undefined)
  }, [clerkSignOut])

  return useMemo(
    (): AuthSession => ({
      status: deriveClerkStatus({ isLoaded, isSignedIn: Boolean(isSignedIn) }),
      getCredentials,
      signOut,
      isSigningOut,
    }),
    [isLoaded, isSignedIn, getCredentials, signOut, isSigningOut]
  )
}
