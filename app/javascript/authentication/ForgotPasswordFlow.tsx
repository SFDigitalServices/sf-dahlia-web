/* eslint-disable @typescript-eslint/unbound-method */
import { Form, t } from "@bloom-housing/ui-components"
import { Button, Card, Heading } from "@bloom-housing/ui-seeds"
import { useSignIn } from "@clerk/clerk-react"
import React from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router"
import AuthLayout from "../layouts/AuthLayout"
import { AUTH_FLOW } from "../modules/constants"
import EmailFieldset from "../pages/account/components/EmailFieldset"
import GetHelp from "../pages/account/components/GetHelp"
import { getSignInCodePath } from "../util/routeUtil"
import styles from "./ForgotPassword.module.scss"

const ForgotPasswordFlow = () => {
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

export { ForgotPasswordFlow as default, ForgotPasswordFlow }
