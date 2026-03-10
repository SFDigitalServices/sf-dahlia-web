/* eslint-disable @typescript-eslint/unbound-method */
import React from "react"
import { Select, t } from "@bloom-housing/ui-components"
import { RegisterOptions, useFormContext } from "react-hook-form"

interface FormSelectProps {
  label: string
  defaultOptionName?: string
  errorMessage: string
  options: { name: string; value: string }[]
  labelClassName?: string
  validation?: RegisterOptions
  disabled?: boolean
  fieldNames: {
    selection?: string
  }
}

const FormSelect = ({
  label,
  defaultOptionName,
  errorMessage,
  options,
  validation,
  disabled,
  fieldNames: { selection },
}: FormSelectProps) => {
  const {
    register,
    formState: { errors },
  } = useFormContext()
  const selectOptions = options.map((option) => ({
    label: t(option.name),
    value: option.value,
  }))

  return (
    <Select
      id={selection}
      name={selection}
      label={t(label)}
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
