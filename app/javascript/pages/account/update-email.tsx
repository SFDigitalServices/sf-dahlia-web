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
import { useAuth } from "@clerk/react"
import AuthLayout from "../../layouts/AuthLayout"
import { Form, t } from "@bloom-housing/ui-components"
import { Button, Card, Heading } from "@bloom-housing/ui-seeds"
import styles from "./update-email.module.scss"
import { useForm } from "react-hook-form"
import EmailFieldset, {
  emailFieldsetErrors,
  emailSortOrder,
  handleClerkEmailErrors,
} from "./components/EmailFieldset"
import { ErrorSummaryBanner } from "./components/ErrorSummaryBanner"
import { getErrorMessage } from "./components/util"
import { useAccountSession } from "../../authentication/session/useAccountSession"
import { useReverificationPrompt } from "../../authentication/session/useReverificationPrompt"
import ReverifyIdentity from "./components/ReverifyIdentity"

const UpdateEmailPage = () => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ mode: "onSubmit", shouldFocusError: false })
  const navigate = useNavigate()
  const { loginEmail, isAccountInitialized, startEmailChange } = useAccountSession()
  const reverificationPrompt = useReverificationPrompt()
  const [loading, setLoading] = useState(false)

  const onGetCodeSubmit = async ({ email }: { email: string }) => {
    if (loading) return
    if (loginEmail && email.trim().toLowerCase() === loginEmail.toLowerCase()) {
      setError("email", { message: "email:sameAsCurrentEmail", shouldFocus: true })
      return
    }

    setLoading(true)
    const { error, cancelled, notReady } = await startEmailChange(email)
    setLoading(false)
    if (cancelled || notReady) return
    if (error) {
      setError(...handleClerkEmailErrors(error))
      return
    }

    void navigate(getUpdateEmailCodePath(), {
      state: { email, flow: AUTH_FLOW.UPDATE_EMAIL },
    })
  }

  return (
    <AuthLayout title={t("accountSettings.email.updateEmail")}>
      <ErrorSummaryBanner
        errors={errors}
        sortOrder={emailSortOrder}
        messageMap={(messageKey) => getErrorMessage(messageKey, emailFieldsetErrors, true) ?? ""}
      />
      <Card.Section divider="flush">
        {reverificationPrompt && <ReverifyIdentity prompt={reverificationPrompt} />}
        {/* Hidden rather than unmounted, so the email entered is still there when this returns. */}
        <div hidden={!!reverificationPrompt}>
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
            <Button
              variant="primary"
              size="sm"
              type="submit"
              disabled={!isAccountInitialized || loading}
            >
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
        </div>
      </Card.Section>
    </AuthLayout>
  )
}

const UpdateEmail = (_props: { assetPaths: unknown }) => {
  const navigate = useNavigate()
  const { isLoaded, isSignedIn } = useAuth()
  const { isAccountInitialized } = useAccountSession()
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
    if (!isAccountInitialized) return
  }, [flagsReady, clerkEnabled, isLoaded, isSignedIn, navigate, isAccountInitialized])

  const ready = flagsReady && clerkEnabled && isLoaded && isSignedIn && isAccountInitialized

  if (!ready) {
    return null
  }

  return <UpdateEmailPage />
}

export default withAppSetup(UpdateEmail, {
  useFormTimeout: true,
  pageName: AppPages.UpdateEmail,
})
