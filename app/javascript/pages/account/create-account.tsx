/* eslint-disable @typescript-eslint/unbound-method */
import React from "react"

import { AppearanceStyleType, Button, Form, t } from "@bloom-housing/ui-components"
import { Card } from "@bloom-housing/ui-seeds"

import withAppSetup from "../../layouts/withAppSetup"
import Layout from "../../layouts/Layout"
import NameFieldset, { handleNameServerErrors } from "./components/NameFieldset"
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
  handleDOBServerErrors,
} from "./components/DOBFieldset"
import EmailFieldset, { handleEmailServerErrors } from "./components/EmailFieldset"
import PasswordFieldset, { handlePasswordServerErrors } from "./components/PasswordFieldset"
import { FormHeader, FormSection, getDobStringFromDobObject } from "../../util/accountUtil"
import "./styles/account.scss"
import { User } from "../../authentication/user"
import { createAccount } from "../../api/authApiService"
import { ErrorSummaryBanner, UnifiedErrorMessageMap } from "./components/ErrorSummaryBanner"
import { getErrorMessage } from "./components/util"
import { AxiosError } from "axios"

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
      <PasswordFieldset register={register} errors={errors} watch={watch} />
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

type ExpandedAxiosError = AxiosError<{
  errors: {
    email: string[]
    password: string[]
    DOB: string[]
    full_messages: string[]
    firstName: string[]
    lastName: string[]
  }
}>

const handleCreateAccountErrors =
  (setError: (name: string, error: ErrorOption) => void) => (error: ExpandedAxiosError) => {
    if (
      !error.response?.data ||
      !error.response?.data?.errors ||
      !error.response?.data?.errors?.full_messages ||
      error.response?.data?.errors?.full_messages?.length === 0
    ) {
      // Generic Server Error, placing it on the first name since that is the first field
      setError("firstName", { message: "name:server:generic", shouldFocus: true })
    }

    if (error.response?.data?.errors?.email) {
      handleEmailServerErrors(setError)(error)
    }
    if (error.response?.data?.errors?.password) {
      handlePasswordServerErrors(setError)(error)
    }
    if (error.response?.data?.errors?.DOB) {
      handleDOBServerErrors(setError)(error)
    }
    if (error.response?.data?.errors?.firstName || error.response?.data?.errors?.lastName) {
      handleNameServerErrors(setError)(error)
    }
  }

const onSubmit = (setError: (name: string, error: ErrorOption) => void) => (data) => {
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
    .then(() => {
      // TODO: Redirect to Sign In page with modal message
      console.log("Created an account.")
    })
    .catch(handleCreateAccountErrors(setError))
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

const modifyErrors = (errors: DeepMap<FieldValues, FieldError>) => {
  if (errors?.dobObject) {
    const dobObject: DeepMap<DOBFieldValues, FieldError> = errors.dobObject
    delete errors.dobObject
    return { ...errors, ...deduplicateDOBErrors(dobObject) }
  }
  return errors
}

const CreateAccount = (_props: CreateAccountProps) => {
  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
    setError,
  } = useForm({ mode: "onTouched" })

  return (
    <Layout title={t("pageTitle.createAccount")}>
      <section className="bg-gray-300 md:border-t md:border-gray-450">
        <div className="flex flex-wrap relative md:max-w-lg mx-auto md:py-8">
          <Card className="w-full">
            <FormHeader
              title={t("createAccount.title.sentenceCase")}
              description={t("createAccount.description")}
            />
            <ErrorSummaryBanner
              errors={modifyErrors({ ...errors })}
              messageMap={(messageKey) => getErrorMessage(messageKey, UnifiedErrorMessageMap, true)}
            />
            <Form onSubmit={handleSubmit(onSubmit(setError))}>
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

export default withAppSetup(CreateAccount, true)
