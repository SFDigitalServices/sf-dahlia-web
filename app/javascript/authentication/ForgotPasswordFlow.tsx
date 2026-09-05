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
  const { signIn, fetchStatus: signInFetchStatus } = useSignIn()

  const navigate = useNavigate()
  const prefilledEmailParam = new URLSearchParams(window.location.search).get("email") ?? ""

  const onGetCodeSubmit = async ({ email }: { email: string }) => {
    if (signInFetchStatus === "fetching" || !signIn) return

    const { error: createError } = await signIn.create({
      identifier: email,
    })
    if (createError) {
      console.error("Forgot password error:", createError)
      return
    }

    const { error: sendCodeError } = await signIn.resetPasswordEmailCode.sendCode()
    if (createError) {
      console.error("Forgot password send code error:", sendCodeError)
      return
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
          <Button
            variant="primary"
            size="sm"
            type="submit"
            disabled={signInFetchStatus === "fetching"}
          >
            {t("createAccount.getCode")}
          </Button>
        </Form>
      </Card.Section>
      <GetHelp flow={AUTH_FLOW.FORGOT_PASSWORD} />
    </AuthLayout>
  )
}

export { ForgotPasswordFlow as default, ForgotPasswordFlow }
