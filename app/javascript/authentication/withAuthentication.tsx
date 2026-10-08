import React from "react"
import { useLocation, useNavigate } from "react-router"
import { isTokenValid, parseUrlParams } from "./token"
import UserContext from "./context/UserContext"
import { useAuthSession } from "./session/AuthSessionProvider"
import { useSignUpSession } from "../authentication/session/useSignUpSession"
import {
  AppPages,
  getAddProfilePath,
  getLocalizedPath,
  RedirectType,
  getSignInPath,
  getMyAccountPath,
  getMyAccountContactPath,
  getMyAccountSettingsPath,
  getMyAccountApplicationsPath,
  getAuthFlowPath,
} from "../util/routeUtil"
import { getCurrentLanguage } from "../util/languageUtil"
import { useGTMDataLayer } from "../hooks/analytics/useGTMDataLayer"
import { useFeatureFlag } from "../hooks/useFeatureFlag"
import { UNLEASH_FLAG, AUTH_FLOW } from "../modules/constants"

interface WithAuthenticationProps {
  redirectType?: RedirectType
  pageName?: AppPages
}

const getSignInPathWithParams = (redirectType?: RedirectType) => {
  const redirectParam = redirectType ? `?redirect=${redirectType}` : ""
  return getLocalizedPath("/sign-in", getCurrentLanguage(), redirectParam)
}

// Only handles the new Clerk auth pages
// Does not handle Devise auth pages
const clerkRedirectManager = (
  pageName: AppPages,
  {
    isSignedIn,
    hasProfile,
    hasPassword,
    authFlow,
    verificationCodeEmailAddress,
  }: {
    isSignedIn: boolean
    hasProfile: boolean
    hasPassword: boolean
    authFlow?: AUTH_FLOW
    verificationCodeEmailAddress?: string
  }
): { redirectUrl?: string; returnUrl?: string } => {
  let redirectUrl
  let returnUrl

  switch (pageName) {
    // app/javascript/pages/account/account.tsx
    case AppPages.Account:
      if (!isSignedIn) {
        redirectUrl = getSignInPath()
        returnUrl = getMyAccountPath()
        break
      }
      if (isSignedIn && !hasProfile) {
        redirectUrl = getAddProfilePath()
        break
      }
      break
    //app/javascript/pages/account/contact.tsx
    case AppPages.Contact:
      if (!isSignedIn) {
        redirectUrl = getSignInPath()
        returnUrl = getMyAccountContactPath()
        break
      }
      if (isSignedIn && !hasProfile) {
        redirectUrl = getAddProfilePath()
        break
      }
      break
    // app/javascript/pages/account/settings.tsx
    case AppPages.AccountSettings:
      if (!isSignedIn) {
        redirectUrl = getSignInPath()
        returnUrl = getMyAccountSettingsPath()
        break
      }
      if (isSignedIn && !hasProfile) {
        redirectUrl = getAddProfilePath()
        break
      }
      break
    // app/javascript/pages/account/applications.tsx
    case AppPages.Applications:
      if (!isSignedIn) {
        redirectUrl = getSignInPath()
        returnUrl = getMyAccountApplicationsPath()
        break
      }
      if (isSignedIn && !hasProfile) {
        redirectUrl = getAddProfilePath()
        break
      }
      break
    // app/javascript/pages/account/add-password.tsx
    case AppPages.AddPassword:
      if (!isSignedIn) {
        redirectUrl = getSignInPath()
        break
      }
      if (isSignedIn && hasProfile && hasPassword) {
        redirectUrl = getMyAccountPath()
        break
      }
      if (isSignedIn && !hasProfile && hasPassword) {
        redirectUrl = getAddProfilePath()
        break
      }
      break
    // app/javascript/pages/account/add-profile.tsx
    case AppPages.AddProfile:
      if (!isSignedIn) {
        redirectUrl = getSignInPath()
        break
      }
      if (isSignedIn && hasProfile) {
        redirectUrl = getMyAccountPath()
        break
      }
      break
    // app/javascript/pages/account/verification-code.tsx
    case AppPages.EnterVerificationCode:
      if (!authFlow && !verificationCodeEmailAddress) {
        redirectUrl = getSignInPath()
        break
      }
      if (authFlow && !verificationCodeEmailAddress) {
        redirectUrl = getAuthFlowPath(authFlow)
        break
      }
      if (!isSignedIn && !verificationCodeEmailAddress) {
        redirectUrl = getSignInPath()
        break
      }
      if (authFlow !== AUTH_FLOW.UPDATE_EMAIL && isSignedIn && hasProfile) {
        redirectUrl = getMyAccountPath()
        break
      }
      if (authFlow !== AUTH_FLOW.UPDATE_EMAIL && isSignedIn && !hasProfile) {
        redirectUrl = getAddProfilePath()
        break
      }
      break
    default:
  }

  return { redirectUrl, returnUrl }
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

    React.useEffect(() => {
      if (notReady || !pageName) return

      const { redirectUrl, returnUrl } = clerkRedirectManager(pageName, {
        isSignedIn,
        hasProfile: !!profile,
        hasPassword: isAccountInitialized && hasPassword,
        // TODO: centralize definition of the data we pass around with reactRouterState
        authFlow: reactRouterState?.flow,
        verificationCodeEmailAddress: reactRouterState?.verificationCodeEmailAddress,
      })

      if (redirectUrl)
        void navigate(redirectUrl, {
          state: {
            ...(returnUrl && { returnUrl }),
            ...(reactRouterState?.flow && { flow: reactRouterState?.flow }),
          },
        })
    }, [
      notReady,
      isSignedIn,
      profile,
      status,
      isAccountInitialized,
      hasPassword,
      navigate,
      reactRouterState,
    ])

    if (!pageName) {
      throw new Error("wrapped component is missing pageName param for withAuthentication")
    }

    if (notReady) return null

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
