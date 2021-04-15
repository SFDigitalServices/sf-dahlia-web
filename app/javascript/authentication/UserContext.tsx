import React, { createContext, useReducer, FunctionComponent, useEffect, useContext } from "react"

import { createAction, createReducer } from "typesafe-actions"

import { getProfile, signIn } from "./api_requests"
import { clearHeaders, getHeaders, getTokenTtl } from "./token"
import { User } from "./user"

// External interface this context provides
type ContextProps = {
  signIn: (email: string, password: string) => Promise<User>
  signOut: () => void
  // True when an API request is processing
  loading: boolean
  profile?: User
  initialStateLoaded: boolean
}

// Internal Provider State
type UserState = {
  loading: boolean
  initialStateLoaded: boolean
  profile?: User
}

// State Mutation Actions
const startLoading = createAction("START_LOADING")()
const stopLoading = createAction("STOP_LOADING")()
const saveProfile = createAction("SAVE_PROFILE")<User>()
const signOut = createAction("SIGN_OUT")()

const reducer = createReducer({ loading: false, initialStateLoaded: false } as UserState, {
  START_LOADING: (state) => ({ ...state, loading: true }),
  END_LOADING: (state) => ({ ...state, loading: false }),
  SAVE_PROFILE: (state, { payload: user }) => ({ ...state, profile: user }),
  SIGN_OUT: () => {
    clearHeaders()
    // Clear out all existing state other than the storage type
    return { loading: false, initialStateLoaded: true }
  },
})

export const UserContext = createContext<Partial<ContextProps>>({})

export interface UserProviderProps {
  children?: React.ReactNode
}

export const UserProvider: FunctionComponent = (props: UserProviderProps) => {
  const [state, dispatch] = useReducer(reducer, {
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
        } catch (err) {
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

/**
 * Use this instead of useContext(AppContext) directly. The only reason this is better is it
 * provides a default that will destructure nicely when useContext returns false, like when
 * shallow rendering a component.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-function
export const useAppContext = () => useContext(UserContext) ?? [undefined, () => {}]

export default UserContext
