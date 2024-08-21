/* eslint-disable @typescript-eslint/unbound-method */
import React, { useContext, useEffect, useState } from "react"
import withAppSetup from "../../layouts/withAppSetup"
import UserContext from "../../authentication/context/UserContext"

import { Form, DOBFieldValues, t } from "@bloom-housing/ui-components"
import { DeepMap, FieldError, FieldValues, useForm } from "react-hook-form"
import { Card, Alert } from "@bloom-housing/ui-seeds"
import { getSignInPath } from "../../util/routeUtil"
import { User } from "../../authentication/user"
import Layout from "../../layouts/Layout"
import EmailFieldset, { emailErrorsMap, handleEmailServerErrors } from "./components/EmailFieldset"
import FormSubmitButton from "./components/FormSubmitButton"
import PasswordFieldset, {
  handleServerErrors,
  passwordErrorsMap,
} from "./components/PasswordFieldset"
import NameFieldset, { handleNameServerErrors, nameErrorsMap } from "./components/NameFieldset"
import DOBFieldset, {
  deduplicateDOBErrors,
  dobErrorsMap,
  handleDOBServerErrors,
} from "./components/DOBFieldset"
import "./styles/account.scss"
import {
  updateNameOrDOB as apiUpdateNameOrDOB,
  updateEmail,
  updatePassword,
} from "../../api/authApiService"
import { FormHeader, FormSection, getDobStringFromDobObject } from "../../util/accountUtil"
import { renderInlineMarkup } from "../../util/languageUtil"
import { AxiosError } from "axios"

const SavedBanner = () => {
  return (
    <Alert fullwidth className="account-settings-banner">
      {t("accountSettings.accountChangesSaved")}
    </Alert>
  )
}

const UpdateBanner = () => {
  return (
    <Alert fullwidth className="account-settings-banner">
      {t("accountSettings.update")}
    </Alert>
  )
}

const ErrorSummaryBanner = ({
  errors,
  messageMap,
}: {
  errors: DeepMap<FieldValues, FieldError>
  messageMap?: (message: string) => string
}) => {
  if (Object.keys(errors).length === 0) {
    return null
  }

  return (
    <Alert fullwidth variant="alert" className="">
      {t("error.accountBanner.header")}
      <ul className="list-disc list-inside pl-2 pt-1">
        {Object.keys(errors).map((key: string) => {
          let fieldError = errors[key]

          if (messageMap && fieldError.message && typeof fieldError.message === "string") {
            fieldError = {
              ...fieldError,
              message: messageMap(fieldError.message as string),
            }
          }

          return fieldError && fieldError.message ? (
            <li key={key}>
              <button
                type="button"
                className="text-blue-500 cursor-pointer background-none border-none p-0 text-left"
                onClick={() => {
                  if (fieldError.ref) {
                    fieldError.ref.scrollIntoView({ behavior: "smooth" })
                    fieldError.ref.focus()
                  }
                }}
              >
                {renderInlineMarkup(fieldError.message as string)}
              </button>
            </li>
          ) : null
        })}
      </ul>
    </Alert>
  )
}

const EmailBanner = () => {
  return (
    <Alert fullwidth className="account-settings-banner">
      {t("accountSettings.checkYourEmail")}
    </Alert>
  )
}

const UpdateForm = ({
  children,
  loading,
  onSubmit,
}: {
  children: React.ReactNode
  loading: boolean
  onSubmit?: () => unknown
}) => {
  return (
    <FormSection>
      <Form className="p-2 md:py-2 md:px-10" data-testid="update-form" onSubmit={onSubmit}>
        {children}
        <FormSubmitButton loading={loading} label={t("label.update")} />
      </Form>
    </FormSection>
  )
}

interface SectionProps {
  user: User
  setUser: React.Dispatch<User>
  handleBanners?: (banner: string) => void
}

