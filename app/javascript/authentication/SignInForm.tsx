import React, { Dispatch, SetStateAction, useContext, useEffect, useState } from "react"

import {
  AppearanceStyleType,
  Button,
  Form,
  t,
  FormCard,
  Icon,
  AlertBox,
  LinkButton,
} from "@bloom-housing/ui-components"
import { Link, Heading } from "@bloom-housing/ui-seeds"
import { FieldValues, SubmitHandler, useForm } from "react-hook-form"

import { getForgotPasswordPath, getMyAccountPath } from "../util/routeUtil"
import EmailFieldset from "../pages/account/components/EmailFieldset"
import PasswordFieldset from "../pages/account/components/PasswordFieldset"
import "../pages/account/styles/account.scss"
import { AxiosError } from "axios"
import UserContext from "./context/UserContext"
import { AccountAlreadyConfirmedModal } from "./components/AccountAlreadyConfirmedModal"
import { SiteAlert } from "../components/SiteAlert"
import { NewAccountNotConfirmedModal } from "./components/NewAccountNotConfirmedModal"
import { ExpiredUnconfirmedModal } from "./components/ExpiredUnconfirmedModal"
import { renderInlineMarkup } from "../util/languageUtil"

const getExpiredConfirmedEmail = () => {
  const urlParams = new URLSearchParams(window.location.search)
  const expiredUnconfirmedEmail = urlParams.get("expiredConfirmed")
  return expiredUnconfirmedEmail
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
  const [showBannerError, setShowBannerError] = useState(false)

  useEffect(() => {
    if (errors.email || errors.password) {
      setShowBannerError(true)
    }
  }, [errors.email, errors.password])

  return (
    <FormCard>
      <div className="form-card__lead text-center border-b mx-0">
        <Icon size="2xl" symbol="profile" />
        <h2 className="form-card__title">{t("pageTitle.signIn")}</h2>
      </div>
      {requestError && (
        <AlertBox onClose={() => setRequestError(undefined)} type="alert">
          {renderInlineMarkup(requestError)}
        </AlertBox>
      )}
      {showBannerError && (
        <AlertBox onClose={() => setShowBannerError(undefined)} type="alert">
          {renderInlineMarkup(t("signIn.badCredentialsWithResetLink"))}
        </AlertBox>
      )}
      <SiteAlert type="success" />
      <SiteAlert type="secondary" />
      <div className="form-card__group pt-0 border-b">
        <Form id="sign-in" className="mt-10 relative" onSubmit={handleSubmit(onSubmit)}>
          <EmailFieldset register={register} />
          <span className="right-0 absolute">
            <Link href="/forgot-password" className="forgot-password-link">
              {t("forgotPassword.title")}
            </Link>
          </span>
          <PasswordFieldset
            register={register}
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

const getExpiredUnconfirmedEmail = () => {
  const urlParams = new URLSearchParams(window.location.search)
  const expiredUnconfirmedEmail = urlParams.get("expiredUnconfirmed")
  return expiredUnconfirmedEmail
}

const SignInForm = () => {
  const [requestError, setRequestError] = useState<string>()
  const [showNewAccountNotConfirmedModal, setNewAccountNotConfirmedModal] = useState<string | null>(
    null
  )
  const [showExpiredUnconfirmedModal, setExpiredUnconfirmedModal] = useState<string | null>(null)
  const [showAccountAlreadyConfirmedModal, setShowAccountAlreadyConfirmedModal] = useState(null)

  const { signIn } = useContext(UserContext)

  const handleRequestError = (error: AxiosError<{ error: string; email: string }>) => {
    if (error.response.data.error === "not_confirmed") {
      setNewAccountNotConfirmedModal(error.response.data.email)
    } else if (error.response.data.error === "bad_credentials") {
      setRequestError(
        t("signIn.badCredentialsWithResetLink", {
          url: getForgotPasswordPath(),
        })
      )
    } else {
      setRequestError(`${t("signIn.unknownError")}`)
    }
  }

  const onSubmit = (data: { email: string; password: string }) => {
    const { email, password } = data

    signIn(email, password)
      .then(() => {
        window.location.href = getMyAccountPath()
        window.scrollTo(0, 0)
      })
      .catch((error: AxiosError<{ error: string; email: string }>) => {
        handleRequestError(error)
      })
  }

  useEffect(() => {
    const newAccountEmail: string | null = window.sessionStorage.getItem("newAccount")
    const expiredConfirmedEmail = getExpiredConfirmedEmail()
    const expiredUnconfirmedEmail = getExpiredUnconfirmedEmail()
    if (newAccountEmail) {
      setNewAccountNotConfirmedModal(newAccountEmail)
      window.sessionStorage.removeItem("newAccount")
    } else if (expiredConfirmedEmail) {
      setShowAccountAlreadyConfirmedModal(true)
    } else if (expiredUnconfirmedEmail) {
      setExpiredUnconfirmedModal(expiredUnconfirmedEmail)
    }
  }, [])

  return (
    <>
      <ExpiredUnconfirmedModal
        email={showExpiredUnconfirmedModal}
        onClose={() => setExpiredUnconfirmedModal(null)}
      />
      <AccountAlreadyConfirmedModal
        isOpen={showAccountAlreadyConfirmedModal}
        onClose={() => setShowAccountAlreadyConfirmedModal(false)}
      />
      <NewAccountNotConfirmedModal
        email={showNewAccountNotConfirmedModal}
        onClose={() => setNewAccountNotConfirmedModal(null)}
      />
      <SignInFormCard
        onSubmit={onSubmit}
        requestError={requestError}
        setRequestError={setRequestError}
      />
    </>
  )
}

export { SignInForm as default, SignInForm }
