export type AccountOutcome = {
  error?: unknown
  /**
   * The request was never attempted because the provider wasn't ready. Set alongside `error` so
   * callers that only bail on `error` stay correct; check it first to skip user-facing messaging.
   */
  notReady?: true
  /** The user backed out of confirming their identity. Set alongside `error`; not a failure to report. */
  cancelled?: true
  /** Another account already uses the email. */
  emailTaken?: true
  /** The email is already the account's sign-in email, so there is nothing to change. */
  unchanged?: true
}

/**
 * Changes to a signed-in account. Each call may pause for reverification, which a page renders
 * with `useReverificationPrompt`.
 */
export type AccountSession = {
  /** Adds the new email and sends it a verification code. */
  startEmailChange: (email: string) => Promise<AccountOutcome>
  resendEmailChangeCode: () => Promise<AccountOutcome>
  /** Verifies the new email, makes it the sign-in email, and removes the old one. */
  verifyEmailChange: (verificationCode: string) => Promise<AccountOutcome>
  /** The email waiting on its code, if a change is in progress. */
  pendingEmail?: string
}
