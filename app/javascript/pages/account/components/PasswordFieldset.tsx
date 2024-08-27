import { Field, FieldProps, passwordRegex, t } from "@bloom-housing/ui-components"
import React from "react"
import { UseFormMethods } from "react-hook-form"
import Fieldset from "./Fieldset"
import { Icon } from "@bloom-housing/ui-seeds"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheck, faEye, faEyeSlash, faXmark } from "@fortawesome/free-solid-svg-icons"

const instructionListItem = (
  shouldShowValidationInformation: boolean,
  validation: boolean,
  text: string
) => {
  if (!shouldShowValidationInformation) {
    return <li data-testid="validation-none">{text}</li>
  }
  return (
    <li className={`${validation ? "text-green-500" : "text-red-500"} flex items-center gap-2`}>
      {validation ? (
        <FontAwesomeIcon data-testid="validation-check" className="h-4 w-4" icon={faCheck} />
      ) : (
        <FontAwesomeIcon data-testid="validation-x" className="h-4 w-4" icon={faXmark} />
      )}
      {text}
    </li>
  )
}
/**
 *
 * @param passwordValidationContent is the new password that the user is typing and wil be validated
 */
const NewPasswordInstructions = ({
  passwordValidationContent,
}: {
  passwordValidationContent: string
}) => {
  const showValidationInfo = passwordValidationContent.length > 0
  return (
    <>
      <span>{t("createAccount.passwordInstructions.mustInclude")}</span>
      <ul className={`${showValidationInfo ? "" : "list-disc list-inside pl-2"}`}>
        {instructionListItem(
          showValidationInfo,
          passwordValidationContent.length >= 8,
          t("createAccount.passwordInstructions.numCharacters")
        )}
        {instructionListItem(
          showValidationInfo,
          /[a-zA-Z]/.test(passwordValidationContent),
          t("createAccount.passwordInstructions.numLetters")
        )}
        {instructionListItem(
          showValidationInfo,
          /[0-9]/.test(passwordValidationContent),
          t("createAccount.passwordInstructions.numNumbers")
        )}
      </ul>
    </>
  )
}

const PasswordField = ({
  ...props
}: Omit<FieldProps, "type" | "postInputContent" | "inputProps">) => {
  const [showPassword, setShowPassword] = React.useState(false)

  return (
    <Field
      {...props}
      type={showPassword ? "text" : "password"}
      inputProps={{ className: "input pr-10" }}
      postInputContent={
        <button
          className="absolute right-2 h-full"
          type="button"
          onClick={() => setShowPassword(!showPassword)}
        >
          <Icon className="text-blue-500" outlined size="lg">
            {showPassword ? (
              <FontAwesomeIcon icon={faEyeSlash} />
            ) : (
              <FontAwesomeIcon icon={faEye} />
            )}
          </Icon>
        </button>
      }
    />
  )
}

const PasswordFieldset = ({
  register,
  errors,
  watch,
  edit = false,
}: {
  register: UseFormMethods["register"]
  errors: UseFormMethods["errors"]
  watch: UseFormMethods["watch"]
  edit?: boolean
}) => {
  const [passwordValidationContent, setPasswordValidationContent] = React.useState("")
  const newPassword: string = watch("password", "")

  const hasError = errors.currentPassword || errors.password

  React.useEffect(() => {
    setPasswordValidationContent(newPassword)
  }, [newPassword, setPasswordValidationContent])

  return (
    <Fieldset
      hasError={hasError}
      label={edit ? t("label.password") : t("label.choosePassword")}
      note={<NewPasswordInstructions passwordValidationContent={passwordValidationContent} />}
    >
      {edit && (
        <>
          <p className="field-note mt-2 mb-4">{t("accountSettings.enterCurrentPassword")}</p>
          <PasswordField
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
      <PasswordField
        name="password"
        label="password"
        labelClassName="invisible"
        className="mt-0 mb-4"
        validation={{
          required: true,
          minLength: 8,
          pattern: passwordRegex,
        }}
        error={errors.password}
        errorMessage={t("error.passwordComplexity")}
        register={register}
      />
    </Fieldset>
  )
}

export default PasswordFieldset
