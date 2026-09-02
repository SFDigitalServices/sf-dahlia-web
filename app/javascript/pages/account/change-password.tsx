/* eslint-disable @typescript-eslint/unbound-method */
import React, { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { useAuth } from "@clerk/clerk-react"
import withAppSetup from "../../layouts/withAppSetup"
import AuthLayout from "../../layouts/AuthLayout"
import UserContext from "../../authentication/context/UserContext"
import { useFeatureFlag } from "../../hooks/useFeatureFlag"
import { AppPages, getMyAccountSettingsPath, getSignInPath } from "../../util/routeUtil"
import { UNLEASH_FLAG } from "../../modules/constants"
import { ErrorSummaryBanner } from "./components/ErrorSummaryBanner"
import { ExpandedAccountAxiosError, getErrorMessage } from "./components/util"
import { Banner, UpdateForm } from "./settings"
import { useForm } from "react-hook-form"
import "./styles/account.scss"
import { updatePassword } from "../../api/authApiService"
import PasswordFieldset, {
  handlePasswordServerErrors,
  passwordFieldsetErrors,
  passwordSortOrder,
} from "./components/PasswordFieldset"
import { t } from "@bloom-housing/ui-components"

const ChangePasswordPage = () => {
  const [loading, setLoading] = useState(false)
  const [passwordBanner, setPasswordBanner] = useState(false)
  const { profile } = useContext(UserContext)
  const navigate = useNavigate()
  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
    watch,
    setError,
  } = useForm({ mode: "onTouched" })

  const onSubmit = (data: { password: string; currentPassword: string }) => {
    setLoading(true)
    const { password, currentPassword } = data
    if (password === "") {
      setLoading(false)
      return
    }

    updatePassword(password, currentPassword)
      .then(() => setPasswordBanner(true))
      .catch((error: ExpandedAccountAxiosError) => setError(...handlePasswordServerErrors(error)))
      .finally(() => {
        reset({}, { errors: true })
        setLoading(false)
        void navigate(getMyAccountSettingsPath())
      })
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
