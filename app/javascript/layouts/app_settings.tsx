import React from "react"

import { LoggedInUserIdleTimeout } from "../authentication/timeout"
import { UserProvider } from "../authentication/UserContext"

// eslint-disable-next-line @typescript-eslint/ban-types
const withAppSetup = <P extends object>(Component: React.ComponentType<P>) =>
  class WithAppSetup extends React.Component<P> {
    render() {
      return (
        <UserProvider>
          <LoggedInUserIdleTimeout /> <Component {...(this.props as P)} />{" "}
        </UserProvider>
      )
    }
  }

export { withAppSetup as default, withAppSetup }
