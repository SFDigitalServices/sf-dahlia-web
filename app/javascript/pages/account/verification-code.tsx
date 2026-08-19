/* eslint-disable @typescript-eslint/unbound-method */
import React, { useContext, useEffect } from "react"
import { useLocation, useNavigate } from "react-router"
import { useAuth, useSignIn, useSignUp } from "@clerk/clerk-react"
import { ExpandableContent, Form, Order, t } from "@bloom-housing/ui-components"
import { Card, Heading, Link, Button } from "@bloom-housing/ui-seeds"
import { Controller, useForm } from "react-hook-form"
import withAppSetup from "../../layouts/withAppSetup"
import AuthLayout from "../../layouts/AuthLayout"
import UserContext from "../../authentication/context/UserContext"
import { useFeatureFlag } from "../../hooks/useFeatureFlag"
import {
  AppPages,
  getAddPasswordPath,
  getAddProfilePath,
  getCreateAccountPath,
  getMyAccountPath,
  getSignInPath,
} from "../../util/routeUtil"
import styles from "./verification-code.module.scss"
import { AUTH_FLOW, UNLEASH_FLAG } from "../../modules/constants"
import GetHelp from "./components/GetHelp"
import VerificationCodeField from "./components/VerificationCodeField"

interface EnterVerificationCodePageProps {
  email: string
  flow: AUTH_FLOW
}

const EnterVerificationCodePage = ({ email, flow }: EnterVerificationCodePageProps) => {
  const navigate = useNavigate()
  const { isLoaded: signUpLoaded, signUp, setActive: setActiveSignUp } = useSignUp()
  const { isLoaded: signInLoaded, signIn, setActive: setActiveSignIn } = useSignIn()
  const isSignInFlow = flow === AUTH_FLOW.SIGN_IN
  const isLoaded = isSignInFlow ? signInLoaded : signUpLoaded
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

  const editEmailHref = isSignInFlow ? getSignInPath() : getCreateAccountPath()

  const verifySignInCode = async (code: string) => {
    if (!signInLoaded || !signIn) return
    try {
      const completeSignIn = await signIn.attemptFirstFactor({
        strategy: "email_code",
        code,
      })
      if (completeSignIn.status === "complete") {
        await setActiveSignIn({
          session: completeSignIn.createdSessionId,
          redirectUrl: getMyAccountPath(),
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

  const onSubmit = async ({ code }: { code: string }) =>
    isSignInFlow ? verifySignInCode(code) : verifySignUpCode(code)
  const resendSignInCode = async () => {
    if (!signInLoaded || !signIn) return
    try {
      const emailCodeFactor = signIn.supportedFirstFactors?.find(
        (factor) => factor.strategy === "email_code"
      )
      if (emailCodeFactor?.strategy !== "email_code") {
        console.error("Sign in email code factor missing")
        return
      }
      await signIn.prepareFirstFactor({
        strategy: "email_code",
        emailAddressId: emailCodeFactor.emailAddressId,
      })
    } catch (error) {
      console.error("Sign in code resend error", error)
    }
  }

  const resendSignUpCode = async () => {
    if (!signUpLoaded || !signUp) return
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" })
    } catch (error) {
      console.error("Sign up code resend error", error)
    }
  }

  const onResend = async () => (isSignInFlow ? resendSignInCode() : resendSignUpCode())

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
        <p className={styles.resendRow}>
          <span className={styles.didntGetEmail}>{t("createAccount.didntGetEmail")}</span>
          <Button
            className={styles.sendAgain}
            variant="text"
            size="md"
            onClick={() => {
              void onResend()
            }}
          >
            {t("createAccount.sendAgain")}
          </Button>
        </p>
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
  const { isLoaded, isSignedIn } = useAuth()
  const { profile, initialStateLoaded } = useContext(UserContext)
  const { unleashFlag: clerkEnabled, flagsReady } = useFeatureFlag(UNLEASH_FLAG.CLERK_AUTH, false)
  const flow: AUTH_FLOW = pathname.includes("/sign-in/code")
    ? AUTH_FLOW.SIGN_IN
    : AUTH_FLOW.CREATE_ACCOUNT
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
    if (!isSignedIn && !email) {
      void navigate(getSignInPath())
      return
    }
    if (!initialStateLoaded) return
    if (isSignedIn && profile) void navigate(getMyAccountPath())
    if (isSignedIn && !profile) void navigate(getAddProfilePath())
  }, [flagsReady, clerkEnabled, isLoaded, isSignedIn, email, initialStateLoaded, profile, navigate])

  const ready = flagsReady && clerkEnabled && isLoaded && !isSignedIn && !!email

  if (!ready) {
    return null
  }

  return <EnterVerificationCodePage email={email} flow={flow} />
}

export default withAppSetup(EnterVerificationCode, {
  useFormTimeout: true,
  pageName: AppPages.EnterVerificationCode,
})
