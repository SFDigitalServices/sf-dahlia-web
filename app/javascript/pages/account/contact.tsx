/* eslint-disable @typescript-eslint/unbound-method */
import React, { useContext, useState } from "react"
import { Field, t } from "@bloom-housing/ui-components"
import { Message, Link, Card, Heading, Button } from "@bloom-housing/ui-seeds"
import Layout from "../../layouts/Layout"
import AccountLayout from "../../layouts/AccountLayout"
import withAppSetup from "../../layouts/withAppSetup"
import { AppPages, getMyAccountPath, RedirectType } from "../../util/routeUtil"
import { withAuthentication } from "../../authentication/withAuthentication"
import { ConfigContext } from "../../lib/ConfigContext"
import EmailFieldset, { emailFieldsetErrors, emailSortOrder } from "./components/EmailFieldset"
import { ErrorSummaryBanner } from "./components/ErrorSummaryBanner"
import { getErrorMessage } from "./components/util"
import { useForm } from "react-hook-form"
import styles from "./contact.module.scss"

const Contact = () => {
  const { getAssetPath } = useContext(ConfigContext)
  const [showSaveBanner, setShowSaveBanner] = useState(false)
  const {
    register,
    formState: { errors },
    watch,
    handleSubmit,
    clearErrors,
    setValue,
  } = useForm({ mode: "onTouched" })
  const email = watch("email", "")
  const noEmail = watch("noEmail", false)
  const isSaveEmailEnabled = noEmail || email

  return (
    <Layout>
      <AccountLayout>
        <Card className={styles.contactCard}>
          <Card.Header className={styles.header}>
            <div className={styles.iconBackground}>
              <img src={getAssetPath("contact-info.png")} alt="" className={styles.icon} />
            </div>
            <Heading priority={1} size="2xl" className={styles.heading}>
              {t("accountLayout.contact.title")}
            </Heading>
            {t("accountLayout.contact.subtitle")}
          </Card.Header>
          <Message>{t("accountLayout.contact.changeInfo")}</Message>
          {showSaveBanner && (
            <Message variant="success">{t("accountLayout.contact.changesSaved")}</Message>
          )}
          <Card.Section divider="inset" className={styles.contactSection}>
            <ErrorSummaryBanner
              errors={errors}
              sortOrder={emailSortOrder}
              messageMap={(messageKey) => getErrorMessage(messageKey, emailFieldsetErrors, true)}
            />
            <EmailFieldset
              register={register}
              errors={errors}
              className={styles.contactField}
              emailRequired={!noEmail}
            />
            <Field
              type="checkbox"
              name="noEmail"
              label={t("label.applicantNoEmail")}
              className={styles.noEmailCheckbox}
              register={register}
              onChange={(e) => {
                if (e.target.checked) {
                  setValue("email", "")
                  clearErrors("email")
                }
              }}
            />
            <Button
              variant="primary-outlined"
              size="sm"
              disabled={!isSaveEmailEnabled}
              onClick={() => {
                void handleSubmit(
                  () => setShowSaveBanner(true),
                  () => setShowSaveBanner(false)
                )()
              }}
            >
              {t("accountLayout.contact.saveEmail")}
            </Button>
          </Card.Section>
          <Card.Section className={styles.contactSection}>Phone coming soon!</Card.Section>
          <Card.Footer className={styles.footer}>
            <Link href={getMyAccountPath()}>{t("accountLayout.contact.back")}</Link>
          </Card.Footer>
        </Card>
      </AccountLayout>
    </Layout>
  )
}

export default withAppSetup(withAuthentication(Contact, { redirectType: RedirectType.Account }), {
  pageName: AppPages.Contact,
})
