/* eslint-disable @typescript-eslint/unbound-method */
import React, { useEffect } from "react"
import { useNavigate } from "react-router"
import { useUser } from "@clerk/clerk-react"
import { Form, t } from "@bloom-housing/ui-components"
import { Card, Heading, Button, Message } from "@bloom-housing/ui-seeds"
import { useForm } from "react-hook-form"
import withAppSetup from "../../layouts/withAppSetup"
import Layout from "../../layouts/Layout"
import { AppPages, getCreateAccountPath } from "../../util/routeUtil"
import styles from "./add-password.module.scss"
import { useFeatureFlag } from "../../hooks/useFeatureFlag"
import { UNLEASH_FLAG } from "../../modules/constants"
import GetHelp from "./components/GetHelp"
import PasswordFieldset from "./components/PasswordFieldset"
import "./styles/account.scss"

interface AddPasswordFormValues {
  password: string
}

const onSkip = () => {
  console.log("TODO: skip password")
}

const AddPasswordPage = () => {
  const { isLoaded, user } = useUser()
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<AddPasswordFormValues>({
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    shouldFocusError: false,
  })

  const onSubmit = async ({ password: newPassword }: AddPasswordFormValues) => {
    if (!isLoaded || !user) return
    try {
      await user.updatePassword({ newPassword })
      console.log("TODO: next step is the profile page")
    } catch (error) {
      console.error("Add password error:", error)
      setError("password", { message: "password:server:generic" })
    }
  }

  return (
    <Layout title={t("createAccount.addPassword")}>
      <section className="bg-gray-300 md:border-t md:border-gray-450">
        <div className="flex flex-wrap relative md:max-w-lg mx-auto md:py-8">
          <Card className={styles.card}>
            <Card.Section divider="flush">
              <Heading priority={1} size="2xl">
                {t("createAccount.addPassword")}
              </Heading>
              <Message fullwidth className={styles.skip}>
                {t("createAccount.okayToSkipPassword")}
              </Message>
              <Form onSubmit={handleSubmit(onSubmit)}>
                <PasswordFieldset
                  register={register}
                  errors={errors}
                  watch={watch}
                  passwordType="createAccount"
                  labelText={t("createAccount.choosePasswordOptional")}
                />
                <div className={styles.actions}>
                  <Button variant="primary" size="sm" type="submit" disabled={!isLoaded}>
                    {t("createAccount.savePassword")}
                  </Button>
                  <Button variant="primary-outlined" size="sm" type="button" onClick={onSkip}>
                    {t("createAccount.skipForNow")}
                  </Button>
                </div>
              </Form>
            </Card.Section>
            <GetHelp />
          </Card>
        </div>
      </section>
    </Layout>
  )
}

const AddPassword = (_props: { assetPaths: unknown }) => {
  const navigate = useNavigate()
  const { isLoaded, isSignedIn } = useUser()
  const { unleashFlag: clerkEnabled } = useFeatureFlag(UNLEASH_FLAG.CLERK_AUTH, false)

  useEffect(() => {
    if (!clerkEnabled || (isLoaded && !isSignedIn)) {
      void navigate(getCreateAccountPath())
    }
  }, [clerkEnabled, isLoaded, isSignedIn, navigate])

  if (!clerkEnabled) {
    return null
  }

  return <AddPasswordPage />
}

export default withAppSetup(AddPassword, {
  useFormTimeout: true,
  pageName: AppPages.AddPassword,
})
