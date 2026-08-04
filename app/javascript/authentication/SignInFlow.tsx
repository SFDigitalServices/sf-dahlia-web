/* eslint-disable @typescript-eslint/unbound-method */
import React, { useEffect, useRef, useState } from "react"
import { Navigate } from "react-router"
import { useAuth, useSignIn } from "@clerk/clerk-react"
import { Form, t } from "@bloom-housing/ui-components"
import { Alert, Button, Card, Heading, Link } from "@bloom-housing/ui-seeds"
import { useForm } from "react-hook-form"
import Layout from "../layouts/Layout"
import EmailFieldset from "../pages/account/components/EmailFieldset"
import PasswordFieldset from "../pages/account/components/PasswordFieldset"
import GetHelp from "../pages/account/components/GetHelp"
import {
  createPath,
  getCreateAccountPath,
  getForgotPasswordPath,
  getMyAccountPath,
} from "../util/routeUtil"
import { getSfGovUrl, renderInlineMarkup } from "../util/languageUtil"
import styles from "./SignInFlow.module.scss"

interface SignInFields {
  email: string
  password: string
}

const SignInFlow = () => {
  const { isLoaded: authLoaded, isSignedIn } = useAuth()
  const { isLoaded, signIn, setActive } = useSignIn()
  const [showError, setShowError] = useState(false)
  const alertRef = useRef<HTMLDivElement>(null)
  const { register, handleSubmit, watch } = useForm<SignInFields>({ shouldFocusError: false })
  /* eslint-disable-next-line react-hooks/incompatible-library */
  const emailField = watch("email", undefined)

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
      // TODO: if user has not completed their profile, redirect to profile page
      await setActive({ session: createdSessionId, redirectUrl: getMyAccountPath() })
    } catch (error) {
      console.error("Sign in error", error)
      setShowError(true)
    }
  }

  const onError = (errors: { email?: unknown; password?: unknown }) => {
    if (errors.email || errors.password) {
      setShowError(true)
    }
  }

  if (authLoaded && isSignedIn) {
    return <Navigate to={getMyAccountPath()} replace />
  }

  const forgotPasswordPath = createPath(getForgotPasswordPath(), { email: emailField })

  return (
    <Layout title={t("pageTitle.signIn")}>
      <section className="bg-gray-300 md:border-t md:border-gray-450">
        <div className="flex flex-wrap relative md:max-w-lg mx-auto md:py-8">
          <Card className={styles.card}>
            {showError && (
              <div ref={alertRef} tabIndex={-1}>
                <Alert fullwidth variant="alert" onClose={() => setShowError(false)}>
                  {renderInlineMarkup(
                    t("signIn.badCredentialsWithResetLink", { url: forgotPasswordPath })
                  )}
                </Alert>
              </div>
            )}
            <Card.Section divider="inset">
              <Heading priority={1} size="2xl">
                {t("pageTitle.signIn")}
              </Heading>
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
                  console.log("TODO: switch to code flow")
                }}
              >
                {t("signIn.oneTimeCode")}
              </Button>
              <p className={`field-note ${styles.oneTimeCodeNote}`}>
                {t("signIn.oneTimeCodeNote")}
              </p>
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
            <GetHelp
              text={t("signIn.getHelpLink")}
              href={getSfGovUrl("https://www.sf.gov/sign-in-to-your-dahlia-account")}
            />
          </Card>
        </div>
      </section>
    </Layout>
  )
}

export { SignInFlow as default, SignInFlow }
