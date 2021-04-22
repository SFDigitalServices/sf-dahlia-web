import React from "react"

import IdleTimeout from "../authentication/components/IdeTimeout"
import UserProvider from "../authentication/context/UserProvider"

// Ignore linting error on 'object' type, because we can't use Record<string, unknown> here.
// eslint-disable-next-line @typescript-eslint/ban-types
const withAppSetup = <P extends object>(
  Component: React.ComponentType<P>,
  useFormTimeout?: boolean
) => (props: P) => (
  <UserProvider>
    <IdleTimeout onTimeout={() => console.log("Logout")} useFormTimeout={useFormTimeout} />
    <Component {...props} />
  </UserProvider>
)

export default withAppSetup
