import { useCallback, useContext } from "react"
import { useNavigate } from "react-router"
import UserContext from "../context/UserContext"
import { fullName } from "../user"
import { getSignInPath } from "../../util/routeUtil"
import { useAuthSession } from "./AuthSessionProvider"

/**
 * Ends the session and routes to sign-in. A housing counselor leaving a delegated
 * account carries the seeker's name along so sign-in can confirm whose account they left.
 */
export const useSignOutToSignIn = () => {
  const { signOut } = useAuthSession()
  const { profile } = useContext(UserContext)
  const navigate = useNavigate()

  return useCallback(async () => {
    const seekerName = profile?.isDelegated ? fullName(profile) : undefined
    try {
      await signOut()
    } finally {
      if (seekerName) {
        void navigate(getSignInPath(), { state: { housingCounselorSignedOut: seekerName } })
      } else {
        void navigate(getSignInPath())
      }
    }
  }, [navigate, profile, signOut])
}
