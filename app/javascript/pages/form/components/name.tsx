import React from "react"
import { t, Field } from "@bloom-housing/ui-components"
import { Heading } from "@bloom-housing/ui-seeds"
import { LATIN_REGEX, LISTING_APPLY_FORMS_INPUT_MAX_LENGTH } from "../../../modules/constants"
import { useFormStepContext } from "../../../formEngine/formStepContext"

type NameProps = {
  label: string
  fieldNames: {
    firstName: string
    middleName: string
    lastName: string
  }
  showMiddleName: true
}

const Name = ({
  label,
  fieldNames: { firstName, middleName, lastName },
  showMiddleName,
}: NameProps) => {
  const { register, errors } = useFormStepContext()
  return (
    <fieldset>
      <Heading priority={2} size="sm">
        {t(label)}
      </Heading>
      <Field
        name={firstName}
        label={t("label.firstName.sentenceCase")}
        register={register}
        validation={{
          required: true,
          maxLength: LISTING_APPLY_FORMS_INPUT_MAX_LENGTH.firstName,
          pattern: LATIN_REGEX,
        }}
        error={!!errors?.[firstName]}
        errorMessage={errors?.[firstName] ? t("error.firstName") : ""}
      />
      {showMiddleName && (
        <Field
          name={middleName}
          label={`${t("label.middleName.sentenceCase")} (${t("t.optional.lowercase")})`}
          register={register}
          validation={{
            maxLength: LISTING_APPLY_FORMS_INPUT_MAX_LENGTH.middleName,
            pattern: LATIN_REGEX,
          }}
          error={!!errors?.[middleName]}
          errorMessage={errors?.[middleName] ? t("error.pleaseProvideAnswersInEnglish") : ""}
        />
      )}
      <Field
        name={lastName}
        label={t("label.lastName.sentenceCase")}
        register={register}
        validation={{
          required: true,
          maxLength: LISTING_APPLY_FORMS_INPUT_MAX_LENGTH.lastName,
          pattern: LATIN_REGEX,
        }}
        error={!!errors?.[lastName]}
        errorMessage={errors?.[lastName] ? t("error.lastName") : ""}
      />
    </fieldset>
  )
}

export default Name
