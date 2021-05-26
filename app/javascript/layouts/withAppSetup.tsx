import React from "react"

import IdleTimeout from "../authentication/components/IdleTimeout"
import UserProvider from "../authentication/context/UserProvider"
import { ConfigProvider } from "../lib/ConfigContext"

interface ObjectWithAssets {
  assetPaths: unknown
}

// Ignore linting error on 'object' type, because we can't use Record<string, unknown> here.
// eslint-disable-next-line @typescript-eslint/ban-types
const withAppSetup = <P extends ObjectWithAssets>(
  Component: React.ComponentType<P>,
  useFormTimeout?: boolean
) => (props: P) => (
  <ConfigProvider assetPaths={props.assetPaths}>
    <UserProvider>
      <IdleTimeout onTimeout={() => console.log("Logout")} useFormTimeout={useFormTimeout} />
      <Component {...props} />
    </UserProvider>
  </ConfigProvider>
)

export default withAppSetup
