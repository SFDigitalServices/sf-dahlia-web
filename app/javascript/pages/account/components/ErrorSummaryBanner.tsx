import React from "react"
import { t } from "@bloom-housing/ui-components"
import { Alert } from "@bloom-housing/ui-seeds"
import { DeepMap, FieldValues, FieldError } from "react-hook-form"
import { renderInlineMarkup } from "../../../util/languageUtil"
import { nameFieldsetErrors } from "./NameFieldset"
import { dobFieldsetErrors } from "./DOBFieldset"
import { passwordFieldsetErrors } from "./PasswordFieldset"
import { emailFieldsetErrors } from "./EmailFieldset"

interface ErrorMessage {
  default: string
  abbreviated: string
}

export type ErrorMessages = {
  [key: string]: ErrorMessage
}

export const getErrorMessage = (
  errorCode: string,
  errorMessages: ErrorMessages,
  abbreviated?: boolean
) => {
  const error: ErrorMessage = errorMessages[errorCode]
  return abbreviated ? t(error.abbreviated) : t(error.default)
}

export const UnifiedErrorMessageMap: ErrorMessages = {
  ...emailFieldsetErrors,
  ...nameFieldsetErrors,
  ...dobFieldsetErrors,
  ...passwordFieldsetErrors,
}

export const ErrorSummaryBanner = ({
  errors,
  messageMap,
}: {
  errors: DeepMap<FieldValues, FieldError>
  messageMap?: (message: string) => string
}) => {
  if (Object.keys(errors).length === 0) {
    return null
  }

  return (
    <Alert fullwidth variant="alert" className="">
      {t("error.accountBanner.header")}
      <ul className="list-disc list-inside pl-2 pt-1">
        {Object.keys(errors).map((key: string) => {
          let fieldError = errors[key]

          if (messageMap && fieldError.message && typeof fieldError.message === "string") {
            fieldError = {
              ...fieldError,
              message: messageMap(fieldError.message as string),
            }
          }

          return fieldError && fieldError.message ? (
            <li key={key}>
              <button
                type="button"
                className="text-blue-500 cursor-pointer background-none border-none p-0 text-left"
                onClick={() => {
                  if (fieldError.ref) {
                    fieldError.ref.scrollIntoView({ behavior: "smooth" })
                    fieldError.ref.focus()
                  }
                }}
              >
                {renderInlineMarkup(fieldError.message as string)}
              </button>
            </li>
          ) : null
        })}
      </ul>
    </Alert>
  )
}
