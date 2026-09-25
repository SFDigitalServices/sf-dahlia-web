import { AccountSession } from "./accountSession"
import { useClerkAccountSession } from "./adapters/clerk/useClerkAccountSession"

export type { AccountSession, AccountOutcome } from "./accountSession"

/**
 * Neutral entry point for changes to a signed-in account. Components import this
 */
export const useAccountSession = (): AccountSession => useClerkAccountSession()
