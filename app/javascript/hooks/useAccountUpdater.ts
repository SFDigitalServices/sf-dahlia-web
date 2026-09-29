import { useCallback } from "react"

import { updateAccountWithClerk, updateNameOrDOB } from "../api/authApiService"
import { useAuthSession } from "../authentication/session/AuthSessionProvider"
import { bearerToken } from "../authentication/session/authStatus"
import { User } from "../authentication/user"
import { UNLEASH_FLAG } from "../modules/constants"
import { useFeatureFlag } from "./useFeatureFlag"

export type AccountUpdater = (newUser: User) => Promise<User>

/**
 * Saves the Salesforce contact with whichever session the user has: Clerk behind its flag, else
 * Devise. For a Clerk user the server takes the email from Clerk, not from `newUser`.
 */
export const useAccountUpdater = (): AccountUpdater => {
  const { unleashFlag: clerkEnabled } = useFeatureFlag(UNLEASH_FLAG.CLERK_AUTH, false)
  const { getCredentials } = useAuthSession()

  return useCallback(
    async (newUser: User) => {
      // TODO(DAH-4366): CLERK MIGRATION - DEVISE TECH DEBT TO REMOVE
      if (!clerkEnabled) return updateNameOrDOB(newUser)

      const sessionToken = bearerToken(await getCredentials())
      if (!sessionToken) {
        throw new Error("Missing Clerk session token")
      }
      return updateAccountWithClerk(newUser, sessionToken)
    },
    [clerkEnabled, getCredentials]
  )
}
