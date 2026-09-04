/* eslint-disable @typescript-eslint/unbound-method */
import React, { useContext, useEffect, useState } from "react"
import { useAuth } from "@clerk/clerk-react"
import withAppSetup from "../../layouts/withAppSetup"
import UserContext from "../../authentication/context/UserContext"
import { Form, DOBFieldValues, t } from "@bloom-housing/ui-components"
import { DeepMap, FieldError, useForm } from "react-hook-form"
import { Card, Alert, Button } from "@bloom-housing/ui-seeds"
import { AppPages, getChangePasswordPath, RedirectType } from "../../util/routeUtil"
import { User } from "../../authentication/user"
import Layout from "../../layouts/Layout"
import AccountLayout from "../../layouts/AccountLayout"
import EmailFieldset, {
  emailFieldsetErrors,
  emailSortOrder,
  handleEmailServerErrors,
} from "./components/EmailFieldset"
import FormSubmitButton from "./components/FormSubmitButton"
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
import HousingCounselorAccess, {
  housingCounselorFieldsetErrors,
} from "./components/HousingCounselorAccess"
import SuccessToast from "./components/SuccessToast"
import "./styles/account.scss"
import sharedStyles from "./shared-styles.module.scss"
import {
  updateNameOrDOB as apiUpdateNameOrDOB,
  updateEmail,
  updateHousingCounselorAccess,
} from "../../api/authApiService"
import { FormHeader, FormSection, getDobStringFromDobObject } from "../../util/accountUtil"
import { AxiosError } from "axios"
import { ErrorSummaryBanner } from "./components/ErrorSummaryBanner"
import { ExpandedAccountAxiosError, getErrorMessage } from "./components/util"
import { withAuthentication } from "../../authentication/withAuthentication"
import { useFeatureFlag } from "../../hooks/useFeatureFlag"
import { UNLEASH_FLAG } from "../../modules/constants"
import { AccountSettingsPage as MyAccountSettingsPage } from "./account-settings"
import settingsStyles from "./settings.module.scss"
import { useLocation, useNavigate } from "react-router"
import { CommonMessageVariant } from "@bloom-housing/ui-seeds/src/blocks/shared/CommonMessage"

export const Banner = ({
  showBanner,
  className,
  message,
  onClose,
  variant,
  fullWidth,
}: {
  showBanner: boolean
  className?: string
  message: string
  onClose?: () => void
  variant?: CommonMessageVariant
  fullWidth?: boolean
}) => {
  return (
    <>
      {showBanner && (
        <Alert variant={variant} fullwidth={fullWidth} className={className} onClose={onClose}>
          {message}
        </Alert>
      )}
    </>
  )
}

