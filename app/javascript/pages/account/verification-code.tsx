/* eslint-disable @typescript-eslint/unbound-method */
import React, { useContext, useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router"
import { ExpandableContent, Form, Order, t } from "@bloom-housing/ui-components"
import { Card, Heading, Button } from "@bloom-housing/ui-seeds"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheck } from "@fortawesome/free-solid-svg-icons"
import { Controller, useForm } from "react-hook-form"
import withAppSetup from "../../layouts/withAppSetup"
import AuthLayout from "../../layouts/AuthLayout"
import { useAuthSession } from "../../authentication/session/AuthSessionProvider"
import { useSignInSession } from "../../authentication/session/useSignInSession"
import { useSignUpSession } from "../../authentication/session/useSignUpSession"
import { bearerToken } from "../../authentication/session/authStatus"
import { useFeatureFlag } from "../../hooks/useFeatureFlag"
import {
  AppPages,
  getAddProfilePath,
  createPath,
  getAddPasswordPath,
  getAuthFlowPath,
  getMyAccountPath,
  getResetPasswordPath,
  getSignInPath,
  getMyAccountSettingsPath,
  getMyAccountContactPath,
  getUpdateEmailPath,
} from "../../util/routeUtil"
import styles from "./verification-code.module.scss"
import { AUTH_FLOW, UNLEASH_FLAG } from "../../modules/constants"
import UserContext from "../../authentication/context/UserContext"
import GetHelp from "./components/GetHelp"
import VerificationCodeField from "./components/VerificationCodeField"
import {
  authorizeHousingCounselor,
  clearHousingCounselorSession,
  updateContactEmail,
} from "../../api/authApiService"
import { User } from "../../authentication/user"

interface EnterVerificationCodePageProps {
  email: string
  flow: AUTH_FLOW
  returnUrl?: string
}

// The user can send a new verification code every 30 seconds
const RESEND_CODE_MS = 30000

const isUpdateEmailFlow = (flow?: AUTH_FLOW) =>
  flow === AUTH_FLOW.UPDATE_LOGIN_EMAIL || flow === AUTH_FLOW.UPDATE_CONTACT_EMAIL

const remainingResendSeconds = (expiresAt: number) =>
  Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000))

