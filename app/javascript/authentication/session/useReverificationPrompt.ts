import { ReverificationPrompt } from "./reverificationSession"
import { useClerkReverificationPrompt } from "./adapters/clerk/ClerkReverificationProvider"

export type { ReverificationPrompt, ReverificationMethod } from "./reverificationSession"

/**
 * Neutral entry point for reverification. Null until a sensitive action needs it; a page
 * renders the prompt in place of its form while it is set.
 */
export const useReverificationPrompt = (): ReverificationPrompt | null =>
  useClerkReverificationPrompt()
