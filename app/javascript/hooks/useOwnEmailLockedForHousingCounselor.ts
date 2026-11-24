import { useContext, useEffect, useState } from "react"
import { getHousingCounselorStatus } from "../api/authApiService"
import UserContext from "../authentication/context/UserContext"
import { useAuthSession } from "../authentication/session/AuthSessionProvider"
import { bearerToken } from "../authentication/session/authStatus"
import { UNLEASH_FLAG } from "../modules/constants"
import { useFeatureFlag } from "./useFeatureFlag"

export type OwnEmailLock = { emailLocked: boolean; emailLockKnown: boolean }

const UNKNOWN: OwnEmailLock = { emailLocked: false, emailLockKnown: false }
const UNLOCKED: OwnEmailLock = { emailLocked: false, emailLockKnown: true }

type LockConditions = {
  flagsReady: boolean
  housingCounselorAccessEnabled: boolean
  profileLoaded: boolean
  actingAsThemselves: boolean
}

// Decides without a network request when it can; null means "ask Salesforce".
// Order matters: while flags or the profile load, their values read as "off"/"no
// profile", which would otherwise look like "unlocked".
const lockWithoutLookup = ({
  flagsReady,
  housingCounselorAccessEnabled,
  profileLoaded,
  actingAsThemselves,
}: LockConditions): OwnEmailLock | null => {
  if (!flagsReady) return UNKNOWN
  if (!housingCounselorAccessEnabled) return UNLOCKED
  if (!profileLoaded) return UNKNOWN
  if (!actingAsThemselves) return UNLOCKED
  return null
}

// DAH-4320: display only. Rails refuses a counselor's Salesforce email change itself.
export const useOwnEmailLockedForHousingCounselor = (): OwnEmailLock => {
  const { profile, initialStateLoaded } = useContext(UserContext)
  const { getCredentials } = useAuthSession()
  const { unleashFlag: housingCounselorAccessEnabled, flagsReady } = useFeatureFlag(
    UNLEASH_FLAG.HOUSING_COUNSELOR_ACCESS,
    false
  )
  const decided = lockWithoutLookup({
    flagsReady,
    housingCounselorAccessEnabled,
    profileLoaded: Boolean(initialStateLoaded),
    actingAsThemselves: Boolean(profile) && !profile?.isDelegated,
  })
  const needsLookup = decided === null
  const [lookup, setLookup] = useState<OwnEmailLock>(UNKNOWN)

  useEffect(() => {
    if (!needsLookup) return
    let superseded = false
    void (async () => {
      let locked = false
      try {
        const sessionToken = bearerToken(await getCredentials())
        if (sessionToken) locked = await getHousingCounselorStatus(sessionToken)
      } catch {
        // An unknown status shows the usual section; Rails still refuses the change.
      }
      if (!superseded) setLookup({ emailLocked: locked, emailLockKnown: true })
    })()
    return () => {
      superseded = true
      setLookup(UNKNOWN)
    }
  }, [needsLookup, getCredentials])

  return decided ?? lookup
}
