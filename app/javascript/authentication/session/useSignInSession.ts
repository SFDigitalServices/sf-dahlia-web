import { SignInSession } from "./signInSession"
import { useClerkSignInSession } from "./adapters/clerk/useClerkSignInSession"

export type { SignInSession, SignInMethod } from "./signInSession"

/**
 * Neutral entry point for the sign-in flow. Components import this
 */
export const useSignInSession = (): SignInSession => useClerkSignInSession()
