import { Field, t } from "@bloom-housing/ui-components"
import React from "react"
import { UseFormMethods } from "react-hook-form"
import Fieldset from "./Fieldset"
import { emailRegex } from "../../util/accountUtil"

interface EmailFieldProps {
  register: UseFormMethods["register"]
  defaultEmail?: string
  errors?: UseFormMethods["errors"]
}

const EmailFieldset = ({ register, errors, defaultEmail }: EmailFieldProps) => {
  return (
    <Fieldset className="email-fieldset" hasError={errors.email} label={t("label.emailAddress")}>
      <Field
        className="pb-4"
        type="email"
        name="email"
        placeholder="example@web.com"
        validation={{ pattern: emailRegex }}
        error={errors.email}
        errorMessage={t("error.email")}
        register={register}
        defaultValue={defaultEmail ?? null}
      />
    </Fieldset>
  )
}

export default EmailFieldset
