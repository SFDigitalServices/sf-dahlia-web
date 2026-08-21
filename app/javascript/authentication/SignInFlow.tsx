/* eslint-disable @typescript-eslint/unbound-method */
import React, { useEffect, useRef, useState } from "react"
import { Navigate, useNavigate } from "react-router"
import { useAuth, useClerk, useSignIn } from "@clerk/clerk-react"
import { Form, t } from "@bloom-housing/ui-components"
import { Alert, Button, Card, Heading, Link, LoadingState } from "@bloom-housing/ui-seeds"
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
import { renderInlineMarkup } from "../util/languageUtil"
import { AUTH_FLOW } from "../modules/constants"
import { authenticateHousingCounselor } from "../api/authApiService"
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
  const { isLoaded, signIn, setActive } = useSignIn()
  const { client } = useClerk()
  const [showError, setShowError] = useState(false)
  const [view, setView] = useState<SignInView | null>(null)
  const housingCounselorChecked = useRef(false)
  // Default to password sign-in, but prefer the code flow if the user last signed in via email code.
  useEffect(() => {
    if (!isLoaded || view !== null) return
    if (client?.lastAuthenticationStrategy === "email_code") {
      setView("verificationCode")
    } else {
      setView("password")
    }
  }, [isLoaded, client?.lastAuthenticationStrategy, view])
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
      const sessionToken = await getToken()
      if (!sessionToken) return false
      await authenticateHousingCounselor(token, sessionToken)
      return true
    } catch {
      setShowError(true)
      return false
    }
  }

  const onSubmit = async ({ email, password }: SignInFields) => {
    if (!isLoaded || !signIn) return
    setShowError(false)
    try {
      const { status, createdSessionId } = await signIn.create({ identifier: email, password })
      if (status !== "complete") {
        console.error(`Sign in failed: ${status}`)
        setShowError(true)
        return
      }
      clearHeaders() // Clear headers in case of existing Devise session (while testing)
      const housingCounselorToken = getHousingCounselorToken()
      if (housingCounselorToken) {
        housingCounselorChecked.current = true
        await setActive({ session: createdSessionId })
        if (!(await checkHousingCounselorAccess())) return
        void navigate(getMyAccountPath())
        return
      }
      // TODO: if user has not completed their profile, redirect to profile page
      await setActive({ session: createdSessionId, redirectUrl: getMyAccountPath() })
    } catch (error) {
      console.error("Sign in error", error)
      setShowError(true)
    }
  }

  const onError = (submitErrors: { email?: unknown; password?: unknown }) => {
    if (submitErrors.email || submitErrors.password) {
      setShowError(true)
    }
  }

  const onGetCodeSubmit = async ({ email }: SignInFields) => {
    if (!isLoaded || !signIn) return
    setShowError(false)
    try {
      const { supportedFirstFactors } = await signIn.create({ identifier: email })
      const emailCodeFactor = (supportedFirstFactors ?? []).find(
        (factor) => factor.strategy === "email_code"
      )
      if (emailCodeFactor?.strategy !== "email_code") {
        throw new Error("Email code factor missing")
      }
      await signIn.prepareFirstFactor({
        strategy: "email_code",
        emailAddressId: emailCodeFactor.emailAddressId,
      })
      void navigate(getSignInCodePath(), {
        state: { email, housingCounselorToken: getHousingCounselorToken() },
      })
    } catch (error) {
      console.error("Sign in code error", error)
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
        const sessionToken = await getToken()
        if (!sessionToken) {
          setShowError(true)
          return
        }
        await authenticateHousingCounselor(token, sessionToken)
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
      <p className="field-note">{t("signIn.codeDescription")}</p>
      <Form onSubmit={handleSubmit(onGetCodeSubmit)}>
        <EmailFieldset register={register} errors={errors} />
        <Button
          className={styles.getCodeButton}
          variant="primary"
          size="sm"
          type="submit"
          disabled={!isLoaded}
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
          disabled={!isLoaded}
        >
          {t("pageTitle.signIn")}
        </Button>
      </Form>
      <Button
        className={styles.oneTimeCodeLink}
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

  return (
    <AuthLayout title={t("pageTitle.signIn")}>
      <Card.Section divider="inset">
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
        <Heading priority={2} size="lg">
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
