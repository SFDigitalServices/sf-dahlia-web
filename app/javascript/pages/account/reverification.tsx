/* eslint-disable @typescript-eslint/unbound-method */
import { Form, t } from "@bloom-housing/ui-components"
import { Button, Card, Heading, LoadingState } from "@bloom-housing/ui-seeds"
import { useSession } from "@clerk/react"
import React, { useCallback, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router"
import AuthLayout from "../../layouts/AuthLayout"
import withAppSetup from "../../layouts/withAppSetup"
import { AUTH_FLOW } from "../../modules/constants"
import { AppPages, getVerificationCodePath } from "../../util/routeUtil"
import { isReverificationFlow, reverificationDestinations } from "../../util/accountUtil"
import EmailFieldset from "./components/EmailFieldset"
import { useForm } from "react-hook-form"
import { useSignUpSession } from "../../authentication/session/useSignUpSession"
import PasswordFieldset from "./components/PasswordFieldset"
import styles from "./reverification.module.scss"

type ReverificationView = "verificationCode" | "password"

const ReverificationPage = () => {
  const {
    register,
    watch,
    formState: { errors },
  } = useForm({ mode: "onSubmit", shouldFocusError: false })
  const navigate = useNavigate()
  const { session } = useSession()
  const { user } = useSignUpSession()
  const [searchParams] = useSearchParams()
  const [password, _setPassword] = useState("")
  const [_error, setError] = useState<string | undefined>(undefined)
  const codeSent = useRef(false)
  const [view, setView] = useState<ReverificationView | null>("verificationCode")

  const flowParam = searchParams.get("flow")
  const flow = isReverificationFlow(flowParam) ? flowParam : undefined
  const userHasPassword = user?.passwordEnabled ?? false
  const email = user?.primaryEmailAddress?.emailAddress

  const goToReverificationDestination = useCallback(() => {
    if (!flow) return
    const destination = reverificationDestinations[flow]
    void navigate(destination.path(), { replace: true, state: destination.state })
  }, [flow, navigate])

  const onSubmitCode = useCallback(async () => {
    if (!session || !flow || codeSent.current) return
    codeSent.current = true
    try {
      const verification = await session.startVerification({ level: "first_factor" })
      const emailFactor = verification.supportedFirstFactors?.find(
        (factor) => factor.strategy === "email_code"
      )
      if (!emailFactor) {
        setError("reverification:unavailable")
        return
      }
      await session.prepareFirstFactorVerification({
        strategy: "email_code",
        emailAddressId: emailFactor.emailAddressId,
      })
      void navigate(getVerificationCodePath(), {
        replace: true,
        state: {
          verificationCodeEmailAddress: emailFactor.safeIdentifier ?? email,
          flow: AUTH_FLOW.REVERIFICATION,
          reverificationFlow: flow,
        },
      })
    } catch (prepareError) {
      console.error("Reverification: failed to send code", prepareError)
      codeSent.current = false
      setError("reverification:sendFailed")
    }
  }, [session, flow, navigate, email])

  const onSubmitPassword = async () => {
    if (!session || !flow) return
    setError(undefined)
    try {
      await session.startVerification({ level: "first_factor" })
      await session.attemptFirstFactorVerification({ strategy: "password", password })
      goToReverificationDestination()
    } catch (error) {
      console.error("Reverification: password verification failed", error)
      setError("reverification:passwordIncorrect")
    }
  }

  const verificationCodeSection = (
    <>
      <Form onSubmit={onSubmitCode}>
        <EmailFieldset
          register={register}
          errors={errors}
          defaultEmail={email}
          note={t("signIn.codeDescription")}
          disabled
        />{" "}
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
            setError(undefined)
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
      <Form onSubmit={onSubmitPassword}>
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

export default withAppSetup(ReverificationPage, { pageName: AppPages.Reverification })
