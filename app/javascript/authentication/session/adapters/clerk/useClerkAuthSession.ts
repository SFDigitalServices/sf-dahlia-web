import { useCallback, useMemo } from "react"
import { useAuth } from "@clerk/react"

import { AuthCredentials, AuthSession, deriveClerkStatus, NO_CREDENTIALS } from "../../authStatus"

/** Clerk's session, behind the neutral interface. No effects, no state. */
export const useClerkAuthSession = (): AuthSession => {
  const { isLoaded, isSignedIn, getToken } = useAuth()

  const getCredentials = useCallback(async (): Promise<AuthCredentials> => {
    try {
      // Annotated because @clerk/react v6's types don't resolve under
      // moduleResolution:"node". Goes away with "bundler".
      const token: string | null = await getToken()
      return token ? { kind: "bearerToken", token } : NO_CREDENTIALS
    } catch {
      // getToken() returns null when there is no session, but rejects when a
      // refresh fails. Both mean the same thing to a caller, and the signature
      // promises a credential rather than a throw.
      return NO_CREDENTIALS
    }
  }, [getToken])

  return useMemo(
    (): AuthSession => ({
      status: deriveClerkStatus({ isLoaded, isSignedIn: Boolean(isSignedIn) }),
      getCredentials,
    }),
    [isLoaded, isSignedIn, getCredentials]
  )
}
