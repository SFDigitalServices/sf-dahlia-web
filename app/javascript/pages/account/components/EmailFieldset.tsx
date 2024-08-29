import { Field, t } from "@bloom-housing/ui-components"
import React from "react"
import { ErrorOption, UseFormMethods } from "react-hook-form"
import Fieldset from "./Fieldset"
import { emailRegex } from "../../../util/accountUtil"
import { AxiosError } from "axios"
import { ErrorMessages, getErrorMessage } from "./ErrorSummaryBanner"

const validateEmail = (email: string) => {
  return emailRegex.test(email)
}

export const handleEmailServerErrors =
  (setError: (name: string, error: ErrorOption) => void, errorCallback: () => void) =>
  (error: AxiosError) => {
    if (error.response.status === 422) {
      setError("email", { message: "email:generalFormat", shouldFocus: true })
    } else {
      setError("email", { message: "email:server:generic", shouldFocus: true })
    }

    errorCallback()
  }

export const emailFieldsetErrors: ErrorMessages = {
  "email:missingAtSign": {
    default: "error.email.missingAtSign",
    abbreviated: "error.email.missingAtSign.abbreviated",
  },
  "email:missingDot": {
    default: "error.email.missingDot",
    abbreviated: "error.email.missingDot.abbreviated",
  },
  "email:generalFormat": {
    default: "error.email.generalIncorrect",
    abbreviated: "error.email.generalIncorrect.abbreviated",
  },
  "email:missing": {
    default: "error.email.missing",
    abbreviated: "error.email.missing.abbreviated",
  },
  "email:server:generic": {
    default: "error.account.genericServerError",
    abbreviated: "error.account.genericServerError.abbreviated",
  },
}

const emailValidation = (data: string) => {
  const numberOfAts = (data.match(/@/g) || []).length
  if (numberOfAts === 0) {
    return "email:missingAtSign"
  }

  const splitString = data.split("@")
  if (
    splitString[splitString.length - 1] &&
    splitString[splitString.length - 1]?.search(/\./) === -1
  ) {
    return "email:missingDot"
  }

  if (!validateEmail(data)) {
    return "email:generalFormat"
  }
}

interface EmailFieldProps {
  register: UseFormMethods["register"]
  defaultEmail?: string
  errors?: UseFormMethods["errors"]
  onChange?: () => void
  note?: React.ReactNode
}

const EmailFieldset = ({ register, errors, defaultEmail, onChange, note }: EmailFieldProps) => {
  return (
    <Fieldset hasError={errors.email} label={t("label.emailAddress")} note={note}>
      <Field
        className="pb-4"
        type="email"
        name="email"
        placeholder="example@web.com"
        validation={{
          required: "email:missing",
          validate: emailValidation,
        }}
        error={errors.email}
        errorMessage={
          errors.email?.message &&
          getErrorMessage(errors.email?.message as string, emailFieldsetErrors, false)
        }
        register={register}
        defaultValue={defaultEmail ?? null}
        onChange={onChange}
      />
    </Fieldset>
  )
}

export default EmailFieldset
