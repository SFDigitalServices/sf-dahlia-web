/* eslint-disable @typescript-eslint/unbound-method */
import React, { useEffect, useState } from "react"
import withAppSetup from "../../layouts/withAppSetup"
import FormLayout from "../../layouts/FormLayout"
import UserContext from "../../authentication/context/UserContext"

import {
  Button,
  Field,
  Form,
  AlertTypes,
  DOBFieldValues,
  AlertBox,
  UniversalIconType,
  Icon,
  t,
  emailRegex,
} from "@bloom-housing/ui-components"
import { useForm } from "react-hook-form"
import { Card } from "@bloom-housing/ui-seeds"
import { getSignInPath } from "../../util/routeUtil"
import { User } from "../../authentication/user"
import NameFieldset from "./NameFieldset"
import DOBFieldset from "./DOBFieldset"
import PasswordEditFieldset from "./PasswordEditFieldset"

type AlertMessage = {
  type: AlertTypes
  message: string
}

const AccountSettingsHeader = ({
  title,
  icon,
  description,
}: {
  title: string
  description: string
  icon: UniversalIconType
}) => {
  return (
    <Card.Header
      divider="flush"
      className="flex justify-center p-5 text-center w-full flex-col items-center"
    >
      <div
        className="pb-4 border-blue-500 w-min px-4 md:px-8 mb-6"
        style={{ borderBottom: "3px solid" }}
      >
        <Icon size="xlarge" className="md:hidden block" symbol={icon} />
        <Icon size="2xl" className="md:block hidden" symbol={icon} />
      </div>
      <h1 className="text-xl md:text-2xl">{title}</h1>
      <p className="pt-6 pb-8 field-note text-sm">{description}</p>
    </Card.Header>
  )
}

const AccountSettings = ({ profile }: { profile: User }) => {
  const [accountInfoAlert, setAccountInfoAlert] = useState<AlertMessage>()
  const [accountInfoLoading, setAccountInfoLoading] = useState(false)
  const [personalInfoAlert, setPersonalInfoAlert] = useState<AlertMessage>()
  const [personalInfoLoading, setPersonalInfoLoading] = useState(false)
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

  // create forms
  const {
    register: emailRegister,
    formState: { errors: emailErrors },
    handleSubmit: emailHandleSubmit,
  } = useForm()

  const {
    register: pwdRegister,
    formState: { errors: pwdErrors },
    handleSubmit: pwdHandleSubmit,
  } = useForm()

  const {
    register: personalInfoRegister,
    formState: { errors: personalInfoErrors },
    handleSubmit: personalInfoHandleSubmit,
    watch: personalInfoWatch,
  } = useForm()

  // handle submissions
  // TODO: update after backend update calls exist
  const onEmailSubmit = (data: { email: string }) => {
    setAccountInfoLoading(true)
    const { email } = data
    try {
      const newUser = {
        ...user,
        email,
      }
      console.log("Update user email:", newUser)
      setAccountInfoAlert({ type: "success", message: `${t("accountSettings.verifyEmail")}` })
      setAccountInfoLoading(false)
    } catch (error) {
      setAccountInfoLoading(false)
      console.log("err =", error)
      setAccountInfoAlert({ type: "alert", message: `${t("error.formSubmission")}` })
      console.warn(error)
    }
  }

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
      const { status } = error.response || {}
      if (status === 401) {
        setAccountInfoAlert({ type: "alert", message: `${t("error.currentPasswordInvalid")}` })
      } else {
        setAccountInfoAlert({ type: "alert", message: `${t("error.formSubmission")}` })
      }
      console.warn(error)
    }
  }

  const onPersonalInfoSubmit = (data: {
    firstName: string
    middleName: string
    lastName: string
    dob: DOBFieldValues
  }) => {
    setPersonalInfoLoading(true)
    const { firstName, middleName, lastName, dob } = data

    setPersonalInfoAlert(null)
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
    } catch {
      setPersonalInfoLoading(false)
      setPersonalInfoAlert({
        type: "alert",
        message: `${t("error.formSubmission")}`,
      })
    }
  }

  return (
    <FormLayout title={t("accountSettings.title")}>
      <Card>
        <AccountSettingsHeader
          title={t("accountSettings.title")}
          description={t("accountSettings.description")}
          icon="settings"
        />
        {accountInfoAlert && (
          <AlertBox
            type={accountInfoAlert.type}
            onClose={() => setAccountInfoAlert(null)}
            closeable
            className="mb-4"
          >
            {accountInfoAlert.message}
          </AlertBox>
        )}
        <Card.Section className="p-6" divider="inset">
          {/* TODO: replace with email validation component */}
          <Form onSubmit={emailHandleSubmit(onEmailSubmit)}>
            <Field
              labelClassName=""
              type="email"
              name="email"
              label={t("label.emailAddress")}
              placeholder="example@web.com"
              validation={{ pattern: emailRegex }}
              error={emailErrors.email}
              errorMessage={t("error.email")}
              register={emailRegister}
              defaultValue={user ? user.email : null}
            />
            <div className="flex justify-center">
              <Button type="submit">{t("label.update")}</Button>
            </div>
          </Form>
        </Card.Section>
        <Card.Section className="p-6" divider="inset">
          <Form onSubmit={pwdHandleSubmit(onPasswordSubmit)}>
            <PasswordEditFieldset register={pwdRegister} errors={pwdErrors} />
            <div className="flex justify-center">
              <Button type="submit" loading={accountInfoLoading}>
                {t("label.update")}
              </Button>
            </div>
          </Form>
        </Card.Section>
        <Card.Section className="p-6" divider="inset">
          {personalInfoAlert && (
            <AlertBox
              type={personalInfoAlert.type}
              onClose={() => setPersonalInfoAlert(null)}
              className="mb-4"
              closeable
            >
              {personalInfoAlert.message}
            </AlertBox>
          )}
          <Form onSubmit={personalInfoHandleSubmit(onPersonalInfoSubmit)}>
            <NameFieldset
              register={personalInfoRegister}
              errors={personalInfoErrors}
              defaultFirstName={user.firstName ?? null}
              defaultMiddleName={user.middleName ?? null}
              defaultLastName={user.lastName ?? null}
            />
            <div className="px-4 pb-4">
              <DOBFieldset
                required
                name="dob"
                defaultDOB={user ? user.dateOfBirth : null}
                register={personalInfoRegister}
                error={personalInfoErrors.dob}
                watch={personalInfoWatch}
              />
            </div>
            <div className="flex justify-center">
              <Button loading={personalInfoLoading} type="submit">
                {t("label.update")}
              </Button>
            </div>
          </Form>
        </Card.Section>
      </Card>
    </FormLayout>
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
