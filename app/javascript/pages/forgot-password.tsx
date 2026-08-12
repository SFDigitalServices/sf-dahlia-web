/* eslint-disable @typescript-eslint/unbound-method */
import { Form, t } from "@bloom-housing/ui-components"
import { Button, Card, Heading } from "@bloom-housing/ui-seeds"
import React from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router"
import styles from "../authentication/SignInFlow.module.scss"
import AuthLayout from "../layouts/AuthLayout"
import withAppSetup from "../layouts/withAppSetup"
import EmailFieldset from "../pages/account/components/EmailFieldset"
import { AppPages, getCreateAccountPath, getSignInCodePath } from "../util/routeUtil"
import { ForgotPasswordForm } from "./forgot-password-form"
import { useFeatureFlag } from "../hooks/useFeatureFlag"
import { UNLEASH_FLAG } from "../modules/constants"

const ForgotPasswordPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()
  const navigate = useNavigate()
  const prefilledEmailParam = new URLSearchParams(window.location.search).get("email") ?? ""

  const onGetCodeSubmit = ({ email }: { email: string }) => {
    // TODO
    void navigate(getSignInCodePath(), { state: { email } })
  }

  return (
    <AuthLayout title={t("forgotPassword.title")}>
      <Card.Section divider="inset">
        <Heading priority={1} size="2xl">
          {t("forgotPassword.title")}
        </Heading>
        <p className="field-note">{t("signIn.forgotPasswordDescription")}</p>
        <Form className={styles.form} onSubmit={handleSubmit(onGetCodeSubmit)}>
          <EmailFieldset register={register} errors={errors} defaultEmail={prefilledEmailParam} />
          <Button className={styles.getCodeButton} variant="primary" size="sm" type="submit">
            {t("createAccount.getCode")}
          </Button>
        </Form>
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