const EnterVerificationCodePage = ({
  email,
  flow,
  housingCounselorToken,
  returnUrl = getMyAccountPath(),
}: EnterVerificationCodePageProps & { housingCounselorToken?: string | null }) => {
  const navigate = useNavigate()
  const signInSession = useSignInSession()
  const signUpSession = useSignUpSession()
  const isForgotPasswordFlow = flow === AUTH_FLOW.FORGOT_PASSWORD
  const { getCredentials } = useAuthSession()
  const isLoaded = flow === AUTH_FLOW.CREATE_ACCOUNT ? !signUpSession.isBusy : !signInSession.isBusy
  const [resendExpiresAt, setResendExpiresAt] = useState(() => Date.now() + RESEND_CODE_MS)
  const [resendSeconds, setResendSeconds] = useState(RESEND_CODE_MS / 1000)
  const [isResending, setIsResending] = useState(false)
  const { user } = useSignUpSession()
  const { profile, saveProfile } = useContext(UserContext)

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<{ code: string }>({
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    shouldFocusError: false,
  })

  // Display a live countdown each second (1000 milliseconds) remaining
  useEffect(() => {
    if (remainingResendSeconds(resendExpiresAt) <= 0) return
    let timeoutId: number
    const tick = () => {
      const remaining = remainingResendSeconds(resendExpiresAt)
      setResendSeconds(remaining)
      if (remaining > 0) {
        timeoutId = window.setTimeout(tick, 1000)
      }
    }
    timeoutId = window.setTimeout(tick, 1000)
    return () => window.clearTimeout(timeoutId)
  }, [resendExpiresAt])

  const editEmailHref = getAuthFlowPath(flow)

  const transferToCreateAccount = async () => {
    const { error, notReady } = await signUpSession.transferFromSignIn()
    if (notReady) return
    if (error) {
      setError("code", { message: "invalid" })
      return
    }

    await signUpSession.activateSession(getAddPasswordPath(), { flow: AUTH_FLOW.CREATE_ACCOUNT })
  }

  const verifySignInCode = async (code: string) => {
    if (signInSession.isBusy) return

    const { error, notReady, needsSignUp } = await signInSession.verifyEmailCode(code)
    if (notReady) return
    if (needsSignUp) {
      void transferToCreateAccount()
      return
    }

    if (error) {
      setError("code", { message: "invalid" })
      return
    }

    let destination = returnUrl
    if (housingCounselorToken) {
      const sessionToken = bearerToken(await getCredentials())
      if (!sessionToken) {
        setError("code", { message: "invalid" })
        return
      }
      try {
        await authorizeHousingCounselor(housingCounselorToken, sessionToken)
        console.log(
          "TODO: Housing counselor successfully authenticated, TBD banner and applicant view"
        )
      } catch {
        // Keep the user signed in, but flag that they don't have access to this account.
        destination = createPath(returnUrl, { hcAccess: "0" })
      }
    } else {
      // A normal sign-in (no delegate link) should always land the user in
      // their own account, never resuming a stale delegated session from
      // earlier in this browser.
      await clearHousingCounselorSession()
    }

    await signInSession.activateSession(destination)
  }

  const verifySignUpCode = async (code: string) => {
    const { error, notReady } = await signUpSession.verifyEmailCode(code)
    if (notReady) return
    if (error) {
      setError("code", { message: "invalid" })
      return
    }

    await signUpSession.activateSession(getAddPasswordPath(), { flow })
  }

  const verifyForgotPasswordCode = async (code: string) => {
    const { error } = await signInSession.verifyPasswordResetCode(code)
    if (error) return

    void navigate(getResetPasswordPath(), { state: { email, flow, code } })
  }

  const findPendingEmailAddress = () => {
    const primaryEmailId = user?.primaryEmailAddressId
    if (!user || !primaryEmailId) return undefined
    return user.emailAddresses.find(
      (address) =>
        address.id !== primaryEmailId && address.emailAddress.toLowerCase() === email.toLowerCase()
    )
  }

  const verifyUpdateLoginEmailCode = async (code: string) => {
    const emailAddress = findPendingEmailAddress()
    if (!user || !emailAddress) {
      console.error("Update login email: missing required data")
      void navigate(getUpdateEmailPath(), { state: { flow, saveFailed: true } })
      return
    }

    try {
      const verifiedEmail = await emailAddress.attemptVerification({ code })
      if (verifiedEmail.verification.status !== "verified") {
        setError("code", { message: "invalid" })
        return
      }
      const previousEmailAddress = user.primaryEmailAddress
      await user.update({ primaryEmailAddressId: verifiedEmail.id })
      if (previousEmailAddress && previousEmailAddress.id !== verifiedEmail.id) {
        try {
          await previousEmailAddress.destroy()
        } catch (error) {
          // TODO: There is a possibility the primary email can be updated but this destroy
          // can fail. The old address is still attached to the user in the Clerk DB and would
          // require cleanup.
          // https://github.com/SFDigitalServices/sf-dahlia-web/pull/3078#discussion_r4104585451
          console.error(
            "Update login email: failed to remove previous primary email address",
            error
          )
        }
      }
      void navigate(getMyAccountSettingsPath(), { state: { emailChanged: true } })
    } catch (error) {
      console.error("Update login email: verification failed", error)
      setError("code", { message: "invalid" })
    }
  }

  const updateSalesforceContactEmail = async (currentProfile: User, contactEmail: string) => {
    const sessionToken = bearerToken(await getCredentials())
    if (!sessionToken) throw new Error("Missing Clerk session token")
    return updateContactEmail(
      { ...currentProfile, email: contactEmail },
      { clerkEnabled: true, sessionToken }
    )
  }
  // Clerk is only used to verify ownership.
  // The address is verified, saved to Salesforce, then removed from Clerk
  const verifyUpdateContactEmailCode = async (code: string) => {
    const emailAddress = findPendingEmailAddress()
    if (!user || !emailAddress || !profile) {
      console.error("Update contact email: missing required data")
      void navigate(getUpdateEmailPath(), { state: { flow, saveFailed: true } })
      return
    }

    const verifiedEmail = await emailAddress.attemptVerification({ code }).catch((error) => {
      if (error?.errors?.[0]?.code !== "form_code_incorrect") {
        console.error("Update contact email: verification failed", error)
      }
      setError("code", { message: "invalid" })
      return null
    })
    if (!verifiedEmail) return

    if (verifiedEmail.verification.status !== "verified") {
      setError("code", { message: "invalid" })
      return
    }

    let updatedProfile: User | null = null
    try {
      updatedProfile = await updateSalesforceContactEmail(profile, email)
    } catch (error) {
      console.error("Update contact email: Salesforce update failed", error)
    }
    if (verifiedEmail.id !== user.primaryEmailAddressId) {
      // TODO: There is a rare possibility the destroy may fail and create a stale address
      // The address is attached to the user in the Clerk DB and would
      // require cleanup.
      // https://github.com/SFDigitalServices/sf-dahlia-web/pull/3078#discussion_r4104585451
      await verifiedEmail
        .destroy()
        .catch((error) =>
          console.error("Update contact email: failed to remove temporary address", error)
        )
    }

    if (!updatedProfile) {
      void navigate(getUpdateEmailPath(), { state: { flow, saveFailed: true } })
      return
    }

    saveProfile?.(updatedProfile)
    void navigate(getMyAccountContactPath(), { state: { contactEmailChanged: true } })
  }

  const verifyAuthCodeByFlow: Record<AUTH_FLOW, (code: string) => Promise<void>> = {
    [AUTH_FLOW.SIGN_IN]: verifySignInCode,
    [AUTH_FLOW.CREATE_ACCOUNT]: verifySignUpCode,
    [AUTH_FLOW.FORGOT_PASSWORD]: verifyForgotPasswordCode,
    [AUTH_FLOW.UPDATE_LOGIN_EMAIL]: verifyUpdateLoginEmailCode,
    [AUTH_FLOW.UPDATE_CONTACT_EMAIL]: verifyUpdateContactEmailCode,
    [AUTH_FLOW.REVERIFICATION]: verifyUpdateContactEmailCode,
  }

  const onSubmit = async ({ code }: { code: string }) => verifyAuthCodeByFlow[flow](code)

  const resendSignInCode = async (): Promise<boolean> => {
    const { error } = await signInSession.resendEmailCode()
    if (error) {
      return false
    }

    return true
  }

  const resendSignUpCode = async (): Promise<boolean> => {
    const { error } = await signUpSession.resendEmailCode()
    if (error) {
      return false
    }

    return true
  }

  const resendForgotPasswordCode = async (): Promise<boolean> => {
    const { error } = await signInSession.resendPasswordResetCode()
    if (error) {
      return false
    }

    return true
  }

  const resendPendingEmailCode = async (): Promise<boolean> => {
    const emailAddress = findPendingEmailAddress()

    if (!emailAddress) {
      console.error("Resend update email code error: address not found")
      return false
    }

    try {
      await emailAddress.prepareVerification({ strategy: "email_code" })
      return true
    } catch (error) {
      console.error("Resend update email code error:", error)
      return false
    }
  }

  const resendCodeByFlow: Record<AUTH_FLOW, () => Promise<boolean>> = {
    [AUTH_FLOW.SIGN_IN]: resendSignInCode,
    [AUTH_FLOW.CREATE_ACCOUNT]: resendSignUpCode,
    [AUTH_FLOW.FORGOT_PASSWORD]: resendForgotPasswordCode,
    [AUTH_FLOW.UPDATE_LOGIN_EMAIL]: resendPendingEmailCode,
    [AUTH_FLOW.UPDATE_CONTACT_EMAIL]: resendPendingEmailCode,
    [AUTH_FLOW.REVERIFICATION]: resendPendingEmailCode,
  }

  const onResend = async () => {
    if (isResending || resendSeconds > 0) return
    setIsResending(true)
    try {
      const sent = await resendCodeByFlow[flow]()
      if (sent) {
        setResendExpiresAt(Date.now() + RESEND_CODE_MS)
        setResendSeconds(RESEND_CODE_MS / 1000)
      }
    } finally {
      setIsResending(false)
    }
  }

  return (
    <AuthLayout title={t("createAccount.enterCode")}>
      <Card.Section divider="flush">
        <Heading priority={1} size="2xl">
          {t("createAccount.checkEmail")}
        </Heading>
        <p className={styles.sentTo}>
          {t("createAccount.weSentCodeTo")}
          <br />
          <span className={styles.email}>{email}</span>
          <Button
            className={styles.editEmail}
            variant="text"
            size="sm"
            type="button"
            onClick={() => {
              void navigate(
                editEmailHref,
                isUpdateEmailFlow(flow) ? { state: { flow } } : undefined
              )
            }}
          >
            {t("createAccount.editEmail")}
          </Button>
        </p>
        {isForgotPasswordFlow && (
          <p className={styles["forgotPasswordDescription"]}>{t("signIn.forgotPasswordCode")}</p>
        )}
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="code"
            control={control}
            defaultValue=""
            rules={{ validate: (code: string) => /^\d{6}$/.test(code) }}
            render={({ value, onChange }) => (
              <VerificationCodeField value={value} onChange={onChange} error={!!errors.code} />
            )}
          />
          <Button
            className={styles.confirmButton}
            variant="primary"
            size="sm"
            type="submit"
            disabled={!isLoaded}
          >
            {t("createAccount.confirmCode")}
          </Button>
        </Form>
        <div className={styles.resendSection}>
          <p className={styles.resendRow}>
            <span>{t("createAccount.didntGetEmail")}</span>
            <span aria-live="polite">
              {resendSeconds > 0 ? (
                <span className={styles.emailSent}>
                  <FontAwesomeIcon icon={faCheck} />
                  {t("createAccount.emailSent")}
                </span>
              ) : (
                <Button
                  className={styles.sendAgain}
                  variant="text"
                  size="sm"
                  disabled={isResending}
                  onClick={() => {
                    void onResend()
                  }}
                >
                  {t("createAccount.sendAgain")}
                </Button>
              )}
            </span>
          </p>
          {resendSeconds > 0 && (
            <p className={styles.resendNote}>
              {t("createAccount.sendAgainIn", { smart_count: resendSeconds })}
            </p>
          )}
        </div>
        <ExpandableContent
          className={styles.howToUseCode}
          order={Order.below}
          strings={{
            readMore: t("createAccount.howToUseCode"),
            readLess: t("createAccount.howToUseCode"),
          }}
        >
          <span className={styles.howToContent}>
            <ol className={styles.howToList}>
              <li>{t("createAccount.howTo.p1")}</li>
              <li>{t("createAccount.howTo.p2")}</li>
              <li>{t("createAccount.howTo.p3")}</li>
              <li>{t("createAccount.howTo.p4")}</li>
            </ol>
            <p>{t("createAccount.howTo.p5")}</p>
          </span>
        </ExpandableContent>
      </Card.Section>
      <GetHelp flow={flow} />
    </AuthLayout>
  )
}

