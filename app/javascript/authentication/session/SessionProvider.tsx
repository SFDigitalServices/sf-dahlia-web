import React from "react"
import { useAuth } from "@clerk/clerk-react"

import UserContext from "../context/UserContext"
import { clearHeaders, clearHeadersSignOut, clearHeadersTimeOut, isTokenValid } from "../token"
import { User } from "../user"
import { useFeatureFlag } from "../../hooks/useFeatureFlag"
import { UNLEASH_FLAG } from "../../modules/constants"
import SessionContext from "./SessionContext"
import { Session, SessionContextValue, SessionProviderKind, SessionStatus } from "./types"

interface SessionProviderProps {
  children?: React.ReactNode
}

const loadingSession: Session = { status: SessionStatus.Loading }
const signedOutSession: Session = { status: SessionStatus.SignedOut }

/**
 * Mirrors the loading rule the route guard used before this provider existed:
 * once Clerk reports a session we are still loading until the profile request
 * settles one way or the other.
 */
const clerkSession = (
  isLoaded: boolean,
  isSignedIn: boolean,
  userId: string | null | undefined,
  profile: User | undefined,
  initialStateLoaded: boolean
): Session => {
  if (!isLoaded) return loadingSession
  if (!isSignedIn) return signedOutSession
  if (profile) return { status: SessionStatus.SignedIn, userId: userId ?? "", profile }
  if (!initialStateLoaded) return loadingSession
  return { status: SessionStatus.SignedInWithoutProfile, userId: userId ?? "" }
}

/**
 * The profile is the session on the Devise path: there is no
 * authenticated-without-profile state, because registration created both.
 */
const deviseSession = (
  loading: boolean,
  initialStateLoaded: boolean,
  profile: User | undefined
): Session => {
  if (loading || !initialStateLoaded) return loadingSession
  if (!isTokenValid() || !profile) return signedOutSession
  return { status: SessionStatus.SignedIn, userId: String(profile.id), profile }
}

/**
 * Reads the Clerk session. Only ever mounted inside a ClerkProvider, because
 * useAuth throws without one and withAppSetup mounts ClerkProvider only when
 * the Clerk flag is on.
 */
const ClerkSessionSource = ({ children }: SessionProviderProps) => {
  const { isLoaded, isSignedIn, userId, signOut, getToken } = useAuth()
  const { profile, initialStateLoaded } = React.useContext(UserContext)

  // Ends the session only; where to go next is the caller's decision, since
  // both current callers already navigate once this resolves. Navigating here
  // too would race them.
  const endSession = React.useCallback(async () => {
    // A user who signed in under Devise before the flag flipped can still have
    // stale headers in storage.
    clearHeaders()
    await signOut()
  }, [signOut])

  const value: SessionContextValue = React.useMemo(
    () => ({
      session: clerkSession(
        Boolean(isLoaded),
        Boolean(isSignedIn),
        userId,
        profile,
        Boolean(initialStateLoaded)
      ),
      provider: SessionProviderKind.Clerk,
      hasCredentials: Boolean(isSignedIn),
      // Identical under Clerk: the two exist because the Devise path signals a
      // different reason to the sign-in page, and callers redirect differently.
      signOut: endSession,
      timeOut: endSession,
      // Asks Clerk each time rather than caching: session tokens are short
      // lived, so one held for a page's lifetime is often already expired.
      getToken: () => getToken(),
    }),
    [isLoaded, isSignedIn, userId, profile, initialStateLoaded, endSession, getToken]
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

/** Reads the Devise session out of UserContext and the stored header bundle. */
const DeviseSessionSource = ({ children }: SessionProviderProps) => {
  const {
    profile,
    loading,
    initialStateLoaded,
    signOut: contextSignOut,
    timeOut: contextTimeOut,
  } = React.useContext(UserContext)

  const value: SessionContextValue = React.useMemo(
    () => ({
      session: deviseSession(Boolean(loading), Boolean(initialStateLoaded), profile),
      provider: SessionProviderKind.Devise,
      hasCredentials: Boolean(isTokenValid()),
      // The context actions push analytics then dispatch, and the reducer
      // clears storage and navigates. They dereference profile.id unguarded,
      // so fall back to clearing storage directly when there is no profile.
      signOut: () => {
        profile && contextSignOut ? contextSignOut() : clearHeadersSignOut()
        return Promise.resolve()
      },
      timeOut: () => {
        profile && contextTimeOut ? contextTimeOut() : clearHeadersTimeOut()
        return Promise.resolve()
      },
      // Devise credentials travel ambiently: the API layer reads the header
      // bundle out of storage, so there is no bearer token to hand out.
      getToken: () => Promise.resolve(null),
    }),
    [loading, initialStateLoaded, profile, contextSignOut, contextTimeOut]
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

/** Provides the Loading session while we do not yet know which backend to ask. */
const UnresolvedSessionSource = ({ children }: SessionProviderProps) => {
  const value: SessionContextValue = React.useMemo(
    () => ({
      session: loadingSession,
      provider: SessionProviderKind.Devise,
      // Devise headers are readable synchronously, so header chrome can be
      // right even before we know which provider is active.
      hasCredentials: Boolean(isTokenValid()),
      signOut: () => Promise.resolve(),
      timeOut: () => Promise.resolve(),
      getToken: () => Promise.resolve(null),
    }),
    []
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

/**
 * Provides the one answer to "who is signed in", so that call sites stop
 * re-deciding the Clerk flag. This is the only place in the React app that
 * should know both auth backends exist.
 *
 * Must be mounted inside UserProvider, which owns the profile fetch.
 */
const SessionProvider = ({ children }: SessionProviderProps) => {
  const { unleashFlag: clerkEnabled, flagsReady } = useFeatureFlag(UNLEASH_FLAG.CLERK_AUTH, false)

  if (!flagsReady) {
    return <UnresolvedSessionSource>{children}</UnresolvedSessionSource>
  }

  return clerkEnabled ? (
    <ClerkSessionSource>{children}</ClerkSessionSource>
  ) : (
    <DeviseSessionSource>{children}</DeviseSessionSource>
  )
}

export default SessionProvider
