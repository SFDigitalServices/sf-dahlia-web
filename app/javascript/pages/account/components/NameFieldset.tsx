import { Field, t } from "@bloom-housing/ui-components"
import React from "react"
import { UseFormMethods } from "react-hook-form"
import Fieldset from "./Fieldset"
import { ErrorMessages } from "./ErrorSummaryBanner"
import { ExpandedAccountAxiosError, getErrorMessage, SetErrorArgs } from "./util"

interface NameFieldsetProps {
  register: UseFormMethods["register"]
  errors: UseFormMethods["errors"]
  defaultFirstName?: string
  defaultMiddleName?: string
  defaultLastName?: string
  onChange?: () => void
}

export const handleNameServerErrors = (
  name: "firstName" | "lastName",
  error: ExpandedAccountAxiosError
): SetErrorArgs => {
  return error?.response?.status === 422 && error?.response?.data?.errors?.full_messages.length > 0
    ? [
        name,
        error.response.data?.errors?.[name].includes("is empty")
          ? { message: `name:${name}`, shouldFocus: true }
          : { message: "name:server:generic", shouldFocus: true },
      ]
    : [name, { message: "name:server:generic", shouldFocus: true }]
}

export const nameFieldsetErrors: ErrorMessages = {
  "name:firstName": {
    default: "error.account.firstName",
    abbreviated: "error.account.firstName",
  },
  "name:lastName": {
    default: "error.account.lastName",
    abbreviated: "error.account.lastName",
  },
  "name:server:generic": {
    default: "error.account.genericServerError",
    abbreviated: "error.account.genericServerError.abbreviated",
  },
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
          errors.firstName?.message &&
          getErrorMessage(errors.firstName?.message as string, nameFieldsetErrors, false)
        }
        defaultValue={defaultFirstName ?? null}
        validation={{
          required: "name:firstName",
          validate: (data: string) => data.trim() !== "" || "name:firstName",
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
          errors.lastName?.message &&
          getErrorMessage(errors.lastName?.message as string, nameFieldsetErrors, false)
        }
        defaultValue={defaultLastName ?? null}
        error={errors.lastName}
        register={register}
        validation={{
          required: "name:lastName",
          validate: (data: string) => data.trim() !== "" || "name:firstName",
        }}
        onChange={onChange}
      />
    </Fieldset>
  )
}

export default NameFieldset
