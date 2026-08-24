/* eslint-disable @typescript-eslint/unbound-method */
import React, { useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { useAuth } from "@clerk/clerk-react"
import { Form, Icon, t } from "@bloom-housing/ui-components"
import { Button, Card, Heading } from "@bloom-housing/ui-seeds"
import { DeepMap, FieldError, FieldValues, useForm } from "react-hook-form"
import withAppSetup from "../../layouts/withAppSetup"
import AuthLayout from "../../layouts/AuthLayout"
import UserContext from "../../authentication/context/UserContext"
import { AppPages, getCreateAccountPath, getMyAccountPath } from "../../util/routeUtil"
import { useFeatureFlag } from "../../hooks/useFeatureFlag"
import { AUTH_FLOW, UNLEASH_FLAG } from "../../modules/constants"
import NameFieldset, { nameSortOrder } from "./components/NameFieldset"
import DOBFieldset, {
  deduplicateDOBErrors,
  DOBFieldValues,
  dobSortOrder,
} from "./components/DOBFieldset"
import {
  ErrorSummaryBanner,
  scrollToErrorOnSubmit,
  UnifiedErrorMessageMap,
} from "./components/ErrorSummaryBanner"
import { getErrorMessage } from "./components/util"
import GetHelp from "./components/GetHelp"
import { getDobStringFromDobObject } from "../../util/accountUtil"
import { createProfile, getProfile } from "../../api/authApiService"
import sharedStyles from "./shared-styles.module.scss"
import styles from "./add-profile.module.scss"
import "./styles/account.scss"

const fieldOrder = [...nameSortOrder, ...dobSortOrder]

const modifyErrors = (errors: DeepMap<FieldValues, FieldError>) => {
  if (errors?.dobObject) {
    const dobObject: DeepMap<DOBFieldValues, FieldError> = errors.dobObject
    delete errors.dobObject
    return { ...errors, ...deduplicateDOBErrors(dobObject) }
  }
  return errors
}

const AddProfilePage = () => {
  const navigate = useNavigate()
  const { getToken } = useAuth()
  const { saveProfile } = useContext(UserContext)
  const [submitting, setSubmitting] = useState(false)
  const errorBannerRef = React.useRef<HTMLSpanElement>(null)
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm({ mode: "onTouched", shouldFocusError: false })

  const onSubmit = (values: {
    firstName: string
    middleName?: string
    lastName: string
    dobObject: DOBFieldValues
  }) => {
    setSubmitting(true)
    const contact = {
      firstName: values.firstName,
      middleName: values.middleName,
      lastName: values.lastName,
      DOB: getDobStringFromDobObject(values.dobObject),
    }

    void (async () => {
      try {
        const sessionToken = await getToken()
        if (!sessionToken) {
          throw new Error("Missing Clerk session token")
        }
        await createProfile(contact, sessionToken)
        const profile = await getProfile(sessionToken)
        saveProfile?.(profile)
        void navigate(getMyAccountPath(), { state: { accountReady: true } })
      } catch (error) {
        console.error("Add profile error:", error)
        setError("firstName", { message: "name:server:generic", shouldFocus: true })
      } finally {
        setSubmitting(false)
      }
    })()
  }

  return (
    <AuthLayout title={t("createAccount.finishSettingUp")}>
      <Card.Section divider="flush" className={sharedStyles.header}>
        <div className={sharedStyles.iconBackground}>
          <Icon size="2xl" symbol="profile" />
        </div>
        <Heading priority={1} size="2xl" className={styles.profileHeader}>
          {t("createAccount.finishSettingUp")}
        </Heading>
        <p className="field-note">{t("createAccount.profileDescription")}</p>
      </Card.Section>
      <span ref={errorBannerRef} tabIndex={-1} role="alert" aria-live="assertive">
        <ErrorSummaryBanner
          errors={modifyErrors({ ...errors })}
          messageMap={(messageKey) => getErrorMessage(messageKey, UnifiedErrorMessageMap, true)}
          sortOrder={fieldOrder}
        />
      </span>
      <Form
        onSubmit={handleSubmit(
          (values: {
            firstName: string
            middleName?: string
            lastName: string
            dobObject: DOBFieldValues
          }) => onSubmit(values),

          scrollToErrorOnSubmit(errorBannerRef)
        )}
      >
        <Card.Section divider="inset">
          <NameFieldset register={register} errors={errors} note={t("createAccount.legalName")} />
        </Card.Section>
        <Card.Section divider="inset">
          <DOBFieldset
            required
            register={register}
            error={errors.dobObject as DeepMap<DOBFieldValues, FieldError>}
            watch={watch}
            note={t("createAccount.dobNote")}
          />
          <p className={`field-note ${styles.dobExample}`}>{t("createAccount.dobExample")}</p>
          <Button size="sm" type="submit" className={styles.submitButton} disabled={submitting}>
            {t("createAccount.finish")}
          </Button>
        </Card.Section>
      </Form>
      <hr />
      <GetHelp flow={AUTH_FLOW.CREATE_ACCOUNT} />
    </AuthLayout>
  )
}

const AddProfile = (_props: { assetPaths: unknown }) => {
  const navigate = useNavigate()
  const { isLoaded, isSignedIn } = useAuth()
  const { unleashFlag: clerkEnabled } = useFeatureFlag(UNLEASH_FLAG.CLERK_AUTH, false)

  useEffect(() => {
    if (!clerkEnabled || (isLoaded && !isSignedIn)) {
      void navigate(getCreateAccountPath())
    }
  }, [clerkEnabled, isLoaded, isSignedIn, navigate])

  if (!clerkEnabled) {
    return null
  }

  return <AddProfilePage />
}

export default withAppSetup(AddProfile, {
  useFormTimeout: true,
  pageName: AppPages.AddProfile,
})
