/* eslint-disable @typescript-eslint/unbound-method */
import React, { useContext, useEffect, useState } from "react"
import withAppSetup from "../../layouts/withAppSetup"
import UserContext from "../../authentication/context/UserContext"

import { Form, DOBFieldValues, t } from "@bloom-housing/ui-components"
import { useForm } from "react-hook-form"
import { Card, Alert } from "@bloom-housing/ui-seeds"
import { getSignInPath } from "../../util/routeUtil"
import { User } from "../../authentication/user"
import Layout from "../../layouts/Layout"
import EmailFieldset from "./components/EmailFieldset"
import FormSubmitButton from "./components/FormSubmitButton"
import PasswordFieldset from "./components/PasswordFieldset"
import NameFieldset from "./components/NameFieldset"
import DOBFieldset from "./components/DOBFieldset"
import "./styles/account.scss"
import { updateNameOrDOB as apiUpdateNameOrDOB, updateEmail } from "../../api/authApiService"
import { FormHeader } from "../../util/accountUtil"

const MOBILE_SIZE = 768

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
  handleBanners?: (banner: string) => void
}

const EmailSection = ({ user, setUser }: SectionProps) => {
  const [loading, setLoading] = useState(false)
  const [emailUpdateBanner, setemailUpdateBanner] = useState(false)
  const [emailBanner, setemailBanner] = useState(false)

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({ mode: "all" })

  const onChange = () => {
    setemailUpdateBanner(true)
    setemailBanner(false)
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
        setemailBanner(true)
      })
      .catch((error) => {
        // TODO: Inform the user that an error has occurred
        // In the case that the email is malformed, the error will have code 422
        console.log(error)
      })
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
  const [passwordBanner, setpasswordBanner] = useState(false)

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
      setpasswordBanner(true)
      console.log("Updated user's password:", newUser)
      setLoading(false)
    } catch (error) {
      setLoading(false)
      console.log(error)
    }
  }

  return (
    <>
      {passwordBanner && (
        <span className="mt-8">
          <SavedBanner />
        </span>
      )}
      <UpdateForm onSubmit={handleSubmit(onSubmit)} loading={loading}>
        <PasswordFieldset register={register} errors={errors} />
      </UpdateForm>
    </>
  )
}

const updateNameOrDOB = async (
  newUser: User,
  saveProfile: (profile: User) => void,
  setUser: React.Dispatch<User>,
  setLoading: React.Dispatch<boolean>,
  bannersCallback?: () => void
) => {
  return apiUpdateNameOrDOB(newUser)
    .then((profile) => {
      saveProfile(profile)
      setUser(newUser)
      bannersCallback()
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

const NameSection = ({ user, setUser, handleBanners }: SectionProps) => {
  const [loading, setLoading] = useState(false)
  const { saveProfile } = useContext(UserContext)

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({ mode: "all" })

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

    await updateNameOrDOB(newUser, saveProfile, setUser, setLoading, () =>
      handleBanners("nameSavedBanner")
    )
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

const DateOfBirthSection = ({ user, setUser }: SectionProps) => {
  const [loading, setLoading] = useState(false)
  const { saveProfile } = useContext(UserContext)
  const [dobUpdateBanner, setdobUpdateBanner] = useState(false)
  const [dobSavedBanner, setdobSavedBanner] = useState(false)

  const {
    register,
    formState: { errors },
    handleSubmit,
    watch,
  } = useForm({ mode: "all" })

  const onChange = () => {
    setdobUpdateBanner(true)
    setdobSavedBanner(false)
  }

  const onSubmit = async (data: { dob: DOBFieldValues }) => {
    setLoading(true)
    const { dob } = data

    const newUser = {
      ...user,
      DOB: [dob.birthYear, dob.birthMonth, dob.birthDay].join("-"),
    }

    await updateNameOrDOB(newUser, saveProfile, setUser, setLoading, () => setdobSavedBanner(true))
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
    </>
  )
}

const AccountSettings = ({ profile }: { profile: User }) => {
  const [user, setUser] = useState(null)
  const [nameUpdateBanner, setnameUpdateBanner] = useState(false)
  const [nameSavedBanner, setnameSavedBanner] = useState(false)

  const handleBanners = (banner: string) => {
    switch (banner) {
      case "nameUpdateBanner":
        setnameUpdateBanner(true)
        setnameSavedBanner(false)
        break
      case "nameSavedBanner":
        setnameSavedBanner(true)
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
              <AccountSettingsHeader className={"border-none"} />
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
