import { FieldGroup, t } from "@bloom-housing/ui-components"
import React, { useEffect, useRef } from "react"
import { useFormStepContext } from "../../../formEngine/formStepContext"

interface PrioritiesCheckboxProps {
  description: string
  members: {
    dataSource: string
    dataKey: string
  }
  fieldNames: {
    priorityMembers: string
  }
}

const PrioritiesCheckbox = ({
  description,
  fieldNames: { priorityMembers },
}: PrioritiesCheckboxProps) => {
  const { register, errors, watch, setValue } = useFormStepContext()
  const selectedCheckboxValues = watch(priorityMembers)
  const previousValuesRef = useRef(selectedCheckboxValues || [])

  useEffect(() => {
    if (!selectedCheckboxValues) return
    const newCheckboxValue = selectedCheckboxValues.filter(
      (value) => !previousValuesRef.current.includes(value)
    )

    if (newCheckboxValue.includes("noImpairments")) {
      setValue(priorityMembers, ["noImpairments"])
    } else if (selectedCheckboxValues.includes("noImpairments") && newCheckboxValue.length > 0) {
      setValue(
        priorityMembers,
        selectedCheckboxValues.filter((value) => value !== "noImpairments")
      )
    }

    previousValuesRef.current = selectedCheckboxValues
  }, [selectedCheckboxValues, setValue, priorityMembers])

  return (
    <FieldGroup
      name={priorityMembers}
      type="checkbox"
      groupLabel={t(description)}
      fields={[
        {
          label: t("label.mobilityImpairments"),
          value: "mobilityImpairment",
          id: "mobilityImpairment",
        },
        {
          label: t("label.visionImpairments"),
          value: "visionImpairment",
          id: "visionImpairment",
        },
        {
          label: t("label.hearingImpairments"),
          value: "hearingImpairment",
          id: "hearingImpairment",
        },
        {
          label: t("t.no"),
          value: "noImpairments",
          id: "noImpairments",
        },
      ]}
      fieldGroupClassName="radio-field-group"
      fieldClassName="radio-field"
      register={register}
      error={!!errors?.[priorityMembers]}
      errorMessage={t("error.pleaseSelectAnOption")}
      validation={{
        required: true,
      }}
    />
  )
}

export default PrioritiesCheckbox
