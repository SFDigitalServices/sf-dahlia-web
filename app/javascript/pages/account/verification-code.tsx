/* eslint-disable @typescript-eslint/unbound-method */
import React, { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router"
import { useSignIn, useSignUp, useAuth } from "@clerk/react"
import { ExpandableContent, Form, Order, t } from "@bloom-housing/ui-components"
import { Card, Heading, Link, Button } from "@bloom-housing/ui-seeds"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheck } from "@fortawesome/free-solid-svg-icons"
import { Controller, useForm } from "react-hook-form"
import withAppSetup from "../../layouts/withAppSetup"
import AuthLayout from "../../layouts/AuthLayout"
import {
  AppPages,
  getAddPasswordPath,
  getCreateAccountPath,
  getMyAccountPath,
  getSignInPath,
} from "../../util/routeUtil"
import styles from "./verification-code.module.scss"
import { useFeatureFlag } from "../../hooks/useFeatureFlag"
import { AUTH_FLOW, UNLEASH_FLAG } from "../../modules/constants"
import GetHelp from "./components/GetHelp"
import VerificationCodeField from "./components/VerificationCodeField"
import { authorizeHousingCounselor } from "../../api/authApiService"

interface EnterVerificationCodePageProps {
  email: string
  flow: AUTH_FLOW
}

// The user can send a new verification code every 30 seconds
const RESEND_CODE_MS = 30000

const remainingResendSeconds = (expiresAt: number) =>
  Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000))

const EnterVerificationCodePage = ({
  email,
  flow,
  housingCounselorToken,
}: EnterVerificationCodePageProps & { housingCounselorToken?: string | null }) => {
  const navigate = useNavigate()
  const { signUp, fetchStatus: signUpStatus } = useSignUp()
  const { signIn, fetchStatus: signInStatus } = useSignIn()
  const { getToken } = useAuth()
  const isSignInFlow = flow === AUTH_FLOW.SIGN_IN
  const isLoaded = isSignInFlow ? signInStatus !== "fetching" : signUpStatus !== "fetching"
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

  const editEmailHref = isSignInFlow ? getSignInPath() : getCreateAccountPath()

  const transferToSignUp = async () => {
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
<<<<<<< HEAD
    await signIn.emailCode.verifyCode({ code })
    if (signIn.status === "complete") {
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
=======
    const { error } = await signIn.emailCode.verifyCode({ code })
    // user attempted to sign in with an email not linked to an account
    if (error?.errors[0]?.code === "sign_up_if_missing_transfer") {
      void transferToSignUp()
    } else if (error) {
      console.error("Code verification error:", signIn)
      setError("code", { message: "invalid" })
    } else if (signIn.status === "complete") {
>>>>>>> 58505285d (feat: sign up if sign in account is missing)
      await signIn.finalize({
        navigate: ({ decorateUrl }: { decorateUrl: (url: string) => string }) => {
          void navigate(decorateUrl(getMyAccountPath()))
        },
      })
    } else {
      // Check why the sign-in is not complete
      console.error("Sign in error:", signIn)
      setError("code", { message: "invalid" })
    }
  }

  const verifySignUpCode = async (code: string) => {
    if (signUpStatus === "fetching" || !signUp) return
    await signUp.emailCode.verifyCode({ code })
    if (signUp.status === "complete") {
      await signUp.finalize({
        navigate: ({ decorateUrl }: { decorateUrl: (url: string) => string }) => {
          void navigate(decorateUrl(getAddPasswordPath()))
        },
      })
    } else {
      // Check why the sign-up is not complete
      console.error("Code verification error:", signUp)
      setError("code", { message: "invalid" })
    }
  }

  const onSubmit = async ({ code }: { code: string }) =>
    isSignInFlow ? verifySignInCode(code) : verifySignUpCode(code)

  const resendSignInCode = async () => {
    if (signInStatus === "fetching" || !signIn) return false
    await signIn.emailCode.sendCode()
    if (signIn.status === "needs_first_factor") {
      return true
    } else {
      console.error("Sign in code error", signIn)
      return false
    }
  }

  const resendSignUpCode = async () => {
    if (signUpStatus === "fetching" || !signUp) return false
    await signUp.verifications.sendEmailCode()
    if (
      signUp.status === 'missing_requirements' &&
      signUp.unverifiedFields.includes('email_address') &&
      signUp.missingFields.length === 0
    ) {
      return true
    } else {
      console.error("Sign up code error", signUp)
      return false
    }
  }

  const onResend = async () => {
    if (isResending || resendSeconds > 0) return
    setIsResending(true)
    try {
      const sent = await (isSignInFlow ? resendSignInCode() : resendSignUpCode())
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
            <span className={styles.didntGetEmail}>{t("createAccount.didntGetEmail")}</span>
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
                  size="md"
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
            <p className="field-note">
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
          <div className="field-note">
            <ol className={styles.howToList}>
              <li>{t("createAccount.howTo.p1")}</li>
              <li>{t("createAccount.howTo.p2")}</li>
              <li>{t("createAccount.howTo.p3")}</li>
              <li>{t("createAccount.howTo.p4")}</li>
            </ol>
            <p>{t("createAccount.howTo.p5")}</p>
          </div>
        </ExpandableContent>
      </Card.Section>
      <GetHelp flow={flow} />
    </AuthLayout>
  )
}

const EnterVerificationCode = (_props: { assetPaths: unknown }) => {
  const navigate = useNavigate()
  const { pathname, state } = useLocation()
  const email = state?.email
  const flow: AUTH_FLOW = pathname.includes("/sign-in/code")
    ? AUTH_FLOW.SIGN_IN
    : AUTH_FLOW.CREATE_ACCOUNT
  const fallbackPath = flow === AUTH_FLOW.SIGN_IN ? getSignInPath() : getCreateAccountPath()
  const { unleashFlag: clerkEnabled } = useFeatureFlag(UNLEASH_FLAG.CLERK_AUTH, false)
  useEffect(() => {
    if (!email || !clerkEnabled) {
      void navigate(fallbackPath)
    }
  }, [email, clerkEnabled, fallbackPath, navigate])

  if (!email || !clerkEnabled) {
    return null
  }

  return (
    <EnterVerificationCodePage
      email={email}
      flow={flow}
      housingCounselorToken={state?.housingCounselorToken}
    />
  )
}

export default withAppSetup(EnterVerificationCode, {
  useFormTimeout: true,
  pageName: AppPages.EnterVerificationCode,
})
