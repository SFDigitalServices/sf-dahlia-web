import React from "react"
import { useLocation, useNavigate } from "react-router"
import { isTokenValid, parseUrlParams } from "./token"
import UserContext from "./context/UserContext"
import { useAuthSession } from "./session/AuthSessionProvider"
import { useSignUpSession } from "../authentication/session/useSignUpSession"
import { AppPages, clerkRedirectManager, getLocalizedPath, RedirectType } from "../util/routeUtil"
import { getCurrentLanguage } from "../util/languageUtil"
import { useGTMDataLayer } from "../hooks/analytics/useGTMDataLayer"
import { useFeatureFlag } from "../hooks/useFeatureFlag"
import { UNLEASH_FLAG } from "../modules/constants"

interface WithAuthenticationProps {
  redirectType?: RedirectType
  pageName?: AppPages
}

const getSignInPathWithParams = (redirectType?: RedirectType) => {
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
  { redirectType, pageName }: WithAuthenticationProps = {}
) => {
  /**
   * Auth flows with Devise:
   *   - Rails routing, full page reloads, e.g. `window.location.assign('/...?foo=bar')
   *   - SignInForm component handles return URL with getSignInRedirectUrl(getRedirectTypeFromURL())
   * Auth flows with Clerk:
   *   - React Router navigate(), SPA-like, e.g. `navigate('/...', { state: { foo: 'bar' }})
   *   - SignInFlow component handles return URL with navigate(returnUrl)
   */
  const DeviseAuthGate = (props: P) => {
    const { profile, loading, initialStateLoaded } = React.useContext(UserContext)
    const { pushToDataLayer } = useGTMDataLayer()

    React.useEffect(() => {
      const params = parseUrlParams(window.location.href)

      if (!isTokenValid() && !loading && initialStateLoaded) {
        window.location.assign(getSignInPathWithParams(redirectType))
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
    const { state: reactRouterState } = useLocation()
    const navigate = useNavigate()
    const { status } = useAuthSession()
    const { isAccountInitialized, hasPassword } = useSignUpSession()
    const { profile, profileMissing } = React.useContext(UserContext)
    const isSignedIn = status.kind === "signedIn"
    const loadingProfile = isSignedIn && !profileMissing && !profile
    const notReady = status.kind === "initializing" || loadingProfile

    const redirectDecision =
      !notReady && pageName
        ? clerkRedirectManager(pageName, {
            isSignedIn,
            hasProfile: !!profile,
            hasPassword: isAccountInitialized && hasPassword,
          })
        : undefined

    // useLayoutEffect prevents UI flickering during a redirect
    React.useLayoutEffect(() => {
      if (!redirectDecision?.redirectUrl) return

      void navigate(redirectDecision.redirectUrl, {
        state: {
          ...(redirectDecision.returnUrl && { returnUrl: redirectDecision.returnUrl }),
          ...(reactRouterState?.flow && { flow: reactRouterState.flow }),
        },
      })
    }, [
      navigate,
      reactRouterState?.flow,
      redirectDecision?.redirectUrl,
      redirectDecision?.returnUrl,
    ])

    if (!pageName) {
      throw new Error("wrapped component is missing pageName param for withAuthentication")
    }

    if (notReady || redirectDecision?.redirectUrl) return null

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
