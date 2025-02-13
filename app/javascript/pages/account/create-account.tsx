/* eslint-disable @typescript-eslint/unbound-method */
import React from "react"

import { AppearanceStyleType, Button, Form, t } from "@bloom-housing/ui-components"
import { Card } from "@bloom-housing/ui-seeds"

import withAppSetup from "../../layouts/withAppSetup"
import Layout from "../../layouts/Layout"
import NameFieldset, { handleNameServerErrors, nameSortOrder } from "./components/NameFieldset"
import {
  DeepMap,
  ErrorOption,
  FieldError,
  FieldValues,
  useForm,
  UseFormMethods,
} from "react-hook-form"
import DOBFieldset, {
  deduplicateDOBErrors,
  DOBFieldValues,
  dobSortOrder,
  handleDOBServerErrors,
} from "./components/DOBFieldset"
import EmailFieldset, { emailSortOrder, handleEmailServerErrors } from "./components/EmailFieldset"
import PasswordFieldset, {
  handlePasswordServerErrors,
  passwordSortOrder,
} from "./components/PasswordFieldset"
import { FormHeader, FormSection, getDobStringFromDobObject } from "../../util/accountUtil"
import "./styles/account.scss"
import { User } from "../../authentication/user"
import { createAccount } from "../../api/authApiService"
import {
  ErrorSummaryBanner,
  scrollToErrorOnSubmit,
  UnifiedErrorMessageMap,
} from "./components/ErrorSummaryBanner"
import { ExpandedAccountAxiosError, getErrorMessage } from "./components/util"

import "./create-account.scss"
import { DataLayerEvent, useGTMDataLayer } from "../../hooks/analytics/useGTMDataLayer"
import { AppPages, getSignInPath } from "../../util/routeUtil"

interface CreateAccountProps {
  assetPaths: unknown
}

interface SectionProps {
  register: UseFormMethods["register"]
  errors?: UseFormMethods["errors"]
  watch?: UseFormMethods["watch"]
}

const CreateAccountFormSection = ({ children }: { children: React.ReactNode }) => {
  return <FormSection className="py-4 md:py-8 md:px-10">{children}</FormSection>
}

const NameSection = ({ register, errors }: SectionProps) => {
  return (
    <CreateAccountFormSection>
      <NameFieldset register={register} errors={errors} />
    </CreateAccountFormSection>
  )
}

const DateOfBirthSection = ({ register, errors, watch }: SectionProps) => {
  return (
    <CreateAccountFormSection>
      <DOBFieldset
        required
        register={register}
        error={errors.dobObject as DeepMap<DOBFieldValues, FieldError>}
        watch={watch}
        note={
          <>
            <div className="pb-2">{t("createAccount.dobExample")}</div>
            <div>{t("createAccount.dobNote")}</div>
          </>
        }
      />
    </CreateAccountFormSection>
  )
}

const EmailSection = ({ register, errors }: SectionProps) => {
  return (
    <CreateAccountFormSection>
      <EmailFieldset register={register} errors={errors} note={t("createAccount.emailNote")} />
    </CreateAccountFormSection>
  )
}

const PasswordSection = ({ register, errors, watch }: SectionProps) => {
  return (
    <CreateAccountFormSection>
      <PasswordFieldset
        register={register}
        errors={errors}
        watch={watch}
        labelText={t("label.choosePassword")}
        passwordType="createAccount"
      />
      <div className="flex justify-center pt-4">
        <Button styleType={AppearanceStyleType.primary} type="submit">
          {t("label.createAccount")}
        </Button>
      </div>
    </CreateAccountFormSection>
  )
}

const signInRedirect = () => {
  console.log("sign in redirect")
}

const CreateAccountFooter = () => {
  return (
    <Card.Section
      divider="flush"
      className="create-account-footer flex justify-center py-8 text-center w-full flex-col items-center"
    >
      <div className="pb-6">{t("createAccount.alreadyHaveAccount")}</div>
      <Button className="uppercase" type="button" onClick={signInRedirect}>
        {t("label.signIn")}
      </Button>
    </Card.Section>
  )
}

