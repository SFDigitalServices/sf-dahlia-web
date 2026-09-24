import { SignUpSession } from "./signUpSession"
import { useClerkSignUpSession } from "./adapters/clerk/useClerkSignUpSession"

export type { SignUpSession } from "./signUpSession"

/**
 * Neutral entry point for the sign-up flow. Components import this
 */
export const useSignUpSession = (): SignUpSession => useClerkSignUpSession()
