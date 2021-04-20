import React from "react"

import { LoggedInUserIdleTimeout } from "../authentication/timeout"
import { UserProvider } from "../authentication/UserContext"

// Ignore linting error on 'object' type, because we can't use Record<string, unknown> here.
// eslint-disable-next-line @typescript-eslint/ban-types
const withAppSetup = <P extends object>(Component: React.ComponentType<P>) => (props: P) => (
  <UserProvider>
    <LoggedInUserIdleTimeout /> <Component {...props} />{" "}
  </UserProvider>
)

export default withAppSetup
