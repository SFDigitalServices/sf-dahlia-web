import React from "react"

import axe from "@axe-core/react"
import ReactDOM from "react-dom"
import { FlagProvider } from "@unleash/proxy-client-react"
import IdleTimeout from "../authentication/components/IdleTimeout"
import UserProvider from "../authentication/context/UserProvider"
import { AuthSessionProvider } from "../authentication/session/AuthSessionProvider"
import ListingDetailsProvider from "../contexts/listingDetails/listingDetailsProvider"
import { ConfigProvider } from "../lib/ConfigContext"
import ErrorBoundary, { BoundaryScope } from "../components/ErrorBoundary"
import "@bloom-housing/ui-seeds/src/global/app-css.scss"
import { useGTMInitializer } from "../hooks/analytics/useInitializeGTM"
import { AppPages } from "../util/routeUtil"

interface ObjectWithAssets {
  assetPaths: unknown
}

const config = {
  url: `${process.env.UNLEASH_URL}frontend`,
  clientKey: process.env.UNLEASH_TOKEN,
  refreshInterval: 0,
  appName: "webapp",
}

const withAppSetup =
  <P extends ObjectWithAssets>(
    Component: React.ComponentType<P>,
    configuration: {
      useFormTimeout?: boolean
      pageName?: AppPages
    }
  ) =>
  (props: P) => {
    if (process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "test") {
      void axe(React, ReactDOM, 1000)
    }

    useGTMInitializer(process.env.GOOGLE_TAG_MANAGER_KEY)

    return (
      <FlagProvider config={config}>
        <ErrorBoundary boundaryScope={BoundaryScope.page}>
          <ListingDetailsProvider>
            <ConfigProvider assetPaths={props.assetPaths}>
              <AuthSessionProvider>
                <UserProvider>
                  <IdleTimeout
                    onTimeout={() => console.log("Logout")}
                    useFormTimeout={configuration?.useFormTimeout}
                    pageName={configuration?.pageName}
                  />
                  <Component {...props} />
                </UserProvider>
              </AuthSessionProvider>
            </ConfigProvider>
          </ListingDetailsProvider>
        </ErrorBoundary>
      </FlagProvider>
    )
  }

export default withAppSetup
