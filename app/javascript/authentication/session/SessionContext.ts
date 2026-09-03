import { createContext } from "react"
import { SessionContextValue, SessionProviderKind, SessionStatus } from "./types"

/**
 * Defaults to Loading rather than SignedOut so that a component rendered
 * outside a SessionProvider waits instead of redirecting the user to sign in.
 */
const defaultValue: SessionContextValue = {
  session: { status: SessionStatus.Loading },
  provider: SessionProviderKind.Devise,
  hasCredentials: false,
  signOut: () => Promise.resolve(),
  timeOut: () => Promise.resolve(),
  getToken: () => Promise.resolve(null),
}

const SessionContext = createContext<SessionContextValue>(defaultValue)

export default SessionContext
