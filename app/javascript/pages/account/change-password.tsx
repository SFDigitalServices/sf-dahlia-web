/* eslint-disable @typescript-eslint/unbound-method */
import { t } from "@bloom-housing/ui-components"
import { Heading } from "@bloom-housing/ui-seeds"
import React, { useContext, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router"
import UserContext from "../../authentication/context/UserContext"
import { useAuthSession } from "../../authentication/session/AuthSessionProvider"
import { useSignUpSession } from "../../authentication/session/useSignUpSession"
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
import { UpdateForm } from "./settings"
import "./styles/account.scss"

const ChangePasswordPage = () => {
  const [loading, setLoading] = useState(false)
  const { profile } = useContext(UserContext)
  const { changePassword } = useSignUpSession()

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

    if (password === "") {
      setLoading(false)
      return
    }

    const { error, notReady } = await changePassword(currentPassword, password)
    setLoading(false)
    if (notReady) return
    if (error) {
      setError(...handleClerkPasswordErrors(error))
      return
    }
    void navigate(getMyAccountSettingsPath(), { state: { passwordChanged: true } })
  }
  return (
    <AuthLayout title={t("accountSettings.changePassword")}>
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
  const { status } = useAuthSession()
  const isLoaded = status.kind !== "initializing"
  const isSignedIn = status.kind === "signedIn"
  const { isAccountInitialized: userLoaded, hasPassword: userHasPassword } = useSignUpSession()
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
    if (!userHasPassword) {
      void navigate(getMyAccountSettingsPath(), { replace: true })
      return
    }
  }, [flagsReady, clerkEnabled, isLoaded, isSignedIn, navigate, userLoaded, userHasPassword])

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
