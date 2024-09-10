import { t } from "@bloom-housing/ui-components"
import { ErrorMessages, ErrorMessage } from "./ErrorSummaryBanner"
import { AxiosError } from "axios"

export type ExpandedAccountAxiosError = AxiosError<{
  errors: {
    email: string[]
    password: string[]
    DOB: string[]
    full_messages: string[]
    firstName: string[]
    lastName: string[]
  }
}>

export const getErrorMessage = (
  errorCode: string,
  errorMessages: ErrorMessages,
  abbreviated?: boolean
) => {
  const error: ErrorMessage = errorMessages[errorCode]
  if (abbreviated && error?.abbreviated) {
    return t(error.abbreviated)
  } else if (error?.default) {
    return t(error.default)
  } else return undefined
}
