import React from "react"
import SessionContext from "./SessionContext"
import { SessionContextValue } from "./types"

/**
 * The one way to ask about the current session.
 *
 * Callers must not consult the Clerk flag, `useAuth`, `UserContext.profile`, or
 * localStorage to answer identity questions. Switch on `session.status` so the
 * compiler catches the state you forgot.
 *
 *   const { session } = useSession()
 *   switch (session.status) {
 *     case SessionStatus.Loading: return <LoadingOverlay />
 *     case SessionStatus.SignedOut: return <SignInPrompt />
 *     case SessionStatus.SignedInWithoutProfile: return <FinishProfilePrompt />
 *     case SessionStatus.SignedIn: return <Apply profile={session.profile} />
 *   }
 */
export const useSession = (): SessionContextValue => React.useContext(SessionContext)

export default useSession
