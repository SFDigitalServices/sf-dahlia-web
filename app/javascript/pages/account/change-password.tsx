/* eslint-disable @typescript-eslint/unbound-method */
import { t } from "@bloom-housing/ui-components"
import { Heading } from "@bloom-housing/ui-seeds"
import { useAuth, useSession, useUser } from "@clerk/clerk-react"
import React, { useContext, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router"
import UserContext from "../../authentication/context/UserContext"
import { useFeatureFlag } from "../../hooks/useFeatureFlag"
import AuthLayout from "../../layouts/AuthLayout"
import withAppSetup from "../../layouts/withAppSetup"
import { UNLEASH_FLAG } from "../../modules/constants"
import { AppPages, getMyAccountSettingsPath, getSignInPath } from "../../util/routeUtil"
import { ErrorSummaryBanner } from "./components/ErrorSummaryBanner"
import PasswordFieldset, {
  passwordFieldsetErrors,
  passwordSortOrder,
  handleClerkPasswordErrors,
} from "./components/PasswordFieldset"
import { getErrorMessage } from "./components/util"
import { Banner, UpdateForm } from "./settings"
import "./styles/account.scss"

const ChangePasswordPage = () => {
  const [loading, setLoading] = useState(false)
  const [passwordBanner, setPasswordBanner] = useState(false)
  const { profile } = useContext(UserContext)
  const { user } = useUser()
  const { session } = useSession()

  const navigate = useNavigate()
  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
    setError,
  } = useForm({ mode: "onTouched" })

  const onSubmit = async (data: { password: string; currentPassword: string }) => {
    setLoading(true)
    const { password, currentPassword } = data

    if (password === "" || !user || !session) {
      setLoading(false)
      return
    }

    try {
      await session.startVerification({ level: "first_factor" })
      await session.attemptFirstFactorVerification({
        strategy: "password",
        password: currentPassword,
      })

      await user.updatePassword({
        currentPassword,
        newPassword: password,
        signOutOfOtherSessions: true,
      })
      setPasswordBanner(true)
      void navigate(getMyAccountSettingsPath())
    } catch (error) {
      setError(...handleClerkPasswordErrors(error))
    } finally {
      setLoading(false)
    }
  }
  return (
    <AuthLayout title={t("accountSettings.changePassword")}>
      <Banner
        showBanner={passwordBanner}
        className="mt-8"
        message={t("accountSettings.accountChangesSaved")}
        onClose={() => setPasswordBanner(false)}
      />
      <ErrorSummaryBanner
        errors={errors}
        sortOrder={passwordSortOrder}
        messageMap={(messageKey) => getErrorMessage(messageKey, passwordFieldsetErrors, true)}
      />
      <UpdateForm
        onSubmit={handleSubmit(onSubmit)}
        loading={loading}
        submitLabel={t("accountSettings.savePassword")}
      >
        <Heading priority={1} size="2xl">
          {t("accountSettings.changePassword")}
        </Heading>
        <PasswordFieldset
          register={register}
          errors={errors}
          watch={watch}
          email={profile?.email}
          labelText={t("label.password")}
          passwordType="accountSettings"
        />
      </UpdateForm>
    </AuthLayout>
  )
}

const ChangePassword = (_props: { assetPaths: unknown }) => {
  const navigate = useNavigate()
  const { isLoaded, isSignedIn } = useAuth()
  const { profile, initialStateLoaded } = useContext(UserContext)
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
  }, [flagsReady, clerkEnabled, isLoaded, isSignedIn, initialStateLoaded, profile, navigate])

  const ready = flagsReady && clerkEnabled && isLoaded && isSignedIn

  if (!ready) {
    return null
  }

  return <ChangePasswordPage />
}

export default withAppSetup(ChangePassword, {
  useFormTimeout: true,
  pageName: AppPages.ChangePassword,
})
