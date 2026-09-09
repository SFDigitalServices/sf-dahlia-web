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

/** True once the initial "is anyone signed in?" question has an answer. */
export const isAuthInitialized = (status: AuthStatus): boolean => status.kind !== "initializing"

/** What a request needs to authenticate itself, without naming a provider. */
export type AuthCredentials =
  /** No usable session. A request made with these will not authenticate. */
  | { kind: "none" }
  | { kind: "bearerToken"; token: string }

export const NO_CREDENTIALS: AuthCredentials = { kind: "none" }

export type ClerkStatusInput = {
  /** Clerk has finished booting. */
  isLoaded: boolean
  isSignedIn: boolean
}

/**
 * Once Clerk has booted, its answer is the answer. Nothing here waits on the
 * profile: a signed-in user on their way to add-profile is still signed in.
 */
export const deriveClerkStatus = ({ isLoaded, isSignedIn }: ClerkStatusInput): AuthStatus => {
  if (!isLoaded) return INITIALIZING
  return isSignedIn ? SIGNED_IN : SIGNED_OUT
}

/**
 * The bearer token, when the session has one. `undefined` means no usable
 * session, so callers may treat it as an error — true only while every provider
 * here issues tokens.
 */
export const bearerToken = (credentials: AuthCredentials): string | undefined =>
  credentials.kind === "bearerToken" ? credentials.token : undefined

/**
 * The questions a component may ask. Providers are indistinguishable.
 *
 * Ending the session belongs here too, but no caller needs it yet — the
 * sign-out buttons still branch on the flag. Add it with its first consumer.
 */
export type AuthSession = {
  status: AuthStatus
  getCredentials: () => Promise<AuthCredentials>
}
