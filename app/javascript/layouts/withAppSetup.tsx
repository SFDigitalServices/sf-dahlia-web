import React from "react"

import IdleTimeout from "../authentication/components/IdleTimeout"
import UserProvider from "../authentication/context/UserProvider"
import { ConfigProvider } from "../lib/ConfigContext"
import NavigationProvider from "../navigation/NavigationProvider"

interface ObjectWithAssets {
  assetPaths: unknown
  [key: string]: unknown
}

// Ignore linting error on 'object' type, because we can't use Record<string, unknown> here.
// eslint-disable-next-line @typescript-eslint/ban-types
const withAppSetup = <P extends ObjectWithAssets>(
  Component: React.ComponentType<P>,
  useFormTimeout?: boolean
) => (props: P) => (
  <NavigationProvider>
    <ConfigProvider assetPaths={props.assetPaths}>
      <UserProvider>
        <IdleTimeout onTimeout={() => console.log("Logout")} useFormTimeout={useFormTimeout} />
        <Component {...props} />
      </UserProvider>
    </ConfigProvider>
  </NavigationProvider>
)

export default withAppSetup
