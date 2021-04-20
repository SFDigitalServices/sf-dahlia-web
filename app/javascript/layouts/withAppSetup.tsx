import React from "react"

import UserProvider from "../authentication/context/UserProvider"
import { LoggedInUserIdleTimeout } from "../authentication/timeout"

// Ignore linting error on 'object' type, because we can't use Record<string, unknown> here.
// eslint-disable-next-line @typescript-eslint/ban-types
const withAppSetup = <P extends object>(Component: React.ComponentType<P>) => (props: P) => (
  <UserProvider>
    <LoggedInUserIdleTimeout onTimeout={() => console.log("Logout")} />
    <Component {...props} />
  </UserProvider>
)

export default withAppSetup
