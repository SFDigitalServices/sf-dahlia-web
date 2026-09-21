import React, { useEffect } from "react"
import withAppSetup from "../../layouts/withAppSetup"
import { AppPages, getMyAccountSettingsPath, getSignInPath } from "../../util/routeUtil"
import { useNavigate } from "react-router"
import { useFeatureFlag } from "../../hooks/useFeatureFlag"
import { UNLEASH_FLAG } from "../../modules/constants"
import { useAuth, useUser } from "@clerk/react"
import AuthLayout from "../../layouts/AuthLayout"
import { t } from "@bloom-housing/ui-components"
import { Button, Card, Heading } from "@bloom-housing/ui-seeds"
import styles from "./update-email.module.scss"
// import { useForm } from "react-hook-form/dist/index.ie11"

const UpdateEmailPage = () => {
  //   const {
  //   } = useForm({ mode: "onTouched" })
  const navigate = useNavigate()
  //   const { profile } = React.useContext(UserContext)

  const { user, isLoaded } = useUser()
  if (!user) {
    return
  }

  return (
    <AuthLayout title={t("accountSettings.email.updateEmail")}>
      <Card.Section divider="flush">
        <Heading priority={1} size="2xl">
          {t("forgotPassword.title")}
        </Heading>

        {/* <EmailFieldset errors={errors} defaultEmail={profile?.email} /> */}

        <Button variant="primary" size="sm" type="submit" disabled={!isLoaded}>
          {t("createAccount.getCode")}
        </Button>
        <Button
          size="sm"
          variant="text"
          className={styles.cancelButton}
          onClick={() => {
            void navigate(getMyAccountSettingsPath())
          }}
        >
          {t("label.cancel")}
        </Button>
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
