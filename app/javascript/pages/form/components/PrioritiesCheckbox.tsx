/* eslint-disable @typescript-eslint/unbound-method */
import { FieldGroup, t } from "@bloom-housing/ui-components"
import React, { useEffect, useRef } from "react"
import { useFormContext } from "react-hook-form"
import styles from "./PrioritiesCheckbox.module.scss"
import { LISTING_PRIORITY_OPTIONS } from "../../../modules/constants"

interface PrioritiesCheckboxProps {
  description: string
  fieldNames: {
    priorityMembers: string
  }
}

const PrioritiesCheckbox = ({
  description,
  fieldNames: { priorityMembers },
}: PrioritiesCheckboxProps) => {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext()
  const selectedCheckboxValues = watch(priorityMembers)
  const previousValuesRef = useRef(selectedCheckboxValues || [])
  const priority_fields = LISTING_PRIORITY_OPTIONS.map((option) => ({
    label: t(option.label),
    value: option.value,
    id: option.value,
  }))

  useEffect(() => {
    if (!selectedCheckboxValues) return
    const newCheckboxValue = selectedCheckboxValues.filter(
      (value) => !previousValuesRef.current.includes(value)
    )

    if (newCheckboxValue.includes("No impairments")) {
      setValue(priorityMembers, ["No impairments"])
    } else if (selectedCheckboxValues.includes("No impairments") && newCheckboxValue.length > 0) {
      setValue(
        priorityMembers,
        selectedCheckboxValues.filter((value) => value !== "No impairments")
      )
    }

    previousValuesRef.current = selectedCheckboxValues
  }, [selectedCheckboxValues, setValue, priorityMembers])

  return (
    <div className={styles["listing-priorities-checkbox-group"]}>
      <FieldGroup
        name={priorityMembers}
        type="checkbox"
        groupLabel={t(description)}
        fields={priority_fields}
        fieldGroupClassName="radio-field-group"
        register={register}
        error={!!errors?.[priorityMembers]}
        errorMessage={t("error.pleaseSelectAnOption")}
        validation={{
          required: true,
        }}
      />
    </div>
  )
}

export default PrioritiesCheckbox
