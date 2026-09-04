import React from "react"
import { parseUrlParams } from "./token"
import { getAddProfilePath, getLocalizedPath, RedirectType } from "../util/routeUtil"
import { getCurrentLanguage } from "../util/languageUtil"
import { useGTMDataLayer } from "../hooks/analytics/useGTMDataLayer"
import { SessionProviderKind, SessionStatus, useSession } from "./session"

interface WithAuthenticationProps {
  redirectType?: RedirectType
}

const getSignInPath = (redirectType?: RedirectType) => {
  const redirectParam = redirectType ? `?redirect=${redirectType}` : ""
  return getLocalizedPath("/sign-in", getCurrentLanguage(), redirectParam)
}

/**
 * Higher-order component that gates a route on having a usable session.
 *
 * It does not know which auth backend is in play: it asks the session facade
 * and handles every state of the union, so a new state cannot be silently
 * ignored here.
 */
export const withAuthentication = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  { redirectType }: WithAuthenticationProps = {}
) => {
  const WithAuthenticationComponent = (props: P) => {
    const { session, provider } = useSession()
    const { pushToDataLayer } = useGTMDataLayer()

    React.useEffect(() => {
      switch (session.status) {
        case SessionStatus.Loading:
          return
        case SessionStatus.SignedOut:
          window.location.assign(getSignInPath(redirectType))
          return
        case SessionStatus.SignedInWithoutProfile:
          window.location.assign(getAddProfilePath())
          return
        case SessionStatus.SignedIn:
          return
      }
    }, [session.status])

    // Devise sent the user back here from the email confirmation link with
    // their credentials in the query string. Report the conversion once, then
    // strip the params so a refresh does not report it again.
    React.useEffect(() => {
      if (provider !== SessionProviderKind.Devise || session.status !== SessionStatus.SignedIn) {
        return
      }
      const params = parseUrlParams(window.location.href)
      if (
        params.get("access-token") &&
        params.get("accountConfirmed") === "true" &&
        params.get("account_confirmation_success") === "true"
      ) {
        pushToDataLayer("account_create_completed", { user_id: session.profile.id })
        window.history.replaceState(
          {},
          document.title,
          window.location.origin + window.location.pathname
        )
      }
    }, [provider, session, pushToDataLayer])

    if (session.status !== SessionStatus.SignedIn) {
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
