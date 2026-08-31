/* eslint-disable @typescript-eslint/unbound-method */
import { Form, t } from "@bloom-housing/ui-components"
import { Button, Card, Heading, Message } from "@bloom-housing/ui-seeds"
import { useAuth, useSignIn, useUser } from "@clerk/clerk-react"
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
  getCreateAccountPath,
  getForgotPasswordPath,
  getMyAccountPath,
  getSignInPath,
} from "../../util/routeUtil"
import styles from "./add-password.module.scss"
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
  const { isLoaded: signInLoaded, signIn, setActive } = useSignIn()
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

  if (isForgotPasswordFlow && signInLoaded && !isResettingPassword && !signIn?.status) {
    return <Navigate to={getForgotPasswordPath()} replace />
  }

  const resetPassword = async (newPassword: string) => {
    if (!signIn || !setActive) return
    const result = await signIn.resetPassword({ password: newPassword })
    if (result.status === "complete") {
      await setActive({ session: result.createdSessionId, redirectUrl: getMyAccountPath() })
    } else {
      console.error("Reset password error:", result)
      setError("password", { message: "password:server:generic" })
    }
    return
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
    if (isLoaded && !isSignedIn && !isForgotPasswordFlow) {
      void navigate(getCreateAccountPath())
      return
    }
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
    isLoaded,
    isSignedIn,
    initialStateLoaded,
    profile,
    userLoaded,
    hasPassword,
    navigate,
    isForgotPasswordFlow,
  ])

  const ready =
    flagsReady &&
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
