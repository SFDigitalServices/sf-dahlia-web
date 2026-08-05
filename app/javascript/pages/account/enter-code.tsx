/* eslint-disable @typescript-eslint/unbound-method */
import React, { useEffect } from "react"
import { useLocation, useNavigate } from "react-router"
import { useSignIn, useSignUp } from "@clerk/clerk-react"
import { ExpandableContent, Form, Order, t } from "@bloom-housing/ui-components"
import { Card, Heading, Link, Button } from "@bloom-housing/ui-seeds"
import { Controller, useForm } from "react-hook-form"
import withAppSetup from "../../layouts/withAppSetup"
import Layout from "../../layouts/Layout"
import {
  AppPages,
  getAddPasswordPath,
  getCreateAccountPath,
  getMyAccountPath,
  getSignInPath,
} from "../../util/routeUtil"
import styles from "./enter-code.module.scss"
import { useFeatureFlag } from "../../hooks/useFeatureFlag"
import { UNLEASH_FLAG } from "../../modules/constants"
import GetHelp from "./components/GetHelp"
import CodeField from "./components/CodeField"

type EnterCodeFlow = "signIn" | "createAccount"

interface EnterCodePageProps {
  email: string
  flow: EnterCodeFlow
}

const EnterCodePage = ({ email, flow }: EnterCodePageProps) => {
  const navigate = useNavigate()
  const { isLoaded: signUpLoaded, signUp, setActive: setActiveSignUp } = useSignUp()
  const { isLoaded: signInLoaded, signIn, setActive: setActiveSignIn } = useSignIn()
  const isLoaded = flow === "signIn" ? signInLoaded : signUpLoaded
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

  const editEmailHref = flow === "signIn" ? getSignInPath() : getCreateAccountPath()

  const onSubmit = async ({ code }: { code: string }) => {
    if (flow === "signIn") {
      if (!signInLoaded || !signIn) return
      try {
        const completeSignIn = await signIn.attemptFirstFactor({
          strategy: "email_code",
          code,
        })
        if (completeSignIn.status === "complete") {
          await setActiveSignIn({
            session: completeSignIn.createdSessionId,
            redirectUrl: getMyAccountPath(),
          })
        } else {
          console.error("Sign in failed:", completeSignIn)
          setError("code", { message: "invalid" })
        }
      } catch (error) {
        console.error("Code verification error:", error)
        setError("code", { message: "invalid" })
      }
      return
    }

    if (!signUpLoaded || !signUp) return
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      })
      if (completeSignUp.status === "complete") {
        await setActiveSignUp({ session: completeSignUp.createdSessionId })
        void navigate(getAddPasswordPath())
      } else {
        console.error("Account creation failed:", completeSignUp)
        setError("code", { message: "invalid" })
      }
    } catch (error) {
      console.error("Code verification error:", error)
      setError("code", { message: "invalid" })
    }
  }

  const onResend = async () => {
    if (flow === "signIn") {
      if (!signInLoaded || !signIn) return
      try {
        const emailCodeFactor = (signIn.supportedFirstFactors ?? []).find(
          (factor) => factor.strategy === "email_code"
        )
        if (emailCodeFactor?.strategy !== "email_code") {
          throw new Error("Email code factor missing")
        }
        await signIn.prepareFirstFactor({
          strategy: "email_code",
          emailAddressId: emailCodeFactor.emailAddressId,
        })
      } catch (error) {
        console.error("Code resend error", error)
      }
      return
    }

    if (!signUpLoaded || !signUp) return
    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" })
    } catch (error) {
      console.error("Code resend error", error)
    }
  }

  return (
    <Layout title={t("createAccount.enterCode")}>
      <section className="bg-gray-300 md:border-t md:border-gray-450">
        <div className="flex flex-wrap relative md:max-w-lg mx-auto md:py-8">
          <Card className={styles.card}>
            <Card.Section divider="flush">
              <Heading priority={1} size="2xl">
                {t("createAccount.checkEmail")}
              </Heading>
              <p className={styles.sentTo}>
                {t("createAccount.weSentCodeTo")}
                <br />
                <span className={styles.email}>{email}</span>
                <Link className={styles.editEmail} href={editEmailHref}>
                  {t("createAccount.editEmail")}
                </Link>
              </p>
              <Form onSubmit={handleSubmit(onSubmit)}>
                <Controller
                  name="code"
                  control={control}
                  defaultValue=""
                  rules={{ validate: (code: string) => /^\d{6}$/.test(code) }}
                  render={({ value, onChange }) => (
                    <CodeField value={value} onChange={onChange} error={!!errors.code} />
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
              <p className={styles.resendRow}>
                <span className={styles.didntGetEmail}>{t("createAccount.didntGetEmail")}</span>
                <Button
                  className={styles.sendAgain}
                  variant="text"
                  size="md"
                  onClick={() => {
                    void onResend()
                  }}
                >
                  {t("createAccount.sendAgain")}
                </Button>
              </p>
              <ExpandableContent
                className={styles.howToUseCode}
                order={Order.below}
                strings={{
                  readMore: t("createAccount.howToUseCode"),
                  readLess: t("createAccount.howToUseCode"),
                }}
              >
                <div className="field-note">
                  <ol className={styles.howToList}>
                    <li>{t("createAccount.howTo.p1")}</li>
                    <li>{t("createAccount.howTo.p2")}</li>
                    <li>{t("createAccount.howTo.p3")}</li>
                    <li>{t("createAccount.howTo.p4")}</li>
                  </ol>
                  <p>{t("createAccount.howTo.p5")}</p>
                </div>
              </ExpandableContent>
            </Card.Section>
            <GetHelp flow={flow} />
          </Card>
        </div>
      </section>
    </Layout>
  )
}

const EnterCode = (_props: { assetPaths: unknown }) => {
  const navigate = useNavigate()
  const { pathname, state } = useLocation()
  const email = state?.email
  const flow: EnterCodeFlow = pathname.includes("/sign-in/code") ? "signIn" : "createAccount"
  const fallbackPath = flow === "signIn" ? getSignInPath() : getCreateAccountPath()
  const { unleashFlag: clerkEnabled } = useFeatureFlag(UNLEASH_FLAG.CLERK_AUTH, false)
  useEffect(() => {
    if (!email || !clerkEnabled) {
      void navigate(fallbackPath)
    }
  }, [email, clerkEnabled, fallbackPath, navigate])

  if (!clerkEnabled || !email) {
    return null
  }

  return <EnterCodePage email={email} flow={flow} />
}

export { EnterCodePage }
export default withAppSetup(EnterCode, {
  useFormTimeout: true,
  pageName: AppPages.EnterCode,
})
