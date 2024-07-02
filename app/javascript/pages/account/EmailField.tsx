import { Field, emailRegex, t } from "@bloom-housing/ui-components"
import React from "react"
import { UseFormMethods } from "react-hook-form"

interface EmailFieldProps {
  register: UseFormMethods["register"]
  defaultEmail?: string
  errors?: UseFormMethods["errors"]
}

const EmailField = ({ register, errors, defaultEmail }: EmailFieldProps) => {
  return (
    <Field
      labelClassName=""
      type="email"
      name="email"
      label={t("label.emailAddress")}
      placeholder="example@web.com"
      validation={{ pattern: emailRegex }}
      error={errors.email}
      errorMessage={t("error.email")}
      register={register}
      defaultValue={defaultEmail ?? null}
    />
  )
}

export default EmailField
