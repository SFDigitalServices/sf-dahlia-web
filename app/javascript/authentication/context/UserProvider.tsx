import React, { useEffect, useReducer } from "react"

import { getProfile, signIn } from "../../api/authApiService"
import { attemptToSetAuthHeadersFromURL } from "../token"
import {
  saveProfile,
  userSignOut,
  systemSignOut,
  timeOut,
  startLoading,
  stopLoading,
} from "./userActions"
import UserContext, { ContextProps } from "./UserContext"
import UserReducer from "./UserReducer"
import { AxiosError } from "axios"
import { useGTMDataLayerWithoutUserContext } from "../../hooks/analytics/useGTMDataLayer"

interface UserProviderProps {
  children?: React.ReactNode
}

const UserProvider = (props: UserProviderProps) => {
  const [state, dispatch] = useReducer(UserReducer, {
    loading: false,
    initialStateLoaded: false,
  })

  const { pushToDataLayer } = useGTMDataLayerWithoutUserContext()

  // Load our profile as soon as we have an access token available
  useEffect(() => {
    if (!state.profile) {
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
              // dispatch(signOutConnectionIssue())
              console.log("dispatch(signOutConnectionIssue()")
            }, 100)
          } else {
            dispatch(systemSignOut())
          }
        })
        .finally(() => {
          dispatch(stopLoading())
        })
    }
  }, [pushToDataLayer, state.profile])

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

  return <UserContext.Provider value={contextValues}>{props.children}</UserContext.Provider>
}

export default UserProvider
