import React from "react"
import { t } from "@bloom-housing/ui-components"
import { Alert } from "@bloom-housing/ui-seeds"
import { DeepMap, FieldValues, FieldError } from "react-hook-form"
import { renderInlineMarkup } from "../../../util/languageUtil"
import { nameFieldsetErrors } from "./NameFieldset"
import { dobFieldsetErrors } from "./DOBFieldset"
import { passwordFieldsetErrors } from "./PasswordFieldset"
import { emailFieldsetErrors } from "./EmailFieldset"
import "./ErrorSummaryBanner.scss"

export const scrollToErrorOnSubmit =
  (ref: React.MutableRefObject<HTMLSpanElement>) => (errors: DeepMap<FieldValues, FieldError>) => {
    if (Object.keys(errors).length === 0) {
      return
    }

    if (Object.keys(errors).length === 1) {
      const key = Object.keys(errors)[0]
      const fieldError = errors[key]

      if (fieldError && fieldError.ref) {
        console.log("scrolling to error", fieldError)
        fieldError.ref.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    } else {
      console.log("scrolling to list", ref)
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

  // if there is only one error then scroll to it

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
