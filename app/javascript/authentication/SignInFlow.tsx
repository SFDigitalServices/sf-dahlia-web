/* eslint-disable @typescript-eslint/unbound-method */
import React, { useEffect, useRef, useState } from "react"
import { Navigate, useNavigate } from "react-router"
import { useAuth, useClerk, useSignIn } from "@clerk/react"
import { Form, t } from "@bloom-housing/ui-components"
import { Alert, Button, Card, Heading, Link, LoadingState, Message } from "@bloom-housing/ui-seeds"
import { useForm, useWatch } from "react-hook-form"
import AuthLayout from "../layouts/AuthLayout"
import EmailFieldset from "../pages/account/components/EmailFieldset"
import PasswordFieldset from "../pages/account/components/PasswordFieldset"
import GetHelp from "../pages/account/components/GetHelp"
import {
  createPath,
  getCreateAccountPath,
  getForgotPasswordPath,
  getMyAccountPath,
  getSignInCodePath,
} from "../util/routeUtil"
import { authorizeHousingCounselor } from "../api/authApiService"
import { getSfGovUrl, renderInlineMarkup } from "../util/languageUtil"
import { AUTH_FLOW, UNLEASH_FLAG } from "../modules/constants"
import { useFeatureFlag } from "../hooks/useFeatureFlag"
import { clearHeaders } from "./token"
import styles from "./SignInFlow.module.scss"

interface SignInFields {
  email: string
  password: string
}

type SignInView = "verificationCode" | "password"

const getHousingCounselorToken = () => new URLSearchParams(window.location.search).get("t")

