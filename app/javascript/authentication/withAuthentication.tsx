import React from "react"
import { isTokenValid, parseUrlParams } from "./token"
import UserContext from "./context/UserContext"
import { getLocalizedPath, RedirectType } from "../util/routeUtil"
import { getCurrentLanguage } from "../util/languageUtil"
import { useGTMDataLayer } from "../hooks/analytics/useGTMDataLayer"

interface WithAuthenticationProps {
  redirectType?: RedirectType
}

/**
 * Higher-order component that handles authentication for protected routes.
 * It will:
 * 1. Check for a valid token on mount
 * 2. Show nothing while profile is loading
 * 3. Redirect to sign-in if no valid token or no profile
 * 4. Render the wrapped component only when authenticated
 *
 * @param WrappedComponent The component to protect
 * @param redirectPath Optional path to redirect back to after sign-in
 */
export const withAuthentication = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  { redirectType }: WithAuthenticationProps = {}
) => {
  const WithAuthenticationComponent = (props: P) => {
    const { profile, loading, initialStateLoaded } = React.useContext(UserContext)
    const { pushToDataLayer } = useGTMDataLayer()

    React.useEffect(() => {
      const params = parseUrlParams(window.location.href)

      if (!isTokenValid() && !loading && initialStateLoaded) {
        const redirectParam = redirectType ? `?redirect=${redirectType}` : ""
        const language = getCurrentLanguage()
        const signInPath = getLocalizedPath("/sign-in", language, redirectParam)
        window.location.assign(signInPath)
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

  // Set display name for easier debugging
  WithAuthenticationComponent.displayName = `WithAuthentication(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`

  return WithAuthenticationComponent
}
