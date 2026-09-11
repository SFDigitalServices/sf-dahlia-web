import React, { useCallback, useEffect, useReducer } from "react"

import { getProfile, signIn } from "../../api/authApiService"
import { useAuthSession } from "../session/AuthSessionProvider"
import { bearerToken, isAuthInitialized } from "../session/authStatus"
import { attemptToSetAuthHeadersFromURL } from "../token"
import { User } from "../user"
import {
  saveProfile,
  userSignOut,
  systemSignOut,
  timeOut,
  startLoading,
  stopLoading,
  signOutConnectionIssue,
} from "./userActions"
import UserContext, { ContextProps } from "./UserContext"
import UserReducer from "./UserReducer"
import { AxiosError } from "axios"
import { useGTMDataLayerWithoutUserContext } from "../../hooks/analytics/useGTMDataLayer"
import { useFeatureFlag } from "../../hooks/useFeatureFlag"
import { UNLEASH_FLAG } from "../../modules/constants"

interface UserProviderProps {
  children?: React.ReactNode
}

const ClerkProfile = ({
  hasProfile,
  onLoaded,
}: {
  hasProfile: boolean
  onLoaded: (profile: User | null) => void
}) => {
  const { status, getCredentials } = useAuthSession()

  useEffect(() => {
    if (!isAuthInitialized(status) || hasProfile) {
      return
    }
    if (status.kind === "signedOut") {
      onLoaded(null)
      return
    }

    void (async () => {
      try {
        const sessionToken = bearerToken(await getCredentials())
        if (!sessionToken) {
          throw new Error("Missing Clerk session token")
        }
        onLoaded(await getProfile(sessionToken))
      } catch {
        onLoaded(null)
      }
    })()
  }, [getCredentials, hasProfile, status, onLoaded])

  return null
}

/**
 * Everything tagged DEVISE TECH DEBT goes when Devise does, leaving the reducer
 * and ClerkProfile — a profile store and nothing else. Worth renaming to
 * ProfileProvider then; deferred now because UserContext has ~20 consumers.
 */
const UserProvider = (props: UserProviderProps) => {
  const [state, dispatch] = useReducer(UserReducer, {
    loading: false,
    initialStateLoaded: false,
  })

  const { pushToDataLayer } = useGTMDataLayerWithoutUserContext()
  const { unleashFlag: clerkEnabled, flagsReady } = useFeatureFlag(UNLEASH_FLAG.CLERK_AUTH, false)

  const onClerkProfileLoaded = useCallback((profile: User | null) => {
    dispatch(profile ? saveProfile(profile) : systemSignOut())
  }, [])

  // TODO: CLERK MIGRATION - DEVISE TECH DEBT TO REMOVE
  // Devise's profile fetch; ClerkProfile above is the replacement. Deleting it
  // takes the flag read and the mount condition below with it.
  //
  // Load our profile as soon as we have an access token available
  useEffect(() => {
    if (!flagsReady || clerkEnabled || state.profile) {
      return
    }

    dispatch(startLoading())
    attemptToSetAuthHeadersFromURL()
    getProfile()
      .then((profile) => {
        dispatch(saveProfile(profile))
      })
      .catch((error) => {
        if (error?.message === "Token expired") {
          pushToDataLayer("logout", {
            user_id: undefined,
            reason: "Token expire",
          })

          // Give the DataLayer push some time to finish before the user is redirected
          setTimeout(() => {
            dispatch(signOutConnectionIssue())
          }, 100)
        } else {
          dispatch(systemSignOut())
        }
      })
      .finally(() => {
        dispatch(stopLoading())
      })
  }, [clerkEnabled, flagsReady, pushToDataLayer, state.profile])

  const contextValues: ContextProps = {
    loading: state.loading,
    profile: state.profile,
    initialStateLoaded: state.initialStateLoaded,
    saveProfile: (profile) => dispatch(saveProfile(profile)),
    // TODO: CLERK MIGRATION - DEVISE TECH DEBT TO REMOVE
    // Posts to /api/v1/auth/sign_in and stores Devise headers. Only reached
    // from SignInForm, which only renders on the Devise branch of sign-in.tsx.
    signIn: async (email, password, origin) => {
      dispatch(systemSignOut())
      dispatch(startLoading())
      return signIn(email, password)
        .then((profile) => {
          pushToDataLayer("login_succeeded", { user_id: profile.id, origin })
          dispatch(saveProfile(profile))
          return profile
        })
        .catch((error: AxiosError<{ error: string; email: string }>) => {
          pushToDataLayer("login_failed", {
            user_id: undefined,
            origin,
            reason: error.response?.data.error,
          })
          throw error
        })
        .finally(() => dispatch(stopLoading()))
    },
    // TODO: CLERK MIGRATION - DEVISE TECH DEBT TO REMOVE
    // Clears Devise headers; ends no Clerk session. Layout, AccountNav and
    // account.tsx branch to useAuth().signOut. A replacement must carry the
    // GTM push with it.
    signOut: () => {
      pushToDataLayer("logout", { user_id: state.profile.id, reason: "User clicked logout" })
      dispatch(userSignOut())
    },
    // TODO: CLERK MIGRATION - DEVISE TECH DEBT TO REMOVE
    // IdleTimeout does not branch on the flag, so under Clerk a timeout clears
    // Devise headers and redirects while the Clerk session stays live.
    // Pre-existing; needs its own ticket.
    timeOut: () => {
      pushToDataLayer("logout", { user_id: state.profile.id, reason: "Timed out" })
      dispatch(timeOut())
    },
  }

  return (
    <UserContext.Provider value={contextValues}>
      {flagsReady && clerkEnabled && (
        <ClerkProfile hasProfile={!!state.profile} onLoaded={onClerkProfileLoaded} />
      )}
      {props.children}
    </UserContext.Provider>
  )
}

export default UserProvider
