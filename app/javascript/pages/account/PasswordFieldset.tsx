import { Field, passwordRegex, t } from "@bloom-housing/ui-components"
import React from "react"
import { UseFormMethods } from "react-hook-form"
import "./account-settings"
import Fieldset from "./Fieldset"

const NewPasswordInstructions = () => {
  return (
    <>
      <span>{t("createAccount.passwordInstructions.mustInclude")}</span>
      <ul className="list-disc list-inside pl-2">
        <li className="bullet">{t("createAccount.passwordInstructions.numCharacters")}</li>
        <li className="bullet">{t("createAccount.passwordInstructions.numLetters")}</li>
        <li className="bullet">{t("createAccount.passwordInstructions.numNumbers")}</li>
      </ul>
    </>
  )
}

const PasswordFieldset = ({
  register,
  errors,
}: {
  register: UseFormMethods["register"]
  errors: UseFormMethods["errors"]
}) => {
  const hasError = errors.currentPassword || errors.password

  return (
    <Fieldset className="password-fieldset" hasError={hasError} label={t("label.password")}>
      <p className="field-note my-2">{t("accountSettings.enterCurrentPassword")}</p>
      {/* Todo: DAH-2387 Adaptive password validation */}
      <Field
        type="password"
        name="currentPassword"
        label={t("label.currentPassword")}
        error={errors.currentPassword}
        register={register}
        className="mb-1 mt-2"
      />
      <div className="forgot-password-link">
        <a href="/forgot-password">{t("signIn.forgotPassword")}</a>
      </div>
      <div className="new-password-label pt-4">
        <label htmlFor="password">{t("label.chooseNewPassword")}</label>
      </div>
      <div className="field-note my-2">
        <NewPasswordInstructions />
      </div>
      {/* Todo: DAH-2387 Adaptive password validation */}
      <Field
        type="password"
        name="password"
        className="mt-0 mb-4"
        validation={{
          minLength: 8,
          pattern: passwordRegex,
        }}
        error={errors.password}
        errorMessage={t("error.password")}
        register={register}
      />
    </Fieldset>
  )
}

export default PasswordFieldset