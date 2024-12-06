import { createAction } from "typesafe-actions"

import { User } from "../user"

export enum UserAction {
  StartLoading = "StartLoading",
  StopLoading = "StopLoading",
  SaveProfile = "SaveProfile",
  SignOut = "SignOut",
  TimeOut = "TimeOut",
}

export const startLoading = createAction(UserAction.StartLoading)()
export const stopLoading = createAction(UserAction.StopLoading)()
export const saveProfile = createAction(UserAction.SaveProfile)<User>()
export const signOut = createAction(UserAction.SignOut)()
export const timeOut = createAction(UserAction.TimeOut)()
