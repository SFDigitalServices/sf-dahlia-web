import React, { createContext, useReducer, FunctionComponent, useEffect, useContext } from "react"

import { ConfigContext } from "@bloom-housing/ui-components"
import { createAction, createReducer } from "typesafe-actions"

import { createAxiosInstance, getProfile, signIn, scheduleTokenRefresh } from "./api_requests"
import { AuthHeaders, clearHeaders, getHeaders, getTokenTtl, setHeaders } from "./token"
import { User } from "./user"

// External interface this context provides
type ContextProps = {
  signIn: (email: string, password: string) => Promise<User>
  signOut: () => void
  // True when an API request is processing
  loading: boolean
  profile?: User
  headers?: AuthHeaders
  initialStateLoaded: boolean
}

// Internal Provider State
type UserState = {
  loading: boolean
  initialStateLoaded: boolean
  storageType: string
  headers?: AuthHeaders
  profile?: User
  refreshTimer?: number
}

type DispatchType = (...arg: [unknown]) => void

// State Mutation Actions
const saveToken = createAction("SAVE_TOKEN")<{
  apiUrl: string
  headers: AuthHeaders
  dispatch: DispatchType
}>()
const startLoading = createAction("START_LOADING")()
const stopLoading = createAction("STOP_LOADING")()
const saveProfile = createAction("SAVE_PROFILE")<User>()
const signOut = createAction("SIGN_OUT")()

const reducer = createReducer(
  { loading: false, initialStateLoaded: false, storageType: "session" } as UserState,
  {
    SAVE_TOKEN: (state, { payload }) => {
      const { refreshTimer: oldRefresh, ...rest } = state
      const { headers, apiUrl, dispatch } = payload

      // If an existing refresh timer has been defined, remove it as the access token has changed
      if (oldRefresh) {
        clearTimeout(oldRefresh)
      }

      // Save off the token in local storage for persistence across reloads.
      setHeaders(headers)

      const refreshTimer = scheduleTokenRefresh(apiUrl, headers, (newHeaders) =>
        dispatch(saveToken({ apiUrl, headers: newHeaders, dispatch }))
      )

      return {
        ...rest,
        ...(refreshTimer && { refreshTimer }),
        headers: headers,
      }
    },
    START_LOADING: (state) => ({ ...state, loading: true }),
    END_LOADING: (state) => ({ ...state, loading: false }),
    SAVE_PROFILE: (state, { payload: user }) => ({ ...state, profile: user }),
    SIGN_OUT: ({ storageType }) => {
      clearHeaders()
      // Clear out all existing state other than the storage type
      return { loading: false, storageType, initialStateLoaded: true }
    },
  }
)

export const UserContext = createContext<Partial<ContextProps>>({})

export interface UserProviderProps {
  children?: React.ReactNode
}

export const UserProvider: FunctionComponent = (props: UserProviderProps) => {
  const { apiUrl, storageType } = useContext(ConfigContext)
  const [state, dispatch] = useReducer(reducer, {
    loading: false,
    initialStateLoaded: false,
    storageType,
  })

  // Load our profile as soon as we have an access token available
  useEffect(() => {
    if (!state.profile && state.headers) {
      console.log("UserProvider")
      const client = createAxiosInstance(apiUrl, state.headers)
      const loadProfile = async () => {
        dispatch(startLoading())
        try {
          const data = await getProfile(client)
          dispatch(saveToken({ headers: data.headers, apiUrl, dispatch }))
          dispatch(saveProfile(data.profile))
        } catch (err) {
          dispatch(signOut())
        } finally {
          dispatch(stopLoading())
        }
      }
      // eslint-disable-next-line no-void
      void loadProfile()
    }
  }, [state.profile, state.headers, apiUrl])

  // On initial load/reload, check localStorage to see if we have a token available
  useEffect(() => {
    const headers = getHeaders()
    if (headers) {
      const ttl = getTokenTtl()

      if (ttl > 0) {
        dispatch(saveToken({ headers, apiUrl, dispatch }))
      } else {
        dispatch(signOut())
      }
    } else {
      dispatch(signOut())
    }
  }, [apiUrl, storageType])

  console.log("Context Props")

  const contextValues: ContextProps = {
    loading: state.loading,
    profile: state.profile,
    headers: state.headers,
    initialStateLoaded: state.initialStateLoaded,
    signIn: async (email, password) => {
      dispatch(signOut())
      dispatch(startLoading())
      try {
        const headers = await signIn(apiUrl, email, password)
        dispatch(saveToken({ headers, apiUrl, dispatch }))
        console.log("SignIn")

        const client = createAxiosInstance(apiUrl, headers)
        const data = await getProfile(client)
        dispatch(saveToken({ headers: data.headers, apiUrl, dispatch }))
        dispatch(saveProfile(data.profile))
        return data.profile
      } finally {
        dispatch(stopLoading())
      }
    },
    signOut: () => dispatch(signOut()),
  }
  console.log(contextValues)
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
