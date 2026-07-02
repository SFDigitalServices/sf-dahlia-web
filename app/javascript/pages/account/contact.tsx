/* eslint-disable @typescript-eslint/unbound-method */
import React, { useContext, useState } from "react"
import { Form, t } from "@bloom-housing/ui-components"
import { Navigate } from "react-router"
import { Message, Link, Card, Heading, Button } from "@bloom-housing/ui-seeds"
import Layout from "../../layouts/Layout"
import AccountLayout from "../../layouts/AccountLayout"
import withAppSetup from "../../layouts/withAppSetup"
import { useFeatureFlag } from "../../hooks/useFeatureFlag"
import { UNLEASH_FLAG } from "../../modules/constants"
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
import PhoneFieldset, {
  handlePhoneServerErrors,
  phoneFieldsetErrors,
  PhoneFormValues,
} from "./components/PhoneFieldset"
import { updatePhone } from "../../api/authApiService"
import { ErrorSummaryBanner } from "./components/ErrorSummaryBanner"
import { ExpandedAccountAxiosError, getErrorMessage } from "./components/util"

const getPhoneDefaultValues = (profile: User) => ({
  phone: profile.phone ?? "",
  phoneType: profile.phoneType ?? "",
  noPhone: !profile.phone && !profile.alternatePhone,
  secondPhoneCheckbox: !!profile.alternatePhone,
  secondPhone: profile.alternatePhone ?? "",
  secondPhoneType: profile.alternatePhoneType ?? "",
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
  const formMethods = useForm<PhoneFormValues>({
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: false,
    defaultValues: getPhoneDefaultValues(profile),
  })
  const {
    handleSubmit,
    formState: { errors, isDirty },
    setError,
  } = formMethods

  // Hide the "Changes saved" banner when the user makes new changes
  React.useEffect(() => {
    if (isDirty) {
      setShowSaveBanner(false)
    }
  }, [isDirty])

  const onSubmit = async (data: PhoneFormValues) => {
    setLoading(true)
    try {
      const updatedContact = await updatePhone({
        ...profile,
        phone: data.phone,
        phoneType: data.phoneType,
        alternatePhone: data.secondPhone,
        alternatePhoneType: data.secondPhoneType,
      })
      saveProfile(updatedContact)
      formMethods.reset(data)
      setShowSaveBanner(true)
    } catch (error) {
      setError(...handlePhoneServerErrors(error as ExpandedAccountAxiosError))
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
  const { unleashFlag: accountLayoutEnabled } = useFeatureFlag(UNLEASH_FLAG.ACCOUNTS_LAYOUT, false)
  const { getAssetPath } = useContext(ConfigContext)
  const { profile, saveProfile } = useContext(UserContext)

  if (!accountLayoutEnabled) {
    return <Navigate to={getMyAccountPath()} replace />
  }

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
            <p className="field-note text-base">{t("accountLayout.contact.subtitle")}</p>
          </Card.Header>
          <Message>{t("accountLayout.contact.changeInfo")}</Message>
          <Card.Section divider="inset" className={styles.contactSection}>
            <p className={styles.contactFieldLabel}>{t("label.emailAddress")}</p>
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
