/* eslint-disable @typescript-eslint/unbound-method */
import React from "react"
import { t, FieldGroup } from "@bloom-housing/ui-components"
import { useFormContext } from "react-hook-form"

interface RadioProps {
  label: string
  hideLabel?: boolean
  options: { id: string; label: string; value: string }[]
  errorMessage: string
  fieldNames: {
    answer: string
  }
}

const Radio = ({ label, errorMessage, hideLabel, options, fieldNames: { answer } }: RadioProps) => {
  const {
    register,
    formState: { errors },
  } = useFormContext()

  const translatedOptions = options.map((option) => ({ ...option, label: t(option.label) }))

  return (
    <fieldset>
      <legend className={hideLabel ? "sr-only" : ""}>{t(label)}</legend>
      <FieldGroup
        fieldGroupClassName="radio-field-group"
        fieldClassName="radio-field"
        type="radio"
        name={answer}
        error={!!errors?.[answer]}
        errorMessage={t(errorMessage)}
        register={register}
        validation={{ required: true }}
        fields={translatedOptions}
      />
    </fieldset>
  )
}

export default Radio
