import React from "react"

import axe from "@axe-core/react"
import ReactDOM from "react-dom"

import IdleTimeout from "../authentication/components/IdleTimeout"
import UserProvider from "../authentication/context/UserProvider"
import ListingDetailsProvider from "../contexts/listingDetails/listingDetailsProvider"
import { ConfigProvider } from "../lib/ConfigContext"
import NavigationProvider from "../navigation/NavigationProvider"
import ErrorBoundary, { BoundaryScope } from "../components/ErrorBoundary"

interface ObjectWithAssets {
  assetPaths: unknown
}

// Ignore linting error on 'object' type, because we can't use Record<string, unknown> here.
// eslint-disable-next-line @typescript-eslint/ban-types
const withAppSetup = <P extends ObjectWithAssets>(
  Component: React.ComponentType<P>,
  useFormTimeout?: boolean
) => (props: P) => {
  if (process.env.NODE_ENV !== "production") {
    void axe(React, ReactDOM, 1000)
  }
  console.time("test1")

  return (
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
  )
}

export default withAppSetup
