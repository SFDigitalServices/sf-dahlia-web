import { useCallback, useMemo } from "react"
import { useClerk, useSignIn } from "@clerk/react"
import { useNavigate } from "react-router"

import { SignInOutcome, SignInSession } from "../../signInSession"

const SUCCESS: SignInOutcome = {}
const NOT_READY: SignInOutcome = {
  notReady: true,
  error: new Error("Sign in session is not ready"),
}

export const useClerkSignInSession = (): SignInSession => {
  const { signIn, fetchStatus } = useSignIn()
  const { client } = useClerk()
  const navigate = useNavigate()

  const isBusy = fetchStatus === "fetching"

  // Clerk types signIn as always present, but the calls below dereference it.
  const canStartRequest = !isBusy && !!signIn

  const isResetAttemptStale = !isBusy && !signIn?.status

  const signInWithPassword = useCallback(
    async (email: string, password: string): Promise<SignInOutcome> => {
      if (!canStartRequest) return NOT_READY

      const { error } = await signIn.create({ identifier: email, password })
      if (error) {
        console.error("Sign in error:", error)
        return { error }
      }

      // https://clerk.com/docs/react/reference/objects/sign-in-future
      // status may not be "complete" if we change auth strategies in our Clerk dashboard, e.g. "needs_second_factor"
      if (signIn.status !== "complete") {
        console.error("Sign in not complete:", signIn.status)
        return { error: new Error(`Sign in not complete: ${signIn.status}`) }
      }

      return SUCCESS
    },
    [canStartRequest, signIn]
  )

  const sendEmailCode = useCallback(
    async (email: string): Promise<SignInOutcome> => {
      if (!canStartRequest) return NOT_READY

      const { error } = await signIn.create({ identifier: email, signUpIfMissing: true })
      if (error) {
        console.error("Sign in get code error:", error)
        return { error }
      }

      const { error: sendCodeError } = await signIn.emailCode.sendCode()
      if (sendCodeError) {
        console.error("Sign in send code error:", sendCodeError)
        return { error: sendCodeError }
      }

      if (signIn.status !== "needs_first_factor") {
        console.error("Sign in code error:", signIn.status)
        return { error: new Error(`Sign in code error: ${signIn.status}`) }
      }

      return SUCCESS
    },
    [canStartRequest, signIn]
  )

  const resendEmailCode = useCallback(async (): Promise<SignInOutcome> => {
    if (!canStartRequest) return NOT_READY

    const { error } = await signIn.emailCode.sendCode()
    if (error) {
      console.error("Resend sign in code error:", error)
      return { error }
    }

    if (signIn.status !== "needs_first_factor") {
      console.error("Resend sign in code status error:", signIn.status)
      return { error: new Error(`Resend sign in code status error: ${signIn.status}`) }
    }

    return SUCCESS
  }, [canStartRequest, signIn])

  const verifyEmailCode = useCallback(
    async (code: string): Promise<SignInOutcome> => {
      if (!canStartRequest) return NOT_READY

      const { error } = await signIn.emailCode.verifyCode({ code })
      // user attempted to sign in with an email not linked to an account
      if (error?.errors?.[0]?.code === "sign_up_if_missing_transfer") {
        return { error, needsSignUp: true }
      }
      if (error) {
        console.error("Code verification error:", error)
        return { error }
      }

      if (signIn.status !== "complete") {
        console.error("Sign in not complete:", signIn.status)
        return { error: new Error(`Sign in not complete: ${signIn.status}`) }
      }

      return SUCCESS
    },
    [canStartRequest, signIn]
  )

  const sendPasswordResetCode = useCallback(
    async (email: string): Promise<SignInOutcome> => {
      if (!canStartRequest) return NOT_READY

      const { error: createError } = await signIn.create({ identifier: email })
      if (createError) {
        console.error("Forgot password error:", createError)
        return { error: createError }
      }

      const { error: sendCodeError } = await signIn.resetPasswordEmailCode.sendCode()
      if (sendCodeError) {
        console.error("Forgot password send code error:", sendCodeError)
        return { error: sendCodeError }
      }

      return SUCCESS
    },
    [canStartRequest, signIn]
  )

  const resendPasswordResetCode = useCallback(async (): Promise<SignInOutcome> => {
    if (!canStartRequest) return NOT_READY

    const { error } = await signIn.resetPasswordEmailCode.sendCode()
    if (error) {
      console.error("Resend forgot password code error:", error)
      return { error }
    }

    // No status check, matching the resend this replaces.
    return SUCCESS
  }, [canStartRequest, signIn])

  const verifyPasswordResetCode = useCallback(
    async (code: string): Promise<SignInOutcome> => {
      if (!canStartRequest) return NOT_READY

      const { error } = await signIn.resetPasswordEmailCode.verifyCode({ code })
      if (error) {
        console.error("Code verification error:", error)
        return { error }
      }

      if (signIn.status !== "needs_new_password") {
        console.error("Password reset error:", signIn.status)
        return { error: new Error(`Password reset error: ${signIn.status}`) }
      }

      return SUCCESS
    },
    [canStartRequest, signIn]
  )

  const submitNewPassword = useCallback(
    async (password: string): Promise<SignInOutcome> => {
      if (!canStartRequest) return NOT_READY

      const { error } = await signIn.resetPasswordEmailCode.submitPassword({
        password,
        signOutOfOtherSessions: true,
      })
      if (error) {
        console.error("Reset password error:", error)
        return { error }
      }

      if (signIn.status !== "complete") {
        console.error("Reset password status error:", signIn.status)
        return { error: new Error(`Reset password status error: ${signIn.status}`) }
      }

      return SUCCESS
    },
    [canStartRequest, signIn]
  )

  const activateSession = useCallback(
    async (redirectTo?: string): Promise<SignInOutcome> => {
      if (!signIn) return NOT_READY

      if (!redirectTo) {
        const { error } = await signIn.finalize()
        return error ? { error } : SUCCESS
      }

      const { error } = await signIn.finalize({
        // https://clerk.com/docs/react/reference/objects/clerk#using-the-navigate-parameter
        navigate: ({ decorateUrl }: { decorateUrl: (url: string) => string }) => {
          void navigate(decorateUrl(redirectTo))
        },
      })
      return error ? { error } : SUCCESS
    },
    [signIn, navigate]
  )

  return useMemo(
    (): SignInSession => ({
      isBusy,
      isResetAttemptStale,
      // Anything but an email code defaults to the password form.
      preferredMethod:
        client?.lastAuthenticationStrategy === "email_code" ? "emailCode" : "password",
      signInWithPassword,
      sendEmailCode,
      resendEmailCode,
      verifyEmailCode,
      sendPasswordResetCode,
      resendPasswordResetCode,
      verifyPasswordResetCode,
      submitNewPassword,
      activateSession,
    }),
    [
      isBusy,
      isResetAttemptStale,
      client?.lastAuthenticationStrategy,
      signInWithPassword,
      sendEmailCode,
      resendEmailCode,
      verifyEmailCode,
      sendPasswordResetCode,
      resendPasswordResetCode,
      verifyPasswordResetCode,
      submitNewPassword,
      activateSession,
    ]
  )
}
