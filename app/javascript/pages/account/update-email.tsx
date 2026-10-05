/* eslint-disable @typescript-eslint/unbound-method */
import React, { useContext, useEffect, useState } from "react"
import withAppSetup from "../../layouts/withAppSetup"
import {
  AppPages,
  getMyAccountContactPath,
  getMyAccountSettingsPath,
  getSignInPath,
  getUpdateEmailCodePath,
} from "../../util/routeUtil"
import { useLocation, useNavigate } from "react-router"
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
import { useSignUpSession } from "../../authentication/session/useSignUpSession"
import { useAuthSession } from "../../authentication/session/AuthSessionProvider"
import UserContext from "../../authentication/context/UserContext"
import { bearerToken } from "../../authentication/session/authStatus"
import { updateContactEmail } from "../../api/authApiService"
import { saveProfile } from "../../authentication/context/userActions"

const UpdateEmailPage = () => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({ mode: "onSubmit", shouldFocusError: false })
  const navigate = useNavigate()
  const { user, isAccountInitialized } = useSignUpSession()
  const location = useLocation()
  const { profile } = useContext(UserContext)
  const { getCredentials } = useAuthSession()
  const [loading, setLoading] = useState(false)
  const flow =
    (location.state as { flow?: AUTH_FLOW } | null)?.flow === AUTH_FLOW.UPDATE_CONTACT_EMAIL
      ? AUTH_FLOW.UPDATE_CONTACT_EMAIL
      : AUTH_FLOW.UPDATE_LOGIN_EMAIL
  const isContactFlow = flow === AUTH_FLOW.UPDATE_CONTACT_EMAIL
  const cancelReturnPath = isContactFlow ? getMyAccountContactPath() : getMyAccountSettingsPath()

  if (!user) {
    return null
  }

  const sendEmailCode = async (email: string) => {
    const primaryEmailId = user.primaryEmailAddressId
    if (!primaryEmailId) throw new Error("User has no primary email address")

    // Destroys all non-primary email addresses from abandoned change email attempts
    const staleEmailAddresses = user.emailAddresses.filter(
      (address) => address.id !== primaryEmailId && address.linkedTo.length === 0
    )

    await Promise.all(staleEmailAddresses.map((address) => address.destroy()))
    const emailAddress = await user.createEmailAddress({ email })
    await emailAddress.prepareVerification({ strategy: "email_code" })
  }

  // Clerk cannot send a code to an existing email address. If the contact email is
  // changed to the current login email, which is already verified in Clerk,
  // we skip the verification code flow and update the salesforce contact email.
  // There are no changes made to Clerk.
  const saveVerifiedContactEmail = async (email: string) => {
    if (!profile) throw new Error("Missing profile")

    const sessionToken = bearerToken(await getCredentials())
    if (!sessionToken) throw new Error("Missing Clerk session token")

    const updatedProfile = await updateContactEmail(
      { ...profile, email },
      { clerkEnabled: true, sessionToken }
    )
    saveProfile(updatedProfile)
    void navigate(getMyAccountContactPath(), { state: { contactEmailChanged: true } })
  }

  const onGetCodeSubmit = async ({ email }: { email: string }) => {
    if (loading) return
    const newEmail = email.toLowerCase()
    const loginEmail = user.primaryEmailAddress?.emailAddress.toLowerCase()
    const currentEmail = isContactFlow ? profile?.email?.toLowerCase() : loginEmail

    if (newEmail === currentEmail) {
      setError("email", { message: "email:sameAsCurrentEmail", shouldFocus: true })
      return
    }

    // Contact email changed to the login email: email is already verified
    // in Clerk so no code flow needed
    const skipVerificationCodeFlow = isContactFlow && newEmail === loginEmail

    setLoading(true)
    try {
      if (skipVerificationCodeFlow) {
        await saveVerifiedContactEmail(email)
      } else {
        await sendEmailCode(email)
        void navigate(getUpdateEmailCodePath(), { state: { email, flow } })
      }
    } catch (error) {
      if (skipVerificationCodeFlow) {
        setError("email", { message: "email:server:generic", shouldFocus: true })
      } else {
        setError(...handleClerkEmailErrors(error))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title={t("accountSettings.email.updateEmail")}>
      <ErrorSummaryBanner
        errors={errors}
        sortOrder={emailSortOrder}
        messageMap={(messageKey) => getErrorMessage(messageKey, emailFieldsetErrors, true) ?? ""}
      />
      <Card.Section divider="flush">
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
          <Button variant="primary" size="sm" type="submit" disabled={!isAccountInitialized}>
            {t("createAccount.getCode")}
          </Button>
          <Button
            size="sm"
            variant="text"
            className={styles.cancelButton}
            type="button"
            onClick={() => {
              void navigate(cancelReturnPath)
            }}
          >
            {t("label.cancel")}
          </Button>
        </Form>
      </Card.Section>
    </AuthLayout>
  )
}

const UpdateEmail = (_props: { assetPaths: unknown }) => {
  const navigate = useNavigate()
  const { isLoaded, isSignedIn } = useAuth()
  const { isAccountInitialized } = useSignUpSession()
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
