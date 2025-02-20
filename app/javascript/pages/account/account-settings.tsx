/* eslint-disable @typescript-eslint/unbound-method */
import React, { useContext, useEffect, useState } from "react"
import withAppSetup from "../../layouts/withAppSetup"
import UserContext from "../../authentication/context/UserContext"

import { Form, DOBFieldValues, t } from "@bloom-housing/ui-components"
import { DeepMap, FieldError, useForm } from "react-hook-form"
import { Card, Alert } from "@bloom-housing/ui-seeds"
import { User } from "../../authentication/user"
import Layout from "../../layouts/Layout"
import EmailFieldset, {
  emailFieldsetErrors,
  emailSortOrder,
  handleEmailServerErrors,
} from "./components/EmailFieldset"
import FormSubmitButton from "./components/FormSubmitButton"
import PasswordFieldset, {
  handlePasswordServerErrors,
  passwordFieldsetErrors,
  passwordSortOrder,
} from "./components/PasswordFieldset"
import NameFieldset, {
  handleNameServerErrors,
  nameFieldsetErrors,
  nameSortOrder,
} from "./components/NameFieldset"
import DOBFieldset, {
  deduplicateDOBErrors,
  dobFieldsetErrors,
  dobSortOrder,
  handleDOBServerErrors,
} from "./components/DOBFieldset"
import "./styles/account.scss"
import {
  updateNameOrDOB as apiUpdateNameOrDOB,
  updateEmail,
  updatePassword,
} from "../../api/authApiService"
import { FormHeader, FormSection, getDobStringFromDobObject } from "../../util/accountUtil"
import { AxiosError } from "axios"
import { ErrorSummaryBanner } from "./components/ErrorSummaryBanner"
import { ExpandedAccountAxiosError, getErrorMessage } from "./components/util"
import { withAuthentication } from "../../authentication/withAuthentication"

const Banner = ({
  showBanner,
  className,
  message,
  onClose,
}: {
  showBanner: boolean
  className?: string
  message: string
  onClose?: () => void
}) => {
  return (
    <>
      {showBanner && (
        <span className={className}>
          <Alert fullwidth className="account-settings-banner" onClose={onClose}>
            {message}
          </Alert>
        </span>
      )}
    </>
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
      .catch((error: ExpandedAccountAxiosError) => {
        setError(...handleEmailServerErrors(error))
        setEmailBanner(false)
        setEmailUpdateBanner(false)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <>
      <Banner
        className="mt-8"
        showBanner={emailUpdateBanner}
        message={t("accountSettings.update")}
        onClose={() => setEmailUpdateBanner(false)}
      />

      <Banner
        showBanner={emailBanner}
        className="mt-8"
        message={t("accountSettings.checkYourEmail")}
        onClose={() => setEmailBanner(false)}
      />
      <ErrorSummaryBanner
        errors={errors}
        sortOrder={emailSortOrder}
        messageMap={(messageKey) => getErrorMessage(messageKey, emailFieldsetErrors, true)}
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
      .catch((error: ExpandedAccountAxiosError) => setError(...handlePasswordServerErrors(error)))
      .finally(() => {
        reset({}, { errors: true })
        setLoading(false)
      })
  }

  return (
    <>
      <Banner
        showBanner={passwordBanner}
        className="mt-8"
        message={t("accountSettings.accountChangesSaved")}
        onClose={() => setPasswordBanner(false)}
      />
      <ErrorSummaryBanner
        errors={errors}
        sortOrder={passwordSortOrder}
        messageMap={(messageKey) => getErrorMessage(messageKey, passwordFieldsetErrors, true)}
      />
      <UpdateForm onSubmit={handleSubmit(onSubmit)} loading={loading}>
        <PasswordFieldset
          register={register}
          errors={errors}
          watch={watch}
          email={user?.email}
          labelText={t("label.password")}
          passwordType="accountSettings"
        />
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

    const newUser = { ...user, ...data }

    await updateNameOrDOB(
      newUser,
      saveProfile,
      setUser,
      setLoading,
      (error: ExpandedAccountAxiosError) => {
        if (error.response?.data?.errors?.firstName) {
          setError(...handleNameServerErrors("firstName", error))
        } else if (error.response?.data?.errors?.lastName) {
          setError(...handleNameServerErrors("lastName", error))
        }
      },
      () => handleBanners("nameSavedBanner")
    )
  }

  return (
    <>
      {errors && (
        <ErrorSummaryBanner
          errors={errors}
          sortOrder={nameSortOrder}
          messageMap={(messageKey) => getErrorMessage(messageKey, nameFieldsetErrors, true)}
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
      (error: ExpandedAccountAxiosError) => {
        setError(...handleDOBServerErrors(error))
        dobServerErrorsCallback()
      },
      () => setDOBSavedBanner(true)
    )
  }

  return (
    <>
      <Banner
        showBanner={dobUpdateBanner}
        className="mt-8"
        message={t("accountSettings.update")}
        onClose={() => setDOBUpdateBanner(false)}
      />
      <Banner
        showBanner={dobSavedBanner}
        className="mt-8"
        message={t("accountSettings.accountChangesSaved")}
        onClose={() => setDOBSavedBanner(false)}
      />
      {errors && errors?.dobObject && (
        <ErrorSummaryBanner
          sortOrder={dobSortOrder}
          errors={deduplicateDOBErrors(errors.dobObject as DeepMap<DOBFieldValues, FieldError>)}
          messageMap={(messageKey) => getErrorMessage(messageKey, dobFieldsetErrors, true)}
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
            <Banner
              showBanner={nameUpdateBanner}
              message={t("accountSettings.update")}
              onClose={() => setNameUpdateBanner(false)}
            />
            <Banner
              showBanner={nameSavedBanner}
              className="mt-8"
              message={t("accountSettings.accountChangesSaved")}
              onClose={() => setNameSavedBanner(false)}
            />
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
    return null
  }

  return <AccountSettings profile={profile} />
}

export default withAppSetup(withAuthentication(AccountSettingsPage, { redirectPath: "settings" }))