const EmailSection = ({ user, setUser }: SectionProps) => {
  const [loading, setLoading] = useState(false)
  const [emailUpdateBanner, setEmailUpdateBanner] = useState(false)
  const [emailBanner, setEmailBanner] = useState(false)

  const {
    register,
    formState: { errors },
    handleSubmit,
    setError,
  } = useForm({ mode: "onTouched" })

  const onChange = () => {
    setEmailUpdateBanner(true)
    setEmailBanner(false)
  }

  const onSubmit = (data: { email: string }) => {
    setLoading(true)
    const { email } = data

    updateEmail(email)
      .then(() => {
        const newUser = {
          ...user,
          email,
        }
        setUser(newUser)
        setEmailBanner(true)
      })
      .catch(
        handleEmailServerErrors(setError, () => {
          setEmailBanner(false)
          setEmailUpdateBanner(false)
        })
      )
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <>
      {emailUpdateBanner && (
        <span className="mt-8">
          <UpdateBanner />
        </span>
      )}
      {emailBanner && (
        <span className="mt-8">
          <EmailBanner />
        </span>
      )}
      <ErrorSummaryBanner
        errors={errors}
        messageMap={(messageKey) => emailErrorsMap(messageKey, true)}
      />
      <UpdateForm onSubmit={handleSubmit(onSubmit)} loading={loading}>
        <EmailFieldset
          register={register}
          errors={errors}
          defaultEmail={user?.email ?? null}
          onChange={onChange}
        />
      </UpdateForm>
    </>
  )
}

const PasswordSection = ({ user, setUser }: SectionProps) => {
  const [loading, setLoading] = useState(false)
  const [passwordBanner, setPasswordBanner] = useState(false)

  const {
    register,
    formState: { errors },
    handleSubmit,
    reset,
    watch,
    setError,
  } = useForm({ mode: "onTouched" })

  const onSubmit = (data: { password: string; currentPassword: string }) => {
    setLoading(true)
    const { password, currentPassword } = data
    if (password === "") {
      setLoading(false)
      return
    }

    updatePassword(password, currentPassword)
      .then(() => {
        const newUser = { ...user, password, currentPassword }
        setUser(newUser)
        setPasswordBanner(true)
      })
      .catch(handleServerErrors(setError))
      .finally(() => {
        reset({}, { errors: true })
        setLoading(false)
      })
  }

  return (
    <>
      {passwordBanner && (
        <span className="mt-8">
          <SavedBanner />
        </span>
      )}
      <ErrorSummaryBanner
        errors={errors}
        messageMap={(messageKey) => passwordErrorsMap(messageKey, true)}
      />
      <UpdateForm onSubmit={handleSubmit(onSubmit)} loading={loading}>
        <PasswordFieldset register={register} errors={errors} watch={watch} edit />
      </UpdateForm>
    </>
  )
}

const updateNameOrDOB = async (
  newUser: User,
  saveProfile: (profile: User) => void,
  setUser: React.Dispatch<User>,
  setLoading: React.Dispatch<boolean>,
  errorCallback: (error: AxiosError) => void,
  bannersCallback?: () => void
) => {
  return apiUpdateNameOrDOB(newUser)
    .then((profile) => {
      saveProfile(profile)
      setUser(newUser)
      bannersCallback()
    })
    .catch(errorCallback)
    .finally(() => {
      setLoading(false)
    })
}

const NameSection = ({ user, setUser, handleBanners }: SectionProps) => {
  const [loading, setLoading] = useState(false)
  const { saveProfile } = useContext(UserContext)

  const {
    register,
    formState: { errors },
    handleSubmit,
    setError,
  } = useForm({ mode: "onTouched" })

  const onChange = () => {
    handleBanners("nameUpdateBanner")
  }

  const onSubmit = async (data: { firstName: string; middleName: string; lastName: string }) => {
    setLoading(true)
    const { firstName, middleName, lastName } = data

    const newUser = {
      ...user,
      firstName,
      lastName,
      middleName,
    }

    await updateNameOrDOB(
      newUser,
      saveProfile,
      setUser,
      setLoading,
      handleNameServerErrors(setError),
      () => handleBanners("nameSavedBanner")
    )
  }

  return (
    <>
      {errors && (
        <ErrorSummaryBanner
          errors={errors}
          messageMap={(messageKey) => nameErrorsMap(messageKey, true)}
        />
      )}
      <UpdateForm onSubmit={handleSubmit(onSubmit)} loading={loading}>
        <NameFieldset
          register={register}
          errors={errors}
          defaultFirstName={user?.firstName ?? null}
          defaultMiddleName={user?.middleName ?? null}
          defaultLastName={user?.lastName ?? null}
          onChange={onChange}
        />
      </UpdateForm>
    </>
  )
}

