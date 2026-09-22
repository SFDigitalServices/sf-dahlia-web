/* eslint-disable @typescript-eslint/unbound-method */
import React, { useEffect, useState } from "react"
import withAppSetup from "../../layouts/withAppSetup"
import {
  AppPages,
  getMyAccountSettingsPath,
  getSignInPath,
  getUpdateEmailCodePath,
} from "../../util/routeUtil"
import { useNavigate } from "react-router"
import { useFeatureFlag } from "../../hooks/useFeatureFlag"
import { AUTH_FLOW, UNLEASH_FLAG } from "../../modules/constants"
import { useAuth, useUser } from "@clerk/react"
import AuthLayout from "../../layouts/AuthLayout"
import { Form, t } from "@bloom-housing/ui-components"
import { Button, Card, Heading } from "@bloom-housing/ui-seeds"
import styles from "./update-email.module.scss"
import { useForm } from "react-hook-form"
import EmailFieldset, { handleClerkEmailErrors } from "./components/EmailFieldset"

const UpdateEmailPage = () => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ mode: "onSubmit", shouldFocusError: false })
  const navigate = useNavigate()
  const { user, isLoaded } = useUser()
  const [loading, setLoading] = useState(false)

  if (!user) {
    return null
  }

  const onGetCodeSubmit = async ({ email }: { email: string }) => {
    if (loading) return

    const currentLoginEmail = user.primaryEmailAddress?.emailAddress.toLowerCase()

    if (email.trim().toLowerCase() === currentLoginEmail) {
      setError("email", { message: "email:sameAsCurrentEmail", shouldFocus: true })
      return
    }

    setLoading(true)
    try {
      const existing = user.emailAddresses.find(
        (e) => e.emailAddress.toLowerCase() === email.toLowerCase()
      )
      const emailAddress = existing ?? (await user.createEmailAddress({ email }))

      // TODO: DAH-4372 - Check and reverify user with first factor if needed
      await emailAddress.prepareVerification({ strategy: "email_code" })

      void navigate(getUpdateEmailCodePath(), {
        state: { email, emailAddressId: emailAddress.id, flow: AUTH_FLOW.UPDATE_EMAIL },
      })
    } catch (error) {
      console.error(error)
      setError(...handleClerkEmailErrors(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title={t("accountSettings.email.updateEmail")}>
      <Card.Section divider="flush">
        <Heading priority={1} size="2xl">
          {t("accountSettings.email.updateEmail")}
        </Heading>

        <Form onSubmit={handleSubmit(onGetCodeSubmit)}>
          <div className={styles["emailFieldset"]}>
            <EmailFieldset
              register={register}
              errors={errors}
              label={t("accountSettings.email.newEmail")}
              note={t("accountSettings.email.newEmail.description")}
            />
          </div>
          <Button variant="primary" size="sm" type="submit" disabled={!isLoaded}>
            {t("createAccount.getCode")}
          </Button>
          <Button
            size="sm"
            variant="text"
            className={styles.cancelButton}
            type="button"
            onClick={() => {
              void navigate(getMyAccountSettingsPath())
            }}
          >
            {t("label.cancel")}
          </Button>
        </Form>
      </Card.Section>
    </AuthLayout>
  )
}

const UpdateEmail = (_props: { assetPaths: unknown }) => {
  const navigate = useNavigate()
  const { isLoaded, isSignedIn } = useAuth()
  const { isLoaded: userLoaded } = useUser()
  const { unleashFlag: clerkEnabled, flagsReady } = useFeatureFlag(UNLEASH_FLAG.CLERK_AUTH, false)

  useEffect(() => {
    if (!flagsReady) return
    if (!clerkEnabled) {
      void navigate(getSignInPath())
      return
    }
    if (!isLoaded) return
    if (!isSignedIn) {
      void navigate(getSignInPath())
      return
    }
    if (!userLoaded) return
  }, [flagsReady, clerkEnabled, isLoaded, isSignedIn, navigate, userLoaded])

  const ready = flagsReady && clerkEnabled && isLoaded && isSignedIn

  if (!ready) {
    return null
  }

  return <UpdateEmailPage />
}

export default withAppSetup(UpdateEmail, {
  useFormTimeout: true,
  pageName: AppPages.UpdateEmail,
})
