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

export interface AppSetupConfig {
  useFormTimeout?: boolean
  pageName?: AppPages
}

interface AppSetupWrapperProps extends AppSetupConfig {
  assetPaths: unknown
  children: React.ReactNode
}

const config = {
  url: `${process.env.UNLEASH_URL}frontend`,
  clientKey: process.env.UNLEASH_TOKEN,
  refreshInterval: 0,
  appName: "webapp",
}

export const AppSetupWrapper = ({
  assetPaths,
  useFormTimeout,
  pageName,
  children,
}: AppSetupWrapperProps) => {
  if (process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "test") {
    void axe(React, ReactDOM, 1000)
  }

  useGTMInitializer(process.env.GOOGLE_TAG_MANAGER_KEY)

  return (
    <FlagProvider config={config}>
      <ErrorBoundary boundaryScope={BoundaryScope.page}>
        <ListingDetailsProvider>
          <ConfigProvider assetPaths={assetPaths}>
            <AuthSessionProvider>
              <UserProvider>
                <IdleTimeout
                  onTimeout={() => console.log("Logout")}
                  useFormTimeout={useFormTimeout}
                  pageName={pageName}
                />
                {children}
              </UserProvider>
            </AuthSessionProvider>
          </ConfigProvider>
        </ListingDetailsProvider>
      </ErrorBoundary>
    </FlagProvider>
  )
}

// Keep this HOC for legacy compatibility, eventually we want to exclusively use AppSetupWrapper
const withAppSetup =
  <P extends ObjectWithAssets>(Component: React.ComponentType<P>, configuration: AppSetupConfig) =>
  (props: P) => {
    return (
      <AppSetupWrapper
        assetPaths={props.assetPaths}
        useFormTimeout={configuration?.useFormTimeout}
        pageName={configuration?.pageName}
      >
        <Component {...props} />
      </AppSetupWrapper>
    )
  }

export default withAppSetup
