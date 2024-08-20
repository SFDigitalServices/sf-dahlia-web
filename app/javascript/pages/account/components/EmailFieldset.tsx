import { Field, t } from "@bloom-housing/ui-components"
import React from "react"
import { ErrorOption, UseFormMethods } from "react-hook-form"
import Fieldset from "./Fieldset"
import { emailRegex } from "../../../util/accountUtil"
import { AxiosError } from "axios"

const validateEmail = (email: string) => {
  return emailRegex.test(email)
}

export const handleEmailServerErrors =
  (setError: (name: string, error: ErrorOption) => void, errorCallback: () => void) =>
  (error: AxiosError) => {
    if (error.response.status === 422) {
      setError("email", { message: "email:generalFormat", shouldFocus: true })
    } else {
      setError("email", { message: "email:generic", shouldFocus: true })
    }

    errorCallback()
  }

export const emailErrorsMap = (errorCode: string, abbreviated?: boolean) => {
  switch (errorCode) {
    case "email:missingAtSign":
      return abbreviated
        ? t("error.email.missingAtSign.abbreviated")
        : t("error.email.missingAtSign")
    case "email:missingDot":
      return abbreviated ? t("error.email.missingDot.abbreviated") : t("error.email.missingDot")
    case "email:generalFormat":
      return abbreviated
        ? t("error.email.generalIncorrect.abbreviated")
        : t("error.email.generalIncorrect")
    default:
      return abbreviated
        ? t("error.account.genericServerError.abbreviated")
        : t("error.account.genericServerError")
  }
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
          required: true,
          validate: emailValidation,
        }}
        error={errors.email}
        errorMessage={
          errors.email?.message && emailErrorsMap(errors.email?.message as string, false)
        }
        register={register}
        defaultValue={defaultEmail ?? null}
        onChange={onChange}
      />
    </Fieldset>
  )
}

export default EmailFieldset
