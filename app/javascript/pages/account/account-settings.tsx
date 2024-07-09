/* eslint-disable @typescript-eslint/unbound-method */
import React, { useEffect, useState } from "react"
import withAppSetup from "../../layouts/withAppSetup"
import UserContext from "../../authentication/context/UserContext"

import { Form, DOBFieldValues, Icon, t } from "@bloom-housing/ui-components"
import { useForm } from "react-hook-form"
import { Card } from "@bloom-housing/ui-seeds"
import { getSignInPath } from "../../util/routeUtil"
import { User } from "../../authentication/user"
import Layout from "../../layouts/Layout"
import EmailField from "./EmailField"
import FormSubmitButton from "./FormSubmitButton"
import PasswordEditFieldset from "./PasswordEditFieldset"
import NameFieldset from "./NameFieldset"
import DOBFieldset from "./DOBFieldset"

const AccountSettingsHeader = () => {
  return (
    <Card.Header
      divider="flush"
      className="flex justify-center p-5 text-center w-full flex-col items-center"
    >
      <div
        className="pb-4 border-blue-500 w-min px-4 md:px-8 mb-6"
        style={{ borderBottom: "3px solid" }}
      >
        <Icon size="xlarge" className="md:hidden block" symbol="settings" />
        <Icon size="2xl" className="md:block hidden" symbol="settings" />
      </div>
      <h1 className="text-xl md:text-2xl">{t("accountSettings.title")}</h1>
      <p className="pt-6 pb-8 field-note text-sm">{t("accountSettings.description")}</p>
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
    <Form onSubmit={onSubmit}>
      {children}
      <FormSubmitButton loading={loading} label={t("label.update")} />
    </Form>
  )
}

const EmailForm = ({ user }: { user: User }) => {
  const [loading, setLoading] = useState(false)

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({ mode: "all" })

  const onSubmit = (data: { email: string }) => {
    setLoading(true)
    const { email } = data
    try {
      const newUser = {
        ...user,
        email,
      }
      console.log("Update user email:", newUser)
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.log("err =", error)
      console.warn(error)
    }
  }

  return (
    <UpdateForm onSubmit={handleSubmit(onSubmit)} loading={loading}>
      <EmailField register={register} errors={errors} defaultEmail={user?.email ?? null} />
    </UpdateForm>
  )
}

const PasswordForm = ({ user, setUser }: { user: User; setUser: React.Dispatch<User> }) => {
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
      console.error("Empty password")
      setLoading(false)
      return
    }
    try {
      const newUser = { ...user, password, oldPassword }
      setUser(newUser)
      console.log("Password updated:", password)
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.warn(error)
    }
  }

  return (
    <UpdateForm onSubmit={handleSubmit(onSubmit)} loading={loading}>
      <PasswordEditFieldset register={register} errors={errors} />
    </UpdateForm>
  )
}

const PersonalInfoForm = ({ user }: { user: User }) => {
  const [loading, setLoading] = useState(false)

  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm({ mode: "all" })

  const onSubmit = (data: {
    firstName: string
    middleName: string
    lastName: string
    dob: DOBFieldValues
  }) => {
    setLoading(true)
    const { firstName, middleName, lastName, dob } = data

    try {
      const newUser = {
        ...user,
        firstName,
        lastName,
        middleName,
        DOB: [dob.birthYear, dob.birthMonth, dob.birthDay].join("-"),
      }

      delete newUser.dateOfBirth

      console.log("Save User", newUser)

      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.error(error)
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
      />
      <div className="px-4 pb-4">
        <DOBFieldset
          required
          defaultDOB={user ? user.dateOfBirth : null}
          register={register}
          error={errors.dob}
          watch={watch}
        />
      </div>
    </UpdateForm>
  )
}

const AccountSettings = ({ profile }: { profile: User }) => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const dob = profile?.DOB
    if (dob) {
      const parts = dob.split("-")
      const birth = { birthYear: parts[0], birthMonth: parts[1], birthDay: parts[2] }
      profile.dateOfBirth = birth
    }

    setUser(profile)
  }, [profile])

  return (
    <Layout title={t("accountSettings.title")}>
      <section className="bg-gray-300 md:border-t md:border-gray-450">
        <div className="flex flex-wrap relative md:max-w-lg mx-auto md:py-8">
          <Card className="w-full">
            <AccountSettingsHeader />
            <Card.Section className="p-6" divider="inset">
              <EmailForm user={user} />
            </Card.Section>
            <Card.Section className="p-6" divider="inset">
              <PasswordForm user={user} setUser={setUser} />
            </Card.Section>
            <Card.Section className="p-6" divider="inset">
              <PersonalInfoForm user={user} />
            </Card.Section>
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