export const UpdateForm = ({
  children,
  loading,
  onSubmit,
  submitLabel,
}: {
  children: React.ReactNode
  loading: boolean
  onSubmit?: () => unknown
  submitLabel: string
}) => {
  return (
    <FormSection>
      <Form data-testid="update-form" onSubmit={onSubmit}>
        {children}
        <FormSubmitButton loading={loading} label={submitLabel} />
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
      <UpdateForm
        onSubmit={handleSubmit(onSubmit)}
        loading={loading}
        submitLabel={t("accountSettings.saveEmailAddress")}
      >
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

const PasswordSection = () => {
  const [loading, _setLoading] = useState(false)
  const navigate = useNavigate()

  return (
    <FormSection>
      <legend className={"fieldset-legend"}>{t("label.password")}</legend>
      <span>••••</span>{" "}
      <div className="flex justify-center pt-6">
        <Button
          loadingMessage={loading ? t("accountSettings.changePassword") : undefined}
          type="submit"
          variant="primary-outlined"
          onClick={() => {
            void navigate(getChangePasswordPath())
          }}
        >
          {t("accountSettings.changePassword")}
        </Button>
      </div>
    </FormSection>
  )
}

const HousingCounselorSection = ({ user, setUser }: SectionProps) => {
  const { saveProfile } = useContext(UserContext)
  const { getToken } = useAuth()
  const [loading, setLoading] = useState(false)
  const [grantToast, setGrantToast] = useState(false)
  const [revokeToast, setRevokeToast] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: "onTouched" })
  const accessShared = !!user?.housingCounselingAgencyId

  const clearToasts = () => {
    setGrantToast(false)
    setRevokeToast(false)
  }

  const saveApplicantContact = (applicant: User, housingCounselor?: User) => {
    const updatedUser: User = {
      ...applicant,
      housingCounselingAgencyId: housingCounselor?.housingCounselingAgencyId,
      housingCounselingAgencyName: housingCounselor?.housingCounselingAgencyName,
      housingCounselingAgencyLastModified: housingCounselor?.housingCounselingAgencyLastModified,
    }
    setUser(updatedUser)
    saveProfile(updatedUser)
  }

  const updateAccess = async (applicant: User) => {
    const sessionToken = await getToken()
    if (!sessionToken) {
      throw new Error("Missing Clerk session token")
    }
    return updateHousingCounselorAccess(applicant, sessionToken)
  }

  const onShare = (data: { housingCounselingAgencyId?: string }) => {
    setLoading(true)
    clearToasts()
    const applicant = { ...user, housingCounselingAgencyId: data.housingCounselingAgencyId }

    void updateAccess(applicant)
      .then((housingCounselor) => {
        saveApplicantContact(applicant, housingCounselor)
        setGrantToast(true)
      })
      .catch(() => {
        clearToasts()
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const onRevoke = () => {
    setLoading(true)
    clearToasts()
    const applicant: User = { ...user, housingCounselingAgencyId: null }

    void updateAccess(applicant)
      .then((housingCounselor) => {
        saveApplicantContact(applicant, housingCounselor)
        setRevokeToast(true)
      })
      .catch(() => {
        clearToasts()
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <>
      {grantToast && (
        <SuccessToast>{t("accountSettings.housingCounselor.toastShared")}</SuccessToast>
      )}
      {revokeToast && (
        <SuccessToast>{t("accountSettings.housingCounselor.toastStoppedSharing")}</SuccessToast>
      )}
      {!accessShared && (
        <ErrorSummaryBanner
          errors={errors}
          messageMap={(messageKey) =>
            getErrorMessage(messageKey, housingCounselorFieldsetErrors, true)
          }
        />
      )}
      <FormSection>
        <Form onSubmit={handleSubmit(onShare)}>
          <HousingCounselorAccess
            register={register}
            errors={errors}
            housingCounselorAgencyId={user?.housingCounselingAgencyId}
            lastModified={user?.housingCounselingAgencyLastModified}
          />
          <div className={settingsStyles.settingsButton}>
            <Button
              type={accessShared ? "button" : "submit"}
              variant={accessShared ? "alert-outlined" : "primary-outlined"}
              disabled={loading}
              onClick={accessShared ? onRevoke : undefined}
            >
              {accessShared
                ? t("accountSettings.housingCounselor.revokeButton")
                : t("accountSettings.housingCounselor.shareButton")}
            </Button>
          </div>
        </Form>
      </FormSection>
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
      <UpdateForm
        onSubmit={handleSubmit(onSubmit)}
        loading={loading}
        submitLabel={t("accountSettings.saveName")}
      >
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
      <UpdateForm
        onSubmit={handleSubmit(onSubmit)}
        loading={loading}
        submitLabel={t("accountSettings.saveDateOfBirth")}
      >
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
  const { unleashFlag: clerkEnabled } = useFeatureFlag(UNLEASH_FLAG.CLERK_AUTH, false)
  const { unleashFlag: housingCounselorAccessEnabled } = useFeatureFlag(
    UNLEASH_FLAG.HOUSING_COUNSELOR_ACCESS,
    false
  )
  const showHousingCounselorSection = clerkEnabled && housingCounselorAccessEnabled
  const [user, setUser] = useState(null)
  const [nameUpdateBanner, setNameUpdateBanner] = useState(false)
  const [nameSavedBanner, setNameSavedBanner] = useState(false)
  const location = useLocation()
  const passwordChangedNavState = location.state as { passwordChanged?: boolean } | null
  const [passwordBanner, setPasswordBanner] = useState(
    passwordChangedNavState?.passwordChanged === true
  )

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
      /* eslint-disable-next-line react-hooks/immutability */
      profile.dobObject = birth
    }

    setUser(profile)
  }, [profile])

  return (
    <Card className={sharedStyles.card}>
      <Banner
        showBanner={passwordBanner}
        className={settingsStyles["settingsConfirmationAlert"]}
        variant="success"
        message={t("accountSettings.changePasswordBanner")}
        onClose={() => setPasswordBanner(false)}
      />
      {nameUpdateBanner || nameSavedBanner ? (
        <FormHeader
          className={"border-none"}
          iconSymbol="settings"
          title={t("accountSettings.title.sentenceCase")}
          description={t("accountSettings.description")}
        />
      ) : (
        <FormHeader
          iconSymbol="settings"
          title={t("accountSettings.title.sentenceCase")}
          description={t("accountSettings.description")}
        />
      )}
      <Banner
        showBanner={nameUpdateBanner}
        message={t("accountSettings.update")}
        fullWidth
        onClose={() => setNameUpdateBanner(false)}
      />
      <Banner
        showBanner={nameSavedBanner}
        className="mt-8"
        message={t("accountSettings.accountChangesSaved")}
        fullWidth
        onClose={() => setNameSavedBanner(false)}
      />
      <NameSection user={user} setUser={setUser} handleBanners={handleBanners} />
      <DateOfBirthSection user={user} setUser={setUser} />
      <EmailSection user={user} setUser={setUser} />
      <PasswordSection />
      {showHousingCounselorSection && user && (
        <HousingCounselorSection user={user} setUser={setUser} />
      )}
    </Card>
  )
}

const AccountSettingsPage = () => {
  const { profile, loading, initialStateLoaded } = React.useContext(UserContext)

  if (!profile && !loading && initialStateLoaded) {
    return null
  }

  return <AccountSettings profile={profile} />
}

interface SettingsProps {
  assetPaths: unknown
}

const Settings = (_props: SettingsProps) => {
  const { unleashFlag: accountLayoutEnabled } = useFeatureFlag(UNLEASH_FLAG.ACCOUNTS_LAYOUT, false)

  if (!accountLayoutEnabled) {
    return <MyAccountSettingsPage />
  }

  return (
    <Layout>
      <AccountLayout>
        <AccountSettingsPage />
      </AccountLayout>
    </Layout>
  )
}

export default withAppSetup(withAuthentication(Settings, { redirectType: RedirectType.Settings }), {
  pageName: AppPages.AccountSettings,
})
