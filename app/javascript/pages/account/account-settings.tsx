/* eslint-disable @typescript-eslint/unbound-method */
import React, { useEffect, useState } from "react"
import withAppSetup from "../../layouts/withAppSetup"
import UserContext from "../../authentication/context/UserContext"

import { Form, DOBFieldValues, Icon, t } from "@bloom-housing/ui-components"
import { useForm } from "react-hook-form"
import { Card, Alert } from "@bloom-housing/ui-seeds"
import { getSignInPath } from "../../util/routeUtil"
import { User } from "../../authentication/user"
import Layout from "../../layouts/Layout"
import EmailFieldset from "./EmailFieldset"
import FormSubmitButton from "./FormSubmitButton"
import PasswordFieldset from "./PasswordFieldset"
import NameFieldset from "./NameFieldset"
import DOBFieldset from "./DOBFieldset"
import "./account-settings.scss"

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

const EmailBanner = () => {
  return (
    <Alert fullwidth className="account-settings-banner">
      {t("accountSettings.checkYourEmail")}
    </Alert>
  )
}

const AccountSettingsHeader = () => {
  return (
    <Card.Header
      divider="flush"
      className="flex justify-center pt-8 text-center w-full flex-col items-center"
    >
      <div className="pb-4 px-4 border-blue-500 w-min" style={{ borderBottom: "3px solid" }}>
        <Icon size="xlarge" className="md:hidden block" symbol="settings" />
        <Icon size="2xl" className="md:block hidden" symbol="settings" />
      </div>
      <h1 className="my-6 text-xl md:text-2xl">{t("accountSettings.title.sentenceCase")}</h1>
      <p className="pb-2 field-note text-sm">{t("accountSettings.description")}</p>
    </Card.Header>
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
    <Card.Section divider="inset">
      <Form className="py-2 px-10" data-testid="update-form" onSubmit={onSubmit}>
        {children}
        <FormSubmitButton loading={loading} label={t("label.update")} />
      </Form>
    </Card.Section>
  )
}

interface SectionProps {
  user: User
  setUser: React.Dispatch<User>
  handleBanners: (banner: string) => void
}

const EmailSection = ({ user, setUser, handleBanners }: SectionProps) => {
  const [loading, setLoading] = useState(false)

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({ mode: "all" })

  const onChange = () => {
    handleBanners("emailUpdateBanner")
  }

  const onSubmit = (data: { email: string }) => {
    setLoading(true)
    const { email } = data
    try {
      const newUser = {
        ...user,
        email,
      }
      setUser(newUser)
      handleBanners("emailBanner")
      console.log("Updated user's email:", newUser)
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.log(error)
    }
  }

  return (
    <UpdateForm onSubmit={handleSubmit(onSubmit)} loading={loading}>
      <EmailFieldset
        register={register}
        errors={errors}
        defaultEmail={user?.email ?? null}
        onChange={onChange}
      />
    </UpdateForm>
  )
}

const PasswordSection = ({ user, setUser, handleBanners }: SectionProps) => {
  const [loading, setLoading] = useState(false)

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({ mode: "all" })

  const onSubmit = (data: { password: string; oldPassword: string }) => {
    setLoading(true)
    const { password, oldPassword } = data
    if (password === "") {
      console.log("Empty password")
      setLoading(false)
      return
    }
    try {
      const newUser = { ...user, password, oldPassword }
      setUser(newUser)
      handleBanners("passwordBanner")
      console.log("Updated user's password:", newUser)
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.log(error)
    }
  }

  return (
    <UpdateForm onSubmit={handleSubmit(onSubmit)} loading={loading}>
      <PasswordFieldset register={register} errors={errors} />
    </UpdateForm>
  )
}

const NameSection = ({ user, setUser, handleBanners }: SectionProps) => {
  const [loading, setLoading] = useState(false)

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({ mode: "all" })

  const onChange = () => {
    handleBanners("nameUpdateBanner")
  }

  const onSubmit = (data: { firstName: string; middleName: string; lastName: string }) => {
    setLoading(true)
    const { firstName, middleName, lastName } = data

    try {
      const newUser = {
        ...user,
        firstName,
        lastName,
        middleName,
      }

      setUser(newUser)

      console.log("Updated user's personal info:", newUser)
      handleBanners("nameSavedBanner")
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.log(error)
    }
  }

  return (
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
  )
}

const DateOfBirthSection = ({ user, setUser, handleBanners }: SectionProps) => {
  const [loading, setLoading] = useState(false)

  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm({ mode: "all" })

  const onChange = () => {
    handleBanners("dobUpdateBanner")
  }

  const onSubmit = (data: { dobObject: DOBFieldValues }) => {
    setLoading(true)
    const { dobObject } = data

    try {
      const newUser = {
        ...user,
        DOB: [dobObject.birthYear, dobObject.birthMonth, dobObject.birthDay].join("-"),
      }

      setUser(newUser)
      handleBanners("dobSavedBanner")
      console.log("Updated user's personal info:", newUser)
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.log(error)
    }
  }

  return (
    <UpdateForm onSubmit={handleSubmit(onSubmit)} loading={loading}>
      <DOBFieldset
        required
        defaultDOB={user ? user.dobObject : null}
        register={register}
        error={errors.dob}
        watch={watch}
        onChange={onChange}
      />
    </UpdateForm>
  )
}

const AccountSettings = ({ profile }: { profile: User }) => {
  const [user, setUser] = useState(null)
  const [banners, setBanners] = useState({
    nameUpdateBanner: false,
    nameSavedBanner: false,
    dobUpdateBanner: false,
    dobSavedBanner: false,
    emailUpdateBanner: false,
    emailBanner: false,
    passwordBanner: false,
  })

  const handleBanners = (banner: string) => {
    switch (banner) {
      case "nameUpdateBanner":
        setBanners({ ...banners, nameUpdateBanner: true })
        break
      case "nameSavedBanner":
        setBanners({ ...banners, nameSavedBanner: true })
        break
      case "dobUpdateBanner":
        setBanners({ ...banners, dobUpdateBanner: true })
        break
      case "dobSavedBanner":
        setBanners({ ...banners, dobSavedBanner: true })
        break
      case "emailUpdateBanner":
        setBanners({ ...banners, emailUpdateBanner: true })
        break
      case "emailBanner":
        setBanners({ ...banners, emailBanner: true })
        break
      case "passwordBanner":
        setBanners({ ...banners, passwordBanner: true })
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
            <AccountSettingsHeader />
            {banners.nameUpdateBanner && (
              <span className="mb-8">
                <UpdateBanner />
              </span>
            )}
            {banners.nameSavedBanner && <SavedBanner />}
            <NameSection user={user} setUser={setUser} handleBanners={handleBanners} />
            {banners.dobUpdateBanner && (
              <span className="mb-8">
                <UpdateBanner />
              </span>
            )}
            {banners.dobSavedBanner && <SavedBanner />}
            <DateOfBirthSection user={user} setUser={setUser} handleBanners={handleBanners} />
            {banners.emailUpdateBanner && (
              <span className="my-8">
                <UpdateBanner />
              </span>
            )}
            {banners.emailBanner && <EmailBanner />}
            <EmailSection user={user} setUser={setUser} handleBanners={handleBanners} />
            {banners.passwordBanner && (
              <span className="mt-8">
                <SavedBanner />
              </span>
            )}
            <PasswordSection user={user} setUser={setUser} handleBanners={handleBanners} />
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
