/**
 * The three states an auth check can settle into. A union, so "still working it
 * out" is a state rather than the absence of one.
 *
 * Says nothing about the DAHLIA profile — that is the profile store's question,
 * and keeping them apart is what lets the store depend on this layer without
 * this layer reading back.
 */
export type AuthStatus = { kind: "initializing" } | { kind: "signedOut" } | { kind: "signedIn" }

export const INITIALIZING: AuthStatus = { kind: "initializing" }
export const SIGNED_OUT: AuthStatus = { kind: "signedOut" }
export const SIGNED_IN: AuthStatus = { kind: "signedIn" }

export const isAuthInitialized = (status: AuthStatus): boolean => status.kind !== "initializing"

export type AuthCredentials = { kind: "none" } | { kind: "bearerToken"; token: string }

export const NO_CREDENTIALS: AuthCredentials = { kind: "none" }

export type ClerkStatusInput = {
  isLoaded: boolean
  isSignedIn: boolean
}

export const deriveClerkStatus = ({ isLoaded, isSignedIn }: ClerkStatusInput): AuthStatus => {
  if (!isLoaded) return INITIALIZING
  return isSignedIn ? SIGNED_IN : SIGNED_OUT
}

export const bearerToken = (credentials: AuthCredentials): string | undefined =>
  credentials.kind === "bearerToken" ? credentials.token : undefined

export type AuthSession = {
  status: AuthStatus
  getCredentials: () => Promise<AuthCredentials>
  signOut: () => Promise<void>
}
