import { Field, t } from "@bloom-housing/ui-components"
import React from "react"
import { UseFormMethods } from "react-hook-form"
import Fieldset from "./Fieldset"

interface NameFieldsetProps {
  register: UseFormMethods["register"]
  errors: UseFormMethods["errors"]
  defaultFirstName?: string
  defaultMiddleName?: string
  defaultLastName?: string
  onChange?: () => void
}

const NameFieldset = ({
  register,
  onChange,
  errors,
  defaultFirstName,
  defaultMiddleName,
  defaultLastName,
}: NameFieldsetProps) => {
  const hasError = errors?.firstName || errors?.lastName || errors?.middleName

  return (
    <Fieldset hasError={hasError} label={t("label.name")}>
      <Field
        className="mb-4"
        name="firstName"
        label={t("label.firstName.sentenceCase")}
        register={register}
        error={errors.firstName !== undefined}
        errorMessage={t("error.firstName")}
        defaultValue={defaultFirstName ?? null}
        validation={{ required: true }}
        onChange={onChange}
      />
      <Field
        className="mb-4"
        name="middleName"
        label={`${t("label.middleName.sentenceCase")} (${t("t.optional.lowercase")})`}
        error={errors.middleName}
        defaultValue={defaultMiddleName ?? null}
        register={register}
        onChange={onChange}
      />
      <Field
        className="mb-4"
        name="lastName"
        label={t("label.lastName.sentenceCase")}
        errorMessage={t("error.lastName")}
        defaultValue={defaultLastName ?? null}
        error={errors.lastName}
        register={register}
        validation={{ required: true }}
        onChange={onChange}
      />
    </Fieldset>
  )
}

export default NameFieldset
