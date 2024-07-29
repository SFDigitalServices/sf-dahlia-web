/* eslint-disable @typescript-eslint/unbound-method */
import React, { useContext, useEffect, useState } from "react"
import withAppSetup from "../../layouts/withAppSetup"
import UserContext from "../../authentication/context/UserContext"

import { Form, DOBFieldValues, Icon, t } from "@bloom-housing/ui-components"
import { useForm } from "react-hook-form"
import { Card } from "@bloom-housing/ui-seeds"
import { getSignInPath } from "../../util/routeUtil"
import { User } from "../../authentication/user"
import Layout from "../../layouts/Layout"
import EmailFieldset from "./EmailFieldset"
import FormSubmitButton from "./FormSubmitButton"
import PasswordFieldset from "./PasswordFieldset"
import NameFieldset from "./NameFieldset"
import DOBFieldset from "./DOBFieldset"
import { updateNameOrDOB as apiUpdateNameOrDOB } from "../../api/authApiService"

const MOBILE_SIZE = 768

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
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  useEffect(() => {
    function handleResize() {
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <Card.Section divider={windowWidth > MOBILE_SIZE ? "inset" : "flush"}>
      <Form className="p-2 md:py-2 md:px-10" data-testid="update-form" onSubmit={onSubmit}>
        {children}
        <FormSubmitButton loading={loading} label={t("label.update")} />
      </Form>
    </Card.Section>
  )
}

interface SectionProps {
  user: User
  setUser: React.Dispatch<User>
}

const EmailSection = ({ user, setUser }: SectionProps) => {
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
      setUser(newUser)
      console.log("Updated user's email:", newUser)
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.log(error)
    }
  }

  return (
    <UpdateForm onSubmit={handleSubmit(onSubmit)} loading={loading}>
      <EmailFieldset register={register} errors={errors} defaultEmail={user?.email ?? null} />
    </UpdateForm>
  )
}

const PasswordSection = ({ user, setUser }: SectionProps) => {
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

const updateNameOrDOB = async (
  newUser: User,
  saveProfile: (profile: User) => void,
  setUser: React.Dispatch<User>,
  setLoading: React.Dispatch<boolean>
) => {
  return apiUpdateNameOrDOB(newUser)
    .then((profile) => {
      saveProfile(profile)
      setUser(newUser)
    })
    .catch((error) => {
      // TODO: In the case that a user's DOB is invalid, this is a snippet of the AxiosError that will be returned
      // {
      //  data: {
      //    error: "Invalid DOB"
      //  },
      //  status: 422,
      // }
      console.log(error)
    })
    .finally(() => {
      setLoading(false)
    })
}

const NameSection = ({ user, setUser }: SectionProps) => {
  const [loading, setLoading] = useState(false)
  const { saveProfile } = useContext(UserContext)

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({ mode: "all" })

  const onSubmit = async (data: { firstName: string; middleName: string; lastName: string }) => {
    setLoading(true)
    const { firstName, middleName, lastName } = data

    const newUser = {
      ...user,
      firstName,
      lastName,
      middleName,
    }

    await updateNameOrDOB(newUser, saveProfile, setUser, setLoading)
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
    </UpdateForm>
  )
}

const DateOfBirthSection = ({ user, setUser }: SectionProps) => {
  const [loading, setLoading] = useState(false)
  const { saveProfile } = useContext(UserContext)

  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm({ mode: "all" })

  const onSubmit = async (data: { dob: DOBFieldValues }) => {
    setLoading(true)
    const { dob } = data

    const newUser = {
      ...user,
      DOB: [dob.birthYear, dob.birthMonth, dob.birthDay].join("-"),
    }

    await updateNameOrDOB(newUser, saveProfile, setUser, setLoading)
  }

  return (
    <UpdateForm onSubmit={handleSubmit(onSubmit)} loading={loading}>
      <DOBFieldset
        required
        defaultDOB={user ? user.dobObject : null}
        register={register}
        error={errors.dob}
        watch={watch}
      />
    </UpdateForm>
  )
}

const AccountSettings = ({ profile }: { profile: User }) => {
  const [user, setUser] = useState(null)

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
            <NameSection user={user} setUser={setUser} />
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
