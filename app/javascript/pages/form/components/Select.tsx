/* eslint-disable @typescript-eslint/unbound-method */
import React from "react"
import { t, Select } from "@bloom-housing/ui-components"
import { RegisterOptions, useFormContext } from "react-hook-form"

interface FormSelectProps {
  label: string
  defaultOptionName: string
  errorMessage: string
  options: { name: string; value: string }[]
  labelClassName?: string
  validation?: RegisterOptions
  fieldNames: {
    selection: string
  }
}

const FormSelect = ({
  label,
  defaultOptionName,
  errorMessage,
  options,
  labelClassName,
  validation,
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
      placeholder={t(defaultOptionName)}
      controlClassName="control"
      labelClassName={labelClassName}
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
