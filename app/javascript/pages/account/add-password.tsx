/* eslint-disable @typescript-eslint/unbound-method */
import React, { useContext, useEffect, useState } from "react"
import { Navigate, useLocation, useNavigate } from "react-router"
import { useAuth, useSignIn, useUser } from "@clerk/react"
import { Form, t } from "@bloom-housing/ui-components"
import { Card, Heading, Button, Message } from "@bloom-housing/ui-seeds"
import { useForm } from "react-hook-form"
import withAppSetup from "../../layouts/withAppSetup"
import AuthLayout from "../../layouts/AuthLayout"
import UserContext from "../../authentication/context/UserContext"
import { useFeatureFlag } from "../../hooks/useFeatureFlag"
import {
  AppPages,
  getAddProfilePath,
  getForgotPasswordPath,
  getMyAccountPath,
  getSignInPath,
} from "../../util/routeUtil"
import styles from "./add-password.module.scss"
import { AUTH_FLOW, UNLEASH_FLAG } from "../../modules/constants"
import GetHelp from "./components/GetHelp"
import PasswordFieldset from "./components/PasswordFieldset"
import "./styles/account.scss"

interface AddPasswordPageProps {
  flow: AUTH_FLOW
}

interface AddPasswordFormValues {
  password: string
}

const AddPasswordPage = ({ flow }: AddPasswordPageProps) => {
  const navigate = useNavigate()
  const { isLoaded, user } = useUser()
  const { signIn, fetchStatus: signInStatus } = useSignIn()
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
    signInStatus !== "fetching" &&
    !isResettingPassword &&
    !signIn?.status
  ) {
    return <Navigate to={getForgotPasswordPath()} replace />
  }

  const resetPassword = async (newPassword: string) => {
    if (!signIn) return
    const { error } = await signIn.resetPasswordEmailCode.submitPassword({ password: newPassword })
    if (error) {
      console.error("Reset password error:", error)
      setError("password", { message: "password:server:generic" })
      return
    }
    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ decorateUrl }: { decorateUrl: (url: string) => string }) => {
          void navigate(decorateUrl(getMyAccountPath()))
        },
      })
    } else {
      console.error("Reset password error:", signIn)
      setError("password", { message: "password:server:generic" })
    }
  }

  const onSubmit = async ({ password: newPassword }: AddPasswordFormValues) => {
    setIsResettingPassword(true)
    if (!isLoaded) return
    try {
      if (isForgotPasswordFlow) return await resetPassword(newPassword)
      if (!user) return
      await user.updatePassword({ newPassword })
      void navigate(getAddProfilePath())
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
        {!isForgotPasswordFlow && (
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
              {t("createAccount.savePassword")}
            </Button>
            {!isForgotPasswordFlow && (
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
          </div>
        </Form>
      </Card.Section>
      <GetHelp flow={flow} />
    </AuthLayout>
  )
}

const AddPassword = (_props: { assetPaths: unknown }) => {
  const navigate = useNavigate()
  const { state } = useLocation()
  const flow: AUTH_FLOW = state?.flow
  const isForgotPasswordFlow = flow === AUTH_FLOW.FORGOT_PASSWORD
  const { isLoaded, isSignedIn } = useAuth()
  const { isLoaded: userLoaded, user } = useUser()
  const { profile, initialStateLoaded } = useContext(UserContext)
  const { unleashFlag: clerkEnabled, flagsReady } = useFeatureFlag(UNLEASH_FLAG.CLERK_AUTH, false)
  const hasPassword = user?.passwordEnabled

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
    // A password reset reaches this page signed out -- the reset itself creates
    // the session -- so skip the signed-in requirement and the profile-based
    // redirects for that flow.
    if (isForgotPasswordFlow) return
    if (!isLoaded) return
    if (!isSignedIn) {
      void navigate(getSignInPath())
      return
    }
    if (!initialStateLoaded) return
    if (isSignedIn && profile) void navigate(getMyAccountPath())
    if (!userLoaded) return
    if (isSignedIn && !profile && hasPassword) void navigate(getAddProfilePath())
  }, [
    flagsReady,
    clerkEnabled,
    isForgotPasswordFlow,
    isLoaded,
    isSignedIn,
    initialStateLoaded,
    profile,
    userLoaded,
    hasPassword,
    navigate,
  ])

  // The reset flow arrives signed out, so it cannot satisfy the signed-in and
  // profile conditions the create-account flow is gated on.
  const ready = isForgotPasswordFlow
    ? flagsReady && clerkEnabled
    : flagsReady &&
      clerkEnabled &&
      isLoaded &&
      isSignedIn &&
      initialStateLoaded &&
      !profile &&
      userLoaded &&
      !hasPassword

  if (!ready) {
    return null
  }

  return <AddPasswordPage flow={flow} />
}

export { AddPasswordPage }

export default withAppSetup(AddPassword, {
  useFormTimeout: true,
  pageName: AppPages.AddPassword,
})