// TODO: this wrapper component handles auth status and redirects, we should have a better name
const EnterVerificationCode = (_props: { assetPaths: unknown }) => {
  const navigate = useNavigate()
  const { unleashFlag: clerkEnabled, flagsReady } = useFeatureFlag(UNLEASH_FLAG.CLERK_AUTH, false)

  const { status } = useAuthSession()
  const { profile, profileMissing } = useContext(UserContext)
  const isSignedIn = status.kind === "signedIn"
  const loadingProfile = isSignedIn && !profileMissing && !profile

  const { state: reactRouterState } = useLocation()
  const verificationCodeEmailAddress = reactRouterState?.verificationCodeEmailAddress
  const flow: AUTH_FLOW = reactRouterState?.flow
  const fallbackPath = flow ? getAuthFlowPath(flow) : getSignInPath()
  const isSignedInUpdateFlow = isUpdateEmailFlow(flow)

  // user may transition from signedOut to signedIn on this page
  // keep track of the initial status of the user when they first visited the page
  const [initialSessionKind, setInitialSessionKind] = useState<"signedIn" | "signedOut" | null>(
    null
  )

  useEffect(() => {
    if (!flagsReady || status.kind === "initializing" || initialSessionKind) return
    setInitialSessionKind(status.kind)
  }, [flagsReady, status.kind, initialSessionKind])

  useEffect(() => {
    if (!flagsReady) return
    if (!clerkEnabled) {
      void navigate(getSignInPath())
      return
    }
    if (status.kind === "initializing" || loadingProfile) return
    if (!verificationCodeEmailAddress || !flow) {
      void navigate(fallbackPath)
      return
    }
    const arrivedSignedIn = initialSessionKind === "signedIn"
    console.log({ flow })
    if (!isSignedInUpdateFlow && arrivedSignedIn && isSignedIn && profile) {
      void navigate(getMyAccountPath(), { state: { flow } })
      return
    }
    if (!isSignedInUpdateFlow && arrivedSignedIn && isSignedIn && !profile) {
      void navigate(getAddProfilePath(), { state: { flow } })
      return
    }
  }, [
    flagsReady,
    clerkEnabled,
    status.kind,
    loadingProfile,
    flow,
    verificationCodeEmailAddress,
    isSignedIn,
    initialSessionKind,
    profile,
    navigate,
    fallbackPath,
    isSignedInUpdateFlow,
  ])

  const ready =
    flagsReady &&
    clerkEnabled &&
    status.kind !== "initializing" &&
    !loadingProfile &&
    !!flow &&
    (isSignedInUpdateFlow ? isSignedIn : status.kind === "signedOut") &&
    !!verificationCodeEmailAddress

  if (!ready) {
    return null
  }

  return (
    <EnterVerificationCodePage
      email={verificationCodeEmailAddress}
      flow={flow}
      housingCounselorToken={reactRouterState?.housingCounselorToken}
      returnUrl={reactRouterState?.returnUrl}
    />
  )
}

export default withAppSetup(EnterVerificationCode, {
  useFormTimeout: true,
  pageName: AppPages.EnterVerificationCode,
})
