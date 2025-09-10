import React from "react"
import { t, Field } from "@bloom-housing/ui-components"
import { Heading } from "@bloom-housing/ui-seeds"
import { LATIN_REGEX, LISTING_APPLY_FORMS_INPUT_MAX_LENGTH } from "../../../modules/constants"
import { useFormStepContext } from "../../../formEngine/formStepContext"

type NameProps = {
  label?: string
  fieldNames?: {
    firstName: string
    middleName: string
    lastName: string
  }
  showMiddleName?: true
}

const defaultFieldNames = {
  firstName: "label.firstName.sentenceCase",
  middleName: "label.firstName.sentenceCase",
  lastName: "label.firstName.sentenceCase",
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

const Name = ({
  label = "label.yourName",
  fieldNames = defaultFieldNames,
  showMiddleName,
}: NameProps) => {
  const { register, errors, trigger } = useFormStepContext()

  const fieldProps = (name: string) => ({
    name: name,
    label:
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      t(fieldNames[name]) + (name === "middleName" ? " (" + t("t.optional.lowercase") + ")" : ""),
    register,
    validation: getValidation(name, name !== "middleName"),
    error: !!errors?.[name],
    errorMessage: errors?.[name]?.message && t(errors[name].message as string),
    inputProps: { onBlur: () => trigger(name) },
  })

  return (
    <fieldset>
      <Heading priority={2} size="sm">
        {t(label)}
      </Heading>
      <Field {...fieldProps("firstName")} />
      {showMiddleName && <Field {...fieldProps("middleName")} />}
      <Field {...fieldProps("lastName")} />
    </fieldset>
  )
}

export default Name
