/* eslint-disable @typescript-eslint/unbound-method */
import React, { useCallback, useContext, useEffect, useState } from "react"
import withAppSetup from "../../layouts/withAppSetup"
import UserContext from "../../authentication/context/UserContext"
import { useAuthSession } from "../../authentication/session/AuthSessionProvider"
import { useSignUpSession } from "../../authentication/session/useSignUpSession"
import { useAccountSession } from "../../authentication/session/useAccountSession"
import { useReverificationPrompt } from "../../authentication/session/useReverificationPrompt"
import { bearerToken } from "../../authentication/session/authStatus"
import { Form, DOBFieldValues, t } from "@bloom-housing/ui-components"
import { DeepMap, FieldError, useForm } from "react-hook-form"
import { Card, Alert, Button } from "@bloom-housing/ui-seeds"
import {
  AppPages,
  getAddPasswordPath,
  getChangePasswordPath,
  RedirectType,
} from "../../util/routeUtil"
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
import Toast from "./components/Toast"
import ReverifyIdentity from "./components/ReverifyIdentity"
import VerificationCodeField from "./components/VerificationCodeField"
import "./styles/account.scss"
import sharedStyles from "./shared-styles.module.scss"
import {
  updateAccountWithClerk,
  updateNameOrDOB as apiUpdateNameOrDOB,
  updateEmail,
  updateHousingCounselorAccess,
  updatePassword,
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
import PasswordFieldset, {
  handlePasswordServerErrors,
  passwordFieldsetErrors,
  passwordSortOrder,
} from "./components/PasswordFieldset"

export const Banner = ({
  showBanner,
  className,
  message,
  onClose,
  variant,
  fullWidth = true,
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

const EmailSectionDevise = ({ user, setUser }: SectionProps) => {
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

type AccountUpdater = (newUser: User) => Promise<User>

/** Saves the account with whichever session the user has: Clerk behind its flag, else Devise. */
const useAccountUpdater = (): AccountUpdater => {
  const { unleashFlag: clerkEnabled } = useFeatureFlag(UNLEASH_FLAG.CLERK_AUTH, false)
  const { getCredentials } = useAuthSession()

  return useCallback(
    async (newUser: User) => {
      if (!clerkEnabled) return apiUpdateNameOrDOB(newUser)

      const sessionToken = bearerToken(await getCredentials())
      if (!sessionToken) {
        throw new Error("Missing Clerk session token")
      }
      return updateAccountWithClerk(newUser, sessionToken)
    },
    [clerkEnabled, getCredentials]
  )
}

/**
 * Changing the sign-in email with Clerk: the new address is verified by a code sent to it, and
 * any step may first ask the user to confirm it's them. Both render in place of this section's
 * form, so the rest of the settings page stays put.
 */
const EmailSection = ({ user, setUser }: SectionProps) => {
  const { saveProfile } = useContext(UserContext)
  const updateAccount = useAccountUpdater()
  const { startEmailChange, resendEmailChangeCode, verifyEmailChange, pendingEmail } =
    useAccountSession()
  const reverificationPrompt = useReverificationPrompt()
  const [step, setStep] = useState<"edit" | "verify">("edit")
  // The reverification prompt is shared by the page, so this section shows it only while one
  // of its own requests is waiting on it.
  const [isWaiting, setIsWaiting] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [codeError, setCodeError] = useState(false)
  const [emailUpdateBanner, setEmailUpdateBanner] = useState(false)
  const [emailSavedBanner, setEmailSavedBanner] = useState(false)

  const {
    register,
    formState: { errors },
    handleSubmit,
    setError,
  } = useForm({ mode: "onTouched" })

  const onChange = () => {
    setEmailUpdateBanner(true)
    setEmailSavedBanner(false)
  }

  const onSubmit = async ({ email }: { email: string }) => {
    setIsWaiting(true)
    const outcome = await startEmailChange(email)
    setIsWaiting(false)
    if (outcome.cancelled || outcome.notReady || outcome.unchanged) return
    if (outcome.emailTaken) {
      setError("email", { message: "email:server:duplicate", shouldFocus: true })
      return
    }
    if (outcome.error) {
      setError("email", { message: "email:server:generic", shouldFocus: true })
      return
    }
    setVerificationCode("")
    setCodeError(false)
    setStep("verify")
  }

  const onVerify = async () => {
    setIsWaiting(true)
    const outcome = await verifyEmailChange(verificationCode)
    if (outcome.cancelled || outcome.notReady) {
      setIsWaiting(false)
      return
    }
    if (outcome.error) {
      setIsWaiting(false)
      setCodeError(true)
      return
    }

    // The server reads the email from Clerk, not from this request, so this syncs the verified
    // address to the profile and can't save one Clerk hasn't verified.
    const newUser = { ...user, email: pendingEmail }
    try {
      saveProfile(await updateAccount(newUser))
    } catch (error) {
      console.error("Sync email to profile error:", error)
    }
    setUser(newUser)
    setIsWaiting(false)
    setStep("edit")
    setEmailUpdateBanner(false)
    setEmailSavedBanner(true)
  }

  if (isWaiting && reverificationPrompt) {
    return (
      <FormSection>
        <ReverifyIdentity prompt={reverificationPrompt} />
      </FormSection>
    )
  }

  if (step === "verify") {
    return (
      <FormSection>
        <form
          noValidate
          className={settingsStyles["emailCodeStep"]}
          onSubmit={(event) => {
            event.preventDefault()
            void onVerify()
          }}
        >
          <p className={settingsStyles["emailCodeHeading"]}>{t("createAccount.checkEmail")}</p>
          <p>
            {t("createAccount.weSentCodeTo")} <strong>{pendingEmail}</strong>
          </p>
          <VerificationCodeField
            value={verificationCode}
            onChange={setVerificationCode}
            error={codeError}
          />
          <div className={settingsStyles["emailCodeActions"]}>
            <Button variant="primary" size="sm" type="submit" disabled={isWaiting}>
              {t("createAccount.confirmCode")}
            </Button>
            <Button
              variant="text"
              size="sm"
              type="button"
              onClick={() => {
                void resendEmailChangeCode()
              }}
            >
              {t("createAccount.sendAgain")}
            </Button>
            <Button variant="text" size="sm" type="button" onClick={() => setStep("edit")}>
              {t("label.cancel")}
            </Button>
          </div>
        </form>
      </FormSection>
    )
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
        showBanner={emailSavedBanner}
        className="mt-8"
        message={t("accountSettings.emailReconfirmedUpdated")}
        onClose={() => setEmailSavedBanner(false)}
      />
      <ErrorSummaryBanner
        errors={errors}
        sortOrder={emailSortOrder}
        messageMap={(messageKey) => getErrorMessage(messageKey, emailFieldsetErrors, true)}
      />
      <UpdateForm
        onSubmit={handleSubmit(onSubmit)}
        loading={isWaiting}
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

// TODO: DAH-4262 Clean up Devise components when clerk flag is flipped on in prod
const PasswordSectionDevise = ({ user, setUser }: SectionProps) => {
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
      <UpdateForm
        onSubmit={handleSubmit(onSubmit)}
        loading={loading}
        submitLabel={t("accountSettings.savePassword")}
      >
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

const PasswordSection = () => {
  const navigate = useNavigate()
  const { hasPassword: userHasPassword } = useSignUpSession()

  return (
    <FormSection>
      <legend className={"fieldset-legend"}>{t("label.password")}</legend>
      {userHasPassword ? (
        <span aria-hidden="true">••••</span>
      ) : (
        <p className="field-note">{t("accountSettings.addPasswordDescription")}</p>
      )}
      <div className="flex justify-center pt-6">
        <Button
          type="button"
          variant="primary-outlined"
          onClick={() => {
            void navigate(userHasPassword ? getChangePasswordPath() : getAddPasswordPath(), {
              state: { accountSettingsFlow: true },
            })
          }}
        >
          {userHasPassword ? t("accountSettings.changePassword") : t("accountSettings.addPassword")}
        </Button>
      </div>
    </FormSection>
  )
}

const HousingCounselorSection = ({ user, setUser }: SectionProps) => {
  const { saveProfile } = useContext(UserContext)
  const { getCredentials } = useAuthSession()
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
    const sessionToken = bearerToken(await getCredentials())
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
        <Toast variant="success">{t("accountSettings.housingCounselor.toastShared")}</Toast>
      )}
      {revokeToast && (
        <Toast variant="success">{t("accountSettings.housingCounselor.toastStoppedSharing")}</Toast>
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
  updateAccount: AccountUpdater,
  newUser: User,
  saveProfile: (profile: User) => void,
  setUser: React.Dispatch<User>,
  setLoading: React.Dispatch<boolean>,
  errorCallback: (error: AxiosError) => void,
  bannersCallback?: () => void
) => {
  return updateAccount(newUser)
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
  const updateAccount = useAccountUpdater()
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
      updateAccount,
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
  const updateAccount = useAccountUpdater()
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
      updateAccount,
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
  const navigate = useNavigate()
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
    // resets success confirmation banner when page is refreshed
    if (location.state) {
      void navigate(location.pathname, { replace: true, state: null })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
      {clerkEnabled ? (
        <EmailSection user={user} setUser={setUser} />
      ) : (
        <EmailSectionDevise user={user} setUser={setUser} />
      )}
      {clerkEnabled ? <PasswordSection /> : <PasswordSectionDevise user={user} setUser={setUser} />}
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
