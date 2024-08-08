import { Field, t } from "@bloom-housing/ui-components"
import React from "react"
import { UseFormMethods } from "react-hook-form"
import Fieldset from "./Fieldset"
import { emailRegex } from "../../../util/accountUtil"

const validateEmail = (email: string) => {
  return emailRegex.test(email)
}

const emailValidation = (data: string) => {
  const numberOfAts = (data.match(/@/g) || []).length
  if (numberOfAts === 0) {
    return t("error.email.missingAtSign")
  }

  const splitString = data.split("@")
  if (
    splitString[splitString.length - 1] &&
    splitString[splitString.length - 1]?.search(/\./) === -1
  ) {
    return t("error.email.missingDot")
  }

  if (!validateEmail(data)) {
    return t("error.email.generalIncorrect")
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
        errorMessage={errors.email?.message}
        register={register}
        defaultValue={defaultEmail ?? null}
        onChange={onChange}
      />
    </Fieldset>
  )
}

export default EmailFieldset
