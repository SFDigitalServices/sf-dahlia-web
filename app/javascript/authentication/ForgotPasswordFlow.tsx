/* eslint-disable @typescript-eslint/unbound-method */
import { Form, t } from "@bloom-housing/ui-components"
import { Button, Card, Heading } from "@bloom-housing/ui-seeds"
import { useSignIn } from "@clerk/react"
import React from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router"
import AuthLayout from "../layouts/AuthLayout"
import { AUTH_FLOW } from "../modules/constants"
import EmailFieldset from "../pages/account/components/EmailFieldset"
import GetHelp from "../pages/account/components/GetHelp"
import { getForgotPasswordCodePath } from "../util/routeUtil"
import styles from "./ForgotPassword.module.scss"

const ForgotPasswordFlow = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()
  const { signIn, fetchStatus: signInStatus } = useSignIn()
  const navigate = useNavigate()
  const prefilledEmailParam = new URLSearchParams(window.location.search).get("email") ?? ""

  const onGetCodeSubmit = async ({ email }: { email: string }) => {
    if (signInStatus === "fetching" || !signIn) return
    // Navigate to the code page either way, so an unknown email is
    // indistinguishable from a known one.
    const { error } = await signIn.create({ identifier: email })
    if (error) {
      console.error("Forgot password error", error)
    } else {
      const { error: sendError } = await signIn.resetPasswordEmailCode.sendCode()
      if (sendError) {
        console.error("Forgot password error", sendError)
      }
    }
    void navigate(getForgotPasswordCodePath(), {
      state: { email, flow: AUTH_FLOW.FORGOT_PASSWORD },
    })
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
          <Button variant="primary" size="sm" type="submit" disabled={signInStatus === "fetching"}>
            {t("createAccount.getCode")}
          </Button>
        </Form>
      </Card.Section>
      <GetHelp flow={AUTH_FLOW.FORGOT_PASSWORD} />
    </AuthLayout>
  )
}

export { ForgotPasswordFlow as default, ForgotPasswordFlow }
