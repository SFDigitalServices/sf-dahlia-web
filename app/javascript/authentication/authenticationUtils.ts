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

export const getClerkErrorCode = (error: unknown): string | undefined => {
  const code = (error as ClerkErrorWithCodes | null)?.errors?.[0]?.code
  return typeof code === "string" ? code : undefined
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
