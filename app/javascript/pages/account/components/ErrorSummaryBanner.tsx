import React from "react"
import { t } from "@bloom-housing/ui-components"
import { Alert } from "@bloom-housing/ui-seeds"
import { DeepMap, FieldValues, FieldError } from "react-hook-form"
import { renderInlineMarkup } from "../../../util/languageUtil"
import { nameFieldsetErrors } from "./NameFieldset"
import { dobFieldsetErrors, DOBFieldValues } from "./DOBFieldset"
import { passwordFieldsetErrors } from "./PasswordFieldset"
import { emailFieldsetErrors } from "./EmailFieldset"
import "./ErrorSummaryBanner.scss"

const handleScrollToDOBError = (errors: DeepMap<FieldValues, FieldError>) => {
  const errorKeys = Object.keys(errors)
  const dobErrors: DeepMap<DOBFieldValues, FieldError> = errors[errorKeys[0]]
  if (dobErrors) {
    const dobErrorKeys = Object.keys(dobErrors)
    if (dobErrorKeys.length > 0 && dobErrors[dobErrorKeys[0]]?.ref) {
      dobErrors[dobErrorKeys[0]].ref.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }
}

export const scrollToErrorOnSubmit =
  (ref: React.MutableRefObject<HTMLSpanElement>) => (errors: DeepMap<FieldValues, FieldError>) => {
    const errorKeys = Object.keys(errors)

    if (errorKeys.length === 0) return

    if (errorKeys.length === 1 && errorKeys[0] === "dobObject") {
      handleScrollToDOBError(errors)
      return
    }

    if (errorKeys.length === 1 && errors[errorKeys[0]]?.ref) {
      errors[errorKeys[0]].ref.scrollIntoView({ behavior: "smooth", block: "center" })
    } else {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

export interface ErrorMessage {
  default: string
  abbreviated: string
}

export type ErrorMessages = {
  [key: string]: ErrorMessage
}

export const UnifiedErrorMessageMap: ErrorMessages = {
  ...nameFieldsetErrors,
  ...dobFieldsetErrors,
  ...passwordFieldsetErrors,
  ...emailFieldsetErrors,
}

export const ErrorSummaryBanner = ({
  errors,
  messageMap,
}: {
  errors: DeepMap<FieldValues, FieldError>
  messageMap?: (message: string) => string
}) => {
  const listRef = React.useRef<HTMLUListElement>(null)

  if (Object.keys(errors).length === 0) {
    return null
  }

  return (
    <Alert fullwidth variant="alert">
      {t("error.accountBanner.header")}
      <ul className="list-disc list-inside pl-2 pt-1" ref={listRef}>
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
                    fieldError.ref.scrollIntoView({ behavior: "smooth", block: "center" })
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
