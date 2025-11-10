import React from "react"
import { t, Field } from "@bloom-housing/ui-components"
import { Heading } from "@bloom-housing/ui-seeds"
import { LATIN_REGEX, LISTING_APPLY_FORMS_INPUT_MAX_LENGTH } from "../../../modules/constants"
import { useFormContext } from "react-hook-form"

type NameProps = {
  label: string
  fieldNames: {
    firstName: string
    middleName: string
    lastName: string
  }
  showMiddleName: boolean
}

const Name = ({
  label,
  fieldNames: { firstName, middleName, lastName },
  showMiddleName,
}: NameProps) => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { register, errors } = useFormContext()
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
          pattern: {
            value: LATIN_REGEX,
            message: t("error.pleaseProvideAnswersInEnglish"),
          },
        }}
        error={!!errors?.[firstName]}
        errorMessage={
          errors?.[firstName]?.type === "required"
            ? t("error.firstName")
            : errors?.[firstName]?.message
        }
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
          pattern: {
            value: LATIN_REGEX,
            message: t("error.pleaseProvideAnswersInEnglish"),
          },
        }}
        error={!!errors?.[lastName]}
        errorMessage={
          errors?.[lastName]?.type === "required"
            ? t("error.lastName")
            : errors?.[lastName]?.message
        }
      />
    </fieldset>
  )
}

export default Name
