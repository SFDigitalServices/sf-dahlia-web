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

const getValidation = (fieldName: string, required: boolean) => ({
  required: required ? t(`error.${fieldName}`) : false,
  pattern: {
    value: LATIN_REGEX,
    message: t(`error.${fieldName}`),
  },
  maxLength: {
    value: LISTING_APPLY_FORMS_INPUT_MAX_LENGTH[fieldName],
    message: t(`error.${fieldName}`),
  },
})

const Name = ({ label, fieldNames, showMiddleName }: NameProps) => {
  const { register, errors, trigger } = useFormStepContext()
  const { firstName, middleName, lastName } = fieldNames
  return (
    <fieldset>
      <Heading priority={2} size="sm">
        {t(label)}
      </Heading>
      <Field
        name={firstName}
        label={t("label.firstName.sentenceCase")}
        register={register}
        validation={getValidation("firstName", true)}
        error={errors.firstName}
        errorMessage={errors?.firstName && t("error.firstName")}
        inputProps={{ onBlur: () => trigger(firstName) }}
      />
      {showMiddleName && (
        <Field
          name={middleName}
          label={`${t("label.middleName.sentenceCase")} (${t("t.optional.lowercase")})`}
          register={register}
          validation={getValidation("middleName", false)}
          error={errors.middleName}
          errorMessage={errors?.middleName && t("error.pleaseProvideAnswersInEnglish")}
          inputProps={{ onBlur: () => trigger(middleName) }}
        />
      )}
      <Field
        name={lastName}
        label={t("label.lastName.sentenceCase")}
        register={register}
        validation={getValidation("lastName", true)}
        error={errors.lastName}
        errorMessage={errors?.lastName && t("error.lastName")}
        inputProps={{ onBlur: () => trigger(lastName) }}
      />
    </fieldset>
  )
}

export default Name
