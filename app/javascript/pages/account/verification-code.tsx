/* eslint-disable @typescript-eslint/unbound-method */
import React, { useContext, useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router"
import { useAuth, useSignIn, useSignUp } from "@clerk/clerk-react"
import { ExpandableContent, Form, Order, t } from "@bloom-housing/ui-components"
import { Card, Heading, Link, Button } from "@bloom-housing/ui-seeds"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheck } from "@fortawesome/free-solid-svg-icons"
import { Controller, useForm } from "react-hook-form"
import withAppSetup from "../../layouts/withAppSetup"
import AuthLayout from "../../layouts/AuthLayout"
import UserContext from "../../authentication/context/UserContext"
import { useFeatureFlag } from "../../hooks/useFeatureFlag"
import {
  AppPages,
  getAddPasswordPath,
  getAuthFlowPath,
  getAddProfilePath,
  getMyAccountPath,
  getResetPasswordPath,
  getSignInPath,
} from "../../util/routeUtil"
import styles from "./verification-code.module.scss"
import { AUTH_FLOW, UNLEASH_FLAG } from "../../modules/constants"
import GetHelp from "./components/GetHelp"
import VerificationCodeField from "./components/VerificationCodeField"
import { authorizeHousingCounselor } from "../../api/authApiService"

interface EnterVerificationCodePageProps {
  email: string
  flow: AUTH_FLOW
  redirectUrl?: string
}

// The user can send a new verification code every 30 seconds
const RESEND_CODE_MS = 30000

const remainingResendSeconds = (expiresAt: number) =>
  Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000))

