import { useContext, useEffect, useState } from "react"
import { getHousingCounselorStatus } from "../api/authApiService"
import UserContext from "../authentication/context/UserContext"
import { useAuthSession } from "../authentication/session/AuthSessionProvider"
import { bearerToken } from "../authentication/session/authStatus"
import { UNLEASH_FLAG } from "../modules/constants"
import { useFeatureFlag } from "./useFeatureFlag"

// DAH-4320: display only; the server refuses a counselor's own email change on its own.
export const useOwnEmailLockedForHousingCounselor = () => {
  const { profile } = useContext(UserContext)
  const { getCredentials } = useAuthSession()
  const { unleashFlag: housingCounselorAccessEnabled } = useFeatureFlag(
    UNLEASH_FLAG.HOUSING_COUNSELOR_ACCESS,
    false
  )
  const actingAsThemselves = Boolean(profile) && !profile.isDelegated
  const [locked, setLocked] = useState(false)

  useEffect(() => {
    if (!housingCounselorAccessEnabled || !actingAsThemselves) return
    void (async () => {
      const sessionToken = bearerToken(await getCredentials())
      if (!sessionToken) return
      try {
        setLocked(await getHousingCounselorStatus(sessionToken))
      } catch {
        // Leave the section as usual; the server still enforces the rule.
      }
    })()
  }, [housingCounselorAccessEnabled, actingAsThemselves, getCredentials])

  return locked
}
