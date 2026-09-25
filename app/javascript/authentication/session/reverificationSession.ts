export type ReverificationMethod = "emailCode" | "password"

export type ReverificationOutcome = {
  error?: unknown
  /** The request was never attempted because the provider wasn't ready. */
  notReady?: true
}

/**
 * A sensitive action is paused until the user confirms their identity. The page that started
 * the action renders this in place of its form; completing it retries the action, cancelling
 * it rejects the action with an outcome carrying `cancelled`.
 */
export type ReverificationPrompt = {
  /** Ordered by preference, so the first entry is the one to offer first. */
  methods: ReverificationMethod[]
  /** Masked by the provider, e.g. "j***@example.com". */
  emailAddress?: string
  isBusy: boolean

  sendEmailCode: () => Promise<ReverificationOutcome>
  verifyEmailCode: (verificationCode: string) => Promise<ReverificationOutcome>
  verifyPassword: (password: string) => Promise<ReverificationOutcome>
  cancel: () => void
}
