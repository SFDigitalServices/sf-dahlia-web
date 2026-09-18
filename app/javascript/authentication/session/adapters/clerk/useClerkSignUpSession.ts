import { useCallback, useMemo } from "react"
import { useSession, useSignUp, useUser } from "@clerk/react"
import { useNavigate } from "react-router"

import { getCurrentLanguage } from "../../../../util/languageUtil"
import { SignUpOutcome, SignUpSession } from "../../signUpSession"

const SUCCESS: SignUpOutcome = {}
const NOT_READY: SignUpOutcome = {
  notReady: true,
  error: new Error("Sign up session is not ready"),
}

export const useClerkSignUpSession = (): SignUpSession => {
  const { signUp, fetchStatus } = useSignUp()
  const { isLoaded: isAccountInitialized, user } = useUser()
  const { session } = useSession()
  const navigate = useNavigate()

  const isBusy = fetchStatus === "fetching"

  // Clerk types signUp as always present, but the calls below dereference it.
  const canStartRequest = !isBusy && !!signUp

  const createAccount = useCallback(
    async (email: string): Promise<SignUpOutcome> => {
      if (!canStartRequest) return NOT_READY

      const locale = getCurrentLanguage()
      const { error } = await signUp.create({
        emailAddress: email,
        locale,
        unsafeMetadata: { locale }, // Account creation can only update public metadata
      })
      if (error) {
        console.error("Account creation error", error)
        return { error }
      }

      await signUp.verifications.sendEmailCode()
      if (
        signUp.status !== "missing_requirements" ||
        !signUp.unverifiedFields.includes("email_address") ||
        signUp.missingFields.length > 0
      ) {
        console.error("Account creation error:", signUp)
        return { error: new Error(`Account creation error: ${signUp.status}`) }
      }

      return SUCCESS
    },
    [canStartRequest, signUp]
  )

  const resendEmailCode = useCallback(async (): Promise<SignUpOutcome> => {
    if (!canStartRequest) return NOT_READY

    const { error } = await signUp.verifications.sendEmailCode()
    if (error) {
      console.error("Resend sign up code error:", error)
      return { error }
    }

    if (
      signUp.status !== "missing_requirements" ||
      !signUp.unverifiedFields.includes("email_address") ||
      signUp.missingFields.length > 0
    ) {
      console.error("Resend sign up code status error:", signUp)
      return { error: new Error(`Resend sign up code status error: ${signUp.status}`) }
    }

    return SUCCESS
  }, [canStartRequest, signUp])

  const verifyEmailCode = useCallback(
    async (code: string): Promise<SignUpOutcome> => {
      if (!canStartRequest) return NOT_READY

      const { error } = await signUp.verifications.verifyEmailCode({ code })
      if (error) {
        console.error("Code verification error:", error)
        return { error }
      }

      if (signUp.status !== "complete") {
        console.error("Code verification not complete:", signUp.status)
        return { error: new Error(`Code verification not complete: ${signUp.status}`) }
      }

      return SUCCESS
    },
    [canStartRequest, signUp]
  )

  const activateSession = useCallback(
    async (redirectTo: string, navigateState?: unknown): Promise<SignUpOutcome> => {
      if (!signUp) return NOT_READY

      const { error } = await signUp.finalize({
        // https://clerk.com/docs/react/reference/objects/clerk#using-the-navigate-parameter
        navigate: ({ decorateUrl }: { decorateUrl: (url: string) => string }) => {
          void navigate(decorateUrl(redirectTo), { state: navigateState })
        },
      })
      return error ? { error } : SUCCESS
    },
    [signUp, navigate]
  )

  const setPassword = useCallback(
    async (password: string): Promise<SignUpOutcome> => {
      if (!isAccountInitialized || !user) return NOT_READY

      try {
        await user.updatePassword({ newPassword: password })
        return SUCCESS
      } catch (error) {
        console.error("Add password error:", error)
        return { error }
      }
    },
    [isAccountInitialized, user]
  )

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string): Promise<SignUpOutcome> => {
      if (!user || !session) return NOT_READY

      try {
        await session.startVerification({ level: "first_factor" })
        await session.attemptFirstFactorVerification({
          strategy: "password",
          password: currentPassword,
        })

        await user.updatePassword({
          currentPassword,
          newPassword,
          signOutOfOtherSessions: true,
        })
        return SUCCESS
      } catch (error) {
        return { error }
      }
    },
    [user, session]
  )

  return useMemo(
    (): SignUpSession => ({
      isBusy,
      isAccountInitialized,
      hasPassword: Boolean(user?.passwordEnabled),
      createAccount,
      resendEmailCode,
      verifyEmailCode,
      activateSession,
      setPassword,
      changePassword,
    }),
    [
      isBusy,
      isAccountInitialized,
      user?.passwordEnabled,
      createAccount,
      resendEmailCode,
      verifyEmailCode,
      activateSession,
      setPassword,
      changePassword,
    ]
  )
}
