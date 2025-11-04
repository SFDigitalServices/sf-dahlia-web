import React from "react"
import { t, FieldGroup } from "@bloom-housing/ui-components"
import { useFormStepContext } from "../../../formEngine/formStepContext"

interface RadioProps {
  label: string
  hideLabel?: boolean
  options: { id: string; label: string; value: string }[]
  errorMessage: string
  fieldNames: {
    answer: string
  }
}

const Radio = ({ label, hideLabel, options, fieldNames: { answer } }: RadioProps) => {
  const { register, errors } = useFormStepContext()

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
        errorMessage={t("errors.selectOption")}
        register={register}
        validation={{ required: true }}
        fields={translatedOptions}
      />
    </fieldset>
  )
}

export default Radio
