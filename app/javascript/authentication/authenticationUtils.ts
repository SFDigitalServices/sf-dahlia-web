interface ClerkErrorWithCodes {
  errors?: Array<{ code?: unknown }>
}

export const getClerkErrorCode = (error: unknown): string | undefined => {
  const code = (error as ClerkErrorWithCodes | null)?.errors?.[0]?.code
  return typeof code === "string" ? code : undefined
}
