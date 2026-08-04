/* eslint-disable @typescript-eslint/unbound-method */
import React, { useEffect } from "react"
import { useLocation, useNavigate } from "react-router"
import { useSignUp } from "@clerk/clerk-react"
import { ExpandableContent, Field, Form, Order, t } from "@bloom-housing/ui-components"
import { Card, Heading, Link, Button } from "@bloom-housing/ui-seeds"
import { useForm } from "react-hook-form"
import withAppSetup from "../../layouts/withAppSetup"
import Layout from "../../layouts/Layout"
import { AppPages, getCreateAccountPath, getSignInPath } from "../../util/routeUtil"
import styles from "./enter-code.module.scss"
import { useFeatureFlag } from "../../hooks/useFeatureFlag"
import { UNLEASH_FLAG } from "../../modules/constants"
import GetHelp from "./components/GetHelp"

type EnterCodeFlow = "signIn" | "createAccount"

interface EnterCodePageProps {
  email: string
  flow: EnterCodeFlow
  onEditEmail?: () => void
}

const EnterCodePage = ({ email, flow, onEditEmail }: EnterCodePageProps) => {
  const { isLoaded } = useSignUp()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ code: string }>({ mode: "onChange", shouldFocusError: false })

  const editEmailHref = flow === "signIn" ? getSignInPath() : getCreateAccountPath()

  const onSubmit = ({ code }: { code: string }) => {
    if (!isLoaded) return
    try {
      console.log("TODO: code submitted", code)
    } catch (error) {
      console.error("Code verification error", error)
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
                {t("createAccount.weSentCodeTo")} <span className={styles.email}>{email}</span>
                {onEditEmail ? (
                  <Button
                    className={styles.editEmail}
                    variant="text"
                    size="md"
                    onClick={onEditEmail}
                  >
                    {t("createAccount.editEmail")}
                  </Button>
                ) : (
                  <Link className={styles.editEmail} href={editEmailHref}>
                    {t("createAccount.editEmail")}
                  </Link>
                )}
              </p>
              <Form onSubmit={handleSubmit(onSubmit)}>
                <Field
                  name="code"
                  label={t("createAccount.enterCode")}
                  validation={{ required: true }}
                  error={!!errors.code}
                  errorMessage={t("createAccount.enterCode")}
                  register={register}
                  labelClassName={styles.codeField}
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
                    console.log("TODO: resend code")
                  }}
                >
                  {t("createAccount.sendAgain")}
                </Button>
              </p>
              <ExpandableContent
                order={Order.below}
                className={styles.howToUseCode}
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
  const { state } = useLocation()
  const email = state?.email || "todo@email.com"
  const { unleashFlag: clerkEnabled } = useFeatureFlag(UNLEASH_FLAG.CLERK_AUTH, false)

  useEffect(() => {
    if (!email || !clerkEnabled) {
      void navigate(getCreateAccountPath())
    }
  }, [email, clerkEnabled, navigate])

  if (!clerkEnabled) {
    return null
  }

  return <EnterCodePage email={email} flow="createAccount" />
}

export { EnterCodePage }
export default withAppSetup(EnterCode, {
  useFormTimeout: true,
  pageName: AppPages.EnterCode,
})
