interface ClerkErrorWithCodes {
  errors?: Array<{ code?: unknown }>
}

export enum AUTH_TOAST_TO_RENDER {
  SIGNED_IN = "signedIn",
  SIGNED_OUT = "signedOut",
  RESET_PASSWORD = "resetPassword",
}

const AUTH_TOAST_KEY = "authToastToRender"
const AUTH_TOAST_VALUES = new Set<AUTH_TOAST_TO_RENDER>(Object.values(AUTH_TOAST_TO_RENDER))

const isAUTH_TOAST_TO_RENDER = (value: unknown): value is AUTH_TOAST_TO_RENDER =>
  typeof value === "string" && AUTH_TOAST_VALUES.has(value as AUTH_TOAST_TO_RENDER)

const getClerkErrorCode = (error: unknown): string | undefined => {
  const code = (error as ClerkErrorWithCodes | null)?.errors?.[0]?.code
  return typeof code === "string" ? code : undefined
}

export enum AUTH_ERROR {
  CODE_RATE_LIMITED = "codeRateLimited",
  CODE_INCORRECT = "codeIncorrect",
  CODE_EXPIRED = "codeExpired",
  EMAIL_EXISTS = "emailExists",
  EMAIL_INVALID_FORMAT = "emailInvalidFormat",
  PASSWORD_INCORRECT = "passwordIncorrect",
  PASSWORD_REJECTED = "passwordRejected",
  NEEDS_SIGN_UP = "needsSignUp",
  UNKNOWN = "unknown",
}

// Maps Clerk error codes to app-level errors. Add new Clerk codes here.
const clerkErrorCodes = new Map<string, AUTH_ERROR>([
  ["verification_code_rate_limit_exceeded", AUTH_ERROR.CODE_RATE_LIMITED],
  ["verification_code_too_many_requests", AUTH_ERROR.CODE_RATE_LIMITED],
  ["form_code_incorrect", AUTH_ERROR.CODE_INCORRECT],
  ["verification_expired", AUTH_ERROR.CODE_EXPIRED],
  ["form_password_incorrect", AUTH_ERROR.PASSWORD_INCORRECT],
  ["sign_up_if_missing_transfer", AUTH_ERROR.NEEDS_SIGN_UP],
])

// Prefix matches, checked in order only when there is no exact match above.
const clerkErrorCodePrefixes: Array<[string, AUTH_ERROR]> = [
  ["form_identifier_exists", AUTH_ERROR.EMAIL_EXISTS],
  ["form_param_format_invalid", AUTH_ERROR.EMAIL_INVALID_FORMAT],
  ["form_password_", AUTH_ERROR.PASSWORD_REJECTED],
]

export const getAuthError = (error: unknown): AUTH_ERROR => {
  const code = getClerkErrorCode(error)
  if (!code) return AUTH_ERROR.UNKNOWN
  return (
    clerkErrorCodes.get(code) ??
    clerkErrorCodePrefixes.find(([prefix]) => code.startsWith(prefix))?.[1] ??
    AUTH_ERROR.UNKNOWN
  )
}

export const queueAuthenticationToast = (toastToRender: unknown): void => {
  if (!isAUTH_TOAST_TO_RENDER(toastToRender)) return
  window.sessionStorage.setItem(AUTH_TOAST_KEY, toastToRender)
}

export const consumeAuthenticationToast = (): AUTH_TOAST_TO_RENDER | null => {
  const toastToRender = window.sessionStorage.getItem(AUTH_TOAST_KEY)
  if (!toastToRender) return null

  window.sessionStorage.removeItem(AUTH_TOAST_KEY)
  return isAUTH_TOAST_TO_RENDER(toastToRender) ? toastToRender : null
}
