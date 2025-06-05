import React from "react"

import axe from "@axe-core/react"
import ReactDOM from "react-dom"
import { FlagProvider } from "@unleash/proxy-client-react"
import { ClerkProvider } from "@clerk/clerk-react"
import { useFeatureFlag } from "../hooks/useFeatureFlag"
import IdleTimeout from "../authentication/components/IdleTimeout"
import UserProvider from "../authentication/context/UserProvider"
import ListingDetailsProvider from "../contexts/listingDetails/listingDetailsProvider"
import { ConfigProvider } from "../lib/ConfigContext"
import NavigationProvider from "../navigation/NavigationProvider"
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
  refreshInterval: 15, // How often (in seconds) the client should poll the proxy for updates
  appName: "webapp", // The name of your application. It's only used for identifying your application
}

const clerkKey = process.env.CLERK_PUBLISHABLE_KEY
// Ignore linting error on 'object' type, because we can't use Record<string, unknown> here.
// eslint-disable-next-line @typescript-eslint/ban-types
const withAppSetup =
  <P extends ObjectWithAssets>(
    Component: React.ComponentType<P>,
    configuration: {
      useFormTimeout?: boolean
      pageName?: AppPages
    }
  ) =>
  (props: P) => {
    if (process.env.NODE_ENV !== "production") {
      void axe(React, ReactDOM, 1000)
    }

    useGTMInitializer(process.env.GOOGLE_TAG_MANAGER_KEY)

    function ProvidersWithConditionalClerk() {
      const { unleashFlag: clerkEnabled } = useFeatureFlag("temp.webapp.auth.clerk", false)
      const Providers = (
        <ErrorBoundary boundaryScope={BoundaryScope.page}>
          <NavigationProvider>
            <ListingDetailsProvider>
              {/* eslint-disable react/prop-types */}
              <ConfigProvider assetPaths={props.assetPaths}>
                <UserProvider>
                  <IdleTimeout
                    onTimeout={() => console.log("Logout")}
                    useFormTimeout={configuration?.useFormTimeout}
                    pageName={configuration?.pageName}
                  />
                  <Component {...props} />
                </UserProvider>
              </ConfigProvider>
            </ListingDetailsProvider>
          </NavigationProvider>
        </ErrorBoundary>
      )

      return clerkEnabled ? (
        <ClerkProvider publishableKey={clerkKey}>{Providers}</ClerkProvider>
      ) : (
        Providers
      )
    }

    return (
      <FlagProvider config={config}>
        <ProvidersWithConditionalClerk />
      </FlagProvider>
    )
  }

export default withAppSetup
