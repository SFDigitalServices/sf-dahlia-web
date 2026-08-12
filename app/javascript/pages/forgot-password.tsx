/* eslint-disable @typescript-eslint/unbound-method */
import { Form, t } from "@bloom-housing/ui-components"
import { Button, Card, Heading } from "@bloom-housing/ui-seeds"
import React from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router"
import styles from "./forgot-password.module.scss"
import AuthLayout from "../layouts/AuthLayout"
import withAppSetup from "../layouts/withAppSetup"
import EmailFieldset from "../pages/account/components/EmailFieldset"
import { AppPages, getSignInCodePath } from "../util/routeUtil"
import { ForgotPasswordForm } from "./forgot-password-form"
import { useFeatureFlag } from "../hooks/useFeatureFlag"
import { AUTH_FLOW, UNLEASH_FLAG } from "../modules/constants"
import GetHelp from "./account/components/GetHelp"
import { useSignIn } from "@clerk/clerk-react"

const ForgotPasswordPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()
  const { isLoaded, signIn } = useSignIn()
  const navigate = useNavigate()
  const prefilledEmailParam = new URLSearchParams(window.location.search).get("email") ?? ""

  const onGetCodeSubmit = async ({ email }: { email: string }) => {
    if (!isLoaded || !signIn) return
    try {
      const { supportedFirstFactors } = await signIn.create({ identifier: email })
      const resetFactor = (supportedFirstFactors ?? []).find(
        (factor) => factor.strategy === "reset_password_email_code"
      )
      if (resetFactor?.strategy !== "reset_password_email_code") {
        throw new Error("Reset password email code factor missing")
      }
      await signIn.prepareFirstFactor({
        strategy: "reset_password_email_code",
        emailAddressId: resetFactor.emailAddressId,
      })
      void navigate(getSignInCodePath(), {
        state: { email, flow: AUTH_FLOW.FORGOT_PASSWORD },
      })
    } catch (error) {
      console.error("Forgot password error", error)
    }
  }

  return (
    <AuthLayout title={t("forgotPassword.title")}>
      <Card.Section divider="flush">
        <Heading priority={1} size="2xl">
          {t("forgotPassword.title")}
        </Heading>
        <p className="field-note">{t("signIn.forgotPasswordDescription")}</p>
        <Form className={styles.form} onSubmit={handleSubmit(onGetCodeSubmit)}>
          <EmailFieldset register={register} errors={errors} defaultEmail={prefilledEmailParam} />
          <Button variant="primary" size="sm" type="submit" disabled={!isLoaded}>
            {t("createAccount.getCode")}
          </Button>
        </Form>
      </Card.Section>
      <GetHelp flow={AUTH_FLOW.FORGOT_PASSWORD} />
    </AuthLayout>
  )
}

const ForgotPassword = () => {
  const { unleashFlag: clerkEnabled } = useFeatureFlag(UNLEASH_FLAG.CLERK_AUTH, false)

  if (!clerkEnabled) {
    return <ForgotPasswordForm />
  }

  return <ForgotPasswordPage />
}

export default withAppSetup(ForgotPassword, {
  useFormTimeout: true,
  pageName: AppPages.ForgotPassword,
})
