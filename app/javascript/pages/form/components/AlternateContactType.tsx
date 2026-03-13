/* eslint-disable @typescript-eslint/unbound-method */
import React from "react"
import { t, FieldGroup, Field } from "@bloom-housing/ui-components"
import { useFormStepContext } from "../../../formEngine/formStepContext"
import { LISTING_APPLY_FORMS_INPUT_MAX_LENGTH, LATIN_REGEX } from "../../../modules/constants"

const ALTERNATE_CONTACT_OPTIONS = [
  { id: "familyMember", label: "label.family_member", value: "Family Member" },
  { id: "friend", label: "label.friend", value: "Friend" },
  {
    id: "socialWorker",
    label: "label.social_worker_or_housing_counselor",
    value: "Social Worker or Housing Counselor",
  },
  { id: "other", label: "label._other", value: "Other" },
  { id: "noAlternateContact", label: "label.no_alternate_contact", value: "None" },
]

interface AlternateContactTypeProps {
  fieldNames: {
    alternateContactType: string
    alternateContactTypeOther?: string
  }
}

const AlternateContactType = ({
  fieldNames: { alternateContactType, alternateContactTypeOther = "alternateContactTypeOther" },
}: AlternateContactTypeProps) => {
  const { register, errors, watch } = useFormStepContext()

  const selectedType = watch?.(alternateContactType) as string
  const isOther = selectedType === "Other"

  const options = ALTERNATE_CONTACT_OPTIONS.map((opt) => ({
    id: opt.id,
    label: t(opt.label),
    value: opt.value,
    defaultChecked: false,
  }))

  return (
    <fieldset>
      <legend className="legend-header">{t("label.alternate_contact")}</legend>
      <p className="field-note mb-4">{t("label.please_select_one")}</p>
      <FieldGroup
        name={alternateContactType}
        type="radio"
        fields={options}
        register={register}
        validation={{ required: true }}
        error={!!errors?.[alternateContactType]}
        errorMessage={t("error.alternate_contact")}
        fieldGroupClassName="radio-field-group"
        fieldClassName="radio-field"
      />
      {isOther && (
        <div className="mt-4">
          <Field
            name={alternateContactTypeOther}
            label={t("label.what_is_your_relationship")}
            placeholder={t("label.what_is_your_relationship")}
            register={register}
            validation={{
              required: isOther,
              maxLength: LISTING_APPLY_FORMS_INPUT_MAX_LENGTH.alternateContactTypeOther,
              pattern: {
                value: LATIN_REGEX,
                message: t("error.pleaseProvideAnswersInEnglish"),
              },
            }}
            error={!!errors?.[alternateContactTypeOther]}
            errorMessage={
              errors?.[alternateContactTypeOther]?.type === "required"
                ? t("error.relationship")
                : errors?.[alternateContactTypeOther]?.message
            }
          />
        </div>
      )}
    </fieldset>
  )
}

export default AlternateContactType