const handleCreateAccountErrors =
  (setError: (name: string, error: ErrorOption) => void) => (error: ExpandedAccountAxiosError) => {
    if (
      !error.response?.data ||
      !error.response?.data?.errors ||
      !error.response?.data?.errors?.full_messages ||
      error.response?.data?.errors?.full_messages?.length === 0
    ) {
      // In the case that we get an error that we don't understand, we will assign it to the
      // first name field since that is the first field in the form
      setError("firstName", { message: "name:server:generic", shouldFocus: true })
    }

    error.response?.data?.errors?.email && setError(...handleEmailServerErrors(error))
    error.response?.data?.errors?.password && setError(...handlePasswordServerErrors(error))
    error.response?.data?.errors?.DOB && setError(...handleDOBServerErrors(error))
    error.response?.data?.errors?.firstName &&
      setError(...handleNameServerErrors("firstName", error))
    error.response?.data?.errors?.lastName && setError(...handleNameServerErrors("lastName", error))
  }

const handleAccountCreateError = (
  error: string[],
  pushToDataLayer: (event: string, data: DataLayerEvent) => void
) => {
  const reason = (error || []).includes("Email has already been taken")
    ? "email has already been taken"
    : "generic error"
  pushToDataLayer("account_create_start_failed", {
    origin: "create account",
    reason,
  })
}

const onSubmit =
  (
    setError: (name: string, error: ErrorOption) => void,
    pushToDataLayer: (event: string, data: DataLayerEvent) => void
  ) =>
  (data) => {
    const { password, ...user } = data
    const userInfo: User = user
    user.DOB = getDobStringFromDobObject(userInfo.dobObject)
    const userData = {
      email: userInfo.email,
      password: password,
      password_confirmation: password,
    }
    const contactData = {
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      email: userInfo.email,
      DOB: userInfo.DOB,
    }
    createAccount(userData, contactData)
      .then((user) => {
        pushToDataLayer("account_create_start_succeeded", {
          origin: "create account",
          user_id: user.id,
        })
        window.sessionStorage.setItem("newAccount", userData.email)
        window.location.replace(getSignInPath())
      })
      .catch((error: ExpandedAccountAxiosError) => {
        handleAccountCreateError(error.response?.data?.errors?.full_messages, pushToDataLayer)
        handleCreateAccountErrors(setError)(error)
      })
  }

const CreateAccountContent = ({ register, watch, errors }: SectionProps) => {
  return (
    <>
      <NameSection register={register} errors={errors} />
      <DateOfBirthSection register={register} errors={errors} watch={watch} />
      <EmailSection register={register} errors={errors} />
      <PasswordSection register={register} errors={errors} watch={watch} />
    </>
  )
}

const fieldOrder = [...nameSortOrder, ...dobSortOrder, ...emailSortOrder, ...passwordSortOrder]

const modifyErrors = (errors: DeepMap<FieldValues, FieldError>) => {
  if (errors?.dobObject) {
    const dobObject: DeepMap<DOBFieldValues, FieldError> = errors.dobObject
    delete errors.dobObject
    return { ...errors, ...deduplicateDOBErrors(dobObject) }
  }
  return errors
}

const CreateAccount = (_props: CreateAccountProps) => {
  const errorBannerRef = React.useRef<HTMLSpanElement>(null)
  const { pushToDataLayer } = useGTMDataLayer()
  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
    setError,
  } = useForm({ mode: "onTouched", shouldFocusError: false })

  return (
    <Layout title={t("pageTitle.createAccount")}>
      <section className="bg-gray-300 md:border-t md:border-gray-450">
        <div className="flex flex-wrap relative md:max-w-lg mx-auto md:py-8">
          <Card className="w-full">
            <FormHeader
              title={t("createAccount.title.sentenceCase")}
              description={t("createAccount.description")}
            />
            <span ref={errorBannerRef}>
              <ErrorSummaryBanner
                errors={modifyErrors({ ...errors })}
                messageMap={(messageKey) =>
                  getErrorMessage(messageKey, UnifiedErrorMessageMap, true)
                }
                sortOrder={fieldOrder}
              />
            </span>
            <Form
              onSubmit={handleSubmit(
                onSubmit(setError, pushToDataLayer),
                scrollToErrorOnSubmit(errorBannerRef)
              )}
            >
              <CreateAccountContent register={register} watch={watch} errors={errors} />
              {/* Footer has to be in the Form because of styling */}
              <CreateAccountFooter />
            </Form>
          </Card>
        </div>
      </section>
    </Layout>
  )
}

export default withAppSetup(CreateAccount, {
  useFormTimeout: true,
  pageName: AppPages.CreateAccount,
})
