import { createAction } from "typesafe-actions"

import { User } from "../user"

export enum UserAction {
  StartLoading = "StartLoading",
  StopLoading = "StopLoading",
  SaveProfile = "SaveProfile",
  UserSignOut = "UserSignOut",
  SystemSignOut = "SystemSignOut",
  TimeOut = "TimeOut",
  SignOutConnectionIssue = "SignOutConnectionIssue",
}

export const startLoading = createAction(UserAction.StartLoading)()
export const stopLoading = createAction(UserAction.StopLoading)()
export const saveProfile = createAction(UserAction.SaveProfile)<User>()
export const userSignOut = createAction(UserAction.UserSignOut)()
export const systemSignOut = createAction(UserAction.SystemSignOut)()
export const timeOut = createAction(UserAction.TimeOut)()
export const signOutConnectionIssue = createAction(UserAction.SignOutConnectionIssue)()
