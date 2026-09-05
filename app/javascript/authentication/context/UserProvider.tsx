import React, { useCallback, useEffect, useReducer } from "react"
import { useAuth } from "@clerk/react"

import { getProfile, signIn } from "../../api/authApiService"
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
  const { isLoaded, isSignedIn, getToken } = useAuth()

  useEffect(() => {
    if (!isLoaded || hasProfile) {
      return
    }
    if (!isSignedIn) {
      onLoaded(null)
      return
    }

    void (async () => {
      try {
        const sessionToken = await getToken()
        if (!sessionToken) {
          throw new Error("Missing Clerk session token")
        }
        onLoaded(await getProfile(sessionToken))
      } catch {
        onLoaded(null)
      }
    })()
  }, [getToken, hasProfile, isLoaded, isSignedIn, onLoaded])

  return null
}

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
    signOut: () => {
      pushToDataLayer("logout", { user_id: state.profile.id, reason: "User clicked logout" })
      dispatch(userSignOut())
    },
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
