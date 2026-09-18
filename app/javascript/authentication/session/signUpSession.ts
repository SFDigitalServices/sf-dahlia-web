export type SignUpOutcome = {
  error?: unknown
  /**
   * The request was never attempted because the provider wasn't ready. Set alongside `error` so
   * callers that only bail on `error` stay correct; check it first to skip user-facing messaging.
   */
  notReady?: true
}

export type SignUpSession = {
  /** A sign-up request is in flight. Not a readiness signal: the provider may still be loading. */
  isBusy: boolean

  createAccount: (email: string) => Promise<SignUpOutcome>
  resendEmailCode: () => Promise<SignUpOutcome>
  verifyEmailCode: (code: string) => Promise<SignUpOutcome>
  activateSession: (redirectTo: string, navigateState?: unknown) => Promise<SignUpOutcome>

  setPassword: (password: string) => Promise<SignUpOutcome>
  changePassword: (currentPassword: string, newPassword: string) => Promise<SignUpOutcome>
  hasPassword: boolean
  isAccountInitialized: boolean
}
