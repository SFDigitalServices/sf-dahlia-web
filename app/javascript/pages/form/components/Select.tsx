/* eslint-disable @typescript-eslint/unbound-method */
import React from "react"
import { Select } from "@bloom-housing/ui-components"
import { RegisterOptions, useFormContext } from "react-hook-form"

interface FormSelectProps {
  label: string
  defaultOptionName?: string
  errorMessage: string
  options: { name: string; value: string }[]
  labelClassName?: string
  validation?: RegisterOptions
  disabled?: boolean
  fieldName?: string
}

const FormSelect = ({
  label,
  defaultOptionName,
  errorMessage,
  options,
  labelClassName,
  validation,
  disabled,
  fieldName = "",
}: FormSelectProps) => {
  const {
    register,
    formState: { errors },
  } = useFormContext()
  const selectOptions = options.map((option) => ({
    label: option.name,
    value: option.value,
  }))

  return (
    <Select
      id={fieldName}
      name={fieldName}
      label={label}
      options={selectOptions}
      placeholder={defaultOptionName ?? undefined}
      controlClassName="control"
      labelClassName={labelClassName}
      disabled={disabled}
      register={register}
      error={!!errors?.[fieldName]}
      errorMessage={errorMessage}
      validation={
        validation || {
          required: true,
        }
      }
    />
  )
}

export default FormSelect
