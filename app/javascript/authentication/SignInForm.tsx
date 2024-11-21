import React, { Dispatch, SetStateAction, useEffect, useState } from "react"

import {
  AppearanceStyleType,
  Button,
  Form,
  t,
  FormCard,
  Icon,
  AlertBox,
  SiteAlert,
  LinkButton,
  debounce,
} from "@bloom-housing/ui-components"
import { Dialog, Link, Heading, Alert } from "@bloom-housing/ui-seeds"
import { FieldValues, SubmitHandler, useForm } from "react-hook-form"

import { getMyAccountPath } from "../util/routeUtil"
import EmailFieldset from "../pages/account/components/EmailFieldset"
import PasswordFieldset from "../pages/account/components/PasswordFieldset"
import "../pages/account/styles/account.scss"
import { AxiosError } from "axios"
import { confirmEmail, signIn } from "../api/authApiService"

const NotConfirmedModal: React.FC<{
  email: string
  onClose: () => void
}> = ({ email, onClose }) => {
  const [emailSent, setEmailSent] = useState(false)
  const [, setEmailSentError] = useState(false)
  const requestEmail = debounce(() => {
    confirmEmail(email)
      .then(() => {
        setEmailSent(true)
      })
      .catch(() => {
        setEmailSentError(true)
      })
  }, 1000)

  return (
    <Dialog isOpen={!!email} onClose={onClose}>
      <Dialog.Header>{t("signIn.newAccount.title")}</Dialog.Header>
      {emailSent && (
        <Alert className="sign-in-banner">
          {t("signIn.newAccount.sendEmailAgainButton.confirmation")}
        </Alert>
      )}
      <Dialog.Content>{t("signIn.newAccount.p1", { email })}</Dialog.Content>
      <Dialog.Content>{t("signIn.newAccount.p2")}</Dialog.Content>
      <Dialog.Footer>
        <Button type="submit" styleType={AppearanceStyleType.primary} onClick={onClose}>
          {t("t.ok")}
        </Button>
        <Button styleType={AppearanceStyleType.secondary} onClick={requestEmail}>
          {t("signIn.newAccount.sendEmailAgainButton")}
        </Button>
      </Dialog.Footer>
    </Dialog>
  )
}

const SignInFormCard = ({
  onSubmit,
  requestError,
  setRequestError,
}: {
  onSubmit: SubmitHandler<FieldValues>
  requestError: string
  setRequestError: Dispatch<SetStateAction<string>>
}) => {
  /* Form Handler */
  // TODO(DAH-1575): Upgrade React-Hook-Form. Note: When you update to Version 7 of react-hook-form, "errors" becomes: "formState: { errors }""
  // This is causing a linting issue with unbound-method, see open issue as of 10/21/2020:
  // https://github.com/react-hook-form/react-hook-form/issues/2887
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register, handleSubmit, errors, watch } = useForm()
  return (
    <FormCard>
      <div className="form-card__lead text-center border-b mx-0">
        <Icon size="2xl" symbol="profile" />
        <h2 className="form-card__title">{t("pageTitle.signIn")}</h2>
      </div>
      {requestError && (
        <AlertBox onClose={() => setRequestError(undefined)} type="alert">
          {requestError}
        </AlertBox>
      )}
      <SiteAlert type="notice" dismissable />
      <div className="form-card__group pt-0 border-b">
        <Form id="sign-in" className="mt-10 relative" onSubmit={handleSubmit(onSubmit)}>
          <EmailFieldset register={register} errors={errors} />
          <span className="right-0 absolute">
            <Link href="/forgot-password" className="forgot-password-link">
              {t("forgotPassword.title")}
            </Link>
          </span>
          <PasswordFieldset
            register={register}
            errors={errors}
            watch={watch}
            labelText={t("label.password")}
            passwordType="signIn"
          />
          <div className="text-center mt-4">
            <Button styleType={AppearanceStyleType.primary} type="submit">
              {t("pageTitle.signIn")}
            </Button>
          </div>
        </Form>
      </div>
      <div className="form-card__group text-center">
        <Heading size="2xl" priority={3}>
          {t("createAccount.title.sentenceCase")}
        </Heading>
        <div className="py-4">
          <p>{t("signIn.fillInFaster")}</p>
          <p>{t("signIn.easilyCheckLottery")}</p>
        </div>
        <LinkButton href="/create-account">{t("label.createAccount")}</LinkButton>
      </div>
    </FormCard>
  )
}

const onSubmit =
  (setNotConfirmed: (email: string) => void, setRequestError: (error: string) => void) =>
  (data: { email: string; password: string }) => {
    const { email, password } = data

    signIn(email, password)
      .then(() => {
        window.location.href = getMyAccountPath()
        window.scrollTo(0, 0)
      })
      .catch((error: AxiosError<{ error: string; email: string }>) => {
        if (error.response.data.error === "not_confirmed") {
          setNotConfirmed(error.response.data.email)
        } else {
          // TODO: handle sign-in error states
          setRequestError(`${t("signIn.badCredentials")}`)
        }
      })
  }

const SignInForm = () => {
  const [requestError, setRequestError] = useState<string>()
  const [notConfirmed, setNotConfirmed] = useState<string | null>(null)

  useEffect(() => {
    const newAccountEmail: string | null = window.sessionStorage.getItem("newAccount")
    if (newAccountEmail) {
      setNotConfirmed(newAccountEmail)
      window.sessionStorage.removeItem("newAccount")
    }
  }, [])

  return (
    <>
      <NotConfirmedModal email={notConfirmed} onClose={() => setNotConfirmed(null)} />
      <SignInFormCard
        onSubmit={onSubmit(setNotConfirmed, setRequestError)}
        requestError={requestError}
        setRequestError={setRequestError}
      />
    </>
  )
}

export { SignInForm as default, SignInForm }
