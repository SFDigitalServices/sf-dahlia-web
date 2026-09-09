import { useCallback, useMemo } from "react"
import { useAuth } from "@clerk/react"

import {
  AuthCredentials,
  AuthSession,
  deriveClerkStatus,
  NO_CREDENTIALS,
} from "../../authStatus"

/** Clerk's session, behind the neutral interface. No effects, no state. */
export const useClerkAuthSession = (): AuthSession => {
  const { isLoaded, isSignedIn, getToken } = useAuth()

  const getCredentials = useCallback(async (): Promise<AuthCredentials> => {
    // Annotated because @clerk/react v6's types don't resolve under
    // moduleResolution:"node". Goes away with "bundler".
    const token: string | null = await getToken()
    return token ? { kind: "bearerToken", token } : NO_CREDENTIALS
  }, [getToken])

  return useMemo(
    (): AuthSession => ({
      status: deriveClerkStatus({ isLoaded, isSignedIn: Boolean(isSignedIn) }),
      getCredentials,
    }),
    [isLoaded, isSignedIn, getCredentials]
  )
}
