/* eslint-disable @typescript-eslint/unbound-method */
import { Form, t } from "@bloom-housing/ui-components"
import { Button, Card, Heading, LoadingState } from "@bloom-housing/ui-seeds"
import { useSession } from "@clerk/react"
import React, { useCallback, useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router"
import AuthLayout from "../../layouts/AuthLayout"
import withAppSetup from "../../layouts/withAppSetup"
import { AUTH_FLOW, UNLEASH_FLAG } from "../../modules/constants"
import {
  AppPages,
  getMyAccountSettingsPath,
  getReverificationCodePath,
  getSignInPath,
} from "../../util/routeUtil"
import { toReverificationFlow, reverificationDestinations } from "../../util/accountUtil"
import EmailFieldset from "./components/EmailFieldset"
import { useForm } from "react-hook-form"
import { useSignUpSession } from "../../authentication/session/useSignUpSession"
import PasswordFieldset, {
  handleClerkPasswordErrors,
  passwordFieldsetErrors,
  passwordSortOrder,
} from "./components/PasswordFieldset"
import styles from "./reverification.module.scss"
import { ErrorSummaryBanner } from "./components/ErrorSummaryBanner"
import { getErrorMessage } from "./components/util"
import { useAuthSession } from "../../authentication/session/AuthSessionProvider"
import { useFeatureFlag } from "../../hooks/useFeatureFlag"

type ReverificationView = "verificationCode" | "password"

const ReverificationPage = () => {
  const {
    register,
    setError,
    handleSubmit,
    watch,
    clearErrors,
    formState: { errors },
  } = useForm({ mode: "onSubmit", shouldFocusError: false })
  const navigate = useNavigate()
  const { session } = useSession()
  const { user } = useSignUpSession()
  const [searchParams] = useSearchParams()
  const [view, setView] = useState<ReverificationView | null>("verificationCode")
  const flow = toReverificationFlow(searchParams.get("flow"))
  const userHasPassword = user?.passwordEnabled ?? false
  const email = user?.primaryEmailAddress?.emailAddress

  const goToReverificationDestination = useCallback(() => {
    if (!flow) return
    const destination = reverificationDestinations[flow]
    void navigate(destination.path(), { replace: true, state: destination.state })
  }, [flow, navigate])

  const onSubmitCode = async () => {
    if (!session || !flow || !email) return
    try {
      const verification = await session.startVerification({ level: "first_factor" })
      const emailFactor = verification.supportedFirstFactors?.find(
        (factor) => factor.strategy === "email_code"
      )
      if (!emailFactor) {
        // TODO: DAH-4369 Log error if Clerk fails during reverification
        console.error("Reverification: email code factor not available")
        void navigate(getMyAccountSettingsPath(), { state: { reverificationFailed: true } })
        return
      }

      await session.prepareFirstFactorVerification({
        strategy: "email_code",
        emailAddressId: emailFactor.emailAddressId,
      })
      void navigate(getReverificationCodePath(), {
        state: {
          verificationCodeEmailAddress: email,
          flow: AUTH_FLOW.REVERIFICATION,
          returnToAuthFlow: flow,
        },
      })
    } catch (error) {
      // TODO: DAH-4369 Log error if Clerk fails during reverification
      console.error("Reverification: failed to send code", error)
      void navigate(getMyAccountSettingsPath(), { state: { reverificationFailed: true } })
    }
  }

  const onSubmitPassword = async ({ password }: { password: string }) => {
    if (!session || !flow || !email) return
    try {
      await session.startVerification({ level: "first_factor" })
      await session.attemptFirstFactorVerification({ strategy: "password", password })
      goToReverificationDestination()
    } catch (error) {
      console.error("Reverification: password verification failed", error)
      setError(...handleClerkPasswordErrors(error))
    }
  }

  const verificationCodeSection = (
    <>
      <Form onSubmit={handleSubmit(onSubmitCode)}>
        <EmailFieldset
          register={register}
          errors={errors}
          defaultEmail={email}
          note={t("signIn.codeDescription")}
          disabled
        />
        <Button variant="primary" size="sm" type="submit" className={styles["submitButton"]}>
          {t("createAccount.getCode")}
        </Button>
      </Form>
      {userHasPassword && (
        <Button
          variant="text"
          size="md"
          type="button"
          onClick={() => {
            clearErrors()
            setView("password")
          }}
        >
          {t("signIn.passwordInstead")}
        </Button>
      )}
    </>
  )

  const passwordSection = (
    <>
      <ErrorSummaryBanner
        errors={errors}
        sortOrder={passwordSortOrder}
        messageMap={(messageKey) => getErrorMessage(messageKey, passwordFieldsetErrors, true)}
      />
      <Form onSubmit={handleSubmit(onSubmitPassword)}>
        <EmailFieldset register={register} errors={errors} defaultEmail={email} disabled />
        <PasswordFieldset
          register={register}
          errors={errors}
          watch={watch}
          labelText={t("label.password")}
          passwordType="signIn"
          submitWithEnterKey
        />
        <Button variant="primary" size="sm" type="submit" className={styles["submitButton"]}>
          {t("label.signIn")}
        </Button>
      </Form>
      <Button
        variant="text"
        size="md"
        type="button"
        onClick={() => {
          clearErrors()
          setView("verificationCode")
        }}
      >
        {t("signIn.oneTimeCode")}
      </Button>
      <p className={`field-note ${styles.oneTimeCodeNote}`}>{t("signIn.oneTimeCodeNote")}</p>
    </>
  )

  return (
    <AuthLayout title={t("accountSettings.reverification.signIn")}>
      <Card.Section divider="flush">
        <Heading priority={1} size="2xl" className={styles["reverificationHeader"]}>
          {t("accountSettings.reverification.signIn")}
        </Heading>
        <p className={`field-note ${styles.reverificationDescription}`}>
          {t("accountSettings.reverification.description")}
        </p>
        <LoadingState loading={!view}>
          {view === "verificationCode" ? verificationCodeSection : passwordSection}
        </LoadingState>
      </Card.Section>
    </AuthLayout>
  )
}

const Reverification = (_props: { assetPaths: unknown }) => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const authFlow = toReverificationFlow(searchParams.get("flow"))
  const { status } = useAuthSession()
  const isLoaded = status.kind !== "initializing"
  const isSignedIn = status.kind === "signedIn"
  const { unleashFlag: clerkEnabled, flagsReady } = useFeatureFlag(UNLEASH_FLAG.CLERK_AUTH, false)

  useEffect(() => {
    if (!flagsReady) return
    if (!clerkEnabled) {
      void navigate(getSignInPath(), { replace: true })
      return
    }
    if (!isLoaded) return
    if (!isSignedIn) {
      void navigate(getSignInPath(), { replace: true })
      return
    }
    if (!authFlow) {
      void navigate(getMyAccountSettingsPath(), { replace: true })
      return
    }
  }, [flagsReady, clerkEnabled, isLoaded, isSignedIn, navigate, authFlow])

  const ready = flagsReady && clerkEnabled && isLoaded && isSignedIn

  if (!ready) {
    return null
  }

  return <ReverificationPage />
}

export default withAppSetup(Reverification, {
  useFormTimeout: true,
  pageName: AppPages.Reverification,
})
