import { createContext } from "react"

import { User } from "../user"

// External interface this context provides
export type ContextProps = {
  signIn: (email: string, password: string) => Promise<User>
  signOut: () => void
  timeOut: () => void
  saveProfile: (profile: User) => void
  // True when an API request is processing
  loading: boolean
  profile?: User
  initialStateLoaded: boolean
}

export default createContext<Partial<ContextProps>>({})
