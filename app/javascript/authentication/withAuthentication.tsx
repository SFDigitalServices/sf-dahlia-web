import React from "react"
import { isTokenValid } from "./token"
import UserContext from "./context/UserContext"
import { getLocalizedPath } from "../util/routeUtil"
import { getCurrentLanguage } from "../util/languageUtil"

interface WithAuthenticationProps {
  redirectPath?: string
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
  { redirectPath }: WithAuthenticationProps = {}
) => {
  const WithAuthenticationComponent = (props: P) => {
    const { profile, loading } = React.useContext(UserContext)

    React.useEffect(() => {
      if (!isTokenValid()) {
        const redirectParam = redirectPath ? `?redirect=${redirectPath}` : ""
        const signInPath = getLocalizedPath("/sign-in", getCurrentLanguage(), redirectParam)
        window.location.href = signInPath
      }
    }, [])

    if (loading) {
      return null
    }

    if (!profile) {
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
