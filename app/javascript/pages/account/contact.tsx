/* eslint-disable @typescript-eslint/unbound-method */
import React, { useContext, useState } from "react"
import { Form, t } from "@bloom-housing/ui-components"
import { Message, Link, Card, Heading, Button } from "@bloom-housing/ui-seeds"
import Layout from "../../layouts/Layout"
import AccountLayout from "../../layouts/AccountLayout"
import withAppSetup from "../../layouts/withAppSetup"
import {
  AppPages,
  getMyAccountPath,
  getMyAccountSettingsPath,
  RedirectType,
} from "../../util/routeUtil"
import { withAuthentication } from "../../authentication/withAuthentication"
import { ConfigContext } from "../../lib/ConfigContext"
import styles from "./contact.module.scss"
import UserContext from "../../authentication/context/UserContext"
import { User } from "../../authentication/user"
import { renderInlineMarkup } from "../../util/languageUtil"
import { FormProvider, useForm } from "react-hook-form"
import PhoneFieldset, { phoneFieldsetErrors } from "./components/PhoneFieldset"
import { updatePhone } from "../../api/authApiService"
import { ErrorSummaryBanner } from "./components/ErrorSummaryBanner"
import { getErrorMessage } from "./components/util"

const getPhoneDefaultValues = (profile: User) => ({
  phone: profile.phone,
  phoneType: profile.phoneType,
  noPhone: !profile.phone,
  additionalPhoneCheckbox: !!profile.alternatePhone,
  additionalPhone: profile.alternatePhone,
  additionalPhoneType: profile.alternatePhoneType,
})

const ContactPhoneForm = ({
  profile,
  saveProfile,
}: {
  profile: User
  saveProfile: (profile: User) => void
}) => {
  const [showSaveBanner, setShowSaveBanner] = useState(false)
  const [loading, setLoading] = useState(false)
  const formMethods = useForm({
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: false,
    defaultValues: getPhoneDefaultValues(profile),
  })
  const {
    handleSubmit,
    formState: { errors },
  } = formMethods

  const onSubmit = async (data: Record<string, string>) => {
    setLoading(true)
    try {
      const updatedContact = await updatePhone({
        ...profile,
        phone: data.phone,
        phoneType: data.phoneType,
        alternatePhone: data.additionalPhone,
        alternatePhoneType: data.additionalPhoneType,
      })
      saveProfile(updatedContact)
      setShowSaveBanner(true)
    } catch (error) {
      console.error(error)
      setShowSaveBanner(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {showSaveBanner && (
        <Message variant="success">{t("accountLayout.contact.changesSaved")}</Message>
      )}
      <ErrorSummaryBanner
        errors={errors}
        messageMap={(messageKey) => getErrorMessage(messageKey, phoneFieldsetErrors, true)}
      />
      <Card.Section className={styles.phoneSection}>
        <FormProvider {...formMethods}>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <PhoneFieldset />
            <Button
              type="submit"
              variant="primary-outlined"
              className={styles.saveButton}
              size="sm"
              loadingMessage={loading ? t("accountLayout.contact.savePhone") : undefined}
            >
              {t("accountLayout.contact.savePhone")}
            </Button>
          </Form>
        </FormProvider>
      </Card.Section>
    </>
  )
}

const Contact = () => {
  const { getAssetPath } = useContext(ConfigContext)
  const { profile, saveProfile } = useContext(UserContext)
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
          <Card.Section divider="inset" className={styles.contactSection}>
            <Heading priority={2} size="md" className={styles.heading}>
              {t("label.emailAddress")}
            </Heading>
            <p className={styles.email}>{profile?.email}</p>
            <p className={styles.changeEmail}>
              {renderInlineMarkup(
                t("accountLayout.contact.changeEmail", { href: getMyAccountSettingsPath() })
              )}
            </p>
          </Card.Section>
          {profile && <ContactPhoneForm profile={profile} saveProfile={saveProfile} />}
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