const EnterVerificationCodePage = ({
  email,
  flow,
  housingCounselorToken,
  redirectUrl = getMyAccountPath(),
}: EnterVerificationCodePageProps & { housingCounselorToken?: string | null }) => {
  const navigate = useNavigate()
  const { isLoaded: signUpLoaded, signUp, setActive: setActiveSignUp } = useSignUp()
  const { isLoaded: signInLoaded, signIn, setActive: setActiveSignIn } = useSignIn()
  const isForgotPasswordFlow = flow === AUTH_FLOW.FORGOT_PASSWORD
  const { getToken } = useAuth()
  const isLoaded = flow === AUTH_FLOW.CREATE_ACCOUNT ? signUpLoaded : signInLoaded
  const [resendExpiresAt, setResendExpiresAt] = useState(() => Date.now() + RESEND_CODE_MS)
  const [resendSeconds, setResendSeconds] = useState(RESEND_CODE_MS / 1000)
  const [isResending, setIsResending] = useState(false)
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<{ code: string }>({
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    shouldFocusError: false,
  })

  // Display a live countdown each second (1000 milliseconds) remaining
  useEffect(() => {
    if (remainingResendSeconds(resendExpiresAt) <= 0) return
    let timeoutId: number
    const tick = () => {
      const remaining = remainingResendSeconds(resendExpiresAt)
      setResendSeconds(remaining)
      if (remaining > 0) {
        timeoutId = window.setTimeout(tick, 1000)
      }
    }
    timeoutId = window.setTimeout(tick, 1000)
    return () => window.clearTimeout(timeoutId)
  }, [resendExpiresAt])

  const editEmailHref = getAuthFlowPath(flow)

  const verifySignInCode = async (code: string) => {
    if (!signInLoaded || !signIn) return
    try {
      const completeSignIn = await signIn.attemptFirstFactor({
        strategy: "email_code",
        code,
      })
      if (completeSignIn.status === "complete") {
        if (housingCounselorToken) {
          await setActiveSignIn({ session: completeSignIn.createdSessionId })
          const sessionToken = await getToken()
          if (!sessionToken) {
            setError("code", { message: "invalid" })
            return
          }
          await authorizeHousingCounselor(housingCounselorToken, sessionToken)
          console.log(
            "TODO: Housing counselor successfully authenticated, TBD banner and applicant view"
          )
          void navigate(getMyAccountPath())
          return
        }
        await setActiveSignIn({
          session: completeSignIn.createdSessionId,
          redirectUrl,
        })
      } else {
        console.error("Sign in failed:", completeSignIn)
        setError("code", { message: "invalid" })
      }
    } catch (error) {
      console.error("Code verification error:", error)
      setError("code", { message: "invalid" })
    }
  }

  const verifySignUpCode = async (code: string) => {
    if (!signUpLoaded || !signUp) return
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      })
      if (completeSignUp.status === "complete") {
        await setActiveSignUp({ session: completeSignUp.createdSessionId })
        void navigate(getAddPasswordPath())
      } else {
        console.error("Account creation failed:", completeSignUp)
        setError("code", { message: "invalid" })
      }
    } catch (error) {
      console.error("Code verification error:", error)
      setError("code", { message: "invalid" })
    }
  }

  const verifyForgotPasswordCode = async (code: string) => {
    if (!signInLoaded || !signIn) return
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
      })

      if (result.status === "needs_new_password") {
        void navigate(getResetPasswordPath(), { state: { email, flow, code } })
        return
      }
    } catch (error) {
      console.error("Reset Password code verification error:", error)
      setError("code", { message: "invalid" })
    }
  }

  const verifyAuthCodeByFlow: Record<AUTH_FLOW, (code: string) => Promise<void>> = {
    [AUTH_FLOW.SIGN_IN]: verifySignInCode,
    [AUTH_FLOW.CREATE_ACCOUNT]: verifySignUpCode,
    [AUTH_FLOW.FORGOT_PASSWORD]: verifyForgotPasswordCode,
  }

  const onSubmit = async ({ code }: { code: string }) => verifyAuthCodeByFlow[flow](code)
  const resendSignInCode = async (): Promise<boolean> => {
    if (!signInLoaded || !signIn) return false
    try {
      const emailCodeFactor = signIn.supportedFirstFactors?.find(
        (factor) => factor.strategy === "email_code"
      )
      if (emailCodeFactor?.strategy !== "email_code") {
        console.error("Sign in email code factor missing")
        return false
      }
      await signIn.prepareFirstFactor({
        strategy: "email_code",
        emailAddressId: emailCodeFactor.emailAddressId,
      })
      return true
    } catch (error) {
      console.error("Sign in code resend error", error)
      return false
    }
  }

  const resendSignUpCode = async (): Promise<boolean> => {
    if (!signUpLoaded || !signUp) return false
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" })
      return true
    } catch (error) {
      console.error("Sign up code resend error", error)
      return false
    }
  }

  const resendForgotPasswordCode = async (): Promise<boolean> => {
    if (!signIn) return false
    try {
      const resetCodeFactor = signIn.supportedFirstFactors?.find(
        (factor) => factor.strategy === "reset_password_email_code"
      )
      if (resetCodeFactor?.strategy !== "reset_password_email_code") {
        console.error("Reset password email code factor missing")
        return false
      }
      await signIn.prepareFirstFactor({
        strategy: "reset_password_email_code",
        emailAddressId: resetCodeFactor.emailAddressId,
      })
      return true
    } catch (error) {
      console.error("Reset password code resend error", error)
      return false
    }
  }
  const resendCodeByFlow: Record<AUTH_FLOW, () => Promise<boolean>> = {
    [AUTH_FLOW.SIGN_IN]: resendSignInCode,
    [AUTH_FLOW.CREATE_ACCOUNT]: resendSignUpCode,
    [AUTH_FLOW.FORGOT_PASSWORD]: resendForgotPasswordCode,
  }

  const onResend = async () => {
    if (isResending || resendSeconds > 0) return
    setIsResending(true)
    try {
      const sent = await resendCodeByFlow[flow]()
      if (sent) {
        setResendExpiresAt(Date.now() + RESEND_CODE_MS)
        setResendSeconds(RESEND_CODE_MS / 1000)
      }
    } finally {
      setIsResending(false)
    }
  }

  return (
    <AuthLayout title={t("createAccount.enterCode")}>
      <Card.Section divider="flush">
        <Heading priority={1} size="2xl">
          {t("createAccount.checkEmail")}
        </Heading>
        <p className={styles.sentTo}>
          {t("createAccount.weSentCodeTo")}
          <br />
          <span className={styles.email}>{email}</span>
          <Link className={styles.editEmail} href={editEmailHref}>
            {t("createAccount.editEmail")}
          </Link>
        </p>
        {isForgotPasswordFlow && (
          <p className={styles["forgotPasswordDescription"]}>{t("signIn.forgotPasswordCode")}</p>
        )}
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="code"
            control={control}
            defaultValue=""
            rules={{ validate: (code: string) => /^\d{6}$/.test(code) }}
            render={({ value, onChange }) => (
              <VerificationCodeField value={value} onChange={onChange} error={!!errors.code} />
            )}
          />
          <Button
            className={styles.confirmButton}
            variant="primary"
            size="sm"
            type="submit"
            disabled={!isLoaded}
          >
            {t("createAccount.confirmCode")}
          </Button>
        </Form>
        <div className={styles.resendSection}>
          <p className={styles.resendRow}>
            <span>{t("createAccount.didntGetEmail")}</span>
            <span aria-live="polite">
              {resendSeconds > 0 ? (
                <span className={styles.emailSent}>
                  <FontAwesomeIcon icon={faCheck} />
                  {t("createAccount.emailSent")}
                </span>
              ) : (
                <Button
                  className={styles.sendAgain}
                  variant="text"
                  size="sm"
                  disabled={isResending}
                  onClick={() => {
                    void onResend()
                  }}
                >
                  {t("createAccount.sendAgain")}
                </Button>
              )}
            </span>
          </p>
          {resendSeconds > 0 && (
            <p className={styles.resendNote}>
              {t("createAccount.sendAgainIn", { smart_count: resendSeconds })}
            </p>
          )}
        </div>
        <ExpandableContent
          className={styles.howToUseCode}
          order={Order.below}
          strings={{
            readMore: t("createAccount.howToUseCode"),
            readLess: t("createAccount.howToUseCode"),
          }}
        >
          <span className={styles.howToContent}>
            <ol className={styles.howToList}>
              <li>{t("createAccount.howTo.p1")}</li>
              <li>{t("createAccount.howTo.p2")}</li>
              <li>{t("createAccount.howTo.p3")}</li>
              <li>{t("createAccount.howTo.p4")}</li>
            </ol>
            <p>{t("createAccount.howTo.p5")}</p>
          </span>
        </ExpandableContent>
      </Card.Section>
      <GetHelp flow={flow} />
    </AuthLayout>
  )
}

