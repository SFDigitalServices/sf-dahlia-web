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

const EmailForm = ({
  user,
  accountInfoLoading,
  setAccountInfoLoading,
}: {
  user: User
  accountInfoLoading: boolean
  setAccountInfoLoading: React.Dispatch<boolean>
}) => {
  // create forms
  const {
    register: emailRegister,
    formState: { errors: emailErrors },
    handleSubmit: emailHandleSubmit,
  } = useForm({ mode: "all" })

  const onEmailSubmit = (data: { email: string }) => {
    setAccountInfoLoading(true)
    const { email } = data
    try {
      const newUser = {
        ...user,
        email,
      }
      console.log("Update user email:", newUser)
      setAccountInfoLoading(false)
    } catch (error) {
      setAccountInfoLoading(false)
      console.log("err =", error)
      console.warn(error)
    }
  }

  return (
    <Form onSubmit={emailHandleSubmit(onEmailSubmit)}>
      <EmailField
        register={emailRegister}
        errors={emailErrors}
        defaultEmail={user?.email ?? null}
      />
      <FormSubmitButton loading={accountInfoLoading} label={t("label.update")} />
    </Form>
  )
}

const PasswordForm = ({
  accountInfoLoading,
  setAccountInfoLoading,
  user,
  setUser,
}: {
  accountInfoLoading: boolean
  setAccountInfoLoading: React.Dispatch<boolean>
  user: User
  setUser: React.Dispatch<User>
}) => {
  const {
    register: pwdRegister,
    formState: { errors: pwdErrors },
    handleSubmit: pwdHandleSubmit,
  } = useForm({ mode: "all" })

  const onPasswordSubmit = (data: { password: string; oldPassword: string }) => {
    setAccountInfoLoading(true)
    const { password, oldPassword } = data
    if (password === "") {
      console.error("Empty password")
      setAccountInfoLoading(false)
      return
    }
    try {
      const newUser = { ...user, password, oldPassword }
      setUser(newUser)
      console.log("Password updated:", password)
      setAccountInfoLoading(false)
    } catch (error) {
      setAccountInfoLoading(false)
      console.warn(error)
    }
  }

  return (
    <Form onSubmit={pwdHandleSubmit(onPasswordSubmit)}>
      <PasswordEditFieldset register={pwdRegister} errors={pwdErrors} />
      <FormSubmitButton label={t("label.update")} loading={accountInfoLoading} />
    </Form>
  )
}

const PersonalInfoForm = ({ user }: { user: User }) => {
  const [personalInfoLoading, setPersonalInfoLoading] = useState(false)

  const {
    register: personalInfoRegister,
    formState: { errors: personalInfoErrors },
    handleSubmit: personalInfoHandleSubmit,
    watch: personalInfoWatch,
  } = useForm({ mode: "all" })

  const onPersonalInfoSubmit = (data: {
    firstName: string
    middleName: string
    lastName: string
    dob: DOBFieldValues
  }) => {
    setPersonalInfoLoading(true)
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

      setPersonalInfoLoading(false)
    } catch (error) {
      setPersonalInfoLoading(false)
      console.error(error)
    }
  }

  return (
    <Form onSubmit={personalInfoHandleSubmit(onPersonalInfoSubmit)}>
      <NameFieldset
        register={personalInfoRegister}
        errors={personalInfoErrors}
        defaultFirstName={user?.firstName ?? null}
        defaultMiddleName={user?.middleName ?? null}
        defaultLastName={user?.lastName ?? null}
      />
      <div className="px-4 pb-4">
        <DOBFieldset
          required
          defaultDOB={user ? user.dateOfBirth : null}
          register={personalInfoRegister}
          error={personalInfoErrors.dob}
          watch={personalInfoWatch}
        />
      </div>
      <FormSubmitButton loading={personalInfoLoading} label={t("label.update")} />
    </Form>
  )
}

const AccountSettings = ({ profile }: { profile: User }) => {
  const [accountInfoLoading, setAccountInfoLoading] = useState(false)
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

  // handle submissions
  // TODO: update after backend update calls exist

  return (
    <Layout title={t("accountSettings.title")}>
      <section className="bg-gray-300 md:border-t md:border-gray-450">
        <div className="flex flex-wrap relative md:max-w-lg mx-auto md:py-8">
          <Card className="w-full">
            <AccountSettingsHeader />
            <Card.Section className="p-6" divider="inset">
              {/* TODO: replace with email validation component */}
              <EmailForm
                user={user}
                accountInfoLoading={accountInfoLoading}
                setAccountInfoLoading={setAccountInfoLoading}
              />
            </Card.Section>
            <Card.Section className="p-6" divider="inset">
              <PasswordForm
                user={user}
                setUser={setUser}
                accountInfoLoading={accountInfoLoading}
                setAccountInfoLoading={setAccountInfoLoading}
              />
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
