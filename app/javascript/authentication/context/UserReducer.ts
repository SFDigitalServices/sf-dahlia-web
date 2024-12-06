import { createReducer } from "typesafe-actions"

import { clearHeadersSignOut, clearHeadersTimeOut } from "../token"
import { User } from "../user"
import { UserAction } from "./userActions"

// Internal Provider State
type UserState = {
  loading: boolean
  initialStateLoaded: boolean
  profile?: User
}

const UserReducer = createReducer({ loading: false, initialStateLoaded: false } as UserState, {
  [UserAction.StartLoading]: (state) => ({ ...state, loading: true }),
  [UserAction.StopLoading]: (state) => ({ ...state, loading: false }),
  [UserAction.SaveProfile]: (state, { payload: user }) => ({ ...state, profile: user }),
  [UserAction.SignOut]: () => {
    clearHeadersSignOut()
    // Clear out all existing state other than the storage type
    return { loading: false, initialStateLoaded: true }
  },
  [UserAction.TimeOut]: () => {
    clearHeadersTimeOut()

    // Clear out all existing state other than the storage type
    return { loading: false, initialStateLoaded: true }
  },
})

export default UserReducer
