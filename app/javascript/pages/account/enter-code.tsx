/* eslint-disable @typescript-eslint/unbound-method */
import React, { useEffect } from "react"
import { useLocation, useNavigate } from "react-router"
import { useSignUp } from "@clerk/clerk-react"
import { ExpandableContent, Field, Form, Order, t } from "@bloom-housing/ui-components"
import { Card, Heading, Link, Button } from "@bloom-housing/ui-seeds"
import { useForm } from "react-hook-form"
import withAppSetup from "../../layouts/withAppSetup"
import Layout from "../../layouts/Layout"
import { AppPages, getCreateAccountPath } from "../../util/routeUtil"
import styles from "./enter-code.module.scss"
import { useFeatureFlag } from "../../hooks/useFeatureFlag"
import { UNLEASH_FLAG } from "../../modules/constants"
import GetHelp from "./components/GetHelp"

const EnterCode = (_props: { assetPaths: unknown }) => {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { isLoaded } = useSignUp()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ code: string }>({ mode: "onTouched", shouldFocusError: false })
  const email = state?.email || "todo@email.com"
  const { unleashFlag: clerkEnabled } = useFeatureFlag(UNLEASH_FLAG.CLERK_AUTH, false)
  useEffect(() => {
    if (!email || !clerkEnabled) {
      void navigate(getCreateAccountPath())
    }
  }, [email, clerkEnabled, navigate])

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
                <Link className={styles.editEmail} href={getCreateAccountPath()}>
                  {t("createAccount.editEmail")}
                </Link>
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
                strings={{
                  readMore: t("createAccount.howToUseCode"),
                  readLess: t("createAccount.howToUseCode"),
                }}
              >
                TODO: How to use a code
              </ExpandableContent>
            </Card.Section>
            <GetHelp />
          </Card>
        </div>
      </section>
    </Layout>
  )
}

export default withAppSetup(EnterCode, {
  useFormTimeout: true,
  pageName: AppPages.EnterCode,
})
