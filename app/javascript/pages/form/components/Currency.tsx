/* eslint-disable @typescript-eslint/unbound-method */
import React from "react"
import { t, Field } from "@bloom-housing/ui-components"
import { useFormContext } from "react-hook-form"

interface CurrencyProps {
  label: string
  note?: string
  errorMessage: string
  fieldNames: {
    amount: string
  }
}

const Currency = ({ label, note, errorMessage, fieldNames: { amount } }: CurrencyProps) => {
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
      prepend={"$"}
      subNote={t(note)}
      setValue={setValue} // Field component uses setValue and getValues for currency input types
      getValues={getValues}
      validation={{ required: true, min: 0.01 }}
    />
  )
}

export default Currency