const SignInFlow = () => {
  const navigate = useNavigate()
  const { isLoaded: authLoaded, isSignedIn, getToken } = useAuth()
  const { signIn, fetchStatus: signInStatus } = useSignIn()
  const { client } = useClerk()
  const { unleashFlag: requiredLoginsMessageEnabled } = useFeatureFlag(
    UNLEASH_FLAG.REQUIRED_LOGINS_MESSAGE,
    false
  )
  const [showError, setShowError] = useState(false)
  const [view, setView] = useState<SignInView | null>(null)
  const housingCounselorChecked = useRef(false)
  // Default to password sign-in, but prefer the code flow if the user last signed in via email code.
  useEffect(() => {
    if (signInStatus === "fetching" || view !== null) return
    if (client?.lastAuthenticationStrategy === "email_code") {
      setView("verificationCode")
    } else {
      setView("password")
    }
  }, [signInStatus, client?.lastAuthenticationStrategy, view])
  const alertRef = useRef<HTMLDivElement>(null)
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<SignInFields>({
    shouldFocusError: false,
  })
  const emailField = useWatch<string>({ control, name: "email" })

  useEffect(() => {
    if (showError) {
      alertRef.current?.focus()
    }
  }, [showError])

  const checkHousingCounselorAccess = async () => {
    const token = getHousingCounselorToken()
    if (!token) return true
    try {
      const sessionToken: string | null = await getToken()
      if (!sessionToken) {
        setShowError(true)
        return false
      }
      await authorizeHousingCounselor(token, sessionToken)
      console.log(
        "TODO: Housing counselor successfully authenticated, TBD banner and applicant view"
      )
      return true
    } catch {
      setShowError(true)
      return false
    }
  }

  const onSubmit = async ({ email, password }: SignInFields) => {
    if (signInStatus === "fetching" || !signIn) return
    setShowError(false)
    const { error } = await signIn.create({ identifier: email, password })
    if (error) {
      console.error("Sign in failed:", error)
      setShowError(true)
      return
    }
    if (signIn.status !== "complete") {
      console.error("Sign in error:", signIn)
      setShowError(true)
      return
    }
    clearHeaders() // Clear headers in case of existing Devise session (while testing)
    const housingCounselorToken = getHousingCounselorToken()
    if (housingCounselorToken) {
      // Guards the useEffect below: finalize() flips isSignedIn, which would otherwise
      // fire the already-signed-in counselor path and authorize a second time.
      housingCounselorChecked.current = true
      // v6 equivalent of v5's setActive({ session }): activate the session without
      // navigating, so the getToken() call inside checkHousingCounselorAccess resolves.
      await signIn.finalize()
      if (!(await checkHousingCounselorAccess())) return
      void navigate(getMyAccountPath())
      return
    }
    // TODO: if user has not completed their profile, redirect to profile page
    await signIn.finalize({
      navigate: ({ decorateUrl }: { decorateUrl: (url: string) => string }) => {
        void navigate(decorateUrl(getMyAccountPath()))
      },
    })
  }

  const onError = (submitErrors: { email?: unknown; password?: unknown }) => {
    if (submitErrors.email || submitErrors.password) {
      setShowError(true)
    }
  }

  const onGetCodeSubmit = async ({ email }: SignInFields) => {
    if (signInStatus === "fetching" || !signIn) return
    setShowError(false)
    const { error } = await signIn.create({ identifier: email })
    if (error) {
      console.error("Sign in code error", error)
      setShowError(true)
      return
    }
    await signIn.emailCode.sendCode()
    if (signIn.status === "needs_first_factor") {
      void navigate(getSignInCodePath(), {
        state: { email, housingCounselorToken: getHousingCounselorToken() },
      })
    } else {
      console.error("Sign in code error", signIn)
      setShowError(true)
    }
  }

  useEffect(() => {
    if (!authLoaded || !isSignedIn || housingCounselorChecked.current) return
    const token = getHousingCounselorToken()
    if (!token) return

    housingCounselorChecked.current = true
    void (async () => {
      try {
        const sessionToken: string | null = await getToken()
        if (!sessionToken) {
          setShowError(true)
          return
        }
        await authorizeHousingCounselor(token, sessionToken)
        console.log("TODO: Housing counselor already signed in, TBD banner and applicant view")
        void navigate(getMyAccountPath())
      } catch {
        setShowError(true)
      }
    })()
  }, [authLoaded, getToken, isSignedIn, navigate])

  if (authLoaded && isSignedIn && !getHousingCounselorToken()) {
    return <Navigate to={getMyAccountPath()} replace />
  }

  const forgotPasswordPath = createPath(getForgotPasswordPath(), { email: emailField })

  const verificationCodeSection = (
    <>
      <Form onSubmit={handleSubmit(onGetCodeSubmit)}>
        <EmailFieldset register={register} errors={errors} note={t("signIn.codeDescription")} />
        <Button
          className={styles.getCodeButton}
          variant="primary"
          size="sm"
          type="submit"
          disabled={signInStatus === "fetching"}
        >
          {t("createAccount.getCode")}
        </Button>
      </Form>
      <Button variant="text" size="md" onClick={() => setView("password")}>
        {t("signIn.passwordInstead")}
      </Button>
    </>
  )

  const passwordSection = (
    <>
      {/* onSubmit writes housingCounselorChecked.current; handleSubmit only wraps it
          into a submit handler and never invokes it during render. */}
      {/* eslint-disable-next-line react-hooks/refs */}
      <Form className={styles.form} onSubmit={handleSubmit(onSubmit, onError)}>
        <EmailFieldset register={register} />
        <span className={styles.forgotPassword}>
          <Link href={forgotPasswordPath}>{t("signIn.forgotPassword")}</Link>
        </span>
        <PasswordFieldset
          register={register}
          watch={watch}
          labelText={t("label.password")}
          passwordType="signIn"
        />
        <Button
          className={styles.signInButton}
          variant="primary"
          size="sm"
          type="submit"
          disabled={signInStatus === "fetching"}
        >
          {t("pageTitle.signIn")}
        </Button>
      </Form>
      <Button
        variant="text"
        size="md"
        onClick={() => {
          setShowError(false)
          setView("verificationCode")
        }}
      >
        {t("signIn.oneTimeCode")}
      </Button>
      <p className={`field-note ${styles.oneTimeCodeNote}`}>{t("signIn.oneTimeCodeNote")}</p>
    </>
  )

  const requiredLoginsHelpUrl = getSfGovUrl("https://www.sf.gov/get-help-with-your-dahlia-account")

  return (
    <AuthLayout title={t("pageTitle.signIn")}>
      <Card.Section divider="inset">
        {requiredLoginsMessageEnabled && (
          <Message fullwidth variant="primary" className={styles.requiredLoginsMessage}>
            {renderInlineMarkup(t("signIn.requiredLoginsMessage", { url: requiredLoginsHelpUrl }))}
          </Message>
        )}
        <Heading priority={1} size="2xl">
          {t("pageTitle.signIn")}
        </Heading>
        {showError && (
          <div ref={alertRef} tabIndex={-1} className={styles.errorAlert}>
            <Alert fullwidth variant="alert" onClose={() => setShowError(false)}>
              {renderInlineMarkup(
                t("signIn.badCredentialsWithResetLink", { url: forgotPasswordPath })
              )}
            </Alert>
          </div>
        )}
        <LoadingState loading={!view}>
          {view === "verificationCode" ? verificationCodeSection : passwordSection}
        </LoadingState>
      </Card.Section>
      <Card.Section divider="flush">
        <Heading priority={2} size="lg" className={styles.createAccountHeading}>
          {t("signIn.dontHaveAccount")}
        </Heading>
        <p className={styles.createAccountDescription}>{t("signIn.createAccountDescription")}</p>
        <Button variant="primary-outlined" size="sm" href={getCreateAccountPath()}>
          {t("signIn.createAccount")}
        </Button>
      </Card.Section>
      <GetHelp flow={AUTH_FLOW.SIGN_IN} />
    </AuthLayout>
  )
}

export { SignInFlow as default, SignInFlow }
