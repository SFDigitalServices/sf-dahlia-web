/* eslint-disable @typescript-eslint/unbound-method */
import React, { useContext } from "react"
import { Field, t } from "@bloom-housing/ui-components"
import { Message, Link, Card, Heading, Button } from "@bloom-housing/ui-seeds"
import Layout from "../../layouts/Layout"
import AccountLayout from "../../layouts/AccountLayout"
import withAppSetup from "../../layouts/withAppSetup"
import { AppPages, getMyAccountPath, RedirectType } from "../../util/routeUtil"
import { withAuthentication } from "../../authentication/withAuthentication"
import { ConfigContext } from "../../lib/ConfigContext"
import EmailFieldset from "./components/EmailFieldset"
import { useForm } from "react-hook-form"
import styles from "./contact.module.scss"

const Contact = () => {
  const { getAssetPath } = useContext(ConfigContext)
  const {
    register,
    formState: { errors },
    watch,
  } = useForm()
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
          <Message className={styles.contactMessage}>
            {t("accountLayout.contact.changeInfo")}
          </Message>
          <Card.Section divider="inset" className={styles.contactSection}>
            <EmailFieldset register={register} errors={errors} className={styles.contactField} />
            <Field
              type="checkbox"
              name="noEmail"
              label={t("label.applicantNoEmail")}
              className={styles.noEmailCheckbox}
              register={register}
            />
            <Button variant="primary-outlined" size="sm" disabled={!isSaveEmailEnabled}>
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
