export type SignInMethod = "password" | "emailCode"

export type SignInOutcome = {
  error?: unknown
  /**
   * The request was never attempted because the provider wasn't ready. Set alongside `error` so
   * callers that only bail on `error` stay correct; check it first to skip user-facing messaging.
   */
  notReady?: true
}

export type SignInSession = {
  /** A sign-in request is in flight. Not a readiness signal: the provider may still be loading. */
  isBusy: boolean
  preferredMethod?: SignInMethod

  signInWithPassword: (email: string, password: string) => Promise<SignInOutcome>
  sendEmailCode: (email: string) => Promise<SignInOutcome>
  resendEmailCode: () => Promise<SignInOutcome>
  verifyEmailCode: (code: string) => Promise<SignInOutcome>

  sendPasswordResetCode: (email: string) => Promise<SignInOutcome>
  resendPasswordResetCode: () => Promise<SignInOutcome>
  verifyPasswordResetCode: (code: string) => Promise<SignInOutcome>
  submitNewPassword: (password: string) => Promise<SignInOutcome>
  isResetAttemptStale: boolean

  activateSession: (redirectTo?: string) => Promise<SignInOutcome>
}
