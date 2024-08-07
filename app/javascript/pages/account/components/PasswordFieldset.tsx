import { Field, FieldProps, passwordRegex, t } from "@bloom-housing/ui-components"
import React from "react"
import { UseFormMethods } from "react-hook-form"
import Fieldset from "./Fieldset"
import { Icon } from "@bloom-housing/ui-seeds"
import { CheckIcon, EyeIcon, EyeSlashIcon, XMarkIcon } from "@heroicons/react/24/outline"

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
        <CheckIcon data-testid="validation-check" className="h-4 w-4" />
      ) : (
        <XMarkIcon data-testid="validation-x" className="h-4 w-4" />
      )}
      {text}
    </li>
  )
}

const NewPasswordInstructions = ({ newPasswordContent }: { newPasswordContent: string }) => {
  const [dirty, setDirty] = React.useState(false)
  if (newPasswordContent.length > 0 && !dirty) {
    setDirty(true)
  }

  const shouldShowValidationInformation = newPasswordContent.length > 0 || dirty

  return (
    <>
      <span>{t("createAccount.passwordInstructions.mustInclude")}</span>
      <ul className={`${shouldShowValidationInformation ? "" : "list-disc list-inside pl-2"}`}>
        {instructionListItem(
          shouldShowValidationInformation,
          newPasswordContent.length >= 8,
          t("createAccount.passwordInstructions.numCharacters")
        )}
        {instructionListItem(
          shouldShowValidationInformation,
          /[a-zA-Z]/.test(newPasswordContent),
          t("createAccount.passwordInstructions.numLetters")
        )}
        {instructionListItem(
          shouldShowValidationInformation,
          /[0-9]/.test(newPasswordContent),
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
        <button className="absolute right-2 h-full" onClick={() => setShowPassword(!showPassword)}>
          <Icon className="text-blue-500" outlined size="lg">
            {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
          </Icon>
        </button>
      }
    />
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
  const [newPasswordContent, setNewPasswordContent] = React.useState("")

  return (
    <Fieldset
      hasError={hasError}
      label={edit ? t("label.password") : t("label.choosePassword")}
      note={<NewPasswordInstructions newPasswordContent={newPasswordContent} />}
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
        className="mt-0 mb-4"
        validation={{
          minLength: 8,
          pattern: passwordRegex,
        }}
        onChange={(e) => {
          setNewPasswordContent(e.currentTarget.value)
        }}
        error={errors.password}
        errorMessage={t("error.passwordComplexity")}
        register={register}
      />
    </Fieldset>
  )
}

export default PasswordFieldset
