import { Field, FieldProps, t } from "@bloom-housing/ui-components"
import React from "react"
import { ErrorOption, UseFormMethods, Validate } from "react-hook-form"
import Fieldset from "./Fieldset"
import { Icon } from "@bloom-housing/ui-seeds"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheck, faEye, faEyeSlash, faXmark } from "@fortawesome/free-solid-svg-icons"
import { AxiosError } from "axios"

const PASSWORD_VALIDATION_ERRORS = new Set([
  "Password is too short (minimum is 8 characters)",
  "Password must include at least one number",
  "Password must include at least one letter",
])

export const handleServerErrors =
  (setError: (name: string, error: ErrorOption) => void) =>
  (error: AxiosError<{ errors: { full_messages: string[] } }>) => {
    const errorMessages = error.response.data?.errors?.full_messages
    if (errorMessages && errorMessages.length > 0) {
      if (errorMessages[0] === "Current password is invalid") {
        setError("currentPassword", {
          message: "currentPassword:incorrect",
          shouldFocus: true,
        })
      } else if (
        errorMessages.some((errorMessage) => PASSWORD_VALIDATION_ERRORS.has(errorMessage))
      ) {
        setError("password", { message: "password:complexity", shouldFocus: true })
      }
    } else {
      setError("password", {
        message: "password:generic",
        shouldFocus: true,
      })
    }
  }

export const passwordErrorsMap = (errorKey: string, abbreviated: boolean) => {
  if (errorKey) {
    switch (errorKey) {
      case "currentPassword:incorrect":
        return abbreviated
          ? t("error.account.currentPasswordIncorrect.abbreviated")
          : t("error.account.currentPasswordIncorrect")
      case "password:complexity":
        return abbreviated
          ? t("error.account.passwordComplexity.abbreviated")
          : t("error.account.passwordComplexity")
      case "currentPassword:required":
        return t("error.account.currentPasswordMissing")
      case "password:required":
        return t("error.account.newPasswordMissing")
      default:
        return abbreviated
          ? t("error.account.genericServerError.abbreviated")
          : t("error.account.genericServerError")
    }
  }
}

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
    <div className="field-note">
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
    </div>
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

const newPasswordValidation: Validate = (newPassword: string) => {
  if (newPassword.length < 8 || !/(?=.*[0-9])(?=.*[a-zA-Z])/.test(newPassword)) {
    return "password:complexity"
  }
  return true
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
    <Fieldset hasError={hasError} label={edit ? t("label.password") : t("label.choosePassword")}>
      {edit && (
        <>
          <p className="field-note mt-2 mb-4">{t("accountSettings.enterCurrentPassword")}</p>
          <PasswordField
            name="currentPassword"
            label={t("label.currentPassword")}
            error={errors.currentPassword}
            errorMessage={
              errors.currentPassword?.message &&
              passwordErrorsMap(errors.currentPassword?.message as string, false)
            }
            validation={{ required: "currentPassword:required" }}
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
      <NewPasswordInstructions passwordValidationContent={passwordValidationContent} />
      <PasswordField
        name="password"
        label="password"
        labelClassName="invisible"
        className="mt-0 mb-4"
        validation={{
          required: "password:required",
          validate: newPasswordValidation,
        }}
        error={errors.password}
        errorMessage={
          errors.password?.message && passwordErrorsMap(errors.password?.message as string, false)
        }
        register={register}
      />
    </Fieldset>
  )
}

export default PasswordFieldset
