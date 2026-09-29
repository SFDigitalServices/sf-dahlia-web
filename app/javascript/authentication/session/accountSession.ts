export type AccountOutcome = {
  error?: unknown
  /**
   * The request was never attempted because the provider wasn't ready. Set alongside `error` so
   * callers that only bail on `error` stay correct; check it first to skip user-facing messaging.
   */
  notReady?: true
  /** The user backed out of confirming their identity. Set alongside `error`; not a failure to report. */
  cancelled?: true
  /** The code for the new email was wrong or expired. Set alongside `error`. */
  codeRejected?: true
}

/**
 * Changes to a signed-in account. Calls that Clerk treats as sensitive may pause for
 * reverification, which the page renders with `useReverificationPrompt`.
 *
 * The email change spans two pages, so each call takes the new email rather than holding the
 * change in memory.
 */
export type AccountSession = {
  isAccountInitialized: boolean
  /** The email the user signs in with. */
  loginEmail?: string

  /** Adds the new email to the account and sends it a verification code. */
  startEmailChange: (email: string) => Promise<AccountOutcome>
  resendEmailChangeCode: (email: string) => Promise<AccountOutcome>
  /**
   * Verifies the new email with its code, then makes it the login email and removes the old one.
   * Resubmitting after a cancelled reverification skips the code, which is already verified.
   */
  verifyEmailChange: (email: string, verificationCode: string) => Promise<AccountOutcome>
}
