import { createAction } from "typesafe-actions"

import { User } from "../user"

export enum UserAction {
  StartLoading = "StartLoading",
  StopLoading = "StopLoading",
  SaveProfile = "SaveProfile",
  SignOut = "SignOut",
}

export const startLoading = createAction(UserAction.StartLoading)()
export const stopLoading = createAction(UserAction.StopLoading)()
export const saveProfile = createAction(UserAction.SaveProfile)<User>()
export const signOut = createAction(UserAction.SignOut)()
