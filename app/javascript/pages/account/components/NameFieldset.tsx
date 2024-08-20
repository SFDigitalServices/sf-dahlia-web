import { Field, t } from "@bloom-housing/ui-components"
import React from "react"
import { ErrorOption, UseFormMethods } from "react-hook-form"
import Fieldset from "./Fieldset"

interface NameFieldsetProps {
  register: UseFormMethods["register"]
  errors: UseFormMethods["errors"]
  defaultFirstName?: string
  defaultMiddleName?: string
  defaultLastName?: string
  onChange?: () => void
}

export const handleDOBServerErrors =
  (setError: (name: string, error: ErrorOption) => void) => () => {
    setError("firstName", { message: "error:name:generic", shouldFocus: true })
  }

export const nameErrorsMap = (errorKey: string, abbreviated: boolean) => {
  if (errorKey) {
    switch (errorKey) {
      case "error:name:generic":
        return abbreviated ? t("error.account.name.abbreviated") : t("error.account.name")
      case "error:firstName":
        return t("error.account.firstName")
      case "error:lastName":
        return t("error.account.lastName")
      default:
        return abbreviated
          ? t("error.account.genericServerError.abbreviated")
          : t("error.account.genericServerError")
    }
  }
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
        errorMessage={
          errors.firstName?.message && nameErrorsMap(errors.firstName.message as string, false)
        }
        defaultValue={defaultFirstName ?? null}
        validation={{
          required: "error:firstName",
        }}
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
        errorMessage={
          errors.lastName?.message && nameErrorsMap(errors.lastName.message as string, false)
        }
        defaultValue={defaultLastName ?? null}
        error={errors.lastName}
        register={register}
        validation={{ required: "error:lastName" }}
        onChange={onChange}
      />
    </Fieldset>
  )
}

export default NameFieldset
