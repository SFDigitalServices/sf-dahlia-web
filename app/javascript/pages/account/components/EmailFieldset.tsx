import { Field, t } from "@bloom-housing/ui-components"
import React from "react"
import { UseFormMethods } from "react-hook-form"
import Fieldset from "./Fieldset"
import { emailRegex } from "../../../util/accountUtil"
import { ErrorMessages } from "./ErrorSummaryBanner"
import { ExpandedAccountAxiosError, getErrorMessage, SetErrorArgs } from "./util"
import { renderInlineMarkup } from "../../../util/languageUtil"

const validateEmail = (email: string) => {
  return emailRegex.test(email)
}

export const handleEmailServerErrors = (error: ExpandedAccountAxiosError): SetErrorArgs => {
  if (error.response.status === 422) {
    return (error.response.data?.errors?.full_messages || []).includes(
      "Email has already been taken"
    )
      ? ["email", { message: "email:server:duplicate", shouldFocus: true }]
      : ["email", { message: "email:generalFormat", shouldFocus: true }]
  } else {
    return ["email", { message: "email:server:generic", shouldFocus: true }]
  }
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
  "email:server:duplicate": {
    default: "error.email.duplicate",
    abbreviated: "error.email.duplicate.abbreviated",
  },
}

export const emailSortOrder = ["email"]

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
    <Fieldset hasError={errors?.email} label={t("label.emailAddress")} note={note}>
      <Field
        className="pb-4"
        controlClassName="mt-1"
        type="email"
        name="email"
        placeholder="example@web.com"
        validation={{
          required: "email:missing",
          validate: emailValidation,
        }}
        labelClassName="sr-only"
        label="Email"
        error={errors?.email}
        errorMessage={
          errors?.email?.message &&
          renderInlineMarkup(
            getErrorMessage(errors?.email?.message as string, emailFieldsetErrors, false)
          )
        }
        register={register}
        defaultValue={defaultEmail ?? null}
        onChange={onChange}
        inputProps={{ required: true }}
      />
    </Fieldset>
  )
}

export default EmailFieldset
