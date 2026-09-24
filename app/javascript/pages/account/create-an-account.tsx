/* eslint-disable @typescript-eslint/unbound-method */
import React from "react"
import { useNavigate } from "react-router"
import { Form, t } from "@bloom-housing/ui-components"
import { Card, Heading, Button } from "@bloom-housing/ui-seeds"
import { useForm } from "react-hook-form"
import withAppSetup from "../../layouts/withAppSetup"
import AuthLayout from "../../layouts/AuthLayout"
import { useSignInSession } from "../../authentication/session/useSignInSession"
import { useSignUpSession } from "../../authentication/session/useSignUpSession"
import {
  AppPages,
  getVerificationCodePath,
  getSignInPath,
  getSignInCodePath,
} from "../../util/routeUtil"
import { useFeatureFlag } from "../../hooks/useFeatureFlag"
import { AUTH_FLOW, UNLEASH_FLAG } from "../../modules/constants"
import { CreateAccount } from "./create-account"
import EmailFieldset from "./components/EmailFieldset"
import GetHelp from "./components/GetHelp"
import "./create-account.scss"
import "./styles/account.scss"
import styles from "./create-an-account.module.scss"

interface CreateAnAccountProps {
  assetPaths: unknown
}

const CreateAnAccountPage = () => {
  const navigate = useNavigate()
  const { createAccount, isBusy } = useSignUpSession()
  const { sendEmailCode } = useSignInSession()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string }>({ mode: "onTouched", shouldFocusError: false })

  const transferToSignIn = async (email: string) => {
    const { error } = await sendEmailCode(email)
    if (error) return

    void navigate(getSignInCodePath(), { state: { email, flow: AUTH_FLOW.SIGN_IN } })
  }

  const onSubmit = async ({ email }: { email: string }) => {
    const { error, needsSignIn } = await createAccount(email)
    if (needsSignIn) {
      void transferToSignIn(email)
      return
    }
    if (error) return

    void navigate(getVerificationCodePath(), { state: { email, flow: AUTH_FLOW.CREATE_ACCOUNT } })
  }

  return (
    <AuthLayout title={t("pageTitle.createAccount")}>
      <Card.Section divider="inset">
        <Heading priority={1} size="2xl">
          {t("createAccount.title.sentenceCase")}
        </Heading>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <EmailFieldset
            register={register}
            errors={errors}
            note={t("createAccount.codeDescription")}
          />
          <Button
            className={styles.getCodeButton}
            variant="primary"
            size="sm"
            type="submit"
            disabled={isBusy}
          >
            {t("createAccount.getCode")}
          </Button>
        </Form>
      </Card.Section>
      <Card.Section divider="flush">
        <Heading priority={2} size="lg" className={styles.alreadyHaveAccount}>
          {t("createAccount.alreadyHaveAccount")}
        </Heading>
        <Button variant="primary-outlined" size="sm" href={getSignInPath()}>
          {t("nav.signIn")}
        </Button>
      </Card.Section>
      <GetHelp flow={AUTH_FLOW.CREATE_ACCOUNT} />
    </AuthLayout>
  )
}

const CreateAnAccount = ({ assetPaths }: CreateAnAccountProps) => {
  const { unleashFlag: clerkEnabled } = useFeatureFlag(UNLEASH_FLAG.CLERK_AUTH, false)

  if (!clerkEnabled) {
    return <CreateAccount assetPaths={assetPaths} />
  }

  return <CreateAnAccountPage />
}

export default withAppSetup(CreateAnAccount, {
  useFormTimeout: true,
  pageName: AppPages.CreateAccount,
})
