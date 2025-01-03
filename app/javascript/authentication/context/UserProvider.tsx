import React, { useEffect, useReducer } from "react"

import { getProfile, signIn } from "../../api/authApiService"
import { getTemporaryAuthParamsFromUrl, isTokenValid, setAuthHeadersFromUrl } from "../token"
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

interface UserProviderProps {
  children?: React.ReactNode
}

const UserProvider = (props: UserProviderProps) => {
  const [state, dispatch] = useReducer(UserReducer, {
    loading: false,
    initialStateLoaded: false,
  })

  // Load our profile as soon as we have an access token available
  useEffect(() => {
    if (!state.profile) {
      dispatch(startLoading())
      const temporaryAuthParamsFromUrl = getTemporaryAuthParamsFromUrl()
      if (
        temporaryAuthParamsFromUrl &&
        temporaryAuthParamsFromUrl.accessToken &&
        temporaryAuthParamsFromUrl.reset_password === "true"
      ) {
        setAuthHeadersFromUrl(temporaryAuthParamsFromUrl)
      }
      getProfile()
        .then((profile) => {
          dispatch(saveProfile(profile))
        })
        .catch(() => dispatch(systemSignOut()))
        .finally(() => dispatch(stopLoading()))
    }
  }, [state.profile])

  // On initial load/reload, check localStorage to see if we have a token available
  useEffect(() => {
    if (!isTokenValid()) dispatch(signOutConnectionIssue())
  }, [])

  const contextValues: ContextProps = {
    loading: state.loading,
    profile: state.profile,
    initialStateLoaded: state.initialStateLoaded,
    saveProfile: (profile) => dispatch(saveProfile(profile)),
    signIn: async (email, password) => {
      dispatch(systemSignOut())
      dispatch(startLoading())
      return signIn(email, password)
        .then((profile) => {
          dispatch(saveProfile(profile))
          return profile
        })
        .finally(() => dispatch(stopLoading()))
    },
    signOut: () => dispatch(userSignOut()),
    timeOut: () => dispatch(timeOut()),
  }

  return <UserContext.Provider value={contextValues}>{props.children}</UserContext.Provider>
}

export default UserProvider
