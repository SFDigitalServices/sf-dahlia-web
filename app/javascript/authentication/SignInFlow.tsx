/* eslint-disable @typescript-eslint/unbound-method */
import React, { useState } from "react"
import { Navigate } from "react-router"
import { useAuth, useSignIn } from "@clerk/clerk-react"
import { Form, t } from "@bloom-housing/ui-components"
import { Alert, Button, Card, Heading, Link } from "@bloom-housing/ui-seeds"
import { useForm } from "react-hook-form"
import Layout from "../layouts/Layout"
import EmailFieldset from "../pages/account/components/EmailFieldset"
import PasswordFieldset from "../pages/account/components/PasswordFieldset"
import GetHelp from "../pages/account/components/GetHelp"
import { EnterCodePage } from "../pages/account/enter-code"
import { getCreateAccountPath, getForgotPasswordPath, getMyAccountPath } from "../util/routeUtil"
import { renderInlineMarkup } from "../util/languageUtil"
import styles from "./SignInFlow.module.scss"

interface SignInFields {
  email: string
  password: string
}

type SignInView = "code" | "password"

const SignInFlow = () => {
  const { isLoaded: authLoaded, isSignedIn } = useAuth()
  const { isLoaded, signIn, setActive } = useSignIn()
  const [showError, setShowError] = useState(false)
  // Defaults to password sign in flow
  const [view, setView] = useState<SignInView>("password")
  const [enterCodeEmail, setEnterCodeEmail] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignInFields>({ mode: "onTouched", shouldFocusError: false })

  const onPasswordSubmit = async ({ email, password }: SignInFields) => {
    if (!isLoaded || !signIn) return
    setShowError(false)
    try {
      const { status, createdSessionId } = await signIn.create({ identifier: email, password })
      if (status !== "complete") {
        console.error(`Sign in failed: ${status}`)
        setShowError(true)
        return
      }
      // TODO: if user has not completed their profile, redirect to profile page
      await setActive({ session: createdSessionId, redirectUrl: getMyAccountPath() })
    } catch (error) {
      console.error("Sign in error", error)
      setShowError(true)
    }
  }

  const onGetCodeSubmit = ({ email }: SignInFields) => {
    setEnterCodeEmail(email)
  }

  if (authLoaded && isSignedIn) {
    return <Navigate to={getMyAccountPath()} replace />
  }

  if (enterCodeEmail) {
    return (
      <EnterCodePage
        email={enterCodeEmail}
        flow="signIn"
        onEditEmail={() => {
          setEnterCodeEmail(null)
          setView("code")
        }}
      />
    )
  }

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
      <Form className={styles.form} onSubmit={handleSubmit(onPasswordSubmit)}>
        <EmailFieldset register={register} errors={errors} />
        <span className={styles.forgotPassword}>
          <Link href={getForgotPasswordPath()}>{t("signIn.forgotPassword")}</Link>
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
    <Layout title={t("pageTitle.signIn")}>
      <section className="bg-gray-300 md:border-t md:border-gray-450">
        <div className="flex flex-wrap relative md:max-w-lg mx-auto md:py-8">
          <Card className={styles.card}>
            {showError && (
              <Alert fullwidth variant="alert" onClose={() => setShowError(false)}>
                {renderInlineMarkup(
                  t("signIn.badCredentialsWithResetLink", { url: getForgotPasswordPath() })
                )}
              </Alert>
            )}
            <Card.Section divider="inset">
              <Heading priority={1} size="2xl">
                {t("pageTitle.signIn")}
              </Heading>
              {view === "code" ? codeSection : passwordSection}
            </Card.Section>
            <Card.Section divider="flush">
              <Heading priority={2} size="lg">
                {t("signIn.dontHaveAccount")}
              </Heading>
              <p className={styles.createAccountDescription}>{t("signIn.createAccount")}</p>
              <Button variant="primary-outlined" size="sm" href={getCreateAccountPath()}>
                {t("label.createAccount")}
              </Button>
            </Card.Section>
            <GetHelp flow="signIn" />
          </Card>
        </div>
      </section>
    </Layout>
  )
}

export { SignInFlow as default, SignInFlow }
