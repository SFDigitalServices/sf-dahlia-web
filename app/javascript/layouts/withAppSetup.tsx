import React from "react"

import axe from "@axe-core/react"
import ReactDOM from "react-dom"
import { FlagProvider } from "@unleash/proxy-client-react"

import IdleTimeout from "../authentication/components/IdleTimeout"
import UserProvider from "../authentication/context/UserProvider"
import ListingDetailsProvider from "../contexts/listingDetails/listingDetailsProvider"
import { ConfigProvider } from "../lib/ConfigContext"
import NavigationProvider from "../navigation/NavigationProvider"
import ErrorBoundary, { BoundaryScope } from "../components/ErrorBoundary"

interface ObjectWithAssets {
  assetPaths: unknown
}

const config = {
  url: process.env.UNLEASH_URL,
  clientKey: process.env.UNLEASH_TOKEN,
  refreshInterval: 15, // How often (in seconds) the client should poll the proxy for updates
  appName: "webapp", // The name of your application. It's only used for identifying your application
}

// Ignore linting error on 'object' type, because we can't use Record<string, unknown> here.
// eslint-disable-next-line @typescript-eslint/ban-types
const withAppSetup =
  <P extends ObjectWithAssets>(Component: React.ComponentType<P>, useFormTimeout?: boolean) =>
  (props: P) => {
    if (process.env.NODE_ENV !== "production") {
      void axe(React, ReactDOM, 1000)
    }

    return (
      <FlagProvider config={config}>
        <ErrorBoundary boundaryScope={BoundaryScope.page}>
          <NavigationProvider>
            <ListingDetailsProvider>
              <ConfigProvider assetPaths={props.assetPaths}>
                <UserProvider>
                  <IdleTimeout
                    onTimeout={() => console.log("Logout")}
                    useFormTimeout={useFormTimeout}
                  />
                  <Component {...props} />
                </UserProvider>
              </ConfigProvider>
            </ListingDetailsProvider>
          </NavigationProvider>
        </ErrorBoundary>
      </FlagProvider>
    )
  }

export default withAppSetup
