/* eslint-disable @typescript-eslint/unbound-method */
import { Form, t } from "@bloom-housing/ui-components"
import { Button, Card, Heading, Message } from "@bloom-housing/ui-seeds"
import React, { useContext, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Navigate, useLocation, useNavigate } from "react-router"
import UserContext from "../../authentication/context/UserContext"
import { useAuthSession } from "../../authentication/session/AuthSessionProvider"
import { useSignInSession } from "../../authentication/session/useSignInSession"
import { useSignUpSession } from "../../authentication/session/useSignUpSession"
import { useFeatureFlag } from "../../hooks/useFeatureFlag"
import AuthLayout from "../../layouts/AuthLayout"
import withAppSetup from "../../layouts/withAppSetup"
import { withAuthentication } from "../../authentication/withAuthentication"
import { AUTH_FLOW, UNLEASH_FLAG } from "../../modules/constants"
import {
  AppPages,
  getAddProfilePath,
  getForgotPasswordPath,
  getMyAccountPath,
  getMyAccountSettingsPath,
  getSignInPath,
} from "../../util/routeUtil"
import styles from "./add-password.module.scss"
import GetHelp from "./components/GetHelp"
import PasswordFieldset from "./components/PasswordFieldset"
import "./styles/account.scss"

interface AddPasswordPageProps {
  flow: AUTH_FLOW
  isAccountSettingsFlow?: boolean
}

interface AddPasswordFormValues {
  password: string
}

const AddPasswordPage = ({ flow, isAccountSettingsFlow }: AddPasswordPageProps) => {
  const navigate = useNavigate()
  const { submitNewPassword, activateSession, isResetAttemptStale } = useSignInSession()
  const { setPassword, isAccountInitialized } = useSignUpSession()
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const isForgotPasswordFlow = flow === AUTH_FLOW.FORGOT_PASSWORD

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

  if (isForgotPasswordFlow && !isResettingPassword && isResetAttemptStale) {
    return <Navigate to={getForgotPasswordPath()} replace />
  }

  const resetPassword = async (newPassword: string) => {
    const { error: resetPasswordError, notReady } = await submitNewPassword(newPassword)
    if (notReady) return
    if (resetPasswordError) {
      setError("password", { message: "password:server:generic" })
      return
    }

    const { error: signInFinalizeError, notReady: finalizeNotReady } =
      await activateSession(getMyAccountPath())
    if (finalizeNotReady) return
    if (signInFinalizeError) {
      console.error("Reset password error:", signInFinalizeError)
      setError("password", { message: "password:server:generic" })
      return
    }
  }

  const onSubmit = async ({ password: newPassword }: AddPasswordFormValues) => {
    setIsResettingPassword(true)
    if (!isAccountInitialized) return
    if (isForgotPasswordFlow) {
      void resetPassword(newPassword)
      return
    }

    const { error } = await setPassword(newPassword)
    if (error) {
      setError("password", { message: "password:server:generic" })
      return
    }

    if (isAccountSettingsFlow) {
      void navigate(getMyAccountSettingsPath(), { state: { passwordChanged: true } })
    } else {
      void navigate(getAddProfilePath())
    }
  }

  return (
    <AuthLayout title={t("createAccount.addPassword")}>
      <Card.Section divider="flush">
        <Heading priority={1} size="2xl">
          {isForgotPasswordFlow
            ? t("createAccount.createNewPassword")
            : t("createAccount.addPassword")}
        </Heading>
        {!isForgotPasswordFlow && !isAccountSettingsFlow && (
          <Message fullwidth variant="primary" className={styles.skip}>
            {t("createAccount.okayToSkipPassword")}
          </Message>
        )}
        <Form onSubmit={handleSubmit(onSubmit)}>
          <PasswordFieldset
            register={register}
            errors={errors}
            watch={watch}
            passwordType="createAccount"
            labelText={t(
              isForgotPasswordFlow ? "label.newPassword" : "createAccount.choosePasswordOptional"
            )}
          />
          <div className={styles.actions}>
            <Button variant="primary" size="sm" type="submit" disabled={!isAccountInitialized}>
              {isAccountSettingsFlow
                ? t("accountSettings.addPassword")
                : t("createAccount.savePassword")}
            </Button>
            {!isForgotPasswordFlow && !isAccountSettingsFlow && (
              <Button
                variant="primary-outlined"
                size="sm"
                type="button"
                onClick={() => {
                  void navigate(getAddProfilePath())
                }}
              >
                {t("createAccount.skipForNow")}
              </Button>
            )}
            {isAccountSettingsFlow && (
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
            )}
          </div>
        </Form>
      </Card.Section>
      {!isAccountSettingsFlow && <GetHelp flow={flow} />}
    </AuthLayout>
  )
}

const AddPassword = (_props: { assetPaths: unknown }) => {
  const navigate = useNavigate()
  const { state } = useLocation()
  const flow = state?.flow
  const isAccountSettingsFlow = flow === AUTH_FLOW.ACCOUNT_SETTINGS
  const { status } = useAuthSession()
  const { isAccountInitialized, hasPassword } = useSignUpSession()
  const { profile, initialStateLoaded } = useContext(UserContext)
  const { unleashFlag: clerkEnabled, flagsReady } = useFeatureFlag(UNLEASH_FLAG.CLERK_AUTH, false)

  useEffect(() => {
    if (!flagsReady) return
    if (!clerkEnabled) {
      void navigate(getSignInPath())
      return
    }
  }, [flagsReady, clerkEnabled, navigate])

  const ready =
    flagsReady &&
    clerkEnabled &&
    status.kind === "signedIn" &&
    isAccountInitialized &&
    !hasPassword &&
    // TODO: do not use React Router's state to conditionally render, the state gets lost when users refresh the page
    (isAccountSettingsFlow || (initialStateLoaded && !profile))

  if (!ready) {
    return null
  }

  return <AddPasswordPage flow={flow} isAccountSettingsFlow={isAccountSettingsFlow} />
}

export { AddPasswordPage }

export default withAppSetup(withAuthentication(AddPassword, { pageName: AppPages.AddPassword }), {
  useFormTimeout: true,
  pageName: AppPages.AddPassword,
})
