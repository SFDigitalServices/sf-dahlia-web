import { Field, t } from "@bloom-housing/ui-components"
import React from "react"
import { UseFormMethods } from "react-hook-form"

interface NameFieldsetProps {
  register: UseFormMethods["register"]
  errors: UseFormMethods["errors"]
  defaultFirstName?: string
  defaultMiddleName?: string
  defaultLastName?: string
}

const NameFieldset = ({
  register,
  errors,
  defaultFirstName,
  defaultMiddleName,
  defaultLastName,
}: NameFieldsetProps) => {
  const hasError = errors?.firstName || errors?.lastName || errors?.middleName

  return (
    <fieldset className="px-4 pb-4">
      <legend className={hasError ? "text-alert" : ""}>{t("label.name")}</legend>
      <Field
        name="firstName"
        label={t("label.firstName.sentenceCase")}
        register={register}
        error={errors.firstName !== undefined}
        errorMessage={t("error.firstName")}
        defaultValue={defaultFirstName ?? null}
        validation={{ required: true }}
      />
      <Field
        name="middleName"
        label={`${t("label.middleName.sentenceCase")} (${t("t.optional.lowercase")})`}
        error={errors.middleName}
        defaultValue={defaultMiddleName ?? null}
        register={register}
      />
      <Field
        name="lastName"
        label={t("label.lastName.sentenceCase")}
        errorMessage={t("error.lastName")}
        defaultValue={defaultLastName ?? null}
        error={errors.lastName}
        register={register}
        validation={{ required: true }}
      />
    </fieldset>
  )
}

export default NameFieldset
