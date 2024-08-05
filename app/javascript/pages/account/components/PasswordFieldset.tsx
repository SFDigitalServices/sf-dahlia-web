import { Field, passwordRegex, t } from "@bloom-housing/ui-components"
import React from "react"
import { UseFormMethods } from "react-hook-form"
import Fieldset from "./Fieldset"

export const NewPasswordInstructions = () => {
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
  edit = false,
}: {
  register: UseFormMethods["register"]
  errors: UseFormMethods["errors"]
  edit?: boolean
}) => {
  const hasError = errors.currentPassword || errors.password

  return (
    <Fieldset
      hasError={hasError}
      label={edit ? t("label.password") : t("label.choosePassword")}
      note={<NewPasswordInstructions />}
    >
      {edit && (
        <>
          <p className="field-note mt-2 mb-4">{t("accountSettings.enterCurrentPassword")}</p>
          {/* Todo: DAH-2387 Adaptive password validation */}
          <Field
            type="password"
            name="currentPassword"
            label={t("label.currentPassword")}
            error={errors.currentPassword}
            register={register}
            className="mb-1"
          />
          <div className="forgot-password-link">
            <a href="/forgot-password">{t("signIn.forgotPassword")}</a>
          </div>
          <div className="new-password-label pt-4">
            <label htmlFor="password">{t("label.chooseNewPassword")}</label>
          </div>
        </>
      )}
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
