import { Field, FieldProps, t } from "@bloom-housing/ui-components"
import React from "react"
import { UseFormMethods, Validate } from "react-hook-form"
import Fieldset from "./Fieldset"
import { Link } from "@bloom-housing/ui-seeds"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons"
import { ErrorMessages } from "./ErrorSummaryBanner"
import { ExpandedAccountAxiosError, getErrorMessage, SetErrorArgs } from "./util"

const PASSWORD_VALIDATION_ERRORS = new Set([
  "Password is too short (minimum is 8 characters)",
  "Password must include at least one number",
  "Password must include at least one letter",
])

export interface PasswordFieldsetProps {
  register: UseFormMethods["register"]
  errors: UseFormMethods["errors"]
  watch: UseFormMethods["watch"]
  passwordType: "signIn" | "createAccount" | "accountSettings"
  labelText: string
}

export const handlePasswordServerErrors = (error: ExpandedAccountAxiosError): SetErrorArgs => {
  const errorMessages = error.response.data?.errors?.full_messages

  if (error.response.status === 422) {
    if (errorMessages[0] === "Current password is invalid") {
      return [
        "currentPassword",
        {
          message: "currentPassword:incorrect",
          shouldFocus: true,
        },
      ]
    } else if (errorMessages.some((errorMessage) => PASSWORD_VALIDATION_ERRORS.has(errorMessage))) {
      return ["password", { message: "password:complexity", shouldFocus: true }]
    }
  } else {
    return [
      "password",
      {
        message: "password:server:generic",
        shouldFocus: true,
      },
    ]
  }
}

export const passwordFieldsetErrors: ErrorMessages = {
  "currentPassword:incorrect": {
    default: "error.account.currentPasswordIncorrect",
    abbreviated: "error.account.currentPasswordIncorrect.abbreviated",
  },
  "password:complexity": {
    default: "error.account.passwordComplexity",
    abbreviated: "error.account.passwordComplexity.abbreviated",
  },
  "currentPassword:required": {
    default: "error.account.currentPasswordMissing",
    abbreviated: "error.account.currentPasswordMissing",
  },
  "password:required": {
    default: "error.account.newPasswordMissing",
    abbreviated: "error.account.newPasswordMissing",
  },
  "password:server:generic": {
    default: "error.account.genericServerError",
    abbreviated: "error.account.genericServerError.abbreviated",
  },
}

export const passwordSortOrder = ["currentPassword", "password"]

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
    <div className="field-note" id="newPasswordInstructions">
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

interface PasswordFieldProps extends Omit<FieldProps, "type" | "postInputContent" | "inputProps"> {
  passwordVisibilityDefault?: boolean
}

const PasswordField = ({ passwordVisibilityDefault = false, ...props }: PasswordFieldProps) => {
  const [showPassword, setShowPassword] = React.useState(passwordVisibilityDefault)

  return (
    <>
      <Field
        {...props}
        type={showPassword ? "text" : "password"}
        inputProps={{ className: "input", required: true }}
      />
      <div className="field">
        <input
          type="checkbox"
          id="showPassword"
          name="showPassword"
          checked={showPassword}
          onChange={() => setShowPassword(!showPassword)}
        />
        <label htmlFor="showPassword">{t("label.showPassword")}</label>
      </div>
    </>
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
  passwordType,
  labelText,
}: PasswordFieldsetProps) => {
  const [passwordValidationContent, setPasswordValidationContent] = React.useState("")
  const newPassword: string = watch("password", "")

  const hasError = errors.currentPassword || errors.password

  React.useEffect(() => {
    setPasswordValidationContent(newPassword)
  }, [newPassword, setPasswordValidationContent])

  return (
    <Fieldset hasError={hasError} label={labelText}>
      {passwordType === "accountSettings" && (
        <>
          <p className="field-note mb-3">{t("accountSettings.enterCurrentPassword")}</p>
          <PasswordField
            name="currentPassword"
            label={t("label.currentPassword")}
            error={errors.currentPassword}
            errorMessage={
              errors.currentPassword?.message &&
              getErrorMessage(
                errors.currentPassword?.message as string,
                passwordFieldsetErrors,
                false
              )
            }
            validation={{ required: "currentPassword:required" }}
            register={register}
            className="mb-4"
          />
          <Link href="/forgot-password" className="forgot-password-link">
            {t("signIn.forgotPassword")}
          </Link>
          <div className={`new-password-label pt-4 pb-2 ${errors.password && "text-alert"}`}>
            <label htmlFor="password">{t("label.chooseNewPassword")}</label>
          </div>
        </>
      )}
      {passwordType !== "signIn" && (
        <NewPasswordInstructions passwordValidationContent={passwordValidationContent} />
      )}
      <PasswordField
        describedBy={errors.password?.message ? undefined : "newPasswordInstructions"} // undefined will force the input to be described by the error message
        name="password"
        label="password"
        labelClassName="hidden"
        className="mt-0 mb-4"
        validation={{
          required: "password:required",
          validate: newPasswordValidation,
        }}
        passwordVisibilityDefault={passwordType !== "signIn"}
        error={errors.password}
        errorMessage={
          errors.password?.message &&
          getErrorMessage(errors.password?.message as string, passwordFieldsetErrors, false)
        }
        register={register}
      />
    </Fieldset>
  )
}

export default PasswordFieldset
