/* eslint-disable @typescript-eslint/unbound-method */
import React, { useContext, useEffect, useState, useRef } from "react"
import { useLocation, useNavigate } from "react-router"
import { useAuth, useSignIn, useSignUp } from "@clerk/react"
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
  redirectUrl = getMyAccountPath(), // TODO: simplify and centralize auth redirects
}: EnterVerificationCodePageProps & { housingCounselorToken?: string | null }) => {
  const navigate = useNavigate()
  const { signUp, fetchStatus: signUpFetchStatus } = useSignUp()
  const { signIn, fetchStatus: signInFetchStatus } = useSignIn()
  const isForgotPasswordFlow = flow === AUTH_FLOW.FORGOT_PASSWORD
  const { getToken } = useAuth()
  const isLoaded =
    flow === AUTH_FLOW.CREATE_ACCOUNT
      ? signUpFetchStatus !== "fetching"
      : signInFetchStatus !== "fetching"
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
    if (signInFetchStatus === "fetching" || !signIn) return
    const { error } = await signIn.emailCode.verifyCode({ code })
    if (error) {
      console.error("Code verification error:", error)
      setError("code", { message: "invalid" })
      return
    }

    if (signIn.status !== "complete") {
      console.error("Sign in not complete:", signIn.status)
      setError("code", { message: "invalid" })
      return
    }

    if (housingCounselorToken) {
      const sessionToken = await getToken()
      if (!sessionToken) {
        setError("code", { message: "invalid" })
        return
      }
      await authorizeHousingCounselor(housingCounselorToken, sessionToken)
      console.log(
        "TODO: Housing counselor successfully authenticated, TBD banner and applicant view"
      )
    }

    await signIn.finalize({
      navigate: ({ decorateUrl }: { decorateUrl: (url: string) => string }) => {
        void navigate(decorateUrl(redirectUrl))
      },
    })
  }

  const verifySignUpCode = async (code: string) => {
    if (signUpFetchStatus === "fetching" || !signUp) return

    await signUp.verifications.verifyEmailCode({ code })
    if (signUp.status !== "complete") {
      console.error("Code verification not complete:", signUp.status)
      setError("code", { message: "invalid" })
    }

    await signUp.finalize({
      navigate: ({ decorateUrl }: { decorateUrl: (url: string) => string }) => {
        void navigate(decorateUrl(getAddPasswordPath()), { state: { flow } })
      },
    })
  }

  const verifyForgotPasswordCode = async (code: string) => {
    if (signInFetchStatus === "fetching" || !signIn) return

    const { error } = await signIn.resetPasswordEmailCode.verifyCode({ code })
    if (error) {
      console.error("Code verification error:", error)
      return
    }

    if (signIn.status !== "needs_new_password") {
      console.error("Password reset error:", signIn.status)
      return
    }

    void navigate(getResetPasswordPath(), { state: { email, flow, code } })
  }

  const verifyAuthCodeByFlow: Record<AUTH_FLOW, (code: string) => Promise<void>> = {
    [AUTH_FLOW.SIGN_IN]: verifySignInCode,
    [AUTH_FLOW.CREATE_ACCOUNT]: verifySignUpCode,
    [AUTH_FLOW.FORGOT_PASSWORD]: verifyForgotPasswordCode,
  }

  const onSubmit = async ({ code }: { code: string }) => verifyAuthCodeByFlow[flow](code)

  const resendSignInCode = async (): Promise<boolean> => {
    if (signInFetchStatus === "fetching" || !signIn) return false

    if (!signIn.emailAddress) {
      console.error("Missing email address error:", signIn)
      return false
    }

    const { error } = await signIn.emailCode.sendCode()
    if (error) {
      console.error("Resend sign in code error:", error)
      return false
    }

    if (signIn.status !== "needs_first_factor") {
      console.error("Resend sign in code status error:", signIn.status)
      return false
    }

    return true
  }

  const resendSignUpCode = async (): Promise<boolean> => {
    if (signUpFetchStatus === "fetching" || !signUp) return false

    if (!signUp.emailAddress) {
      console.error("Missing email address error:", signUp)
      return false
    }

    const { error } = await signUp.verifications.sendEmailCode()
    if (error) {
      console.error("Resend sign up code error:", error)
      return false
    }

    if (
      signUp.status === "missing_requirements" &&
      signUp.unverifiedFields.includes("email_address") &&
      signUp.missingFields.length === 0
    ) {
      return true
    } else {
      console.error("Resend sign up code status error:", signUp)
      return false
    }
  }

  const resendForgotPasswordCode = async (): Promise<boolean> => {
    if (signInFetchStatus === "fetching" || !signIn) return false

    if (!signIn.emailAddress) {
      console.error("Missing email address error:", signIn)
      return false
    }

    const { error } = await signIn.resetPasswordEmailCode.sendCode()
    if (error) {
      console.error("Resend forgot password code error:", error)
      return false
    }

    return true
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
  const { state } = useLocation() // TODO: needs a better name
  const email = state?.email
  const { isLoaded, isSignedIn } = useAuth()
  const { profile, initialStateLoaded } = useContext(UserContext)
  const { unleashFlag: clerkEnabled, flagsReady } = useFeatureFlag(UNLEASH_FLAG.CLERK_AUTH, false)
  const flow: AUTH_FLOW = state?.flow
  const fallbackPath = flow ? getAuthFlowPath(flow) : getSignInPath()

  // TODO: simplify and centralize auth redirects
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
  const hasRun = useRef(false) // only redirect when first visiting this page, otherwise it overrides navigate() calls from code submission
  useEffect(() => {
    if (hasRun.current) return

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
    hasRun.current = true
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
