import React from "react"
import { useAuth } from "@clerk/react"
import { isTokenValid, parseUrlParams } from "./token"
import UserContext from "./context/UserContext"
import { getAddProfilePath, getLocalizedPath, RedirectType } from "../util/routeUtil"
import { getCurrentLanguage } from "../util/languageUtil"
import { useGTMDataLayer } from "../hooks/analytics/useGTMDataLayer"
import { useFeatureFlag } from "../hooks/useFeatureFlag"
import { UNLEASH_FLAG } from "../modules/constants"

interface WithAuthenticationProps {
  redirectType?: RedirectType
}

const getSignInPath = (redirectType?: RedirectType) => {
  const redirectParam = redirectType ? `?redirect=${redirectType}` : ""
  return getLocalizedPath("/sign-in", getCurrentLanguage(), redirectParam)
}

/**
 * Higher-order component that handles authentication for protected routes.
 * When the Clerk flag is on, it checks the Clerk session; otherwise it uses
 * the Devise token / UserContext profile.
 */
export const withAuthentication = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  { redirectType }: WithAuthenticationProps = {}
) => {
  const DeviseAuthGate = (props: P) => {
    const { profile, loading, initialStateLoaded } = React.useContext(UserContext)
    const { pushToDataLayer } = useGTMDataLayer()

    React.useEffect(() => {
      const params = parseUrlParams(window.location.href)

      if (!isTokenValid() && !loading && initialStateLoaded) {
        window.location.assign(getSignInPath(redirectType))
      } else if (
        profile &&
        params.get("access-token") &&
        params.get("accountConfirmed") === "true" &&
        params.get("account_confirmation_success") === "true"
      ) {
        pushToDataLayer("account_create_completed", { user_id: profile.id })
        // We want to remove the query params from the URL so that the user can refresh the page without retriggering the analytics event
        const url = window.location.origin + window.location.pathname
        window.history.replaceState({}, document.title, url)
      }
    }, [profile, pushToDataLayer, loading, initialStateLoaded])

    if (loading || !profile) {
      return null
    }

    return <WrappedComponent {...props} />
  }

  const ClerkAuthGate = (props: P) => {
    const { isLoaded, isSignedIn } = useAuth()
    const { profile, initialStateLoaded } = React.useContext(UserContext)
    const loading = !isLoaded || (isSignedIn && !profile && !initialStateLoaded)

    // TODO: simplify and centralize auth redirects
    React.useEffect(() => {
      if (loading) return
      if (!isSignedIn) {
        window.location.assign(getSignInPath(redirectType))
        return
      }
      if (!profile) {
        window.location.assign(getAddProfilePath())
      }
    }, [loading, isSignedIn, profile])

    if (loading || !isSignedIn || !profile) {
      return null
    }

    return <WrappedComponent {...props} />
  }

  const WithAuthenticationComponent = (props: P) => {
    const { unleashFlag: clerkEnabled, flagsReady } = useFeatureFlag(UNLEASH_FLAG.CLERK_AUTH, false)

    if (!flagsReady) {
      return null
    }

    return clerkEnabled ? <ClerkAuthGate {...props} /> : <DeviseAuthGate {...props} />
  }

  // Set display name for easier debugging
  WithAuthenticationComponent.displayName = `WithAuthentication(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`

  return WithAuthenticationComponent
}