const DateOfBirthSection = ({ user, setUser }: SectionProps) => {
  const [loading, setLoading] = useState(false)
  const { saveProfile } = useContext(UserContext)
  const [dobUpdateBanner, setDOBUpdateBanner] = useState(false)
  const [dobSavedBanner, setDOBSavedBanner] = useState(false)

  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
    setError,
  } = useForm({ mode: "onTouched" })

  const onChange = () => {
    setDOBUpdateBanner(true)
    setDOBSavedBanner(false)
  }

  const dobServerErrorsCallback = () => {
    setDOBSavedBanner(false)
    setDOBUpdateBanner(false)
  }

  const onSubmit = async (data: { dobObject: DOBFieldValues }) => {
    setLoading(true)
    const { dobObject } = data

    const newUser = {
      ...user,
      DOB: getDobStringFromDobObject(dobObject),
    }

    await updateNameOrDOB(
      newUser,
      saveProfile,
      setUser,
      setLoading,
      handleDOBServerErrors(setError, dobServerErrorsCallback),
      () => setDOBSavedBanner(true)
    )
  }

  return (
    <>
      {dobUpdateBanner && (
        <span className="mt-8">
          <UpdateBanner />
        </span>
      )}
      {dobSavedBanner && (
        <span className="mt-8">
          <SavedBanner />
        </span>
      )}
      {errors && errors?.dobObject && (
        <ErrorSummaryBanner
          errors={deduplicateDOBErrors(errors.dobObject as DeepMap<DOBFieldValues, FieldError>)}
          messageMap={(messageKey) => dobErrorsMap(messageKey, true)}
        />
      )}
      <UpdateForm onSubmit={handleSubmit(onSubmit)} loading={loading}>
        <DOBFieldset
          required
          defaultDOB={user ? user.dobObject : null}
          register={register}
          error={errors.dobObject}
          watch={watch}
          onChange={onChange}
        />
      </UpdateForm>
    </>
  )
}

const AccountSettings = ({ profile }: { profile: User }) => {
  const [user, setUser] = useState(null)
  const [nameUpdateBanner, setNameUpdateBanner] = useState(false)
  const [nameSavedBanner, setNameSavedBanner] = useState(false)

  const handleBanners = (banner: string) => {
    switch (banner) {
      case "nameUpdateBanner":
        setNameUpdateBanner(true)
        setNameSavedBanner(false)
        break
      case "nameSavedBanner":
        setNameSavedBanner(true)
        break
    }
  }

  useEffect(() => {
    // salesforce stores the date of birth as a string YYYY-MM-DD,
    // but we need to manipulate each value separately
    const dobString = profile?.DOB
    if (dobString) {
      const parts = dobString.split("-")
      const birth = { birthYear: parts[0], birthMonth: parts[1], birthDay: parts[2] }
      profile.dobObject = birth
    }

    setUser(profile)
  }, [profile])

  return (
    <Layout title={t("accountSettings.title")}>
      <section className="bg-gray-300 md:border-t md:border-gray-450">
        <div className="flex flex-wrap relative md:max-w-lg mx-auto md:py-8">
          <Card className="w-full pb-8">
            {nameUpdateBanner || nameSavedBanner ? (
              <FormHeader
                className={"border-none"}
                title={t("accountSettings.title.sentenceCase")}
                description={t("accountSettings.description")}
              />
            ) : (
              <FormHeader
                title={t("accountSettings.title.sentenceCase")}
                description={t("accountSettings.description")}
              />
            )}
            {nameUpdateBanner && <UpdateBanner />}
            {nameSavedBanner && (
              <span className="mt-8">
                <SavedBanner />
              </span>
            )}
            <NameSection user={user} setUser={setUser} handleBanners={handleBanners} />
            <DateOfBirthSection user={user} setUser={setUser} />
            <EmailSection user={user} setUser={setUser} />
            <PasswordSection user={user} setUser={setUser} />
          </Card>
        </div>
      </section>
    </Layout>
  )
}

const AccountSettingsPage = () => {
  const { profile, loading, initialStateLoaded } = React.useContext(UserContext)

  if (!profile && !loading && initialStateLoaded) {
    // TODO: Redirect to React sign in page and show a message that user needs to sign in
    window.location.href = getSignInPath()
    return null
  }

  return <AccountSettings profile={profile} />
}

export default withAppSetup(AccountSettingsPage)
