import { Field, passwordRegex, t } from "@bloom-housing/ui-components"
import React from "react"
import { UseFormMethods } from "react-hook-form"
import "./password-fieldset.scss"

const NewPasswordInstructions = () => {
  return (
    <>
      <span>{t("createAccount.passwordInstructions.mustInclude")}</span>
      <ul className="password-instructions">
        <li>{t("createAccount.passwordInstructions.numCharacters")}</li>
        <li>{t("createAccount.passwordInstructions.numLetters")}</li>
        <li>{t("createAccount.passwordInstructions.numNumbers")}</li>
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
    <fieldset>
      <legend className={hasError ? "text-alert" : ""}>{t("label.password")}</legend>
      <p className="field-note mt-2 mb-3">{t("accountSettings.enterCurrentPassword")}</p>
      <div className={"flex flex-col"}>
        {/* Todo: DAH-2387 Adaptive password validation */}
        <Field
          type="password"
          name="currentPassword"
          label={t("label.currentPassword")}
          error={errors.currentPassword}
          register={register}
          className="mb-1 mt-2"
        />
        <span className="float-left text-sm">
          <a href="/forgot-password">{t("signIn.forgotPassword")}</a>
        </span>
      </div>
      <div className={"flex flex-col"}>
        <div className="field mb-0 mt-2">
          <label htmlFor="password">{t("label.chooseNewPassword")}</label>
        </div>
        <span className="field-note mt-2">
          <NewPasswordInstructions />
        </span>
        {/* Todo: DAH-2387 Adaptive password validation */}
        <Field
          type="password"
          name="password"
          className="mt-0 mb-5"
          validation={{
            minLength: 8,
            pattern: passwordRegex,
          }}
          error={errors.password}
          errorMessage={t("error.password")}
          register={register}
        />
      </div>
    </fieldset>
  )
}

export default PasswordFieldset
