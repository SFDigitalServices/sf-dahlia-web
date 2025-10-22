import React from "react"
import { t, Select } from "@bloom-housing/ui-components"
import { useFormStepContext } from "../../../formEngine/formStepContext"

interface FormSelectProps {
  label: string
  defaultOptionName: string
  options: { name: string; value: string }[]
  fieldNames: {
    selection: string
  }
}

const FormSelect = ({
  label,
  defaultOptionName,
  options,
  fieldNames: { selection },
}: FormSelectProps) => {
  const { register, errors } = useFormStepContext()
  const selectOptions = options.map((option) => ({
    label: t(option.name),
    value: option.value,
  }))

  return (
    <>
      <Select
        id={selection}
        name={selection}
        label={t(label)}
        options={selectOptions}
        placeholder={t(defaultOptionName)}
        controlClassName="control"
        register={register}
        error={!!errors?.[selection]}
        errorMessage={t("error.householdMemberRelationship")}
        validation={{
          required: true,
        }}
      />
    </>
  )
}

export default FormSelect
