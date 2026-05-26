/* eslint-disable @typescript-eslint/unbound-method */
import React from "react"
import { t, Field } from "@bloom-housing/ui-components"
import { useFormContext } from "react-hook-form"

interface CurrencyProps {
  label: string
  note?: string
  errorMessage: string
  required?: boolean
  disabled?: boolean
  fieldNames: {
    amount: string
  }
}

const Currency = ({
  label,
  note,
  errorMessage,
  required = true,
  disabled = false,
  fieldNames: { amount },
}: CurrencyProps) => {
  const {
    register,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext()

  return (
    <Field
      id={amount}
      name={amount}
      type="currency"
      label={t(label)}
      error={!!errors?.[amount]}
      register={register}
      errorMessage={t(errorMessage)}
      disabled={disabled}
      prepend={"$"}
      subNote={note && t(note)}
      setValue={setValue} // Field component uses setValue and getValues for currency input types
      getValues={getValues}
      validation={{ required, min: required ? 0.01 : undefined }}
    />
  )
}

export default Currency
