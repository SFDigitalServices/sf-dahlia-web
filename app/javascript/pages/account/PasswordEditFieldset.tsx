import { Field, passwordRegex, t } from "@bloom-housing/ui-components"
import React from "react"
import { UseFormMethods } from "react-hook-form"

const NewPasswordInstructions = () => {
  return (
    <>
      <li>{t("createAccount.passwordInstructions.numCharacters")}</li>
      <li>{t("createAccount.passwordInstructions.numLetters")}</li>
      <li>{t("createAccount.passwordInstructions.numNumbers")}</li>
    </>
  )
}

const PasswordEditFieldset = ({
  register,
  errors,
}: {
  register: UseFormMethods["register"]
  errors: UseFormMethods["errors"]
}) => {
  return (
    <fieldset>
      <legend>{t("label.password")}</legend>
      <p className="field-note mt-2 mb-3">{t("accountSettings.rememberYourPassword")}</p>
      <div className={"flex flex-col"}>
        {/* Todo: DAH-2387 Adaptive password validation */}
        <Field
          type="password"
          name="oldPassword"
          label={t("label.oldPassword")}
          error={errors.oldPassword}
          register={register}
          className="mb-1 mt-2"
        />
        <span className="float-left text-sm">
          <a href="/forgot-password">{t("signIn.forgotPassword")}</a>
        </span>
      </div>
      <div className={"flex flex-col"}>
        <div className="field mb-0 mt-2">
          <label>{t("label.newPassword")}</label>
        </div>
        <span className="field-note float-left pl-5 text-sm mt-2">
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

export default PasswordEditFieldset
