/* eslint-disable @typescript-eslint/unbound-method */
import React, { useContext, useEffect } from "react"
import { useNavigate } from "react-router"
import { useAuth, useUser } from "@clerk/react"
import { Form, t } from "@bloom-housing/ui-components"
import { Card, Heading, Button, Message } from "@bloom-housing/ui-seeds"
import { useForm } from "react-hook-form"
import withAppSetup from "../../layouts/withAppSetup"
import AuthLayout from "../../layouts/AuthLayout"
import UserContext from "../../authentication/context/UserContext"
import { useFeatureFlag } from "../../hooks/useFeatureFlag"
import { AppPages, getAddProfilePath, getMyAccountPath, getSignInPath } from "../../util/routeUtil"
import styles from "./add-password.module.scss"
import { AUTH_FLOW, UNLEASH_FLAG } from "../../modules/constants"
import GetHelp from "./components/GetHelp"
import PasswordFieldset from "./components/PasswordFieldset"
import "./styles/account.scss"

interface AddPasswordFormValues {
  password: string
}

const AddPasswordPage = () => {
  const navigate = useNavigate()
  const { isLoaded, user } = useUser()
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

  const onSubmit = async ({ password: newPassword }: AddPasswordFormValues) => {
    if (!isLoaded || !user) return
    try {
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
          {t("createAccount.addPassword")}
        </Heading>
        <Message fullwidth variant="primary" className={styles.skip}>
          {t("createAccount.okayToSkipPassword")}
        </Message>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <PasswordFieldset
            register={register}
            errors={errors}
            watch={watch}
            passwordType="createAccount"
            labelText={t("createAccount.choosePasswordOptional")}
          />
          <div className={styles.actions}>
            <Button variant="primary" size="sm" type="submit" disabled={!isLoaded}>
              {t("createAccount.savePassword")}
            </Button>
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
          </div>
        </Form>
      </Card.Section>
      <GetHelp flow={AUTH_FLOW.CREATE_ACCOUNT} />
    </AuthLayout>
  )
}

const AddPassword = (_props: { assetPaths: unknown }) => {
  const navigate = useNavigate()
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

  return <AddPasswordPage />
}

export default withAppSetup(AddPassword, {
  useFormTimeout: true,
  pageName: AppPages.AddPassword,
})
