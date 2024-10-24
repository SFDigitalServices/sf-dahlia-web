import React, { useState, useContext } from "react"

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
} from "@bloom-housing/ui-components"
import { useForm } from "react-hook-form"

import { getMyAccountPath } from "../util/routeUtil"
import UserContext from "./context/UserContext"
import EmailFieldset from "../pages/account/components/EmailFieldset"
import PasswordFieldset from "../pages/account/components/PasswordFieldset"
import { Link, Heading } from "@bloom-housing/ui-seeds"
import "../pages/account/styles/account.scss"

const SignInForm = () => {
  const { signIn } = useContext(UserContext)
  /* Form Handler */
  // TODO(DAH-1575): Upgrade React-Hook-Form. Note: When you update to Version 7 of react-hook-form, "errors" becomes: "formState: { errors }""
  // This is causing a linting issue with unbound-method, see open issue as of 10/21/2020:
  // https://github.com/react-hook-form/react-hook-form/issues/2887
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register, handleSubmit, errors, watch } = useForm()
  const [requestError, setRequestError] = useState<string>()

  const onSubmit = (data: { email: string; password: string }) => {
    const { email, password } = data

    signIn(email, password)
      .then(() => {
        window.location.href = getMyAccountPath()
        window.scrollTo(0, 0)
      })
      .catch(() => {
        // TODO: handle sign-in error states
        setRequestError(`${t("signIn.badCredentials")}`)
      })
  }

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
            <Button
              styleType={AppearanceStyleType.primary}
              type="submit"
              onClick={() => {
                //
              }}
            >
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

export { SignInForm as default, SignInForm }
