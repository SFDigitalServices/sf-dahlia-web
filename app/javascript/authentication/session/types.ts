import { User } from "../user"

/**
 * The identity provider backing the current session.
 *
 * Consumers should not need this: it exists for analytics, debugging, and the
 * small number of call sites that genuinely have to behave differently (for
 * example the Angular bridge, which can only speak Devise). Anything that
 * branches on `provider` to answer "am I signed in" is a bug.
 */
export enum SessionProviderKind {
  Clerk = "clerk",
  Devise = "devise",
}

export enum SessionStatus {
  /**
   * We do not yet know whether anyone is signed in. Feature flags, the Clerk
   * client, or the profile request are still in flight. Render nothing that
   * depends on identity.
   */
  Loading = "loading",
  /** Nobody is signed in. */
  SignedOut = "signedOut",
  /**
   * Authenticated against the identity provider, but we have no Salesforce
   * Contact for them yet, so they cannot apply or view an account. They need to
   * finish onboarding at /add-profile.
   *
   * Only reachable under Clerk: a Devise session and a Contact were created
   * together, so the state could not exist.
   */
  SignedInWithoutProfile = "signedInWithoutProfile",
  /** Authenticated and we have their profile. The only state that can apply. */
  SignedIn = "signedIn",
}

/**
 * A discriminated union so that every identity-dependent decision is a total
 * function of one value. Switch on `status` and let the compiler tell you which
 * cases you have not handled, rather than composing `isLoaded`, `isSignedIn`,
 * `initialStateLoaded` and `profile` by hand at each call site.
 */
export type Session =
  | { status: SessionStatus.Loading }
  | { status: SessionStatus.SignedOut }
  | { status: SessionStatus.SignedInWithoutProfile; userId: string }
  | { status: SessionStatus.SignedIn; userId: string; profile: User }

export interface SessionContextValue {
  session: Session
  /** Which backend produced `session`. See the caveat on SessionProviderKind. */
  provider: SessionProviderKind
  /**
   * Synchronously true when credentials are present, before we know whether
   * they resolve to a usable profile. Available during Loading, which `session`
   * deliberately is not.
   *
   * For chrome only — deciding whether the header offers "Sign in" or "My
   * account", so a returning user does not see it flip after the profile
   * request lands. Never gate access or data on this; gate on `session`.
   */
  hasCredentials: boolean
  /**
   * End the session with whichever backend owns it, clearing the other's
   * leftovers. Callers must not also call Clerk's `signOut` or `clearHeaders`.
   */
  signOut: () => Promise<void>
  /**
   * End the session because the user went idle. Separate from `signOut` so the
   * sign-in page can explain why they were returned to it.
   */
  timeOut: () => Promise<void>
  /**
   * A bearer token for API calls, or null when credentials travel ambiently
   * (the Devise path reads its headers out of storage inside the API layer).
   *
   * Prefer letting the API layer call this over threading tokens through
   * component props.
   */
  getToken: () => Promise<string | null>
}

/** Narrowing helpers, so callers do not re-derive these from `status`. */
export const isLoading = (session: Session): boolean => session.status === SessionStatus.Loading

export const isSignedIn = (
  session: Session
): session is { status: SessionStatus.SignedIn; userId: string; profile: User } =>
  session.status === SessionStatus.SignedIn

/**
 * True when the identity provider knows them, whether or not we have a profile.
 * Use this for "should I offer sign in", not for "may they apply".
 */
export const isAuthenticated = (session: Session): boolean =>
  session.status === SessionStatus.SignedIn ||
  session.status === SessionStatus.SignedInWithoutProfile
