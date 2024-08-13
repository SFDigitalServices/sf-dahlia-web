import { createReducer } from "typesafe-actions"

import { clearHeaders } from "../token"
import { User } from "../user"
import { UserAction } from "./userActions"

// Internal Provider State
type UserState = {
  loading: boolean
  initialStateLoaded: boolean
  profile?: User
}

const UserReducer = createReducer({ loading: false, initialStateLoaded: false } as UserState, {
  [UserAction.StartLoading]: (state) => ({ ...state, loading: true, initialStateLoaded: true }),
  [UserAction.StopLoading]: (state) => ({ ...state, loading: false, initialStateLoaded: true }),
  [UserAction.SaveProfile]: (state, { payload: user }) => ({ ...state, profile: user }),
  [UserAction.SignOut]: () => {
    clearHeaders()
    // Clear out all existing state other than the storage type
    return { loading: false, initialStateLoaded: true }
  },
})

export default UserReducer
