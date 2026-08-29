/* eslint-disable @typescript-eslint/unbound-method */
import React, { useContext, useEffect, useState } from "react"
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
import { getClerkErrorCode } from "../../authentication/clerkErrors"
import { useFeatureFlag } from "../../hooks/useFeatureFlag"
import {
  AppPages,
  getAddPasswordPath,
  getAddProfilePath,
  getAuthFlowPath,
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
  const { signUp, fetchStatus: signUpStatus } = useSignUp()
  const { signIn, fetchStatus: signInStatus } = useSignIn()
  const isForgotPasswordFlow = flow === AUTH_FLOW.FORGOT_PASSWORD
  const { getToken } = useAuth()
  const isLoaded =
    flow === AUTH_FLOW.CREATE_ACCOUNT ? signUpStatus !== "fetching" : signInStatus !== "fetching"
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

  // Reached when signIn.create({ signUpIfMissing: true }) matched no account:
  // Clerk verified the code against a pending sign-up, so complete it as one.
  const transferToSignUp = async () => {
    if (signUpStatus === "fetching" || !signUp) {
      console.error("Sign up not ready")
      setError("code", { message: "invalid" })
      return
    }
    const { error } = await signUp.create({ transfer: true })
    if (error) {
      console.error("Account creation error", error)
      setError("code", { message: "invalid" })
      return
    }
    if (signUp.status === "complete") {
      await signUp.finalize({
        navigate: ({ decorateUrl }: { decorateUrl: (url: string) => string }) => {
          void navigate(decorateUrl(getAddPasswordPath()))
        },
      })
    } else {
      console.error("Account creation error:", signUp)
      setError("code", { message: "invalid" })
    }
  }

  const verifySignInCode = async (code: string) => {
    if (signInStatus === "fetching" || !signIn) return
    const { error } = await signIn.emailCode.verifyCode({ code })
    if (getClerkErrorCode(error) === "sign_up_if_missing_transfer") {
      await transferToSignUp()
      return
    }
    if (error) {
      console.error("Code verification error:", error)
      setError("code", { message: "invalid" })
      return
    }
    if (signIn.status === "complete") {
      if (housingCounselorToken) {
        // v6 equivalent of v5's setActive({ session }): activate the session
        // without navigating so the getToken() call below resolves.
        await signIn.finalize()
        const sessionToken: string | null = await getToken()
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
      await signIn.finalize({
        navigate: ({ decorateUrl }: { decorateUrl: (url: string) => string }) => {
          void navigate(decorateUrl(redirectUrl))
        },
      })
    } else {
      console.error("Sign in failed:", signIn)
      setError("code", { message: "invalid" })
    }
  }

  const verifySignUpCode = async (code: string) => {
    if (signUpStatus === "fetching" || !signUp) return
    const { error } = await signUp.verifications.verifyEmailCode({ code })
    if (error) {
      console.error("Code verification error:", error)
      setError("code", { message: "invalid" })
      return
    }
    if (signUp.status === "complete") {
      await signUp.finalize({
        navigate: ({ decorateUrl }: { decorateUrl: (url: string) => string }) => {
          void navigate(decorateUrl(getAddPasswordPath()))
        },
      })
    } else {
      console.error("Account creation failed:", signUp)
      setError("code", { message: "invalid" })
    }
  }

  const verifyForgotPasswordCode = async (code: string) => {
    if (signInStatus === "fetching" || !signIn) return
    const { error } = await signIn.resetPasswordEmailCode.verifyCode({ code })
    if (error) {
      console.error("Reset Password code verification error:", error)
      setError("code", { message: "invalid" })
      return
    }
    if (signIn.status === "needs_new_password") {
      void navigate(getResetPasswordPath(), { state: { email, flow, code } })
    } else {
      console.error("Reset Password code verification error:", signIn)
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
    if (signInStatus === "fetching" || !signIn) return false
    const { error } = await signIn.emailCode.sendCode()
    if (error) {
      console.error("Sign in code resend error", error)
      return false
    }
    if (signIn.status === "needs_first_factor") {
      return true
    }
    console.error("Sign in code resend error", signIn)
    return false
  }

  const resendSignUpCode = async (): Promise<boolean> => {
    if (signUpStatus === "fetching" || !signUp) return false
    const { error } = await signUp.verifications.sendEmailCode()
    if (error) {
      console.error("Sign up code resend error", error)
      return false
    }
    if (
      signUp.status === "missing_requirements" &&
      signUp.unverifiedFields.includes("email_address") &&
      signUp.missingFields.length === 0
    ) {
      return true
    }
    console.error("Sign up code resend error", signUp)
    return false
  }

  const resendForgotPasswordCode = async (): Promise<boolean> => {
    if (signInStatus === "fetching" || !signIn) return false
    const { error } = await signIn.resetPasswordEmailCode.sendCode()
    if (error) {
      console.error("Reset password code resend error", error)
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
  const { state } = useLocation()
  const email = state?.email
  const { isLoaded, isSignedIn } = useAuth()
  const { profile, initialStateLoaded } = useContext(UserContext)
  const { unleashFlag: clerkEnabled, flagsReady } = useFeatureFlag(UNLEASH_FLAG.CLERK_AUTH, false)
  // The flow now comes from navigation state rather than the path, because the
  // forgot-password flow shares this page and cannot be told apart by pathname.
  const flow: AUTH_FLOW = state?.flow
  const fallbackPath = flow ? getAuthFlowPath(flow) : getSignInPath()
  /**
   * Verification code page redirects
   * --------------------------------
   * 1. Once the Unleash flags are ready:
   * If Clerk is not enabled, redirect to the flow's start page.
   * 2. Once Clerk is loaded:
   * If the user is signed out without an email, or arrived without a flow,
   * redirect to the flow's start page.
   * 3. Once the profile has loaded:
   * If the user is signed in with a profile, redirect to my account.
   * If the user is signed in without a profile, redirect to the add profile page.
   */
  useEffect(() => {
    if (!flagsReady) return
    if (!clerkEnabled) {
      void navigate(fallbackPath)
      return
    }
    if (!isLoaded) return
    if ((!isSignedIn && !email) || !flow) {
      void navigate(fallbackPath)
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
    flow,
    fallbackPath,
    initialStateLoaded,
    profile,
    navigate,
  ])

  const ready = flagsReady && clerkEnabled && isLoaded && !isSignedIn && !!email && !!flow

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
