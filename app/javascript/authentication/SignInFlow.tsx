/* eslint-disable @typescript-eslint/unbound-method */
import React, { useEffect, useRef, useState } from "react"
import { Navigate, useNavigate } from "react-router"
import { useAuth, useSignIn } from "@clerk/clerk-react"
import { Form, t } from "@bloom-housing/ui-components"
import { Alert, Button, Card, Heading, Link } from "@bloom-housing/ui-seeds"
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
import { clearHeaders } from "./token"
import styles from "./SignInFlow.module.scss"

interface SignInFields {
  email: string
  password: string
}

type SignInView = "code" | "password"

const SignInFlow = () => {
  const navigate = useNavigate()
  const { isLoaded: authLoaded, isSignedIn } = useAuth()
  const { isLoaded, signIn, setActive } = useSignIn()
  const [showError, setShowError] = useState(false)
  // Defaults to password sign in flow
  const [view, setView] = useState<SignInView>("password")
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
      void navigate(getSignInCodePath(), { state: { email } })
    } catch (error) {
      console.error("Sign in code error", error)
      setShowError(true)
    }
  }

  if (authLoaded && isSignedIn) {
    return <Navigate to={getMyAccountPath()} replace />
  }

  const forgotPasswordPath = createPath(getForgotPasswordPath(), { email: emailField })

  const codeSection = (
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
          setView("code")
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
        {view === "code" ? codeSection : passwordSection}
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
      <GetHelp flow="signIn" />
    </AuthLayout>
  )
}

export { SignInFlow as default, SignInFlow }
