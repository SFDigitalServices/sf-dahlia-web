/* eslint-disable @typescript-eslint/unbound-method */
import React from "react"
import { useSignUp } from "@clerk/clerk-react"
import { Form, t } from "@bloom-housing/ui-components"
import { Card, Heading, Link, Button } from "@bloom-housing/ui-seeds"
import { useForm } from "react-hook-form"
import withAppSetup from "../../layouts/withAppSetup"
import Layout from "../../layouts/Layout"
import { AppPages, getAssistancePath, getSignInPath } from "../../util/routeUtil"
import { getCurrentLanguage } from "../../util/languageUtil"
import { useFeatureFlag } from "../../hooks/useFeatureFlag"
import { UNLEASH_FLAG } from "../../modules/constants"
import { CreateAccount } from "./create-account"
import EmailFieldset from "./components/EmailFieldset"
import "./create-account.scss"
import "./styles/account.scss"
import styles from "./create-an-account.module.scss"

interface CreateAnAccountProps {
  assetPaths: unknown
}

const CreateAnAccountPage = () => {
  const { isLoaded, signUp } = useSignUp()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string }>({ mode: "onTouched", shouldFocusError: false })
  const onSubmit = async ({ email }: { email: string }) => {
    if (!isLoaded || !signUp) return
    const locale = getCurrentLanguage()
    try {
      await signUp.create({
        emailAddress: email,
        locale,
        unsafeMetadata: { locale }, // Account creation can only update public metadata
      })
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" })
    } catch (error) {
      console.error("Account creation error", error)
    }
  }

  return (
    <Layout title={t("pageTitle.createAccount")}>
      <section className="bg-gray-300 md:border-t md:border-gray-450">
        <div className="flex flex-wrap relative md:max-w-lg mx-auto md:py-8">
          <Card className={styles.card}>
            <Card.Section divider="inset">
              <Heading priority={1} size="2xl">
                {t("createAccount.title.sentenceCase")}
              </Heading>
              <p className="field-note">{t("createAccount.codeDescription")}</p>
              <Form onSubmit={handleSubmit(onSubmit)}>
                <EmailFieldset register={register} errors={errors} />
                <Button variant="primary" size="sm" type="submit" disabled={!isLoaded}>
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
            <Card.Section className={styles.helpFooter}>
              <Heading priority={2} size="lg">
                {t("createAccount.getHelp")}
              </Heading>
              <Link className={styles.helpLink} href={getAssistancePath()}>
                {t("createAccount.getHelpLink")}
              </Link>
            </Card.Section>
          </Card>
        </div>
      </section>
    </Layout>
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
