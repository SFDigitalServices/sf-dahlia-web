/* eslint-disable @typescript-eslint/unbound-method */
import React, { useEffect, useRef, useState } from "react"
import { Navigate, useLocation, useNavigate } from "react-router"
import { useAuth, useClerk, useSignIn } from "@clerk/clerk-react"
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
  localizedPath,
} from "../util/routeUtil"
import { getSfGovUrl, localizedFormat, renderInlineMarkup } from "../util/languageUtil"
import { AUTH_FLOW } from "../modules/constants"
import { clearHeaders } from "./token"
import styles from "./SignInFlow.module.scss"

interface SignInFields {
  email: string
  password: string
}

type SignInView = "verificationCode" | "password"

const SignInFlow = () => {
  const navigate = useNavigate()
  const { state } = useLocation() as { state?: { listingId?: string } }
  const applyIntroPath = state?.listingId
    ? localizedPath(`listings/${state.listingId}/apply-welcome/intro`)
    : null
  const postSignInRedirectUrl = applyIntroPath ?? getMyAccountPath()
  const requiredLoginsDate = localizedFormat(process.env.REQUIRED_LOGINS_DATE ?? "", "LL")
  const { isLoaded: authLoaded, isSignedIn } = useAuth()
  const { isLoaded, signIn, setActive } = useSignIn()
  const { client } = useClerk()
  const [showError, setShowError] = useState(false)
  const [view, setView] = useState<SignInView | null>(null)
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
      // If the user came from the listing detail apply button, redirect to the application intro page
      await setActive({ session: createdSessionId, redirectUrl: postSignInRedirectUrl })
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
        state: { email, ...(applyIntroPath && { redirectUrl: applyIntroPath }) },
      })
    } catch (error) {
      console.error("Sign in code error", error)
      setShowError(true)
    }
  }

  if (authLoaded && isSignedIn) {
    return <Navigate to={postSignInRedirectUrl} replace />
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
        {applyIntroPath && requiredLoginsDate && (
          <Message variant="primary" fullwidth className={styles.requiredLoginNotice}>
            {renderInlineMarkup(
              t("signIn.requiredLoginNotice", {
                date: requiredLoginsDate,
                url: getSfGovUrl("https://www.sf.gov/sign-in-to-your-dahlia-account"),
              })
            )}
          </Message>
        )}
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
        {applyIntroPath && (
          <Link href={applyIntroPath} className={styles.continueWithoutSigningIn}>
            {t("b1aWelcomeBack.continueWithoutSigningIn")}
          </Link>
        )}
      </Card.Section>
      <GetHelp flow={AUTH_FLOW.SIGN_IN} />
    </AuthLayout>
  )
}

export { SignInFlow as default, SignInFlow }
