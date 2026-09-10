/* eslint-disable @typescript-eslint/unbound-method */
import { Form, t } from "@bloom-housing/ui-components"
import { Button, Card, Heading, Message } from "@bloom-housing/ui-seeds"
import { useAuth, useSignIn, useUser } from "@clerk/react"
import React, { useContext, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { Navigate, useLocation, useNavigate } from "react-router"
import UserContext from "../../authentication/context/UserContext"
import { useFeatureFlag } from "../../hooks/useFeatureFlag"
import AuthLayout from "../../layouts/AuthLayout"
import withAppSetup from "../../layouts/withAppSetup"
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
  const { isLoaded, user } = useUser()
  const { signIn, fetchStatus: signInFetchStatus } = useSignIn()
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

  if (
    isForgotPasswordFlow &&
    signInFetchStatus !== "fetching" &&
    !isResettingPassword &&
    !signIn?.status
  ) {
    return <Navigate to={getForgotPasswordPath()} replace />
  }

  const resetPassword = async (newPassword: string) => {
    if (!signIn) return
    const { error: resetPasswordError } = await signIn.resetPasswordEmailCode.submitPassword({
      password: newPassword,
      signOutOfOtherSessions: true,
    })
    if (resetPasswordError) {
      console.error("Reset password error:", resetPasswordError)
      setError("password", { message: "password:server:generic" })
      return
    }
    if (signIn.status !== "complete") {
      console.error("Reset password status error:", signIn.status)
      setError("password", { message: "password:server:generic" })
      return
    }

    const { error: signInFinalizeError } = await signIn.finalize({
      navigate: ({ decorateUrl }: { decorateUrl: (url: string) => string }) => {
        void navigate(decorateUrl(getMyAccountPath()))
      },
    })
    if (signInFinalizeError) {
      console.error("Reset password error:", signInFinalizeError)
      setError("password", { message: "password:server:generic" })
      return
    }
  }

  const onSubmit = async ({ password: newPassword }: AddPasswordFormValues) => {
    setIsResettingPassword(true)
    if (!isLoaded) return
    if (isForgotPasswordFlow) {
      void resetPassword(newPassword)
      return
    }

    try {
      if (!user) return
      await user.updatePassword({ newPassword })
      if (isAccountSettingsFlow) {
        void navigate(getMyAccountSettingsPath(), { state: { passwordChanged: true } })
      } else {
        void navigate(getAddProfilePath())
      }
    } catch (error) {
      console.error("Add password error:", error)
      setError("password", { message: "password:server:generic" })
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
            <Button variant="primary" size="sm" type="submit" disabled={!isLoaded}>
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
  const isAccountSettingsFlow = state?.accountSettingsFlow === true
  const isForgotPasswordFlow = flow === AUTH_FLOW.FORGOT_PASSWORD
  const { isLoaded, isSignedIn } = useAuth()
  const { isLoaded: userLoaded, user } = useUser()
  const { profile, initialStateLoaded } = useContext(UserContext)
  const { unleashFlag: clerkEnabled, flagsReady } = useFeatureFlag(UNLEASH_FLAG.CLERK_AUTH, false)
  const hasPassword = user?.passwordEnabled

  // TODO: simplify and centralize auth redirects
  /**
   * Add password page redirects
   * --------------------------------
   * 1. Once the Unleash flags are ready:
   * If Clerk is not enabled, redirect to sign-in.
   * 2. Once Clerk is loaded:
   * If the user is signed out, redirect to sign in.
   * 3. Once the profile has loaded:
   * If the user is signed in with a profile, redirect to my account.
   * 4. Once the Clerk user has loaded:
   * If the user already has a password, redirect to the add profile page.
   */
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
    if (isAccountSettingsFlow) return
    if (!initialStateLoaded) return
    if (isSignedIn && profile) void navigate(getMyAccountPath())
    if (!userLoaded) return
    if (isSignedIn && !profile && hasPassword) void navigate(getAddProfilePath())
  }, [
    flagsReady,
    clerkEnabled,
    isLoaded,
    isSignedIn,
    initialStateLoaded,
    profile,
    userLoaded,
    hasPassword,
    navigate,
    isForgotPasswordFlow,
    isAccountSettingsFlow,
  ])

  const ready =
    flagsReady &&
    clerkEnabled &&
    isLoaded &&
    isSignedIn &&
    userLoaded &&
    !hasPassword &&
    (isAccountSettingsFlow || (initialStateLoaded && !profile))

  if (!ready) {
    return null
  }

  return <AddPasswordPage flow={flow} isAccountSettingsFlow={isAccountSettingsFlow} />
}

export { AddPasswordPage }

export default withAppSetup(AddPassword, {
  useFormTimeout: true,
  pageName: AppPages.AddPassword,
})
