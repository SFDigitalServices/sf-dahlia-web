import { Field, t } from "@bloom-housing/ui-components"
import React from "react"
import { UseFormMethods } from "react-hook-form"
import Fieldset from "./Fieldset"
import { emailRegex } from "../../../util/accountUtil"

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
        validation={{ pattern: emailRegex }}
        error={errors.email}
        errorMessage={t("error.email")}
        register={register}
        defaultValue={defaultEmail ?? null}
        onChange={onChange}
      />
    </Fieldset>
  )
}

export default EmailFieldset
