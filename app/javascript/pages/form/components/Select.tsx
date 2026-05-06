/* eslint-disable @typescript-eslint/unbound-method */
import React from "react"
import { Select, t } from "@bloom-housing/ui-components"
import { RegisterOptions, useFormContext } from "react-hook-form"
interface FormSelectProps {
  label: string
  subNote?: string
  defaultOptionName?: string
  errorMessage: string
  options: { label: string; value: string }[]
  labelClassName?: string
  validation?: RegisterOptions
  disabled?: boolean
  doNotTranslateOptions?: boolean
  fieldNames: {
    selection?: string
  }
}

const FormSelect = ({
  label,
  subNote,
  defaultOptionName,
  errorMessage,
  options,
  validation,
  disabled,
  doNotTranslateOptions,
  fieldNames: { selection },
}: FormSelectProps) => {
  const {
    register,
    formState: { errors },
  } = useFormContext()
  const selectOptions = options.map((option) => ({
    label: doNotTranslateOptions ? option.label : t(option.label),
    value: option.value,
  }))

  return (
    <Select
      id={selection}
      name={selection}
      label={t(label)}
      subNote={subNote && t(subNote)}
      options={selectOptions}
      placeholder={defaultOptionName ? t(defaultOptionName) : undefined}
      controlClassName="control"
      labelClassName="text__caps-spaced"
      disabled={disabled}
      register={register}
      error={!!errors?.[selection]}
      errorMessage={t(errorMessage)}
      validation={
        validation || {
          required: true,
        }
      }
    />
  )
}

export default FormSelect
