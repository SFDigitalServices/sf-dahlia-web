import { t } from "@bloom-housing/ui-components"
import { ErrorMessages, ErrorMessage } from "./ErrorSummaryBanner"

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
