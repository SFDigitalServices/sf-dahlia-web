/* eslint-disable @typescript-eslint/unbound-method */
import React from "react"
import { useNavigate } from "react-router"
import { useSignUp, useSignIn } from "@clerk/react"
import { Form, t } from "@bloom-housing/ui-components"
import { Card, Heading, Button } from "@bloom-housing/ui-seeds"
import { useForm } from "react-hook-form"
import withAppSetup from "../../layouts/withAppSetup"
import AuthLayout from "../../layouts/AuthLayout"
import {
  AppPages,
  getVerificationCodePath,
  getSignInPath,
  getSignInCodePath,
} from "../../util/routeUtil"
import { getCurrentLanguage } from "../../util/languageUtil"
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
  const { signUp, fetchStatus: signUpStatus } = useSignUp()
  const { signIn, fetchStatus: signInStatus } = useSignIn()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string }>({ mode: "onTouched", shouldFocusError: false })

  const transferToSignIn = async (email: string) => {
    if (signInStatus === "fetching" || !signIn) return
    const { error } = await signIn.create({ identifier: email })
    if (error) {
      console.error("Transfer to sign in code error", error)
      return
    }
    await signIn.emailCode.sendCode()
    if (signIn.status === "needs_first_factor") {
      void navigate(getSignInCodePath(), { state: { email } })
    } else {
      console.error("Transfer to sign in code error", signIn)
    }
  }

  const onSubmit = async ({ email }: { email: string }) => {
    if (signUpStatus === "fetching" || !signUp) return
    const locale = getCurrentLanguage()
    const { error } = await signUp.create({
      emailAddress: email,
      locale,
      unsafeMetadata: { locale }, // Account creation can only update public metadata
    })
    // this condition can be true only if strict enumeration protection is *not* enabled
    if (error?.errors?.[0]?.code === "form_identifier_exists") {
      void transferToSignIn(email)
      return
    }
    if (error) {
      console.error("Account creation error", error)
      return
    }
    await signUp.verifications.sendEmailCode()
    if (
      signUp.status === 'missing_requirements' &&
      signUp.unverifiedFields.includes('email_address') &&
      signUp.missingFields.length === 0
    ) {
      void navigate(getVerificationCodePath(), { state: { email } })
    } else {
      console.error("Account creation error", signUp)
      return
    }
  }

  return (
    <AuthLayout title={t("pageTitle.createAccount")}>
      <Card.Section divider="inset">
        <Heading priority={1} size="2xl">
          {t("createAccount.title.sentenceCase")}
        </Heading>
        <p className="field-note">{t("createAccount.codeDescription")}</p>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <EmailFieldset register={register} errors={errors} />
          <Button
            className={styles.getCodeButton}
            variant="primary"
            size="sm"
            type="submit"
            disabled={signUpStatus === "fetching" || signInStatus === "fetching"}
          >
            {t("createAccount.getCode")}
          </Button>
        </Form>
      </Card.Section>
      <Card.Section divider="flush">
        <Heading priority={2} size="lg">
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
