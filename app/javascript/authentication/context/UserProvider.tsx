import React, { FunctionComponent, useEffect, useReducer } from "react"

import { getProfile, signIn } from "../apiService"
import { getHeaders, getTokenTtl } from "../token"
import { saveProfile, signOut, startLoading, stopLoading } from "./userActions"
import UserContext, { ContextProps } from "./UserContext"
import UserReducer from "./UserReducer"

interface UserProviderProps {
  children?: React.ReactNode
}

const UserProvider: FunctionComponent = (props: UserProviderProps) => {
  const [state, dispatch] = useReducer(UserReducer, {
    loading: false,
    initialStateLoaded: false,
  })

  // Load our profile as soon as we have an access token available
  useEffect(() => {
    if (!state.profile) {
      const loadProfile = async () => {
        dispatch(startLoading())
        try {
          const profile = await getProfile()
          dispatch(saveProfile(profile))
        } catch {
          dispatch(signOut())
        } finally {
          dispatch(stopLoading())
        }
      }
      // eslint-disable-next-line no-void
      void loadProfile()
    }
  }, [state.profile])

  // On initial load/reload, check localStorage to see if we have a token available
  useEffect(() => {
    const headers = getHeaders()
    if (headers) {
      const ttl = getTokenTtl()

      if (ttl <= 0) {
        dispatch(signOut())
      }
    } else {
      dispatch(signOut())
    }
  }, [])

  const contextValues: ContextProps = {
    loading: state.loading,
    profile: state.profile,
    initialStateLoaded: state.initialStateLoaded,
    signIn: async (email, password) => {
      dispatch(signOut())
      dispatch(startLoading())
      try {
        const profile = await signIn(email, password)

        dispatch(saveProfile(profile))
        return profile
      } finally {
        dispatch(stopLoading())
      }
    },
    signOut: () => dispatch(signOut()),
  }

  return <UserContext.Provider value={contextValues}>{props.children}</UserContext.Provider>
}

export default UserProvider
