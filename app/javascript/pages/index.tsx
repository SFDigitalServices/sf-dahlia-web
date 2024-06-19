import React from "react"
import axe from "@axe-core/react"
import { useRoutes, BrowserRouter } from "react-router-dom"
import ReactDOM from "react-dom"

import { FlagProvider } from "@unleash/proxy-client-react"

import UserProvider from "../authentication/context/UserProvider"
import ListingDetailsProvider from "../contexts/listingDetails/listingDetailsProvider"
import { ConfigProvider } from "../lib/ConfigContext"
import NavigationProvider from "../navigation/NavigationProvider"
import ErrorBoundary, { BoundaryScope } from "../components/ErrorBoundary"

import HomePage from "./home"
import RentDirectory from "../pages/listings/for-rent"
import BuyDirectory from "../pages/listings/for-sale"
import SignIn from "../pages/sign-in"
import ListingDetail from "../pages/listings/listing-detail"
import HousingCounselors from "../pages/getAssistance/housing-counselors"
import GetAssistance from "../pages/getAssistance/get-assistance"
import DocumentChecklist from "../pages/getAssistance/document-checklist"
import AdditionalResources from "../pages/getAssistance/additional-resources"
import Privacy from "../pages/getAssistance/privacy"
import Disclaimer from "../pages/getAssistance/disclaimer"
import MyAccount from "../pages/account/my-account"
import AccountSettings from "../pages/account/account-settings"
import MyApplications from "../pages/account/my-applications"

interface RouterProps {
  assetPaths: unknown
}

const config = {
  url: process.env.UNLEASH_URL,
  clientKey: process.env.UNLEASH_TOKEN,
  refreshInterval: 15, // How often (in seconds) the client should poll the proxy for updates
  appName: "webapp", // The name of your application. It's only used for identifying your application
}

const RouterChild = (props: RouterProps) => {
  if (process.env.NODE_ENV !== "production") {
    void axe(React, ReactDOM, 1000)
  }

  const routeArr = [
    { path: "/:lang?", element: <HomePage /> },
    { path: "/:lang?/listings/for-rent", element: <RentDirectory /> },
    { path: "/:lang?/listings/for-sale", element: <BuyDirectory /> },
    { path: "/:lang?/listings/:id", element: <ListingDetail /> },
    true ? { path: "/:lang?/sign-in", element: <SignIn /> } : undefined,
    { path: "/:lang?/housing-counselors", element: <HousingCounselors /> },
    { path: "/:lang?/get-assistance", element: <GetAssistance /> },
    { path: "/:lang?/document-checklist", element: <DocumentChecklist /> },
    { path: "/:lang?/additional-resources", element: <AdditionalResources /> },
    { path: "/:lang?/privacy", element: <Privacy /> },
    { path: "/:lang?/disclaimer", element: <Disclaimer /> },
    // { path: "/:lang?/listing_interest", element: <ListingInterestPage /> },
    { path: "/:lang?/my-account", element: <MyAccount /> },
    { path: "/:lang?/account-settings", element: <AccountSettings /> },
    { path: "/:lang?/my-applications", element: <MyApplications /> },
  ].filter(Boolean)

  const routes = useRoutes(routeArr)

  return (
    <FlagProvider config={config}>
      <ErrorBoundary boundaryScope={BoundaryScope.page}>
        <NavigationProvider routes={routeArr}>
          <ListingDetailsProvider>
            <ConfigProvider assetPaths={props.assetPaths}>
              <UserProvider>
                {/* <IdleTimeout
                    onTimeout={() => console.log("Logout")}
                    useFormTimeout={useFormTimeout}
                  /> */}
                {routes}
              </UserProvider>
            </ConfigProvider>
          </ListingDetailsProvider>
        </NavigationProvider>
      </ErrorBoundary>
    </FlagProvider>
  )
}

const Router = (props: RouterProps) => (
  <BrowserRouter>
    <RouterChild {...props} />
  </BrowserRouter>
)

export default Router