const EnterVerificationCode = (_props: { assetPaths: unknown }) => {
  const navigate = useNavigate()
  const { state } = useLocation()
  const email = state?.email
  const { isLoaded, isSignedIn } = useAuth()
  const { profile, initialStateLoaded } = useContext(UserContext)
  const { unleashFlag: clerkEnabled, flagsReady } = useFeatureFlag(UNLEASH_FLAG.CLERK_AUTH, false)
  const flow: AUTH_FLOW = state?.flow
  const fallbackPath = flow ? getAuthFlowPath(flow) : getSignInPath()

  /**
   * Verification code page redirects
   * --------------------------------
   * 1. Once the Unleash flags are ready:
   * If Clerk is not enabled, redirect to sign-in.
   * 2. Once Clerk is loaded:
   * If the user is signed out without an email, redirect to sign in.
   * 3. Once the profile has loaded:
   * If the user is signed in with a profile, redirect to my account.
   * If the user is signed in without a profile, redirect to the add profile page.
   */
  useEffect(() => {
    if (!flagsReady) return
    if (!clerkEnabled) {
      void navigate(getSignInPath())
      return
    }
    if (!isLoaded) return
    if (!email || !flow) {
      void navigate(fallbackPath)
    }
    if (!isSignedIn && !email) {
      void navigate(getSignInPath())
      return
    }
    if (!initialStateLoaded) return
    if (isSignedIn && profile) void navigate(getMyAccountPath())
    if (isSignedIn && !profile) void navigate(getAddProfilePath())
  }, [
    flagsReady,
    clerkEnabled,
    isLoaded,
    isSignedIn,
    email,
    initialStateLoaded,
    profile,
    navigate,
    flow,
    fallbackPath,
  ])

  const ready = flagsReady && clerkEnabled && isLoaded && !isSignedIn && !!email

  if (!ready) {
    return null
  }

  return (
    <EnterVerificationCodePage
      email={email}
      flow={flow}
      housingCounselorToken={state?.housingCounselorToken}
      redirectUrl={state?.redirectUrl}
    />
  )
}

export default withAppSetup(EnterVerificationCode, {
  useFormTimeout: true,
  pageName: AppPages.EnterVerificationCode,
})
