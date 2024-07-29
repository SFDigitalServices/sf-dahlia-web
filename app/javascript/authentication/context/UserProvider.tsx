import React, { useEffect, useReducer } from "react"

import { getProfile, signIn } from "../../api/authApiService"
import { isTokenValid } from "../token"
import { saveProfile, signOut, startLoading, stopLoading } from "./userActions"
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
      getProfile()
        .then((profile) => {
          dispatch(saveProfile(profile))
        })
        .catch(() => dispatch(signOut()))
        .finally(() => dispatch(stopLoading()))
    }
  }, [state.profile])

  // On initial load/reload, check localStorage to see if we have a token available
  useEffect(() => {
    if (!isTokenValid()) dispatch(signOut())
  }, [])

  const contextValues: ContextProps = {
    loading: state.loading,
    profile: state.profile,
    initialStateLoaded: state.initialStateLoaded,
    saveProfile: (profile) => dispatch(saveProfile(profile)),
    signIn: async (email, password) => {
      dispatch(signOut())
      dispatch(startLoading())
      return signIn(email, password)
        .then((profile) => {
          dispatch(saveProfile(profile))
          return profile
        })
        .finally(() => dispatch(stopLoading()))
    },
    signOut: () => dispatch(signOut()),
  }

  return <UserContext.Provider value={contextValues}>{props.children}</UserContext.Provider>
}

export default UserProvider
