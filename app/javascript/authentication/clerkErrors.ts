// A ClerkAPIResponseError sets its own `code` to the generic "api_response_error"
// and carries the specific codes in an `errors` array. That array is not on the
// ClerkError type the v6 future APIs return, and neither the type nor Clerk's
// isClerkAPIResponseError guard is re-exported from @clerk/react, so narrow here.
interface ClerkErrorShape {
  code?: string
  errors?: { code?: string }[]
}

/**
 * Returns the specific Clerk error code (e.g. "form_identifier_exists"),
 * preferring the API response's first error over the generic wrapper code.
 */
export const getClerkErrorCode = (error: unknown): string | undefined => {
  if (!error || typeof error !== "object") return undefined
  const clerkError = error as ClerkErrorShape
  return clerkError.errors?.[0]?.code ?? clerkError.code
}
